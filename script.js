
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
  exampleCone = new StackingCone(windowWidth/2, windowHeight*0.8, coneAngle);
  exampleDisk = new Disk(windowWidth/2 + 90, windowHeight * 0.3, 30, 1);
  exampleDisk2 = new Disk(windowWidth/2+90, windowHeight*0.45, 30, 2);
  childDisk = exampleCone.childDisk(exampleDisk, exampleDisk2);
  childDisk.text = 'child';
  rotatedDisk = exampleCone.rotatedDisk(exampleDisk2);
  rotatedDisk.text = "2'";
  offDisk = new Disk(600, 200, 30, 'off');

  exampleCone.disks.push(exampleDisk);
  exampleCone.disks.push(exampleDisk2);
  exampleCone.disks.push(rotatedDisk);
  exampleCone.disks.push(childDisk);
  exampleCone.disks.push(offDisk);
}

function draw() {
  background(255);

  //reference axes for debugging
  stroke(255,0,0);
  fill(255,0,0);
  line(0, windowHeight/2, windowWidth, windowHeight/2);
  line(windowWidth/2, 0, windowWidth/2, windowHeight);
  textSize(12);
  text('x = ' + windowWidth/2, windowWidth/2, 30);
  text('y = ' + windowHeight/2, 30, windowHeight/2);
  stroke(0);

  //draw the cones
  exampleCone.display();
}