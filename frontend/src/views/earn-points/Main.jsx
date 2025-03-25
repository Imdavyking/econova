import React, { useEffect, useState } from "react";
import { APP_NAME } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";

import { getPaginatedTweets } from "../../services/tweets.services";
import { Tweet } from "../../components/tweet";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link, useSearchParams } from "react-router-dom";

const TweetList = ({ tweets }) => {
  if (!tweets.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-white">No tweets found</span>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-4">
        {tweets.map((tweet) => (
          <Tweet key={tweet._id} tweet={tweet} />
        ))}
      </div>
    </div>
  );
};

const EarnPoints = () => {
  const [tweetsData, setTweetsData] = useState({
    tweets: [],
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
    setLoading(true);
    getPaginatedTweets(page)
      .then((data) => setTweetsData(data))
      .catch((error) => toast.error(error?.message))
      .finally(() => setLoading(false));
  }, [page]);

  const goToPage = (newPage) => {
    setSearchParams({ page: newPage });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} tweets</span>
        </Link>
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-white text-4xl" />
        </div>
      ) : (
        <>
          <TweetList tweets={tweetsData.tweets} />

          <div className="flex justify-center mt-4 gap-4">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-white">
              Page {tweetsData.currentPage} of {tweetsData.totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= tweetsData.totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EarnPoints;
