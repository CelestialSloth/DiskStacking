
/**Notes
* Errors with angles over 100
**/
let cone;
p5.disableFriendlyErrors = true; // disables FES

function setup() {
  createCanvas(windowWidth, 0.6*windowHeight);
  
  background(255);
  
  cone = new StackingCone(0, -.8, 50, 0.05, 0.5);

  let startTime = performance.now()
  
  //exampleCone = new StackingCone(windowWidth/2, windowHeight-windowWidth/(4*tan(coneAngle/2)), coneAngle);
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
  }
}

function resetCone(angle = 130, height = 0.6) {
  cone.reset(angle,height);
}