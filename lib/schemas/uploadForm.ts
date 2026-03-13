import * as z from "zod";

export const uploadFormSchema = z.object({
  pdf: z
    .instanceof(File)
    .refine((file) => file?.size <= 50 * 1024 * 1024, "PDF must be max 50MB"),
  coverImage: z.instanceof(File).optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .min(2, "Title must be at least 2 characters"),
  author: z
    .string()
    .min(1, "Author name is required")
    .min(2, "Author name must be at least 2 characters"),
  voice: z.enum(["dave", "daniel", "chris", "rachel", "sarah"]),
});

export type UploadFormValues = z.infer<typeof uploadFormSchema>;
