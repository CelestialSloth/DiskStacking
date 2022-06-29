
/**Notes
* Errors with angles over 180
**/
let cone;

p5.disableFriendlyErrors = true; // disables FES

var parastichyGraphElement = document.getElementById("parastichyGraph");
var parastichyGraph = new Chart(parastichyGraphElement, {
  type: 'line',

  data: {
    labels: [],
    datasets: [{
      label: "Up parastichies",
      data: [],
      pointRadius: 0,
      borderColor: "red",
      fill: false
    }, {
      label: "Down parastichies",
      data: [],
      pointRadius: 0,
      borderColor: "green",
      fill: false
    }],
  },
  options: {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Iteration Number'
        }
      }
    }     
  }
})


/*A closure function for p5 instance mode. (if confused watch https://www.youtube.com/watch?v=Su792jEauZg)
@param p: how we'll refer to the environment containing the cone, its canvas, etc within the closure function. */
var conep5Function = function( p ) {

  //sets up the canvas, initializes the cone and other variables. Also the graph!
  p.setup = function () {
    
    let canvas = p.createCanvas(0.9*p.windowWidth, 0.6*p.windowHeight);
    canvas.parent('diskStackingCanvas');
    p.background(255);
    
    //cone = new StackingCone(0, -.8, 87, 0.075, 1);
    
    cone = new StackingCone(p, 0, -.8, 50, 0.08, 1);
  
    let startTime = performance.now()
    
    /*let iterations = 300;
    for(let i = 0; i < iterations; i ++) {
      cone.nextDiskStackingIteration();
    }*/
    
    let endTime = performance.now()
  
    p.print((endTime-startTime)/100 + " seconds");

    document.getElementById("parastichyNumbersText").innerHTML = reportParastichyNumbers();
    
    //update the graph
    resetGraph();
    
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
    if(p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
        cone.nextDiskStackingIteration();
        //also updates the graph!
        updateGraph();
    }
  }
}

//do everything needed to have the cone drawn on the screen
var conep5 = new p5(conep5Function);

/*resets the cone. Called form the "Restart with settings" button.*/
function resetCone(angle = 130, height = 0.6) {
  cone.reset(angle,height);
  
  //update the graph
  resetGraph();
}

/*Returns a string that reports the current parastichy numbers. Used to write the parastichy numbers below the disk stacking app.*/
function reportParastichyNumbers() {
  let iteration = cone.upFrontData.length;
  return ("Up: " + cone.upFrontData[iteration - 1] + "<br>Down: " + cone.downFrontData[iteration - 1]);
}

/*Adds the most recent parastichy numbers to the graph.*/
function updateGraph() {
  document.getElementById("parastichyNumbersText").innerHTML = reportParastichyNumbers();
  parastichyGraph.data.labels.push(cone.upFrontData.length - 1);
  //don't need to update other data points; they have references to the array
  parastichyGraph.update();
}

/*Resets all the values in the graph to whatever cone...frontData are.*/
function resetGraph() {
  document.getElementById("parastichyNumbersText").innerHTML = reportParastichyNumbers();
  
  //update the graph
  parastichyGraph.data.datasets[0].data = cone.upFrontData;
  parastichyGraph.data.datasets[1].data = cone.downFrontData;
  parastichyGraph.data.labels = Array.from(new Array(cone.upFrontData.length), (x, i) => i);
  parastichyGraph.update();
}