const GG_API_KEY = "AIzaSyC1WyP_glm0d4wW1vYqW8IVwl-kOhhnpIo";
const GG_API_LINK ="https://www.googleapis.com/drive/v3/files/";

ipcRenderer.on('capture', () => {
  var myCanvas = $('#select_canvas').get(0);
  var myCanvasContext = myCanvas.getContext('2d');
  myCanvasContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
  document.body.style.cursor = "crosshair";
  document.getElementById('select_canvas').style.opacity = 0.5;
  document.getElementById('select_canvas').style.background = "aliceblue";
  $("#select_canvas").show();
});
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    var myCanvas = $('#select_canvas').get(0);
    myCanvas.width = window.innerWidth;
    myCanvas.height = window.innerHeight;
}
resizeCanvas();
$("#start_select").click(function() {
  var myCanvas = $('#select_canvas').get(0);
  var myCanvasContext = myCanvas.getContext('2d');
  myCanvasContext.clearRect(0, 0, myCanvas.width, myCanvas.height)
  $("#select_canvas").show();
});
var start = null;
var ctx = $("#select_canvas").get(0).getContext('2d');
$("#select_canvas").mousedown(function(e) {
  start = [e.offsetX, e.offsetY];
  document.getElementById('select_canvas').style.opacity = 1;
  document.getElementById('select_canvas').style.background = "";
  ctx.globalAlpha = 0.5;
}).mouseup(function(e) {
  end = [e.offsetX, e.offsetY];

  $(this).hide();
  document.body.style.cursor = "";
  setTimeout(() => {ipcRenderer.send('capture-done', start, end);start = null;}, 100);

}).mousemove(function(e) {
  if(!start) return;

  ctx.clearRect(0, 0, this.offsetWidth, this.offsetHeight);
  ctx.beginPath();

  var x = e.offsetX,
      y = e.offsetY;

  ctx.rect(start[0], start[1], x - start[0], y - start[1]);
  ctx.fillStyle = "#b5b5b5";
  ctx.fill();
  ctx.lineWidth="4";
  ctx.strokeStyle="#6c6c6c";
  ctx.stroke();
});

// Menu
function homeMenu() {
  $(".area").children().css("display", "none");
  $("#cbox-frame").css("display", "block");
}
function ytMenu() {
  $(".area").children().css("display", "none");
  $("#youtube").css("display", "block");
}
function ggMenu() {
  $(".area").children().css("display", "none");
  $("#ggdrive").css("display", "block");
}
// Youtube function
function ytAnalyst() {
  var id =  document.getElementById("yt-link").value.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/i);
  if(!id) {
    document.getElementById("yt-display").innerHTML = "<p style='color:red'>Not a YouTube link<p>";
  } else {
    document.getElementById("yt-display").innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + id[1] +'?rel=0&autoplay=1&loop=1&playlist=' + id[1] +'" frameborder="0" allowfullscreen></iframe><br>'
    $.ajax({
      url: "http://www.youtube.com/get_video_info?video_id=" + id[1],
      dataType: "text"
    }).done((data) => {
      data = parseStr(data);
      var streams = data['url_encoded_fmt_stream_map'].split(",");
      for (var idx = 0; idx < streams.length; idx++){
        var realStream = parseStr(streams[idx]);
        var stype = realStream['type'];
        if(stype.indexOf(';') > -1) {
          var tmp = stype.split(";");
          stype = tmp[0];
        }
        document.getElementById("yt-display").innerHTML += '<div class="form-inline"><div class="form-group"><label style="width:150px;text-transform: uppercase;margin-right: 20px;">' + realStream['quality'] + '  '
        + stype + '</label>' + '<input class="form-control" id="yt-link'+idx+'" value="' + realStream['url'] + '" readonly style="width: 250px;height: 25px;margin-right: 20px;">'
        + '</div><div class="form-group"><button class="btn btn-default btnC" id="yt-bt-link'+idx+'" data-clipboard-target="#yt-link'+idx+'"><i class="fa  fa-clipboard fa-lg" style="height: 25px;width: 30px;"></i></button></div></div><br>';
      }


      $('.btnC').tooltip({
        trigger: 'click',
        placement: 'bottom'
      });
      function setTooltip(message, id) {
        $('#'+id).tooltip('hide')
          .attr('data-original-title', message)
          .tooltip('show');
      }
      function hideTooltip(id) {
        setTimeout(function() {
          $('#'+id).tooltip('hide');
        }, 1000);
      }
      // Initialize Copy to Clipboard
      var btns = document.querySelectorAll('.btnC');
      var clipboard = new Clipboard(btns);
      clipboard.on('success', function(e) {
        setTooltip('Copied!', e.trigger.id);
        hideTooltip(e.trigger.id);
      });
    });
  }
}
// Googe Drive
function ggAnalyst() {
  var id =  document.getElementById("gg-link").value.match(/https?:\/{2}drive.google.com\/file\/d\/([^/]*).*/i);
  if(!id) {
    // Check folder
    id =  document.getElementById("gg-link").value.match(/https?:\/{2}drive.google.com\/drive\/folders\/([^/?]*).*/i);
    $.ajax({
      url: GG_API_LINK + id[1] + "?key=" + GG_API_KEY,
    }).done((json) => {
      document.getElementById("gg-display").innerHTML = "<h4>" + json['name'] + "</h4>";
      $.ajax({
        url: "https://www.googleapis.com/drive/v2/files?q='"+id[1]+"'+in+parents&key=" + GG_API_KEY,
      }).done((data) => {
        data.items.forEach((item, idx) => {
          document.getElementById("gg-display").innerHTML += '<div class="form-inline"><div class="form-group"><img src="'+item["thumbnailLink"]+'" alt="VNA" class="img-thumbnail"><label style="width:150px;text-transform: uppercase;margin-right: 20px;">'+item["originalFilename"]+'</label>'
          + '<input class="form-control" id="gg-link-'+idx+'" value="'+GG_API_LINK+item["id"]+'?alt=media&key='+GG_API_KEY+'" readonly style="width: 250px;height: 25px;margin-right: 20px;">'
          + '</div><div class="form-group">' + '<button class="btn btn-default btnC" id="gg-bt-link-'+idx+'" data-clipboard-target="#gg-link-'+idx+'" style="    margin-left: 10px;"><i class="fa  fa-clipboard fa-lg" style="height: 25px;width: 30px;"></i></button>'
          +'<a href="#" onclick="shell.openExternal(\'https://docs.google.com/uc?export=download&id='+item["id"]+'\');"><button class="btn btn-default"><i class="fa  fa-download fa-lg" style="height: 25px;width: 30px;"></i></button></a></div></div><br>';
        });
        $('.btnC').tooltip({
          trigger: 'click',
          placement: 'bottom'
        });
        function setTooltip(message, id) {
          $('#'+id).tooltip('hide')
            .attr('data-original-title', message)
            .tooltip('show');
        }
        function hideTooltip(id) {
          setTimeout(function() {
            $('#'+id).tooltip('hide');
          }, 1000);
        }
        // Initialize Copy to Clipboard
        var btns = document.querySelectorAll('.btnC');
        var clipboard = new Clipboard(btns);
        clipboard.on('success', function(e) {
          setTooltip('Copied!', e.trigger.id);
          hideTooltip(e.trigger.id);
        });
      });
    });
  } else {
    $.ajax({
      url: GG_API_LINK + id[1] + "?key=" + GG_API_KEY,
    }).done((data) => {
      document.getElementById("gg-display").innerHTML =  '<div class="form-inline"><div class="form-group"><label style="width:150px;text-transform: uppercase;margin-right: 20px;">'+data["name"]+'</label>'
      + '<input class="form-control" id="gg-link-single" value="'+GG_API_LINK+id[1]+'?alt=media&key='+GG_API_KEY+'" readonly style="width: 250px;height: 25px;margin-right: 20px;">'
      + '</div><div class="form-group">' + '<button class="btn btn-default btnC" id="gg-bt-link-single" data-clipboard-target="#gg-link-single" style="    margin-left: 10px;"><i class="fa  fa-clipboard fa-lg" style="height: 25px;width: 30px;"></i></button>'
      + '<a href="#" onclick="shell.openExternal(\'https://docs.google.com/uc?export=download&id='+id[1]+'\');"><button class="btn btn-default"><i class="fa  fa-download fa-lg" style="height: 25px;width: 30px;"></i></button></a></div></div><br>';
      $('.btnC').tooltip({
        trigger: 'click',
        placement: 'bottom'
      });
      function setTooltip(message, id) {
        $('#'+id).tooltip('hide')
          .attr('data-original-title', message)
          .tooltip('show');
      }
      function hideTooltip(id) {
        setTimeout(function() {
          $('#'+id).tooltip('hide');
        }, 1000);
      }
      // Initialize Copy to Clipboard
      var btns = document.querySelectorAll('.btnC');
      var clipboard = new Clipboard(btns);
      clipboard.on('success', function(e) {
        setTooltip('Copied!', e.trigger.id);
        hideTooltip(e.trigger.id);
      });
    });
  }
}

// Util
function parseStr(str) {
  var result = {};
  str.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}
