#!/usr/bin/env node
import inquirer from "inquirer";

const colours = {
  red: txt => `\x1b[31m${txt}\x1b[0m`,
  green: txt => `\x1b[32m${txt}\x1b[0m`,
  yellow: txt => `\x1b[33m${txt}\x1b[0m`,
};

async function main() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: [
        { name: "Cut a video", value: "autoEdit" },
        { name: "Convert a video", value: "convertVideo" },
        { name: "Join Videos", value: "concatVideo" },
        { name: "Convert an image", value: "convertImage" },
        { name: "Exit", value: "exit" }
      ]
    }
  ]);

  switch (action) {
      case "autoEdit":
        const { default: autoEdit } = await import("./tools/autoEdit.js");
        await autoEdit();
        break;

    case "concatVideo":
      const { default: concatVideo } = await import("./tools/concatVideo.js");
      await concatVideo();
      break;

      case "convertVideo":
      const { default: convertVideo } = await import("./tools/convertVideo.js");
      await convertVideo();
      break;

    case "convertImage":
      const { default: convertImage } = await import("./tools/convertImage.js");
      await convertImage();
      break;

    case "exit":
      console.log("Goodbye!");
      process.exit(0);
  }
}

main();