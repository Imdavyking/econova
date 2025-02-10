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
              demoCode:
                "// Simple blockchain structure in JavaScript\nclass Block {\n  constructor(index, data, previousHash) {\n    this.index = index;\n    this.data = data;\n    this.previousHash = previousHash;\n  }\n}\nconst genesisBlock = new Block(0, 'Genesis Block', '0');\nconsole.log(genesisBlock);",
            },
            {
              question:
                "How Sonic Blockchain differs from Bitcoin, Ethereum, and Solana.",
              answer:
                "Sonic Blockchain offers higher throughput, lower transaction fees, and a unique consensus mechanism optimized for speed and scalability.",
            },
          ],
        },
        {
          title: "Consensus Mechanism & Speed Optimization",
          subtopics: [
            {
              question: "Overview of consensus in Sonic Blockchain.",
              answer:
                "Sonic Blockchain uses a novel consensus algorithm designed for high efficiency and rapid transaction finality.",
              demoCode:
                "// Example of a simple Proof-of-Stake function\nfunction validateStake(stake, totalSupply) {\n  return stake / totalSupply;\n}\nconsole.log(validateStake(100, 1000)); // 0.1",
            },
            {
              question: "How Sonic achieves high throughput and low fees.",
              answer:
                "By utilizing optimized block processing and efficient resource allocation, Sonic ensures minimal gas fees and high transaction speeds.",
            },
          ],
        },
        {
          title: "Accounts, Wallets, & Transactions",
          subtopics: [
            {
              question: "How to set up a Sonic-compatible wallet?",
              answer:
                "Users can create a Sonic-compatible wallet using supported applications, ensuring they safely store their private keys and backup phrases.",
            },
            {
              question: "Understanding wallet addresses and private keys.",
              answer:
                "A wallet address is a public identifier on the blockchain, while a private key is a secret key that grants access to the funds.",
            },
            {
              question: "How to send and receive tokens on Sonic?",
              answer:
                "Users can send tokens by specifying the recipient’s address and transaction amount while ensuring they have enough funds to cover gas fees.",
            },
          ],
        },
        {
          title: "Smart Contracts & dApps on Sonic",
          subtopics: [
            {
              question: "What are smart contracts?",
              answer:
                "Smart contracts are self-executing contracts with the terms directly written into code, allowing automated transactions and agreements.",
            },
            {
              question: "Basics of deploying contracts on Sonic.",
              answer:
                "Developers can deploy smart contracts using Sonic’s blockchain infrastructure, following the required steps of writing, compiling, and deploying the contract.",
            },
          ],
        },
        {
          title: "Security & Best Practices",
          subtopics: [
            {
              question: "How to avoid scams and phishing attacks?",
              answer:
                "Users should verify URLs, avoid clicking on unknown links, and never share their private keys or seed phrases.",
            },
            {
              question: "How to securely store private keys?",
              answer:
                "Private keys should be stored in hardware wallets, encrypted storage, or secure offline environments to prevent unauthorized access.",
            },
          ],
        },
      ],
    },

    Intermediate: {
      Objective:
        "Gain hands-on experience with developing, deploying, and interacting with smart contracts on Sonic.",
      Topics: [
        {
          title: "Smart Contract Development on Sonic",
          subtopics: [
            {
              question:
                "Introduction to Sonic’s smart contract language (e.g., Rust, Move, or Solidity).",
              answer:
                "Sonic supports multiple programming languages, including Rust and Solidity, enabling developers to create efficient smart contracts.",
            },
            {
              question: "Writing and deploying a simple smart contract.",
              answer:
                "A simple contract can be deployed using Solidity by defining contract logic, compiling it, and deploying through Sonic’s blockchain network.",
              demoCode:
                "// Solidity smart contract example\npragma solidity ^0.8.0;\ncontract HelloSonic {\n    string public message;\n    constructor() {\n        message = 'Hello, Sonic!';\n    }\n    function setMessage(string memory newMessage) public {\n        message = newMessage;\n    }\n}",
            },
          ],
        },
      ],
    },
    Advanced: {
      Objective:
        "Master advanced Sonic blockchain concepts, security, and scaling strategies for enterprise-grade applications.",
      Topics: [
        {
          title: "Advanced Security & Attack Prevention",
          subtopics: [
            {
              question: "Preventing re-entrancy and flash loan attacks.",
              answer:
                "Implementing proper re-entrancy guards and validating external calls can prevent these attacks.",
              demoCode:
                "// Solidity Re-Entrancy Guard\npragma solidity ^0.8.0;\ncontract SecureContract {\n    bool private locked;\n    modifier noReentrant() {\n        require(!locked, 'No re-entrancy');\n        locked = true;\n        _;\n        locked = false;\n    }\n}",
            },
            {
              question: "Best practices for securing dApps and user funds.",
              answer:
                "Regular security audits, multi-signature wallets, and secure coding practices help safeguard dApps.",
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
