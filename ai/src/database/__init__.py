from pymongo import MongoClient
from dotenv import load_dotenv
import certifi
import os
import datetime
load_dotenv()
class Database:
    def __init__(self):
        self.client = MongoClient(os.getenv("MONGO_URI"),tlsCAFile=certifi.where())

    def get_tweets_database(self):
        return self.client['ai_bot']['tweet_ids']

   
    def insert_tweet(self,tweet):
        collection = self.get_tweets_database()
        tweet['created_at'] = datetime.datetime.now()
        collection.insert_one(tweet)

    def close(self):
        self.client.close()