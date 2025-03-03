import { gql, useQuery } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
// GraphQL Query
const GET_PROPOSALS = gql`
  query MyQuery($first: Int!, $offset: Int!) {
    proposalCreateds(orderBy: POINTS_DESC, first: $first, offset: $offset) {
      nodes {
        id
        contractAddress
        proposalId
        proposer
        voteStart
        voteEnd
        description
        state
        targets
      }
      totalCount
    }
  }
`;
export default function DAO() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  const { loading, error, data } = useQuery(GET_PROPOSALS, {
    fetchPolicy: "cache-and-network",
    variables: { first: pageSize, offset },
    pollInterval: 5000,
  });

  if (!loading) {
    console.log(data);
  }

  if (error) {
    console.log(`Error! ${error.message}`);
  }

  const totalPages = Math.ceil(
    (data?.pointsAddeds?.totalCount || 0) / pageSize
  );

  const goToPage = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };

  return (
    <>
      {" "}
      <DarkModeSwitcher />
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
    </>
  );
}
