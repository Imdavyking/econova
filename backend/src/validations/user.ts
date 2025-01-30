import Joi from "joi";
import express, { Application, Request, Response, NextFunction } from "express";
export const createTweetsSchema = Joi.object({
  text: Joi.string().required(),
  id: Joi.string().required(),
  edit_history_tweet_ids: Joi.array<string>().required(),
});

export const validateTweet = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const { error } = createTweetsSchema.validate(req.body);
  if (error) {
    error.isJoi = true; // Mark this as a Joi validation error
    return next(error);
  }
  next();
};
