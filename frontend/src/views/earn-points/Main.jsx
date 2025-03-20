import React, { useEffect, useState } from "react";
import { APP_NAME } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { getAllTweets } from "../../services/tweets.services";
import { Tweet } from "../../components/tweet";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const TweetList = ({ tweets }) => {
  if (!tweets.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-white">No tweets found</span>
      </div>
    );
  }
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTweets()
      .then((data) => setTweets(data))
      .catch((error) => toast.error(error?.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 ">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} tweets</span>
        </Link>
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-white text-4xl" />
        </div>
      ) : (
        <TweetList tweets={tweets} />
      )}
    </div>
  );
};

export default EarnPoints;
