import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TweetSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    edit_history_tweet_ids: {
      type: [String],
      required: false,
    },
    id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const TweetSchemaModel = mongoose.model("tweet_ids", TweetSchema);
