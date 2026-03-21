"use client";
import useVapi from "@/hooks/useVapi";
import { IBook } from "@/types";
import { Mic, MicOff } from "lucide-react";
import Image from "next/image";
import Transcript from "./Transcript";
import { formatDuration } from "@/lib/utils";

interface VapiControlsProps {
  book: IBook;
}

const VapiControls = ({ book }: VapiControlsProps) => {
  const { title, author, coverURL, persona } = book;
  const {
    status,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    maxDurationSeconds,
    limitError,
    voice,
    isActive,
    // hasDurationLimit,
    // isNearLimit,
    //isNearLimit,
    startCall,
    stopCall,
  } = useVapi(book);

  const statusLabelMap: Record<string, string> = {
    idle: "Ready",
    connecting: "Connecting",
    starting: "Starting",
    listening: "Listening",
    thinking: "Thinking",
    speaking: "Speaking",
  };

  const statusDotClassMap: Record<string, string> = {
    idle: "vapi-status-dot-ready",
    connecting: "vapi-status-dot-connecting",
    starting: "vapi-status-dot-connecting",
    listening: "vapi-status-dot-listening",
    thinking: "vapi-status-dot-thinking",
    speaking: "vapi-status-dot-listening",
  };

  const statusLabel = statusLabelMap[status] || "Ready";
  const statusDotClass = statusDotClassMap[status] || "vapi-status-dot-ready";
  const showActivityPulse =
    isActive && (status === "thinking" || status === "speaking");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="vapi-header-card">
        <div className="vapi-cover-wrapper">
          <Image
            src={coverURL}
            alt={`${title} cover`}
            width={120}
            height={180}
            unoptimized
            className="vapi-cover-image h-auto w-[120px]"
          />

          <div className="vapi-mic-wrapper">
            {showActivityPulse && (
              <span className="vapi-pulse-ring" aria-hidden="true" />
            )}
            <button
              disabled={status === "connecting" || status === "starting"}
              type="button"
              onClick={isActive ? stopCall : startCall}
              className={`vapi-mic-btn ${
                isActive ? "vapi-mic-btn-active" : "vapi-mic-btn-inactive"
              }`}
              aria-label={isActive ? "Stop conversation" : "Start conversation"}
            >
              {isActive ? (
                <Mic className="size-7 text-[var(--text-primary)]" />
              ) : (
                <MicOff className="size-7 text-[var(--text-primary)]" />
              )}
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-base text-[var(--text-secondary)]">
              by {author}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="vapi-status-indicator">
              <span className={`vapi-status-dot ${statusDotClass}`} />
              <span className="vapi-status-text">{statusLabel}</span>
            </div>

            <div className="vapi-status-indicator">
              <span className="vapi-status-text">
                Voice: {voice || persona || "Default"}
              </span>
            </div>

            <div className="vapi-status-indicator">
              <span className="vapi-status-text">
                {formatDuration(duration)}/{formatDuration(maxDurationSeconds)}
              </span>
            </div>
          </div>

          {limitError && (
            <p className="text-sm font-medium text-red-700">{limitError}</p>
          )}
        </div>
      </header>
      <div className="vapi-transcript-wrapper">
        <Transcript
          messages={messages}
          currentMessage={currentMessage}
          currentUserMessage={currentUserMessage}
        />
      </div>
    </div>
  );
};

export default VapiControls;
