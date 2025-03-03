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

export default function Proposal({ proposal }) {
  if (!proposal) return null; // Prevent rendering if proposal is undefined

  const { id, description, proposer, state } = proposal;
  const endTime = (Date.now() + 60000) / 1000;
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = Math.floor(Date.now() / 1000); // Convert current time to seconds
    const remainingTime = endTime - now;
    return remainingTime > 0 ? remainingTime : 0;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, []);

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  }

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
