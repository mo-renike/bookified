"use server";

import VoiceSessionModel from "@/database/models/voiceSession.model";
import { connectToDatabase } from "@/database/mongoose";
import { EndSessionResult, StartSessionResult } from "@/types";
import { getCurrentBillingPeriodStart } from "../subscription.constants";
import { auth } from "@clerk/nextjs/server";
import { canStartVoiceSession, getUserPlanLimits } from "@/lib/subscription";

export const startVoiceSession = async (
  bookId: string,
): Promise<StartSessionResult> => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check subscription limits before starting session
    const { allowed, reason, maxDurationMinutes } =
      await canStartVoiceSession();
    if (!allowed) {
      return {
        success: false,
        error: reason || "Unable to start voice session",
      };
    }

    await connectToDatabase();

    const session = await VoiceSessionModel.create({
      clerkId: userId,
      bookId,
      startedAt: new Date(),
      billingPeriodStart: getCurrentBillingPeriodStart(),
      durationSeconds: 0,
    });

    return {
      success: true,
      sessionId: session._id.toString(),
      maxDurationMinutes: maxDurationMinutes || 5,
    };
  } catch (error) {
    console.error("Error starting voice session:", error);
    return { success: false, error: "Failed to start voice session." };
  }
};

export const endVoiceSession = async (
  sessionId: string,
  durationSeconds: number,
): Promise<EndSessionResult> => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const session = await VoiceSessionModel.findById(sessionId)
      .select("clerkId")
      .lean();

    if (!session) {
      return { success: false, error: "Voice session not found" };
    }

    if (session.clerkId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const updatedSession = await VoiceSessionModel.findOneAndUpdate(
      { _id: sessionId, clerkId: userId },
      {
        endedAt: new Date(),
        durationSeconds,
      },
      { new: true },
    );

    if (!updatedSession) {
      return { success: false, error: "Voice session not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error ending voice session:", error);
    return { success: false, error: "Failed to end voice session." };
  }
};
