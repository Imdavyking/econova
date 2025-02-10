import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { APP_NAME } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";

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
          title: "Sonic Blockchain Architecture",
          subtopics: [
            {
              question: "How does Sonic’s consensus and execution model work?",
              answer:
                "Sonic uses a high-speed consensus algorithm that ensures rapid transaction finality and efficient execution, minimizing network congestion.",
            },
            {
              question:
                "How does Sonic achieve high efficiency and low gas fees?",
              answer:
                "By optimizing block processing, resource allocation, and state management, Sonic reduces computation costs and enhances scalability.",
            },
          ],
        },
        {
          title: "Smart Contract Development on Sonic",
          subtopics: [
            {
              question:
                "Introduction to Sonic’s smart contract language (Solidity).",
              answer:
                "Sonic supports Solidity for writing smart contracts, allowing developers to create decentralized applications with familiar tools.",
            },
            {
              question: "Writing and deploying a simple smart contract.",
              answer:
                "A simple contract can be deployed by defining contract logic in Solidity, compiling it, and deploying it using Sonic’s blockchain network.",
              demoCode:
                "// Solidity smart contract example\npragma solidity ^0.8.0;\ncontract HelloSonic {\n    string public message;\n    constructor() {\n        message = 'Hello, Sonic!';\n    }\n    function setMessage(string memory newMessage) public {\n        message = newMessage;\n    }\n}",
            },
          ],
        },
        {
          title: "Interacting with Sonic dApps",
          subtopics: [
            {
              question:
                "How can developers use SDKs and APIs to build dApps on Sonic?",
              answer:
                "Sonic provides SDKs and APIs that allow developers to interact with smart contracts, query blockchain data, and execute transactions efficiently.",
            },
            {
              question: "How does Sonic enable seamless interoperability?",
              answer:
                "Sonic supports cross-chain communication protocols, enabling assets and data to flow between different blockchain networks.",
            },
          ],
        },
        {
          title: "Gas Fees & Transaction Optimization",
          subtopics: [
            {
              question: "How are fees structured in Sonic?",
              answer:
                "Sonic employs a dynamic fee model, where transaction costs vary based on network congestion and computational complexity.",
            },
            {
              question:
                "What are the best practices for reducing transaction costs?",
              answer:
                "Developers can optimize contracts by reducing storage usage, batching transactions, and leveraging layer-2 scaling solutions.",
            },
          ],
        },
        {
          title: "Security Considerations in Smart Contracts",
          subtopics: [
            {
              question:
                "What are the common vulnerabilities in Sonic contracts?",
              answer:
                "Re-entrancy attacks, integer overflows, and unchecked external calls are common risks in Sonic contracts.",
            },
            {
              question:
                "What tools can be used for auditing and testing contracts?",
              answer:
                "Developers can use static analysis tools, formal verification, and test suites like Hardhat and Foundry to ensure contract security.",
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
              question:
                "How can developers prevent re-entrancy and flash loan attacks?",
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
        <h2 className="text-xl font-semibold mb-2">
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
