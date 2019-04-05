




//
// Generates the wavefunction used for the terrains base shape. 
//
// <param {object} t>
//   An object of the form:
//
//      {
//        sn: int,
//        cn: int,
//        ...
//        s3: int,     all values either 0 or 1 (true or false) 
//        c3: int,
//        s2: int,
//        c2: int,
//        s1: int,
//        c1: int
//      }
// 
//   Where each property is an int that sets whether or not to add a term to the
//   final wavefunction, which is a function of the form:
//
//       sum(0 to n) for all i of [ si*sin(ix) + ci*cos(ix) ]
//
//   where si == s3 || s2 || s1  for n=3
//         ci == c3 || c2 || c1  for n=3
// </param>
// <param {int} n>
//   The number of terms to add to the final function.
// </param>
//
function makeWaveFunction(t, n){
    let sin = Math.sin;
    let cos = Math.cos;
    return function(x){
        let i, y;
        y = 0;
        for(i = n; i >= 1; i--){
            y += (t['s' + i] * sin(i*x)) + (t['c' + i] * cos(i*x));
        }
        if(y === NaN){
            console.log("error: wavefunction returned NaN. Did you set terms correctly?")
        }
        return y;
    }
}


//
// Generates a 2D array of coordinates representing the side view of a 2D rocky 
// landscape tailored towards the game lunar lander.
//
// <note>
//   The wave/terrain is inverted by default so when drawn on a screen with 
//   +y-axis 'pointing' down the wave is drawn with its +y-axis poiting up.
// </note>
// <note>
//   The terrain base shape is a wavefunction f(a) composed from the 
//   superposition of trigonometric functions, as follows:
//
//      sum(0 to n) for all i of [ si*sin(ia) + ci*cos(ia) ]
//
//   where 
//     si and ci = either 0 or 1 and act to add or remove terms from the
//     final wavefunction.
//   and 
//     'a' is an angle in radians.
//
//   This base shaped is sampled a chosen number of times to produce an array
//   of coordinates.
//
//   The final shape of the terrain is then obtained by applying random
//   deviations to the x and y values for the samples to give the terrain a 
//   rougher look.
// </note>
// <param {object} options>
//   Contains options which control the terrain generator. Options object is as
//   follows:
//
//   options = {
//     numTerms: 3,
//     maxPhase: 2PI,           note: values shown are defaults. These are used
//     numSamples: 100,         if no value is passed in the 'options' object.
//     scaleX: 1,
//     scaleY: 1,
//     offsetY: 0,
//     maxDeviationX: 0,
//     maxDeviationY: 0
//   }
//
// option: numTerms:
//   The number of terms to add to the wavefunction. numTerms = n in function
//   'makeWaveFunction'. See 'makeWaveFunction' for details.
//
// option: maxPhase:
//   samples of the wavefunction f(a) will be taken for (0 < a < maxPhase).
//
//   note: if (maxPhase > 2PI) then the terrains base shape will repeat but the
//   random variations applied to the samples will not.
// 
// option: numSamples:
//   The number of samples to take of the wavefunction f(a). More samples give
//   a smoother result.
//
// option: scaleX:
//   Each sample is a coordinate of the form [x, y]. Note that the argument of 
//   the wavefunction f(a) is NOT the coordinate x, rather it is an angle in 
//   radians which varies as:  0 < a < maxPhase. scaleX is the scale factor 
//   which maps a to x.
//
//   For example if you want to map the phase region 0 to 2PI radians to a
//   canvas region of 0 to 800px, scaleX = 800 / 2PI ~= 127.
// 
// option: scaleY:
//   similar to scaleX except it scales the value of f(a) which varies as
//   follows: -A < f(a) < A where A = amplitude of the wave f(a).
//
//   The complication is that A is not known for a given f(a) so scaleY should
//   be arrived at through trial and error. Just see what works.
//
// option: offsetY:
//   f(a) will vary as -A < f(a) < A where A = amplitude of the wave f(a). The
//   offsetY moves the centerline of the wave up/down the screen.
// 
// option: maxDeviationX/Y:
//   The max random deviation a coordinate [x,y] can make from its sample value.
// 
//   For example, if [x,y] = [250, 220] and maxDeviationX = maxDeviationY = 20.
//   After 'randomness' is applied, 
//               [x,y] = [250 (+/-) (0 to 20), 220 (+/-) (0 to 20)]
//
//   This allows the terrain to vary from the base shape making it rougher.
//
// option: numZones:
//   The number of landing zones to spawn on the map. Zone type is random.
//
// option: zoneWidths:
//   An array of the form: [x5ZoneWidth, x3ZoneWidth, x2ZoneWidth] where each
//   zone width is in the units of the x-axis, i.e. not in radians. This allows
//   better control of zone sizes.
// </param>
//
function generateTerrain(options){
    let i, terrain, terms, numTerms, maxPhase, numSamples, scaleX, scaleY, 
        maxDevX, maxDevY, wave, a, da, dda, x, y, offsetY, numZones, 
        zoneSpacing, zonesPlaced, zone, zoneWidths;

    (options['numTerms']) ? numTerms = options.numTerms : numTerms = 3;
    (options['maxPhase']) ? maxPhase = options.maxPhase : maxPhase = 2 * Math.PI;
    (options['numSamples']) ? numSamples = options.numSamples : numSamples = 100;
    (options['scaleX']) ? scaleX = options.scaleX : scaleX = 100;
    (options['scaleY']) ? scaleY = options.scaleY : scaleY = 100;
    (options['offsetY']) ? offsetY = options.offsetY : offsetY = 0;
    (options['maxDeviationX']) ? maxDevX = options.maxDeviationX : maxDevX = 0;
    (options['maxDeviationY']) ? maxDevY = options.maxDeviationY : maxDevY = 0;
    (options['numZones']) ? numZones = options.numZones : numZones = 0;
    (options['zoneWidths']) ? zoneWidths = options.zoneWidths : zoneWidths = [0, 0, 0];

    terms = {};
    for(i = 1; i <= numTerms; i++){
        terms['s' + i] = (Math.floor(Math.random() * 100) % 2);
        terms['c' + i] = (Math.floor(Math.random() * 100) % 2);
    }
    wave = makeWaveFunction(terms, numTerms);

    zoneSpacing = maxPhase / numZones;
    zonesPlaced = 0;
    da = (maxPhase / numSamples); // radian distance between each sample
    dda = da * 0.4; // max +/- deviation in radian distance between each sample.
    terrain = [];
    for(a = 0; a < maxPhase; a += (da + (((Math.random() * 2) - 1) * dda))){
        y = offsetY - ((wave(a) * scaleY));
        x = a * scaleX;
        y += ((Math.random() * 2) - 1) * maxDevY;
        x += ((Math.random() * 2) - 1) * maxDevX;
        terrain.push({x: x, y: y});

        if(zonesPlaced > numZones){
            continue;
        }
        if(((a / zoneSpacing) - zonesPlaced) > 0){
            // ready to place a zone but add a 50% chance of not doing so. This
            // varies the positions of the zones between gens.
            if(!((Math.floor(Math.random() * 100) % 8) === 1)){
                continue;
            }
            zone = (Math.floor(Math.random() * 100) % 3)
            switch(zone){
                case 0: // x5 zone
                    x += zoneWidths[0];
                    break;
                case 1: // x3 zone
                    x += zoneWidths[1];
                    break;
                case 2: // x2 zone
                    x += zoneWidths[2];
                    break;
            }
            terrain.push({x: x, y: y});
            a = x / scaleX;
            zonesPlaced++; 
        }
    }
    return terrain;
}

function drawTerrain(terrain, ctx){
    let t, i;
    t = terrain;
    ctx.clearRect(0, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
    ctx.strokeStyle = '#000000'
    ctx.beginPath();
    ctx.moveTo(t[0].x, t[0].y);
    for(i = 1; i < t.length; i++){
        ctx.lineTo(t[i].x, t[i].y);
    }
    ctx.stroke();
}

let gCanvas = null;
let gCtx = null;

let CANVAS_WIDTH_PX = 800;
let CANVAS_HEIGHT_PX = 600;

window.numTerms = 6;
window.numSamples = 200;
window.scaleY = 40;
window.maxDeviationX = 2;
window.maxDeviationY = 3;
window.numZones = 4;
window.zoneWidths = [30, 40, 50];



function init(canvas_width, canvas_height){
    gCanvas = document.createElement('canvas');
    gCtx = gCanvas.getContext('2d');
    gCanvas.width = canvas_width;
    gCanvas.height = canvas_height;
    gCanvas.style.background = 'white';
    gCanvas.style.border = '1px solid black';
    document.getElementById("canvas-div").appendChild(gCanvas);
}

function regen(){
    let terrain, options, form;
    form = document.forms[0];
    options = {
        numTerms: parseInt(form.n.value),
        maxPhase: (3 * Math.PI),           
        numSamples: parseInt(form.samples.value),
        scaleX: (CANVAS_WIDTH_PX / (3 * Math.PI)),
        scaleY: parseInt(form.scaleY.value),
        offsetY: 400,
        maxDeviationX: parseInt(form.maxDevX.value),
        maxDeviationY: parseInt(form.maxDevY.value),
        numZones: parseInt(form.numZones.value),
        zoneWidths: [
            parseInt(form.x5Width.value),
            parseInt(form.x3Width.value),
            parseInt(form.x2Width.value)
        ]
    }
    terrain = generateTerrain(options);
    drawTerrain(terrain, gCtx);
}

function main(){
    init(CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX);
    regen();
}