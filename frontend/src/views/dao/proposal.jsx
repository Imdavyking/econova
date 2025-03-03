import { useEffect, useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const ProposalState = {
  0: "Pending",
  1: "Active",
  2: "Canceled",
  3: "Defeated",
  4: "Succeeded",
  5: "Queued",
  6: "Expired",
  7: "Executed",
};

export default function Proposal({ proposal, currentBlock, blockTime = 0.3 }) {
  if (!proposal) return null;

  const { id, description, proposer, state, voteEnd } = proposal;

  const calculateTimeLeft = () => {
    const estimatedEndTime =
      Math.floor(Date.now() / 1000) + (voteEnd - currentBlock) * blockTime;
    const now = Math.floor(Date.now() / 1000);
    return estimatedEndTime > now ? estimatedEndTime - now : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const updateTimer = () => setTimeLeft(calculateTimeLeft());

    updateTimer(); // Update immediately on mount
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [currentBlock, voteEnd, blockTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">{description}</h2>
      <p className="text-sm text-gray-400">Proposed by: {proposer}</p>
      <p className="text-sm text-gray-400">
        State: {ProposalState[state] || "Unknown"}
      </p>
      {timeLeft > 0 ? (
        <p className="text-sm text-green-400">
          Time Left: {formatTime(timeLeft)}
        </p>
      ) : (
        <p className="text-sm text-red-400">Proposal Expired</p>
      )}
      <div className="mt-4 flex space-x-4">
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition">
          <FaThumbsUp className="mr-2" /> Vote For
        </button>
        <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition">
          <FaThumbsDown className="mr-2" /> Vote Against
        </button>
      </div>
    </div>
  );
}
