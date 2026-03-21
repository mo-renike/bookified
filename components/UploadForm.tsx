"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  uploadFormSchema,
  type UploadFormValues,
} from "@/lib/schemas/uploadForm";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "./LoadingOverlay";
import FileUploadField from "./FileUploadField";
import TextInputField from "./TextInputField";
import VoiceSelector from "./VoiceSelector";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  checkBookExists,
  createBook,
  saveBookSegments,
} from "@/lib/actions/book.actions";
import { useRouter } from "next/navigation";
import { parsePDFFile } from "@/lib/utils";
import { upload } from "@vercel/blob/client";

const UploadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [coverFileName, setCoverFileName] = useState<string>("");
  const { userId } = useAuth();
  const router = useRouter();
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      author: "",
      persona: "",
      pdfFile: undefined,
      coverImage: undefined,
    },
    mode: "onChange",
  });

  const { setValue, resetField } = form;

  const handleFileUpload =
    (
      field: "pdfFile" | "coverImage",
      setFileName: React.Dispatch<React.SetStateAction<string>>,
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setValue(field, file, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setFileName(file.name);
    };

  const removeFile = (
    field: "pdfFile" | "coverImage",
    setFileName: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    resetField(field, { defaultValue: undefined });
    setFileName("");
  };

  const resetUploadForm = () => {
    form.reset();
    setPdfFileName("");
    setCoverFileName("");
  };

  const onSubmit = async (values: UploadFormValues) => {
    setIsSubmitting(true);
    if (!userId) {
      toast.error("You must be logged in to upload a book.");
      setIsSubmitting(false);
      return;
    }

    try {
      const bookExists = await checkBookExists(values.title);

      if (bookExists.exists && bookExists.book) {
        toast.info(
          "A book with this title already exists. Redirecting you to it...",
        );
        resetUploadForm();
        router.push(`/books/${bookExists.book.slug}`);
        return;
      }
      const fileTitle = values.title.replace(/\.[^/.]+$/, "").toLowerCase();
      const pdfFile = values.pdfFile;

      const parsedPDF = await parsePDFFile(pdfFile);

      if (parsedPDF.content.length === 0) {
        toast.error(
          "Failed to parse PDF file. Please try again with a different file.",
        );
        return;
      }

      const uploadedPDFBlob = await upload(fileTitle, pdfFile, {
        access: "public",
        handleUploadUrl: "/api/uploads",
        contentType: "application/pdf",
      });

      let coverURL: string;

      if (values.coverImage) {
        const coverFileTitle = `${fileTitle}-cover.png`;
        const coverImage = values.coverImage;
        const uploadedCoverBlob = await upload(coverFileTitle, coverImage, {
          access: "public",
          handleUploadUrl: "/api/uploads",
          contentType: "image/jpeg",
        });
        coverURL = uploadedCoverBlob.url;
      } else {
        const response = await fetch(parsedPDF.cover);
        const blob = await response.blob();
        const uploadedCoverBlob = await upload(`${fileTitle}-cover.png`, blob, {
          access: "public",
          handleUploadUrl: "/api/uploads",
          contentType: "image/png",
        });
        coverURL = uploadedCoverBlob.url;
      }

      const book = await createBook({
        title: values.title,
        author: values.author,
        persona: values.persona,
        fileURL: uploadedPDFBlob.url,
        fileBlobKey: uploadedPDFBlob.pathname,
        coverURL,
        fileSize: pdfFile.size,
      });

      if (!book.success) {
        const errorMessage = book.error || "Failed to create book";
        toast.error(errorMessage);

        const isSubscriptionError = /subscription|plan|limit|upgrade/i.test(
          errorMessage,
        );

        if (isSubscriptionError) {
          setTimeout(() => {
            router.push("/subscriptions");
          }, 1500);
        }

        return;
      }

      if (!("book" in book) || !book.book) {
        toast.error("Failed to create book");
        return;
      }

      const createdBook = book.book as { _id: string; slug: string };
      const alreadyExists =
        "alreadyExists" in book ? Boolean(book.alreadyExists) : false;

      if (alreadyExists) {
        toast.info(
          "A book with this title already exists. Redirecting you to it...",
        );
        resetUploadForm();
        router.push(`/books/${createdBook.slug}`);
        return;
      }
      const segments = await saveBookSegments(
        createdBook._id,
        parsedPDF.content,
      );

      if (!segments.success) {
        toast.error("Failed to save book segments. Please try again.");
        throw new Error("Failed to save book segments");
      }
      resetUploadForm();
      toast.success("Book uploaded successfully! Redirecting you to it...");

      router.push(`/`);
    } catch (error) {
      console.error("Error uploading book:", error);
      toast.error(
        "An error occurred while uploading your book. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingOverlay
        isVisible={isSubmitting}
        title="Synthesizing your book..."
      />
      <div className="new-book-wrapper">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* PDF Upload Field */}
          <FileUploadField
            id="pdf-upload"
            label="PDF Book Upload"
            hint="PDF file (max 50MB)"
            accept=".pdf"
            fileName={pdfFileName}
            onUpload={handleFileUpload("pdfFile", setPdfFileName)}
            onRemove={() => removeFile("pdfFile", setPdfFileName)}
            isInvalid={!!form.formState.errors.pdfFile}
            error={form.formState.errors.pdfFile}
            disabled={isSubmitting}
          />

          {/* Cover Image Upload Field */}
          <FileUploadField
            id="cover-upload"
            label="Cover Image (Optional)"
            hint="Leave empty to auto-generate from PDF"
            accept="image/*"
            fileName={coverFileName}
            onUpload={handleFileUpload("coverImage", setCoverFileName)}
            onRemove={() => removeFile("coverImage", setCoverFileName)}
            isInvalid={!!form.formState.errors.coverImage}
            error={form.formState.errors.coverImage}
            disabled={isSubmitting}
          />

          {/* Title Input */}
          <TextInputField
            control={form.control}
            name="title"
            label="Title"
            placeholder="ex: Rich Dad Poor Dad"
          />

          {/* Author Input */}
          <TextInputField
            control={form.control}
            name="author"
            label="Author Name"
            placeholder="ex: Robert Kiyosaki"
          />

          {/* Voice Selector */}
          <VoiceSelector control={form.control} name="persona" />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="form-btn disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {isSubmitting ? "Processing..." : "Begin Synthesis"}
          </Button>
        </form>
      </div>
    </>
  );
};

export default UploadForm;
