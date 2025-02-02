import React from "react";
import { TWITTER_PROFILE_URL } from "../../utils/constants";
import { SERVER_URL } from "../../utils/constants";
import { FaSpinner } from "react-icons/fa";
import { signTweetId } from "../../services/blockchain.twitter.services";
import { toast } from "react-toastify";
import {
  addPointsFromTwitterService,
  rethrowFailedResponse,
} from "../../services/blockchain.services";
import { Result } from "ethers/lib/utils";
import {
  deleteFromLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from "../../services/local.storage.db";
interface Results {
  points: {
    likes: number;
    retweets: number;
  };
  signature: string;
  tweetId: string;
  twitter_id: string;
}

export const Tweet = ({ tweet }) => {
  const [isChecking, setIsChecking] = React.useState(false);
  const [isClaiming, setIsClaiming] = React.useState(false);
  const [results, setResults] = React.useState<Results | null>(null);
  const handleCheck = async (tweetId: string | number) => {
    try {
      setIsChecking(true);
      const signature = await signTweetId(tweetId);
      const results = await fetch(
        `${SERVER_URL}/api/tweets/points/${tweetId}/${signature}`,
        {
          credentials: "include",
        }
      );
      const data = await results.json();
      setResults(data);
      saveToLocalStorage(tweetId.toString(), data);
      console.log(`Check clicked for tweet ID: ${tweetId}`);
    } catch (error) {
      console.log(error);
      toast.error("Error checking points");
    } finally {
      setIsChecking(false);
    }
  };

  const handleClaim = async (tweetId: string | number) => {
    try {
      setIsClaiming(true);
      let data: Results | null = results;
      if (!results) {
        data = getFromLocalStorage(tweetId.toString());
      }
      if (!data) {
        toast.error("Please check the tweet first");
        return;
      }

      const response = await addPointsFromTwitterService({
        points: Object.values(data.points)
          .reduce((acc, curr) => acc + curr, 0)
          .toString(),
        userTwitterId: data.twitter_id.toString(),
        tweetId: data.tweetId.toString(),
        signature: data.signature.toString(),
      });

      rethrowFailedResponse(response);

      deleteFromLocalStorage(tweetId.toString());
      console.log(`Claim clicked for tweet ID: ${tweetId}`);
    } catch (error) {
      console.log(error);
      toast.error("Error claiming points");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
      <p className="text-gray-800 mb-4">{tweet.text}</p>
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => handleCheck(tweet.id)}
        >
          {isChecking ? (
            <FaSpinner className="w-5 h-5 animate-spin" />
          ) : (
            "Check"
          )}
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => handleClaim(tweet.id)}
        >
          {isClaiming ? (
            <FaSpinner className="w-5 h-5 animate-spin" />
          ) : (
            "Claim"
          )}
        </button>
        <a
          href={`${TWITTER_PROFILE_URL}/status/${tweet.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-blue-500 hover:underline"
        >
          View Tweet
        </a>
      </div>
    </div>
  );
};
