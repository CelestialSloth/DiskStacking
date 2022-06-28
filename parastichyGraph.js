/*This class contains all of the methods used for drawing the graph of the parastichy numbers.*/

/*Notes: 
* better names for anything involving transforming the canvas/moving points around
* we're assuming we won't need a new reference to the frontData array.

* make some method that draws text at the right location. Use for tick marks

*/
class ParastichyGraph {
  /*Constructor
  @param p: the namespace/p5 instance to use
  @param frontData: the array of frontData to use, from an instance of StackingCone. */
  constructor(p, frontData) {
    this.p = p;

    //the dimensions of the graph
    this.maxX;
    this.maxY;

    //a reference to the front data array
    this.frontData = frontData;
  }


  /*Update the graph's maximum parameters to include new front data.*/
  update() {
    //maximum number of iterations the graph will represent
    this.maxX = this.p.ceil(this.frontData.length / 10) * 10;
    if(this.maxX == 0) { this.maxX = 10; }

    //maximum number of parastichies the graph will represent
    let lastDataPoint = this.frontData[this.frontData.length - 1];
    this.maxY = this.p.ceil(this.p.max(lastDataPoint[0], lastDataPoint[1])/10) * 10;
    if(this.maxY == 0) { this.maxY = 10; }

  }

  /*Given the array of front data, this script outputs a canvas with that graph.
  @param frontData: the array of front data from a stackingCone
  */
  drawGraph() {
      this.update();
    
      this.p.push();

      this.createCanvasTransform();    
      this.p.scale(1, -1);
    
      this.p.background(255);
      this.drawAxes();
      this.drawTicks(500, 4);
      this.plotData();
      this.p.pop();
  }

  //draws the axes for the graph.
  drawAxes() {
    this.p.stroke(0);
    this.p.strokeWeight(this.p.width / 150);

    let axesXEndpoint = this.canvasCoord(this.maxX,0);
    let axesYEndpoint = this.canvasCoord(0, this.maxY);
    this.p.line(0, 0, axesXEndpoint.x, axesXEndpoint.y);
    this.p.line(0, 0, axesYEndpoint.x, axesYEndpoint.y);
  }

  /*draws the tick marks on the graph
  @param xFrequency, yFrequency: how often tick marks should be drawn for the number of iterations (x axis) and number of parastichies (y axis), respectively
  */
  drawTicks(xFrequency, yFrequency) {
    let tickWidth = this.p.width / 100;
    let tickHeight = this.p.width / 50;

    this.p.fill(0);
    this.p.rectMode(this.p.CENTER);
    
    //x ticks
    for(let x = 0; x < this.maxX; x += xFrequency) {
      let tickCanvasCoord = this.canvasCoord(x, 0);
      this.p.rect(tickCanvasCoord.x, tickCanvasCoord.y, tickWidth, tickHeight);
      
      //draw text
      this.p.push();
      this.p.translate(tickCanvasCoord.x, tickCanvasCoord.y);
      this.p.scale(1,-1);
      this.p.fill(0);
      this.p.noStroke();
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text(x, 0, 12);
      this.p.pop();
    }

    //y ticks
    for(let y = 0; y < this.maxY; y += yFrequency) {
      let tickCanvasCoord = this.canvasCoord(0, y);
      this.p.rect(tickCanvasCoord.x, tickCanvasCoord.y, tickHeight, tickWidth);

      //draw text
      this.p.push();
      this.p.translate(tickCanvasCoord.x, tickCanvasCoord.y);
      this.p.scale(1,-1);
      this.p.fill(0);
      this.p.noStroke();
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text(y, -12, 0);
      this.p.pop();
      
    }
  }

  /*Method to plot all of the front data.*/
  plotData() {
    this.p.noStroke();
    
    for(let numIteration = 0; numIteration < this.frontData.length; numIteration ++) {
      let dataPt = this.frontData[numIteration];

      //plot up parastichy data
      let upCanvasCoord = this.canvasCoord(numIteration, dataPt[0]);
      this.p.fill(200, 0, 0);
      this.p.ellipse(upCanvasCoord.x, upCanvasCoord.y, 3, 3);

      //plot down parastichy data
      let downCanvasCoord = this.canvasCoord(numIteration, dataPt[1]);
      this.p.fill(100,255,0);
      this.p.ellipse(downCanvasCoord.x, downCanvasCoord.y, 3, 3);
    }
  }
  
  //translates and scales the whole canvas so that (0, 0) is near the lower right hand corner and (1, 1) is near the upper left
  createCanvasTransform() {
    this.p.translate(this.p.width * 0.1, this.p.height * 0.9);
  }

  /*Given a point on the graph, this function translates its graph coordinates into canvas coordinates, which can then be plotted. 
  @param x: the number of iterations of this data point
  @param y: the number of up or down parastichies this point represents
  @return {p5 Vector}: a 2D vector containing the canvas coordinates of the point.*/
  canvasCoord(x, y) {
    //the graph takes up 0.8 x 0.8 of the canvas
    let maxXOnCanvas = this.p.width * 0.8;
    let maxYOnCanvas = this.p.height * 0.8;

    //scale so that maxX -> maxXOnCanvas, and maxY -> maxYOnCanvas
    let scaleX = maxXOnCanvas / this.maxX;
    let scaleY = maxYOnCanvas / this.maxY;

    return this.p.createVector(x * scaleX, y * scaleY);
  }
  
}

