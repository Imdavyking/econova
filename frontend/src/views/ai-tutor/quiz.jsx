import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { useParams } from "react-router-dom";
import { APP_NAME, SERVER_URL } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import { signCourseLevel } from "../../services/blockchain.merkle.proof.level";
import {
  getUserClaimedNFT,
  getUserNFT,
  updateRootAndClaim,
} from "../../services/blockchain.services";
import { FaSpinner } from "react-icons/fa";
import tutorData from "@/assets/json/ai_tutor.json";
import { callLLMApi } from "../../services/openai.services";
import { Link } from "react-router-dom";

const QuizPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [isClaimingNFT, setIsClaimingNFT] = useState(false);
  const [score, setScore] = useState(0);
  const { levelStr } = useParams();

  const [nftImage, setNftImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState(Array(5));

  const Levels = {
    Beginner: 0,
    Intermediate: 1,
    Advanced: 2,
  };
  useEffect(() => {
    const fetchNFTImage = async () => {
      try {
        setLoading(true);
        const level = Levels[levelStr];
        const topics = tutorData[levelStr]?.Topics || [];

        let [hasClaimed, tokenURI] = await Promise.all([
          getUserClaimedNFT({ level: level }),
          getUserNFT({ level: level }),
        ]);

        if (!hasClaimed) {
          const agentResponse = await callLLMApi({
            task: `Create a ${
              quizQuestions.length
            } questions quiz for ${JSON.stringify(topics)}`,
          });
          const argsArray = agentResponse["tool_calls"].map(
            (call) => call.args
          );
          setQuizQuestions(argsArray);
          return;
        }

        if (tokenURI.startsWith("ipfs://")) {
          tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        }

        const pinataGateWayUrl =
          "https://emerald-odd-bee-965.mypinata.cloud/files/";

        if (tokenURI.startsWith(pinataGateWayUrl)) {
          tokenURI = tokenURI.replace(
            pinataGateWayUrl,
            `${SERVER_URL}/pinata/files/`
          );
        }

        const response = await fetch(tokenURI);

        if (!response.ok) {
          throw Error("failed to fetch token uri");
        }

        const data = await response.json();

        if (data?.attributes) {
          const scoreAttr = data.attributes.find(
            (attr) => attr.trait_type === "Score"
          );
          if (scoreAttr) {
            let percentScore = scoreAttr.value.replace("%", "").trim();
            setScore((parseInt(percentScore) / 100) * quizQuestions.length);
          }
        }

        setNftImage(data?.image);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTImage();
  }, [levelStr]);

  const handleAnswerSelect = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: option });
  };

  const onComplete = async () => {
    try {
      setIsClaimingNFT(true);

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
      const {
        level,
        root,
        timestamp,
        signature,
        tokenURI,
        proof,
        imageHash: ImageUrl,
      } = await response.json();

      await updateRootAndClaim({
        level,
        root,
        timestamp,
        signature,
        proof,
        tokenURI,
      });

      setNftImage(ImageUrl);

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

  console.log(quizQuestions);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} AI Tutor</span>
        </Link>
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <FaSpinner className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="max-w-xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg mt-10">
          {!quizFinished && !nftImage ? (
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
              {!nftImage ? (
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
              ) : (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">
                    Your NFT Certificate
                  </h3>
                  <img
                    src={nftImage}
                    alt="NFT Certificate"
                    className="mt-2 max-w-full rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
