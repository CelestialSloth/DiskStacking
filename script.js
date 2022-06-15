
/**Notes
* 
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
  coneAngle = 90;
  //exampleCone = new StackingCone(windowWidth/2, windowHeight-windowWidth/(4*tan(coneAngle/2)), coneAngle);
  //print("creating exampleCone");
  exampleCone = new StackingCone(0, -0.5, coneAngle);

  //print("setUpFirstFront");
  exampleCone.setUpFirstFront(0.1);
    
  //test generateExtendedFront
  //print("testing generateExtendedFront");
  let extendedFront = [];
  //extendedFront = exampleCone.generateExtendedFront();
  
  

  //print("\n\n\n")

  //test determineChildCandidates
  //print("testing candidates");
  //childCandidates = exampleCone.determineChildCandidates();
  //print("done testing candidates");
  
  
}

function draw() {
  background(255);
  
  drawAxes();

  
  /*push();
  exampleCone.createTransform();
  strokeWeight(3/windowHeight);
  for (disk of childCandidates) {
    disk[0].displayDisk([255,0,0]);
  }
  
  pop();*/
  
  //draw the cones
  exampleCone.display();

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
    let disk1 = exampleCone.disks[exampleCone.front[index]];
    let disk2 = exampleCone.disks[exampleCone.front[index + 1]];

    line(disk1.x, disk1.y, disk2.x, disk2.y);
  }
  pop();
}

function mouseClicked() {
  print("clicked the mouse");
  exampleCone.nextDiskStackingIteration();
  print("finished running nextDiskStackingIteration()");
}