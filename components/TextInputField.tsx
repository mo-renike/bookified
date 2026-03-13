import React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface TextInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
}

const TextInputField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: TextInputFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field orientation="vertical" data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            id={field.name}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default TextInputField;
