import { useEffect, useState } from "react";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { FaStar, FaSpinner } from "react-icons/fa";
import { APP_NAME, CONTRACT_ADDRESS } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import { toast } from "react-toastify";
import { fetchContractFileFromGitHub } from "../../services/github.repo.services";
import { detectContractLanguage } from "../../services/contract.detect.services";
import { callLLMAuditApi } from "../../services/openai.services";
import { getVerifiedSourceCode } from "../../services/source.code.services";

export default function AiAudit() {
  const [file, setFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [contractCode, setContractCode] = useState("");
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [contractAddress, setContractAddress] = useState("");

  const fetchVerifiedSourceCode = async ({ contractAddress }) => {
    try {
      const result = await getVerifiedSourceCode({ contractAddress });
      if (!result.sourceCode || !result.contractName) {
        toast.error("No verified source code found for this contract.");
        return;
      }

      let sourceCode = result.sourceCode;
      const contractName = result.contractName;

      if (sourceCode.startsWith("{{") && sourceCode.endsWith("}}")) {
        sourceCode = sourceCode.slice(1, -1).trim();
        const contractInfo = JSON.parse(sourceCode);
        const sources = contractInfo.sources;

        const mainContract = Object.values(sources).find((source) =>
          source.content.includes(`contract ${contractName}`)
        );
        if (mainContract && mainContract.content) {
          return mainContract.content;
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching contract source code.");
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (
      selectedFile &&
      (selectedFile.name.endsWith(".sol") || selectedFile.name.endsWith(".vy"))
    ) {
      setFile(selectedFile);
      readFileContent(event);
      resetInputs("file");
    } else {
      setFile(null);
      toast.error("Please upload a valid Solidity (.sol) or Vyper (.vy) file.");
    }
  };

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

  const handleGithubChange = (e) => {
    setGithubUrl(e.target.value);
    resetInputs("github");
  };

  const handleContractChange = (e) => {
    setContractCode(e.target.value);
    resetInputs("manual");
  };

  const handleContractAddressChange = (e) => {
    setContractAddress(e.target.value);
    resetInputs("address");
  };

  const resetInputs = (source) => {
    if (source !== "file") setFile(null);
    if (source !== "github") setGithubUrl("");
    if (source !== "manual") setContractCode("");
    if (source !== "address") setContractAddress("");
    setAuditResult(null);
  };

  const handleSubmit = async () => {
    try {
      setIsAuditing(true);
      setAuditResult(null);
      if (!file && !githubUrl && !contractCode && !contractAddress) {
        toast.error("Please provide at least one submission method.");
        return;
      }

      let currentContractCode = contractCode;

      if (githubUrl) {
        currentContractCode = await fetchContractFileFromGitHub(githubUrl);
        if (currentContractCode) {
          setContractCode(currentContractCode);
        }
      } else if (contractAddress) {
        currentContractCode = await fetchVerifiedSourceCode({
          contractAddress,
        });
        if (currentContractCode) {
          setContractCode(currentContractCode);
        }
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
        {/* Verified Contract Address Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Enter Verified Contract Address
          </label>
          <input
            type="text"
            placeholder="0x1234...abcd"
            value={contractAddress}
            disabled={!!file || !!githubUrl}
            onChange={handleContractAddressChange}
            className="w-full text-sm text-gray-300 bg-gray-700 rounded-lg p-2 border border-gray-600"
          />
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Upload Contract File (.sol / .vy)
          </label>
          <input
            type="file"
            accept=".sol,.vy"
            disabled={!!githubUrl || !!contractAddress}
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
            disabled={!!file || !!contractAddress}
            onChange={handleGithubChange}
            className="w-full text-sm text-gray-300 bg-gray-700 rounded-lg p-2 border border-gray-600"
          />
        </div>

        {/* Manual Code Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Paste Contract Code
          </label>
          <textarea
            placeholder="Paste your contract code here..."
            value={contractCode}
            disabled={!!file || !!githubUrl || !!contractAddress}
            onChange={handleContractChange}
            className="w-full text-sm text-gray-300 bg-gray-700 rounded-lg p-2 border border-gray-600 h-32"
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
