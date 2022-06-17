
/**Notes
* Errors with angles over 100
**/
let exampleCone;

function setup() {
  print("hi");
  createCanvas(windowWidth, windowHeight);
  
  background(255);
  
  //exampleCone = new StackingCone(windowWidth/2, windowHeight-windowWidth/(4*tan(coneAngle/2)), coneAngle);
  exampleCone = new StackingCone(0, 0, 200, 0.05);
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

  //drawExtendedFront();
  exampleCone.drawFront();

}

function mouseClicked() {
  exampleCone.nextDiskStackingIteration();
}