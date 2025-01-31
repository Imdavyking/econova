import path from "path";
import fs from "fs";

export const cleanDB = () => {
  try {
    const ignitionDeployments = path.join(process.cwd(), ".data");
    if (fs.existsSync(ignitionDeployments)) {
      console.log(`🗑️ Deleting folder: ${ignitionDeployments}`);
      fs.rmSync(ignitionDeployments, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Error cleaning the database", error);
  }
};
