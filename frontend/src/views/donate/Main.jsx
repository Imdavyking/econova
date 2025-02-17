/** @format */

import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import dom from "@left4code/tw-starter/dist/js/dom";
import logoUrl from "@/assets/images/logo.png";
import donateHeart from "@/assets/images/donate-heart.svg";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import {
  donateToFoundationService,
  rethrowFailedResponse,
} from "../../services/blockchain.services";
import { APP_NAME, ETH_ADDRESS } from "../../utils/constants";
import { charityCategories } from "../../utils/charity.categories";

function Main() {
  useEffect(() => {
    dom("body").removeClass("main").removeClass("error-page").addClass("login");
  }, []);

  const [isDonating, setIsDonating] = useState(false);
  const [amountInUsd, setAmountUSDToDonate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleChange = (setState) => (e) => {
    setState(e.target.value);
  };

  const handleClick = async () => {
    if (amountInUsd === "" || selectedCategory === "") {
      toast.error("Please select a category and enter an amount");
      return;
    }

    try {
      setIsDonating(true);
      console.log({
        tokenAddress: ETH_ADDRESS,
        amountInUsd,
        category: selectedCategory, // Include category in the donation request
      });
      const response = await donateToFoundationService({
        tokenAddress: ETH_ADDRESS,
        amountInUsd,
        category: selectedCategory, // Include category in the donation request
      });
      rethrowFailedResponse(response);
      toast.success(response);

      setAmountUSDToDonate("");
      setSelectedCategory("");
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <>
      <div>
        <DarkModeSwitcher />
        <div className="container sm:px-10">
          <div className="block xl:grid grid-cols-2 gap-4">
            <div className="hidden xl:flex flex-col min-h-screen">
              <a href="/" className="-intro-x flex items-center pt-5">
                <img alt="EcoNova" className="w-10" src={logoUrl} />
                <span className="text-white text-lg ml-3"> {APP_NAME} </span>
              </a>
              <div className="my-auto">
                <img
                  alt="EcoNova"
                  className="-intro-x w-1/2 -mt-16"
                  src={donateHeart}
                />
                <div className="-intro-x text-white font-medium text-4xl leading-tight mt-10">
                  Your <br />
                  donation creates impact.
                </div>
                <div className="-intro-x mt-5 text-lg text-white text-opacity-70 dark:text-slate-400">
                  ...A blockchain-powered charitable impact
                </div>
              </div>
            </div>
            <div className="h-screen xl:h-auto flex flex-col items-center py-5 xl:py-0 xl:my-0">
              <a href="/" className="-intro-x flex items-center pt-5 my-2">
                <img alt="EcoNova" className="w-10" src={logoUrl} />
                <span className="text-white text-lg ml-3"> EcoNova </span>
              </a>
              <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
                <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">
                  Donate to the foundation
                </h2>
                <div className="intro-x mt-2 text-slate-400 dark:text-slate-400 xl:hidden text-center">
                  ...A blockchain-powered charitable impact
                </div>
                <div className="intro-x mt-8">
                  {/* Dropdown for Category Selection */}
                  <select
                    value={selectedCategory}
                    onChange={handleChange(setSelectedCategory)}
                    className="intro-x form-control py-3 px-4 block w-full mb-3"
                  >
                    <option value="">Select a Category</option>
                    {Object.keys(charityCategories).map((category) => (
                      <option
                        key={category}
                        value={charityCategories[category]}
                      >
                        {category}
                      </option>
                    ))}
                  </select>

                  {/* Amount Input */}
                  <input
                    type="number"
                    value={amountInUsd}
                    step={1}
                    onChange={handleChange(setAmountUSDToDonate)}
                    className="intro-x login__input form-control py-3 px-4 block"
                    placeholder="$10"
                  />
                </div>

                <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
                  <button
                    className="btn btn-primary py-3 px-4 w-full xl:mr-3 align-top"
                    onClick={handleClick}
                    disabled={isDonating}
                  >
                    {isDonating ? (
                      <FaSpinner className="w-5 h-5 animate-spin" />
                    ) : (
                      "Donate"
                    )}
                  </button>
                  {/* Link to Donate Categories */}
                  <div className="mt-3">
                    <a
                      href="/donate-categories"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View Charity Categories
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
