import { fetchInferenceByTopicID } from "../services/allora.services";
import { Request, Response } from "express";

export const getPriceInference = async (req: Request, res: Response) => {
  const { topicId, topicName } = req.query;
  if (!topicId || !topicName) {
    res.status(400).json({ error: "Missing topic ID or topic name" });
    return;
  }
  const inference = await fetchInferenceByTopicID(
    topicName as string,
    +topicId
  );
  res.json({ data: inference });
};
