import { IBookSegment } from "@/types";
import { model, models, Schema } from "mongoose";

const BookSegmentSchema = new Schema<IBookSegment>(
  {
    clerkId: { type: String, required: true },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    content: { type: String, required: true },
    segmentIndex: { type: Number, required: true, index: true },
    pageNumber: { type: Number, index: true },
    wordCount: { type: Number, required: true },
  },
  { timestamps: true },
);

BookSegmentSchema.index({ bookId: 1, segmentIndex: 1 }, { unique: true });
BookSegmentSchema.index({ bookId: 1, pageNumber: 1 }, { unique: true });
BookSegmentSchema.index({ bookId: 1, content: "text" });

const BookSegmentModel =
  models.BookSegment || model<IBookSegment>("BookSegment", BookSegmentSchema);

export default BookSegmentModel;
