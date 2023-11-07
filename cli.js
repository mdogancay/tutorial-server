#!/usr/bin/env node

const http = require("http");
const express = require("express");
const path = require("path");
const shelljs = require("shelljs");
const fb = require("./index.js");
require("dotenv").config();
//console.log(process.env);
global.commandline = null;
global.childProcess = null;

fb.configure({
  removeLockString: true,

  /*
   * Example of otherRoots.
   * The other roots are listed and displayed, but their
   * locations need to be calculated by the server.
   * See OTHERROOTS in the app.
   */
  otherRoots: ["/tmp", "/broken"],
});

function checkValidity(argv) {
  if (argv.i && argv.e) return new Error("Select -i or -e.");
  if (argv.i && argv.i.length === 0) return new Error("Supply at least one extension for -i option.");
  if (argv.e && argv.e.length === 0) return new Error("Supply at least one extension for -e option.");
  return true;
}

var argv = require("yargs")
  .usage("Usage: $0 <command> [options]")
  .command("$0", "Browse file system.")
  .example("$0 -e .js .swf .apk", "Exclude extensions while browsing.")
  .alias("i", "include")
  .array("i")
  .describe("i", "File extension to include.")
  .alias("e", "exclude")
  .array("e")
  .describe("e", "File extensions to exclude.")
  .alias("p", "port")
  .describe("p", "Port to run the file-browser. [default:8088]")
  .help("h")
  .alias("h", "help")
  .check(checkValidity).argv;

const app = express();

//var dir =  process.cwd();
var dir = process.env.FOLDER_TUTORIALS;
app.get("/b", function (req, res) {
  let file;
  if (req.query.r === "/tmp") {
    /*
     * OTHERROOTS
     * This is an example of a manually calculated path.
     */
    file = path.join(req.query.r, req.query.f);
  } else {
    file = path.join(dir, req.query.f);
  }
  res.sendFile(file);
});

app.use(express.static(__dirname)); // module directory
app.use(express.static(process.env.FOLDER_THUMBNAILS));
app.use(express.static(dir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use((req, res, next) => {    //runs for every path. Same as .use('/',
//   //'/hello' has NOT been trimmed from req.url
//   //req.url is /hello if the request was for /hello
//   if (req.url.startsWith('/lib/js/rajeo-player')) {
//     req.url = '/lib/js/rajeo-player.min.js'; //full path now /goodbye
//   }
//   next(); //will continue calling all middleware
// });
var server = http.createServer(app);

fb.setcwd(dir, argv.include, argv.exclude);

if (!argv.port) argv.port = 8088;

server.listen(argv.port);

// eslint-disable-next-line no-console
console.log("Please open the link in your browser http://localhost:" + argv.port);

app.get("/files", fb.get);
app.get("/search", fb.getByNameRecursive);

app.get("/", function (req, res) {
  res.redirect("lib/template.html");
});

app.get("/getmaindir", function (req, res) {
  res.send(dir);
});

app.get("/getconsole", function (req, res) {
  if (!global.commandline || global.commandline == "") {
    res.send("");
  } else {
    // if (global.commandline && global.commandline != "") {

    // }
    let txt_array = global.commandline.split(/\r\n|\n|\r/g);
    let clean_array = [];
    for (let index = 0; index < txt_array.length; index++) {
      // console.log("-" + txt_array[index] + "-");
      if (txt_array[index].startsWith("[download]")) {
        if (txt_array[index + 1] && !txt_array[index + 1].startsWith("[download]")) {
          clean_array.push(txt_array[index]);
        } else if (!txt_array[index + 1]) {
          clean_array.push(txt_array[index]);
        }
      } else {
        // console.log("-" + txt_array[index] + "-");
        clean_array.push(txt_array[index]);
      }
    }
    res.send(clean_array.join("\n"));
    global.commandline = "";
  }
});

app.post("/runcommand", function (req, res) {
  const youtube_url = req.body.youtube_url;
  const target_folder = req.body.target_folder.replace(/\\/g, "/").replace(/ +/g, "_");
  console.log("youtube_url : " + youtube_url);
  console.log("target_folder : " + target_folder);
  shelljs.mkdir("-p", target_folder);
  // shelljs.cd(target_folder);
  const final_command = process.env.GET_TUTORIAL_COMMAND + ' "' + process.env.GET_TUTORIAL_OUTPUT.replace("@out_folder", target_folder) + '" "' + youtube_url + '"';
  // console.log("command : " + final_command);
  global.childProcess = shelljs.exec(final_command, { async: true, silent: true });
  global.childProcess.stdout.on("data", function (data) {
    global.commandline += data; //.replace(/\r\n|\n|\r/g, "<br />");
  });
  res.send("ok");
});
