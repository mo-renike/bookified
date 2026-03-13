import React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import {
  FieldError,
  FieldLabel,
  FieldSet,
  FieldGroup,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { FEMALE_VOICES, MALE_VOICES } from "@/lib/constants";

interface VoiceSelectorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

const VoiceSelector = <T extends FieldValues>({
  control,
  name,
}: VoiceSelectorProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldSet>
          <FieldLabel>Choose Assistant Voice</FieldLabel>
          <FieldGroup>
            <div className="space-y-6">
              {/* Male Voices */}
              <div>
                <h4 className="text-base font-semibold text-[var(--text-primary)] mb-3">
                  Male Voices
                </h4>
                <div className="flex flex-wrap gap-3">
                  {MALE_VOICES.map((voice) => (
                    <Button
                      key={voice.id}
                      type="button"
                      onClick={() => field.onChange(voice.id)}
                      variant={field.value === voice.id ? "default" : "outline"}
                      className={`voice-selector-option flex flex-col items-start h-auto py-3 px-4 transition-all ${
                        field.value === voice.id
                          ? "voice-selector-option-selected"
                          : "voice-selector-option-default"
                      }`}
                      aria-pressed={field.value === voice.id}
                      aria-invalid={fieldState.invalid}
                    >
                      <div className="font-semibold text-[var(--text-primary)]">
                        {voice.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {voice.description}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Female Voices */}
              <div>
                <h4 className="text-base font-semibold text-[var(--text-primary)] mb-3">
                  Female Voices
                </h4>
                <div className="flex flex-wrap gap-3">
                  {FEMALE_VOICES.map((voice) => (
                    <Button
                      key={voice.id}
                      type="button"
                      onClick={() => field.onChange(voice.id)}
                      variant={field.value === voice.id ? "default" : "outline"}
                      className={`voice-selector-option flex flex-col items-start h-auto py-3 px-4 transition-all ${
                        field.value === voice.id
                          ? "voice-selector-option-selected"
                          : "voice-selector-option-default"
                      }`}
                      aria-pressed={field.value === voice.id}
                      aria-invalid={fieldState.invalid}
                    >
                      <div className="font-semibold text-[var(--text-primary)]">
                        {voice.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {voice.description}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </FieldGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </FieldSet>
      )}
    />
  );
};

export default VoiceSelector;
