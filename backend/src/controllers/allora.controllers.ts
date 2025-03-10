import { fetchInferenceByTopicID } from "../services/allora.services";
import { Request, Response } from "express";

export const getPriceInference = async (req: Request, res: Response) => {
  try {
    const { topicId, topicName } = req.query;
    if (!topicId) {
      res.status(400).json({ error: "Missing topic ID" });
      return;
    }

    if (!topicName) {
      res.status(400).json({ error: "Missing topic name" });
      return;
    }
    const inference = await fetchInferenceByTopicID(
      topicName as string,
      +topicId
    );
    res.json({ data: inference });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
