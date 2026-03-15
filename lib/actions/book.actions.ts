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
            pageNumber,
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
