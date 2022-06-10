
/**Notes
* Start by programming diskIsOffBoundary and rotatedDisk methods
* Then work on childLocation and overlap methods
**/
var exampleCone;
var exampleDisk;
var exampleDisk2;
var childDisk;
var rotatedDisk;

function setup() {
  createCanvas(windowWidth, windowHeight);
    background(255);
  angleMode(DEGREES);
  coneAngle = 90;
  //exampleCone = new Cone(windowWidth/2, windowHeight-windowWidth/(4*tan(coneAngle/2)), coneAngle);
  exampleCone = new StackingCone(0, 0, coneAngle);
  exampleDisk = new Disk(0.2, 0.3, 0.1, 1);
  exampleDisk2 = new Disk(0.4, 0.45, 0.1, 2);
  childDisk = exampleCone.childDisk(exampleDisk, exampleDisk2);
  childDisk.text = 'child';
  rotatedDisk = exampleCone.rotatedDisk(exampleDisk2);
  rotatedDisk.text = "2'";
  offDisk = new Disk(0.9, 0.3, 0.1, 'off');

  exampleCone.disks.push(exampleDisk);
  exampleCone.disks.push(exampleDisk2);
  exampleCone.disks.push(rotatedDisk);
  exampleCone.disks.push(childDisk);
  exampleCone.disks.push(offDisk);
  

  print(exampleCone.isOffCone(offDisk));
}

function draw() {
  background(255);

  //reference axes for debugging
  push();
  exampleCone.createTransform();
  stroke(255,0,0);
  fill(255,0,0);
  strokeWeight(5/windowHeight);
  line(-1, 0, 1, 0);
  line(0, -1, 0, 1);
  pop();
  textSize(12);
  fill(255,0,0);
  noStroke();
  text('x = 0', windowWidth/2+10,30);
  text('y = 0',30, windowHeight/2-10);
  stroke(0);

  //draw the cones
  exampleCone.display();
}