import { useEffect, useState } from "react";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { FaStar, FaSpinner } from "react-icons/fa";
import { APP_NAME, CONTRACT_ADDRESS } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import { toast } from "react-toastify";
import charityAbi from "@/assets/json/charity.json";

export default function DAOProposalForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [contractSignature, setContractSignature] = useState("");
  const [ethValue, setEthValue] = useState("");
  const [signatures, setSignatures] = useState([]);
  const [inputs, setInputs] = useState([]);

  const extractSignatures = () => {
    try {
      const functionSignatures = charityAbi
        .filter((item) => item.type === "function")
        .map((item) => ({ name: item.name, inputs: item.inputs }));
      setSignatures(functionSignatures);
      setContractSignature("");
      setInputs([]);
    } catch (error) {
      console.error(error);

      toast.error("Invalid ABI JSON");
    }
  };

  useEffect(() => {
    extractSignatures();
  }, [charityAbi]);

  const handleSignatureChange = (signature) => {
    setContractSignature(signature);
    const selectedFunction = signatures.find((sig) => sig.name === signature);
    setInputs(selectedFunction ? selectedFunction.inputs : []);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-6 shadow-lg bg-white rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Create DAO Proposal</h2>

        <div className="mb-4">
          <label className="block font-medium">Title</label>
          <input
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proposal Title"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Proposal Description"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Target Contract Address</label>
          <input
            className="w-full p-2 border rounded"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>

        {signatures.length > 0 && (
          <div className="mb-4">
            <label className="block font-medium">
              Target Contract Signature
            </label>
            <select
              className="w-full p-2 border rounded"
              onChange={(e) => handleSignatureChange(e.target.value)}
            >
              <option value="">Select a function</option>
              {signatures.map((sig, index) => (
                <option key={index} value={sig.name}>
                  {sig.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {inputs.length > 0 && (
          <div className="mb-4">
            <label className="block font-medium">Function Inputs</label>
            {inputs.map((input, index) => (
              <div key={index} className="mb-2">
                <label className="block font-medium">
                  {input.name || `Parameter ${index + 1}`} ({input.type})
                </label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder={input.type}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mb-4">
          <label className="block font-medium">ETH Value</label>
          <input
            className="w-full p-2 border rounded"
            type="number"
            value={ethValue}
            onChange={(e) => setEthValue(e.target.value)}
            placeholder="0.0"
          />
        </div>

        <button className="w-full px-4 py-2 bg-green-500 text-white rounded">
          Submit Proposal
        </button>
      </div>
    </div>
  );
}
