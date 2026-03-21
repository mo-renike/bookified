"use server";

import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "../utils";
import { CreateBook, TextSegment } from "@/types";
import BookModel from "@/database/models/book.model";
import BookSegmentModel from "@/database/models/bookSegment.model";
import { auth } from "@clerk/nextjs/server";
import { canCreateBook, getUserPlan } from "@/lib/subscription";

type CreateBookInput = Omit<CreateBook, "clerkId">;

export const checkBookExists = async (title: string) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { exists: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const slug = generateSlug(title);

    const existingBook = await BookModel.findOne({
      clerkId: userId,
      slug,
    }).lean();

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

export const createBook = async (data: CreateBookInput) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const conn = await connectToDatabase();
    const session = await conn.startSession();

    const slug = generateSlug(data.title);

    try {
      const plan = await getUserPlan();
      let result:
        | {
            success: true;
            book: unknown;
            alreadyExists?: boolean;
          }
        | {
            success: false;
            error: string;
          }
        | null = null;

      await session.withTransaction(async () => {
        const existingBook = await BookModel.findOne({
          clerkId: userId,
          slug,
        })
          .session(session)
          .lean();

        if (existingBook) {
          result = {
            success: true,
            book: serializeData(existingBook),
            alreadyExists: true,
          };
          return;
        }

        // Atomic limit check + insert inside the same transaction.
        const { allowed, reason } = await canCreateBook({
          userId,
          plan,
          session,
        });

        if (!allowed) {
          result = {
            success: false,
            error: reason || "You've reached your book limit for this plan",
          };
          return;
        }

        const [newBook] = await BookModel.create(
          [
            {
              ...data,
              clerkId: userId,
              slug,
              totalSegments: 0,
            },
          ],
          { session },
        );

        result = { success: true, book: serializeData(newBook) };
      });

      return result || { success: false, error: "Failed to create book" };
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Error creating book:", error);
    return { success: false, error: "Failed to create book" };
  }
};

export const saveBookSegments = async (
  bookId: string,
  segments: TextSegment[],
) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const ownedBook = await BookModel.findOne({ _id: bookId, clerkId: userId })
      .select("_id")
      .lean();

    if (!ownedBook) {
      return { success: false, error: "Book not found or unauthorized" };
    }

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
          filter: { clerkId: userId, bookId, segmentIndex: segmentIndex },
          update: {
            clerkId: userId,
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
    await BookModel.findOneAndUpdate(
      { _id: bookId, clerkId: userId },
      { totalSegments: segments.length },
    );
    console.log("Book segments saved successfully");
    return { success: true, totalSegments: segments.length };
  } catch (error) {
    console.error("Error saving book segments:", error);

    const { userId } = await auth();

    if (userId) {
      await BookSegmentModel.deleteMany({ clerkId: userId, bookId });
      await BookModel.findOneAndDelete({ _id: bookId, clerkId: userId });
    }
    console.log("Deleted book segments due to failure to save segments");

    return { success: false, error: "Failed to save book segments" };
  }
};

export const getAllBooks = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: true, books: [] };
    }

    await connectToDatabase();

    const books = await BookModel.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, books: serializeData(books) };
  } catch (error) {
    console.error("Error getting books:", error);
    return { success: false, error: "Failed to get books" };
  }
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchBooks = async (query: string) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: true, books: [] };
    }

    await connectToDatabase();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      const books = await BookModel.find({ clerkId: userId })
        .sort({ createdAt: -1 })
        .lean();

      return { success: true, books: serializeData(books) };
    }

    const safeRegex = new RegExp(escapeRegex(trimmedQuery), "i");

    const books = await BookModel.find({
      clerkId: userId,
      $or: [{ title: safeRegex }, { author: safeRegex }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, books: serializeData(books) };
  } catch (error) {
    console.error("Error searching books:", error);
    return { success: false, error: "Failed to search books", books: [] };
  }
};

export const getBookBySlug = async (slug: string) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, data: null, error: "Unauthorized" };
    }

    await connectToDatabase();

    const book = await BookModel.findOne({ clerkId: userId, slug })
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
    const { userId } = await auth();
    if (!userId) {
      return { success: true, segments: [] };
    }

    await connectToDatabase();

    const trimmedQuery = query.trim();

    if (!bookId || !trimmedQuery) {
      return { success: true, segments: [] };
    }

    const segments = await BookSegmentModel.find(
      {
        clerkId: userId,
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

export const verifyBookOwnership = async (bookId: string) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return false;
    }

    await connectToDatabase();

    if (!bookId) {
      return false;
    }

    const book = await BookModel.findOne({ _id: bookId, clerkId: userId })
      .select("_id")
      .lean();

    return Boolean(book);
  } catch (error) {
    console.error("Error verifying book ownership:", error);
    return false;
  }
};
