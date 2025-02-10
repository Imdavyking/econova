import React, { useState } from "react";

const SonicBlockchainTutor = () => {
  const data = {
    Beginner: {
      Objective:
        "Understand the core concepts of blockchain and how Sonic Blockchain differs from traditional blockchains.",
      Topics: [
        {
          title: "Introduction to Blockchain & Sonic Blockchain (S)",
          subtopics: [
            {
              question: "What is blockchain?",
              answer:
                "Blockchain is a decentralized and distributed digital ledger used to record transactions across multiple computers securely.",
              demoCode: `// Simple blockchain structure in JavaScript
class Block {
  constructor(index, data, previousHash) {
    this.index = index;
    this.data = data;
    this.previousHash = previousHash;
  }
}
const genesisBlock = new Block(0, "Genesis Block", "0");
console.log(genesisBlock);`,
            },
            {
              question:
                "How Sonic Blockchain differs from Bitcoin, Ethereum, and Solana.",
              answer:
                "Sonic Blockchain offers higher throughput, lower transaction fees, and a unique consensus mechanism optimized for speed and scalability.",
            },
          ],
        },
      ],
    },
  };

  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
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
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-xl shadow-lg space-y-4">
      <h1 className="text-3xl font-bold text-center text-blue-600">
        Sonic Blockchain Tutor
      </h1>
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-800">Beginner Level</h2>
        <p className="text-gray-600">{data.Beginner.Objective}</p>
        <div className="mt-4 p-3 border rounded">
          <h3 className="text-xl font-medium text-gray-700">
            {topics[currentTopicIndex].title}
          </h3>
          {topics[currentTopicIndex].subtopics.map((subtopic) => (
            <div key={subtopic.question} className="mt-2">
              <h4 className="font-semibold text-gray-800">
                {subtopic.question}
              </h4>
              <p className="text-gray-600">{subtopic.answer}</p>
              {subtopic.demoCode && (
                <pre className="mt-2 p-2 bg-gray-900 text-white rounded-md overflow-auto">
                  <code>{subtopic.demoCode}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            onClick={handlePrev}
            disabled={currentTopicIndex === 0}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            onClick={handleNext}
            disabled={currentTopicIndex === topics.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SonicBlockchainTutor;
