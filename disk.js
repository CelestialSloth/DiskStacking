/**Represents one Disk*/
class Disk {
  /*Constructor for the Disk
  @param x, y: the coordinates of the Disk
  @param radius: the radius of the Disk
  @param text *optional*: any text the disk should display, ie a number*/
  constructor(x, y, radius, text='') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.text = text;
  }

  /*Draws the Disk*/
  displayDisk() {
    fill(200, 200, 200);
    ellipse(this.x, this.y, this.radius*2, this.radius*2);
    
  }

  /*Draws the Disk text. Is a separate method because of how we use transforms in stackingCone*/
  displayDiskText() {
    fill(0);
    textSize(30/windowHeight);
    textAlign(CENTER,CENTER);
    noStroke();
    text(this.text, 0, 0);
  }

}
