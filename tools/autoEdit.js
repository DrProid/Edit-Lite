import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { spawn } from "child_process";
import {
  isValidAutoEditorTimeFormat,
  normalizeAutoEditorTime,
} from "./utils.js";

export default async function autoEdit() {
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

  // console.log(`You chose: ${chosen}`);

  const { editor } = await inquirer.prompt([
    {
      type: "list",
      name: "editor",
      message: "How do you want to edit?",
      choices: [
        { name: "Auto remove silent sections", value: "default" },
        { name: "Cut out specific sections", value: "none" },
        { name: "Only leave in specific sections", value: "all/e" },
        { name: "auto-editor with settings", value: "settings" },
      ],
    },
  ]);

  let editSettings = "";
  if (editor === "settings") {
    //ask about thresholds?
    console.log("custom edit settings are not implemented yet.");
    editSettings = "audio:threshold=0.04,stream=all"; //using default edit settings until this is implemented.
  } else if (editor !== "default") {
    editSettings = editor;
  }

  let ranges = [];

  if (editor === "none" || editor === "all/e") {
    let addMore = true;

    while (addMore) {
      const { start, end, more } = await inquirer.prompt([
        {
          type: "input",
          name: "start",
          message: "Start time (e.g. 0, 5sec, 01:23):",
        },
        {
          type: "input",
          name: "end",
          message: "End time (e.g. 5sec, 10sec, end):",
        },
        {
          type: "confirm",
          name: "more",
          message: "Add another range?",
          default: false,
        },
      ]);

      if (!isValidAutoEditorTimeFormat(start)) {
        console.log(
          `Invalid start time: "${start}". Please use mm:ss, hh:mm:ss, /dsec, or /d.`
        );
      } else if (!isValidAutoEditorTimeFormat(end)) {
        console.log(
          `Invalid end time: "${end}". Please use mm:ss, hh:mm:ss, /dsec, or /d.`
        );
      } else {
        // Both valid — push the range
        ranges.push(
          `${normalizeAutoEditorTime(start)},${normalizeAutoEditorTime(end)}`
        );
      }
      addMore = more;
    }
  }

  // Build the args array
  let args = [];

  args.push(`"${chosen}"`);
  if (editor !== "default") {
    args.push(`--edit`);
    args.push(`${editSettings}`);
  };

  if (editor === "none" || editor === "all/e") {
    args.push(editor === "none" ? "--cut-out" : "--add-in");
    args.push(...ranges);
  };

  // Show the command to the user
  console.log("Running: auto-editor", args.join(" "));

  // Spawn the process
  const proc = spawn("auto-editor", args, {
    stdio: ["inherit", "inherit", "inherit"], // stdin, stdout, stderr
    shell: true, // important: runs via the shell so CLI formatting works
    cwd: "./working_directory" // run the command from this folder
  });

  proc.on("close", (code) => {
    if (code === 0) {
      console.log("auto-editor finished successfully!");
    } else {
      console.log(`auto-editor exited with code ${code}`);
    }
  });
}
