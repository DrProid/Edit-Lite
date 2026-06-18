import inquirer from "inquirer";
import path from "path";
import {
  colour,
  getSubtitlesInWorkingDirectory,
  SUBTITLE_FORMAT_CHOICES,
  runFfmpeg,
} from "./utils.js";

export default async function batchConvertSubtitles() {
  const dir = "./working_directory";

  const subtitles = getSubtitlesInWorkingDirectory(dir);
  if (subtitles.length === 0) {
    console.log("No subtitle files found in ./working_directory");
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Convert ${subtitles.length} subtitle file(s) in ./working_directory?`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log("Batch conversion cancelled.");
    return;
  }

  const { targetFormat } = await inquirer.prompt([
    {
      type: "list",
      name: "targetFormat",
      message: "Convert to which format?",
      choices: SUBTITLE_FORMAT_CHOICES,
    },
  ]);

  let converted = 0;
  let skipped = 0;

  for (const chosen of subtitles) {
    const sourceExt = path.extname(chosen).toLowerCase().slice(1);
    if (sourceExt === targetFormat) {
      console.log(
        colour.yellow(
          `skip: ${chosen} (already ${targetFormat.toUpperCase()})`
        )
      );
      skipped++;
      continue;
    }

    const outputName = `${path.parse(chosen).name}_converted.${targetFormat}`;
    const args = ["-y", "-i", `"${chosen}"`, `"${outputName}"`];

    console.log(
      `[${converted + skipped + 1}/${subtitles.length}] Running: ffmpeg ${args.join(" ")}`
    );

    const code = await runFfmpeg(args);
    if (code !== 0) {
      console.log(
        colour.red(
          `ffmpeg exited with code ${code} on "${chosen}". Stopped after ${converted} file(s).`
        )
      );
      return;
    }

    console.log(colour.green(`OK: ${outputName}`));
    converted++;
  }

  console.log(
    colour.green(
      `Batch conversion finished successfully! (${converted} converted, ${skipped} skipped)`
    )
  );
}
