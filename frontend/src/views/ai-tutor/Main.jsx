import { useState, useEffect } from "react";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { AIAgent } from "../../agent";

const SonicLearning = () => {
  const [level, setLevel] = useState("beginner");
  const [progress, setProgress] = useState(0);
  const [completedTopics, setCompletedTopics] = useState({
    beginner: [],
    intermediate: [],
    advanced: [],
  });
  const [quizCompleted, setQuizCompleted] = useState({
    beginner: false,
    intermediate: false,
    advanced: false,
  });
  const [aiResponse, setAiResponse] = useState("");
  const [userQuery, setUserQuery] = useState("");

  const topics = {
    beginner: [
      "Blockchain Basics",
      "Consensus Mechanism",
      "Wallets & Transactions",
      "Smart Contracts",
      "Security Best Practices",
    ],
    intermediate: [
      "Sonic Blockchain Architecture",
      "Smart Contract Development",
      "Interacting with dApps",
      "Gas Fees Optimization",
      "Security Considerations",
    ],
    advanced: [
      "Smart Contract Optimization",
      "Cross-Chain Solutions",
      "Validator Operations",
      "Advanced Security",
      "Real-World Use Cases",
    ],
  };

  const quizzes = {
    beginner: {
      question: "What is a blockchain?",
      options: [
        "A type of database",
        "A social media platform",
        "A digital currency",
        "An app",
      ],
      answer: "A type of database",
      explanation:
        "A blockchain is a decentralized digital ledger used to record transactions securely.",
    },
  };

  useEffect(() => {
    updateProgress();
  }, [completedTopics, quizCompleted]);

  const updateProgress = () => {
    const totalTopics = Object.values(topics).flat().length;
    const completed =
      Object.values(completedTopics).flat().length +
      Object.values(quizCompleted).filter(Boolean).length;
    setProgress((completed / (totalTopics + 3)) * 100);
  };

  const handleCheckboxChange = (topic, level) => {
    setCompletedTopics((prev) => {
      const updated = { ...prev };
      if (updated[level].includes(topic)) {
        updated[level] = updated[level].filter((t) => t !== topic);
      } else {
        updated[level].push(topic);
      }
      return updated;
    });
  };

  const handleQuizSubmit = (selectedAnswer) => {
    if (selectedAnswer === quizzes[level].answer) {
      setQuizCompleted((prev) => ({ ...prev, [level]: true }));
      setAiResponse("✅ Correct! You have completed this level.");
    } else {
      setAiResponse(`❌ Incorrect. ${quizzes[level].explanation}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <DarkModeSwitcher />
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
        Sonic Blockchain Learning
      </h1>

      {/* Progress Tracking */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600">
          Progress: {progress.toFixed(1)}%
        </p>
        <div className="w-full bg-gray-200 rounded-lg h-3">
          <div
            className="h-3 bg-blue-500 rounded-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* AI Assistant Response */}
      {aiResponse && (
        <div className="p-4 mb-4 bg-gray-100 rounded-md">
          <p className="text-gray-700">{aiResponse}</p>
        </div>
      )}

      {/* User Query Input */}
      <div className="flex gap-2 mb-4">
        <input
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Ask the AI Assistant..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setAiResponse("AI Response Placeholder")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Ask
        </button>
      </div>

      {/* Learning Sections */}
      <div className="space-y-4">
        {Object.keys(topics).map((key) => (
          <div key={key} className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-semibold text-gray-900">
              {key.charAt(0).toUpperCase() + key.slice(1)} Level
            </h2>
            <ul className="list-none space-y-2 mt-2">
              {topics[key].map((topic, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    onChange={() => handleCheckboxChange(topic, key)}
                  />
                  <span className="text-gray-700">{topic}</span>
                </li>
              ))}
            </ul>

            {/* Quiz */}
            {!quizCompleted[key] && quizzes[key] && (
              <div className="mt-4">
                <p className="font-medium text-gray-900">
                  {quizzes[key].question}
                </p>
                <div className="mt-2 space-y-2">
                  {quizzes[key].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizSubmit(option)}
                      className="w-full text-left p-2 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SonicLearning;
