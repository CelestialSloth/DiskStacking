/********************************************
SURF 2022
Copyright (c) 2022 Elaine Demetrion, Lisa Cao
Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php 
********************************************/

/**
Note:
* rotateOntoCone makes some assumptions that could be problematic with larger angles
*/

/**This class represents the Cone, which controls the disk stacking. It contains methods related to disk stacking calculations and tasks.*/

class StackingCone {
  /* Constructor for the cone
  @param p: the namespace in which the cone exists. Used for p5 instance mode.
  @param vertexX, vertexY: the x and y values for the vertex; the vertex angle in degrees
  @param angle: the angle of the vertex
  @param diskRadius: the radius of all the disks on the cone
  @param height: a float in range [0,1]. How high the first disk should be (relative)*/
  constructor(p, vertexX, vertexY, angle, diskRadius, height = 0.9) {
    this.p = p;
    this.vertexX = vertexX;
    this.vertexY = vertexY;
    this.diskRadius = diskRadius;

    this.reset(angle, height);    
  }

  /*Resets the cone with the given parameters. Assumes same disk radius and location.
  @param angle
  @param height*/
  reset(angle = 50, height = 0.9) {
    this.angle = angle;
    
    this.diskNumber = 0; //used as a tag to identify unique disks
    
    this.disks = []; //contains actual disk instances
    this.front = []; //the disks in the front

    this.upFrontData = [];
    this.downFrontData = [];
    
    //these will be used in several functions, and will contain extended versions of the front and disks. (ie, versions where disks have been rotated to make the front seem longer)
    this.customFrontWindow = [];

    //rotated "duplicates" of disks in this.disks, drawn to help visualize the cone more
    this.extraDisks = [];

    //this will become a list of possible child disks for the next iteration. It will be updated each iteration in ignoreOverlappingCandidates() and deleteOverlappingCandidates().
    this.candidates = [];

    //contains the index in this.front[] of the most recent disk added
    this.mostRecentFrontDiskIndex;
    
    this.placeFirstDisk(height);

    //add extra disks for the visual
    this.updateExtraDisks();
  }

  /*Set up the first default disk and the first index, then 
   add them to the disk array and front array.
  @param height: number in range [0,1]. How high should the first disk be placed, 0 being as low as it can be and 1 being as high as it can be.*/
  placeFirstDisk(height = 0) { 
    this.p.angleMode(this.p.DEGREES);

    //place the first disk on the left side of the cone, at the appropriate height
    let initialHeight = (1+height)*this.diskRadius/this.p.sin(this.angle/2);
    let theta = (180 - this.angle)/2;
    let firstdisk = new Disk(this.p, initialHeight * -this.p.cos(theta), initialHeight * this.p.sin(theta),this.diskRadius);

    //set all the variables that are dependent on the first disk
    this.assignNextDiskID(firstdisk);
    this.disks.push(firstdisk);
    this.front.push(firstdisk);
    this.mostRecentFrontDiskIndex = 0;

    this.updateFrontData();
  }

  /**************************************************/
  /*            FUNCTIONS LEVEL 1                   */
  /* Used directly for nextDiskStackingIteration()  */
  /*************************************************/
  
  /*Using the current front, this method finds and adds the next child disk in the proper (lowest) location, and updates the front[].*/
  nextDiskStackingIteration() {
    
    //determine child disk candidates
    this.determineChildCandidates();

    //find lowest candidate. lowestCandidate = [disk, parent1 ID, parent2 ID]
    let lowestCandidate = this.findLowestCandidate();

    //give it an id
    this.assignNextDiskID(lowestCandidate);
    
    //add lowest candidate to disks[]
    this.disks.push(lowestCandidate);

    //Determine the child's "actual" parents. (The disks touching the child that are farthest apart.)
    lowestCandidate.parents = this.findParents(lowestCandidate);
    let parent1ID = lowestCandidate.parents[0].id;
    let parent2ID = lowestCandidate.parents[1].id;
    //print("\nChild " + lowestCandidate.id + " at " + lowestCandidate.x + ", " + lowestCandidate.y);
    //print("  left parent: " + parent1ID);
    //print("  right parent: " + parent2ID);
    //print("******************************");
    
    //In front[], delete disks between parents of the lowest disk.
    this.deleteDisksBetweenParents(parent1ID, parent2ID);
    
    //In front[], insert the child disk in the proper location (probably between the parents but there could be exceptions)
    this.mostRecentFrontDiskIndex = this.insertChildIntoFront(parent1ID, parent2ID, lowestCandidate);

    //add extra disks for the visual
    this.updateExtraDisks();

    //update front data
    this.updateFrontData();

  }

  /*Using the current front, this method determines all the locations where a child disk could be placed. Updates the array of candidates. Should account for rotation. */
  determineChildCandidates() {

    //update the array of child candidates, but they might overlap
    this.candidatesIgnoreOverlap();

    //for each candidate, make sure it's not overlapping with other disks in the front
    this.deleteOverlappingCandidates();

    
    //rotate all candidates back onto the cone
    this.rotateOntoCone();
    
  }

  /*Updates the list of candidates, but does not check for overlap.*/
  candidatesIgnoreOverlap() {
    //this.candidates = []; //an empty array to be filled with possible child candidates
    
    //generate extended front, where we rotate disks from the left until they reach more than 4r x units away from the rightmost disk
    this.generateCustomFrontWindow();

    //generate two versions of the most recent disk: it in its current place, and it rotated right
    let mostRecentDisk = this.disks[this.disks.length - 1];
    
    //check for children with each disk in customFrontWindow
    for(let customFrontWindowIndex = 0; customFrontWindowIndex < this.customFrontWindow.length; customFrontWindowIndex ++) {
      
      let diskToCheck = this.customFrontWindow[customFrontWindowIndex]; //the disk we're checking
      //this.p.print("Checking for children of disks " + mostRecentDisk.id + " and " + diskToCheck.id + ", which is at " + diskToCheck.x + "," + diskToCheck.y);
      
      //check for potential child with a disk in the customFrontWindow
      let potentialChild = this.childDisk(mostRecentDisk, diskToCheck);

      if(potentialChild != null) {
        this.candidates.push(potentialChild);
      }
    }
  }
 
  /*Given a list of candidates, this method deletes candidates that overlap with other disks. No return value; the original array that was passed in is altered.
  @param candidates: the array of candidates*/
  deleteOverlappingCandidates() {
    let disksStartIndex = this.disks.length - this.front.length*2;
    if(disksStartIndex < 0) {disksStartIndex = 0;}

    //only need to check a subset of all of the disks -- the most recent few rows
    let disksToCheck = this.disks.slice(disksStartIndex);
    
    for (let candidateIndex = this.candidates.length - 1; candidateIndex >= 0; candidateIndex --) {
      let candidateToCheck = this.candidates[candidateIndex];
      let hasOverlap = false;

      for (let diskToCheck of disksToCheck) {
        if(this.isOverlap(diskToCheck, candidateToCheck)) {
          hasOverlap = true;
          break;
        }
      }
      if(hasOverlap) {
        this.candidates.splice(candidateIndex, 1);
      }
      
    }
  }
  
  /*Given an array of disks, this method returns an array of disks such that all of them are properly located within the cone (fundamental domain).
  @param candidates: an array of candidates to get rotated. Remember, candidates come in an array like this: [[disk, parent1 id, parent2 id], ...]
  @return rotatedDisks: an array with copies of the disks which has now been rotated 
NOTE: assumes that disks left of cone were rotated one period LEFT and disks on right were rotated on period RIGHT. Could cause problems with larger cone angles.*/
  rotateOntoCone() {
    let rotatedDisks = [];

    for (let disk of this.candidates) {
      let rotatedDisk = disk;
      while(this.isOffCone(rotatedDisk)) {
        rotatedDisk = this.rotatedDisk(rotatedDisk);
      }
      rotatedDisks.push(rotatedDisk);
    }

    this.candidates = rotatedDisks;
  }
    
  
  /*Given a list of child candidates, this method determines the lowest candidate and returns its index.
  @param candidates: the array of arrays containing candidate children. [[candidate, parent1 id, parent2 id], ...]
  @return the index of the lowest child disk.*/
  findLowestCandidate() {
    let lowestDisk = this.candidates[0];
    let smallestDist = this.distanceToVertex(lowestDisk);

    for (let disk of this.candidates) {
      let newDist = this.distanceToVertex(disk);
      if(newDist < smallestDist){
        smallestDist = newDist;
        lowestDisk = disk;
      }
    }

    return lowestDisk;
  }

  /*Given the child disk, determine which disks in the front *should* be the parent disks.
  @param child: the child Disk
  @return [parent1, parent2]: the parent Disks*/
  findParents(child) {
    
    let disksTouchingLeft = [];
    let disksTouchingRight = [];

    //make list of disks touching child on left and on right
    for (let disk of this.front) {
      
      let diskThatTouchesLeft = this.touchesLeft(child, disk);
      if(diskThatTouchesLeft != null) {
        disksTouchingLeft.push(diskThatTouchesLeft);
      }
      
      let diskThatTouchesRight = this.touchesRight(child, disk);
      if(diskThatTouchesRight != null) { 
        disksTouchingRight.push(diskThatTouchesRight);
      }
    }

    //grab the leftmost disk from the left list, and rightmost disk from the right list
    let maxAngularDistLeft = -1;
    let farthestLeftDisk = disksTouchingLeft[0];
    for(let disk of disksTouchingLeft) {
      if(this.diskDistanceMetric1(child, disk) > maxAngularDistLeft) {
        
        maxAngularDistLeft = this.diskDistanceMetric1(child, disk);
        farthestLeftDisk = disk;
      }
    }

    let maxAngularDistRight = -1;
    let farthestRightDisk = disksTouchingRight[0];
    for(let disk of disksTouchingRight) {
      if(this.diskDistanceMetric1(child, disk) > maxAngularDistRight) {
        
        maxAngularDistRight = this.diskDistanceMetric1(child, disk);
        farthestRightDisk = disk;
      }
    }

    return [farthestLeftDisk, farthestRightDisk];
  }

  /*Given the IDs of the parents, this method deletes the disks in the front between the two parents.
  @param parent1ID, parent2ID: the indices of the parents' ids. Parents must be entered in order (parent1 = left, parent2 = right) */
  deleteDisksBetweenParents(parent1ID, parent2ID) {
    let parent1Index = this.findIndexWithID(this.front, parent1ID);
    let parent2Index = this.findIndexWithID(this.front, parent2ID);

    //edge case: parent1ID = parent2ID. Delete everything other than the parent
    if(parent1ID == parent2ID) {
      this.front = [this.front[parent1Index]];
    }

    //normal case: parent1Index < parent2Index. Remove elements between those two indices.
    else if(parent1Index < parent2Index) {
      this.front.splice(parent1Index + 1, parent2Index - parent1Index - 1);
    }
    //parent1Index is at the end of the array, and parent2Index is at the beginning. Remove elements after parent1 and before parent2. In other words, only keep the values between the parents, including the parents.
    else {
      this.front = this.front.splice(parent2Index, parent1Index - parent2Index + 1);
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

  /*Ensures that there is a rotated version of the first, second, and second last, and last disk in the current front are drawn on the screen.*/
  updateExtraDisks() {
    let frontIndicesToCheck = [0, 1, this.front.length-2, this.front.length-1];
    
    for(let index of frontIndicesToCheck) {
      
      //make sure that front[] has that index
      if(index > this.front.length-1 || index < 0) {continue;}
      
      //check if the disk at that index is in extraDisks. If not, add it.
      let indexInExtraDisks = this.findIndexWithID(this.extraDisks, this.front[index].id);
      if(indexInExtraDisks == null) {
        this.extraDisks.push(this.rotatedDisk(this.front[index]));
      }
    }

  }

  /*Updates the array containing front data.*/
  updateFrontData() {

    let numUpSegments = 0;
    let numDownSegments = 0;

    //check most of the fronts
    for(let index = 0; index < this.front.length - 1; index ++) {
      let disk1 = this.front[index];
      let disk2 = this.front[index + 1];

      //determine if the connection is up or down
      if(this.isUpSegment(disk1, disk2)) {
        numUpSegments ++;
      }
      else {
        numDownSegments ++;
      }
    }

    //check the last one
    let rotatedFirstDisk = this.rotateRight(this.front[0]);
    let lastDisk = this.front[this.front.length-1];
    if(this.areTouching(rotatedFirstDisk, lastDisk)) {
      //different color for up/down segments
      if(this.isUpSegment(lastDisk, rotatedFirstDisk)) {
        numUpSegments ++;
      }
      else {
        numDownSegments ++;
      }
    }

    this.upFrontData.push(numUpSegments);
    this.downFrontData.push(numDownSegments);
  }
  /**************************************************/
  /*            FUNCTIONS LEVEL 2                   */
  /**************************************************/
  
  /*Creates an "extended" front where some disks from the left are copied and rotated rightward. It updates this.customFrontWindow(). Assumes that we only care about whether a disk is 1 away from the most recently added front disk.*/
  generateCustomFrontWindow() {
    let mostRecentFrontDisk = this.front[this.mostRecentFrontDiskIndex]; //most recent disk added to front
        
    this.customFrontWindow = [];
    
    let diskDistance; //represents the number of disks that could fit between rightmostFrontDisk and another disk in the front.

    //generate extended front backward
    let leftIndex = this.mostRecentFrontDiskIndex;
    let nextLeftDisk;
    while(true) {
      //figure out what the next left disk should be (either the next index down, or a rotated version of some disk)
      if(leftIndex >= 0) {
        nextLeftDisk = this.front[leftIndex];
      } 
      else if(leftIndex < 0 && this.front.length + leftIndex >= 0) 
      {
        nextLeftDisk = this.rotateLeft(this.front[this.front.length + leftIndex]);
      } else {
        break;
      }

      diskDistance = this.minDiskDistance(mostRecentFrontDisk, nextLeftDisk);
      //if the disks are too far apart, end the while loop
      if(diskDistance > 1) {
        break;
      }
      else {
        this.customFrontWindow.push(nextLeftDisk);
        leftIndex --;
      }
    }
    
    //reverse elements in customFrontWindow
    this.customFrontWindow.reverse();

    //generate extended front forward
    let rightIndex = this.mostRecentFrontDiskIndex + 1;
    let nextRightDisk;
    while(true) {
      if(rightIndex < this.front.length) {
        nextRightDisk = this.front[rightIndex];
      }
      else if(rightIndex >= this.front.length && rightIndex - this.front.length < this.front.length) {
        nextRightDisk = this.rotateRight(this.front[rightIndex - this.front.length]);
      }
      else {
        break;
      }

      diskDistance = this.minDiskDistance(mostRecentFrontDisk, nextRightDisk);
      //if the disks are too far apart, end the while loop
      if(diskDistance > 1) {
        break;
      }
      else {
        this.customFrontWindow.push(nextRightDisk);
        rightIndex ++;
      }
    }
  }

  
  /*Finds the location of a child Disk given two parents. Does not check for overlap. Assumes all disks have same radius. Does not account for rotation.
  @param parent1, parent2: two disks that could be parents
  @return: the child disk OR null if no such child exists.*/
  childDisk(parent1, parent2) {
    //this.p.print("\nLooking for child of " + parent1.id + "," + parent2.id);
    //determine the distance between the disks
    let distBtwnParents = this.distanceBtwnDisks(parent1, parent2);

    //check if parent disks are too far apart. If so, return null
    if(distBtwnParents > this.diskRadius*4){
      //print("--too far, returning null");
      return null;
    }

    //determine the child's position, using simplifying assumptions about radii and angles
    let vectorP1ToP2 = this.p.createVector(parent2.x-parent1.x, parent2.y-parent1.y); //vector pointing in direction of parent2, if placed at parent1
    let normalVector = this.p.createVector(-vectorP1ToP2.y, vectorP1ToP2.x).normalize(); //vector that is normal to vectorP1ToP2
    let scaledNormalVector = normalVector.mult(0.5 * this.p.sqrt((16*this.diskRadius*this.diskRadius) - (distBtwnParents*distBtwnParents))); //scale normalVector so when added to point halfway between parent1 and parent2, final vector is position of a child disk
    let halfwayPoint = this.p.createVector( (parent1.x+parent2.x)/2, (parent1.y+parent2.y)/2);

    //two possibilities for children
    let childLocation1 = p5.Vector.add(scaledNormalVector, halfwayPoint);
    let childLocation2 = p5.Vector.add(scaledNormalVector.mult(-1), halfwayPoint);
    //this.p.print("  child at " + childLocation1.x + ","+childLocation1.y + " and " + childLocation2.x + ","+childLocation2.y);
    let child;
    //return the highest child
    if(this.distanceToVertex(childLocation1) > this.distanceToVertex(childLocation2)) {
      child = new Disk(this.p, childLocation1.x, childLocation1.y, this.diskRadius);
    } else {
      child = new Disk(this.p, childLocation2.x, childLocation2.y, this.diskRadius);
    }

    //run opposedness test (ie, is the child actually "between" the two parents)
    if(!this.isBetweenParents(child, parent1, parent2)) {
      //print("child is not between parents, returning null");
      return null;
    }
    //this.p.print("  Highest child at " + child.x + ", " + child.y);
    //finally, return the child disk
    return child;
  }

  /*Test whether a child is situated between its two parents. Does not account for rotation.
  @param child: the child Disk
  @param parent1, parent2: the two parent Disks
  @return true/false: whether the child is actually between both parents.*/
  isBetweenParents(child, parent1, parent2) {
    let unitXVector = this.p.createVector(1, 0);

    //create vectors pointing from cone vertex to child/parents
    let childVector = this.vertexToDisk(child);
    let parent1Vector = this.vertexToDisk(parent1);
    let parent2Vector = this.vertexToDisk(parent2);

    //calculate child and parent angles compared to the x axis
    let childAngle = childVector.angleBetween(unitXVector);
    let parent1Angle = parent1Vector.angleBetween(unitXVector);
    let parent2Angle = parent2Vector.angleBetween(unitXVector);

    //check if the child angle is between the two parent angles
    if(childAngle > this.p.min(parent1Angle, parent2Angle) && childAngle < this.p.max(parent1Angle, parent2Angle)) {
      return true;
    }
    //edge case where, say, parent1Angle = -3pi/4, parent2Angle = 3pi/4, childAngle = pi.
    else if( (this.p.min(parent1Angle,parent2Angle) < 0 && this.p.max(parent1Angle,parent2Angle) > 0) && (childAngle > this.p.max(parent1Angle, parent2Angle) || childAngle < this.p.min(parent1Angle, parent2Angle))) {
      return true;
    }
    else{
      return false;
    }
  }
  

  /****** OVERLAP/OFF CONE FUNCTIONS **************/
  
  /*test if there is an overlap between disks. Accounts for rotation.
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
    let tolerance = 10**(-3);
    //first, check if it's below the cone somehow
    if(disk.y < 0) {
      return true;
    }
    
    //create a vector pointing to disk if positioned at cone vertex
    let vertexToDisk = this.vertexToDisk(disk);
    
    let angleBtwnSideAndDisk;
    this.p.angleMode(this.p.DEGREES);
    
    //if on left side, check if over left
    if(disk.x < 0) {
      let leftConeSide = this.p.createVector(-this.p.cos(90-this.angle/2), this.p.sin(90-this.angle/2));
      angleBtwnSideAndDisk = vertexToDisk.angleBetween(leftConeSide);
    }
    //if on right side, check if over right
    else {
      let rightConeSide = this.p.createVector(this.p.cos(90-this.angle/2), this.p.sin(90-this.angle/2));
      angleBtwnSideAndDisk = rightConeSide.angleBetween(vertexToDisk);
    }

    //the disk is "off" the cone if angleBtwnSideAndDisk > 0 (just because of how angleBtwnSideAndDisk was calculated)
    if(angleBtwnSideAndDisk < 0 - tolerance) {
      return true;
    }
    return false;
  }

  /*Tests whether two disks are touching at all. Does not account for rotation.
  @param disk1, disk2: this disks to check
  @return T/F: whether the two disks are touching*/
  areTouching(disk1, disk2) {
    let tolerance = 10**(-3);
    return this.distanceBtwnDisks(disk1, disk2) < 2*this.diskRadius + tolerance;
  }
  
  /*Tests whether the diskToCheck touches the disk on the left side. Accounts for rotation. Returns the version of diskToCheck which touches the left side.
  @param disk: the disk
  @param diskToCheck: we want to check if this disk touches "disk" on "disk's" left side.
  @return: the rotated version of the disk that touches the left side, or null if it doesn't touch the left side*/
  touchesLeft(disk, diskToCheck) {
    let tolerance = 10**(-3);
    //check nonrotated disk
    if(this.isLeftOf(disk, diskToCheck) && this.distanceBtwnDisks(disk, diskToCheck) < 2*this.diskRadius + tolerance) {
      return diskToCheck;
    }
    
    //check rotated disk
    let rotatedDiskToCheck = this.rotateLeft(diskToCheck);
    if(this.isLeftOf(disk, rotatedDiskToCheck) && this.distanceBtwnDisks(disk, rotatedDiskToCheck) < 2*this.diskRadius + tolerance) {
      return rotatedDiskToCheck;
    }
    return null;
  }

  /*Tests whether the diskToCheck touches the disk on the right side. Accounts for rotation. Returns the version of diskToCheck which touches the right side.
  @param disk: the disk
  @param diskToCheck: we want to check if this disk touches "disk" on "disk's" right side.
  @return: the rotated version of the disk that touches the right side, or null if it doesn't touch the right side*/
  touchesRight(disk, diskToCheck) {
    let tolerance = 10**(-3);
    //check nonrotated disk
    if(this.isRightOf(disk, diskToCheck) && this.distanceBtwnDisks(disk, diskToCheck) < 2*this.diskRadius + tolerance) {
      return diskToCheck;
    }
    
    //check rotated disk
    let rotatedDiskToCheck = this.rotateRight(diskToCheck);
    if(this.isRightOf(disk, rotatedDiskToCheck) && this.distanceBtwnDisks(disk, rotatedDiskToCheck) < 2*this.diskRadius + tolerance) {
      return rotatedDiskToCheck;
    }

    return null;
  }
  
  /******** DISTANCE FUNCTIONS ********************/
  
  /*Used in generateCustomFront(). Determines the approximate number of disks that could fit between two given disks, using two different metrics, and returns the smallest result. It does not account for rotation because that could cause problems with small fronts.

* Metric 1: determines how many disks can fit between two given disks the SAME DISTANCE FROM THE CONE VERTEX as disk1. This metric is useful for determining when the *angle* between two disks in the custom front is too large to allow ANY disks at that angle to touch.
* Metric 2: determines how many disks can fit between the two given disks, positioned as they already are. This metric is useful for determining if you could actually create a disk between disk1 and disk2 that'd be tangent to both.

Returns whichever is smallest. Note that returning negative numbers implies overlap; -1 would mean complete overlap, -0.5 would be half overlap, etc. Also note that this method is really only intended to be used in generateCustomFront and related methods as a way to determine whether more disks should be added to the front.

  @param disk1: the disk we want the "angular" distance from.
  @param disk2: the other disk to compare
  @return the "angular" distance between the given disks*/
  minDiskDistance(disk1, disk2) {
    
    let numDisks1 = this.diskDistanceMetric1(disk1, disk2);
    let numDisks2 = this.diskDistanceMetric2(disk1, disk2);
    
    return this.p.min(numDisks1, numDisks2);
  }
  /*METRIC 1. See comments for minDiskDistance*/
  diskDistanceMetric1(disk1, disk2) {
    
    //angular distance
    let vertexToDisk1 = this.vertexToDisk(disk1);
    let vertexToDisk2 = this.vertexToDisk(disk2);
    let distToVertex = this.distanceToVertex(disk1); //Assumes we're using the first disk as the comparison

    //print("going to calculate angles");
    
    this.p.angleMode(this.p.RADIANS);
    let angleBetweenDisks = this.p.abs(vertexToDisk1.angleBetween(vertexToDisk2)); //angle between disk1 and disk2
    //print("angleBetweenDisks: " + angleBetweenDisks);

    let angleBtwnAdjacentDisks = this.p.abs(2*this.p.asin(this.diskRadius/distToVertex)); //the angle between two disks that are touching (both disks at same dist from vertex as disk1)
    let numDisks = angleBetweenDisks/angleBtwnAdjacentDisks - 1;

    return numDisks;
  }

  /*METRIC 2. See comments for minDiskDistance*/
  diskDistanceMetric2(disk1, disk2) {
    
    let distBtwnDisks = this.distanceBtwnDisks(disk1, disk2);
    let numDisks = distBtwnDisks / (2*this.diskRadius) - 1;

    return numDisks;
  }

   /*Finds the actual distance between two disks, accounting for rotation.
  @param disk1, disk2: the two Disks to find the distance between
  @return the distance between the disks*/
  minDistanceBtwnDisks(disk1, disk2) {
    let nonRotatedDistance = this.distanceBtwnDisks(disk1, disk2);
    let rotatedDisk2Pos = this.rotatedDisk(disk2);
    let rotatedDistance = this.distanceBtwnDisks(disk1, rotatedDisk2Pos);

    return this.p.min(nonRotatedDistance, rotatedDistance);
  }

  /*Finds the distance between two disks, NOT accounting for rotation.
  @param disk1, disk2: the two Disks to find the distance between
  @return the distance between the disks*/
  distanceBtwnDisks(disk1, disk2) {
    return this.p.dist(disk1.x, disk1.y, disk2.x, disk2.y);
  }

  /*Returns the distance of a disk to the cone's vertex
  @param disk: the Disk (or vector coordinates, both of which should have x and y attributes)
  @return the distance of the disk to the cone's vertex*/
  distanceToVertex(disk) {
    return this.p.dist(disk.x, disk.y, 0, 0);
  }

  /*Creates a vector from the cone's vertex to the given disk.
  @param disk: the Disk
  @return p5 Vector: a vector from the vertex to the disk */
  vertexToDisk(disk) {
    //create a vector pointing to disk if positioned at cone vertex
    return this.p.createVector(disk.x, disk.y);
  }

  /*Creates a vector from one disk to another.
  @param disk1: the start point.
  @param disk2: the end point.
  @return p5 Vector: a vector from disk1 to disk2*/
  diskToDisk(disk1, disk2) {
    return this.p.createVector(disk2.x - disk1.x, disk2.y - disk1.y);
  }
  
  

  /*Check if diskToCheck is left of disk. Does not account for rotation. 
  @param disk: the disk
  @param diskToCheck: the disk to check for rotation
  @return T/F: whether the disk is left of the diskToCheck*/
  isLeftOf(disk, diskToCheck) {
    let vertexToDisk = this.vertexToDisk(disk);
    let vertexToDiskToCheck = this.vertexToDisk(diskToCheck);
    if(vertexToDisk.angleBetween(vertexToDiskToCheck) > 0) {
      return true;
    }
    return false;
  }

  /*Check if diskToCheck is right of disk. Does not account for rotation.
  @param disk: the disk
  @param diskToCheck: the disk to check for rotation
  @return T/F: whether the disk is right of the diskToCheck*/
  isRightOf(disk, diskToCheck) {
    let vertexToDisk = this.vertexToDisk(disk);
    let vertexToDiskToCheck = this.vertexToDisk(diskToCheck);
    if(vertexToDisk.angleBetween(vertexToDiskToCheck) < 0) {
      return true;
    }
    return false;
  }
  
  /*********** ROTATION FUNCTIONS ******************/
  /*Returns the disk's equivalent location on the other side of the cone (due to rotation)
  @param disk: the Disk to rotate
  @return (Disk) a Disk in the equivalent position*/
  rotatedDisk(disk) {
    this.p.angleMode(this.p.DEGREES);
    //if on the right side of cone, rotate to left
    //TODO: fix this so it deals with angular stuff. Actually maybe this is always right?
    if(disk.x > 0) {
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
    this.p.angleMode(this.p.DEGREES);
    vertexToDisk.rotate(360-this.angle);
    return new Disk(this.p, vertexToDisk.x, vertexToDisk.y, this.diskRadius, disk.id);
  }

  /*Generates a disk rotated to the left
  @param disk: the disk to rotate
  @return a new rotated Disk */
  rotateLeft(disk){
    let vertexToDisk = this.vertexToDisk(disk);
    this.p.angleMode(this.p.DEGREES);
    vertexToDisk.rotate(this.angle);
    return new Disk(this.p, vertexToDisk.x, vertexToDisk.y, this.diskRadius, disk.id);
  }

  /************PARASTICHY FUNCTION *****************/
  /*Given two disks, this method determines if the line segment between them would be considered an "up" segment.
  @param leftDisk: the disk whose center is the left end of the segment.
  @param rightDisk: the disk whose center is the right end of the segment. */
  isUpSegment(leftDisk, rightDisk) {

    //vector to left disk
    let vertexToLeft = this.vertexToDisk(leftDisk);
    
    //vector from left disk to right disk
    let leftToRight = this.diskToDisk(leftDisk, rightDisk);
    
    //calculate dot product
    let dotProduct = vertexToLeft.dot(leftToRight);
    
    //if dot product is positive, ...
    if(dotProduct > 0) {
      return true;
    }
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
    this.p.fill(0);
    this.p.angleMode(this.p.DEGREES);
    this.p.push();
    let length = 4;
    this.createTransform(this.p);
    
    this.p.strokeWeight(5/this.p.height);
    this.p.line(0, 0, length*this.p.cos(90-this.angle/2), length*this.p.sin(90-this.angle/2));
    this.p.line(0, 0, -length*this.p.cos(90-this.angle/2), length*this.p.sin(90-this.angle/2));

    let rotatedDisks = [];

    
    //draw disks
    for(let disk of this.extraDisks) {
      disk.displayDisk([240, 240, 240, 230], [200,200,200,230]);
    }
    
    for (let disk of this.disks) {
      disk.displayDisk(180, [0,0,0,0]); 
    }

    //add the text to the disks
    for(let disk of this.disks) {
      this.p.push();
      this.p.translate(disk.x, disk.y);
      this.p.scale(1,-1);
      disk.displayDiskText();
      this.p.pop();
    }

    for(let disk of this.extraDisks) {
      this.p.push();
      this.p.translate(disk.x, disk.y);
      this.p.scale(1,-1);
      disk.displayDiskText([200]);
      this.p.pop();
    }

    this.p.pop();

  }

  //draw the front
  drawFront() {
    this.p.push();
    this.createTransform(this.p);
    //stroke(200, 0, 0);
    this.p.strokeWeight(5/this.p.height);
    
    //draw most fronts
    for(let index = 0; index < this.front.length - 1; index ++) {
      let disk1 = this.front[index];
      let disk2 = this.front[index + 1];

      //different color for up/down segments
      if(this.isUpSegment(disk1, disk2)) {
        this.p.stroke(200, 0, 0);
      }
      else {
        this.p.stroke(200, 255, 0);
      }
      
      this.p.line(disk1.x, disk1.y, disk2.x, disk2.y);
    }

    //draw the last front
    let rotatedFirstDisk = this.rotateRight(this.front[0]);
    let lastDisk = this.front[this.front.length-1];
    if(this.areTouching(rotatedFirstDisk, lastDisk)) {
      //different color for up/down segments
      if(this.isUpSegment(lastDisk, rotatedFirstDisk)) {
        this.p.stroke(200, 0, 0);
      }
      else {
        this.p.stroke(200, 255, 0);
      }
      this.p.line(rotatedFirstDisk.x, rotatedFirstDisk.y, lastDisk.x, lastDisk.y);
    }
    this.p.pop();
  }

  //draw axes
  drawAxes() {
    this.p.push();
    this.createTransform(this.p);

    //light red lines.
    this.p.stroke(255,175,175);
    this.p.fill(255,175,175);
    this.p.strokeWeight(3/this.p.height);

    //draw lines at 30° intervals from cone vertex
    //let axesLength = this.p.sqrt((2*this.p.width/this.p.height)**2+4);

    let axesLength = this.p.sqrt((this.p.width/this.p.height + this.p.abs(this.vertexX))**2+(1+this.p.abs(this.vertexY))**2);

    this.p.angleMode(this.p.DEGREES);
    for(let angle = 0; angle < 360; angle += 15) {
      let dx = axesLength*this.p.cos(angle);
      let dy = axesLength*this.p.sin(angle);
      this.p.line(0, 0, dx, dy);
    }

    //draw circles
    let circleInterval = axesLength/12;
    this.p.noFill();
    for(let r = 0; r < axesLength; r += circleInterval) {
      this.p.ellipse(0, 0, 2*r, 2*r);
    }

    this.p.pop();
  }

  /*Draws the ontological graph (connects child disks to parents)*/
  drawOntologicalGraph() {
    this.p.push();
    this.createTransform();
    this.p.stroke(0,0,200);
    this.p.strokeWeight(3/this.p.height);
    
    for (let disk of this.disks) {
      if(disk.parents.length >= 1) {
        this.p.line(disk.parents[0].x, disk.parents[0].y, disk.x, disk.y);
      }
      if(disk.parents.length >= 2) {
        this.p.line(disk.parents[1].x, disk.parents[1].y, disk.x, disk.y); 
      }
    }
    this.p.pop();
  }

  /*Puts the canvas into the mode used to draw everything.*/
  createTransform() {
    this.p.translate(this.p.width/2, this.p.height/2);
    //before, we're assuming 1 = 100%
    this.p.scale(this.p.height/2);
    this.p.scale(1,-1);

    this.p.translate(this.vertexX, this.vertexY);
  }
}
