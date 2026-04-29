import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { spawn } from "child_process";

export default async function convertVideo() {
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

  //create a file concatList.txt, make sure it is empty if it already exists
  const concatFilePath = path.join(dir, "concatList.txt");
  fs.writeFileSync(concatFilePath, ""); // Create or truncate the file to ensure it's empty

  //make the list of videos to concat
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
      fs.appendFileSync(concatFilePath, `file '${chosenVideo}'\n`); // Add the video to concatList.txt
    }
  }

  if (selectedVideos.length === 0) {
    console.log("No videos selected. Exiting...");
    return;
  }

  //ask for a name for the new file
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
