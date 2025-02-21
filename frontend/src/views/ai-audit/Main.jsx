import { useEffect, useState } from "react";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { FaStar } from "react-icons/fa"; // Import star icons
import { APP_NAME, SERVER_URL } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { fetchContractFileFromGitHub } from "../../services/github.repo.services";
import { set } from "lodash";
import { detectContractLanguage } from "../../services/contract.detect.services";
import { callLLMAuditApi } from "../../services/openai.services";

export default function AiAudit() {
  const [file, setFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [contractCode, setContractCode] = useState("");
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const readFileContent = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        detectContractLanguage(e.target.result);
        setContractCode(e.target.result);
      } catch (error) {
        toast.error(error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (
      selectedFile &&
      (selectedFile.name.endsWith(".sol") ||
        selectedFile.name.endsWith(".vy") ||
        selectedFile.name.endsWith(".wasm"))
    ) {
      setFile(selectedFile);
      readFileContent(event);
      setGithubUrl("");
      setContractCode("");
    } else {
      setFile(null);
      toast.error(
        "Please upload a valid Solidity (.sol), Vyper (.vy), or WebAssembly (.wasm) file."
      );
    }
  };

  const handleGithubChange = (e) => {
    setGithubUrl(e.target.value);
    setFile(null); // Clear other fields
    setContractCode("");
  };

  const handleContractChange = (e) => {
    setContractCode(e.target.value);
    setFile(null); // Clear other fields
    setGithubUrl("");
  };

  //   https://explorer.sonicchain.com/api?module=contract&action=getContract&address=0xYourcontractCode

  const handleSubmit = async () => {
    try {
      setIsAuditing(true);
      if (!file && !githubUrl && !contractCode) {
        toast.error("Please provide at least one submission method.");
        return;
      }

      console.log("Submitting:", { file, githubUrl, contractCode });

      let currentContractCode = contractCode;

      if (githubUrl) {
        currentContractCode = await fetchContractFileFromGitHub(githubUrl);
        setContractCode(contractCode);
      }

      const response = await callLLMAuditApi({
        contractCode: currentContractCode,
      });

      if (response.tool_calls.length > 0) {
        const auditResponse = response.tool_calls.find(
          (call) => call.name === "auditResponse"
        );
        if (auditResponse) {
          setAuditResult(auditResponse.args);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col items-center">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 ">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} AI Audit</span>
        </a>
      </h2>
      <div className="w-full max-w-lg bg-gray-800 p-6 rounded-2xl shadow-lg">
        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Upload Contract File (.sol / .vy / .wasm)
          </label>
          <input
            type="file"
            accept=".sol,.wasm,.vy"
            disabled={!!githubUrl}
            onChange={handleFileChange}
            className="w-full text-sm text-gray-300 bg-gray-700 rounded-lg p-2 border border-gray-600"
          />
        </div>

        {/* GitHub Repo URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Public GitHub Repository URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/user/repo"
            value={githubUrl}
            disabled={!!file}
            onChange={handleGithubChange}
            className="w-full text-sm text-gray-300 bg-gray-700 rounded-lg p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Paste Contract Code
          </label>
          <textarea
            placeholder="Paste your contract code here..."
            value={contractCode}
            disabled={!!file || !!githubUrl}
            onChange={handleContractChange}
            className="w-full text-sm text-gray-300 bg-gray-700 rounded-lg p-2 border border-gray-600 h-32 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition duration-200 flex flex-col items-center"
        >
          {isAuditing ? (
            <FaSpinner className="w-5 h-5 animate-spin" />
          ) : (
            "Submit Contract"
          )}
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
