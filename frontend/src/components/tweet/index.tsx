import React from "react";
import { TWITTER_PROFILE_URL } from "../../utils/constants";
import { SERVER_URL } from "../../utils/constants";
import { FaSpinner } from "react-icons/fa";
import { signTweetId } from "../../services/blockchain.twitter.services";
import { toast } from "react-toastify";
import { addPointsFromTwitterService } from "../../services/blockchain.services";
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
      if (!results) {
        toast.error("Please check the tweet first");
        return;
      }
      await addPointsFromTwitterService({
        points: Object.values(results.points)
          .reduce((acc, curr) => acc + curr, 0)
          .toString(),
        userTwitterId: `${results.twitter_id}`,
        tweetId: `${results.tweetId}`,
        signature: `${results.signature}`,
      });
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
