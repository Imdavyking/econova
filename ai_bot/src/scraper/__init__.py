import os
import datetime
import requests
import json
from dotenv import load_dotenv
from http.cookiejar import CookieJar

load_dotenv()


class Scraper:
    # constructor
    def __init__(self, url):
        self.token = os.getenv("BEARER_TOKEN")
        self.useGuestAuth()

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
        self.headers = {
            "Authorization": f"Bearer {self.bearer_token}",
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/json"
        }
        self.guest_token = self.get_guest_token()

    def get_guest_token(self):
        """
        Fetches a guest token required for making unauthenticated API requests.
        """
        url = "https://api.twitter.com/1.1/guest/activate.json"
        response = requests.post(url, headers=self.headers)

        if response.status_code == 200:
            guest_token = response.json().get("guest_token")
            self.headers["x-guest-token"] = guest_token
            return guest_token
        else:
            raise Exception(f"Failed to get guest token: {response.text}")


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





class TwitterUserAuth(TwitterGuestAuth):
    def __init__(self, bearer_token, options=None):
        super().__init__(bearer_token, options)