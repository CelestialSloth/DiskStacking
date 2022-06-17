/**Represents one Disk*/
class Disk {
  /*Constructor for the Disk
  @param x, y: the coordinates of the Disk
  @param radius: the radius of the Disk
  @param text *optional*: any text the disk should display, ie a number*/
  constructor(x, y, radius, id = -1) {
    
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.id = id; //keeps track of which disk this is. Kept the same across rotated disks.
    this.parents = []; //array of two Disks that are the parents. Should be the Disks rotated to the right physical location. Used to generate the ontological graph.
  }

  /*Draws the Disk.
  @param fillColor: the color of the disk [r,g,b,a]
  @param strokeColor: the color of the disk outline [r,g,b,a]*/
  displayDisk(fillColor = [200, 200, 200], strokeColor = [0]) {
    fill(fillColor);
    stroke(strokeColor);
    strokeWeight(this.radius*0.1);
    ellipse(this.x, this.y, this.radius*2, this.radius*2);
    
  }

  /*Draws the Disk text. Is a separate method because of how we use transforms in stackingCone.
  @param color: the color of the text [r,g,b,a]*/
  displayDiskText(color = [0]) {
    fill(color);
    textSize(this.radius*0.8);
    textAlign(CENTER,CENTER);
    noStroke();
    text(this.id, 0, 0);
  }

  /*Compares whether two disks are the same.
  @param disk1, disk2: the two disks to compare
  @return T/F: whether the disks are "equivalent". Considered equivalent if id is the same or if they share all other info.*/
  static isEqual(disk1, disk2) {
    return (disk1.x == disk2.x && disk2.y == disk.y && disk1.radius == disk2.radius) || disk1.id == disk2.id;
  }

  /*Compares whether this instance of a disk is equivalent to another.
  @param disk: the disk to compare this instance to
  @return T/F: whether the disks are "equivalent". Considered equivalent if id is the same or if they share all other info.*/
  equals(disk) {
    return (this.x == disk.x && this.y == disk.y && this.radius == disk.radius) || this.id == disk.id;
  }
}
