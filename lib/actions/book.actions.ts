"use server";

import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "../utils";
import { CreateBook, TextSegment } from "@/types";
import BookModel from "@/database/models/book.model";
import BookSegmentModel from "@/database/models/bookSegment.model";

export const checkBookExists = async (title: string) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(title);

    const existingBook = await BookModel.findOne({ slug }).lean();

    if (existingBook) {
      return { exists: true, book: serializeData(existingBook) };
    } else {
      return { exists: false };
    }
  } catch (error) {
    console.error("Error checking if book exists:", error);
    return { exists: false, error: "Failed to check if book exists" };
  }
};

export const createBook = async (data: CreateBook) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(data.title);

    const existingBook = await BookModel.findOne({
      clerkId: data.clerkId,
      slug,
    }).lean();
    if (existingBook) {
      return {
        success: true,
        book: serializeData(existingBook),
        alreadyExists: true,
      };
    }
    // TODO: check subscription limits here (e.g. max books allowed) before creating new book

    const newBook = await BookModel.create({
      ...data,
      slug,
      totalSegments: 0,
    });

    return { success: true, book: serializeData(newBook) };
  } catch (error) {
    console.error("Error creating book:", error);
    return { success: false, error: "Failed to create book" };
  }
};

export const saveBookSegments = async (
  clerkId: string,
  bookId: string,
  segments: TextSegment[],
) => {
  try {
    await connectToDatabase();

    console.log("Saving book segments...");

    // Legacy index cleanup: older schema created a unique (bookId, pageNumber)
    // index that fails when pageNumber is null or repeated across segments.
    try {
      await BookSegmentModel.collection.dropIndex("bookId_1_pageNumber_1");
    } catch {
      // Ignore if index does not exist.
    }

    const bulkOps = segments.map(
      ({ text, segmentIndex, wordCount, pageNumber }) => ({
        updateOne: {
          filter: { clerkId, bookId, segmentIndex: segmentIndex },
          update: {
            clerkId,
            bookId,
            content: text,
            segmentIndex,
            wordCount,
            ...(pageNumber != null ? { pageNumber } : {}),
          },
          upsert: true,
        },
      }),
    );

    await BookSegmentModel.bulkWrite(bulkOps);

    // Update totalSegments in Book document
    await BookModel.findByIdAndUpdate(bookId, {
      totalSegments: segments.length,
    });
    console.log("Book segments saved successfully");
    return { success: true, totalSegments: segments.length };
  } catch (error) {
    console.error("Error saving book segments:", error);

    await BookSegmentModel.deleteMany({ clerkId, bookId });
    await BookModel.findByIdAndDelete(bookId);
    console.log("Deleted book segments due to failure to save segments");

    return { success: false, error: "Failed to save book segments" };
  }
};

export const getAllBooks = async (clerkId: string) => {
  try {
    await connectToDatabase();

    const books = await BookModel.find({ clerkId })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, books: serializeData(books) };
  } catch (error) {
    console.error("Error getting books:", error);
    return { success: false, error: "Failed to get books" };
  }
};

export const getBookBySlug = async (clerkId: string, slug: string) => {
  try {
    await connectToDatabase();

    const book = await BookModel.findOne({ clerkId, slug })
      .select("title author coverURL persona")
      .lean();

    if (!book) {
      return { success: false, data: null };
    }

    return { success: true, data: serializeData(book) };
  } catch (error) {
    console.error("Error getting book by slug:", error);
    return { success: false, data: null };
  }
};

export const searchBookSegments = async (
  bookId: string,
  query: string,
  segmentCount: number = 3,
) => {
  try {
    await connectToDatabase();

    const trimmedQuery = query.trim();

    if (!bookId || !trimmedQuery) {
      return { success: true, segments: [] };
    }

    const segments = await BookSegmentModel.find(
      {
        bookId,
        $text: { $search: trimmedQuery },
      },
      {
        score: { $meta: "textScore" },
        content: 1,
        segmentIndex: 1,
      },
    )
      .sort({ score: { $meta: "textScore" }, segmentIndex: 1 })
      .limit(segmentCount)
      .lean();

    return { success: true, segments: serializeData(segments) };
  } catch (error) {
    console.error("Error searching book segments:", error);
    return { success: false, segments: [], error: "Failed to search segments" };
  }
};
