/**This class represents the Cone, which controls the disk stacking. It contains methods related to disk stacking calculations and tasks.*/

/**
Test angularDistanceBetweenDisks for angular distances. Note that this could overestimate distances (ie, a curved 4*r is a little less than 4*r)

Note: 
* could have issues finding children when parents are at say -pi/pi based on how the program is running the opposedness test. (The child wouldn't register as being "between" parents.)
* rotateOntoCone makes some assumptions that could be problematic with larger angles
*/


class StackingCone {
  /* Constructor for the cone
  @param vertexX, vertexY: the x and y values for the vertex; the vertex angle in degrees
  @param angle: the angle of the vertex
  @param diskRadius: the radius of all the disks on the cone*/
  constructor(vertexX, vertexY, angle, diskRadius) {
    this.angle = angle;
    this.vertexX = vertexX;
    this.vertexY = vertexY;
    this.diskRadius = diskRadius;
    
    this.diskNumber = 0; //used as a tag to identify unique disks
    
    this.disks = []; //contains actual disk instances
    this.front = []; //the disks in the front

    //these will be used in several functions, and will contain extended versions of the front and disks. (ie, versions where disks have been rotated to make the front seem longer)
    this.extendedFront = [];

    //rotated "duplicates" of disks in this.disks, drawn to help visualize the cone more
    this.extraDisks = []

    this.setUpFirstFront();
  }

  /*Set up the first default disk and the first index, then 
   add them to the disk array and front array*/
  setUpFirstFront() {
    angleMode(DEGREES);
    let firstdisk = new Disk(0,-(abs(this.vertexY)-this.diskRadius/sin(this.angle/2)),this.diskRadius);
    this.assignNextDiskID(firstdisk);
    this.disks.push(firstdisk);
    this.front.push(firstdisk);
  }

  /**************************************************/
  /*            FUNCTIONS LEVEL 1                   */
  /* Used directly for nextDiskStackingIteration()  */
  /*************************************************/
  
  /*Using the current front, this method finds and adds the next child disk in the proper (lowest) location, and updates the front[].*/
  nextDiskStackingIteration() {
    //determine child disk candidates
    let candidates = this.determineChildCandidates();

    //find lowest candidate. lowestCandidate = [disk, parent1 ID, parent2 ID]
    let lowestCandidate = this.findLowestCandidate(candidates);
    let child = lowestCandidate[0];

    //give it an id
    this.assignNextDiskID(child);
    
    //add lowest candidate to disks[]
    this.disks.push(child);

    //In front[], delete disks between parents of the lowest disk.
    let parent1ID = lowestCandidate[1];
    let parent2ID = lowestCandidate[2];
    this.deleteDisksBetweenParents(parent1ID, parent2ID);
    
    //In front[], insert the child disk in the proper location (probably between the parents but there could be exceptions)
    this.insertChildIntoFront(parent1ID, parent2ID, child);

    //add extra disks for the visual
    this.updateExtraDisks();
  }

  /*Using the current front, this method determines all the locations where a child disk could be placed. Returns an array of candidates. Should account for rotation
  @return the array of candidates*/
  determineChildCandidates() {

    let candidates = [];

    //generate an array of child candidates, but they might overlap
    candidates = this.candidatesIgnoreOverlap();
    
    //for each candidate, make sure it's not overlapping with other disks in the front
    this.deleteOverlappingCandidates(candidates);

    //rotate all candidates back onto the cone
    candidates = this.rotateOntoCone(candidates);

    return candidates;
  }

  /*Creates a list of candidates, but does not check for overlap
  @return a list of child candidates, ignoring whether they are overlapping with other disks: [ [child, parent1 id, parent2 id]*/
  candidatesIgnoreOverlap() {
    //print("\n\n\nInside candidatesIgnoreOverlap()");
    let candidates = []; //an empty array to be filled with possible child candidates
    
    //generate extended front, where we rotate disks from the left until they reach more than 4r x units away from the rightmost disk
    this.generateExtendedFront();
    
    for(let frontIndex = 0; frontIndex < this.extendedFront.length; frontIndex ++) {
    }
    //for each disk in original front
    for(let frontIndex = 0; frontIndex < this.front.length; frontIndex ++) {
      let frontDisk = this.front[frontIndex]; //the disk we're starting from
      
      let extendedFrontIndex = frontIndex + 1;

      //check forward until the center of the next disk is more than 4r x units away. Use extended front.
      let continueWhileLoop = true;
      while(continueWhileLoop) {
        let diskToCheck = this.extendedFront[extendedFrontIndex]; //the disk we're checking 
        
        if(diskToCheck == null) {
          //print("  diskToCheck == null. continue");
          continueWhileLoop = false;
          continue;
        }

        //print("Checking for children from disks " + frontDisk.id + " and " + diskToCheck.id);

        //if the disks are too far apart, we're done looking
        if(this.angularDistanceBtwnDisks(frontDisk, diskToCheck) > 4*this.diskRadius) {
          //print("  angularDistance is too much. continue");
          continueWhileLoop = false;
          continue;
        }
        
        //if a child could be produced, add it as a candidate
        let potentialChild = this.childDisk(frontDisk, diskToCheck);
        if(potentialChild != null) {
          candidates.push([potentialChild, frontDisk.id, diskToCheck.id]);
          //continueWhileLoop = false;
        } 
        extendedFrontIndex ++;
      }
    }
    return candidates;

  }
 
  /*Given a list of candidates, this method deletes candidates that overlap with other disks. No return value; the original array that was passed in is altered.
  @param candidates: the array of candidates [[candidate, parent1ID, parent2ID], ...]*/
  deleteOverlappingCandidates(candidates) {
    for (let candidateIndex = candidates.length - 1; candidateIndex >= 0; candidateIndex --) {
      let candidateToCheck = (candidates[candidateIndex])[0];
      let hasOverlap = false;
      for (let diskToCheck of this.disks) {
        if(this.isOverlap(diskToCheck, candidateToCheck)) {
          hasOverlap = true;
        }
      }
      if(hasOverlap) {
        candidates.splice(candidateIndex, 1);
      }
    }
  }
  
  /*Given an array of disks, this method returns an array of disks such that all of them are properly located within the cone (fundamental domain).
  @param candidates: an array of candidates to get rotated. Remember, candidates come in an array like this: [[disk, parent1 id, parent2 id], ...]
  @return rotatedDisks: an array with copies of the disks which has now been rotated 
NOTE: assumes that disks left of cone were rotated one period LEFT and disks on right were rotated on period RIGHT. Could cause problems with larger cone angles.*/
  rotateOntoCone(candidates) {
    let rotatedDisks = [];

    for (let disk of candidates) {
      let rotatedDisk = disk[0];
      while(this.isOffCone(rotatedDisk)) {
        rotatedDisk = this.rotatedDisk(rotatedDisk);
      }
      rotatedDisks.push([rotatedDisk, disk[1], disk[2]]);
    }

    return rotatedDisks;
  }
    
  
  /*Given a list of child candidates, this method determines the lowest candidate and returns its index.
  @param candidates: the array of arrays containing candidate children. [[candidate, parent1 id, parent2 id], ...]
  @return the index of the lowest child disk.*/
  findLowestCandidate(candidates) {
    let lowestDisk = candidates[0];
    let smallestDist = this.distanceToVertex(lowestDisk[0]);

    for (let disk of candidates) {
      let newDist = this.distanceToVertex(disk[0]);
      if(newDist < smallestDist){
        smallestDist = newDist;
        lowestDisk = disk;
      }
    }

    return lowestDisk;
  }

  /*Given the IDs of the parents, this method deletes the disks in the front between the two parents.
  @param parent1ID, parent2ID: the indices of the parents' ids. Parents must be entered in order (parent1 = left, parent2 = right) */
  deleteDisksBetweenParents(parent1ID, parent2ID) {
    //search backward through front to find parent2ID. Once found, keep going backward while deleting until parent1ID is found.
    let searchingForParent2 = true;
    let frontIndex = this.front.length - 1;
    while(searchingForParent2) {
      if(this.front[frontIndex].id == parent2ID) {
        searchingForParent2 = false;
      } else {
        frontIndex --;
      }

      //problems
      if(frontIndex < 0) {
        return;
      }
    }

    //edge case: parent1 = parent2:
    if(parent1ID == parent2ID) {
      this.front.splice(frontIndex+1, 0);
      return;
    }
    
    let searchingForParent1 = true;
    while(searchingForParent1) {
      if(this.front[frontIndex].id == parent1ID) {
        searchingForParent1 = false;
      } 
      else {
        //don't delete parent2
        if(this.front[frontIndex].id != parent2ID) {
          this.front.splice(frontIndex,1);
        }
        frontIndex --;
        if(frontIndex < 0) { frontIndex = this.front.length-1; }
      }
    }
  }

  /*Given the ids of the parents and the new child Disk, this method finds the correct spot in front[] and inserts the child Disk there.
  @param parent1ID, parent2ID: the ids of the parent disks. parent1 is left, parent2 is right.
  @param child: the child Disk
  @return the index the child was added at*/
  insertChildIntoFront(parent1ID, parent2ID, child) {
    let parent1Index = this.findIndexWithID(this.front, parent1ID);
    let parent2Index = this.findIndexWithID(this.front, parent2ID);
    
    //Case 1 (could happen with first few fronts): parent1 and parent2 are the same. Determine which side of parent the child is on; add on that side.
    if(parent1ID == parent2ID) {
      let vertexToChild = this.vertexToDisk(child);
      let vertexToParent = this.vertexToDisk(this.front[parent1Index]);

      //if the child is right of the parent
      if(vertexToParent.angleBetween(vertexToChild) < 0) {
        this.front.splice(parent1Index + 1, 0, child);
        return parent1Index + 1;
      } 
      //if the child is left of the parent
      else {
        this.front.splice(parent1Index, 0, child);
        return parent1Index;
      }

    }
    
    //Case 2 (most common): parent1 and parent2 are in the middle of the front, right next to each other. Insert child in between.
    if(parent2Index == parent1Index + 1) {
      this.front.splice(parent2Index, 0, child);
      return parent2Index;
    }
    
    //Case 3: parent 1 is the last element, and parent2 is the first. Determine which one the child is closer to. Insert child there.
    let distChildToParent1 = this.distanceBtwnDisks(child, this.front[parent1Index]);
    let distChildToParent2 = this.distanceBtwnDisks(child, this.front[parent2Index]);
    if(distChildToParent1 < distChildToParent2) {
      //insert child after parent 1
      this.front.splice(parent1Index + 1, 0, child);
      return parent1Index + 1;
    } else {
      //insert child before parent 2.
      this.front.splice(parent2Index, 0, child);
      return parent2Index;
    }
  }

  /*Ensures that there is a rotated version of the first and last disk in the current drawn on the screen.*/
  updateExtraDisks() {
    //check if the first disk in the front is in extraDisks. If not, add it.
    let indexOfFirstFrontDisk = this.findIndexWithID(this.extraDisks, this.front[0].id);
    if(indexOfFirstFrontDisk == null) {
      this.extraDisks.push(this.rotatedDisk(this.front[0]));
    }

    //check if the last disk in the front is in extraDisks. If not, add it.
    let indexOfLastFrontDisk = this.findIndexWithID(this.extraDisks, this.front[this.front.length-1].id);
    if(indexOfLastFrontDisk == null) {
      this.extraDisks.push(this.rotatedDisk(this.front[this.front.length-1]));
    }

  }

  /**************************************************/
  /*            FUNCTIONS LEVEL 2                  */
  /*************************************************/
  
  /*Creates an "extended" front where some disks from the left are copied and rotated rightward. It updates this.extendedFront().*/
  generateExtendedFront() {
    let rightmostFrontDisk = this.front[this.front.length-1]; //last disk in front
    
    this.extendedFront = [...this.front]; //shallow copy front[]

    let aDistance; //represents the true distance between rightmostFrontDisk and another disk in the front.
    let indexToRotate = 0; //the index of the next disk in the front to possibly rotate
    let continueWhileLoop = true;

    //generate extended front, where we rotate disks from the left until they reach more than 4r units away from the rightmost disk
    while(continueWhileLoop) {
      let diskToRotate = this.extendedFront[indexToRotate];
      let rotatedDisk = this.rotateRight(diskToRotate);
      aDistance = this.angularDistanceBtwnDisks(rightmostFrontDisk, rotatedDisk);

      //if the disks are too far apart, end this while loop
      if(aDistance > 4*this.diskRadius) {
        continueWhileLoop = false;
      } 
      //otherwise, rotate the other disk to the right and add it to the extended front
      else {
        this.extendedFront.push(rotatedDisk);
        indexToRotate ++;
      }
    }
  }

  
  /*Finds the location of a child Disk given two parents. Does not check for overlap. Assumes all disks have same radius. Does not account for rotation.
  @param parent1, parent2: two disks that could be parents
  @return: the child disk OR null if no such child exists.*/
  childDisk(parent1, parent2) {
    //determine the distance between the disks
    let distBtwnParents = this.distanceBtwnDisks(parent1, parent2);

    //check if parent disks are too far apart. If so, return null
    if(distBtwnParents > this.diskRadius*4){
      //print("--too far, returning null");
      return null;
    }

    //determine the child's position, using simplifying assumptions about radii and angles
    let vectorP1ToP2 = createVector(parent2.x-parent1.x, parent2.y-parent1.y); //vector pointing in direction of parent2, if placed at parent1
    let normalVector = createVector(-vectorP1ToP2.y, vectorP1ToP2.x).normalize(); //vector that is normal to vectorP1ToP2
    let scaledNormalVector = normalVector.mult(0.5 * sqrt((16*this.diskRadius*this.diskRadius) - (distBtwnParents*distBtwnParents))); //scale normalVector so when added to point halfway between parent1 and parent2, final vector is position of a child disk
    let halfwayPoint = createVector( (parent1.x+parent2.x)/2, (parent1.y+parent2.y)/2);

    //two possibilities for children
    let childLocation1 = p5.Vector.add(scaledNormalVector, halfwayPoint);
    let childLocation2 = p5.Vector.add(scaledNormalVector.mult(-1), halfwayPoint);

    let child;
    //return the highest child
    if(this.distanceToVertex(childLocation1) > this.distanceToVertex(childLocation2)) {
      child = new Disk(childLocation1.x, childLocation1.y, this.diskRadius);
    } else {
      child = new Disk(childLocation2.x, childLocation2.y, this.diskRadius);
    }

    //run opposedness test (ie, is the child actually "between" the two parents)
    if(!this.isBetweenParents(child, parent1, parent2)) {
      //print("child is not between parents, returning null");
      return null;
    }

    //finally, return the child disk
    return child;
  }

  /*Test whether a child is situated between its two parents. Does not account for rotation.
  @param child: the child Disk
  @param parent1, parent2: the two parent Disks
  @return true/false: whether the child is actually between both parents.*/
  isBetweenParents(child, parent1, parent2) {
    let unitXVector = createVector(1, 0);

    //create vectors pointing from cone vertex to child/parents
    let childVector = this.vertexToDisk(child);
    let parent1Vector = this.vertexToDisk(parent1);
    let parent2Vector = this.vertexToDisk(parent2);

    //calculate child and parent angles compared to the x axis
    let childAngle = childVector.angleBetween(unitXVector);
    let parent1Angle = parent1Vector.angleBetween(unitXVector);
    let parent2Angle = parent2Vector.angleBetween(unitXVector);

    //check if the child angle is between the two parent angles
    if(childAngle > min(parent1Angle, parent2Angle && childAngle < max(parent1Angle, parent2Angle))) {
      return true;
    }
    else{
      return false;
    }
  }
  

  /****** OVERLAP/OFF CONE FUNCTIONS **************/
  
  /*test if there is an overlap between disks
  @param disk1 disk2: two disks
  @return true if there is an overlap, false if no 
  overlap*/
  isOverlap(disk1,disk2){ 
    let tolerance = 10**(-3); //account for rounding and such
    
    if (this.minDistanceBtwnDisks(disk1, disk2) < 2*this.diskRadius - tolerance) {
      
      return true;
    }
    else {
      return false;
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
    let vertexToDisk = this.vertexToDisk(disk);
    
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


  /******** DISTANCE FUNCTIONS ********************/
  
  /*Used in generateExtendedFront(). Finds the "angular" distance between disks (ie, [θ1-θ2]*r) and reports it. It does not account for rotation because that could cause problems with small fronts.
  @param disk1: the disk we want the "angular" distance from.
  @param disk2: the other disk to compare
  @return the "angular" distance between the given disks*/
  angularDistanceBtwnDisks(disk1, disk2) {
    //angular distance
    let vertexToDisk1 = this.vertexToDisk(disk1);
    let vertexToDisk2 = this.vertexToDisk(disk2);
    let distToVertex = this.distanceToVertex(disk1); //Assumes we're using the first disk as the comparison

    angleMode(RADIANS);
    let angularDist = abs(vertexToDisk1.angleBetween(vertexToDisk2)) * distToVertex;

    angleMode(DEGREES);

    return angularDist;
  }

   /*Finds the actual distance between two disks, accounting for rotation.
  @param disk1, disk2: the two Disks to find the distance between
  @return the distance between the disks*/
  minDistanceBtwnDisks(disk1, disk2) {
    let nonRotatedDistance = this.distanceBtwnDisks(disk1, disk2);
    let rotatedDisk2Pos = this.rotatedDisk(disk2);
    let rotatedDistance = this.distanceBtwnDisks(disk1, rotatedDisk2Pos);

    return min(nonRotatedDistance, rotatedDistance);
  }

  /*Finds the distance between two disks, NOT accounting for rotation.
  @param disk1, disk2: the two Disks to find the distance between
  @return the distance between the disks*/
  distanceBtwnDisks(disk1, disk2) {
    return dist(disk1.x, disk1.y, disk2.x, disk2.y);
  }

  /*Returns the distance of a disk to the cone's vertex
  @param disk: the Disk (or vector coordinates, both of which should have x and y attributes)
  @return the distance of the disk to the cone's vertex*/
  distanceToVertex(disk) {
    return dist(disk.x, disk.y, this.vertexX, this.vertexY);
  }

  /*Creates a vector from the cone's vertex to the given disk.
  @param disk: the Disk
  @return p5 Vector: a vector from the vertex to the disk */
  vertexToDisk(disk) {
    //create a vector pointing to disk if positioned at cone vertex
    return createVector(disk.x - this.vertexX, disk.y - this.vertexY);
  }

  /*********** ROTATION FUNCTIONS ******************/
  /*Returns the disk's equivalent location on the other side of the cone (due to rotation)
  @param disk: the Disk to rotate
  @return (Disk) a Disk in the equivalent position*/
  rotatedDisk(disk) {
    angleMode(DEGREES);
    //if on the right side of cone, rotate to left
    //TODO: fix this so it deals with angular stuff. Actually maybe this is always right?
    if(disk.x > this.vertexX) {
      return this.rotateLeft(disk);
    }
    //if on left side of cone, rotate all the way around, ending up on the right
    else {
      return this.rotateRight(disk);
    }
  }

  /*Generates a disk rotate to the right.
  @param disk: the disk to rotate
  @return a new rotated Disk*/
  rotateRight(disk) {
    let vertexToDisk = this.vertexToDisk(disk);
    angleMode(DEGREES);
    vertexToDisk.rotate(360-this.angle);
    return new Disk(this.vertexX + vertexToDisk.x, this.vertexY + vertexToDisk.y, this.diskRadius, disk.id);
  }

  /*Generates a disk rotated to the left
  @param disk: the disk to rotate
  @return a new rotated Disk */
  rotateLeft(disk){
    let vertexToDisk = this.vertexToDisk(disk);
    angleMode(DEGREES);
    vertexToDisk.rotate(this.angle);
    return new Disk(this.vertexX + vertexToDisk.x, this.vertexY + vertexToDisk.y, this.diskRadius, disk.id);
  }

  /************** ID FUNCTIONS *********************/
  /*This method searches an array of disks for a disk with a given id. It returns the index of the first disk in the array with that id, or null if the element doesn't exist.
  @param array: an array of disks to search
  @param id: the id to look for
  @return: the index of the first disk with the same id in the given array, OR null if no such disk was found.*/
  findIndexWithID(array, id) {    
    let found = false;
    let index = 0;
    
    while(!found && index < array.length) {
      //if we found the element with the right id, return index
      if(array[index].id == id) {
        return index;
      } 
      
      index ++;
    }

    //if we searched the whole array and didn't find anything, return null
    return null;
  }

  /*assigns the next disknumber to this disk
  @param disk: the disk to assign the next diskNumber id to.*/
  assignNextDiskID(disk) {
    disk.id = this.diskNumber;
    this.diskNumber ++;
  }

  /*************** DISPLAY FUNCTIONS ***************/
  /*Draws the cone*/
  display() {
    fill(0);
    angleMode(DEGREES);
    push();
    let length = 4;
    this.createTransform();
    
    strokeWeight(5/windowHeight);
    line(this.vertexX, this.vertexY, this.vertexX+length*cos(90-this.angle/2), this.vertexY+length*sin(90-this.angle/2));
    line(this.vertexX, this.vertexY, this.vertexX-length*cos(90-this.angle/2), this.vertexY+length*sin(90-this.angle/2));

    let rotatedDisks = [];
    
    //draw disks
    for (let disk of this.disks) {
      disk.displayDisk(180); 
    }

    for(let disk of this.extraDisks) {
      disk.displayDisk([240, 240, 240, 230], 200);
    }

    //add the text to the disks
    for(let disk of this.disks) {
      push();
      translate(disk.x, disk.y);
      scale(1,-1);
      disk.displayDiskText();
      pop();
    }

    for(let disk of this.extraDisks) {
      push();
      translate(disk.x, disk.y);
      scale(1,-1);
      disk.displayDiskText([200]);
      pop();
    }

    pop();

  }

  //draw the front
  drawFront() {
    push();
    this.createTransform();
    stroke(200, 0, 0);
    strokeWeight(5/windowHeight);
  
    //draw the first front
    let rotatedLastDisk = this.rotateLeft(this.front[this.front.length-1]);
    let firstDisk = this.front[0];
    line(rotatedLastDisk.x, rotatedLastDisk.y, firstDisk.x, firstDisk.y);
    
    //draw most fronts
    for(let index = 0; index < this.front.length - 1; index ++) {
      let disk1 = this.front[index];
      let disk2 = this.front[index + 1];
  
      line(disk1.x, disk1.y, disk2.x, disk2.y);
    }
    pop();
  }

  //draw axes
  drawAxes() {
    push();
    this.createTransform();

    //light red lines.
    stroke(255,175,175);
    fill(255,175,175);
    strokeWeight(3/windowHeight);

    //draw lines at 30° intervals from cone vertex
    let axesLength = sqrt((2*windowWidth/windowHeight)**2+4);
    angleMode(DEGREES);
    for(let angle = 0; angle < 360; angle += 15) {
      let dx = axesLength*cos(angle);
      let dy = axesLength*sin(angle);
      line(this.vertexX, this.vertexY, this.vertexX+dx, this.vertexY+dy);
    }

    //draw circles
    let circleInterval = axesLength/10;
    noFill();
    for(let r = 0; r < 4*windowWidth/windowHeight; r += circleInterval) {
      ellipse(this.vertexX, this.vertexY, r, r);
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
}
