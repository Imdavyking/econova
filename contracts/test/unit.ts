import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import hre from "hardhat"
import { ethers, network } from "hardhat"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import { ETH_ADDRESS } from "../hardhat.config"
import exp from "constants"
dotenv.config()

const chainId = network.config.chainId

chainId !== 31337
    ? describe.skip
    : describe("EcoNovaDeployer", function () {
          // We define a fixture to reuse the same setup in every test.
          // We use loadFixture to run this setup once, snapshot that state,
          // and reset Hardhat Network to that snapshot in every test.
          async function deployEcoNovaDeployerFixture() {
              // Contracts are deployed using the first signer/account by default
              const [owner, otherAccount] = await hre.ethers.getSigners()

              const botPrivateKey = process.env.PRIVATE_KEY!

              const wallet = new ethers.Wallet(botPrivateKey)

              const EcoNovaDeployer = await hre.ethers.getContractFactory("EcoNovaManager")

              const MockOracleAggregator = await hre.ethers.getContractFactory(
                  "MockOracleAggregator"
              )
              const mockOracleDeployer = await MockOracleAggregator.deploy()
              const oracleAddress = await mockOracleDeployer.getAddress()

              const ecoNDeployer = await EcoNovaDeployer.deploy(oracleAddress, wallet.address)

              const ecoNDeployerAddress = await ecoNDeployer.getAddress()

              const ecoNovaTokenAddress = await ecoNDeployer.i_ecoNovaToken()

              const abiPath = path.resolve(
                  __dirname,
                  "../artifacts/contracts/EcoNovaToken.sol/EcoNovaToken.json"
              )

              const ecoNovaInfo = JSON.parse(fs.readFileSync(abiPath, "utf-8"))

              const ecoNovaToken = new ethers.Contract(ecoNovaTokenAddress, ecoNovaInfo.abi, owner)

              return {
                  ecoNDeployer,
                  ecoNovaToken,
                  owner,
                  otherAccount,
                  mockOracleDeployer,
                  ecoNDeployerAddress,
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

          describe("Withdrawals", function () {
              describe("Validations", function () {
                  it("Can add points based on waste weight.", async function () {
                      const { ecoNDeployer, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      await ecoNDeployer.addPointFromWeight(100)
                      const userPoint = await ecoNDeployer.userPoints(owner.address)
                      expect(Number(userPoint[0])).to.equal(3500)
                  })
                  it("Can withdraw points based on point gained.", async function () {
                      const { ecoNDeployer, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      await ecoNDeployer.addPointFromWeight(100)
                      await ecoNDeployer.redeemCode(100)

                      const userPoint = await ecoNDeployer.userPoints(owner.address)

                      expect(Number(userPoint[0])).to.equal(3400)
                  })
                  it("USD to token conversion is correct.", async function () {
                      const { mockOracleDeployer } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const ethBytes20 = ethers.encodeBytes32String("ETH").slice(0, 42)

                      const result = await mockOracleDeployer.getLatestData(1, ethBytes20)
                      expect(result).to.equal(3100000000000000000000n)
                  })

                  it("Can donate and withdraw accordingly.", async function () {
                      const { ecoNDeployer } = await loadFixture(deployEcoNovaDeployerFixture)

                      const DOLLAR_AMOUNT = 10

                      const ethAmountToDonate = await ecoNDeployer.getUsdToTokenPrice(
                          ETH_ADDRESS,
                          DOLLAR_AMOUNT
                      )

                      await ecoNDeployer.donateToFoundation(ETH_ADDRESS, DOLLAR_AMOUNT, {
                          value: ethAmountToDonate,
                      })

                      await ecoNDeployer.withdrawDonation(ETH_ADDRESS, DOLLAR_AMOUNT)
                  })
              })

              describe("Events", function () {
                  it("Should emit an event on points added", async function () {
                      const { ecoNDeployer, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      await expect(ecoNDeployer.addPointFromWeight(100))
                          .to.emit(ecoNDeployer, "PointsAdded")
                          .withArgs(owner.address, 3500)
                  })
                  it("Should emit an event on redeem code", async function () {
                      const { ecoNDeployer, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      await ecoNDeployer.addPointFromWeight(100)

                      await expect(ecoNDeployer.redeemCode(100))
                          .to.emit(ecoNDeployer, "PointsRedeemed")
                          .withArgs(owner.address, 100)
                  })
                  it("Should emit an event on donated", async function () {
                      const { ecoNDeployer, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const DOLLAR_AMOUNT = 10

                      const ethAmountToDonate = await ecoNDeployer.getUsdToTokenPrice(
                          ETH_ADDRESS,
                          DOLLAR_AMOUNT
                      )

                      await expect(
                          ecoNDeployer.donateToFoundation(ETH_ADDRESS, DOLLAR_AMOUNT, {
                              value: ethAmountToDonate,
                          })
                      )
                          .to.emit(ecoNDeployer, "Donated")
                          .withArgs(owner.address, ETH_ADDRESS, 32258064516129)
                  })

                  it("Should emit an event on withdraw", async function () {
                      const { ecoNDeployer, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const DOLLAR_AMOUNT = 10

                      const ethAmountToDonate = await ecoNDeployer.getUsdToTokenPrice(
                          ETH_ADDRESS,
                          DOLLAR_AMOUNT
                      )

                      await ecoNDeployer.donateToFoundation(ETH_ADDRESS, DOLLAR_AMOUNT, {
                          value: ethAmountToDonate,
                      })

                      await expect(ecoNDeployer.withdrawDonation(ETH_ADDRESS, ethAmountToDonate))
                          .to.emit(ecoNDeployer, "DonationWithdrawed")
                          .withArgs(owner.address, ETH_ADDRESS, ethAmountToDonate)
                  })
              })

              describe("Transfers", function () {
                  it("Should be able to redeem points with ERC20 balance change", async function () {
                      const { ecoNDeployer, ecoNovaToken, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      await ecoNDeployer.addPointFromWeight(100)
                      await ecoNDeployer.redeemCode(100)
                      await expect(ecoNDeployer.redeemCode(100)).to.changeTokenBalance(
                          ecoNovaToken,
                          owner,
                          "100000000000000000000"
                      )
                  })

                  it("Can donate with ether change.", async function () {
                      const { ecoNDeployer, owner, ecoNDeployerAddress } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const DOLLAR_AMOUNT = 10

                      const ethAmountToDonate = await ecoNDeployer.getUsdToTokenPrice(
                          ETH_ADDRESS,
                          DOLLAR_AMOUNT
                      )

                      await expect(
                          ecoNDeployer.donateToFoundation(ETH_ADDRESS, DOLLAR_AMOUNT, {
                              value: ethAmountToDonate,
                          })
                      ).to.changeEtherBalances(
                          [owner, ecoNDeployerAddress],
                          ["-32258064516129", "32258064516129"]
                      )
                  })
                  it("Can withdraw with ether change.", async function () {
                      const { ecoNDeployer, owner, ecoNDeployerAddress } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      const DOLLAR_AMOUNT = 10

                      const ethAmountToDonate = await ecoNDeployer.getUsdToTokenPrice(
                          ETH_ADDRESS,
                          DOLLAR_AMOUNT
                      )

                      await ecoNDeployer.donateToFoundation(ETH_ADDRESS, DOLLAR_AMOUNT, {
                          value: ethAmountToDonate,
                      })

                      await expect(
                          ecoNDeployer.withdrawDonation(ETH_ADDRESS, ethAmountToDonate)
                      ).to.changeEtherBalances(
                          [owner, ecoNDeployerAddress],
                          ["32258064516129", "-32258064516129"]
                      )
                  })
                  it("Can sign twitter points and redeem the points for tokens", async function () {
                      const { ecoNDeployer, otherAccount, owner } = await loadFixture(
                          deployEcoNovaDeployerFixture
                      )

                      await ecoNDeployer.updateBotAddress(owner.address)
                      const nonce = await ecoNDeployer.userNonce(otherAccount.address)

                      const points = 100
                      const messageHash = ethers.solidityPackedKeccak256(
                          ["address", "uint256", "uint256"],
                          [otherAccount.address, points, nonce]
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
                          .testHash(points, signature)

                      const result = await ecoNDeployer
                          .connect(otherAccount)
                          .addPointsFromTwitterBot(points, signature)

                      expect(hash).to.equal(ethSignedMessageHash)
                      expect(botAddress).to.equal(owner.address)
                      expect(addressThatSign).to.equal(owner.address)
                  })
              })
          })
      })
