"use client";

import { Messages } from "@/types";
import { Mic } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

interface TranscriptProps {
  messages: Messages[];
  currentMessage: string;
  currentUserMessage: string;
}

const Transcript = ({
  messages,
  currentMessage,
  currentUserMessage,
}: TranscriptProps) => {
  const transcriptRef = useRef<HTMLDivElement>(null);

  const hasHistory = messages.length > 0;
  const hasStreamingUser = currentUserMessage.trim().length > 0;
  const hasStreamingAssistant = currentMessage.trim().length > 0;
  const isEmpty = !hasHistory && !hasStreamingUser && !hasStreamingAssistant;

  const renderedMessages = useMemo(() => {
    return messages.filter((message) => message.content.trim().length > 0);
  }, [messages]);

  useEffect(() => {
    if (!transcriptRef.current) {
      return;
    }

    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [renderedMessages, currentMessage, currentUserMessage]);

  if (isEmpty) {
    return (
      <section className="transcript-container min-h-[400px]">
        <div className="transcript-empty">
          <Mic className="mb-3 size-12 text-[var(--text-muted)]" />
          <p className="transcript-empty-text">No conversation yet</p>
          <p className="transcript-empty-hint">
            Click the mic button above to start talking
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="transcript-container min-h-[400px]">
      <div
        ref={transcriptRef}
        className="transcript-messages"
        aria-live="polite"
      >
        {renderedMessages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={`${message.role}-${index}-${message.content}`}
              className={`transcript-message ${
                isUser
                  ? "transcript-message-user"
                  : "transcript-message-assistant"
              }`}
            >
              <div
                className={`transcript-bubble ${
                  isUser
                    ? "transcript-bubble-user"
                    : "transcript-bubble-assistant"
                }`}
              >
                {message.content}
              </div>
            </div>
          );
        })}

        {hasStreamingUser && (
          <div className="transcript-message transcript-message-user">
            <div className="transcript-bubble transcript-bubble-user">
              {currentUserMessage}
              <span className="transcript-cursor" aria-hidden="true" />
            </div>
          </div>
        )}

        {hasStreamingAssistant && (
          <div className="transcript-message transcript-message-assistant">
            <div className="transcript-bubble transcript-bubble-assistant">
              {currentMessage}
              <span className="transcript-cursor" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Transcript;
