import dotenv from "dotenv";
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import { environment } from "../utils/config";

dotenv.config();
export const oauth = new OAuth({
  consumer: {
    key: environment.TWITTER_CONSUMER_KEY!,
    secret: environment.TWITTER_CONSUMER_SECRET!,
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});
