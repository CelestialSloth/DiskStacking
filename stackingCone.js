/**This class represents the Cone, which controls the disk stacking. It contains methods related to disk stacking calculations and tasks.*/

class StackingCone {
  /* Constructor for the cone
  @param vertexX, vertexY: the x and y values for the vertex; the vertex angle in degrees
  @param angle: the angle of the vertex*/
  constructor(vertexX, vertexY, angle) {
    this.angle = angle;
    this.vertexX = vertexX;
    this.vertexY = vertexY;
    this.disks = []; //contains actual disk objects
    this.diskNumber = 1;
    this.front = []; //the indices of disks (from disks[]) in the front will be contained in this array, in order, from left to right
  }

  /*TODO: Automatically sets up the default front*/
  setUpFirstFront() {
    
  }

  /*TODO: Using the current front, this method finds and adds the next child disk in the proper (lowest) location, and updates the front[].*/
  nextDiskStackingIteration() {
    //determine child disk candidates

    //find lowest candidate

    //add lowest candidate to disks[]

    //In front[], delete disks between parents of the lowest disk

    //In front[], insert the child disk in the proper location (probably between the parents but there could be exceptions)
  }

  /*TODO: Using the current front, this method determines all the locations where a child disk could be placed. Returns an array of candidates.
  @return the array of candidates*/
  determineChildCandidates() {

    //Note: make sure no candidates are overlapping with other disks in the front!
    
  }

  /*TODO: Given a list of child candidates, this method determines the lowest candidate and returns its index.
  @param candidates: the array of candidate children
  @return the index of the lowest child disk.*/
  findLowestCandidate(candidates) {
    
  }

  /*TODO: Given the lowest child candidate, this method determines its proper location in front[] and adds it there. We assume that disks between the parents have already been deleted.
  @param child: the child candidate to be added to front[]*/
  addChildToFront(child) {
    
  }
  
  
  /*Draws the cone*/
  display() {
    fill(0);
    let radius = windowWidth;
    angleMode(DEGREES);

    push();
    this.createTransform();
    
    strokeWeight(3/windowHeight);
    line(this.vertexX, this.vertexY, this.vertexX+cos(90-this.angle/2), this.vertexY+sin(90-this.angle/2));
    line(this.vertexX, this.vertexY, this.vertexX-cos(90-this.angle/2), this.vertexY+sin(90-this.angle/2));

    //draw all of the disks
    for (let disk of this.disks) {
      disk.displayDisk();
    }

    //add the text to the disks
    for(let disk of this.disks) {
      push();
      translate(disk.x, disk.y);
      scale(1,-1);
      disk.displayDiskText();
      pop();
    }

    pop();

  }

  /*Puts the canvas into the mode used to draw everything.*/
  createTransform() {
    translate(windowWidth/2, windowHeight/2);
    //before, we're assuming 1 = 100%
    scale(windowHeight/2);
    scale(1,-1);
  }

  /*A method to manually add disks to the cone. This method (not anything in disk.js) should be used.
  @param x, y: the coordinates for the new disk
  @param radius: the radius of the new disk*/
  addDiskManually(x, y, radius) {
    newDisk = new Disk(x, y, radius, this.diskNumber);
    this.disks.push(newDisk);
    this.diskNumber ++;
  }

  /*Finds the location of a child Disk given two parents. Does not check for overlap. Assumes all disks have same radius.
  @param or parent1, pare two disks that could be parents
  @return: the child disk (if there is one) OR some indicator that no such child exists.*/
  //TODO: add opposedness test
  childDisk(parent1, parent2) {
    let radius = parent1.radius; //radius for all disks

    //determine the distance between the disks
    let distBtwnParents = this.distanceBtwnDisks(parent1, parent2);

    //check if parent disks are too far apart. If so, return null
    if(distBtwnParents > radius*4){
      print("--too far, returning null");
      return null;
    }


    //determine if we need to rotate parent2 to have the minimum *physical* distance between the parent disks. Create new letiable for parent2 based on this.
    let parent2New;
    if(distBtwnParents < dist(parent1.x, parent1.y, parent2.x, parent2.y)) {
      parent2New = this.rotatedDisk(parent2);
    } else {
      parent2New = parent2;
    }

    //determine the child's position, using simplifying assumptions about radii and angles
    let vectorP1ToP2 = createVector(parent2New.x-parent1.x, parent2New.y-parent1.y); //vector pointing in direction of parent2New, if placed at parent1
    let normalVector = createVector(-vectorP1ToP2.y, vectorP1ToP2.x).normalize(); //vector that is normal to vectorP1ToP2
    let scaledNormalVector = p5.Vector.mult(normalVector, 0.5 * sqrt((16*radius*radius) - (distBtwnParents*distBtwnParents))); //scale normalVector so when added to point halfway between parent1 and parent2New, final vector is position of a child disk
    //point that is halfway between the two parent vectors
    let halfwayPoint = createVector( (parent1.x+parent2New.x)/2, (parent1.y+parent2New.y)/2);
    
    //two possibilities for children
    let childLocation1 = p5.Vector.add(scaledNormalVector, halfwayPoint);
    let childLocation2 = p5.Vector.add(scaledNormalVector.mult(-1), halfwayPoint);

    let child;
    //return the highest child
    if(childLocation1.y > childLocation2.y) {
      child = new Disk(childLocation1.x, childLocation1.y, radius);
    } else {
      child = new Disk(childLocation2.x, childLocation2.y, radius);
    }

    //check if the new child is on the cone or not. If not, rotate it.
    if(this.isOffCone(child)) {
      child = this.rotatedDisk(child);
    }

    //finally, return the child disk
    return child;
  }

  /*TODO: Test whether a child is situated between its two parents. Does not account for rotation.
  @param child: the child Disk
  @param parent1, parent2: the two parent Disks
  @return true/false: whether the child is actually between both parents.*/
  isBetweenParents(child, parent1, parent2) {
    
  }
  
  /*Finds the actual distance between two disks, accounting for rotation.
  @param disk1, disk2: the two Disks to find the distance between
  @return float: the distance between the disks*/
  distanceBtwnDisks(disk1, disk2) {
    let nonRotatedDistance = dist(disk1.x, disk1.y, disk2.x, disk2.y);
    let rotatedDisk2Pos = this.rotatedDisk(disk2);
    let rotatedDistance = dist(disk1.x, disk1.y, rotatedDisk2Pos.x, rotatedDisk2Pos.y);

    return min(nonRotatedDistance, rotatedDistance);
  }

  /*Returns the disk's equivalent location on the other side of the cone (due to rotation)
  @param disk the Disk to rotate
  @return (Disk) a Disk in the equivalent position*/
  rotatedDisk(disk) {
    let vertexToDiskVector = createVector(disk.x-this.vertexX, disk.y-this.vertexY);

    angleMode(DEGREES);
    //if on the right side of cone, rotate to left
    if(disk.x > this.vertexX) {
      vertexToDiskVector.rotate(this.angle);
    }
    //if on left side of cone, rotate all the way around, ending up on the right
    else {
      vertexToDiskVector.rotate(360-this.angle);
    }
    
    return new Disk(this.vertexX + vertexToDiskVector.x, this.vertexY + vertexToDiskVector.y, disk.radius);
  }

  /*Returns the distance of a disk to the cone's vertex
  @param disk the disk
  @return (float) the distance of the disk to the cone's vertex*/
  distanceToVertex(disk) {
    return dist(disk.x, disk.y, vertexX, vertexY);
  }

 
  /*test if there is an overlap between disks
  @param disk1 disk2: two disks
  @return true if there is an overlap, false if no 
  overlap*/
  isOverlap(disk1,disk2){ 

    if (distanceBtwnDisks(disk1, disk2) < 2*disk1.radius) {
      return true;
      print ("there is an overlap");
    }
    else {
      return false;
      print ("no overlap");
    } 
    }

  /*Determines whether a disk's center will be drawn off the cone.
  @param disk: the disk to check
  @return T/F: whether the disk is off the cone or not*/
  isOffCone(disk) {

    //first, check if it's below the cone somehow
    if(disk.y < this.vertexY) {
      return true;
    }
    
    //create a vector pointing to disk if positioned at cone vertex
    let vertexToDisk = createVector(disk.x - this.vertexX, disk.y - this.vertexY);
    
    let angleBtwnSideAndDisk;
    angleMode(DEGREES);
    
    //if on left side, check if over left
    if(disk.x < this.vertexX) {
      let leftConeSide = createVector(-cos(90-this.angle/2), sin(90-this.angle/2));
      angleBtwnSideAndDisk = vertexToDisk.angleBetween(leftConeSide);
    }
    //if on right side, check if over right
    else {
      let rightConeSide = createVector(cos(90-this.angle/2), sin(90-this.angle/2));
      angleBtwnSideAndDisk = rightConeSide.angleBetween(vertexToDisk);
    }

    //the disk is "off" the cone if angleBtwnSideAndDisk > 0 (just because of how angleBtwnSideAndDisk was calculated)
    if(angleBtwnSideAndDisk < 0) {
      return true;
    }
    return false;
  }
}



  