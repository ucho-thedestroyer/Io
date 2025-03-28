var rectSize,sonarPower,pulseCooldown,numColorRect,sonarSpeed;
var grid, rayonSonar,centerSonarX,centerSonarY,countPulse;

var canvas = document.getElementsByTagName("canvas")[0];
var ctx = canvas.getContext("2d");
window.onresize = resizeCanvas;
window.addEventListener('mousedown', mousePressed);
resizeCanvas();

rectSize = 6;
sonarPower=4;
pulseCooldown = 150;
numColorRect = 150;
sonarSpeed = 20;
//////

grid = [];
countPulse=pulseCooldown+1;
rayonSonar = -1;
frameCount = 0;
draw();

/**
main loop
*/
function draw() {
  //ctx.fillStyle = "#111111";
  //ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (i = 0; i <=  Math.floor(canvas.width/rectSize); i++) {
    for (j = 0; j <=  Math.floor(canvas.height/rectSize); j++) {
      var distS = isUnderSonarRayon(i,j);
      if(((distS < rayonSonar +1*rectSize && distS > rayonSonar-rectSize  ) 
         || (distS < rayonSonar -sonarPower*rectSize && distS > rayonSonar -sonarPower*rectSize-rectSize)
          )&& rayonSonar>=0){
        ctx.fillStyle = "rgba(40,40,40,"+map(rayonSonar,0,pulseCooldown*sonarSpeed/2,0.7,0.1)+")";
      }
      else{
        ctx.fillStyle = "rgba(30,30,30,"+0.3+")";
      }
      if (grid[i + "," + j] != null && distS<rayonSonar && distS>rayonSonar-sonarPower*rectSize) {
        ctx.fillStyle = "hsla("+(frameCount/5+grid[i + "," + j]*15)+",90%,50%,0.2)";
      }
      //ctx.fillRect(2+i * rectSize, 2+j * rectSize, rectSize - 2, rectSize - 2);
      var srec = map(distS-rayonSonar*0.7,0,canvas.width/2,rectSize,2);
      ctx.fillRect(2+i * rectSize+rectSize/2, 
                   2+j * rectSize+rectSize/2
                   , srec - 2, srec - 2);
    }
  }
  
  if(rayonSonar>=0 ){
    rayonSonar+=sonarSpeed;
  }
  if( rayonSonar>max(canvas.width*1.4,canvas.height*1.4)){
    rayonSonar=-1;
  }
  if(countPulse>pulseCooldown){
    generateGrid(canvas.width/2,canvas.height/2,numColorRect);
  }
  countPulse++;
  frameCount++;
  requestAnimationFrame(draw);
}
///////////////////////////////////
function generateGrid(cx, cy, power) {
  countPulse=0;
  rayonSonar = 0;
  centerSonarX = cx;
  centerSonarY = cy;
  grid = [];
  
  cx = constrain(Math.floor(cx / rectSize), 0,  Math.floor(canvas.width/rectSize));
  cy = constrain(Math.floor(cy / rectSize), 0,  Math.floor(canvas.height/rectSize));
 
  var x = cx;
  var y = cy;
  var previous=-1;
  grid[x + "," + y] = 1;
  
  for (i = 0; i < power; i++) {
    var nTry = 0;
    while(nTry<4){
      var rand = Math.random();
      if (rand < 0.25 && previous!=0) {
        x += 1; previous = 1; nTry=4;
      } else if (rand < 0.50 && previous!=1) {
        x -= 1; previous = 0;nTry=4;
      } else if (rand < 0.75 && previous!=2) {
        y += 1; previous = 3;nTry=4;
      } else if(previous!=3) {
        y -= 1; previous = 2;nTry=4;
      } 
      nTry++;
    }

    if (grid[x + "," + y] == 1) grid[x + "," + y] += 1;
    else grid[x + "," + y] = 1;
    if (x<0 || y<0 || x>canvas.width/rectSize || y>canvas.height/rectSize) {
      x = cx;
      y = cy
    }
  }
 
}
function isUnderSonarRayon(i,j){

  return dist(i*rectSize,j*rectSize,centerSonarX,centerSonarY) ;

}


/////////////////general tools///////////////
function dist(x1, y1, x2, y2) {
  var dx, dy;
  dx = x1 - x2;
  dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);

}

function map(value, istart, istop, ostart, ostop) {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

function max(v1, v2){
  return v1>v2?v1:v2;
}
function constrain(value, min, max) {
  if (value > max) return max;
  if (value < min) return min;
  return value;
}
/**
mouse pressed
*/
function mousePressed(e) {
  generateGrid(e.offsetX, e.offsetY, numColorRect);
  ctx.fillStyle = "#111111";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
/**
resize tool
*/
function resizeCanvas() {
  canvas.width = (window.innerWidth);
  setTimeout(function() {
    canvas.height = (window.innerHeight);
  }, 0);
  
};
