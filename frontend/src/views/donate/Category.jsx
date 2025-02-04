import { useEffect, useState } from "react";
import { getCharityCategoryAddressService } from "../../services/blockchain.services";
import { ellipsify } from "../../utils/ellipsify";
export default function CharityCategory({ categoryName, charityCategory }) {
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
      <span className="text-sm text-gray-500">
        {charityAddress.trim() != "" ? charityAddress : charityCategory}
      </span>
    </li>
  );
}
