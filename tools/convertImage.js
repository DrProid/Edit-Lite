import inquirer from "inquirer";
import { spawn } from "child_process";
import {
  colour,
  getImagesInWorkingDirectory,
  promptForTargetFormat,
  promptForQuality,
  promptForResize,
  buildMagickArgs,
} from "./utils.js";

function runMagick(args) {
  return new Promise((resolve) => {
    const proc = spawn("magick", args, {
      stdio: ["inherit", "inherit", "inherit"],
      shell: true,
      cwd: "./working_directory",
    });
    proc.on("close", (code) => resolve(code));
  });
}

export default async function convertImage() {
  const dir = "./working_directory";

  const images = getImagesInWorkingDirectory(dir);
  if (images.length === 0) {
    console.log("No images found in ./working_directory");
    return;
  }

  const { chosen } = await inquirer.prompt([
    {
      type: "list",
      name: "chosen",
      message: "Select an image to convert:",
      choices: images,
    },
  ]);

  const targetFormat = await promptForTargetFormat();
  const quality = await promptForQuality(targetFormat);
  const dimensions = await promptForResize();

  const { args } = buildMagickArgs({ chosen, targetFormat, quality, dimensions });

  console.log("Running: magick", args.join(" "));

  const code = await runMagick(args);
  if (code === 0) {
    console.log(colour.green("magick finished successfully!"));
  } else {
    console.log(colour.red(`magick exited with code ${code}`));
  }
}
