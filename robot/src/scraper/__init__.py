import os
import datetime
import requests
import json
from dotenv import load_dotenv
from http.cookiejar import CookieJar
import http.cookiejar
import requests
from requests.utils import cookiejar_from_dict
from typing import Union, Dict
load_dotenv()

class Scraper:
    def __init__(self, options=None):
        self.token = os.getenv("TWITTER_BEARER_TOKEN")
        self.useGuestAuth()
        self.options = options

    def get_auth_options(self):
        """
        Returns authentication options like fetch and transform if they exist.
        """
        return {
            "fetch": self.options.get("fetch") if self.options else None,
            "transform": self.options.get("transform") if self.options else None
        }
    
    def login(self, username, password, email=None, twoFactorSecret=None, appKey=None, appSecret=None, accessToken=None, accessSecret=None):
        userAuth = TwitterUserAuth(self.token, self.get_auth_options())
        userAuth.login(username, password, email, twoFactorSecret, appKey, appSecret, accessToken, accessSecret)
        self.auth = userAuth
        self.authTrends = userAuth
       

    def useGuestAuth(self):
        self.auth =  TwitterGuestAuth(self.token, self.get_auth_options())
        self.authTrends =  TwitterGuestAuth(self.token, self.get_auth_options())


class TwitterGuestAuth:
    def __init__(self, bearer_token, options=None):
        self.bearer_token = bearer_token
        self.options = options or {}
        self.cookie_jar = CookieJar()
        self.session = requests.Session()
        self.is_browser_env = False
        self.headers = {
            "Authorization": f"Bearer {self.bearer_token}",
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/json",
            "Referrer-Policy": 'no-referrer',
        }
        self.guest_token = self.update_guest_token()

    def update_guest_token(self):
        """
        Fetches a guest token required for making unauthenticated API requests.
        """
        url = "https://api.twitter.com/1.1/guest/activate.json"
        response = requests.post(url, headers=self.headers, cookies=self.cookie_jar)

        self.update_cookie_jar(response.headers)

        if response.status_code == 200:
            guest_token = response.json().get("guest_token")
            return guest_token
        else:
            raise Exception(f"Failed to get guest token: {response.text}")
        
    def get_cookie_string(self) -> str:
        """Returns the cookies as a formatted string."""
        cookies = [f"{cookie.name}={cookie.value}" for cookie in self.cookie_jar]
        return "; ".join(cookies)
        
    def update_cookie_jar(cookie_jar: http.cookiejar.CookieJar, headers: Union[Dict[str, str], requests.structures.CaseInsensitiveDict]):
        """
        Updates a cookie jar with the Set-Cookie headers from the provided headers dictionary.

        :param cookie_jar: The cookie jar to update.
        :param headers: The response headers containing Set-Cookie values.
        """
        set_cookie_header = headers.get("Set-Cookie")
        
        if set_cookie_header:
            cookies = requests.utils.dict_from_cookiejar(cookie_jar)
            for cookie in set_cookie_header.split(";"):
                cookie_parts = cookie.strip().split("=")
                if len(cookie_parts) == 2:
                    key, value = cookie_parts
                    cookies[key] = value
            
            cookie_jar = cookiejar_from_dict(cookies)
        
        return cookie_jar


    def send_tweet(self, text, reply_to_tweet_id=None, hide_link_preview=False):
        """
        Posts a tweet using Twitter's API.
        :param text: The content of the tweet
        :param reply_to_tweet_id: (Optional) Tweet ID to reply to
        :param hide_link_preview: (Optional) Boolean to hide link previews
        """
        url = "https://twitter.com/i/api/graphql/a1p9RWpkYKBjWv_I3WzS-A/CreateTweet"

        # Fetch CSRF Token from cookies
        csrf_token = self.get_csrf_token()
        if not csrf_token:
            raise Exception("CSRF Token not found")

        self.headers.update({
            "x-csrf-token": csrf_token,
            "x-twitter-auth-type": "OAuth2Client",
            "x-twitter-active-user": "yes",
            "x-twitter-client-language": "en"
        })

        variables = {
            "tweet_text": text,
            "dark_request": False,
            "media": {
                "media_entities": [],
                "possibly_sensitive": False,
            },
            "semantic_annotation_ids": []
        }

        if hide_link_preview:
            variables["card_uri"] = "tombstone://card"

        if reply_to_tweet_id:
            variables["reply"] = {"in_reply_to_tweet_id": reply_to_tweet_id}

        payload = {
            "variables": variables,
            "features": {
                "interactive_text_enabled": True,
                "longform_notetweets_inline_media_enabled": False,
                "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": False,
                "vibe_api_enabled": False,
                "rweb_lists_timeline_redesign_enabled": True,
                "responsive_web_graphql_exclude_directive_enabled": True,
                "verified_phone_label_enabled": False,
                "creator_subscriptions_tweet_preview_api_enabled": True,
                "responsive_web_graphql_timeline_navigation_enabled": True,
                "tweetypie_unmention_optimization_enabled": True,
                "responsive_web_edit_tweet_api_enabled": True,
                "graphql_is_translatable_rweb_tweet_is_translatable_enabled": True,
                "view_counts_everywhere_api_enabled": True,
                "longform_notetweets_consumption_enabled": True,
                "tweet_awards_web_tipping_enabled": False,
                "freedom_of_speech_not_reach_fetch_enabled": True,
                "standardized_nudges_misinfo": True,
                "responsive_web_enhance_cards_enabled": False,
            },
            "fieldToggles": {}
        }

        response = requests.post(url, headers=self.headers, json=payload)

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to send tweet: {response.text}")

    
    def get_cookie_jar_url(self) -> str:
        """Returns the cookie jar URL based on the environment."""
        if self.is_browser_env:
            # In a real browser environment, you'd fetch this dynamically
            return "http://localhost"  # Simulating document.location
        return "https://twitter.com"


    def get_cookies(self):
        """Retrieve all cookies for the base URL."""
        jar_url = self.get_cookie_jar_url()
        return [cookie for cookie in self.cookie_jar if jar_url in cookie.domain]

    def get_csrf_token(self):
        """
        Extracts CSRF token from cookies.
        """
        url = "https://api.twitter.com/1.1/onboarding/task.json"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            cookies = response.cookies
            for cookie in cookies:
                if cookie.name == "ct0":
                    return cookie.value
        return None
    
    def remove_cookie(self, key: str):
        """
        Removes a cookie from the cookie jar.

        :param key: The name of the cookie to remove.
        """
        cookies = list(self.jar)  # Convert to list to allow modification during iteration
        for cookie in cookies:
            if not cookie.domain or not cookie.path:
                continue
            # Remove the cookie from the jar
            self.cookie_jar.clear(domain=cookie.domain, path=cookie.path, name=key)




class TwitterUserAuth(TwitterGuestAuth):
    def __init__(self, bearer_token, options=None):
        super().__init__(bearer_token, options)

    def login(self, username, password, email=None, twoFactorSecret=None, appKey=None, appSecret=None, accessToken=None, accessSecret=None):    
        self.update_guest_token()
        next = self.init_login()

    def install_csrf_token(self, headers):
        """Add CSRF token to headers if available in cookies."""
        cookies = self.get_cookies()
        x_csrf_token = next((c["value"] for c in cookies if c["key"] == "ct0"), None)

        if x_csrf_token:
            headers["x-csrf-token"] = x_csrf_token

    def execute_flow_task(self, data):
        onboarding_task_url = "https://api.twitter.com/1.1/onboarding/task.json"

        if self.guest_token is None:
            raise ValueError("Authentication token is null or undefined.")

        headers = {
            "authorization": f"Bearer {self.bearer_token}",
            "cookie": self.get_cookie_string(),
            "content-type": "application/json",
            "User-Agent": (
                "Mozilla/5.0 (Linux; Android 11; Nokia G20) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/91.0.4472.88 Mobile Safari/537.36"
            ),
            "x-guest-token": self.guest_token,
            "x-twitter-auth-type": "OAuth2Client",
            "x-twitter-active-user": "yes",
            "x-twitter-client-language": "en",
        }

        self.install_csrf_token(headers)

        response = self.session.post(
            onboarding_task_url, headers=headers, json=data
        )

        # Update the cookie jar with response cookies
        self.cookie_jar.update(self.session.cookies)

        if not response.ok:
            return {"status": "error", "err": response.text}

        flow = response.json()

        if "flow_token" not in flow or not isinstance(flow["flow_token"], str):
            return {"status": "error", "err": "flow_token not found or invalid."}

        if "errors" in flow and flow["errors"]:
            return {
                "status": "error",
                "err": f"Authentication error ({flow['errors'][0]['code']}): {flow['errors'][0]['message']}",
            }

        subtask = flow.get("subtasks", [None])[0]

        if subtask and subtask.get("subtask_id") == "DenyLoginSubtask":
            return {"status": "error", "err": "Authentication error: DenyLoginSubtask"}

        return {"status": "success", "subtask": subtask, "flowToken": flow["flow_token"]}

    def init_login(self):
        self.remove_cookie('twitter_ads_id=')
        self.remove_cookie('ads_prefs=')
        self.remove_cookie('_twitter_sess=')
        self.remove_cookie('zipbox_forms_auth_token=')
        self.remove_cookie('lang=')
        self.remove_cookie('bouncer_reset_cookie=')
        self.remove_cookie('twid=')
        self.remove_cookie('twitter_ads_idb=')
        self.remove_cookie('email_uid=')
        self.remove_cookie('external_referer=')
        self.remove_cookie('ct0=')
        self.remove_cookie('aa_u=')

        

        # return await this.executeFlowTask({
        #     flow_name: 'login',
        #     input_flow_data: {
        #         flow_context: {
        #         debug_overrides: {},
        #         start_location: {
        #             location: 'splash_screen',
        #         },
        #         },
        #     },
        # });

