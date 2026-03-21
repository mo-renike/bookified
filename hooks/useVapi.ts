import { IBook, Messages } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import {
  startVoiceSession,
  endVoiceSession,
} from "@/lib/actions/session.actions";
import { ASSISTANT_ID, VOICE_SETTINGS } from "@/lib/constants";
import { getVoice } from "@/lib/utils";

export type CallStatus =
  | "idle"
  | "connecting"
  | "starting"
  | "listening"
  | "thinking"
  | "speaking";

const useLatestRef = <T>(value: T) => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};

let vapi: InstanceType<typeof Vapi>;
const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY || "";

function getVapi() {
  if (!vapi) {
    if (!VAPI_API_KEY) {
      throw new Error("VAPI API key is not set");
    }
    vapi = new Vapi(VAPI_API_KEY);
  }
  return vapi;
}

export const useVapi = (book: IBook) => {
  const { userId } = useAuth();
  // TODO: implement limits based on subscription plan (e.g. max books allowed, max segments allowed, etc.)
  const [status, setstatus] = useState<CallStatus>("idle");
  const [messages, setmessages] = useState<Messages[]>([]);
  const [currentMessage, setcurrentMessage] = useState("");
  const [currentUserMessage, setcurrentUserMessage] = useState("");
  const [duration, setduration] = useState(0);
  const [limitError, setlimitError] = useState<string | null>(null);

  // TODO: Implement session duration tracking and subscription limit checking
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const isStoppingRef = useRef<boolean>(false);
  const lastFinalMessageRef = useRef<string>("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const bookRef = useLatestRef(book);

  const durationRef = useLatestRef(duration);
  const voice = book.persona || "default";

  const isActive = status !== "idle" && status !== "connecting";

  const setupVapiListeners = () => {
    const vapiInstance = getVapi();

    const onVapiMessage = (message: Record<string, unknown>) => {
      console.log("Vapi message event:", message);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = message as Record<string, any>;
      // Extract role and content from message
      const role = String(msg.role || msg.message?.role || "").toLowerCase();
      const content = String(
        msg.content || msg.message?.content || msg.transcript || "",
      );

      // Determine transcript type
      const transcriptType =
        String(msg.transcriptType || msg.transcript_type || "").toLowerCase() ||
        (msg.type === "final" ? "final" : "partial");

      if (!role || !content.trim()) {
        return;
      }

      if (role === "user") {
        if (transcriptType === "partial") {
          // Update streaming user message
          setcurrentUserMessage(content);
        } else if (transcriptType === "final") {
          // Add final user message to history and deduplicate
          if (content !== lastFinalMessageRef.current) {
            lastFinalMessageRef.current = content;
            setmessages((prev) => {
              const isDuplicate = prev.some(
                (msg) => msg.role === "user" && msg.content === content,
              );
              if (isDuplicate) return prev;
              return [...prev, { role: "user", content }];
            });
            // Clear streaming and set status to thinking
            setcurrentUserMessage("");
            setstatus("thinking");
          }
        }
      } else if (role === "assistant") {
        if (transcriptType === "partial") {
          // Update streaming assistant message
          setcurrentMessage(content);
          setstatus("speaking");
        } else if (transcriptType === "final") {
          // Add final assistant message to history and deduplicate
          if (content !== lastFinalMessageRef.current) {
            lastFinalMessageRef.current = content;
            setmessages((prev) => {
              const isDuplicate = prev.some(
                (msg) => msg.role === "assistant" && msg.content === content,
              );
              if (isDuplicate) return prev;
              return [...prev, { role: "assistant", content }];
            });
            // Clear streaming
            setcurrentMessage("");
            setstatus("listening");
          }
        }
      }
    };

    const onCallStart = () => {
      console.log("Call started");
      setstatus("listening");
      lastFinalMessageRef.current = "";
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setstatus("idle");
      setcurrentMessage("");
      setcurrentUserMessage("");
    };

    const onVapiError = (error: Record<string, unknown>) => {
      console.error("Vapi error:", error);
      setlimitError("Connection error. Please try again.");
      setstatus("idle");
    };

    vapiInstance.on("message", onVapiMessage);
    vapiInstance.on("call-start", onCallStart);
    vapiInstance.on("call-end", onCallEnd);
    vapiInstance.on("error", onVapiError);

    return () => {
      vapiInstance.removeListener("message", onVapiMessage);
      vapiInstance.removeListener("call-start", onCallStart);
      vapiInstance.removeListener("call-end", onCallEnd);
      vapiInstance.removeListener("error", onVapiError);
    };
  };

  // Setup listeners on mount
  useEffect(() => {
    return setupVapiListeners();
  }, []);

  // limits
  //   const maxDurationRef = useLatestRef(limits.maxSessionMinutes * 60);
  //   const maxDuratinseconds = 5 * 60; // TODO: replace with real limit from subscription plan
  //   const remainingSeconds = maxDuratinseconds - durationRef.current;
  //   const hasDurationLimit = maxDuratinseconds > 0;
  //   const isNearLimit = hasDurationLimit && remainingSeconds <= 60; // e.g. show warning when only 60 seconds are left

  const startCall = async () => {
    if (!userId) {
      setlimitError("You must be logged in to use this feature.");
      return;
    }

    setlimitError(null);
    setstatus("connecting");

    try {
      const result = await startVoiceSession(book._id);

      if (!result.success) {
        setlimitError(
          result.error || "Session limit reached, please upgrade your plan.",
        );
        setstatus("idle");
        return;
      }

      sessionIdRef.current = (result.sessionId as string) || null;
      const firstMessage = `Hey! good to meet you, I am ${book.persona}. Before we dive in, have you actually read "${book.title}" by ${book.author}" or are we starting fresh?`;

      await getVapi().start(ASSISTANT_ID, {
        firstMessage,
        variableValues: {
          title: book.title,
          author: book.author,
          bookId: book._id,
        },
        voice: {
          provider: "11labs" as const,
          voiceId: getVoice(voice).id,
          model: "eleven_turbo_v2_5" as const,
          stability: VOICE_SETTINGS.stability,
          similarityBoost: VOICE_SETTINGS.similarityBoost,
          style: VOICE_SETTINGS.style,
          useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
        },
      });
    } catch (error) {
      console.error("Error starting call:", error);
      if (sessionIdRef.current) {
        await endVoiceSession(sessionIdRef.current, durationRef.current);
        sessionIdRef.current = null;
      }
      setlimitError("Failed to start conversation.");
      setstatus("idle");
    }
  };

  const stopCall = async () => {
    isStoppingRef.current = true;
    await getVapi().stop();

    // End the session with the final duration
    if (sessionIdRef.current) {
      await endVoiceSession(sessionIdRef.current, duration);
    }
  };

  const resetCall = async () => {
    setstatus("idle");
    setmessages([]);
    setcurrentMessage("");
    setcurrentUserMessage("");
    setduration(0);
    sessionIdRef.current = null;
    isStoppingRef.current = false;
  };

  return {
    status,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    limitError,
    voice,
    isActive,
    // hasDurationLimit,
    // isNearLimit,
    //isNearLimit,
    startCall,
    stopCall,
    resetCall,
  };
};

export default useVapi;
