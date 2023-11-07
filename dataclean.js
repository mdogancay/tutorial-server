const fs = require("fs");
const path = require("path");
const shelljs = require("shelljs");
const util = require("util");

var txt_data = fs.readFileSync("./test.txt", { encoding: "utf8", flag: "r" });
var txt_array = txt_data.split("\n");
var clean_array = [];
for (let index = 0; index < txt_array.length; index++) {
  if (txt_array[index].startsWith("[download]")) {
    if (txt_array[index + 1] && !txt_array[index + 1].startsWith("[download]")) {
      clean_array.push(txt_array[index]);
    }
  } else {
    clean_array.push(txt_array[index]);
  }
}
fs.writeFileSync("./clean_text.txt", clean_array.join("\n"), { encoding: "utf8" });
