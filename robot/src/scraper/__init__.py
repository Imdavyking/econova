import os
import datetime
import requests
import json
from dotenv import load_dotenv
from http.cookiejar import CookieJar
import http.cookiejar
import requests
from requests.utils import cookiejar_from_dict
from typing import Union, Dict, TypedDict, Optional,Any
import pyotp
import time
load_dotenv()

class TwitterUserAuthSubtask(TypedDict):
    subtask_id: str
class FlowTokenResultSuccess(TypedDict):
    status: str  # Always 'success'
    flowToken: str
    subtask: Optional[TwitterUserAuthSubtask] 

class Scraper:
    def __init__(self, options: Optional[Dict[str, Any]] = None):
        self.options: Dict[str, Any] = options if options is not None else {}
        self.token = 'AAAAAAAAAAAAAAAAAAAAAFQODgEAAAAAVHTp76lzh3rFzcHbmHVvQxYYpTw%3DckAlMINMjmCwxUcaXbAN4XqJVdgMJaHqNOFgPMK0zN1qLqLQCF'
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
        if not username:
            os.getenv("TWITTER_USERNAME")
        if not password:
            os.getenv("TWITTER_PASSWORD")
        if not email:
            os.getenv("TWITTER_EMAIL")
        if not twoFactorSecret:
            os.getenv("TWITTER_2FA_SECRET")
        if not appKey:
            os.getenv("TWITTER_CONSUMER_KEY")
        if not appSecret:
            os.getenv("TWITTER_CONSUMER_SECRET")
        if not accessToken:
            os.getenv("TWITTER_ACCESS_TOKEN")
        if not accessSecret:
            os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
        

        userAuth = TwitterUserAuth(self.token, self.get_auth_options())
        userAuth.login(username, password, email, twoFactorSecret, appKey, appSecret, accessToken, accessSecret)
        self.auth = userAuth
        self.authTrends = userAuth
       

    def useGuestAuth(self):
        self.auth =  TwitterGuestAuth(self.token, self.get_auth_options())
        self.authTrends =  TwitterGuestAuth(self.token, self.get_auth_options())


    def upload_media(self, media_data: bytes, auth, media_type: str) -> str:
        upload_url = 'https://upload.twitter.com/1.1/media/upload.json'

        # Get authentication headers
        cookies =  self.auth.get_cookies(upload_url)
        x_csrf_token = next((cookie['value'] for cookie in cookies if cookie['key'] == 'ct0'), None)
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Cookie':  self.auth.get_cookie_string(upload_url),
            'x-csrf-token': x_csrf_token,
        }

        # Detect if media is a video based on mediaType
        is_video = media_type.startswith('video/')

        if is_video:
            # Handle video upload using chunked media upload
            media_id =  self.upload_video_in_chunks(media_data, media_type, headers, upload_url)
            return media_id
        else:
            # Handle image upload
            response = requests.post(upload_url, headers=headers, files={'media': media_data})

            if response.status_code != 200:
                raise Exception(response.text)

            data = response.json()
            return data['media_id_string']


    def upload_video_in_chunks(self,media_data: bytes, media_type: str, headers: dict, upload_url: str) -> str:
        # Initialize upload
        init_params = {
            'command': 'INIT',
            'media_type': media_type,
            'total_bytes': str(len(media_data)),
        }

        init_response = requests.post(upload_url, headers=headers, params=init_params)

        if init_response.status_code != 200:
            raise Exception(init_response.text)

        init_data = init_response.json()
        media_id = init_data['media_id_string']

        # Append upload in chunks
        segment_size = 5 * 1024 * 1024  # 5 MB per chunk
        segment_index = 0

        for offset in range(0, len(media_data), segment_size):
            chunk = media_data[offset:offset + segment_size]
            append_form = {
                'command': 'APPEND',
                'media_id': media_id,
                'segment_index': str(segment_index),
                'media': chunk,
            }

            append_response = requests.post(upload_url, headers=headers, files=append_form)

            if append_response.status_code != 200:
                raise Exception(append_response.text)

            segment_index += 1

        # Finalize upload
        finalize_params = {
            'command': 'FINALIZE',
            'media_id': media_id,
        }

        finalize_response = requests.post(upload_url, headers=headers, params=finalize_params)

        if finalize_response.status_code != 200:
            raise Exception(finalize_response.text)

        finalize_data = finalize_response.json()

        # Check processing status for videos
        if 'processing_info' in finalize_data:
            self.check_upload_status(media_id, headers, upload_url)

        return media_id


    def check_upload_status(media_id: str, headers: dict, upload_url: str) -> None:
        processing = True
        while processing:
            time.sleep(5)  # Wait 5 seconds

            status_params = {
                'command': 'STATUS',
                'media_id': media_id,
            }

            status_response = requests.get(f'{upload_url}?{status_params}', headers=headers)

            if status_response.status_code != 200:
                raise Exception(status_response.text)

            status_data = status_response.json()
            state = status_data.get('processing_info', {}).get('state')

            if state == 'succeeded':
                processing = False
            elif state == 'failed':
                raise Exception('Video processing failed')


    def create_create_tweet_request(self,text, tweet_id=None, media_data=None, hide_link_preview=False):
        onboarding_task_url = 'https://api.twitter.com/1.1/onboarding/task.json'

        # Get cookies from the cookie jar
        cookies = self.auth.get_cookies(onboarding_task_url)
        x_csrf_token = next((cookie['value'] for cookie in cookies if cookie['key'] == 'ct0'), None)

        headers = {
            'Authorization': f"Bearer {self.token}",
            'Cookie': self.auth.get_cookie_string(onboarding_task_url),
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Nokia G20) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.88 Mobile Safari/537.36',
            'X-Guest-Token': self.auth.guest_token,
            'X-Twitter-Auth-Type': 'OAuth2Client',
            'X-Twitter-Active-User': 'yes',
            'X-Twitter-Client-Language': 'en',
            'X-Csrf-Token': x_csrf_token,
        }

        variables = {
            'tweet_text': text,
            'dark_request': False,
            'media': {
                'media_entities': [],
                'possibly_sensitive': False,
            },
            'semantic_annotation_ids': [],
        }

        if hide_link_preview:
            variables["card_uri"] = "tombstone://card"

        if media_data and len(media_data) > 0:
            media_ids = [self.upload_media(data['data'], self.auth, data['mediaType']) for data in media_data]
            variables['media']['media_entities'] = [{'media_id': media_id, 'tagged_users': []} for media_id in media_ids]

        if tweet_id:
            variables['reply'] = {'in_reply_to_tweet_id': tweet_id}

        payload = {
            'variables': variables,
            'features': {
                'interactive_text_enabled': True,
                'longform_notetweets_inline_media_enabled': False,
                'responsive_web_text_conversations_enabled': False,
                'tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled': False,
                'vibe_api_enabled': False,
                'rweb_lists_timeline_redesign_enabled': True,
                'responsive_web_graphql_exclude_directive_enabled': True,
                'verified_phone_label_enabled': False,
                'creator_subscriptions_tweet_preview_api_enabled': True,
                'responsive_web_graphql_timeline_navigation_enabled': True,
                'responsive_web_graphql_skip_user_profile_image_extensions_enabled': False,
                'tweetypie_unmention_optimization_enabled': True,
                'responsive_web_edit_tweet_api_enabled': True,
                'graphql_is_translatable_rweb_tweet_is_translatable_enabled': True,
                'view_counts_everywhere_api_enabled': True,
                'longform_notetweets_consumption_enabled': True,
                'tweet_awards_web_tipping_enabled': False,
                'freedom_of_speech_not_reach_fetch_enabled': True,
                'standardized_nudges_misinfo': True,
                'longform_notetweets_rich_text_read_enabled': True,
                'responsive_web_enhance_cards_enabled': False,
                'subscriptions_verification_info_enabled': True,
                'subscriptions_verification_info_reason_enabled': True,
                'subscriptions_verification_info_verified_since_enabled': True,
                'super_follow_badge_privacy_enabled': False,
                'super_follow_exclusive_tweet_notifications_enabled': False,
                'super_follow_tweet_api_enabled': False,
                'super_follow_user_api_enabled': False,
                'android_graphql_skip_api_media_color_palette': False,
                'creator_subscriptions_subscription_count_enabled': False,
                'blue_business_profile_image_shape_enabled': False,
                'unified_cards_ad_metadata_container_dynamic_card_content_query_enabled': False,
                'rweb_video_timestamps_enabled': False,
                'c9s_tweet_anatomy_moderator_badge_enabled': False,
                'responsive_web_twitter_article_tweet_consumption_enabled': False,
            },
            'fieldToggles': {},
        }

        response = requests.post(
            'https://twitter.com/i/api/graphql/a1p9RWpkYKBjWv_I3WzS-A/CreateTweet',
            headers=headers,
            data=json.dumps(payload),
        )

        # Update the cookie jar after the response
        self.auth.update_cookie_jar(self.auth.cookie_jar, response.headers)

        if not response.ok:
            raise Exception(response.text)

        return response


    def send_tweet(self, text, reply_to_tweet_id=None,media_data=None, hide_link_preview=False):
        return self.create_create_tweet_request(
            text,
            reply_to_tweet_id,
            media_data,
            hide_link_preview,
            )


class TwitterGuestAuth:
    def __init__(self, bearer_token, options=None):
        self.bearer_token = bearer_token
        self.options = options or {}
        self.cookie_jar = CookieJar()
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
        
    def update_cookie_jar(self,cookie_jar: http.cookiejar.CookieJar, headers: Dict[str, str] = {}) -> http.cookiejar.CookieJar:
        """
        Updates a cookie jar with the Set-Cookie headers from the provided headers dictionary.

        :param cookie_jar: The cookie jar to update.
        :param headers: The response headers containing Set-Cookie values.
        """
        set_cookie_header = headers.get("Set-Cookie")
        
        if set_cookie_header:
            for c in self.cookie_jar:
                print(c)
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
        cookies = list(self.cookie_jar)  # Convert to list to allow modification during iteration
        for cookie in cookies:
            if not cookie.domain or not cookie.path:
                continue
            # Remove the cookie from the jar
            self.cookie_jar.clear(domain=cookie.domain, path=cookie.path, name=key)




class TwitterUserAuth(TwitterGuestAuth):
    def __init__(self, bearer_token, options=None):
        super().__init__(bearer_token, options)

    def handle_js_instrumentation_subtask(self, prev: FlowTokenResultSuccess):
        return self.execute_flow_task({
            "flow_token": prev["flowToken"],
            "subtask_inputs": [
                {
                    "subtask_id": "LoginJsInstrumentationSubtask",
                    "js_instrumentation": {
                        "response": "{}",
                        "link": "next_link",
                    },
                }
            ],
        })
    
    def handle_enter_alternate_identifier_subtask(self, prev: FlowTokenResultSuccess, email: str) -> dict:
        return self.execute_flow_task({
            'flow_token': prev.flowToken,
            'subtask_inputs': [{
                'subtask_id': 'LoginEnterAlternateIdentifierSubtask',
                'enter_text': {
                    'text': email,
                    'link': 'next_link',
                },
            }],
        })

    def handle_enter_user_identifier_sso(self, prev: FlowTokenResultSuccess, username: str) -> dict:
        return self.execute_flow_task({
            'flow_token': prev.flowToken,
            'subtask_inputs': [{
                'subtask_id': 'LoginEnterUserIdentifierSSO',
                'settings_list': {
                    'setting_responses': [{
                        'key': 'user_identifier',
                        'response_data': {
                            'text_data': {'result': username}
                        }
                    }],
                    'link': 'next_link',
                },
            }],
        })

    def handle_enter_password(self, prev: FlowTokenResultSuccess, password: str) -> dict:
        return self.execute_flow_task({
            'flow_token': prev.flowToken,
            'subtask_inputs': [{
                'subtask_id': 'LoginEnterPassword',
                'enter_password': {
                    'password': password,
                    'link': 'next_link',
                },
            }],
        })

    def handle_account_duplication_check(self, prev: FlowTokenResultSuccess) -> dict:
        return self.execute_flow_task({
            'flow_token': prev.flowToken,
            'subtask_inputs': [{
                'subtask_id': 'AccountDuplicationCheck',
                'check_logged_in_account': {
                    'link': 'AccountDuplicationCheck_false',
                },
            }],
        })
    
    def generate_totp(self, secret: str) -> str:
        # Generate TOTP using pyotp library
        totp = pyotp.TOTP(secret)
        return totp.now()
    
    def async_sleep(self, seconds: int) -> None:
        # Simulate async sleep (for delay)
        time.sleep(seconds)

    def handle_two_factor_auth_challenge(self, prev: FlowTokenResultSuccess, secret: str) -> dict:
        totp = self.generate_totp(secret)
        error = None
        for attempts in range(1, 4):
            try:
                return self.execute_flow_task({
                    'flow_token': prev.flowToken,
                    'subtask_inputs': [{
                        'subtask_id': 'LoginTwoFactorAuthChallenge',
                        'enter_text': {
                            'link': 'next_link',
                            'text': totp,
                        },
                    }],
                })
            except Exception as err:
                error = err
                self.async_sleep(2 * attempts)  # Simulating delay between retries
        if error:
            raise error

    def handle_acid(self, prev: FlowTokenResultSuccess, email: str) -> dict:
        return self.execute_flow_task({
            'flow_token': prev.flowToken,
            'subtask_inputs': [{
                'subtask_id': 'LoginAcid',
                'enter_text': {
                    'text': email,
                    'link': 'next_link',
                },
            }],
        })

    def handle_success_subtask(self, prev: FlowTokenResultSuccess) -> dict:
        return self.execute_flow_task({
            'flow_token': prev.flowToken,
            'subtask_inputs': [],
        })


    async def process_subtask(self, next_task, username=None, email=None, password=None, two_factor_secret=None):
        """Processes Twitter authentication subtasks."""
        while "subtask" in next_task and next_task["subtask"]:
            subtask_id = next_task["subtask"]["subtask_id"]

            if subtask_id == "LoginJsInstrumentationSubtask":
                next_task = self.handle_js_instrumentation_subtask(next_task)
            elif subtask_id == "LoginEnterUserIdentifierSSO":
                next_task = self.handle_enter_user_identifier_sso(next_task, username)
            elif subtask_id == "LoginEnterAlternateIdentifierSubtask":
                next_task = self.handle_enter_alternate_identifier_subtask(next_task, email)
            elif subtask_id == "LoginEnterPassword":
                next_task = self.handle_enter_password(next_task, password)
            elif subtask_id == "AccountDuplicationCheck":
                next_task = self.handle_account_duplication_check(next_task)
            elif subtask_id == "LoginTwoFactorAuthChallenge":
                if two_factor_secret:
                    next_task = self.handle_two_factor_auth_challenge(next_task, two_factor_secret)
                else:
                    raise ValueError("Requested two-factor authentication code but no secret provided")
            elif subtask_id == "LoginAcid":
                next_task = self.handle_acid(next_task, email)
            elif subtask_id == "LoginSuccessSubtask":
                next_task = self.handle_success_subtask(next_task)
            else:
                raise ValueError(f"Unknown subtask {subtask_id}")
        
        return next_task


    def login(self, username, password, email=None, twoFactorSecret=None, app_key=None, app_secret=None, access_token=None, access_secret=None):    
        self.update_guest_token()
        next = self.init_login()
        next = self.process_subtask(next, username, email, password, twoFactorSecret)
        if app_key and app_secret and access_token and access_secret:
            # not implemented yet
            # self.login_with_v2(app_key, app_secret, access_token, access_secret)
            pass
        if "err" in next:
            raise next["err"]


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

        response = requests.post(
            onboarding_task_url, headers=headers, json=data
        )

        self.update_cookie_jar(response.cookies, response.headers)

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
        self.execute_flow_task({
            "flow_name": "login",
            "input_flow_data": {
                "flow_context": {
                    "debug_overrides": {},
                    "start_location": {
                        "location": "splash_screen",
                    },
                },
            },
        })

        




