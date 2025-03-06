import { FaTimes } from "react-icons/fa";
import React from "react";

const AiPanel = ({ isPanelOpen, setIsPanelOpen, aiInsights }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-gray-900 text-white shadow-lg transform ${
        isPanelOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <button onClick={() => setIsPanelOpen(false)}>
          <FaTimes size={20} className="text-gray-400 hover:text-gray-200" />
        </button>
      </div>

      {/* Panel Content */}
      <div className="p-4 space-y-4">
        {aiInsights ? (
          <>
            <div>
              <h3 className="font-semibold text-sm">Summary:</h3>
              <p className="text-gray-300">{aiInsights.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm">Impact Analysis:</h3>
              <p className="text-gray-300">{aiInsights.impactAnalysis}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm">Recommendation:</h3>
              <p className="text-gray-300">{aiInsights.recommendation}</p>
            </div>
          </>
        ) : (
          <p className="text-gray-400">No AI insights available.</p>
        )}
      </div>
    </div>
  );
};

export default AiPanel;
