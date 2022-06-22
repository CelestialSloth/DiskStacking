
/**Notes
* Errors with angles over 100
**/
let cone;

function setup() {
  createCanvas(windowWidth, 0.6*windowHeight);
  
  background(255);
  
  //exampleCone = new StackingCone(windowWidth/2, windowHeight-windowWidth/(4*tan(coneAngle/2)), coneAngle);
  cone = new StackingCone(0, -.8, 50, 0.05, 0.5);
  /*let iterations = 0;
  for(let i = 0; i < iterations; i ++) {
    cone.nextDiskStackingIteration();
  }
*/
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