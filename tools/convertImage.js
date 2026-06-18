import inquirer from "inquirer";
import {
  colour,
  getImagesInWorkingDirectory,
  promptForTargetFormat,
  promptForQuality,
  promptForResize,
  buildMagickArgs,
  runMagick,
} from "./utils.js";

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
