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

const UploadForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [coverFileName, setCoverFileName] = useState<string>("");

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      author: "",
      voice: "dave",
    },
    mode: "onChange",
  });

  const { setValue, watch } = form;
  const pdf = watch("pdf");

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("pdf", file);
      setPdfFileName(file.name);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("coverImage", file);
      setCoverFileName(file.name);
    }
  };

  const removePdf = () => {
    setValue("pdf", new File([], ""));
    setPdfFileName("");
  };

  const removeCover = () => {
    setValue("coverImage", undefined);
    setCoverFileName("");
  };

  const onSubmit = async (values: UploadFormValues) => {
    setIsLoading(true);
    try {
      // Here you would send the form data to your backend
      console.log("Form values:", values);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Book uploaded successfully!");
    } catch (error) {
      console.error("Error uploading book:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} title="Synthesizing your book..." />
      <div className="new-book-wrapper">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* PDF Upload Field */}
          <FileUploadField
            id="pdf-upload"
            label="PDF Book Upload"
            hint="PDF file (max 50MB)"
            accept=".pdf"
            fileName={pdfFileName}
            onUpload={handlePdfUpload}
            onRemove={removePdf}
            isInvalid={!!form.formState.errors.pdf}
            error={form.formState.errors.pdf}
          />

          {/* Cover Image Upload Field */}
          <FileUploadField
            id="cover-upload"
            label="Cover Image (Optional)"
            hint="Leave empty to auto-generate from PDF"
            accept="image/*"
            fileName={coverFileName}
            onUpload={handleCoverUpload}
            onRemove={removeCover}
            isInvalid={!!form.formState.errors.coverImage}
            error={form.formState.errors.coverImage}
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
          <VoiceSelector control={form.control} name="voice" />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="form-btn disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {isLoading ? "Processing..." : "Begin Synthesis"}
          </Button>
        </form>
      </div>
    </>
  );
};

export default UploadForm;
