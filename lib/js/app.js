(function ($) {
  var extensionsMap = {
    ".zip": "fa-file-archive-o",
    ".gz": "fa-file-archive-o",
    ".bz2": "fa-file-archive-o",
    ".xz": "fa-file-archive-o",
    ".rar": "fa-file-archive-o",
    ".tar": "fa-file-archive-o",
    ".tgz": "fa-file-archive-o",
    ".tbz2": "fa-file-archive-o",
    ".z": "fa-file-archive-o",
    ".7z": "fa-file-archive-o",
    ".mp3": "fa-file-audio-o",
    ".cs": "fa-file-code-o",
    ".c++": "fa-file-code-o",
    ".cpp": "fa-file-code-o",
    ".js": "fa-file-code-o",
    ".xls": "fa-file-excel-o",
    ".xlsx": "fa-file-excel-o",
    ".png": "fa-file-image-o",
    ".jpg": "fa-file-image-o",
    ".jpeg": "fa-file-image-o",
    ".gif": "fa-file-image-o",
    ".mpeg": "fa-file-movie-o",
    ".pdf": "fa-file-pdf-o",
    ".ppt": "fa-file-powerpoint-o",
    ".pptx": "fa-file-powerpoint-o",
    ".txt": "fa-file-text-o",
    ".log": "fa-file-text-o",
    ".doc": "fa-file-word-o",
    ".docx": "fa-file-word-o",
  };

  function getFileIcon(ext) {
    return (ext && extensionsMap[ext.toLowerCase()]) || "fa-file-o";
  }

  // function init_player() {
  //   console.log('$(".rajeo-player") : ' + JSON.stringify($(".rajeo-player")));
  //   if ($(".rajeo-player").length > 0) return;
  //   console.log("geldi");
  //   let src = $(".reloadMe");
  //   src.empty();
  //   $.get("/lib/js/rajeo-player.min.js").then(function (data) {
  //     if (data && data !== "") {
  //       src.text(data);
  //     }
  //   });
  // }

  var currentPath = "";
  var options = {
    bProcessing: true,
    bServerSide: false,
    bPaginate: false,
    bAutoWidth: true,
    sScrollY: "calc(100vh - 400px)",
    // sScrollY: "900px",
    fnCreatedRow: function (nRow, aData, iDataIndex) {
      // console.log(aData);
      if (!aData[1].IsDirectory) return;
      var path = encodeURIComponent(aData[1].Path);
      $(nRow).bind("click", function (e) {
        $.get("/files?path=" + path).then(function (data) {
          table.fnClearTable();
          table.fnAddData(data);
          currentPath = path;
          $(".currentPath").html(decodeURIComponent(currentPath));
        });
        e.preventDefault();
      });
    },
    drawCallback: function (settings, json) {
      // setTimeout((_) => {
      //   init_player();
      // }, 0.2e4); // // Reload the script
      // $(".reloadMe").attr("src", src.split("min")[0] + "min" + Math.floor(Math.random() * 10000000) + ".js");
    },
    aoColumns: [
      {
        visible: false,
      },
      {
        sTitle: "",
        mData: null,
        bSortable: false,
        sClass: "head0",
        sWidth: "155px",
        render: function (data, type, row, meta) {
          if (data.length === 0) return;
          if (data[1].IsDirectory) {
            return "<a href='#' target='_blank'><i class='fa fa-folder'></i>&nbsp;" + data[1].Name + "</a>";
          } else {
            if (data[1].Ext == ".mp4" || data[1].Ext == ".mpg" || data[1].Ext == ".mkv") {
              let comment = "";
              let title = "";
              if (data[1].FileInfo.format.tags.title !== undefined) {
                title = "<strong>" + data[1].FileInfo.format.tags.title + "</strong>";
              }
              if (title === "") {
                let url = data[1].FileUrl.replace(/\\/g, "/");
                let filename = url.substring(url.lastIndexOf("/") + 1);
                title = filename.replace(/_/g, " ").replace(data[1].Ext, "");
              }
              if (data[1].FileInfo.format.tags.comment !== undefined) {
                comment = data[1].FileInfo.format.tags.comment.replace(/\n/g, "<br />");
              }
              data[1].FileUrl = data[1].FileUrl.replace(/\\/g, "/");
              return (
                "<table style='border-bottom: 1px solid gray; width: 100%;text-align:left;'>" +
                "<tr>" +
                "<td>" +
                '<video id="player_' +
                data[1].Name.replace(/ +/g, "_") +
                '" class="raw_player" ' +
                'width="480" height="270" controls preload="none" poster=\'' +
                "/thumb/" +
                data[1].FileUrl.substring(0, data[1].FileUrl.lastIndexOf("/")) +
                "/" +
                data[1].Thumb +
                "'>" +
                "<source src='" +
                data[1].FileUrl +
                "' type='video/mp4'>" +
                "Your browser does not support the video tag." +
                "</video>" +
                "</td>" +
                "<td>" +
                "<table>" +
                "<tr>" +
                "<td>" +
                title +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td>" +
                '<div style="text-align:left; max-height:270px; overflow: auto;width:900px; border-top: 1px solid lightgray; border-bottom: 1px solid lightgray;">' +
                comment +
                "</div>" +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td>" +
                "<span>" +
                "File : " +
                data[1].FileUrl +
                "</span>" +
                "</td>" +
                "</tr>" +
                "</table>" +
                "</td>" +
                "</tr>" +
                "</table>"
              );
            } else if (".jpg .png .webp .gif".search(data[1].Ext) != -1) {
              return "<img src='/" + data[1].Path + "' height='270px' />";
            } else {
              return "<a href='/" + encodeURIComponent(data[1].Path) + "' target='_blank'>" + "<i class='fa " + getFileIcon(data[1].Ext) + "'></i>&nbsp;" + data[1].Name + "</a>";
            }
          }
        },
      },
    ],
  };

  var table = $(".linksholder").dataTable(options);
  var timer = null;

  $.get("/files").then(function (data) {
    table.fnClearTable();
    table.fnAddData(data);
  });

  $(".up").bind("click", function (e) {
    if (!currentPath || currentPath == "") return;
    // var idx = currentPath.lastIndexOf("%2F");
    var idx = currentPath.lastIndexOf("%5C");
    var path = currentPath.substr(0, idx);
    $.get("/files?path=" + path).then(function (data) {
      table.fnClearTable();
      table.fnAddData(data);
      currentPath = path;
      $(".currentPath").html(decodeURIComponent(currentPath));
    });
  });

  $(".add").bind("click", function (e) {
    let targetDir = "";
    $.get("/getmaindir").then(function (data) {
      targetDir = data + decodeURIComponent(currentPath).replace(/\\/g, "/") + "/";
      $("#txt_target_folder").val(targetDir);
      $('#myTabs a[href="#gettutorial"]').tab("show"); // Select tab by name
    });
  });

  function scrollLogToBottom() {
    logTa = document.getElementById("textAreaExample1");
    logTa.scrollTop = logTa.scrollHeight;
  }

  async function getConsole() {
    console.log("calisiyor");
    $.get("/getconsole").then(function (data) {
      if (data && data !== "") {
        $("#textAreaExample1").append(data);
        scrollLogToBottom();
      }
    });
  }

  $('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
    // console.log("e.target.toString().endsWith('#gettutorial') = " + e.target.toString().endsWith("#gettutorial"));
    if (e.target.toString().endsWith("#tutorials")) {
      if (timer) {
        clearInterval(timer);
      }
    }
    if (e.target.toString().endsWith("#gettutorial")) {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(getConsole, 3000);
    }
    // console.log("e.target : " + e.target); // newly activated tab
    // console.log("e.relatedTarget : " + e.relatedTarget); // previous active tab
  });

  $("#btnClearLog").bind("click", function (e) {
    $("#textAreaExample1").html("");
  });

  $("#btnGetTutorial").bind("click", function (e) {
    let youtube_url = $("#txt_youtube_url").val();
    let target_folder = $("#txt_target_folder").val();
    target_folder = target_folder.replace(/ +/g, "_");
    $("#txt_target_folder").val(target_folder);
    $("#textAreaExample1").html("");
    $.post("/runcommand", { youtube_url: youtube_url, target_folder: target_folder }, function (data) {
      console.log(data);
    });
  });

  $("#btnSearch").bind("click", function (e) {
    // var idx = currentPath.lastIndexOf("%2F");
    let word = $("#txt_search_folders").val();
    let path = $("#currentPath").text().replace(/\\/g, "/");
    console.log(`word : ${word} - path : ${path}`);
    if (word == "") return;
    $.get("/search?path=" + path + "&word=" + word).then(function (data) {
      table.fnClearTable();
      table.fnAddData(data);
    });
  });
})(jQuery);
