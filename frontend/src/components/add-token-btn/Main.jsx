import React from "react";
import { FaPlusCircle } from "react-icons/fa";
import { addTokenToMetaMask } from "../../services/blockchain.services";
import { toast } from "react-toastify";
import { APP_NAME } from "../../utils/constants";
import { FaSpinner } from "react-icons/fa";
const AddTokenButton = () => {
  const [isAdding, setIsAdding] = React.useState(false);
  const addToken = async () => {
    try {
      setIsAdding(true);
      const wasAdded = await addTokenToMetaMask();
      if (wasAdded) {
        toast.success("Token added to MetaMask");
        return;
      }
      toast.error("Token could not be added to MetaMask");
    } catch (error) {
      toast.error(`Token could not be added to MetaMask ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };
  return (
    <button
      onClick={addToken}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
      disabled={isAdding}
    >
      {isAdding ? (
        <>
          <FaSpinner className="animate-spin w-5 h-5" />
        </>
      ) : (
        <>
          <FaPlusCircle className="w-5 h-5" />
          <span>Add {APP_NAME} token</span>
        </>
      )}
    </button>
  );
};

export default AddTokenButton;
