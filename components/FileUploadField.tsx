import React from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

interface FileUploadFieldProps {
  id: string;
  label: string;
  hint: string;
  accept: string;
  fileName: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isInvalid: boolean;
  error?: { message?: string };
  icon?: React.ReactNode;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  id,
  label,
  hint,
  accept,
  fileName,
  onUpload,
  onRemove,
  isInvalid,
  error,
  icon,
}) => {
  const defaultIcon = accept.includes("image") ? (
    <ImageIcon className="upload-dropzone-icon" />
  ) : (
    <Upload className="upload-dropzone-icon" />
  );

  return (
    <Field orientation="vertical" data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div>
        {!fileName ? (
          <label htmlFor={id} className="upload-dropzone cursor-pointer">
            <input
              id={id}
              type="file"
              accept={accept}
              onChange={onUpload}
              className="hidden"
              aria-invalid={isInvalid}
            />
            {icon || defaultIcon}
            <p className="upload-dropzone-text">Click to upload</p>
            <p className="upload-dropzone-hint">{hint}</p>
          </label>
        ) : (
          <div className="upload-dropzone-uploaded">
            <div className="flex items-center justify-between p-4">
              <span className="upload-dropzone-text">{fileName}</span>
              <button
                type="button"
                onClick={onRemove}
                className="upload-dropzone-remove"
                aria-label={`Remove ${label.toLowerCase()}`}
              >
                <X />
              </button>
            </div>
          </div>
        )}
      </div>
      {isInvalid && <FieldError errors={[error]} />}
    </Field>
  );
};

export default FileUploadField;
