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
let THUMB_PATH = process.env.FOLDER_THUMBNAILS;
if (THUMB_PATH.search("/") == -1 || THUMB_PATH.search("\\") == -1) THUMB_PATH = path.join(__dirname, THUMB_PATH);
// console.log(THUMB_PATH);

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

//ffmpeg -ss t -i source.mp4 -f mjpeg -vframes 1 -s 480x270 -ss 1 output.jpg
//ffmpeg -i video.mp4 -map 0:v -map -0:V -c copy cover.jpg
exports.getThumbnail = function (filePath) {
  filePath = filePath.replace(/\\/g, "/");
  // console.log(`filePath : ${filePath}`);
  let folder = filePath.replace(root_dir, "");
  folder = folder.substring(0, folder.lastIndexOf("/") + 1);
  // console.log(`folder : ${folder}`);
  // let lastFolder = folder.substring(folder.lastIndexOf("/") + 1);
  // console.log(`lastFolder : ${lastFolder}`);
  let fileName = getHash(filePath) + ".jpg";
  let tnFolder = path.join(THUMB_PATH, folder);
  let tnFileName = path.join(THUMB_PATH, folder, fileName);
  shelljs.mkdir("-p", tnFolder);
  // console.log(tnFileName);
  if (fs.existsSync(tnFileName)) {
    return fileName;
  }
  // const meta = shelljs.exec(`ffmpeg -i "${filePath}" -f mjpeg -vframes 1 -s 480x270 -ss 1 "${tnFileName}"`, { async: false, silent: true });
  var meta = shelljs.exec(`ffmpeg -i "${filePath}" -map 0:v -map -0:V -f mjpeg -vf scale=480:270 -c:a copy "${tnFileName}"`, { async: false, silent: true });
  if (meta.code != 0) {
    // console.clear();
    // console.log(meta.stdout);
    // console.log(meta.stderr);
    const meta1 = shelljs.exec(`ffmpeg -i "${filePath}" -f mjpeg -vframes 1 -s 480x270 -ss 00:00:04 "${tnFileName}"`, { async: false, silent: true });
    // console.log(meta.stdout);
    // console.log(meta.stderr);
    if (meta1.code != 0) return "err.jpg";
  }

  return fileName;
};
