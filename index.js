const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const { getThumbnail } = require("./thumbnail.js");
const { getVideoInfo } = require("./videoinfo.js");

let dir;
let include;
let exclude;

// default configuration
let config = {
  removeLockString: false,
  otherRoots: [],
};

exports.moduleroot = __dirname;

exports.setcwd = function (cwd, inc, exc) {
  dir = cwd;
  include = inc;
  exclude = exc;
};

function displayFiles(files, currentDir, query) {
  let data = [];
  files.forEach(function (file) {
    let isDirectory = fs.statSync(path.join(currentDir, file)).isDirectory();
    if (isDirectory) {
      data.push([
        0,
        {
          Name: file,
          IsDirectory: true,
          Path: path.join(query, file),
        },
      ]);
    }
  });
  files.forEach(function (file) {
    let isDirectory = fs.statSync(path.join(currentDir, file)).isDirectory();
    if (!isDirectory) {
      let ext = path.extname(file);
      if (exclude && _.contains(exclude, ext)) {
        return;
      } else if (include && !_.contains(include, ext)) {
        return;
      }
      let filestr;
      if (config.removeLockString) {
        filestr = file.replace(".lock", "");
      } else {
        filestr = file;
      }
      let rstr = "";
      if (currentDir !== dir) {
        rstr = currentDir;
      }
      let thumb = "";
      let fileInfo = JSON.parse("{}");
      let filePath = path.join(currentDir, file);
      if (ext == ".mp4" || ext == ".mpg" || ext == ".mkv") {
        thumb = getThumbnail(filePath);
        fileInfo = getVideoInfo(filePath);
        // console.log("meta : " + meta);
      }
      data.push([
        1,
        {
          Name: filestr,
          Ext: ext,
          IsDirectory: false,
          Path: path.join(query, file),
          FileUrl: "/" + query + "/" + file,
          Root: rstr,
          Thumb: thumb,
          FileInfo: fileInfo,
        },
      ]);
    }
  });
  // console.log(data);
  return data;
}

/*
 * readRoots: read the list of files in a list of roots.
 * This is a recursive function, calling itself in
 * the readdir() callback until the list is iterated through.
 */
function readRoots(roots, res, query, fullList) {
  let currentDir = roots.shift();

  fs.readdir(currentDir, function (err, files) {
    let data;
    if (err) {
      // ignore non-readable directories
      data = fullList;
    } else {
      data = fullList.concat(displayFiles(files, currentDir, query));
    }

    if (roots.length > 0) {
      // loop to the next element
      readRoots(roots, res, query, data);
    } else {
      res.json(data);
      //   _.sortBy(data, function (f) {
      //     return f.Name;
      //   })
      // );
    }
  });
}

exports.get = function (req, res) {
  let currentDir = dir;
  let query = req.query.path || "";
  let roots = [];
  if (query) {
    roots.push(path.join(dir, query));
  } else {
    // top level, add all roots
    roots = config.otherRoots.slice();
    roots.push(currentDir);
  }
  readRoots(roots, res, query, []);
};

function walk(dirPath, query, search_word, currentDir) {
  let entries = fs.readdirSync(dirPath);
  var data = [];
  entries.forEach(function (file) {
    let ext = path.extname(file);
    let re = new RegExp(`${search_word}`, "gi");
    // console.log(`search_word : ${search_word} - re.test(file) : ${re.test(file)} file : ${file} ext : ${ext}`);
    if (re.test(file) && (ext == ".mp4" || ext == ".mpg" || ext == ".mkv")) {
      // console.log(`file : ${file}, Query : ${path.join(query, file)}`);
      if (exclude && _.contains(exclude, ext)) {
        return;
      } else if (include && !_.contains(include, ext)) {
        return;
      }
      let filestr;
      if (config.removeLockString) {
        filestr = file.replace(".lock", "");
      } else {
        filestr = file;
      }
      let rstr = "";
      if (currentDir !== dir) {
        rstr = currentDir;
      }
      let thumb = "";
      let fileInfo = JSON.parse("{}");
      let filePath = path.join(dirPath, file);
      if (ext == ".mp4" || ext == ".mpg" || ext == ".mkv") {
        thumb = getThumbnail(filePath);
        fileInfo = getVideoInfo(filePath);
        // console.log("meta : " + meta);
      }
      data.push([
        1,
        {
          Name: filestr,
          Ext: ext,
          IsDirectory: false,
          Path: path.join(query, file),
          FileUrl: "/" + query + "/" + file,
          Root: rstr,
          Thumb: thumb,
          FileInfo: fileInfo,
        },
      ]);
    }
    const childPath = path.join(dirPath, file);
    let isDirectory = fs.statSync(childPath).isDirectory();
    if (isDirectory) data = data.concat(walk(childPath, path.join(query, file), search_word, currentDir));
  });
  // console.log(`Data 1: ${data}`);
  return data;
}

exports.getByNameRecursive = function (req, res) {
  let query = req.query.path || "";
  let search_word = req.query.word || "";
  let currentDir = path.join(dir, query);
  // console.log(`query : ${query} search_word : ${search_word} currentDir : ${currentDir} `);
  let data = walk(currentDir, query, search_word, currentDir);
  // console.log(`query : ${query} search_word : ${search_word} currentDir : ${currentDir} data: ${data}`);
  res.json(data);
};

exports.configure = function (c) {
  if (!c) return;
  config = c;
};
