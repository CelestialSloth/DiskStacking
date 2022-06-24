/**This class represents the Cone, which controls the disk stacking. It contains methods related to disk stacking calculations and tasks.*/

/**
Note:
* rotateOntoCone makes some assumptions that could be problematic with larger angles
*/

class StackingCone {
  /* Constructor for the cone
  @param vertexX, vertexY: the x and y values for the vertex; the vertex angle in degrees
  @param angle: the angle of the vertex
  @param diskRadius: the radius of all the disks on the cone
  @param height: a float in range [0,1]. How high the first disk should be (relative)*/
  constructor(vertexX, vertexY, angle, diskRadius, height = 0.9) {
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
    
    //these will be used in several functions, and will contain extended versions of the front and disks. (ie, versions where disks have been rotated to make the front seem longer)
    this.customFrontWindow = [];

    //rotated "duplicates" of disks in this.disks, drawn to help visualize the cone more
    this.extraDisks = [];

    //this will become a list of possible child disks for the next iteration. It will be updated each iteration in ignoreOverlappingCandidates() and deleteOverlappingCandidates().
    this.candidates = [];

    //contains the index in this.front[] of the most recent disk added
    this.mostRecentFrontDiskIndex;
    
    this.setUpFirstFront(height);

    //add extra disks for the visual
    //this.updateExtraDisks();
  }

  /*Set up the first default disk and the first index, then 
   add them to the disk array and front array.
  @param height: number in range [0,1]. How high should the first disk be placed, 0 being as low as it can be and 1 being as high as it can be.*/
  setUpFirstFront(height = 0) { 
    angleMode(DEGREES);
    let firstdisk = new Disk(0,(1+height)*this.diskRadius/sin(this.angle/2),this.diskRadius);
    this.assignNextDiskID(firstdisk);
    this.disks.push(firstdisk);
    this.front.push(firstdisk);
    this.mostRecentFrontDiskIndex = 0;
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

  }

  /*Using the current front, this method determines all the locations where a child disk could be placed. Updates the array of candidates. Should account for rotation. */
  determineChildCandidates() {

    //generate an array of child candidates, but they might overlap
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

    //generate three versions of the most recent disk: it in its current place, and it rotated in both directions
    let mostRecentDisk = this.disks[this.disks.length - 1];
    let rightRotatedRecentDisk = this.rotateRight(mostRecentDisk);
    let leftRotatedRecentDisk = this.rotateLeft(mostRecentDisk);
    
    //check for children with each disk in customFrontWindow
    for(let customFrontWindowIndex = 0; customFrontWindowIndex < this.customFrontWindow.length; customFrontWindowIndex ++) {
      let diskToCheck = this.customFrontWindow[customFrontWindowIndex]; //the disk we're checking

      //check for potential children using the three versions of the most recent disk
      let potentialChildren = [];
      potentialChildren.push(this.childDisk(mostRecentDisk, diskToCheck)); 
      potentialChildren.push(this.childDisk(rightRotatedRecentDisk,diskToCheck));     
      potentialChildren.push(this.childDisk(leftRotatedRecentDisk,diskToCheck));

      for(let potentialChild of potentialChildren) {
        if(potentialChild != null) {
          this.candidates.push(potentialChild);
        }
      }
    }
    
    //for each disk in the original front, find any possible children it could have.
    /*for(let frontIndex = 0; frontIndex < this.front.length; frontIndex ++) {
      let frontDisk = this.front[frontIndex]; //the disk we're starting from
      
      let extendedFrontIndex = frontIndex + 1;

      //check forward until the center of the next disk is more than 4r x units away. Use extended front.
      while(true) {
        let diskToCheck = this.extendedFront[extendedFrontIndex]; //the disk we're checking 
        
        if(diskToCheck == null) {
          //print("  diskToCheck == null. continue");
          break;
        }

        //if the disks are too far apart, OR if there are no more disks to check, we're done looking
        if(this.diskDistance(frontDisk, diskToCheck) > 1 || extendedFrontIndex >= this.extendedFront.length) {
          //print("  angularDistance is too much. continue");
          break;
        }
        
        //if a child could be produced, add it as a candidate
        let potentialChild = this.childDisk(frontDisk, diskToCheck);
        if(potentialChild != null) {
          this.candidates.push(potentialChild);
          //continueWhileLoop = false;
        } 
        extendedFrontIndex ++;
      }
    }*/
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
      if(this.diskDistance(child, disk) > maxAngularDistLeft) {
        
        maxAngularDistLeft = this.diskDistance(child, disk);
        farthestLeftDisk = disk;
      }
    }

    let maxAngularDistRight = -1;
    let farthestRightDisk = disksTouchingRight[0];
    for(let disk of disksTouchingRight) {
      if(this.diskDistance(child, disk) > maxAngularDistRight) {
        
        maxAngularDistRight = this.diskDistance(child, disk);
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
    let diskIndicesToCheck = [0, 1, this.front.length-2, this.front.length-1];

    for(let index of diskIndicesToCheck) {
      //make sure that front[] has that index
      if(index > this.front.length-1) {continue;}

      //check if the disk at that index is in extraDisks. If not, add it.
      let indexInExtraDisks = this.findIndexWithID(this.extraDisks, this.front[index]);
      if(indexInExtraDisks == null) {
        this.extraDisks.push(this.rotatedDisk(this.front[index]));
      }
    }

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

      diskDistance = this.diskDistance(mostRecentFrontDisk, nextLeftDisk);
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

      diskDistance = this.diskDistance(mostRecentFrontDisk, nextRightDisk);
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
    //print("\nLooking for child of " + parent1.id + ", " + parent2.id);
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
    //print("  child at " + childLocation1.x + ","+childLocation1.y + " and " + childLocation2.x + ","+childLocation2.y);
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
    //print("  Highest child at " + child.x + ", " + child.y);
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
    if(childAngle > min(parent1Angle, parent2Angle) && childAngle < max(parent1Angle, parent2Angle)) {
      return true;
    }
    //edge case where, say, parent1Angle = -3pi/4, parent2Angle = 3pi/4, childAngle = pi.
    else if( (min(parent1Angle,parent2Angle) < 0 && max(parent1Angle,parent2Angle) > 0) && (childAngle > max(parent1Angle, parent2Angle) || childAngle < min(parent1Angle, parent2Angle))) {
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
    let tolerance = 10**(-3);
    //first, check if it's below the cone somehow
    if(disk.y < 0) {
      return true;
    }
    
    //create a vector pointing to disk if positioned at cone vertex
    let vertexToDisk = this.vertexToDisk(disk);
    
    let angleBtwnSideAndDisk;
    angleMode(DEGREES);
    
    //if on left side, check if over left
    if(disk.x < 0) {
      let leftConeSide = createVector(-cos(90-this.angle/2), sin(90-this.angle/2));
      angleBtwnSideAndDisk = vertexToDisk.angleBetween(leftConeSide);
    }
    //if on right side, check if over right
    else {
      let rightConeSide = createVector(cos(90-this.angle/2), sin(90-this.angle/2));
      angleBtwnSideAndDisk = rightConeSide.angleBetween(vertexToDisk);
    }

    //the disk is "off" the cone if angleBtwnSideAndDisk > 0 (just because of how angleBtwnSideAndDisk was calculated)
    if(angleBtwnSideAndDisk < 0 - tolerance) {
      return true;
    }
    return false;
  }


  /******** DISTANCE FUNCTIONS ********************/
  
  /*Used in generateExtendedFront(). Determines the approximate number of disks that could fit between two given disks, the same distance from the cone vertex as disk1. It does not account for rotation because that could cause problems with small fronts.
  @param disk1: the disk we want the "angular" distance from.
  @param disk2: the other disk to compare
  @return the "angular" distance between the given disks*/
  diskDistance(disk1, disk2) {
    //print("Inside diskDistance");
    //angular distance
    let vertexToDisk1 = this.vertexToDisk(disk1);
    let vertexToDisk2 = this.vertexToDisk(disk2);
    let distToVertex = this.distanceToVertex(disk1); //Assumes we're using the first disk as the comparison

    //print("going to calculate angles");
    
    angleMode(RADIANS);
    let angleBetweenDisks = abs(vertexToDisk1.angleBetween(vertexToDisk2)); //angle between disk1 and disk2
    //print("angleBetweenDisks: " + angleBetweenDisks);

    let angleBtwnAdjacentDisks = abs(2*asin(this.diskRadius/distToVertex)); //the   angle between two disks that are touching (both disks at same dist from vertex as disk1)
    let numDisks = angleBetweenDisks/angleBtwnAdjacentDisks - 1;

    //print("angleBtwnAdjacentDisks: " + angleBtwnAdjacentDisks);
    //print("numDisks: " + numDisks);
    
    return numDisks;
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
    return dist(disk.x, disk.y, 0, 0);
  }

  /*Creates a vector from the cone's vertex to the given disk.
  @param disk: the Disk
  @return p5 Vector: a vector from the vertex to the disk */
  vertexToDisk(disk) {
    //create a vector pointing to disk if positioned at cone vertex
    return createVector(disk.x, disk.y);
  }

  /*Tests whether the diskToCheck touches the disk on the left side.
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

  /*Tests whether the diskToCheck touches the disk on the right side.
  @param disk: the disk
  @param diskToCheck: we want to check if this disk touches "disk" on "disk's" right side.
  @return: the rotated version of the disk that touches the right side, or null if it doesn't touch the right side*/
  touchesRight(disk, diskToCheck) {
    let tolerance = 10**(-3);
    //check nonrotated disk
    if(!this.isLeftOf(disk, diskToCheck) && this.distanceBtwnDisks(disk, diskToCheck) < 2*this.diskRadius + tolerance) {
      return diskToCheck;
    }
    
    //check rotated disk
    let rotatedDiskToCheck = this.rotateRight(diskToCheck);
    if(!this.isLeftOf(disk, rotatedDiskToCheck) && this.distanceBtwnDisks(disk, rotatedDiskToCheck) < 2*this.diskRadius + tolerance) {
      return rotatedDiskToCheck;
    }

    return null;
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
  
  /*********** ROTATION FUNCTIONS ******************/
  /*Returns the disk's equivalent location on the other side of the cone (due to rotation)
  @param disk: the Disk to rotate
  @return (Disk) a Disk in the equivalent position*/
  rotatedDisk(disk) {
    angleMode(DEGREES);
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
    angleMode(DEGREES);
    vertexToDisk.rotate(360-this.angle);
    return new Disk(vertexToDisk.x, vertexToDisk.y, this.diskRadius, disk.id);
  }

  /*Generates a disk rotated to the left
  @param disk: the disk to rotate
  @return a new rotated Disk */
  rotateLeft(disk){
    let vertexToDisk = this.vertexToDisk(disk);
    angleMode(DEGREES);
    vertexToDisk.rotate(this.angle);
    return new Disk(vertexToDisk.x, vertexToDisk.y, this.diskRadius, disk.id);
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
    
    strokeWeight(5/height);
    line(0, 0, length*cos(90-this.angle/2), length*sin(90-this.angle/2));
    line(0, 0, -length*cos(90-this.angle/2), length*sin(90-this.angle/2));

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
    strokeWeight(5/height);
  
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
    strokeWeight(3/height);

    //draw lines at 30° intervals from cone vertex
    let axesLength = sqrt((2*width/height)**2+4);
    angleMode(DEGREES);
    for(let angle = 0; angle < 360; angle += 15) {
      let dx = axesLength*cos(angle);
      let dy = axesLength*sin(angle);
      line(0, 0, dx, dy);
    }

    //draw circles
    let circleInterval = axesLength/10;
    noFill();
    for(let r = 0; r < 4*width/height; r += circleInterval) {
      ellipse(0, 0, r, r);
    }

    pop();
  }

  /*Draws the ontological graph (connects child disks to parents)*/
  drawOntologicalGraph() {
    push();
    this.createTransform();
    stroke(0,0,200);
    strokeWeight(3/height);
    
    for (let disk of this.disks) {
      if(disk.parents.length >= 1) {
        line(disk.parents[0].x, disk.parents[0].y, disk.x, disk.y);
      }
      if(disk.parents.length >= 2) {
        line(disk.parents[1].x, disk.parents[1].y, disk.x, disk.y); 
      }
    }
    pop();
  }

  /*Puts the canvas into the mode used to draw everything.*/
  createTransform() {
    translate(width/2, height/2);
    //before, we're assuming 1 = 100%
    scale(height/2);
    scale(1,-1);

    translate(this.vertexX, this.vertexY);
  }
}
