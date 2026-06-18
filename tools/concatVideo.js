import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { colour, runFfmpeg } from "./utils.js";

export default async function convertVideo() {
  const dir = "./working_directory";

  const files = fs.readdirSync(dir);

  const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
  const videos = files.filter((file) =>
    videoExtensions.includes(path.extname(file).toLowerCase())
  );

  if (videos.length === 0) {
    console.log("No videos found in ./working_directory");
    return;
  }

  const concatFilePath = path.join(dir, "concatList.txt");
  fs.writeFileSync(concatFilePath, "");

  const selectedVideos = [];
  let addingVideos = true;

  while (addingVideos) {
    const { chosenVideo } = await inquirer.prompt([
      {
        type: "list",
        name: "chosenVideo",
        message:
          "Select a video to add to the list (or choose 'End video' to finish):",
        choices: [...videos, "End video"],
      },
    ]);

    if (chosenVideo === "End video") {
      addingVideos = false;
    } else {
      selectedVideos.push(chosenVideo);
      fs.appendFileSync(concatFilePath, `file '${chosenVideo}'\n`);
    }
  }

  if (selectedVideos.length === 0) {
    console.log("No videos selected. Exiting...");
    return;
  }

  const { fileName } = await inquirer.prompt([
    {
      type: "input",
      name: "fileName",
      message: "Enter a name for the output file (without extension):",
      validate: (input) => (input ? true : "File name cannot be empty"),
    },
  ]);

  let args = [
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    "concatList.txt",
    "-c",
    "copy",
    `"${fileName}.mp4"`,
  ];

  console.log("Running: ffmpeg", args.join(" "));

  const code = await runFfmpeg(args);
  if (code === 0) {
    console.log(colour.green("ffmpeg finished successfully!"));
  } else {
    console.log(colour.red(`ffmpeg exited with code ${code}`));
  }
}
