$(document).ready(function() {
  const btnSound = new Audio(
    "http://www.jarrodyellets.com/sounds/radioButton.mp3"
  );
  const radioOn = new Audio("http://www.jarrodyellets.com/sounds/radioOn.mp3");
  const radioOff = new Audio("http://www.jarrodyellets.com/sounds/CRTOff.mp3");
  const static = new Audio("http://www.jarrodyellets.com/sounds/static.mp3");
  const rap = new Audio("https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/TRKS/epilogue.m4a");
  const eclectic = new Audio("http://50.22.253.46/supernovaradio");
  const jazz = new Audio("http://stream.100000000000000.com:8000/JAZZ");
  const rock = new Audio("http://orpheus.noctrl.edu:8000/wonclive-128s");
  const pop = new Audio("http://live.galaxy-mittelfranken.de:8000/live");
  const oldies = new Audio("http://uplink.intronic.nl/rgrfm_oldiesradio");
  const various = new Audio("http://stream-sd1.radioparadise.com/aac-128");
  const college = new Audio("http://www.cjsf.ca:8000/listen-hq");
  const npr = new Audio("http://wgltradio.ilstu.edu:8000/wgltmain.mp3");
  const trance = new Audio("http://globaldjbroadcast.cc:8000/96k");
  let currentStation = static;
  let startUp = false;
  let startTimeout;
  let needlePos;
  let posNum;
  let turnLeft;
  let turnRight;
  let power = false;
  
  static.loop = true;

  $("#btn1").on("mousedown", function() {
    moveButton(105);
  });
  $("#btn2").on("mousedown", function() {
    moveButton(75);
  });
  $("#btn3").on("mousedown", function() {
    moveButton(305);
  });
  $("#btn4").on("mousedown", function() {
    moveButton(240);
  });
  $("#btn5").on("mousedown", function() {
    moveButton(140);
  });

  $("#left-knob").on("mousedown touchstart", function() {
    posNum = $(".needle").css("left");
    needlePos = Number(posNum.slice(0, posNum.length - 2));
    turnLeft = setInterval(function() {
      if (needlePos < 370) {
        $(".needle").css("left", (needlePos -= 3));
        $("body")
          .addClass("dummy")
          .removeClass("dummy");
        if (power) {
          checkStations(needlePos);
        }
      }
    }, 150);
  });

  $("#left-knob").on("mouseup touchend", function() {
    clearInterval(turnLeft);
  });

  $("#right-knob").on("mousedown touchstart", function() {
    posNum = $(".needle").css("left");
    needlePos = Number(posNum.slice(0, posNum.length - 2));
    turnRight = setInterval(function() {
      if (needlePos > 10) {
        $(".needle").css("left", (needlePos += 3));
        $("body")
          .addClass("dummy")
          .removeClass("dummy");
        if (power) {
          checkStations(needlePos);
        }
      }
    }, 150);
  });

  $("#right-knob").on("mouseup touchend", function() {
    clearInterval(turnRight);
  });

  $(".power").click(function() {
    power = !power;
    if (power) {
      startUp = true;
      radioOn.play();
      $(".power").addClass("powerOn");
      setTimeout(function() {
        $(".light").addClass("lightOn");
      }, 500);
      startTimeout = setTimeout(function() {
        checkStations(needlePos);
        startUp = false;
      }, 4700);
    } else if (!power) {
      clearTimeout(startTimeout);
      radioOn.pause();
      radioOn.currentTime = 0;
      radioOff.play();
      currentStation.pause();
      currentStation.currentTime = 0;
      $(".power").removeClass("powerOn");
      setTimeout(function() {
        $(".light").removeClass("lightOn");
      }, 450);
    }
  });

  function checkStations(n) {
    if (n > 40 && n < 50) {
      switchStation(various);
    } else if (n > 70 && n < 80) {
      switchStation(jazz);
    } else if (n > 100 && n < 110) {
      switchStation(eclectic);
    } else if (n > 135 && n < 145) {
      switchStation(rap);
    } else if (n > 170 && n < 180) {
      switchStation(pop);
    } else if (n > 210 && n < 220) {
      switchStation(rock);
    } else if (n > 235 && n < 245) {
      switchStation(oldies);
    } else if (n > 265 && n < 275) {
      switchStation(college);
    } else if (n > 300 && n < 310) {
      switchStation(npr);
    } else if (n > 345 && n < 355) {
      switchStation(trance);
    } else {
      switchStation(static);
    }
  }

  function switchStation(s) {
    currentStation.pause();
    currentStation = s;
    currentStation.play();
  }
 

  function moveButton(n) {
    needlePos = n;
    btnSound.pause();
    btnSound.currentTime = 0;
    btnSound.play();
    $(".needle").css("left", n);
    if (power && !startUp) {
      setTimeout(function() {
        checkStations(n);
      }, 300);
    }
  }
});
