import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

function timeToSeconds(timeStr) {
  const parts = timeStr.split(":").map(Number);
  let seconds = 0;

  if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  }
  return seconds;
}

export function normalizeAutoEditorTime(input) {
  input = input.trim();
  if (input.includes(":")) {
    return `${timeToSeconds(input)}sec`;
  }
  return input;
}

export function isValidAutoEditorTimeFormat(input) {
  const str = input.trim();
  const TIME_REGEX = /^(?:\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2}|\d+sec|\d+|end)$/;
  return TIME_REGEX.test(str);
}

export const colour = {
  red: txt => `\x1b[31m${txt}\x1b[0m`,
  green: txt => `\x1b[32m${txt}\x1b[0m`,
  yellow: txt => `\x1b[33m${txt}\x1b[0m`,
  blue: txt => `\x1b[34m${txt}\x1b[0m`,
  magenta: txt => `\x1b[35m${txt}\x1b[0m`,
  cyan: txt => `\x1b[36m${txt}\x1b[0m`,
  bold: txt => `\x1b[1m${txt}\x1b[0m`,
};

export const IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".bmp",
  ".tif",
  ".tiff",
  ".gif",
];

export const FORMAT_CHOICES = [
  { name: "PNG", value: "png" },
  { name: "JPEG", value: "jpg" },
  { name: "WebP", value: "webp" },
  { name: "BMP", value: "bmp" },
  { name: "TIFF", value: "tiff" },
  { name: "GIF", value: "gif" },
  { name: "Other (type manually)", value: "__custom__" },
];

export const FORMAT_TO_EXT = {
  png: "png",
  jpg: "jpg",
  webp: "webp",
  bmp: "bmp",
  tiff: "tif",
  gif: "gif",
};

export const LOSSY_FORMATS = new Set(["jpg", "webp"]);

export function getImagesInWorkingDirectory(dir = "./working_directory") {
  const files = fs.readdirSync(dir);
  return files.filter((file) =>
    IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())
  );
}

export async function promptForTargetFormat() {
  const { formatChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "formatChoice",
      message: "Convert to which format?",
      choices: FORMAT_CHOICES,
    },
  ]);

  if (formatChoice === "__custom__") {
    const { customFormat } = await inquirer.prompt([
      {
        type: "input",
        name: "customFormat",
        message: "Enter the target format (e.g. jpg, png, gif):",
        validate: (input) =>
          input && input.trim().length > 0 ? true : "Format cannot be empty",
      },
    ]);
    return customFormat.trim().toLowerCase();
  }

  return formatChoice;
}

export async function promptForQuality(targetFormat) {
  if (!LOSSY_FORMATS.has(targetFormat)) {
    return undefined;
  }

  const { quality } = await inquirer.prompt([
    {
      type: "input",
      name: "quality",
      message: `Quality for ${targetFormat.toUpperCase()} (1-100):`,
      default: "85",
      validate: (input) => {
        const n = Number(input);
        return Number.isInteger(n) && n >= 1 && n <= 100
          ? true
          : "Enter an integer between 1 and 100";
      },
    },
  ]);
  return quality;
}

export async function promptForResize() {
  const { wantsResize } = await inquirer.prompt([
    {
      type: "confirm",
      name: "wantsResize",
      message: "Resize the image?",
      default: false,
    },
  ]);

  if (!wantsResize) {
    return undefined;
  }

  const { dimensions } = await inquirer.prompt([
    {
      type: "input",
      name: "dimensions",
      message: 'Enter dimensions as "W x H" (e.g. 1920x1080):',
      validate: (input) =>
        /^\d+\s*[xX]\s*\d+$/.test(input.trim())
          ? true
          : 'Use the format "W x H", e.g. 1920x1080',
    },
  ]);
  return dimensions.replace(/\s+/g, "");
}

export function buildMagickArgs({ chosen, targetFormat, quality, dimensions }) {
  const ext = FORMAT_TO_EXT[targetFormat] || targetFormat;
  const outputName = `${path.parse(chosen).name}_converted.${ext}`;

  const args = [`"${chosen}"`];
  if (quality) {
    args.push("-quality", quality);
  }
  if (dimensions) {
    args.push("-resize", dimensions);
  }
  args.push(`"${outputName}"`);

  return { args, outputName };
}

export const SUBTITLE_EXTENSIONS = [".srt", ".vtt"];

export const SUBTITLE_FORMAT_CHOICES = [
  { name: "SRT", value: "srt" },
  { name: "VTT", value: "vtt" },
];

export function getSubtitlesInWorkingDirectory(dir = "./working_directory") {
  const files = fs.readdirSync(dir);
  return files.filter((file) =>
    SUBTITLE_EXTENSIONS.includes(path.extname(file).toLowerCase())
  );
}

export function runFfmpeg(args) {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", args, {
      stdio: ["inherit", "inherit", "inherit"],
      shell: true,
      cwd: "./working_directory",
    });
    proc.on("close", (code) => resolve(code));
  });
}

export function runMagick(args) {
  return new Promise((resolve) => {
    const proc = spawn("magick", args, {
      stdio: ["inherit", "inherit", "inherit"],
      shell: true,
      cwd: "./working_directory",
    });
    proc.on("close", (code) => resolve(code));
  });
}
