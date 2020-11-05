var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;
// Create a place to store terrain geometry
var sphereVertexPositionBuffer;
//Create a place to store normals for shading
var sphereVertexNormalBuffer;
//Create a place to store facesArray for shading
var planefacesArrayBuffer;
// View parameters
var eyePt = glMatrix.vec3.fromValues(0.0,-140.0,60.0);
var viewDir = glMatrix.vec3.fromValues(0.0,1.0,-0.5);
var up = glMatrix.vec3.fromValues(0.0,1.0,0.0);
var viewPt = glMatrix.vec3.fromValues(0.0,0.0,0.0);
// Create the normal
var nMatrix = glMatrix.mat3.create();
// Create ModelView matrix
var mvMatrix = glMatrix.mat4.create();
//Create Projection matrix
var pMatrix = glMatrix.mat4.create();
var mvMatrixStack = [];
// Spheres
var spheres = [];
var lastTime;
var drag = 1;
//-------------------------------------------------------------------------
function reset() {
  spheres = []
}
//-------------------------------------------------------------------------
function AddSpheres() {
  for (var i = 0; i < 5; i++)
  {
    var x = Math.random()*110-55;
    var y = Math.random()*110-55;
    createSphere(x,y,40);
  }
}
//-------------------------------------------------------------------------
/**
 * Populates buffers with data
 */
function setupSphereBuffers() {

    var positionArray=[];
    var normalArray=[];
    var numT = sphereFromSubdivision(6,positionArray, normalArray);

    //creating buffer for positions
    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionArray), gl.STATIC_DRAW);
    sphereVertexPositionBuffer.itemSize = 3;
    sphereVertexPositionBuffer.numItems = numT*3;

    // Specify normals to be able to do lighting calculations
    sphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalArray),
                  gl.STATIC_DRAW);
    sphereVertexNormalBuffer.itemSize = 3;
    sphereVertexNormalBuffer.numItems = numT*3;
}
//-------------------------------------------------------------------------
/**
 * Sends Modelview matrix to shader
 */
function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}
//-------------------------------------------------------------------------
/**
 * Sends projection matrix to shader
 */
function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,
                      false, pMatrix);
}
//-------------------------------------------------------------------------
/**
 * Generates and sends the normal matrix to the shader
 */
function uploadNormalMatrixToShader() {
  glMatrix.mat3.fromMat4(nMatrix,mvMatrix);
  glMatrix.mat3.transpose(nMatrix,nMatrix);
  glMatrix.mat3.invert(nMatrix,nMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}
//----------------------------------------------------------------------------------
/**
 * Pushes matrix onto modelview matrix stack
 */
function mvPushMatrix() {
    var copy = glMatrix.mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}
//----------------------------------------------------------------------------------
/**
 * Pops matrix off of modelview matrix stack
 */
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}
//----------------------------------------------------------------------------------
/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
}
//----------------------------------------------------------------------------------
/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}
//----------------------------------------------------------------------------------
/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}
//----------------------------------------------------------------------------------
/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);

  // If we don't find an element with the specified id
  // we do an early exit
  if (!shaderScript) {
    return null;
  }

  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}
//----------------------------------------------------------------------------------
/**
 * Setup the fragment and vertex shaders
 */
function setupShaders(vshader,fshader) {
  vertexShader = loadShaderFromDOM(vshader);
  fragmentShader = loadShaderFromDOM(fshader);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");
  shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");
  shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
  shaderProgram.uniformDiffuseMaterialColor = gl.getUniformLocation(shaderProgram, "uDiffuseMaterialColor");
  shaderProgram.uniformAmbientMaterialColor = gl.getUniformLocation(shaderProgram, "uAmbientMaterialColor");
  shaderProgram.uniformSpecularMaterialColor = gl.getUniformLocation(shaderProgram, "uSpecularMaterialColor");

  shaderProgram.uniformShininess = gl.getUniformLocation(shaderProgram, "uShininess");
}
//-------------------------------------------------------------------------
/**
 * Sends material information to the shader
 * @param {Float32Array} a diffuse material color
 * @param {Float32Array} a ambient material color
 * @param {Float32Array} a specular material color
 * @param {Float32} the shininess exponent for Phong illumination
 */
function uploadMaterialToShader(dcolor, acolor, scolor,shiny) {
  gl.uniform3fv(shaderProgram.uniformDiffuseMaterialColor, dcolor);
  gl.uniform3fv(shaderProgram.uniformAmbientMaterialColor, acolor);
  gl.uniform3fv(shaderProgram.uniformSpecularMaterialColor, scolor);

  gl.uniform1f(shaderProgram.uniformShininess, shiny);
}
//-------------------------------------------------------------------------
/**
 * Sends light information to the shader
 * @param {Float32Array} loc Location of light source
 * @param {Float32Array} a Ambient light strength
 * @param {Float32Array} d Diffuse light strength
 * @param {Float32Array} s Specular light strength
 */
function uploadLightsToShader(loc,a,d,s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}
//----------------------------------------------------------------------------------
/**
 * Populate buffers with data
 */
function setupBuffers() {
    setupSphereBuffers();
}
//-------------------------------------------------------------------------
/**
 * Startup function called from html code to start program.
 */
 function startup() {
  document.addEventListener("keydown", handlekeydown);
  document.addEventListener("keyup", handlekeyup);

  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders("shader-blinn-phong-vs","shader-blinn-phong-fs");
  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  AddSpheres();
  lastTime = Date.now();
  tick();
}
//----------------------------------------------------------------------------------
/**
 * Draws a sphere
 */
function drawSphere(){
  // Bind position buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize,
                         gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
                           sphereVertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);

 // Bind faces buffer
 // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planefacesArrayBuffer)

// console.log(planefacesArrayBuffer.numItems);
 gl.drawArrays(gl.TRIANGLES, 0, sphereVertexPositionBuffer.numItems);
}
//----------------------------------------------------------------------------------
/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective
    glMatrix.mat4.perspective(pMatrix,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);

    // We want to look down view, so create a lookat point in that direction
    glMatrix.vec3.add(viewPt, eyePt, viewDir);
    // Then generate the lookat matrix and initialize the MV matrix to that view
    glMatrix.mat4.lookAt(mvMatrix,eyePt,viewPt,up);

    mvPushMatrix();

    //Get shiny
    shiny = document.getElementById("shininess").value

    uploadLightsToShader([0,0,10],[0.0,0.0,0.0],[1.0,1.0,1.0],[1.0,1.0,1.0]);

    for (var i = 0; i < spheres.length; i++)
    {
      color = spheres[i].color;
      uploadMaterialToShader(color,color,[1.0,1.0,1.0],shiny);
      var sphere = spheres[i];
      mvPushMatrix();
      setAndDrawSphere(sphere.pos[0], sphere.pos[1], sphere.pos[2], sphere.radius);
      mvPopMatrix();
    }
}
//----------------------------------------------------------------------------------
function createSphere(x,y,z) {
  var sphere = []
  R = Math.random();
  G = Math.random();
  B = Math.random();
  sphere.radius = (Math.random() + 0.5) * 6;
  sphere.color = glMatrix.vec3.fromValues(R,G,B);
  sphere.acc = glMatrix.vec3.fromValues(0.0,0.0,-0.1);
  sphere.vel = glMatrix.vec3.create();
  glMatrix.vec3.random(sphere.vel, 0.5);
  sphere.pos = glMatrix.vec3.fromValues(x,y,z);
  spheres.push(sphere);
}
//----------------------------------------------------------------------------------
function setAndDrawSphere(x,y,z,radius) {
  glMatrix.mat4.translate(mvMatrix, mvMatrix, glMatrix.vec3.fromValues(x,y,z))
  glMatrix.mat4.scale(mvMatrix, mvMatrix,glMatrix.vec3.fromValues(radius,radius,radius));
  setMatrixUniforms();
  drawSphere();
}
//----------------------------------------------------------------------------------
/**
 * Handling key presses
 */
var currentlyPressed = {};
function handlekeydown(e) {
  if (e.key == "ArrowDown" || e.key == "ArrowUp")
  {
    e.preventDefault();
  }
  currentlyPressed[e.key] = true;
}
function handlekeyup(e) {
  currentlyPressed[e.key] = false;
}
//----------------------------------------------------------------------------------
/**
 * Animation to be called from tick. Updates globals and performs animation for each tick.
 */
var floor = -45;
function animate()
{
  if (currentlyPressed["ArrowDown"])
  {
    floor -= 0.6;
  }
  if (currentlyPressed["ArrowUp"])
  {
    floor += 0.6;
  }
  deltaT = (Date.now() - lastTime);
  lastTime = Date.now();
  for (var i=0; i < spheres.length; i++)
  {
    bounceFactor = -0.8 - 1/spheres[i].radius/11; // make smalls ball bouncier
    if (spheres[i].pos[0] > 80) { spheres[i].vel[0] = (bounceFactor)*spheres[i].vel[0]; spheres[i].pos[0] = 80; }
    if (spheres[i].pos[0] < -80) { spheres[i].vel[0] = (bounceFactor)*spheres[i].vel[0]; spheres[i].pos[0] = -80; }
    if (spheres[i].pos[1] > 20) { spheres[i].vel[1] = (bounceFactor)*spheres[i].vel[1]; spheres[i].pos[1] = 20; }
    if (spheres[i].pos[1] < -20) { spheres[i].vel[1] = (bounceFactor)*spheres[i].vel[1]; spheres[i].pos[1] = -20; }
    if (spheres[i].pos[2] > 45) { spheres[i].vel[2] = (bounceFactor)*spheres[i].vel[2]; spheres[i].pos[2] = 45; }
    if (spheres[i].pos[2] < floor) { spheres[i].vel[2] = (bounceFactor)*spheres[i].vel[2]; spheres[i].pos[2] = floor; if (spheres[i].vel[2] < 0.8) { spheres[i].vel[2] = 0; } }
    glMatrix.vec3.add(spheres[i].pos, spheres[i].pos, spheres[i].vel);
    glMatrix.vec3.add(spheres[i].vel, spheres[i].vel, spheres[i].acc);
    glMatrix.vec3.scale(spheres[i].vel, spheres[i].vel, Math.pow(drag,deltaT));
    // console.log(spheres[i].pos, spheres[i].vel);
  }
}

//----------------------------------------------------------------------------------
/**
 * Setting up blinn shader
 */
function setblinnShader() {
    console.log("Setting blinn Shader");
    setupShaders("shader-blinn-phong-vs","shader-blinn-phong-fs");
}
//----------------------------------------------------------------------------------
/**
 * Tick called for every animation frame.
 */
function tick() {
    requestAnimFrame(tick);
    animate();
    draw();
}
