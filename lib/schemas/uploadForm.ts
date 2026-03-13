import * as z from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
} from "../constants";

export const uploadFormSchema = z.object({
  pdf: z
    .instanceof(File)
    .refine((file) => file?.size <= MAX_FILE_SIZE, "PDF must be max 50MB"),
  coverImage: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= MAX_IMAGE_SIZE;
    }, "Cover image must be max 10MB")
    .refine((file) => {
      if (!file) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Only JPEG and PNG images are accepted for cover"),
  title: z
    .string()
    .min(1, "Title is required")
    .min(2, "Title must be at least 2 characters"),
  author: z
    .string()
    .min(1, "Author name is required")
    .min(2, "Author name must be at least 2 characters"),
  voice: z.string().min(1, "Voice selection is required"),
});

export type UploadFormValues = z.infer<typeof uploadFormSchema>;
