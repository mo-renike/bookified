"use server";

import VoiceSessionModel from "@/database/models/voiceSession.model";
import { connectToDatabase } from "@/database/mongoose";
import { EndSessionResult, StartSessionResult } from "@/types";
import { getCurrentBillingPeriodStart } from "../subscription.constants";
import { auth } from "@clerk/nextjs/server";

export const startVoiceSession = async (
  bookId: string,
): Promise<StartSessionResult> => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();
    // limits/plan checks would go here (e.g. check if user has reached max session minutes for the month, etc.)

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
      // maxDurationMinutes: limits.maxSessionMinutes * 60, // TODO: replace with real limit from subscription plan
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
