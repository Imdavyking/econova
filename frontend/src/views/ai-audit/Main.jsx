import { useState } from "react";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { FaStar } from "react-icons/fa"; // Import star icons

export default function AiAudit() {
  const [file, setFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [auditResult, setAuditResult] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (
      selectedFile &&
      (selectedFile.name.endsWith(".sol") ||
        selectedFile.name.endsWith(".wasm"))
    ) {
      setFile(selectedFile);
    } else {
      alert(
        "Please upload a valid Solidity (.sol) or WebAssembly (.wasm) file."
      );
    }
  };

  const handleSubmit = async () => {
    if (!file && !githubUrl && !contractAddress) {
      alert("Please provide at least one submission method.");
      return;
    }

    console.log("Submitting:", { file, githubUrl, contractAddress });

    // Simulated audit response
    const simulatedAuditResponse = {
      rating: 3, // Rating out of 5
      overview:
        "The contract has no critical vulnerabilities but contains high-severity gas inefficiencies.",
      issues_detected: {
        severe: [],
        major: [
          "Gas optimization needed for loops",
          "Function visibility is not explicitly set",
        ],
        moderate: ["Lack of indexed event parameters"],
        minor: ["Unused imports detected"],
      },
      fix_recommendations: [
        "Optimize loops to reduce gas costs. Example: Use `mapping` instead of `array` where possible.",
        "Set function visibility explicitly, e.g., `function myFunction() public {}`",
      ],
      efficiency_tips: [
        "Use `constant` and `immutable` for state variables where applicable to save gas.",
      ],
    };

    // Simulating API response delay
    setTimeout(() => {
      setAuditResult(simulatedAuditResponse);
    }, 2000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen text-white px-4">
      <DarkModeSwitcher />
      <div className="w-full max-w-lg bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Submit Sonic Smart Contract
        </h2>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Upload Contract File (.sol / .wasm)
          </label>
          <input
            type="file"
            accept=".sol,.wasm"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-300 bg-gray-700 rounded-lg p-2 border border-gray-600"
          />
        </div>

        {/* GitHub Repo URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            GitHub Repository URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/user/repo"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full text-sm text-gray-300 bg-gray-700 rounded-lg p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contract Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Deployed Contract Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="w-full text-sm text-gray-300 bg-gray-700 rounded-lg p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition duration-200"
        >
          Submit Contract
        </button>

        {/* Audit Result Display */}
        {auditResult && (
          <div className="mt-6 bg-gray-700 p-6 rounded-lg text-sm shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">
              Audit Report
            </h3>

            {/* Star Rating Display */}
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`text-xl ${
                    index < auditResult.rating
                      ? "text-yellow-400"
                      : "text-gray-500"
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-300 text-sm">
                ({auditResult.rating}/5)
              </span>
            </div>

            <p className="mb-4 text-gray-300">{auditResult.overview}</p>

            <div className="mb-4">
              <h4 className="font-semibold text-red-400">Issues Detected:</h4>
              <ul className="list-disc ml-5 text-gray-300">
                {Object.entries(auditResult.issues_detected).map(
                  ([severity, issues]) =>
                    issues.length > 0 ? (
                      <li key={severity}>
                        <span className="font-semibold capitalize">
                          {severity}:
                        </span>
                        <ul className="ml-4 list-disc">
                          {issues.map((issue, index) => (
                            <li key={index} className="text-gray-400">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ) : null
                )}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-green-400">
                Fix Recommendations:
              </h4>
              <ul className="list-disc ml-5 text-gray-300">
                {auditResult.fix_recommendations.map((fix, index) => (
                  <li key={index} className="text-gray-400">
                    {fix}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-blue-400">Efficiency Tips:</h4>
              <ul className="list-disc ml-5 text-gray-300">
                {auditResult.efficiency_tips.map((tip, index) => (
                  <li key={index} className="text-gray-400">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
