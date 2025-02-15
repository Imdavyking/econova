import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"
import { ethers, network } from "hardhat"
import { NamedArtifactContractDeploymentFuture } from "@nomicfoundation/ignition-core"
import { charityCategories } from "../../utils/charity.categories"
import { localHardhat } from "../../utils/localhardhat.chainid"
import { LZ_ENDPOINTS } from "../../utils/lzendpoints.help"

dotenv.config()

// if (block.chainid == HARDHAT_CHAIN_ID) {
//     EndpointV2Mock mockV2Endpoint = new EndpointV2Mock(1);
//     _lzEndpoint = address(mockV2Endpoint);
// } else if (block.chainid == ETHEREUM_SEPOLIA_CHAIN_ID) {
//     _lzEndpoint = ETHEREUM_SEPOLIA_ENDPOINT_V2;
// } else if (block.chainid == ETHEREUM_MAINNET_CHAIN_ID) {
//     _lzEndpoint = ETHEREUM_MAINNET_ENDPOINT_V2;
// } else if (block.chainid == SONIC_BLAZE_CHAIN_ID) {
//     _lzEndpoint = SONIC_BLAZE_ENDPOINT_V2;
// } else if (block.chainid == SONIC_MAINNET_CHAIN_ID) {
//     _lzEndpoint = SONIC_MAINNET_ENDPOINT_V2;
// }

//     /** layerzero endpoints */
// address public constant SONIC_BLAZE_ENDPOINT_V2 =
// address(0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff);
// address public constant SONIC_MAINNET_ENDPOINT_V2 =
// address(0x6F475642a6e85809B1c36Fa62763669b1b48DD5B);
// address public constant ETHEREUM_MAINNET_ENDPOINT_V2 =
// address(0x1a44076050125825900e736c501f859c50fE728c);
// address public constant ETHEREUM_SEPOLIA_ENDPOINT_V2 =
// address(0x6EDCE65403992e310A62460808c4b910D972f10f);

// /** chain ids */
// uint256 public constant HARDHAT_CHAIN_ID = 31337;
// uint256 public constant ETHEREUM_MAINNET_CHAIN_ID = 1;
// uint256 public constant ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
// uint256 public constant SONIC_BLAZE_CHAIN_ID = 57054;
// uint256 public constant SONIC_MAINNET_CHAIN_ID = 146;
// /** eids for layerzero */
// uint256 public constant ETHEREUM_MAINNET_EID_V2 = 30101;
// uint256 public constant ETHEREUM_SEPOLIA_EID_V2 = 40161;
// uint256 public constant SONIC_MAINNET_EID_V2 = 30332;
// uint256 public constant SONIC_BLAZE_EID_V2 = 40349;
// /** eth token identifier */

const ecoNovaModule = buildModule("EcoNovaModule", (m) => {
    const chainId = network.config.chainId
    let oracle: NamedArtifactContractDeploymentFuture<"MockPythPriceFeed"> | string =
        process.env.ORACLE_ADDRESS!

    let lzEndPoint: NamedArtifactContractDeploymentFuture<"EndpointV2Mock"> | string =
        LZ_ENDPOINTS[+chainId!]

    const botPrivateKey = process.env.PRIVATE_KEY!
    const wallet = new ethers.Wallet(botPrivateKey)

    if (typeof chainId !== "undefined" && localHardhat.includes(chainId)) {
        oracle = m.contract("MockPythPriceFeed", [])
        lzEndPoint = m.contract("EndpointV2Mock", [1])
    }

    const charityContracts = []

    for (const categoryKey of Object.keys(
        charityCategories
    ) as (keyof typeof charityCategories)[]) {
        const category = charityCategories[categoryKey]

        charityContracts.push(m.contract(`Charity`, [category], { id: categoryKey }))
    }
    const groth16Verifier = m.contract("Groth16Verifier")
    const ecoNovaDeployer = m.contract("EcoNovaManager", [
        oracle,
        wallet.address,
        charityContracts,
        groth16Verifier,
        lzEndPoint,
    ])

    return { ecoNovaDeployer }
})

export default ecoNovaModule
