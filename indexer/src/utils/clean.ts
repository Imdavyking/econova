import path from "path";
import fs from "fs";

export const cleanDB = () => {
  const ignitionDeployments = path.join(process.cwd(), ".data");
  console.log({ ignitionDeployments });
  if (fs.existsSync(ignitionDeployments)) {
    console.log(`🗑️ Deleting folder: ${ignitionDeployments}`);
    fs.rmSync(ignitionDeployments, { recursive: true, force: true });
  }
};
