import React from "react";
import { TWITTER_PROFILE_URL } from "../../utils/constants";
import { SERVER_URL } from "../../utils/constants";
import { FaSpinner, FaHeart, FaRetweet } from "react-icons/fa";
import { signTweetId } from "../../services/blockchain.twitter.services";
import { toast } from "react-toastify";
import {
  addPointsFromTwitterService,
  checkForClaimService,
  rethrowFailedResponse,
} from "../../services/blockchain.services";
import {
  deleteFromLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from "../../services/local.storage.db";
import { getTwitterAuth } from "../../services/twitter.auth.services";

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

      const token = getTwitterAuth();
      if (!token) {
        throw new Error("Please login to twitter on the home page");
      }
      const response = await fetch(
        `${SERVER_URL}/api/tweets/points/${tweetId}/${signature}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error checking points");
      }
      const data = await response.json();

      const rateLimitError = "Rate limit exceeded. Using cached data.";
      const errors: string[] = [];

      if (data.retweetError) {
        errors.push(
          `RETWEET INFO ERROR: ${rateLimitError} ${data.retweetError}`
        );
      }

      if (data.likeError) {
        errors.push(`LIKE INFO ERROR: ${rateLimitError} ${data.likeError}`);
      }

      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }

      setResults(data);
      saveToLocalStorage(tweetId.toString(), data);
      console.log(`Checked tweet ID: ${tweetId}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error checking points");
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleClaim = async (tweetId: string | number) => {
    try {
      setIsClaiming(true);
      let data: Results = results || getFromLocalStorage(tweetId.toString());

      if (!data) {
        throw new Error("No data found");
      }

      const isClaimed = await checkForClaimService({
        userTwitterId: data.twitter_id,
        tweetId: data.tweetId,
      });

      if (isClaimed) {
        throw new Error("Points already claimed");
      }

      const totalPoints = Object.values(data.points).reduce(
        (acc, curr) => acc + curr,
        0
      );

      if (totalPoints === 0) {
        throw new Error("No points to claim");
      }

      const response = await addPointsFromTwitterService({
        points: totalPoints.toString(),
        userTwitterId: data.twitter_id.toString(),
        tweetId: data.tweetId.toString(),
        signature: data.signature.toString(),
      });

      rethrowFailedResponse(response);
      deleteFromLocalStorage(tweetId.toString());

      toast.success(response);
      console.log(`Claimed points for tweet ID: ${tweetId}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error claiming points");
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
      <p className="text-gray-800 mb-4">{tweet.text}</p>

      {/* Icons for like/retweet */}
      {results && (
        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          {results.points.likes > 0 && (
            <div className="flex items-center space-x-1 text-red-500">
              <FaHeart className="w-4 h-4" />
              <span>{results.points.likes}</span>
            </div>
          )}
          {results.points.retweets > 0 && (
            <div className="flex items-center space-x-1 text-green-500">
              <FaRetweet className="w-4 h-4" />
              <span>{results.points.retweets}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          onClick={() => handleCheck(tweet.id)}
          disabled={isChecking}
        >
          {isChecking ? (
            <FaSpinner className="w-5 h-5 animate-spin" />
          ) : (
            "Check"
          )}
        </button>
        <button
          className={`px-4 py-2 text-white rounded flex items-center ${
            results?.points.likes || results?.points.retweets
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={() => handleClaim(tweet.id)}
          disabled={
            isClaiming || (!results?.points.likes && !results?.points.retweets)
          }
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
