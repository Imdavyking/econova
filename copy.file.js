import fs from "fs";
import path from "path";

async function copyFile(source, destination) {
  try {
    const __dirname = path.resolve(path.dirname(""));
    const sourcePath = path.join(__dirname, source);
    const destinationPath = path.join(__dirname, destination);

    fs.copyFileSync(sourcePath, destinationPath);
    console.log(
      `File copied successfully from ${sourcePath} to ${destinationPath}`
    );
  } catch (err) {
    console.error("Error copying file:", err);
  }
}

copyFile("README.md", "documentation/docs/intro.md");
copyFile("frontend/README.md", "documentation/docs/Tutorial/frontend.md");
copyFile("backend/README.md", "documentation/docs/Tutorial/backend.md");
copyFile("indexer/README.md", "documentation/docs/Tutorial/indexer.md");
copyFile("contracts/README.md", "documentation/docs/Tutorial/contracts.md");
copyFile("robot/README.md", "documentation/docs/Tutorial/robot.md");
copyFile("private/README.md", "documentation/docs/Tutorial/private.md");
