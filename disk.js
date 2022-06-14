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
    this.id = id;
  }

  /*Draws the Disk*/
  displayDisk(color = [200, 200, 200]) {
    fill(color);
    ellipse(this.x, this.y, this.radius*2, this.radius*2);
    
  }

  /*Draws the Disk text. Is a separate method because of how we use transforms in stackingCone*/
  displayDiskText() {
    fill(0);
    textSize(0.08);
    textAlign(CENTER,CENTER);
    noStroke();
    text(this.id, 0, 0);
  }

  /*Compares whether two disks are the same.*/
  static isEqual(disk1, disk2) {
    return (disk1.x == disk2.x && disk2.y == disk.y && disk1.radius == disk2.radius) || disk1.id == disk2.id;
  }
}
