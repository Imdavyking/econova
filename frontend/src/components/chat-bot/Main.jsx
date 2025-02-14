import React, { useState } from "react";
import { AIAgent } from "../../agent/index";
import { toast } from "react-toastify";
import { FaSpinner, FaQuestionCircle } from "react-icons/fa";

const ChatWithAdminBot = () => {
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const agent = new AIAgent();
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUserInput, setLastUserInput] = useState("");

  const toggleChatbox = () => {
    setIsChatboxOpen((prev) => !prev);
  };

  const toggleHelp = () => {
    setIsHelpOpen((prev) => !prev);
  };

  const handleSend = async () => {
    if (userInput.trim() !== "") {
      const currentMessage = lastUserInput
        ? `${lastUserInput} ${userInput}`
        : userInput;

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userInput, sender: "user" },
      ]);
      setUserInput("");

      try {
        setIsProcessing(true);
        const { results, needsMoreData } = await agent.solveTask(
          currentMessage
        );

        if (needsMoreData) {
          setLastUserInput(currentMessage);
          toast.info("Please provide more details.");
        } else {
          setLastUserInput("");
        }
        respondToUser(results);
      } catch (error) {
        toast.error(`Failed to perform action: ${error.message}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const respondToUser = (response) => {
    setTimeout(() => {
      response.map((res) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: res, sender: "bot" },
        ]);
      });
    }, 500);
  };

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div>
      {/* Chatbot Button */}
      <div className="fixed bottom-24 right-0 mb-4 mr-10">
        <button
          onClick={toggleChatbox}
          className="bg-[#28334e] text-white py-2 px-4 rounded-full hover:bg-[#1f2937] transition duration-300 flex items-center h-12 cursor-pointer"
        >
          Perform action with AI Agent
        </button>
      </div>

      {/* Help Button (Floating) */}
      <div className="fixed bottom-40 right-4 mb-4 mr-10">
        <button
          onClick={toggleHelp}
          className="bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 transition duration-300"
        >
          <FaQuestionCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Help Popover */}
      {isHelpOpen && (
        <div className="fixed bottom-52 right-4 bg-white shadow-lg rounded-lg p-4 w-80 z-50 mb-4 mr-10">
          <h3 className="text-lg font-semibold text-gray-700">Commands</h3>
          <ul className="list-disc ml-5 mt-2 text-gray-600 break-words">
            {Object.keys(agent.toolsInfo).map((key, index) => (
              <li key={index}>
                <strong>{key}:</strong> {agent.toolsInfo[key]}.
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chatbox */}
      {isChatboxOpen && (
        <div className="fixed bottom-24 right-4 w-96 z-50">
          <div className="bg-white shadow-md rounded-lg max-w-lg w-full relative">
            {/* Chatbox Header */}
            <div className="p-4 border-b bg-[#28334e] text-white rounded-t-lg flex justify-between items-center">
              <p className="text-lg font-semibold">AI Agent</p>
              <button
                onClick={toggleChatbox}
                className="text-gray-300 hover:text-gray-400 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 h-80 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    message.sender === "user" ? "text-right" : ""
                  }`}
                >
                  <p
                    className={`${
                      message.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    } rounded-lg py-2 px-4 inline-block`}
                  >
                    {message.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t flex">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleInputKeyPress}
                placeholder="Type a message"
                className="w-full px-3 py-2 border text-black rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#28334e]"
              />
              <button
                onClick={handleSend}
                className="bg-[#28334e] text-white px-4 py-2 rounded-r-md hover:bg-[#1f2937] transition duration-300"
              >
                {isProcessing ? (
                  <FaSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWithAdminBot;
