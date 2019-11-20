var canvasWidth;
var canvasHeight;
window.onload = function (){

  canvasWidth = document.getElementById("p5sketch").offsetWidth;
  canvasHeight = document.getElementById("p5sketch").offsetHeight;

  let myp5 = new p5(( sketch ) => {
      sketch.setup = () => {
        sketch.createCanvas(canvasWidth, canvasHeight, sketch.WEBGL);
      };
    
      sketch.draw = () => {
        sketch.background(255);
        //sketch.translate(-this.canvasWidth/2,-this.canvasHeight/2,0);
        sketch.box();
      };
    }, document.getElementById('p5sketch'));
}
