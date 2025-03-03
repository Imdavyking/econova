import { gql, useQuery } from "@apollo/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { APP_NAME } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import Proposal from "./proposal";
import useCurrentBlock from "../../hooks/useCurrentBlock";

const GET_PROPOSALS = gql`
  query MyQuery($first: Int!, $offset: Int!) {
    proposalCreateds(orderBy: STATE_DESC, first: $first, offset: $offset) {
      nodes {
        contractAddress
        proposalId
        proposer
        state
        targets
        voteEnd
        voteStart
        description
        id
        calldatas
      }
      totalCount
    }
  }
`;

export default function DAO() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentBlock = useCurrentBlock();
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  const { loading, error, data } = useQuery(GET_PROPOSALS, {
    fetchPolicy: "cache-and-network",
    variables: { first: pageSize, offset },
    pollInterval: 5000,
  });

  const totalPages = Math.ceil(
    (data?.proposalCreateds?.totalCount || 0) / pageSize
  );

  const goToPage = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };

  return (
    <div className="p-6 min-h-screen ">
      <DarkModeSwitcher />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
          <a href="/" className="flex items-center space-x-3">
            <img alt={APP_NAME} className="w-10" src={logoUrl} />
            <span className="text-lg">{APP_NAME} DAO Proposals</span>
          </a>
        </h2>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
          onClick={() => navigate("/dao/create-proposal")}
        >
          Create Proposal
        </button>
      </div>

      {loading && <p className="text-center">Loading proposals...</p>}
      {error && (
        <p className="text-center text-red-500">Error: {error.message}</p>
      )}

      <div className="space-y-4">
        {data?.proposalCreateds?.nodes?.map((proposal, index) => (
          <Proposal
            key={index}
            proposal={proposal}
            currentBlock={currentBlock}
          />
        ))}
      </div>

      <div className="flex justify-center space-x-4 mt-6">
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
  );
}
