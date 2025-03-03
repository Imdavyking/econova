import { useEffect, useState } from "react";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaEye,
  FaSpinner,
  FaClock,
  FaPlay,
} from "react-icons/fa";
import {
  charityAbiInterface,
  daoExecute,
  daoProposalState,
  daoQueue,
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

  const {
    id,
    description,
    proposer,
    state,
    voteEnd,
    targets,
    proposalId,
    calldatas,
    votesFor,
    votesAgainst,
    weightVotesFor,
    weightVotesAgainst,
    etaSecondsQueue,
  } = proposal;

  const [isVotingFor, setIsVotingFor] = useState(false);
  const [isVotingAgainst, setIsVotingAgainst] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [decodedData, setDecodedData] = useState([]);
  const [proposalState, setProposalState] = useState(state);
  const [isQueueing, setIsQueueing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [timeUntilExecution, setTimeUntilExecution] = useState(null);

  useEffect(() => {
    if (!etaSecondsQueue || etaSecondsQueue.toString() === "0") return;

    const updateTimeUntilExecution = () => {
      const now = Math.floor(Date.now() / 1000);
      setTimeUntilExecution(Math.max(etaSecondsQueue - now, 0));
    };

    updateTimeUntilExecution();
    const interval = setInterval(updateTimeUntilExecution, 1000);

    return () => clearInterval(interval);
  }, [etaSecondsQueue]);

  const canExecute = timeUntilExecution === 0;

  const decodeCallData = () => {
    if (!Array.isArray(calldatas) || calldatas.length === 0) return;

    const newDecodedData = [];

    calldatas.forEach((calldata) => {
      try {
        charityAbiInterface.fragments.some((fragment) => {
          if (calldata.startsWith(fragment.selector)) {
            newDecodedData.push({
              functionName: fragment.name,
              params: charityAbiInterface.decodeFunctionData(
                fragment,
                calldata
              ),
            });
            return true;
          }
          return false;
        });
      } catch (error) {
        console.error("Decoding error:", error);
      }
    });

    setDecodedData(newDecodedData);
  };

  useEffect(() => {
    decodeCallData();
  }, [calldatas]);

  const calculateTimeLeft = () => {
    const estimatedEndTime =
      Math.floor(Date.now() / 1000) + (voteEnd - currentBlock) * blockTime;
    const now = Math.floor(Date.now() / 1000);
    return estimatedEndTime > now ? estimatedEndTime - now : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  const getProposalState = async () => {
    try {
      const currentState = await daoProposalState({ proposalId });
      setProposalState(currentState);
    } catch (error) {}
  };

  useEffect(() => {
    const updateTimer = () => setTimeLeft(calculateTimeLeft());
    updateTimer();
    getProposalState();

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

  const handleQueue = async () => {
    try {
      setIsQueueing(true);
      const response = await daoQueue({ targets, calldatas, description });
      rethrowFailedResponse(response);
      toast.success(`Proposal ${proposalId} queued successfully!`);
    } catch (error) {
      toast.error(`Error queuing: ${error.message}`);
    } finally {
      setIsQueueing(false);
    }
  };

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      const response = await daoExecute({ targets, calldatas, description });
      rethrowFailedResponse(response);
      toast.success(`Proposal ${proposalId} executed successfully!`);
    } catch (error) {
      toast.error(`Error executing: ${error.message}`);
    } finally {
      setIsExecuting(false);
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
      {
        <p className="text-sm text-gray-400">
          State: {ProposalState[proposalState] || "Unknown"}
        </p>
      }
      {timeLeft > 0 && (
        <p className="text-sm text-green-400">
          Time Left: {formatTime(timeLeft)}
        </p>
      )}
      {proposalState.toString() === "1" && (
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
            )}
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
            )}
            Vote Against
          </button>
        </div>
      )}

      {proposalState?.toString() === "4" && (
        <button
          disabled={isQueueing}
          onClick={handleQueue}
          className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition"
        >
          {isQueueing ? (
            <FaSpinner className="w-4 h-4 animate-spin" />
          ) : (
            <FaClock className="mr-2" />
          )}
          Queue
        </button>
      )}

      {proposalState?.toString() === "5" && (
        <>
          {canExecute ? (
            <button
              disabled={isExecuting}
              onClick={handleExecute}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
            >
              {isExecuting ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <FaPlay className="mr-2" />
              )}
              Execute
            </button>
          ) : timeUntilExecution !== null ? (
            <div className="text-gray-500 text-sm">
              Execution available in:{" "}
              <span className="font-bold">
                {formatTime(timeUntilExecution)}
              </span>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              Loading execution time...
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Proposal Details</h2>
            <p className="text-sm text-gray-300 mb-2 break-words">
              ID: {proposalId}
            </p>
            <p className="text-sm text-gray-300 mb-2 break-words">
              Description: {description}
            </p>
            <p className="text-sm text-gray-300 mb-2 break-words">
              Proposer: {proposer}
            </p>
            <p className="text-sm text-gray-300 mb-2">
              State: {ProposalState[proposalState] || "Unknown"}
            </p>
            <p className="text-sm text-gray-300 mb-2">
              Targets: {targets.join(", ")}
            </p>
            <p className="text-sm text-gray-300">
              Time Left: {formatTime(timeLeft)}
            </p>

            {votesFor && (
              <p className="text-sm text-green-400">Votes For: {votesFor}</p>
            )}
            {votesAgainst && (
              <p className="text-sm text-red-400">
                Votes Against: {votesAgainst}
              </p>
            )}

            {/* Decoded Call Data */}
            {decodedData.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-semibold text-gray-300 mb-2">
                  Decoded Call Data:
                </h3>
                {decodedData.map((item, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-800 rounded-lg mb-2 text-sm"
                  >
                    <p className="text-gray-400">
                      Function:
                      <span className="text-white">{item.functionName}</span>
                    </p>
                    <p className="text-gray-400">
                      Params:
                      <span className="text-white">
                        {JSON.stringify(item.params)}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}

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
