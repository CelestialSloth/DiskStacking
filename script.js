
/**Notes
* Errors with angles over 180
**/
let cone;
p5.disableFriendlyErrors = true; // disables FES

/*A closure function for p5 instance mode. (if confused watch https://www.youtube.com/watch?v=Su792jEauZg)
p: how we'll refer to the environment containing the cone, its canvas, etc within the closure function.
*/
var conep5Function = function( p ) {

  //sets up the canvas, initializes the cone and other variables.
  p.setup = function () {
    
    let canvas = p.createCanvas(0.95*p.windowWidth, 0.6*p.windowHeight);
    canvas.parent('diskStackingCanvas');
    p.background(255);
    
    //cone = new StackingCone(0, -.8, 87, 0.075, 1);
    
    cone = new StackingCone(p, 0, -.8, 130, 0.05, 0.7);
  
    let startTime = performance.now()
    
    let iterations = 2000;
    for(let i = 0; i < iterations; i ++) {
      cone.nextDiskStackingIteration();
    }
    
    let endTime = performance.now()
  
    p.print((endTime-startTime)/100 + " seconds");

    document.getElementById("parastichyNumbersText").innerHTML = reportParastichyNumbers();
  }

  //runs every frame to display the cone and disks
  p.draw = function() {
    p.background(255);
    
    cone.drawAxes();
  
    //draw the cones
    cone.display();
    
    cone.drawOntologicalGraph();
    
    //drawExtendedFront();
    cone.drawFront();
  }

  //what to do when the user clicks the mouse
  p.mouseClicked = function() {
    if(p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.width) {
        cone.nextDiskStackingIteration();
        document.getElementById("parastichyNumbersText").innerHTML = reportParastichyNumbers();
    }
  }
}

//do everything needed to have the cone drawn on the screen
var conep5 = new p5(conep5Function);

  let graph;


/*Another closure function for p5 instance mode.*/
var graphp5Function = function (p) {

  
  p.setup = function() {
    let canvas = p.createCanvas(0.5 * p.windowWidth, 0.5 * p.windowWidth );
    canvas.parent('graphCanvas');
    p.background(255);
    graph = new ParastichyGraph(p, cone.frontData);
  }

  p.draw = function() {
    graph.drawGraph();
  }
}

//do everything needed to have the graph drawn on the screen
var graphp5 = new p5(graphp5Function);




/*resets the cone. Called form the "Restart with settings" button.*/
function resetCone(angle = 130, height = 0.6) {
  cone.reset(angle,height);
}

/*Returns a string that reports the current parastichy numbers. Used to write the parastichy numbers below the disk stacking app.*/
function reportParastichyNumbers() {
  let currentFrontData = cone.frontData[cone.frontData.length - 1];
  return (currentFrontData[0] + ", " + currentFrontData[1]);
}
