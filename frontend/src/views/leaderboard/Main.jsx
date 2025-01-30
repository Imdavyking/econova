import React from "react";
import { gql, useQuery } from "@apollo/client";

// GraphQL Query
const GET_POINTS = gql`
  query MyQuery {
    pointsAddeds(orderBy: POINTS_DESC) {
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
  const { loading, error, data } = useQuery(GET_POINTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Points List</h2>
      <ul>
        {data.pointsAddeds.nodes.map((item) => (
          <li key={item.id}>
            <strong>User:</strong> {item.user} <br />
            <strong>Points:</strong> {item.points} <br />
            <strong>Contract:</strong> {item.contractAddress} <br />
            <strong>Updated:</strong>{" "}
            {new Date(item.updatedTimeStamp * 1000).toLocaleString()}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PointsList;
