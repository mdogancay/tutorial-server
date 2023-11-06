const fs = require("fs");
const path = require("path");
const shelljs = require("shelljs");
const util = require("util");

var txt_data = fs.readFileSync("./test.txt", { encoding: "utf8", flag: "r" });
var txt_array = txt_data.split("\n");
var clean_array = [];
for (let index = 0; index < txt_array.length; index++) {
  if (array[index].startsWith("[download]")) {
    if (array[index + 1] && !array[index + 1].startsWith("[download]")) {
      clean_array.push(array[index]);
    }
  } else {
    clean_array.push(array[index]);
  }
}
