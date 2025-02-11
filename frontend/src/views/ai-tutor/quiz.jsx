import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { useSearchParams } from "react-router-dom";
import { APP_NAME, SERVER_URL } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import { signCourseLevel } from "../../services/blockchain.merkle.proof.level";
import { claimNFT, updateRoot } from "../../services/blockchain.services";
import { FaSpinner } from "react-icons/fa";

const quizQuestions = [
  {
    question: "What is Sonic Blockchain known for?",
    options: [
      "High Gas Fees",
      "Fast Transactions",
      "Bitcoin Fork",
      "Proof of Work",
    ],
    correctAnswer: "Fast Transactions",
  },
  {
    question: "Which language is used for writing smart contracts on Sonic?",
    options: ["Rust", "Solidity", "Move", "Python"],
    correctAnswer: "Solidity",
  },
  {
    question: "How does Sonic achieve low gas fees?",
    options: [
      "Layer 2 Scaling",
      "Sharding",
      "Proof of Stake",
      "Optimized Consensus",
    ],
    correctAnswer: "Optimized Consensus",
  },
];

const QuizPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [isClaimingNFT, setIsClaimingNFT] = useState(false);
  const [score, setScore] = useState(0);
  const [searchParams, _] = useSearchParams();
  const levelStr = searchParams.get("level") || "Beginner";

  const handleAnswerSelect = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: option });
  };

  const onComplete = async () => {
    try {
      setIsClaimingNFT(true);
      const Levels = {
        Beginner: 0,
        Intermediate: 1,
        Advanced: 2,
      };
      const courseSignature = await signCourseLevel(Levels[levelStr]);
      const response = await fetch(`${SERVER_URL}/api/merkle/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseSignature,
          level: Levels[levelStr],
          scoreInPercentage: (score / quizQuestions.length) * 100,
        }),
      });
      const { level, root, timestamp, signature, tokenURI, proof, imageHash } =
        await response.json();

      await updateRoot({ level, root, timestamp, signature });

      await claimNFT({ level, proof, tokenURI });

      toast.success("NFT certificate claimed successfully!");
    } catch (error) {
      toast.error(`Failed to claim NFT certificate - ${error.message}`);
    } finally {
      setIsClaimingNFT(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score
      let newScore = 0;
      quizQuestions.forEach((q, index) => {
        if (selectedAnswers[index] === q.correctAnswer) {
          newScore++;
        }
      });
      setScore(newScore);
      setQuizFinished(true);
      toast.success("Quiz completed!");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} AI Tutor</span>
        </a>
      </h2>

      <div className="max-w-xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg mt-10">
        {!quizFinished ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            {/* Progress Bar */}
            <progress
              className="w-full h-2 rounded-full bg-gray-700 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-blue-600"
              value={((currentIndex + 1) / quizQuestions.length) * 100}
              max="100"
            ></progress>

            {/* Question */}
            <h3 className="text-lg font-semibold mt-4">
              {quizQuestions[currentIndex].question}
            </h3>

            {/* Options */}
            <div className="mt-4 space-y-2">
              {quizQuestions[currentIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full py-2 px-4 rounded-md text-left ${
                    selectedAnswers[currentIndex] === option
                      ? "bg-blue-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <div className="flex justify-end mt-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 rounded-md"
              >
                {currentIndex === quizQuestions.length - 1
                  ? "Finish Quiz"
                  : "Next"}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // Quiz Finished: Show Results
          <div className="text-center mt-6">
            <h3 className="text-xl font-bold">Quiz Completed!</h3>
            <p className="mt-2">
              Your Score: <span className="font-bold">{score}</span> /{" "}
              {quizQuestions.length}
            </p>
            <button
              onClick={onComplete}
              className="mt-4 px-4 py-2 bg-green-600 rounded-md"
              disabled={isClaimingNFT}
            >
              {isClaimingNFT ? (
                <FaSpinner className="w-5 h-5 animate-spin" />
              ) : (
                "Claim NFT Certificate"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
