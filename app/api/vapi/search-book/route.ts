import { searchBookSegments } from "@/lib/actions/book.actions";
import { NextResponse } from "next/server";

type ToolCall = {
  id?: string;
  name?: string;
  parameters?: Record<string, unknown>;
};

type ToolCallsMessage = {
  type?: string;
  toolCallList?: ToolCall[];
  toolWithToolCallList?: Array<{ name?: string; toolCall?: ToolCall }>;
};

type VapiToolCallPayload = {
  message?: ToolCallsMessage;
};

const NO_INFORMATION_MESSAGE = "no information found about this topic";

const isSearchBookCall = (name: string | undefined) => {
  if (!name) return false;

  const normalized = name
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .trim();
  return normalized === "searchbook";
};

const toStringOrEmpty = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const getCallParameters = (
  call: ToolCall,
): { bookId: string; query: string; segmentCount: number } => {
  const parameters = call.parameters ?? {};

  const bookId =
    toStringOrEmpty(parameters.bookId) ||
    toStringOrEmpty(parameters.bookID) ||
    toStringOrEmpty(parameters.book_id);

  const query =
    toStringOrEmpty(parameters.query) ||
    toStringOrEmpty(parameters.searchQuery) ||
    toStringOrEmpty(parameters.prompt) ||
    toStringOrEmpty(parameters.topic);

  const parsedSegmentCount = Number(
    toStringOrEmpty(parameters.segmentCount) ||
      toStringOrEmpty(parameters.count),
  );

  const segmentCount =
    Number.isFinite(parsedSegmentCount) && parsedSegmentCount > 0
      ? Math.floor(parsedSegmentCount)
      : 3;

  return {
    bookId,
    query,
    segmentCount,
  };
};

const formatSegments = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  segments: Array<Record<string, any>>,
) => {
  if (!segments.length) {
    return NO_INFORMATION_MESSAGE;
  }

  const combined = segments
    .map((segment) => {
      const segmentNumber = Number(segment.segmentIndex) + 1;
      const title = Number.isFinite(segmentNumber)
        ? `Segment ${segmentNumber}`
        : "Segment";

      return `${title}:\n${toStringOrEmpty(segment.content).trim()}`.trim();
    })
    .filter(Boolean)
    .join("\n\n");

  return combined || NO_INFORMATION_MESSAGE;
};

const extractToolCalls = (payload: VapiToolCallPayload): ToolCall[] => {
  const message = payload.message;

  if (!message || message.type !== "tool-calls") {
    return [];
  }

  if (Array.isArray(message.toolCallList) && message.toolCallList.length > 0) {
    return message.toolCallList;
  }

  if (Array.isArray(message.toolWithToolCallList)) {
    const calls: ToolCall[] = [];

    for (const entry of message.toolWithToolCallList) {
      if (!entry.toolCall) continue;

      calls.push({
        ...entry.toolCall,
        name: entry.toolCall.name || entry.name,
      });
    }

    return calls;
  }

  return [];
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = (await request.json()) as VapiToolCallPayload;
    const toolCalls = extractToolCalls(payload);

    const matchingCalls = toolCalls.filter((call) =>
      isSearchBookCall(call.name),
    );

    const results = await Promise.all(
      matchingCalls.map(async (call) => {
        const { bookId, query, segmentCount } = getCallParameters(call);

        if (!bookId || !query.trim()) {
          return {
            name: call.name || "search-book",
            toolCallId: call.id,
            result: NO_INFORMATION_MESSAGE,
          };
        }

        const searchResult = await searchBookSegments(
          bookId,
          query,
          segmentCount,
        );

        const result = searchResult.success
          ? formatSegments(searchResult.segments)
          : NO_INFORMATION_MESSAGE;

        return {
          name: call.name || "search-book",
          toolCallId: call.id,
          result,
        };
      }),
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error handling search-book Vapi tool call:", error);
    return NextResponse.json({ results: [] }, { status: 400 });
  }
}
