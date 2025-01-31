import { UserModel } from "../models/user";

export const saveUserTwitter = async (user: {
  userName: string;
  userId: string;
  userToken: string;
  userTokenSecret: string;
}) => {
  try {
    const existingUser = await UserModel.findOne({ userId: user.userId });

    if (!existingUser) {
      const newUser = new UserModel({
        userId: user.userId,
        userName: user.userName,
        userToken: user.userToken,
        userTokenSecret: user.userTokenSecret,
      });
      await newUser.save();
    } else {
      existingUser.userToken = user.userToken;
      existingUser.userTokenSecret = user.userTokenSecret;
      existingUser.userId = user.userId;
      existingUser.userName = user.userName;
      await existingUser.save();
    }
  } catch (error) {
    console.error("Error saving user to database:", error);
  }
};
