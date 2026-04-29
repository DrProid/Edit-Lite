
function timeToSeconds(timeStr) {
  const parts = timeStr.split(":").map(Number);
  let seconds = 0;

  if (parts.length === 3) {
    // hh:mm:ss
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // mm:ss
    seconds = parts[0] * 60 + parts[1];
  }
  return seconds;
}

export function normalizeAutoEditorTime(input) {
  input = input.trim();
  if (input.includes(":")) {
    // mm:ss or hh:mm:ss → convert to seconds
    return `${timeToSeconds(input)}sec`;
  }
  // leave as-is (could be "5sec" or a frame number)
  return input;
}

export function isValidAutoEditorTimeFormat(input) {
    // Trim whitespace and test against combined regex
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