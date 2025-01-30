import { PointsAdded, AddPointFromWeight } from "../types";
import {
  AddPointFromWeightTransaction,
  PointsAddedLog,
} from "../types/abi-interfaces/EconovaAbi";
import assert from "assert";

export async function handleLog(log: PointsAddedLog): Promise<void> {
  logger.info(`New point added transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = PointsAdded.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    user: log.args.user,
    points: String(log.args.points),
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handleTransaction(
  tx: AddPointFromWeightTransaction
): Promise<void> {
  logger.info(`New AddPointFromWeight Transaction at block ${tx.blockNumber}`);
  assert(tx.args, "No tx.args");

  const approval = AddPointFromWeight.create({
    id: tx.hash,
    weightInGrams: await tx.args[0].toString(),
    contractAddress: tx.to || "",
  });

  await approval.save();
}
