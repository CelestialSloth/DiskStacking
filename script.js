
/**Notes
* Errors with angles over 100
**/
var exampleCone;
var exampleDisk;
var exampleDisk2;
var childDisk;
var rotatedDisk;
var childCandidates;
var childX;
var childY;

function setup() {
  //print("started setup");
  createCanvas(windowWidth, windowHeight);
    background(255);
  angleMode(DEGREES);
  coneAngle = 100;
  //exampleCone = new StackingCone(windowWidth/2, windowHeight-windowWidth/(4*tan(coneAngle/2)), coneAngle);
  //print("creating exampleCone");
  exampleCone = new StackingCone(0, -0.5, coneAngle);

  exampleCone.setUpFirstFront(0.1);
 
}

function draw() {
  background(255);
  
  drawAxes();

  //draw the cones
  exampleCone.display();

  //drawExtendedFront();
  drawFront();

  
  
}

function drawAxes() {
  //reference axes for debugging
  push();
  exampleCone.createTransform();
  stroke(255,175,175);
  fill(255,175,175);
  strokeWeight(5/windowHeight);
  line(-windowWidth/windowHeight, 0, windowWidth/windowHeight, 0);
  line(0, -1, 0, 1);
  pop();
  textSize(12);
  fill(255,175,175);
  noStroke();
  text('x = 0', windowWidth/2+10,30);
  text('y = 0',30, windowHeight/2-10);
  stroke(0);
}

function drawFront() {
  push();
  exampleCone.createTransform();
  stroke(200, 0, 0);
  strokeWeight(5/windowHeight);
  for(let index = 0; index < exampleCone.front.length - 1; index ++) {
    let disk1 = exampleCone.front[index];
    let disk2 = exampleCone.front[index + 1];

    line(disk1.x, disk1.y, disk2.x, disk2.y);
  }
  pop();
}

function drawExtendedFront() {
  push();
  exampleCone.createTransform();
  stroke(0, 0, 200);
  strokeWeight(5/windowHeight);
  for(let index = 0; index < exampleCone.extendedFront.length - 1; index ++) {
    let disk1 = exampleCone.extendedFront[index];
    let disk2 = exampleCone.extendedFront[index + 1];

    line(disk1.x, disk1.y, disk2.x, disk2.y);
  }
  pop();
}

function mouseClicked() {
  exampleCone.nextDiskStackingIteration();
}