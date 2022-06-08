/**Represent the cone*/
class Cone {
  /* Constructor for the cone
  @param vertexX, vertexY: the x and y values for the vertex; the vertex angle in degrees
  @param angle: the angle of the vertex*/
  constructor(vertexX, vertexY, angle) {
    this.angle = angle;
    this.vertexX = vertexX;
    this.vertexY = vertexY;
  }

  /*Draws the cone*/
  display() {
    fill(0);
    ellipse(this.vertexX, this.vertexY, 10, 10);
    var radius = 400;
    angleMode(DEGREES);
    line(this.vertexX, this.vertexY, this.vertexX+radius*cos(90-this.angle/2), this.vertexY-radius*sin(90-this.angle/2));
    line(this.vertexX, this.vertexY, this.vertexX-radius*cos(90-this.angle/2), this.vertexY-radius*sin(90-this.angle/2));
  }

  /*Finds the location of a child Disk given two parents. Does not check for overlap. Assumes all disks have same radius.
  @param or parent1, pare two disks that could be parents
  @return: the child disk (if there is one) OR some indicator that no such child exists.*/
  /*childLocation(parent1, parent2) {
    var radius = parent1.radius; //radius for all disks
    
    //check if parent disks are too far apart
    if(dist(parent1.x, parent1.y, parent2.x, parent2.y) > radius*4){
      //TODO check if you can rotate them closer
      return null;
    }

    //find location where child would be
    
  }*/

  /*Returns the disk in its equivalent location on the other side of the cone (due to rotation)
  @param disk the disk to rotate
  @return a new disk in an equivalent position*/
  rotatedDisk(disk) {
    
  }

  /**TODO: Determines whether any part disk is off of the boundary*/
  diskIsOffBoundary(disk) {
    
  }

  // test if there is an overlap if part of a disk is off the 
  // boundry
  function OutsideIsOverlap(disk) {

    if (((widowHeight-disk.y)*tan(this.angle/2) - abs(disk.x- 
    windowWidth/2)) < disk.radius) {
      //in this case the disk is off the boundry, write a 
     //code to determine if there is an overlap
    } else {
      WinthinIsOverlap(disk)
    }
    
  }




  
}

/**Represents one Disk*/
class Disk {
  /*Constructor for the Disk
  @param x, y: the coordinates of the Disk
  @param radius: the radius of the Disk*/
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  /*Draws the Disk*/
  display() {
    fill(200, 200, 200);
    ellipse(this.x, this.y, this.radius, this.radius);
  }

  // test if the two disks within the boundry have overlaps
  static WithinIsOverlap(disk1, disk2) {

    // if the distance between the center of the two disks is 
    // less than 2*radius, then there is an overlap
    if (sqrt(sq(disk1.x-disk2.x)+sq(disk1.y-disk2.y)) < 
    disk1.radius + disk2.radius) {
      return true;
    } else {
      return false;
    }
  }

}

var exampleCone;

function setup() {
  createCanvas(windowWidth, windowHeight);
    background(255);
  angleMode(DEGREES);
  coneAngle = 179;
  //exampleCone = new Cone(windowWidth/2, windowHeight-windowWidth/(4*tan(coneAngle/2)), coneAngle);
  exampleCone = new Cone(windowWidth/2, windowHeight*0.75, coneAngle);
}

function draw() {
  exampleCone.display();
}

