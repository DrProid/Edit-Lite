#!/usr/bin/env node
import inquirer from "inquirer";

const TOP_LEVEL_CHOICES = [
  { name: "Edit videos", value: "editVideos" },
  { name: "Convert", value: "convert" },
  { name: "Extract", value: "extract" },
  { name: "Exit", value: "exit" },
];

const EDIT_CHOICES = [
  { name: "Cut a video", value: "autoEdit" },
  { name: "Join videos", value: "concatVideo" },
  { name: "Back", value: "back" },
];

const CONVERT_CHOICES = [
  { name: "Convert a video", value: "convertVideo" },
  { name: "Convert an image", value: "convertImage" },
  { name: "Batch convert images", value: "batchConvertImage" },
  { name: "Batch convert subtitles", value: "batchConvertSubtitles" },
  { name: "Back", value: "back" },
];

const EXTRACT_CHOICES = [
  { name: "Unzip subtitles (extract an entry from each zip)", value: "batchUnzipSubtitles" },
  { name: "Back", value: "back" },
];

async function runTool(value) {
  const mod = await import(`./tools/${value}.js`);
  await mod.default();
}

async function editVideosSubmenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: EDIT_CHOICES,
    },
  ]);
  if (action === "back") return;
  await runTool(action);
}

async function convertSubmenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: CONVERT_CHOICES,
    },
  ]);
  if (action === "back") return;
  await runTool(action);
}

async function extractSubmenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: EXTRACT_CHOICES,
    },
  ]);
  if (action === "back") return;
  await runTool(action);
}

async function main() {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What do you want to do?",
        choices: TOP_LEVEL_CHOICES,
      },
    ]);

    if (action === "exit") {
      console.log("Goodbye!");
      return;
    }
    if (action === "editVideos") await editVideosSubmenu();
    if (action === "convert") await convertSubmenu();
    if (action === "extract") await extractSubmenu();
  }
}

main();
