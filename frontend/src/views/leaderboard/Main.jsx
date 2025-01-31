import React from "react";
import { gql, useQuery } from "@apollo/client";
import { APP_NAME, CONTRACT_ADDRESS } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
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

const PointsList = () => {
  // const { data } = await client.query({
  //     query: GET_POINTS,
  //   });
  const { loading, error, data } = useQuery(GET_POINTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <div className="max-w-4xl mx-auto p-4 ">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} leaderboard</span>
        </a>
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Points</th>
              <th className="p-3 text-left">Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.pointsAddeds.nodes
              .filter((item) => {
                console.log({ item });
                return (
                  String(item.contractAddress).toLowerCase() ==
                  String(CONTRACT_ADDRESS).toLowerCase()
                );
              })
              .map((item, index) => (
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
                  <td className="p-3 font-semibold text-black">{item.user}</td>
                  <td className="p-3 font-bold text-blue-600">{item.points}</td>
                  <td className="p-3 text-black">
                    {new Date(item.updatedTimeStamp * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PointsList;
