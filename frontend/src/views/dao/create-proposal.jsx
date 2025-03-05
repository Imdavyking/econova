import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { FaSpinner } from "react-icons/fa";
import charityAbi from "@/assets/json/charity.json";
import { charityCategories } from "../../utils/charity.categories";
import logoUrl from "@/assets/images/logo.png";
import {
  charityAbiInterface,
  daoDelegate,
  daoPropose,
  getProjectTokenDetails,
  rethrowFailedResponse,
} from "../../services/blockchain.services";
import { getAllCharities } from "../../services/blockchain.services";
import { ellipsify } from "../../utils/ellipsify";
import { APP_NAME } from "../../utils/constants";

export default function DAOProposalForm() {
  const [description, setDescription] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [contractSignature, setContractSignature] = useState("");
  const [ethValue, setEthValue] = useState("");
  const [signatures, setSignatures] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [charityAddresses, setCharityAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const extractSignatures = () => {
    try {
      const functionSignatures = charityAbi
        .filter(
          (item) =>
            item.type === "function" && item.stateMutability === "nonpayable"
        )
        .map((item) => ({
          name: item.name,
          inputs: item.inputs,
        }));
      setSignatures(functionSignatures);
      setContractSignature("");
      setInputs([]);
      setInputValues({});
    } catch (error) {
      console.error(error);
      toast.error("Invalid ABI JSON");
    }
  };

  useEffect(() => {
    extractSignatures();

    const getCharityCategoryWithAddress = async () => {
      try {
        const charities = await getAllCharities();
        const charityCategoryWithAddress = await Promise.all(
          Object.entries(charityCategories).map(
            async ([categoryName, index]) => {
              const address = charities[index];
              return { categoryName, index, address };
            }
          )
        );

        setCharityAddresses(charityCategoryWithAddress);
        if (charityCategoryWithAddress.length > 0) {
          setContractAddress(charityCategoryWithAddress[0].address); // Set default
        }
      } catch (error) {
        console.error("Error fetching charity category addresses:", error);
        setCharityAddresses([]);
      }
    };

    getCharityCategoryWithAddress();
  }, []);

  const handleSignatureChange = (signature) => {
    setContractSignature(signature);
    const selectedFunction = signatures.find((sig) => sig.name === signature);
    setInputs(selectedFunction ? selectedFunction.inputs : []);
    setInputValues(
      selectedFunction
        ? Object.fromEntries(
            selectedFunction.inputs.map((input) => [input.name, ""])
          )
        : {}
    );
  };

  const handleInputChange = (name, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const sendProposal = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!description) {
        return toast.error("Description must be provided.");
      }

      if (!contractAddress) {
        return toast.error("Contract address must be selected.");
      }

      if (!contractSignature) {
        return toast.error("Contract signature must be selected.");
      }

      const functionAbi = signatures.find(
        (sig) => sig.name === contractSignature
      );
      if (!functionAbi) {
        return toast.error("Invalid function signature.");
      }

      const encodedFunctionCall = charityAbiInterface.encodeFunctionData(
        contractSignature,
        Object.values(inputValues)
      );

      const { tokenAddress } = await getProjectTokenDetails();

      const delegateResponse = await daoDelegate({
        tokenAddress,
      });

      rethrowFailedResponse(delegateResponse);

      const proposeResponse = await daoPropose({
        targetAddress: contractAddress,
        encodedFunctionCall,
        PROPOSAL_DESCRIPTION: description,
      });

      rethrowFailedResponse(proposeResponse);

      console.log("Encoded function call:", encodedFunctionCall);

      toast.success("Proposal submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error(`Error submitting proposal. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 flex-col">
      <DarkModeSwitcher />
      <a href="/" className="-intro-x flex items-center pt-5">
        <img alt="EcoNova" className="w-10" src={logoUrl} />
        <span className="text-white text-lg ml-3">
          {APP_NAME} Create Proposal
        </span>
      </a>

      <div className="bg-white dark:bg-darkmode-600 p-6 rounded-md shadow-md w-full max-w-md mx-auto">
        <div className="mb-4">
          <textarea
            className="intro-x login__input form-control py-3 px-4 block"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Proposal Description"
          />
        </div>
        <div className="mb-4">
          <select
            className="intro-x form-control py-3 px-4 block w-full mb-3"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          >
            {charityAddresses.length > 0 ? (
              charityAddresses.map((item, index) => (
                <option key={index} value={item.address}>
                  {item.categoryName} - {ellipsify(item.address)}
                </option>
              ))
            ) : (
              <option disabled>No addresses available</option>
            )}
          </select>
        </div>
        {signatures.length > 0 && (
          <div className="mb-4">
            <select
              className="intro-x form-control py-3 px-4 block w-full mb-3"
              value={contractSignature}
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
            {inputs.map((input, index) => (
              <div key={index} className="mb-2">
                <input
                  className="intro-x login__input form-control py-3 px-4 block"
                  placeholder={`${input.name || `Parameter ${index + 1}`} (${
                    input.type
                  })`}
                  value={inputValues[input.name] || ""}
                  onChange={(e) =>
                    handleInputChange(input.name, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        )}
        {/* <div className="mb-4">
          <input
            className="intro-x login__input form-control py-3 px-4 block"
            type="number"
            value={ethValue}
            onChange={(e) => setEthValue(e.target.value)}
            placeholder="0.0ETH"
          />
        </div> */}
        <button
          className="btn btn-primary py-3 px-4 w-full xl:mr-3 align-top"
          onClick={sendProposal}
          disabled={loading}
        >
          {loading ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            "Submit Proposal"
          )}
        </button>
      </div>
    </div>
  );
}
