import React, { useState } from "react";
import { APP_NAME } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";

import { saveHealthyBMIProofService } from "../../services/blockchain.services";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { AIAgent } from "../../agent";
import { Link } from "react-router-dom";

const AIHealth = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  const checkHealthSummary = async () => {
    try {
      if (!weight || !height) {
        toast.info("Please fill in weight and height");
        return;
      }
      setSuggestion("");
      setIsLoading(true);
      const response = await saveHealthyBMIProofService({
        weightInKg: weight,
        heightInCm: height,
      });
      const agent = new AIAgent();
      const { results } = await agent.solveTask(response);
      const info = results[0];

      if (info) {
        setSuggestion(info);
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} AI Health Advisor</span>
        </Link>
      </h2>

      <div className="bg-white dark:bg-darkmode-600 p-6 rounded-md shadow-md w-full max-w-md mx-auto">
        <div className="mb-4">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="form-control py-3 px-4 block w-full border rounded"
            placeholder="Enter weight in kg"
          />
        </div>
        <div className="mb-4">
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="form-control py-3 px-4 block w-full border rounded"
            placeholder="Enter height in cm"
          />
        </div>
        <button
          onClick={checkHealthSummary}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex justify-center items-center"
        >
          {isLoading ? (
            <FaSpinner className="w-5 h-5 animate-spin" />
          ) : (
            "AI Summary"
          )}
        </button>
        {suggestion && (
          <div className="mt-4 text-center">
            <p className="mt-2">{suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHealth;
