import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { getTransactionInfo } from "../../services/blockchain.services";
import { callLLMTxHashApi } from "../../services/openai.services";
import { APP_NAME, CHAIN_SYMBOL } from "../../utils/constants";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { toast } from "react-toastify";
import logoUrl from "@/assets/images/logo.png";

export default function TransactionAudit() {
  const [txHash, setTxHash] = useState("");
  const [txInfo, setTxInfo] = useState(null);
  const [txSummary, setTxSummary] = useState(null);
  const [legalAdvice, setLegalAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetchTransaction = async () => {
    if (!txHash) return;
    setLoading(true);
    setTxInfo(null);
    setTxSummary(null);
    setLegalAdvice(null);

    try {
      const txInfo = await getTransactionInfo({ txHash });
      console.log({ txInfo });
      setTxInfo(txInfo);

      const summary = await callLLMTxHashApi({ txInfo });
      console.log({ summary });

      if (summary && summary.tool_calls) {
        const txHashSummary = summary.tool_calls.find(
          (call) => call.name === "txHashSummary"
        );
        if (txHashSummary) {
          setTxSummary(txHashSummary.args.summary);
          setLegalAdvice(txHashSummary.args.legalAdvice);
        }
      }
    } catch (error) {
      console.error({ error });
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white p-6">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} AI Tutor</span>
        </a>
      </h2>

      <div className="w-full max-w-lg bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">
          Transaction Analysis
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Transaction Hash
          </label>
          <input
            type="text"
            placeholder="Enter transaction hash..."
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            className="w-full text-sm text-gray-300 bg-gray-700 rounded-lg p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 break-words"
          />
        </div>

        <button
          onClick={handleFetchTransaction}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition duration-200 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <FaSpinner className="animate-spin w-5 h-5" />
          ) : (
            "Fetch Transaction"
          )}
        </button>

        {txInfo && (
          <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
            <p className="text-gray-300 text-sm break-words">
              <strong>From:</strong> {txInfo.from}
            </p>
            <p className="text-gray-300 text-sm break-words">
              <strong>To:</strong> {txInfo.to}
            </p>
            <p className="text-gray-300 text-sm">
              <strong>Amount:</strong> {txInfo.value} {CHAIN_SYMBOL}
            </p>
            <p className="text-gray-300 text-sm">
              <strong>Gas Used:</strong> {txInfo.gasPrice}
            </p>
          </div>
        )}

        {txSummary && (
          <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">AI Summary</h3>
            <p className="text-gray-300 text-sm break-words whitespace-pre-wrap">
              {txSummary}
            </p>
          </div>
        )}

        {legalAdvice && (
          <div className="mt-6 bg-red-700 p-4 rounded-lg border-l-4 border-red-400">
            <h3 className="text-lg font-semibold text-red-200 mb-2">
              Legal Advice
            </h3>
            <p className="text-red-100 text-sm break-words whitespace-pre-wrap">
              {legalAdvice}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
