export const QUORUM_PERCENTAGE = 4 // Need 4% of voters to pass
export const MIN_DELAY = 3600 // 1 hour - after a vote passes, you have 1 hour before you can execute it
// sonic avg 3blocks per second
// 60 * 3 // 180 blocks per minute
// 180 * 60 // 10800 blocks per hour
export const VOTING_PERIOD = 10800 // 1 hour - How long a proposal vote is open for
export const VOTING_DELAY = 1 // 1 Block - How many blocks till a proposal vote becomes active
export const PROPOSAL_THRESHOLD = 1 // the user voting power needed to create a proposal (1 token)
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"
export const PROPOSAL_DESCRIPTION = "Proposal #1 Add this organization!"
export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
