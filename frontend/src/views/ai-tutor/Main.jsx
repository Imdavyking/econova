import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { APP_NAME } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import data from "@/assets/json/ai_tutor.json";
import { toast } from "react-toastify";

const levels = ["Beginner", "Intermediate", "Advanced"];

const SonicBlockchainTutor = () => {
  const [level, setLevel] = useState(
    localStorage.getItem("level") || "Beginner"
  );
  const [currentTopicIndex, setCurrentTopicIndex] = useState(
    parseInt(localStorage.getItem("topicIndex")) || 0
  );

  useEffect(() => {
    localStorage.setItem("level", level);
    localStorage.setItem("topicIndex", currentTopicIndex);
  }, [level, currentTopicIndex]);

  const topics = data[level]?.Topics || [];

  const handleNext = () => {
    if (currentTopicIndex < topics.length - 1) {
      setCurrentTopicIndex(currentTopicIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(currentTopicIndex - 1);
    }
  };

  const handleLevelChange = (e) => {
    setLevel(e.target.value);
    setCurrentTopicIndex(0); // Reset topic index when changing levels
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

      {/* Level Selector */}
      <div className="mb-4">
        <label className="text-white font-semibold mr-2">Select Level:</label>
        <select
          value={level}
          onChange={handleLevelChange}
          className="p-2 bg-gray-800 text-white rounded"
        >
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      <progress
        className="w-full h-2 rounded-full bg-gray-200 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-blue-600"
        value={((currentTopicIndex + 1) / topics.length) * 100}
        max="100"
      ></progress>

      <motion.div
        key={currentTopicIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-100 p-4 rounded-lg shadow"
      >
        <h2 className="text-xl font-semibold mb-2 text-black">
          {topics[currentTopicIndex]?.title || "No Topics Available"}
        </h2>

        {topics[currentTopicIndex]?.subtopics?.map((subtopic) => (
          <div key={subtopic.question} className="mt-2">
            <h4 className="font-semibold text-gray-800">{subtopic.question}</h4>
            <p className="text-gray-600">{subtopic.answer}</p>

            {subtopic.demoCode && (
              <div className="relative mt-2 p-2 bg-gray-900 text-white rounded-md overflow-auto">
                <button
                  className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-sm px-2 py-1 rounded"
                  onClick={async () => {
                    await navigator.clipboard.writeText(subtopic.demoCode);
                    toast.info("Code copied to clipboard");
                  }}
                >
                  Copy
                </button>
                <pre className="p-2">
                  <code>{subtopic.demoCode}</code>
                </pre>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            disabled={currentTopicIndex === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
          >
            Previous
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            disabled={currentTopicIndex === topics.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Next
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SonicBlockchainTutor;
