const fs = require("fs");

// json data
var jsonData = '{"persons":[{"name":"John","city":"New York"},{"name":"Phil","city":"Ohio"}]}';

// parse json
var jsonObj = JSON.parse(jsonData);
console.log(jsonObj);

// stringify JSON Object
var jsonContent = JSON.stringify(jsonObj);
console.log(jsonContent);
