import mongoose, { mongo } from "mongoose";
import config from "../config.js";

const connectDB = async () => {
  try {
    const mongoUri = config.mongo_uri;
    if (!mongoUri) {
      console.error("Mongo URI is missing in the config");
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`🌐 MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};


export default connectDB;