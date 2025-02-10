import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { APP_NAME } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import data from "@/assets/json/ai_tutor.json";

const SonicBlockchainTutor = () => {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(
    parseInt(localStorage.getItem("topicIndex")) || 0
  );

  useEffect(() => {
    localStorage.setItem("topicIndex", currentTopicIndex);
  }, [currentTopicIndex]);

  const topics = data.Beginner.Topics;

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

  return (
    <div className="min-h-screen flex flex-col items-center  p-4">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} AI Tutor</span>
        </a>
      </h2>
      <motion.div
        key={currentTopicIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-100 p-4 rounded-lg shadow"
      >
        <h2 className="text-xl font-semibold mb-2 text-black">
          {topics[currentTopicIndex].title}
        </h2>

        {topics[currentTopicIndex].subtopics.map((subtopic) => (
          <div key={subtopic.question} className="mt-2">
            <h4 className="font-semibold text-gray-800">{subtopic.question}</h4>
            <p className="text-gray-600">{subtopic.answer}</p>
            {subtopic.demoCode && (
              <pre className="mt-2 p-2 bg-gray-900 text-white rounded-md overflow-auto">
                <code>{subtopic.demoCode}</code>
              </pre>
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

      {/* Navigation Buttons */}
    </div>
  );
};

export default SonicBlockchainTutor;
