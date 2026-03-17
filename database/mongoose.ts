import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI)
  throw new Error("Please define the MONGODB_URI environment variable");

declare global {
  var mongooseCache: {
    conn: mongoose.Connection | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const mongooseCached =
  global.mongooseCache ||
  (global.mongooseCache = { conn: null, promise: null });

export const connectToDatabase = async () => {
  if (mongooseCached.conn) {
    return mongooseCached.conn;
  }

  if (!mongooseCached.promise) {
    mongooseCached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    const mongooseInstance = await mongooseCached.promise;
    mongooseCached.conn = mongooseInstance.connection;
  } catch (error) {
    mongooseCached.promise = null;
    throw new Error("Failed to connect to MongoDB", { cause: error });
  }
  console.info("Connected to MongoDB");
  return mongooseCached.conn;
};
