import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { spawn } from "child_process";
import { colour } from "./utils.js";

export default async function convertVideo() {
  console.log(colour.yellow("This is only set up to convert to web safe mp4 files"));
  const dir = "./working_directory";

  // Read all files in the directory
  const files = fs.readdirSync(dir);

  // Filter to common video extensions
  const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
  const videos = files.filter((file) =>
    videoExtensions.includes(path.extname(file).toLowerCase())
  );

  if (videos.length === 0) {
    console.log("No videos found in ./working_directory");
    return;
  }
  
  // Prompt the user to pick a video
  const { chosen } = await inquirer.prompt([
    {
      type: "list",
      name: "chosen",
      message: "Select a video to edit:",
      choices: videos,
    },
  ]);

  // Build the args array
  // const args = [];
  // args.push("-i");
  // args.push(chosen);
  let args = [
    "-i", `"${chosen}"`,
    // "-c:v", "copy",
    // "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    `"${path.parse(chosen).name}_web.mp4"`
  ];
  
  // Show the command to the user
  console.log("Running: ffmpeg", args.join(" "));

  // Spawn the process
  const proc = spawn("ffmpeg", args, {
    stdio: ["inherit", "inherit", "inherit"], // stdin, stdout, stderr
    shell: true, // important: runs via the shell so CLI formatting works
    cwd: "./working_directory", // run the command from this folder
  });

  proc.on("close", (code) => {
    if (code === 0) {
      console.log("ffmpeg finished successfully!");
    } else {
      console.log(`ffmpeg exited with code ${code}`);
    }
  });
}

