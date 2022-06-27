
class ParastichyGraph {
  constructor(p) {
    this.p = p;

    //the dimensions of the graph
    this.numIterations = 0;
    this.maxParastichies = 0;
  }


  //update the graph to include new front data
  update(frontData) {
    this.numIterations = frontData.length;

    let lastDataPoint = frontData[frontData.length - 1];
    this.maxParastichies = this.p.max(lastDataPoint[0], lastDataPoint[1]);
  }

  /*Given the array of front data, this script outputs a canvas with that graph.
  @param p: the namespace/p5 instance to use
  @param frontData: the array of front data from a stackingCone
  */
  drawGraph() {
      this.p.push();

      this.createCanvasTransform();
      this.p.scale(1, -1);
      
      this.drawAxes();
      this.drawTickMarks(5, 1);
  
      this.p.pop();
  }

  drawAxes() {
    this.p.stroke(0);
    this.p.strokeWeight(0.01);
    this.p.line(0, 0, 0, 1);
    this.p.line(0, 0, 1, 0);
  }

  /*draws the tick marks on the graph
  @param xFrequency, yFrequency: how often tick marks should be drawn for the number of iterations (x axis) and number of parastichies (y axis), respectively
  */
  drawTickMarks(xFrequency, yFrequency) {
    this.p.push();
    this.createGraphTransform();

    //up ticks
    for(let x = 0; x < this.numIterations; x += xFrequency) {
      //this.p.ellipse(x, 0, 1, 1);
    }

    //down ticks
    for(let y = 0; y < this.maxParastichies; y ++) {
      
    }

    this.p.pop();
  }
  
  //translates and scales the whole canvas so that (0, 0) is near the lower right hand corner and (1, 1) is near the upper left
  createCanvasTransform() {
    this.p.translate(this.p.width * 0.1, this.p.height * 0.9);
    this.p.scale(this.p.width * 0.8, this.p.height * 0.8);
  }

  //scales the canvas, making (1,1) into (numIterations, maxParastichies)
  createGraphTransform() {
    this.p.scale(this.numIterations, this.maxParastichies);
  }
}

