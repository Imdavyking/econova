import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  getOFTSendFee,
  sendOFTTokens,
} from "../../services/blockchain.services";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
const availableTokens = [
  { name: "Token A", address: "0xTokenAAddress" },
  { name: "Token B", address: "0xTokenBAddress" },
  { name: "Token C", address: "0xTokenCAddress" },
];

export default function Bridge() {
  const [selectedToken, setSelectedToken] = useState(
    availableTokens[0].address
  );
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [nativeFee, setNativeFee] = useState(null);
  const [lzTokenFee, setLzTokenFee] = useState(null);
  const [loading, setLoading] = useState(false);

  const eidB = "";

  useEffect(() => {
    if (!eidB) {
      console.error(
        "❌ Missing Destination Chain ID (eidB) in environment variables."
      );
    }
  }, [eidB]);

  const estimateFee = async () => {
    try {
      setLoading(true);
      const { nativeFee, lzTokenFee } = await getOFTSendFee({
        oftTokenAddress: "",
        recipientAddress: recipient,
        tokensToSend: "",
      });
      const data = await response.json();
      setNativeFee(ethers.formatEther(nativeFee));
      setLzTokenFee(ethers.formatEther(lzTokenFee));
    } catch (error) {
      console.error("Error estimating fee:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendTokens = async () => {
    try {
      setLoading(true);
      sendOFTTokens({
        oftTokenAddress: selectedToken,
        recipientAddress: recipient,
        tokensToSend: amount,
        eidB,
      });
      alert("✅ Tokens sent successfully!");
    } catch (error) {
      console.error("Error sending tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <DarkModeSwitcher />
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Send OFT Tokens
      </h2>

      <div className="space-y-4">
        <label className="block text-gray-700 font-medium">Select Token:</label>
        <select
          className="w-full p-3 border rounded-lg"
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
        >
          {availableTokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.name}
            </option>
          ))}
        </select>

        <label className="block text-gray-700 font-medium">
          Recipient Address:
        </label>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <label className="block text-gray-700 font-medium">
          Amount to Send:
        </label>
        <input
          type="text"
          placeholder="Amount to Send"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        {nativeFee && (
          <div className="text-gray-700">
            <p>
              Native Fee: <span className="font-semibold">{nativeFee} ETH</span>
            </p>
            <p>
              LZ Token Fee:{" "}
              <span className="font-semibold">{lzTokenFee} ETH</span>
            </p>
          </div>
        )}

        <button
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          onClick={estimateFee}
          disabled={loading}
        >
          {loading ? "Estimating..." : "Estimate Fee"}
        </button>

        <button
          className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          onClick={sendTokens}
          disabled={loading || !nativeFee}
        >
          {loading ? "Sending..." : "Send Tokens"}
        </button>
      </div>
    </div>
  );
}
