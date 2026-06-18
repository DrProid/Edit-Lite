# Edit-Lite
A repository of scripts and tools used to edit videos and images.

## Instructions
1. Run `npm i`
1. Run `node .\wizard.js`


## Dependencies
The following dependencies should be accessible through your command line:
- FFMPEG https://git.ffmpeg.org/gitweb/ffmpeg.git or https://github.com/FFmpeg/FFmpeg
- ImageMagick https://github.com/ImageMagick
- auto-editor https://github.com/WyattBlue/auto-editor

This is to remember what I did to set this up:
1. npm init -y
1. npm install inquirer


## Menu
The wizard has two top-level submenus:
- **Edit videos**: cut a video (auto-editor), join videos (ffmpeg concat).
- **Convert**: convert a video to web-safe mp4 (ffmpeg), convert a single image, batch convert images, batch convert subtitles (SRT/VTT) via ffmpeg.

## To do
[] It doesn't make sense to have cutVideo because it is practically all of the function of auto-editor. Add options to set the --edit flag. Maybe "Do you want to cut silence?".
[x] Convert an image with ImageMagick (`magick`).
[x] Batch convert images with ImageMagick (`magick`).
[x] Batch convert subtitles (SRT/VTT) via ffmpeg.