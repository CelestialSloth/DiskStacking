
/**Notes
* Errors with angles over 180
**/
let cone;
p5.disableFriendlyErrors = true; // disables FES

var coneCanvas = function( sketch ) {
  sketch.setup = function () {
    let canvas = sketch.createCanvas(0.95*sketch.windowWidth, 0.6*sketch.windowHeight);
    canvas.parent('diskStackingCanvas');
    sketch.background(255);
    
    //cone = new StackingCone(0, -.8, 87, 0.075, 1);
    
    cone = new StackingCone(sketch, 0, -.8, 80, 0.075, 0.5);
  
    let startTime = performance.now()
    
    /*let iterations = 200;
    for(let i = 0; i < iterations; i ++) {
      cone.nextDiskStackingIteration();
    }
  */
    let endTime = performance.now()
  
    sketch.print((endTime-startTime)/100 + " seconds");

    document.getElementById("parastichyNumbersText").innerHTML = reportParastichyNumbers();
  }

  sketch.draw = function() {
    sketch.background(255);
    
    cone.drawAxes();
  
    //draw the cones
    cone.display();
    
    cone.drawOntologicalGraph();
    
    //drawExtendedFront();
    cone.drawFront();
  }

  sketch.mouseClicked = function() {
    if(sketch.mouseX > 0 && sketch.mouseX < sketch.width && sketch.mouseY > 0 && sketch.mouseY < sketch.width) {
        cone.nextDiskStackingIteration();
        document.getElementById("parastichyNumbersText").innerHTML = reportParastichyNumbers();
    }
  }
}

new p5(coneCanvas);



function resetCone(angle = 130, height = 0.6) {
  cone.reset(angle,height);
}

/*Returns a string that reports the current parastichy numbers.*/
function reportParastichyNumbers() {
  let currentFrontData = cone.frontData[cone.frontData.length - 1];
  return (currentFrontData[0] + ", " + currentFrontData[1]);
}