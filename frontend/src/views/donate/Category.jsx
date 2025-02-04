import { useEffect, useState } from "react";
import { getCharityCategoryAddressService } from "../../services/blockchain.services";
import { ellipsify } from "../../utils/ellipsify";
import { toast } from "react-toastify";
import { FaCopy } from "react-icons/fa";
export default function CharityCategory({ categoryName, charityCategory }) {
  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard!", { autoClose: 2000 });
  };
  const [charityAddress, setCharityAddress] = useState("");
  useEffect(() => {
    getCharityCategoryAddressService({ charityCatogory: charityCategory })
      .then((address) => {
        console.log(address);
        setCharityAddress(ellipsify(address));
      })
      .catch((error) => {
        console.log(error);
      });
  }, [charityCategory]);
  return (
    <li
      key={categoryName}
      className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
    >
      <span className="text-lg font-semibold text-gray-700">
        {categoryName}
      </span>
      <button
        onClick={() => handleCopy(charityAddress)}
        className="text-gray-600 hover:text-gray-900"
      >
        <span className="text-sm text-gray-500">
          {charityAddress.trim() != "" ? charityAddress : charityCategory}
        </span>
        <FaCopy className="w-5 h-5" />
      </button>
    </li>
  );
}
