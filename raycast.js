/**
 * Class that represents a 2D vector.
 * @typedef {Object} Vector2 
 * @property {Number} x Number representing value of the x dimension.
 * @property {Number} y Number representing value of the y dimension.
 */
class Vector2{
  /**
   * Creates a new 2D vector.
   * @param {Number} [x=0] Number value for the x dimension.
   * @param {Number} [y=0] Number value for the y dimension.
   * @returns {Vector2} The new Vector.
   */
  constructor(x = 0,y = 0){
    this.x = x;
    this.y = y;
  }

  /**
   * Add a vector to this one.
   * @param {Vector2} vector Vector to add to this one.
   * @returns {Vector2} Sum of the 2 vectors.
   */
  add(vector){
    var newVec = new Vector2();
    newVec.x =  this.x + vector.x;
    newVec.y = this.y + vector.y;
    return newVec;
  }

  /**
   * Subtract a vector from this one.
   * @param {Vector2} vector Vector to subtract from this one.
   * @returns {Vector2} Difference of the 2 vectors.
   */
  sub(vector){
    var newVec = new Vector2();
    newVec.x =  this.x - vector.x;
    newVec.y = this.y - vector.y;
    return newVec;
  }

  /**
   * Multiply the vector by another vector.
   * @param {Number} vector Vector to multiply with.
   * @returns {Vector2} The product between the 2 vectors.
   */
  multiplyVect(vector){
    var newVec = new Vector2();
    newVec.x =  this.x * vector.y;
    newVec.y = this.y * vector.x;
    return newVec;
  }

  /**
   * Multiply the vector by a factor.
   * @param {Number} factor Factor to multiply the vector with.
   * @returns {Vector2} The product of the vector and the factor.
   */
  multiply(factor){
    var newVec = new Vector2();
    newVec.x =  this.x * factor;
    newVec.y = this.y * factor;
    return newVec;
  }

  /**
   * Divide the vector by a number.
   * @param {Number} divisor Number to divide the vector with.
   * @returns {Vector2} The quotient of the vector and the divisor.
   */
  divide(divisor){
    var newVec = new Vector2();
    newVec.x =  this.x / divisor;
    newVec.y = this.y / divisor;
    return newVec;
  }

  /**
   * Check the equality between the two vectors.
   * @param {Vector2} vector The vector to check the equality with.
   * @returns {Boolean} If the 2 vectors are equal.
   */
  equals(vector){
    return (this.x === vector.x && this.y === vector.y);
  }

  /**
   * Return the vector with values between 1 and -1 for x and y, depending on the repartition of them.
   * @returns {Vector2} The normalized vector.
   */
  normalized(){
    if(this.equals(new Vector2())){
      return new Vector2();
    }
    var newVec = new Vector2();

    var hyp = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));

    newVec.x =  this.x / hyp;
    newVec.y = this.y / hyp;
    return newVec;
  }

  /**
   * Cross product of 2 vectors.
   * @param {Vector2} vector Vector to do the crossproduct with.
   */
  crossProduct(vector){
    return this.x * vector.y - this.y * vector.x;
  }

  /**
   * Calculate the distance between 2 vectors.
   * @param {Vector2} vector Vector to calculate the distance to.
   */
  distance(vector){
    var diff = this.sub(vector);
    return Math.sqrt(diff.x * diff.x + diff.y * diff.y);
  }

  slope(){
    if(this.x == 0){
      return Infinity;
    }
    return this.y / this.x;
  }
}

/**
 * Class representing a Ray.
 * @typedef {Object} Ray 
 * @property {Vector2} startPos Vector for where the Ray will start.
 * @property {Vector2} direction Vector of the direction the Ray is going.
 */
class Ray{
  /**
   * Creates a new Ray.
   * @param {Vector2} startPos The starting point of the Ray.
   * @param {Vector2} direction The direction the ray is going.
   * @returns {Ray} The new Ray.
   */
  constructor(startPos = new Vector2(), direction = new Vector2(1,0)){
    if(direction.equals(new Vector2())){
      throw new Error("Ray direction cannot be [0,0]");
    }
    else{
      this.startPos = startPos;
      this.direction = direction;
      this.maxDistance = 1000000;
      this.nbBounce = 0;
      this.maxBounce = 5;
      this.intensity = 1;
      this.intensityDropOff = 1/this.maxBounce;
      this.closestIntersectPoint = this.direction.normalized().multiply(this.maxDistance);
      this.points = [];
      this.directions = [];

      this.points.push(startPos);
      this.directions.push(direction);
    }
  }

  /**
   * Draws the ray via the sketch of a canvas.
   * @param {p5} sketch Sketch to draw on.
   */
  draw(sketch){
    sketch.push();
    for(var i = 1; i < this.points.length; i++){
      var value = 255 - this.intensity * 255;
      sketch.stroke(value,value,value);
      sketch.point(this.points[i].x, -this.points[i].y);
      this.intensity -= this.intensityDropOff;
    }
    sketch.pop();
  }

  castDebug(world, sketch = null){
    var debugInfo = document.getElementById("debugInfo");
    debugInfo.innerHTML = "";

    var rayDidNotHit = false;
    var lastObjectHit = null;
    while(this.nbBounce < this.maxBounce && !rayDidNotHit){
      var lastPoint = this.closestIntersectPoint;
      var objectHit = null;

      for(var i in world.objects){
        if(world.objects[i] !== lastObjectHit){
          var intersectingPoint = world.objects[i].rayIntersects(this);
          if(
            intersectingPoint !== null &&
            this.points[this.nbBounce].distance(this.closestIntersectPoint) > this.points[this.nbBounce].distance(intersectingPoint)
            )
          {
            objectHit = world.objects[i];
            this.closestIntersectPoint = intersectingPoint;
          } 
        }
      }

      //if the last point did not change (ray did not hit any object)
      if(lastPoint.equals(this.closestIntersectPoint)){
        rayDidNotHit = true;
      }
      else{
        this.points.push(this.closestIntersectPoint);

        var dir = this.directions[this.nbBounce].normalized();
        var b = dir.multiply(-1);
        var c = objectHit.returnNormal();

        var bDebug = dir.multiply(-50);
        var cDebug = objectHit.returnNormal().multiply(50);

        sketch.stroke(255,0,0);
        sketch.line(this.closestIntersectPoint.x, -this.closestIntersectPoint.y, this.closestIntersectPoint.x + bDebug.x, -this.closestIntersectPoint.y -bDebug.y);
        sketch.stroke(255,0,255);
        sketch.line(this.closestIntersectPoint.x, -this.closestIntersectPoint.y, this.closestIntersectPoint.x + cDebug.x, -this.closestIntersectPoint.y -cDebug.y);
        sketch.stroke(0,0,0);

        var normalGlobalAngle = Math.atan2(c.y, c.x);
        var lineGlobalAngle = Math.atan2(b.y, b.x);

        var diff = Math.acos((b.x * c.x + b.y * c.y) / (Math.sqrt(b.x * b.x + b.y * b.y) * Math.sqrt(c.x * c.x + c.y * c.y)));
        
        console.log("No" + this.nbBounce + " {Alpha : "+diff+" Dir : {"+dir.x+","+ dir.y+ "}");
        
        var globalReboundAngle = normalGlobalAngle;
        if(lineGlobalAngle > normalGlobalAngle)
          globalReboundAngle -= diff;
        else
          globalReboundAngle += diff;
        
        var cosA = Math.cos(globalReboundAngle);
        var sinA = Math.sin(globalReboundAngle);

        this.directions.push(new Vector2(cosA, sinA));
        
        this.nbBounce++;
        lastObjectHit = objectHit;
        //replace the closestintersectpoint for the next calculations
        this.closestIntersectPoint = this.directions[this.nbBounce].normalized().multiply(this.maxDistance);
      }
    }
  }

  cast(world){
    var rayDidNotHit = false;
    var lastObjectHit = null;
    while(this.nbBounce < this.maxBounce && !rayDidNotHit){
      var lastPoint = this.closestIntersectPoint;
      var objectHit = null;

      for(var i in world.objects){
        if(world.objects[i] !== lastObjectHit){
          var intersectingPoint = world.objects[i].rayIntersects(this);
          if(
            intersectingPoint !== null &&
            this.points[this.nbBounce].distance(this.closestIntersectPoint) > this.points[this.nbBounce].distance(intersectingPoint)
            )
          {
            objectHit = world.objects[i];
            this.closestIntersectPoint = intersectingPoint;
          } 
        }
      }

      //if the last point did not change (ray did not hit any object)
      if(lastPoint.equals(this.closestIntersectPoint)){
        rayDidNotHit = true;
      }
      else{
        this.points.push(this.closestIntersectPoint);

        var dir = this.directions[this.nbBounce].normalized();
        var b = dir.multiply(-1);
        var c = objectHit.returnNormal();

        var normalGlobalAngle = Math.atan2(c.y, c.x);
        var lineGlobalAngle = Math.atan2(b.y, b.x);

        var diff = Math.acos((b.x * c.x + b.y * c.y) / (Math.sqrt(b.x * b.x + b.y * b.y) * Math.sqrt(c.x * c.x + c.y * c.y)));
        
        var globalReboundAngle = normalGlobalAngle;
        if(lineGlobalAngle > normalGlobalAngle)
          globalReboundAngle -= diff;
        else
          globalReboundAngle += diff;
        
        var cosA = Math.cos(globalReboundAngle);
        var sinA = Math.sin(globalReboundAngle);

        this.directions.push(new Vector2(cosA, sinA));
        
        this.nbBounce++;
        lastObjectHit = objectHit;
        //replace the closestintersectpoint for the next calculations
        this.closestIntersectPoint = this.directions[this.nbBounce].normalized().multiply(this.maxDistance);
      }
    }
  }
}

/**
 * Object representation of a segment.
 * @typedef {Object} Segment
 * @property {Vector2} startPos Starting point of the segment.
 * @property {Vector2} endPoint End point of the segment.
 */
class Segment{
  constructor(startPos = new Vector2(0,0), endPos = new Vector2(1,0)){
    if(startPos.equals(endPos)){
      throw new Error("Segment cannot have same points for start and end");
    }
    else{
      this.startPos = startPos;
      this.endPos = endPos;
      //calculate the normal
      let diff = this.endPos.sub(this.startPos);
      this.normalLeft = new Vector2(-diff.y, diff.x).normalized();
      this.normalRight = new Vector2(diff.y, -diff.x).normalized();
    }
  }

  /**
   * Find the intersection between ray and itself.
   * Heavily inspired/taken from : https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
   * @param {Ray} ray The ray to find the intersecting point.
   * @returns {(Vector2|Null)} Point of the intersection
   */
  rayIntersects(ray, sketch = null){
    var p = this.startPos;
    var r = this.endPos.sub(this.startPos);

    var q = ray.points[ray.nbBounce];
    var s = ray.directions[ray.nbBounce].normalized().multiply(ray.maxDistance).sub(ray.points[ray.nbBounce]);

    //store some calculations to avoid repeating operations
    var rXs = r.crossProduct(s);
    var qMp = q.sub(p);
    var qMp_Xr = qMp.crossProduct(r);
    
    //edge cases
    //if the lines are collinear
    if(rXs == qMp_Xr){
      var t0 = qMp_Xr;
      var t1 = t0 + s.crossProduct(r) / r.crossProduct(r);

      if((t0 >= 0 && t0 <= 1) || (t1 >= 0 && t1 <= 1)){
        if(s.crossProduct(r) < 0){
          return p.add(r);
        }
        else{
          return p;
        }
      }
      else{
        return null;
      }
    }
    //if the lines are parallel
    else if(rXs == 0 && qMp_Xr != 0){
      return null;
    }
    //if the lines are not parallel
    else if(rXs != 0){
      var t = qMp.crossProduct(s) / rXs;
      var u = qMp_Xr / rXs;
      //if the two segments intersect
      if(!(t < 0 || t > 1) && !(u < 0 || u > 1)){
        return p.add(r.multiply(t));
      }
      else{
        return null;
      }
    }
    
  }

  /**
   * Return the normal that the other segment will use.
   * @property {Segment} segment The segment incoming.
   */
  returnNormal(segment){
    //TODO implement
    return this.normalRight;
  }

  /**
   * Draw the segment via the sketch of a canvas.
   * @param {p5} sketch The sketch to draw on.
   */
  draw(sketch){
    //Reverse to imitate a standard x,y coordinate system.
    sketch.line(this.startPos.x, -this.startPos.y, this.endPos.x, -this.endPos.y);
    
    var tmpV = this.startPos.add(this.endPos.sub(this.startPos).divide(2));
    var length = 10;
    var tmpV_Xnl = tmpV.add(this.normalLeft.multiply(length));
    var tmpV_Xnr = tmpV.add(this.normalRight.multiply(length));
    
    sketch.stroke(0,0,255);
    sketch.line(tmpV.x, -tmpV.y, tmpV_Xnl.x, -tmpV_Xnl.y);
    sketch.stroke(0,255,0);
    sketch.line(tmpV.x, -tmpV.y, tmpV_Xnr.x, -tmpV_Xnr.y);
    sketch.stroke(0,0,0);
  }
}

class World{
  constructor(objects = []){
    this.objects = objects;
  }

  addObject(object){
    this.objects.push(object);
  }
}

window.onload = function (){
  var canvasContainer = document.getElementById("p5sketch");
  var canvasWidth = canvasContainer.offsetWidth;
  var canvasHeight = canvasContainer.offsetHeight;

  var box_left = new Segment(new Vector2(-canvasWidth/2, -canvasHeight/2), new Vector2(-canvasWidth/2, canvasHeight/2));
  var box_up = new Segment(new Vector2(-canvasWidth/2, canvasHeight/2), new Vector2(canvasWidth/2, canvasHeight/2));
  var box_right = new Segment(new Vector2(canvasWidth/2, canvasHeight/2), new Vector2(canvasWidth/2, -canvasHeight/2));
  var box_down = new Segment(new Vector2(canvasWidth/2, -canvasHeight/2), new Vector2(-canvasWidth/2, -canvasHeight/2));

  var l_c1 = new Segment(new Vector2(-700, 250), new Vector2(-700, -250));
  var l_c2 = new Segment(new Vector2(-700, -250), new Vector2(-500, -250));
  var l_c3 = new Segment(new Vector2(-500, -250), new Vector2(-500, -200));
  var l_c4 = new Segment(new Vector2(-500, -200), new Vector2(-650, -200));
  var l_c5 = new Segment(new Vector2(-650, -200), new Vector2(-650, 200));
  var l_c6 = new Segment(new Vector2(-650, 200), new Vector2(-500, 200));
  var l_c7 = new Segment(new Vector2(-500, 200), new Vector2(-500, 250));
  var l_c8 = new Segment(new Vector2(-500, 250), new Vector2(-700, 250));
  
  var l_f1 = new Segment(new Vector2(-400, 250), new Vector2(-400, -250));
  var l_f2 = new Segment(new Vector2(-400, -250), new Vector2(-350, -250));
  var l_f3 = new Segment(new Vector2(-350, -250), new Vector2(-350, -100));
  var l_f4 = new Segment(new Vector2(-350, -100), new Vector2(-300, -100));
  var l_f5 = new Segment(new Vector2(-300, -100), new Vector2(-300, -50));
  var l_f6 = new Segment(new Vector2(-300, -50), new Vector2(-500, 250));
  var l_f7 = new Segment(new Vector2(-300, 250), new Vector2(-500, 250));
  var l_f8 = new Segment(new Vector2(-300, 250), new Vector2(-300, 200));
  var l_f9 = new Segment(new Vector2(-300, 200), new Vector2(-200, 250));
  var l_f10 = new Segment(new Vector2(-200, 250), new Vector2(-400, 250));

  var objects = [box_left, box_up, box_right, box_down, l_c1,l_c2,l_c3,l_c4,l_c5,l_c6,l_c7,l_c8];
  var world = new World(objects);
  var mousePos = new Vector2();
  var debugRay = 0;

  let myp5 = new p5(( sketch ) => {
    sketch.setup = () => {
      sketch.createCanvas(canvasWidth, canvasHeight, sketch.WEBGL);
      sketch.noLoop();
    };
  
    sketch.draw = () => {
      sketch.background(255);
      sketch.smooth();
      sketch.stroke(100,100,100);
      sketch.line(-canvasWidth / 2, 0, canvasWidth / 2, 0);
      sketch.line(0, -canvasHeight / 2, 0, canvasHeight / 2);
      sketch.stroke(0,0,0);

      var rays = [];

      // for(var i in world.objects){
      //   world.objects[i].draw(sketch);
      // }

      for(var a = 0; a < 2*Math.PI ; a += Math.PI / 90){
        var newRay = new Ray(mousePos, new Vector2(Math.cos(a), Math.sin(a)));
        rays.push(newRay);
        newRay.cast(world);
        newRay.draw(sketch);
      }
    };

    sketch.mouseMoved = () => {
      mousePos = new Vector2(sketch.mouseX - canvasWidth / 2, -sketch.mouseY + canvasHeight / 2);
      //debugInfo.innerHTML = "X : " + mousePos.x + " Y : " + mousePos.y;
      sketch.redraw();
    }
  }, document.getElementById('p5sketch'));
}