
/**Notes
* 
**/
var exampleCone;
var exampleDisk;
var exampleDisk2;
var childDisk;
var rotatedDisk;
var childCandidates;


function setup() {
  print("started setup");
  createCanvas(windowWidth, windowHeight);
    background(255);
  angleMode(DEGREES);
  coneAngle = 85;
  //exampleCone = new StackingCone(windowWidth/2, windowHeight-windowWidth/(4*tan(coneAngle/2)), coneAngle);
  print("creating exampleCone");
  exampleCone = new StackingCone(0, -0.5, coneAngle);

  /*exampleDisk = new Disk(0.2, 0.3, 0.1, 1);
  exampleDisk2 = new Disk(0.43, 0.4, 0.1, 2);

  childDisk = exampleCone.childDisk(exampleDisk, exampleDisk2);
  if(childDisk !=null){childDisk.text = 'child';}

  rotatedDisk = exampleCone.rotatedDisk(exampleDisk2);
  rotatedDisk.text = "2'";
  offDisk = new Disk(0.9, 0.3, 0.1, 'off');

  exampleCone.disks.push(exampleDisk);
  exampleCone.disks.push(exampleDisk2);
  exampleCone.disks.push(rotatedDisk);
  if(childDisk != null){
      exampleCone.disks.push(childDisk);
  }
  
  exampleCone.disks.push(offDisk);*/

  print("setUpFirstFront");
  exampleCone.setUpFirstFront(0.1);
  
  //print(exampleCone.isOffCone(offDisk));

  //let candidates = [];
  
  //test generateExtendedFront
  print("testing generateExtendedFront");
  let extendedFront = [];
  extendedFront = exampleCone.generateExtendedFront();

  print(exampleCone.front);
  
  //test determineChildCandidates
  print("testing candidates");
  childCandidates = exampleCone.determineChildCandidates();
  print(childCandidates.length);
  print("done testing candidates");
  
}

function draw() {
  background(255);
  
  drawAxes();
  
  //draw the cones
  exampleCone.display();
  for (disk of childCandidates) {
    disk.display();
  }
  
}

function drawAxes() {
  //reference axes for debugging
  /*push();
  exampleCone.createTransform();
  stroke(255,0,0);
  fill(255,0,0);
  strokeWeight(5/windowHeight);
  line(-windowWidth/windowHeight, 0, windowWidth/windowHeight, 0);
  line(0, -1, 0, 1);
  pop();
  textSize(12);
  fill(255,0,0);
  noStroke();
  text('x = 0', windowWidth/2+10,30);
  text('y = 0',30, windowHeight/2-10);
  stroke(0);*/
}