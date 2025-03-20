/** @format */

import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { Link } from "react-router-dom";
import dom from "@left4code/tw-starter/dist/js/dom";
import logoUrl from "@/assets/images/logo.png";
import moneyImage from "@/assets/images/money.svg";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { redeemPointsService } from "@/services/blockchain.services";
import {
  getPointsService,
  getProjectTokenDetails,
  getPythPriceFeed,
  rethrowFailedResponse,
} from "../../services/blockchain.services";
import { FaSpinner } from "react-icons/fa";
import { APP_NAME } from "../../utils/constants";
function Main() {
  useEffect(() => {
    dom("body").removeClass("main").removeClass("error-page").addClass("login");
    getProjectTokenDetails()
      .then((data) => {
        setTokenSymbol(data.symbol);
      })
      .catch((err) => toast.error(err));
    getPointsService()
      .then((accPoints) => {
        setAccumulatedPoints(accPoints);
      })
      .catch((err) => toast.error(err));

    getPythPriceFeed()
      .then(([price, exp]) => {
        console.log(price, exp);
      })
      .catch((err) => toast.error(err));
  }, []);


  const [points, setPoints] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");

  const [accumulatedPoints, setAccumulatedPoints] = useState("****");

  const handleChange = (setState) => (e) => {
    setState(e.target.value);
  };

  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleClick = async () => {
    if (points === "") {
      toast.error("Please fill all fields");
    } else {
      try {
        setIsRedeeming(true);
        const response = await redeemPointsService({ points });
        rethrowFailedResponse(response);
        toast.success(response);
        getPointsService()
          .then((accPoints) => {
            setAccumulatedPoints(accPoints);
          })
          .catch((err) => toast.error(err));
      } catch (e) {
        toast.error(e.message);
      } finally {
        setIsRedeeming(false);
      }
    }
  };

  return (
    <>
      <div>
        <DarkModeSwitcher />
        <div className="container sm:px-10">
          <div className="block xl:grid grid-cols-2 gap-4">
            {/* BEGIN: Register Info */}
            <div className="hidden xl:flex flex-col min-h-screen">
              <Link to="/" className="-intro-x flex items-center pt-5">
                <img alt={APP_NAME} className="w-10" src={logoUrl} />
                <span className="text-white text-lg ml-3"> {APP_NAME} </span>
              </Link>
              <div className="my-auto">
                <img
                  alt={APP_NAME}
                  className="-intro-x w-1/2 -mt-16"
                  src={moneyImage}
                />
                <div className="-intro-x text-white font-medium text-4xl leading-tight mt-10">
                  Redeem your points <br />
                  to earn money.
                </div>
                <div className="-intro-x mt-5 text-lg text-white text-opacity-70 dark:text-slate-400">
                  ...A blockchain-powered charitable impact
                </div>
              </div>
            </div>
            {/* END: Register Info */}
            {/* BEGIN: Register Form */}
            <div className="h-screen xl:h-auto flex flex-col items-center py-5 xl:py-0  xl:my-0">
              <Link to="/" className="-intro-x flex items-center pt-5 my-2">
                <img alt={APP_NAME} className="w-10" src={logoUrl} />
                <span className="text-white text-lg ml-3"> {APP_NAME} </span>
              </Link>
              <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
                <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">
                  Redeem your points to earn money. {accumulatedPoints}{" "}
                  {tokenSymbol}
                </h2>
                <div className="intro-x mt-2 text-slate-400 dark:text-slate-400 xl:hidden text-center">
                  ...A blockchain-powered charitable impact
                </div>
                <div className="intro-x mt-8">
                  <input
                    type="number"
                    value={points}
                    step={1}
                    onChange={handleChange(setPoints)}
                    className="intro-x login__input form-control py-3 px-4 block"
                    placeholder="Points"
                  />
                </div>

                <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
                  <button
                    className="btn btn-primary py-3 px-4 w-full xl:w-full xl:mr-3 align-top"
                    onClick={handleClick}
                    disabled={isRedeeming}
                  >
                    {isRedeeming ? (
                      <FaSpinner className="w-5 h-5 animate-spin" />
                    ) : (
                      "Redeem Points"
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* END: Register Form */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
