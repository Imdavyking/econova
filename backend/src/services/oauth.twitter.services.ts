import dotenv from "dotenv";
import OAuth from "oauth-1.0a";
import crypto from "crypto";

dotenv.config();
export const oauth = new OAuth({
  consumer: {
    key: process.env.TWITTER_CONSUMER_KEY!, // Replace with your Twitter API Key
    secret: process.env.TWITTER_CONSUMER_SECRET!, // Replace with your Twitter API Secret Key
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});
