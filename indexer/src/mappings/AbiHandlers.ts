import assert from "assert";
import {
  DonatedLog,
  OwnershipTransferredLog,
  PointsAddedLog,
  PointsRedeemedLog,
  SetOrocleLog,
  WithdrawDonationTransaction,
} from "../types/abi-interfaces/Abi";

import {
  Donation,
  PointsAdded,
  PointsRedeemed,
  OrocleUpdate,
  OwnershipTransfer,
  WithdrawDonation,
} from "../types";

export async function handleWithdrawDonationAbiTx(
  tx: WithdrawDonationTransaction
): Promise<void> {
  logger.info(`New Withdraw Donation transaction at block ${tx.blockNumber}`);
  assert(tx.args, "No tx.args");

  const transaction = WithdrawDonation.create({
    id: tx.hash,
    user: tx.from,
    token: tx.args[0],
    blockHeight: BigInt(tx.blockNumber),
    amount: BigInt(tx.args[1].toString()),
    contractAddress: tx.to || "",
  });

  await transaction.save();
}

export async function handleDonatedAbiLog(log: DonatedLog): Promise<void> {
  logger.info(`New Donation transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = Donation.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    user: log.args.user,
    token: log.args.token,
    amount: log.args.amount.toBigInt(),
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

export async function handleSetOrocleAbiLog(log: SetOrocleLog): Promise<void> {
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
