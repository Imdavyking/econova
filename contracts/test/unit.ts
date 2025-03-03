import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import hre from "hardhat"
import { ethers, network } from "hardhat"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import { charityCategories } from "../utils/charity.categories"
import { StandardMerkleTree } from "@openzeppelin/merkle-tree"
import { HexString } from "@openzeppelin/merkle-tree/dist/bytes"
import { localHardhat } from "../utils/localhardhat.chainid"
import {
    ADDRESS_ZERO,
    ETH_ADDRESS,
    MIN_DELAY,
    PROPOSAL_DESCRIPTION,
    PROPOSAL_THRESHOLD,
    QUORUM_PERCENTAGE,
    VOTING_DELAY,
    VOTING_PERIOD,
} from "../utils/constants"
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"
import exp from "constants"

dotenv.config()

const chainId = network.config.chainId

typeof chainId !== "undefined" && !localHardhat.includes(chainId)
    ? describe.skip
    : describe("EcoNovaDeployer", function () {
          // We define a fixture to reuse the same setup in every test.
          // We use loadFixture to run this setup once, snapshot that state,
          // and reset Hardhat Network to that snapshot in every test.
          async function deployEcoNovaDeployerFixture() {
              // Contracts are deployed using the first signer/account by default
              const [owner, otherAccount] = await hre.ethers.getSigners()

              const EcoNovaDeployer = await hre.ethers.getContractFactory("EcoNovaManager")
              const EcoNovaCourseNFTDeployer = await hre.ethers.getContractFactory(
                  "EcoNovaCourseNFT"
              )
              const CharityDeployer = await hre.ethers.getContractFactory("Charity")
              const MockPythPriceFeed = await hre.ethers.getContractFactory("MockPythPriceFeed")
              const EndpointV2Mock = await hre.ethers.getContractFactory("EndpointV2Mock")
              const Groth16Verifier = await hre.ethers.getContractFactory("Groth16Verifier")
              const TimeLock = await hre.ethers.getContractFactory("TimeLock")
              const EcoNovaGovernor = await hre.ethers.getContractFactory("EcoNovaGovernor")
              const timeLockDeployer = await TimeLock.deploy(MIN_DELAY, [], [], owner.address)

              const charityDeployer = await CharityDeployer.deploy(
                  charityCategories.Education,
                  timeLockDeployer
              )
              const mockPythPriceFeedDeployer = await MockPythPriceFeed.deploy()
              const endpointV2Mock = await EndpointV2Mock.deploy(1)
              const groth16Deployer = await Groth16Verifier.deploy()

              const ecoNDeployer = await EcoNovaDeployer.deploy(
                  mockPythPriceFeedDeployer,
                  owner,
                  [charityDeployer],
                  groth16Deployer,
                  endpointV2Mock
              )

              const ecoNovaCourseNFTDeployer = await EcoNovaCourseNFTDeployer.deploy(owner)

              const ecoNDeployerAddress = await ecoNDeployer.getAddress()

              const ecoNovaTokenAddress = await ecoNDeployer.i_ecoNovaToken()

              const ecoNovaGovernorDeployer = await EcoNovaGovernor.deploy(
                  ecoNovaTokenAddress,
                  timeLockDeployer,
                  QUORUM_PERCENTAGE,
                  VOTING_PERIOD,
                  VOTING_DELAY,
                  PROPOSAL_THRESHOLD
              )

              const proposerRole = await timeLockDeployer.PROPOSER_ROLE()
              const executorRole = await timeLockDeployer.EXECUTOR_ROLE()
              const adminRole = await timeLockDeployer.DEFAULT_ADMIN_ROLE()

              const proposerTx = await timeLockDeployer.grantRole(
                  proposerRole,
                  ecoNovaGovernorDeployer
              )
              await proposerTx.wait(1)
              const executorTx = await timeLockDeployer.grantRole(executorRole, ADDRESS_ZERO)
              await executorTx.wait(1)
              const revokeTx = await timeLockDeployer.revokeRole(adminRole, owner)
              await revokeTx.wait(1)

              const abiPath = path.resolve(
                  __dirname,
                  "../artifacts/contracts/EcoNovaToken.sol/EcoNovaToken.json"
              )

              const ecoNovaInfo = JSON.parse(fs.readFileSync(abiPath, "utf-8"))

              const ecoNovaToken = new ethers.Contract(ecoNovaTokenAddress, ecoNovaInfo.abi, owner)
              const testCharityOrganization = "0xefb85BCDfB03e9299a680993aB35194aCb8DaDda"

              return {
                  ecoNDeployer,
                  ecoNovaToken,
                  owner,
                  otherAccount,
                  mockPythPriceFeedDeployer,
                  ecoNDeployerAddress,
                  charityDeployer,
                  ecoNovaCourseNFTDeployer,
                  ecoNovaGovernorDeployer,
                  testCharityOrganization,
              }
          }

          describe("Deployment", function () {
              it("Should create a ERC20 token", async function () {
                  const { ecoNovaToken } = await loadFixture(deployEcoNovaDeployerFixture)

                  expect(await ecoNovaToken.name()).to.equal("EcoNovaToken")
                  expect(await ecoNovaToken.symbol()).to.equal("ENT")
                  expect(await ecoNovaToken.decimals()).to.equal(18)
              })
          })

          describe("CharityGovernance", function () {
              describe("Validations", function () {
                  it("Can only add or remove charity organization through governance", async function () {
                      const { charityDeployer, testCharityOrganization } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )
                      await expect(
                          charityDeployer.addOrganization(testCharityOrganization)
                      ).to.be.revertedWithCustomError(charityDeployer, "Charity__OnlyGovernor()")

                      await expect(
                          charityDeployer.removeOrganization(testCharityOrganization)
                      ).to.be.revertedWithCustomError(charityDeployer, "Charity__OnlyGovernor()")
                  })

                  it("proposes, votes, waits, queues, and then executes", async () => {
                      const {
                          charityDeployer,
                          testCharityOrganization,
                          ecoNovaGovernorDeployer,
                          ecoNovaToken,
                          owner,
                      } = await loadFixture(deployEcoNovaDeployerFixture)

                      let voterBalance = await ecoNovaToken.balanceOf(owner.address)

                      expect(voterBalance).to.equal(0)

                      const tokenMint = 10 * 10 ** 18

                      const mintTx = await ecoNovaToken.localMint(
                          owner.address,
                          tokenMint.toString()
                      )

                      await mintTx.wait(1)

                      voterBalance = await ecoNovaToken.balanceOf(owner.address)

                      expect(voterBalance).to.equal(tokenMint.toString())

                      const delegateUser = await ecoNovaToken.delegate(owner.address)
                      await delegateUser.wait(1)

                      // propose
                      const encodedFunctionCall = charityDeployer.interface.encodeFunctionData(
                          "addOrganization",
                          [testCharityOrganization]
                      )

                      let organizationExist = await charityDeployer.organizationExists(
                          testCharityOrganization
                      )
                      expect(organizationExist).to.equal(false)
                      const proposeTx = await ecoNovaGovernorDeployer.propose(
                          [charityDeployer],
                          [0],
                          [encodedFunctionCall],
                          PROPOSAL_DESCRIPTION
                      )
                      const proposeReceipt = await proposeTx.wait(1)
                      const logs = proposeReceipt?.logs[0] as any

                      const proposalId = logs.args.at(0)

                      let proposalState = await ecoNovaGovernorDeployer.state(proposalId)

                      expect(proposalState).to.equal(0)
                      await moveBlocks(VOTING_DELAY + 1)
                      // vote
                      const voteWay = 1 // for (1) against (0) abstain (2)
                      const reason = "Organization is a good fit for the charity category"

                      const voteTx = await ecoNovaGovernorDeployer.castVoteWithReason(
                          proposalId,
                          voteWay,
                          reason
                      )
                      await voteTx.wait(1)

                      proposalState = await ecoNovaGovernorDeployer.state(proposalId)

                      expect(proposalState).to.equal(1)
                      await moveBlocks(VOTING_PERIOD + 1)

                      // queue & execute

                      const descriptionHash = ethers.id(PROPOSAL_DESCRIPTION)
                      proposalState = await ecoNovaGovernorDeployer.state(proposalId)

                      expect(proposalState).to.equal(4)

                      const queueTx = await ecoNovaGovernorDeployer.queue(
                          [charityDeployer],
                          [0],
                          [encodedFunctionCall],
                          descriptionHash
                      )
                      await queueTx.wait(1)
                      await moveTime(MIN_DELAY + 1)
                      await moveBlocks(1)
                      proposalState = await ecoNovaGovernorDeployer.state(proposalId)
                      expect(proposalState).to.equal(5)

                      const exTx = await ecoNovaGovernorDeployer.execute(
                          [charityDeployer],
                          [0],
                          [encodedFunctionCall],
                          descriptionHash
                      )
                      await exTx.wait(1)

                      organizationExist = await charityDeployer.organizationExists(
                          testCharityOrganization
                      )
                      expect(organizationExist).to.equal(true)
                  })
              })
          })

          describe("NFTCourse", function () {
              describe("Validations", function () {
                  it("Can update root with correct signature.", async function () {
                      const { ecoNovaCourseNFTDeployer, otherAccount, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const level = 0

                      const coursemessageHash = ethers.solidityPackedKeccak256(["uint8"], [level])

                      const courseSignedMessageHash = ethers.hashMessage(
                          ethers.getBytes(coursemessageHash)
                      )

                      const courseSignature = await otherAccount.signMessage(
                          ethers.getBytes(coursemessageHash)
                      )

                      const address = ethers.recoverAddress(
                          courseSignedMessageHash,
                          courseSignature
                      )

                      const allValues = [
                          [owner.address, level],
                          [otherAccount.address, level],
                      ]

                      const tree = StandardMerkleTree.of(allValues, ["address", "uint8"])
                      const root = tree.root
                      const tokenURL = "ipfs://"
                      let proof: HexString[] = []

                      for (const [i, v] of tree.entries()) {
                          if (v[0] === otherAccount.address && v[1] === level) {
                              proof = tree.getProof(i)
                              break
                          }
                      }

                      const timestamp = Math.floor(Date.now() / 1000)

                      const ethSignedMessageproofHash = ethers.solidityPackedKeccak256(
                          ["address", "uint8", "bytes32", "uint256", "uint256"],
                          [address, level, root, chainId, timestamp]
                      )

                      const verified = StandardMerkleTree.verify(
                          root,
                          ["address", "uint8"],
                          [otherAccount.address, level],
                          proof
                      )

                      const botSignedMessage = ethers.hashMessage(
                          ethers.getBytes(ethSignedMessageproofHash)
                      )

                      const botSignature = await owner.signMessage(
                          ethers.getBytes(ethSignedMessageproofHash)
                      )

                      const botAddress = ethers.recoverAddress(botSignedMessage, botSignature)

                      const ownerShipTx = await ecoNovaCourseNFTDeployer.updateBotAddress(owner)
                      await ownerShipTx.wait(1)

                      const tx = await ecoNovaCourseNFTDeployer
                          .connect(otherAccount)
                          .updateRoot(level, root, timestamp, botSignature)

                      await tx.wait(1)

                      const getRoot = await ecoNovaCourseNFTDeployer.merkleRoots(level)

                      const hasClaimedBefore = await ecoNovaCourseNFTDeployer.hasClaimedNFT(
                          otherAccount.address,
                          level
                      )

                      const claimUserNFT = await ecoNovaCourseNFTDeployer
                          .connect(otherAccount)
                          .claimNFT(level, proof, tokenURL)

                      await claimUserNFT.wait(1)

                      const hasClaimedAfter = await ecoNovaCourseNFTDeployer.hasClaimedNFT(
                          otherAccount.address,
                          level
                      )

                      expect(getRoot).to.equal(root)
                      expect(address).to.equal(otherAccount.address)
                      expect(botAddress).to.equal(owner.address)
                      expect(verified).to.equal(true)
                      expect(hasClaimedBefore).to.equal(false)
                      expect(hasClaimedAfter).to.equal(true)
                  })

                  it("Can not update root with expired signature.", async function () {
                      const { ecoNovaCourseNFTDeployer, otherAccount, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const level = 0

                      const coursemessageHash = ethers.solidityPackedKeccak256(["uint8"], [level])

                      const courseSignedMessageHash = ethers.hashMessage(
                          ethers.getBytes(coursemessageHash)
                      )

                      const courseSignature = await otherAccount.signMessage(
                          ethers.getBytes(coursemessageHash)
                      )

                      const address = ethers.recoverAddress(
                          courseSignedMessageHash,
                          courseSignature
                      )

                      const allValues = [
                          [owner.address, level],
                          [otherAccount.address, level],
                      ]

                      const tree = StandardMerkleTree.of(allValues, ["address", "uint8"])
                      const root = tree.root
                      let proof: HexString[] = []

                      for (const [i, v] of tree.entries()) {
                          if (v[0] === otherAccount.address && v[1] === level) {
                              proof = tree.getProof(i)
                              break
                          }
                      }

                      const timestamp = Math.floor(Date.now() / 1000)

                      const ethSignedMessageproofHash = ethers.solidityPackedKeccak256(
                          ["address", "uint8", "bytes32", "uint256", "uint256"],
                          [address, level, root, chainId, timestamp]
                      )

                      const botSignature = await owner.signMessage(
                          ethers.getBytes(ethSignedMessageproofHash)
                      )

                      const ownerShipTx = await ecoNovaCourseNFTDeployer.updateBotAddress(owner)
                      await ownerShipTx.wait(1)

                      const expiryTime = await ecoNovaCourseNFTDeployer.TIMESTAMP_EXPIRY()

                      await time.increaseTo(timestamp + Number(expiryTime) + 1)

                      await expect(
                          ecoNovaCourseNFTDeployer
                              .connect(otherAccount)
                              .updateRoot(level, root, timestamp, botSignature)
                      ).to.be.revertedWithCustomError(
                          ecoNovaCourseNFTDeployer,
                          "EcoNovaCourseNFT__ExpiredSignature"
                      )
                  })
              })

              describe("Events", function () {
                  it("Should emit an event on on root updated ", async function () {
                      const { ecoNovaCourseNFTDeployer, otherAccount, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const level = 0

                      const coursemessageHash = ethers.solidityPackedKeccak256(["uint8"], [level])

                      const courseSignedMessageHash = ethers.hashMessage(
                          ethers.getBytes(coursemessageHash)
                      )

                      const courseSignature = await otherAccount.signMessage(
                          ethers.getBytes(coursemessageHash)
                      )

                      const address = ethers.recoverAddress(
                          courseSignedMessageHash,
                          courseSignature
                      )

                      const allValues = [
                          [owner.address, level],
                          [otherAccount.address, level],
                      ]

                      const tree = StandardMerkleTree.of(allValues, ["address", "uint8"])
                      const root = tree.root
                      const tokenURL = "ipfs://"
                      let proof: HexString[] = []

                      for (const [i, v] of tree.entries()) {
                          if (v[0] === otherAccount.address && v[1] === level) {
                              proof = tree.getProof(i)
                              break
                          }
                      }

                      const timestamp = Math.floor(Date.now() / 1000)

                      const ethSignedMessageproofHash = ethers.solidityPackedKeccak256(
                          ["address", "uint8", "bytes32", "uint256", "uint256"],
                          [address, level, root, chainId, timestamp]
                      )

                      const botSignature = await owner.signMessage(
                          ethers.getBytes(ethSignedMessageproofHash)
                      )

                      const ownerShipTx = await ecoNovaCourseNFTDeployer.updateBotAddress(owner)
                      await ownerShipTx.wait(1)

                      await expect(
                          ecoNovaCourseNFTDeployer
                              .connect(otherAccount)
                              .updateRoot(level, root, timestamp, botSignature)
                      )
                          .to.emit(ecoNovaCourseNFTDeployer, "RootUpdated")
                          .withArgs(level, root)

                      await expect(
                          ecoNovaCourseNFTDeployer
                              .connect(otherAccount)
                              .claimNFT(level, proof, tokenURL)
                      )
                          .to.emit(ecoNovaCourseNFTDeployer, "NFTClaimed")
                          .withArgs(otherAccount, level, 1)

                      await expect(ecoNovaCourseNFTDeployer.updateBotAddress(owner))
                          .to.emit(ecoNovaCourseNFTDeployer, "BotAddressUpdated")
                          .withArgs(owner, owner)

                      await expect(
                          ecoNovaCourseNFTDeployer
                              .connect(otherAccount)
                              .updateRoot(level, root, timestamp, botSignature)
                      ).to.be.revertedWithCustomError(
                          ecoNovaCourseNFTDeployer,
                          "EcoNovaCourseNFT__SignatureAlreadyUsed"
                      )

                      await expect(
                          ecoNovaCourseNFTDeployer
                              .connect(otherAccount)
                              .claimNFT(level, proof, tokenURL)
                      ).to.be.revertedWithCustomError(
                          ecoNovaCourseNFTDeployer,
                          "EcoNovaCourseNFT__NFTAlreadyClaimed"
                      )
                  })
              })
          })

          describe("Withdrawals", function () {
              describe("Validations", function () {
                  it("USD to token conversion is correct.", async function () {
                      const { mockPythPriceFeedDeployer } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const ethBytes = ethers.encodeBytes32String("ETH")

                      const result = await mockPythPriceFeedDeployer.getPriceNoOlderThan(
                          ethBytes,
                          60
                      )

                      expect(result[0]).to.equal(36871678n)
                      expect(result[2]).to.equal(-8n)
                  })

                  it("Can donate and withdraw accordingly.", async function () {
                      const { ecoNDeployer, charityDeployer, otherAccount } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const DOLLAR_AMOUNT = 10

                      const ethAmountToDonate = await ecoNDeployer.getUsdToTokenPrice(
                          ETH_ADDRESS,
                          DOLLAR_AMOUNT
                      )

                      const category = await charityDeployer.charityCategory()

                      await ecoNDeployer.donateToFoundation(category, ETH_ADDRESS, DOLLAR_AMOUNT, {
                          value: ethAmountToDonate,
                      })

                      await charityDeployer.withdrawToOrganization(ETH_ADDRESS, DOLLAR_AMOUNT, [
                          otherAccount,
                      ])
                  })
              })

              describe("Events", function () {
                  it("Can deploy token and emit the address", async function () {
                      const { ecoNDeployer } = await loadFixture(deployEcoNovaDeployerFixture)
                      const customToken = {
                          name: "Beta",
                          symbol: "BT",
                          initialSupply: 100000,
                      }
                      const tokenInfo = await ecoNDeployer.deployToken(
                          customToken.name,
                          customToken.symbol,
                          customToken.initialSupply
                      )

                      const receipt = await tokenInfo.wait(1)

                      if (!receipt) return

                      const event = receipt.logs[1] as any
                      const args = event.args as unknown as any[]

                      const [address, name, symbol, supply] = args

                      expect(name).to.equal(customToken.name)
                      expect(address).to.not.equal("")
                      expect(symbol).to.equal(customToken.symbol)
                      expect(supply).to.equal(customToken.initialSupply)
                  })

                  it("Should emit an event on donated", async function () {
                      const { ecoNDeployer, owner, charityDeployer } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const DOLLAR_AMOUNT = 10

                      const ethAmountToDonate = await ecoNDeployer.getUsdToTokenPrice(
                          ETH_ADDRESS,
                          DOLLAR_AMOUNT
                      )

                      const category = await charityDeployer.charityCategory()

                      await expect(
                          ecoNDeployer.donateToFoundation(category, ETH_ADDRESS, DOLLAR_AMOUNT, {
                              value: ethAmountToDonate,
                          })
                      )
                          .to.emit(ecoNDeployer, "Donated")
                          .withArgs(owner, ETH_ADDRESS, "271210873559917723", category)
                  })

                  it("Should emit an BMIRecorded event on bmi verify", async function () {
                      const { ecoNDeployer, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const ecoD = ecoNDeployer.checkBMIHealthy(
                          [
                              "20606638541072922061980428880724412480908269290138854078750983266247270498397",
                              "4672451083534101101597832021484554888189901911089965552618285519770622790931",
                          ],
                          [
                              [
                                  "16591371836046369082101798809051895293297518014895540262919917525466208670575",
                                  "4297016560857544825984867378256335957562038908290277969518564658450810758958",
                              ],
                              [
                                  "877062026622333165730181566302122034682188148884094488712779314966298240515",
                                  "10035002646655856374128822531335377239491785149066640510768304671780887993830",
                              ],
                          ],
                          [
                              "3816844612412909560289070152002134674862700669878787340781696546457876357565",
                              "5942731572393451414117325646745711737508576984550362617110023419428425319555",
                          ],
                          ["1", "1"]
                      )

                      await expect(ecoD).to.emit(ecoNDeployer, "BMIRecorded").withArgs(owner, true)
                  })
                  it("Should emit an event on withdraw", async function () {
                      const { ecoNDeployer, charityDeployer, otherAccount } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const DOLLAR_AMOUNT = 10

                      const ethAmountToDonate = await ecoNDeployer.getUsdToTokenPrice(
                          ETH_ADDRESS,
                          DOLLAR_AMOUNT
                      )

                      const category = await charityDeployer.charityCategory()

                      await ecoNDeployer.donateToFoundation(category, ETH_ADDRESS, DOLLAR_AMOUNT, {
                          value: ethAmountToDonate,
                      })

                      await expect(
                          charityDeployer.withdrawToOrganization(ETH_ADDRESS, ethAmountToDonate, [
                              otherAccount,
                          ])
                      )
                          .to.emit(charityDeployer, "DonationWithdrawn")
                          .withArgs(otherAccount, ETH_ADDRESS, ethAmountToDonate)
                  })
              })

              describe("Transfers", function () {
                  it("Can donate with ether change.", async function () {
                      const { ecoNDeployer, owner, charityDeployer } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const DOLLAR_AMOUNT = 10

                      const ethAmountToDonate = await ecoNDeployer.getUsdToTokenPrice(
                          ETH_ADDRESS,
                          DOLLAR_AMOUNT
                      )

                      const category = await charityDeployer.charityCategory()
                      await expect(
                          ecoNDeployer.donateToFoundation(category, ETH_ADDRESS, DOLLAR_AMOUNT, {
                              value: ethAmountToDonate,
                          })
                      ).to.changeEtherBalances(
                          [owner, charityDeployer],
                          ["-271210873559917723", "271210873559917723"]
                      )
                  })
                  it("Can withdraw with ether change.", async function () {
                      const { ecoNDeployer, charityDeployer, otherAccount } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const DOLLAR_AMOUNT = 10

                      const ethAmountToDonate = await ecoNDeployer.getUsdToTokenPrice(
                          ETH_ADDRESS,
                          DOLLAR_AMOUNT
                      )

                      const category = await charityDeployer.charityCategory()

                      await ecoNDeployer.donateToFoundation(category, ETH_ADDRESS, DOLLAR_AMOUNT, {
                          value: ethAmountToDonate,
                      })

                      await expect(
                          charityDeployer.withdrawToOrganization(ETH_ADDRESS, ethAmountToDonate, [
                              otherAccount,
                          ])
                      ).to.changeEtherBalances(
                          [charityDeployer, otherAccount],
                          ["-271210873559917723", "271210873559917723"]
                      )
                  })
                  it("Can sign twitter points and redeem the points for tokens", async function () {
                      const { ecoNDeployer, otherAccount, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      await ecoNDeployer.updateBotAddress(owner)
                      const tweetId = "1883184787340349875"
                      const userTwitterId = "1881029537191919616"
                      const points = 100

                      const messageHash = ethers.solidityPackedKeccak256(
                          ["address", "uint256", "uint256", "uint256", "uint256"],
                          [otherAccount.address, points, userTwitterId, tweetId, chainId]
                      )

                      const ethSignedMessageHash = ethers.hashMessage(ethers.getBytes(messageHash))

                      const signature = await owner.signMessage(ethers.getBytes(messageHash))

                      const addressThatSign = ethers.recoverAddress(
                          ethSignedMessageHash,
                          signature
                      )

                      const botAddress = await ecoNDeployer.botAddress()

                      const hash = await ecoNDeployer
                          .connect(otherAccount)
                          .testHash(points, userTwitterId, tweetId, signature)

                      await expect(
                          ecoNDeployer.addPointsFromTwitterBot(
                              points,
                              userTwitterId,
                              tweetId,

                              signature
                          )
                      ).to.be.revertedWithCustomError(
                          ecoNDeployer,
                          "EcoNovaManager__InvalidSignature"
                      )

                      await ecoNDeployer.connect(otherAccount).addPointsFromTwitterBot(
                          points,
                          userTwitterId,
                          tweetId,

                          signature
                      )

                      const userPoint = await ecoNDeployer.userPoints(otherAccount)

                      expect(Number(userPoint[0])).to.equal(3500)

                      await expect(
                          ecoNDeployer.connect(otherAccount).addPointsFromTwitterBot(
                              points,
                              userTwitterId,
                              tweetId,

                              signature
                          )
                      ).to.be.revertedWithCustomError(
                          ecoNDeployer,
                          "EcoNovaManager__TweetIdAlreadyRecorderForUser"
                      )

                      expect(hash).to.equal(ethSignedMessageHash)
                      expect(botAddress).to.equal(owner)
                      expect(addressThatSign).to.equal(owner)
                  })
              })
          })
      })
