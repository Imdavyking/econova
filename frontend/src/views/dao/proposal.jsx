import { useEffect, useState } from "react";
import { FaThumbsUp, FaThumbsDown, FaEye, FaSpinner } from "react-icons/fa";
import {
  daoVote,
  rethrowFailedResponse,
} from "../../services/blockchain.services";
import { toast } from "react-toastify";

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

  const [isVotingFor, setIsVotingFor] = useState(false);
  const [isVotingAgainst, setIsVotingAgainst] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { id, description, proposer, state, voteEnd, proposalId } = proposal;

  const calculateTimeLeft = () => {
    const estimatedEndTime =
      Math.floor(Date.now() / 1000) + (voteEnd - currentBlock) * blockTime;
    const now = Math.floor(Date.now() / 1000);
    return estimatedEndTime > now ? estimatedEndTime - now : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const updateTimer = () => setTimeLeft(calculateTimeLeft());
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [currentBlock, voteEnd, blockTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleVote = async (voteWay) => {
    try {
      voteWay === 1 ? setIsVotingFor(true) : setIsVotingAgainst(true);
      const response = await daoVote({ proposalId, voteWay });
      rethrowFailedResponse(response);
      toast.success(
        `Voted ${voteWay === 1 ? "for" : "against"} proposal ${proposalId}`
      );
    } catch (error) {
      toast.error(`Error voting: ${error.message}`);
    } finally {
      voteWay === 1 ? setIsVotingFor(false) : setIsVotingAgainst(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{description}</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-gray-400 hover:text-white"
        >
          <FaEye size={20} />
        </button>
      </div>
      <p className="text-sm text-gray-400">Proposed by: {proposer}</p>
      {timeLeft > 0 && (
        <p className="text-sm text-gray-400">
          State: {ProposalState[state] || "Unknown"}
        </p>
      )}
      {timeLeft > 0 ? (
        <p className="text-sm text-green-400">
          Time Left: {formatTime(timeLeft)}
        </p>
      ) : (
        <p className="text-sm text-red-400">Proposal Expired</p>
      )}
      <div className="mt-4 flex space-x-4">
        <button
          disabled={isVotingFor}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
          onClick={() => handleVote(1)}
        >
          {isVotingFor ? (
            <FaSpinner className="w-4 h-4 animate-spin" />
          ) : (
            <FaThumbsUp className="mr-2" />
          )}{" "}
          Vote For
        </button>
        <button
          disabled={isVotingAgainst}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
          onClick={() => handleVote(0)}
        >
          {isVotingAgainst ? (
            <FaSpinner className="w-4 h-4 animate-spin" />
          ) : (
            <FaThumbsDown className="mr-2" />
          )}{" "}
          Vote Against
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-2">Proposal Details</h2>
            <p className="text-sm text-gray-300 mb-2">ID: {proposalId}</p>
            <p className="text-sm text-gray-300 mb-2">
              Description: {description}
            </p>
            <p className="text-sm text-gray-300 mb-2">Proposer: {proposer}</p>
            <p className="text-sm text-gray-300 mb-2">
              State: {ProposalState[state] || "Unknown"}
            </p>
            <p className="text-sm text-gray-300">
              Time Left: {formatTime(timeLeft)}
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
