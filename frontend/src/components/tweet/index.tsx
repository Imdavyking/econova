import React from "react";
import { TWITTER_PROFILE_URL } from "../../utils/constants";
import { SERVER_URL } from "../../utils/constants";
import { FaSpinner } from "react-icons/fa";
import { signTweetId } from "../../services/blockchain.twitter.services";
import { toast } from "react-toastify";
export const Tweet = ({ tweet }) => {
  const [isChecking, setIsChecking] = React.useState(false);
  const [isClaiming, setIsClaiming] = React.useState(false);
  const handleCheck = async (tweetId: string | number) => {
    try {
      setIsChecking(true);
      const signature = await signTweetId(tweetId);
      await fetch(`${SERVER_URL}/api/tweets/points/${tweetId}/${signature}`, {
        credentials: "include",
      });
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
