import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { APP_NAME } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { getAllTweets } from "../../services/tweets.services";
import { Tweet } from "../../components/tweet";

const TweetList = ({ tweets }) => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-4">
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} tweet={tweet} />
        ))}
      </div>
    </div>
  );
};

const EarnPoints = () => {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    getAllTweets()
      .then((data) => setTweets(data))
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 ">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} tweets</span>
        </a>
      </h2>

      <TweetList tweets={tweets} />
    </div>
  );
};

export default EarnPoints;
