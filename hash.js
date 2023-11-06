var crypto = require("crypto");

exports.getHash = function (strParam) {
  var hash = crypto.createHash("md5").update(strParam).digest("hex");
  //console.log(hash); // 9b74c9897bac770ffc029102a200c5de
  return hash;
};
