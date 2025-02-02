import React from "react";
import { TWITTER_PROFILE_URL } from "../../utils/constants";
export const Tweet = ({ tweet }) => {
  // Handle Check button click
  const handleCheck = (tweetId) => {
    console.log(`Check clicked for tweet ID: ${tweetId}`);
    // Perform actions for 'Check' with tweetId
  };

  // Handle Claim button click
  const handleClaim = (tweetId) => {
    console.log(`Claim clicked for tweet ID: ${tweetId}`);
    // Perform actions for 'Claim' with tweetId
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
      <p className="text-gray-800 mb-4">{tweet.text}</p>
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => handleCheck(tweet.id)}
        >
          Check
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => handleClaim(tweet.id)}
        >
          Claim
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
