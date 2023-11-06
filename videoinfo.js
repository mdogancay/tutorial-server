// ffprobe -loglevel error -show_entries stream_tags:format_tags -of json 1-00_-_usgs_elevation_to_unreal_intro-3xzC-7maD-s.mp4
const fs = require("fs");
const path = require("path");
const shelljs = require("shelljs");
const util = require("util");
require("dotenv").config();
const { getHash } = require("./hash");

let root_dir = process.env.FOLDER_TUTORIALS;
let INFO_PATH = process.env.FOLDER_VIDEO_INFO;
if (INFO_PATH.search("/") == -1 || INFO_PATH.search("\\") == -1) INFO_PATH = path.join(__dirname, INFO_PATH);
//const INFO_PATH = path.join(__dirname, "video_info");

// var videoFile = "F:\\Epic Games\\Unreal\\Tutorials\\UE4\\@clintonreese9081\\USGS to Unreal\\1-00_-_usgs_elevation_to_unreal_intro-3xzC-7maD-s.mp4";
exports.getVideoInfo = function (videoFile) {
  videoFile = videoFile.replace(/\\/g, "/");
  let folder = videoFile.replace(root_dir, "");
  folder = folder.substring(0, folder.lastIndexOf("/") + 1);
  // console.log(`folder : ${folder}`);
  // let lastFolder = folder.substring(folder.lastIndexOf("/") + 1);
  let fileName = getHash(videoFile) + "_info.json";
  let tnFolder = path.join(INFO_PATH, folder);
  let tnFileName = path.join(INFO_PATH, folder, fileName);
  shelljs.mkdir("-p", tnFolder);
  if (fs.existsSync(tnFileName)) {
    let fdata = fs.readFileSync(`${tnFileName}`, { encoding: "utf8", flag: "r" });
    obj = JSON.parse(fdata); //now it an object
    return obj;
  }

  const meta = shelljs.exec(`ffprobe -loglevel error -show_entries stream_tags:format_tags -of json "${videoFile}"`, { async: false, silent: true }).stdout;
  var metaJson = JSON.parse(meta);
  fs.writeFileSync(`${tnFileName}`, JSON.stringify(metaJson), { encoding: "utf8" });
  // console.log("Meta.format.tags.comment : ", metaJson.format.tags.comment);
  return metaJson;
};
