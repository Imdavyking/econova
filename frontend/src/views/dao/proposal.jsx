const ProposalState = {
  0: "Pending",
  1: "Active",
  2: "Canceled",
  3: "Defeated",
  4: "Succeeded",
  5: "Queued",
  6: "Expired",
  7: "Executed",
};
export default function Proposal({ proposal }) {
  const { id, description, state, proposer } = proposal;
  return (
    <div key={id} className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">{description}</h2>
      <p className="text-sm text-gray-400">Proposed by: {proposer}</p>
      <p className="text-sm text-gray-400">
        State: {ProposalState[state] || "Unknown"}
      </p>
    </div>
  );
}
