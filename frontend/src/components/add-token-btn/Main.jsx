import React from "react";
import { FaPlusCircle } from "react-icons/fa";
import { addTokenToMetaMask } from "../../services/blockchain.services";

const AddTokenButton = () => {
  const addToken = async () => {
    await addTokenToMetaMask();
  };
  return (
    <button
      onClick={addToken}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
    >
      <FaPlusCircle className="w-5 h-5" />
      <span>Add Token to MetaMask</span>
    </button>
  );
};

export default AddTokenButton;
