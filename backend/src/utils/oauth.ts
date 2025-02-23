import { environment } from "./config";
import { oauth } from "../services/oauth.twitter.services";
/**
 * Process OAuth headers.
 * @param url
 * @returns
 */
export const processOauth = (url: string) => {
  // Prepare the request with OAuth headers
  const request_data = {
    url,
    method: "GET",
    data: {},
  };

  const headers = oauth.toHeader(
    oauth.authorize(request_data, {
      key: environment.TWITTER_ACCESS_TOKEN!,
      secret: environment.TWITTER_ACCESS_TOKEN_SECRET!,
    })
  );
  return headers;
};
