
/**Notes
* Errors with angles over 180
**/
let cone;
p5.disableFriendlyErrors = true; // disables FES

function setup() {
  
  let canvas = createCanvas(0.95*windowWidth, 0.6*windowHeight);
  canvas.parent('diskStackingCanvas');
  background(255);
  
  //cone = new StackingCone(0, -.8, 87, 0.075, 1);
  
  cone = new StackingCone(0, -.8, 80, 0.075, 0.5);

  
  let startTime = performance.now()
  
  let iterations = 200;
  for(let i = 0; i < iterations; i ++) {
    cone.nextDiskStackingIteration();
  }


  let endTime = performance.now()

  print((endTime-startTime)/100 + " seconds");
}

function draw() {
  background(255);
  
  cone.drawAxes();

  //draw the cones
  cone.display();
  
  cone.drawOntologicalGraph();
  
  //drawExtendedFront();
  cone.drawFront();

}

function mouseClicked() {
  if(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < width) {
      cone.nextDiskStackingIteration();
      document.getElementById("parastichyNumbersText").innerHTML = reportParastichyNumbers();
  }
}

function resetCone(angle = 130, height = 0.6) {
  cone.reset(angle,height);
}

/*Returns a string that reports the current parastichy numbers.*/
function reportParastichyNumbers() {
  let currentFrontData = cone.frontData[cone.frontData.length - 1];
  return (currentFrontData[0] + ", " + currentFrontData[1]);
}