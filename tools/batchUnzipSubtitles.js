import inquirer from "inquirer";
import path from "path";
import {
  colour,
  getZipsInWorkingDirectory,
  unzipEntryToFile,
} from "./utils.js";

const WORK_DIR = path.resolve("./working_directory");

export default async function batchUnzipSubtitles() {
  const zips = getZipsInWorkingDirectory(WORK_DIR);
  if (zips.length === 0) {
    console.log("No .zip files found in ./working_directory");
    return;
  }

  const { entryName } = await inquirer.prompt([
    {
      type: "input",
      name: "entryName",
      message: "Which entry inside each zip should I extract?",
      default: "latest.srt",
    },
  ]);

  const target = entryName.trim();
  if (!target) {
    console.log(colour.red("Entry name cannot be empty."));
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Extract '${target}' from ${zips.length} zip(s) in ./working_directory?`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log("Batch extract cancelled.");
    return;
  }

  let converted = 0;
  let skipped = 0;

  for (const zip of zips) {
    const outputName = `${path.parse(zip).name}.srt`;
    const zipPath = path.join(WORK_DIR, zip);
    const outputPath = path.join(WORK_DIR, outputName);

    console.log(
      `[${converted + skipped + 1}/${zips.length}] Extracting: '${target}' from ${zip} -> ${outputName}`
    );

    let result;
    try {
      result = await unzipEntryToFile(zipPath, target, outputPath);
    } catch (err) {
      console.log(
        colour.red(
          `Failed to extract from "${zipPath}": ${err.message}. Stopped after ${converted} file(s).`
        )
      );
      return;
    }

    if (!result.found) {
      console.log(
        colour.yellow(
          `skip: ${zip} (no '${target}' inside)`
        )
      );
      skipped++;
      continue;
    }

    console.log(colour.green(`OK: ${outputName} (${result.bytes} bytes)`));
    converted++;
  }

  console.log(
    colour.green(
      `Batch extract finished successfully! (${converted} extracted, ${skipped} skipped)`
    )
  );
}
