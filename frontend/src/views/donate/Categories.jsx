import { useEffect, useState } from "react";
import { charityCategories } from "../../utils/charity.categories";
import { APP_NAME } from "../../utils/constants";
import CharityCategory from "./Category";
import logoUrl from "@/assets/images/logo.png";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { getAllCharities } from "../../services/blockchain.services";

export default function CharityCategories() {
  const [charities, setCharities] = useState([]);
  useEffect(() => {
    const getCharitiesAddress = async () => {
      const charitiesAddr = await getAllCharities();
      setCharities(charitiesAddr);
    };
    getCharitiesAddress();
  }, []);
  return (
    <>
      {" "}
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} charity</span>
        </a>
      </h2>
      <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
        <DarkModeSwitcher />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Charity Categories
        </h2>
        {charities.length > 0 && (
          <ul className="space-y-3">
            {Object.entries(charityCategories).map(
              ([categoryName, charityCategory]) => (
                <CharityCategory
                  categoryName={categoryName}
                  charityAddress={charities[charityCategory]}
                  key={charities[charityCategory]}
                />
              )
            )}
          </ul>
        )}
      </div>
    </>
  );
}
