import querystring from "querystring";
import { oauth } from "./oauth.twitter.services";

const TW_REQ_TOKEN_URL = "https://api.twitter.com/oauth/request_token";
const TW_AUTH_URL = "https://api.twitter.com/oauth/authenticate";
const TW_ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token";

export class LoginWithTwitter {
  callbackUrl: string;
  _oauth: OAuth;

  constructor(opts: { callbackUrl: string }) {
    if (!opts.callbackUrl || typeof opts.callbackUrl !== "string") {
      throw new Error("Invalid or missing `callbackUrl` option");
    }
    this.callbackUrl = opts.callbackUrl;

    this._oauth = oauth;
  }

  async login(): Promise<{ tokenSecret: string; url: string }> {
    const requestData = {
      url: TW_REQ_TOKEN_URL,
      method: "POST",
      data: {
        oauth_callback: this.callbackUrl,
      },
    };

    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...this._oauth.toHeader(this._oauth.authorize(requestData)),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(requestData.data as any).toString(),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.text();
      const {
        oauth_token: token,
        oauth_token_secret: tokenSecret,
        oauth_callback_confirmed: callbackConfirmed,
      } = querystring.parse(data) as {
        oauth_token: string;
        oauth_token_secret: string;
        oauth_callback_confirmed: string;
      };

      if (callbackConfirmed !== "true") {
        throw new Error(
          "Missing `oauth_callback_confirmed` parameter in response (is the callback URL approved for this client application?)"
        );
      }

      const url = `${TW_AUTH_URL}?${querystring.stringify({
        oauth_token: token,
      })}`;
      return { tokenSecret, url };
    } catch (err: any) {
      throw new Error(`Login request failed: ${err.message}`);
    }
  }

  async callback(
    params: { oauth_token?: string; oauth_verifier?: string; denied?: string },
    tokenSecret: string
  ): Promise<{
    userName: string;
    userId: string;
    userToken: string;
    userTokenSecret: string;
  }> {
    const { oauth_token: token, oauth_verifier: verifier } = params;

    if (params.denied) {
      throw new Error("User denied login permission");
    }
    if (!token || !verifier || !tokenSecret) {
      throw new Error("Invalid or missing OAuth parameters for login callback");
    }

    const requestData = {
      url: TW_ACCESS_TOKEN_URL,
      method: "POST",
      data: {
        oauth_token: token,
        oauth_token_secret: tokenSecret,
        oauth_verifier: verifier,
      },
    };

    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...this._oauth.toHeader(this._oauth.authorize(requestData)),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(requestData.data as any).toString(),
      });

      if (!response.ok) {
        throw new Error(
          `Callback request failed with status ${response.status}`
        );
      }

      const data = await response.text();
      const {
        oauth_token: userToken,
        oauth_token_secret: userTokenSecret,
        screen_name: userName,
        user_id: userId,
      } = querystring.parse(data) as {
        oauth_token: string;
        oauth_token_secret: string;
        screen_name: string;
        user_id: string;
      };

      return { userName, userId, userToken, userTokenSecret };
    } catch (err: any) {
      throw new Error(`Callback request failed: ${err.message}`);
    }
  }
}
