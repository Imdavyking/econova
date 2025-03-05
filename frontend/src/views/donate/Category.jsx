import { ellipsify } from "../../utils/ellipsify";
import { toast } from "react-toastify";
import { FaCopy } from "react-icons/fa";
export default function CharityCategory({ categoryName, charityAddress }) {
  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard!", { autoClose: 2000 });
  };
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
        className="text-gray-600 hover:text-gray-900 flex"
      >
        <span className="text-sm text-gray-500">
          {ellipsify(
            charityAddress.trim() != "" ? charityAddress : charityCategory
          )}
        </span>
        <span className="mx-2"></span>
        <FaCopy className="w-5 h-5" />
      </button>
    </li>
  );
}
