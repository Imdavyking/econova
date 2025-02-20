import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { APP_NAME, CONTRACT_ADDRESS } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { ellipsify } from "../../utils";
import { FaSpinner } from "react-icons/fa";
import {
  batchMulticall,
  getProjectTokenDetails,
} from "../../services/blockchain.services";
import { ethers } from "ethers";
import erc20Abi from "@/assets/json/erc20.json";
import { useSearchParams } from "react-router-dom";

// GraphQL Query
const GET_POINTS = gql`
  query MyQuery($first: Int!, $offset: Int!) {
    pointsAddeds(orderBy: POINTS_DESC, first: $first, offset: $offset) {
      nodes {
        id
        contractAddress
        points
        updatedTimeStamp
        user
      }
      totalCount
    }
  }
`;

const erc20Interface = new ethers.Interface(erc20Abi);

const LeaderBoard = () => {
  const [projectTokenBalances, setProjectTokenBalances] = useState([]);
  const [projectTokenName, setProjectTokenName] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = 2;
  const offset = (page - 1) * pageSize;
  const { loading, error, data } = useQuery(GET_POINTS, {
    variables: { first: pageSize, offset },
  });

  const totalPages = Math.ceil(
    (data?.pointsAddeds?.totalCount || 0) / pageSize
  );

  const goToPage = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };

  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!data || loading) return;

      try {
        const { tokenAddress, decimals, name } = await getProjectTokenDetails();
        setProjectTokenName(name);

        const queries = data.pointsAddeds.nodes
          .filter(
            (item) =>
              item.contractAddress.toLowerCase() ===
              CONTRACT_ADDRESS.toLowerCase()
          )
          .map((item) => ({
            target: tokenAddress,
            callData: erc20Interface.encodeFunctionData("balanceOf", [
              item.user,
            ]),
          }));

        const results = await batchMulticall(queries);

        const decodedBalances = results.map(
          ({ success, returnData }, index) => ({
            user: data.pointsAddeds.nodes[index].user,
            balance: success
              ? ethers.formatUnits(
                  erc20Interface.decodeFunctionResult(
                    "balanceOf",
                    returnData
                  )[0],
                  decimals
                )
              : "0",
          })
        );

        setProjectTokenBalances(decodedBalances);
      } catch (error) {
        console.error("Error fetching token balances:", error);
      }
    };

    fetchTokenBalances();
  }, [data, loading]);

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} Leaderboard</span>
        </a>
      </h2>

      {loading ? (
        <FaSpinner className="w-5 h-5 animate-spin" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3 text-left">Rank</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Points</th>
                <th className="p-3 text-left">
                  {projectTokenName.trim() == "" ? "Balance" : projectTokenName}
                </th>

                <th className="p-3 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.pointsAddeds.nodes
                .filter(
                  (item) =>
                    item.contractAddress.toLowerCase() ===
                    CONTRACT_ADDRESS.toLowerCase()
                )
                .map((item, index) => {
                  const userBalance =
                    projectTokenBalances.find(
                      (b) => b.user.toLowerCase() === item.user.toLowerCase()
                    )?.balance || "---"; // Find balance or default to "---"

                  return (
                    <tr
                      key={item.id}
                      className={`border-b ${
                        index === 0
                          ? "bg-yellow-200"
                          : index === 1
                          ? "bg-gray-200"
                          : index === 2
                          ? "bg-orange-200"
                          : "bg-white"
                      } hover:bg-gray-100 transition`}
                    >
                      <td className="p-3 text-black">{index + 1}</td>
                      <td className="p-3 font-semibold text-black">
                        {ellipsify(item.user)}
                      </td>
                      <td className="p-3 font-bold text-blue-600">
                        {item.points}
                      </td>
                      <td className="p-3 font-bold text-green-600">
                        {userBalance}
                      </td>{" "}
                      {/* Show balance */}
                      <td className="p-3 text-black">
                        {new Date(
                          item.updatedTimeStamp * 1000
                        ).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>

            <span className="text-white">
              Page {page} of {totalPages}
            </span>

            <button
              className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderBoard;
