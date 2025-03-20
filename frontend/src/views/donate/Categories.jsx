import { useEffect, useState } from "react";
import { charityCategories } from "../../utils/charity.categories";
import { APP_NAME } from "../../utils/constants";
import CharityCategory from "./Category";
import logoUrl from "@/assets/images/logo.png";
import { FaSpinner } from "react-icons/fa";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { getAllCharities } from "../../services/blockchain.services";
import { Link } from "react-router-dom";
export default function CharityCategories() {
  const [charities, setCharities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    dom("body").removeClass("error-page").removeClass("login").addClass("main");
  }, []);
  useEffect(() => {
    const getCharitiesAddress = async () => {
      try {
        const charitiesAddr = await getAllCharities();
        setCharities(charitiesAddr);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    getCharitiesAddress();
  }, []);
  return (
    <>
      {" "}
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} charity</span>
        </Link>
      </h2>
      <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
        <DarkModeSwitcher />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Charity Categories
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <FaSpinner className="animate-spin text-gray-600 text-3xl" />
          </div>
        ) : charities.length > 0 ? (
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
        ) : (
          <p className="text-center text-gray-600">No charities available.</p>
        )}
      </div>
    </>
  );
}
