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

export default async function batchConvertImage() {
  const dir = "./working_directory";

  const images = getImagesInWorkingDirectory(dir);
  if (images.length === 0) {
    console.log("No images found in ./working_directory");
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Convert ${images.length} image(s) in ./working_directory?`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log("Batch conversion cancelled.");
    return;
  }

  const targetFormat = await promptForTargetFormat();
  const quality = await promptForQuality(targetFormat);
  const dimensions = await promptForResize();

  let converted = 0;
  for (const chosen of images) {
    const { args, outputName } = buildMagickArgs({
      chosen,
      targetFormat,
      quality,
      dimensions,
    });

    console.log(
      `[${converted + 1}/${images.length}] Running: magick ${args.join(" ")}`
    );

    const code = await runMagick(args);
    if (code !== 0) {
      console.log(
        colour.red(
          `magick exited with code ${code} on "${chosen}". Stopped after ${converted} file(s).`
        )
      );
      return;
    }

    console.log(colour.green(`OK: ${outputName}`));
    converted++;
  }

  console.log(
    colour.green(
      `Batch conversion finished successfully! (${converted} file(s) converted)`
    )
  );
}
