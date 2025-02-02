import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { APP_NAME, CONTRACT_ADDRESS } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { ellipsify } from "../../utils";
import { FaSpinner } from "react-icons/fa";
import { getAllTweets } from "../../services/tweets.services";
import { Tweet } from "../../components/tweet";
// GraphQL Query
const GET_POINTS = gql`
  query MyQuery {
    pointsAddeds(orderBy: POINTS_DESC, first: 10) {
      nodes {
        id
        contractAddress
        points
        updatedTimeStamp
        user
      }
    }
  }
`;
const tweets = [
  {
    _id: "67950c24e1289710853e35af",
    edit_history_tweet_ids: ["1883184787340349875"],
    id: "1883184787340349875",
    text: "In a digital realm filled with complexities, EcoNova serves as the savvy navigator guiding you through the maze of blockchain wonders with wit and wisdom. Step into the world of smart contracts and innovation, where every byte holds a story waiting to be unraveled.",
  },
  {
    _id: "12345c24e1289710853e35af",
    edit_history_tweet_ids: ["1883184787340349876"],
    id: "1883184787340349876",
    text: "Excited to explore new opportunities in blockchain! #innovation #smartcontracts",
  },
];

const TweetList = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-4">
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} tweet={tweet} />
        ))}
      </div>
    </div>
  );
};

const EarnPoints = () => {
  useEffect(() => {
    getAllTweets()
      .then((data) => console.log(data))
      .catch((error) => console.log(error));
  }, []);
  const { loading, error, data } = useQuery(GET_POINTS);

  if (error) return <p>Error: {error.message}</p>;
  return (
    <div className="max-w-4xl mx-auto p-4 ">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} tweets</span>
        </a>
      </h2>

      <TweetList />
    </div>
  );
};

export default EarnPoints;
