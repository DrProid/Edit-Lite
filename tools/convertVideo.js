import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { colour, runFfmpeg } from "./utils.js";

export default async function convertVideo() {
  console.log(colour.yellow("This is only set up to convert to web safe mp4 files"));
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

  const { chosen } = await inquirer.prompt([
    {
      type: "list",
      name: "chosen",
      message: "Select a video to edit:",
      choices: videos,
    },
  ]);

  let args = [
    "-i", `"${chosen}"`,
    "-b:a", "128k",
    "-movflags", "+faststart",
    `"${path.parse(chosen).name}_web.mp4"`
  ];

  console.log("Running: ffmpeg", args.join(" "));

  const code = await runFfmpeg(args);
  if (code === 0) {
    console.log(colour.green("ffmpeg finished successfully!"));
  } else {
    console.log(colour.red(`ffmpeg exited with code ${code}`));
  }
}

