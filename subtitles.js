// ffmpeg -i Movie.mkv -map 0:s:0 subs.srt
const fs = require("fs");
const path = require("path");
const shelljs = require("shelljs");
const util = require("util");
require("dotenv").config();

// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// var ffmpeg = require("fluent-ffmpeg");
const { getHash } = require("./hash");
// ffmpeg.setFfmpegPath(ffmpegPath);

let root_dir = process.env.FOLDER_TUTORIALS;
let FOLDER_SUBTITLES = process.env.FOLDER_SUBTITLES;
if (FOLDER_SUBTITLES.search("/") == -1 || FOLDER_SUBTITLES.search("\\") == -1) FOLDER_SUBTITLES = path.join(__dirname, FOLDER_SUBTITLES);
if (!fs.existsSync(FOLDER_SUBTITLES)) shelljs.mkdir("-p", FOLDER_SUBTITLES);
// console.log(FOLDER_SUBTITLES);

// function to encode file data to base64 encoded string
function base64_encode(file) {
  // read binary data
  return fs.readFileSync(file, { encoding: "BASE64" });
  // // convert binary data to base64 encoded string
  // return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
  // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
  let bitmap = new Buffer(base64str, "base64");
  // write buffer to file
  fs.writeFileSync(file, bitmap);
  console.log("******** File created from base64 encoded string ********");
}

exports.getSubtitles = function (filePath) {
  filePath = filePath.replace(/\\/g, "/");
  let folder = filePath.replace(root_dir, "");
  folder = folder.substring(0, folder.lastIndexOf("/") + 1);
  let fileName = getHash(filePath) + "_en.vtt";
  let tnFolder = path.join(FOLDER_SUBTITLES, folder);
  let tnFileName = path.join(FOLDER_SUBTITLES, folder, fileName);
  shelljs.mkdir("-p", tnFolder);
  // console.log(tnFileName);
  if (fs.existsSync(tnFileName)) {
    return fileName;
  }
  // const meta = shelljs.exec(`ffmpeg -i "${filePath}" -f mjpeg -vframes 1 -s 480x270 -ss 1 "${tnFileName}"`, { async: false, silent: true });
  var meta = shelljs.exec(`ffmpeg -i "${filePath}" -map 0:s:0 "${tnFileName}"`, { async: false, silent: true });
  if (meta.code != 0) {
    return "";
  }
  return fileName;
};

//console.log(this.getSubtitles("F:\\Tutorials\\All\\UE4\\@codewithchuck1938\\UE4_Tutorials\\1-UE4_-_World_Composition_-_Build_Huge_Maps-[24uvvsZ9e80].mp4"));
