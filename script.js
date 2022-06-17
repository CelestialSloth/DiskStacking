
/**Notes
* Errors with angles over 100
**/
let exampleCone;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  background(255);
  
  //exampleCone = new StackingCone(windowWidth/2, windowHeight-windowWidth/(4*tan(coneAngle/2)), coneAngle);
  exampleCone = new StackingCone(0, -.8, 90, 0.05);
  /*let iterations = 0;
  for(let i = 0; i < iterations; i ++) {
    exampleCone.nextDiskStackingIteration();
  }*/

 
}

function draw() {
  background(255);
  
  exampleCone.drawAxes();

  //draw the cones
  exampleCone.display();
  
  exampleCone.drawOntologicalGraph();
  
  //drawExtendedFront();
  exampleCone.drawFront();

}

function mouseClicked() {
  exampleCone.nextDiskStackingIteration();
}