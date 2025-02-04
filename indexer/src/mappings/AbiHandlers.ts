import assert from "assert";
import {
  CharityAddedLog,
  DonatedLog,
  OwnershipTransferredLog,
  PointsAddedLog,
  PointsRedeemedLog,
  SetOracleLog,
} from "../types/abi-interfaces/Abi";

import {
  Donation,
  PointsAdded,
  PointsRedeemed,
  OrocleUpdate,
  OwnershipTransfer,
  CharityAdded,
} from "../types";

export async function handleDonatedAbiLog(log: DonatedLog): Promise<void> {
  logger.info(`New Donation transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = Donation.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    user: log.args.user,
    charityCategory: BigInt(log.args.charityCategory),
    token: log.args.token,
    amount: log.args.amount.toBigInt(),
    contractAddress: log.address,
  });

  await transaction.save();
}
export async function handleCharityAddedAbiLog(
  log: CharityAddedLog
): Promise<void> {
  logger.info(`New Donation transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = CharityAdded.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    charityAddress: log.args.charityAddress,
    charityCategory: BigInt(log.args.charityCategory),
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handleOwnershipTransferredAbiLog(
  log: OwnershipTransferredLog
): Promise<void> {
  logger.info(`New Donation transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = OwnershipTransfer.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    previousOwner: log.args.previousOwner,
    newOwner: log.args.newOwner,
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handlePointsAddedAbiLog(
  log: PointsAddedLog
): Promise<void> {
  logger.info(`New PointsAdded transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const userAddress = log.args.user;

  const user = await PointsAdded.getByUser(userAddress, {
    orderDirection: "ASC",
    limit: 1,
  });

  if (user.length > 0) {
    await PointsAdded.remove(user[0].id);
  }

  const transaction = PointsAdded.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    user: log.args.user,
    points: log.args.points.toBigInt(),
    updatedTimeStamp: log.block.timestamp,
    createdTimeStamp: log.block.timestamp,
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handlePointsRedeemedAbiLog(
  log: PointsRedeemedLog
): Promise<void> {
  logger.info(`New PointsRedeemed transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = PointsRedeemed.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    user: log.args.user,
    points: log.args.points.toBigInt(),
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handleSetOracleAbiLog(log: SetOracleLog): Promise<void> {
  logger.info(`New OrocleUpdate transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = OrocleUpdate.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    newOrocle: log.args.newOrocle,
    oldOrocle: log.args.oldOrocle,
    contractAddress: log.address,
  });

  await transaction.save();
}
