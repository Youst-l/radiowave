var radioWave = function (allWaves) {
    'use strict';
    var FRAMES_PER_SECOND = 30,
        CIRCLE_GROW_SPEED = 0.0003,
        LINE_WIDTH = 7,
        DISTANCE_BETWEEN_LINES = 280,
        getViewportSize = (function () { // calculate viewportsize
            var wdth = 0,
                hth = 0;
            if (!window.innerWidth) {
                wdth = (document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth);
                hth = (document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight);
            } else {
                wdth = window.innerWidth;
                hth = window.innerHeight;
            }
            return {
                width: wdth,
                height: hth
            };
        }()),
        theCanvas = (function () { // add canvas to DOM
            var canvas = document.createElement("canvas");
            canvas.width = getViewportSize.width;
            canvas.height = getViewportSize.height;
            canvas.setAttribute("id", "radiowaves");
            var ctx = canvas.getContext("2d");
            document.body.appendChild(canvas);
            return {
                twoD: ctx,
                width: canvas.width,
                height: canvas.height
            };
        }()),

        halfPi = Math.PI / 2,
        doublePi = Math.PI * 2,
        timeoutID;

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
    // MIT license
    (function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
    }());


    var circleProperties = (function () {
        var allRadiusses = [],
            allLineWidth = [],
            allTransparencies = [];

        // all radiussen in an array
        for (var i = 0; i < Math.floor(halfPi / CIRCLE_GROW_SPEED); i++) {
            allRadiusses[i] = Math.abs(Math.sin(halfPi * (i / (halfPi / CIRCLE_GROW_SPEED))));
        }
        var totalGrowSteps = allRadiusses.length;

        for (var j = 0; j < totalGrowSteps; j++) {
            allTransparencies[j] = 1 - (0.3 + j / totalGrowSteps);
            allLineWidth[j] = (j / totalGrowSteps) * LINE_WIDTH * 1.2;
        }
        return {
            allRadiusses: allRadiusses,
            totalGrowSteps: totalGrowSteps,
            allTransparencies: allTransparencies,
            allLineWidth: allLineWidth
        };
    }(CIRCLE_GROW_SPEED, LINE_WIDTH));


    // a "wave" is a collection of "circles" with different radiusses
    var Wave = function (args) {
        this.j = args.j;
        this.k = args.k;
        this.id = args.id;
        this.wait = args.wait;
        this.numberOfCirclesInAWave = args.numberOfCirclesInAWave;
        this.circleSize = args.circleSize;
        this.x = args.x;
        this.y = args.y;
        this.loop = args.loop;
    };

    Wave.prototype.draw = function () {
        var started = false;
        if (this.j < this.wait) {
            this.j++;
        } else {
            started = true;
            var i = 0;
            while (i < this.numberOfCirclesInAWave) {
                theCanvas.twoD.beginPath();
                if (this.k < circleProperties.totalGrowSteps) {
                    this.k++;
                } else {
                    this.k = 0;
                    // TODO: implement a way to loop or not to loop
                }
                theCanvas.twoD.arc(this.x, this.y, (circleProperties.allRadiusses[this.k - i * DISTANCE_BETWEEN_LINES] * this.circleSize), 0, doublePi, true);
                theCanvas.twoD.lineWidth = circleProperties.allLineWidth[this.k];
                theCanvas.twoD.strokeStyle = "rgba(255, 23, 2, " + circleProperties.allTransparencies[this.k] + ")";
                theCanvas.twoD.stroke();
                i++;
            }
        }
    };


// make instances of Wave
    var makeWaves = function (allWaves) {
        var wave = [];
        for (var i = 0; i < allWaves.length; i++) {
            wave[i] = new Wave({
                j: 0,
                k: 0,
                id: allWaves[i].id,
                x: allWaves[i].x,
                y: allWaves[i].y,
                wait: allWaves[i].wait,
                numberOfCirclesInAWave: allWaves[i].numberOfCirclesInAWave,
                circleSize: allWaves[i].circleSize,
                loop: allWaves[i].loop
            });
        }
            return wave;
    }(allWaves);

    // start Ticker
    ticker();

    function theLoop() {
        // clean canvas
        theCanvas.twoD.clearRect(0, 0, theCanvas.width, theCanvas.height);
        // draw waves
        for (var i = 0; i < allWaves.length; i++) {
            makeWaves[i].draw();
        }


    // stop the loop
    //        if (...) {
    //            window.clearTimeout(timeoutID);
    //        }

    }


    // the TICKER
    function ticker() {
        timeoutID = window.setTimeout(function () {
            requestAnimationFrame(ticker);
        }, 1000 / FRAMES_PER_SECOND);
        theLoop();
    }
};


/*
 * example input to create some waves
 */
var allWaves =
{
    allWaves: [
        {
            id: "numberOne",
            x: 50,
            y: 300,
            wait: 100,
            numberOfCirclesInAWave: 2,
            circleSize: 150,
            loop: 1
        },
        {
            id: "numberTwo",
            x: 100,
            y: 200,
            wait: 70,
            numberOfCirclesInAWave: 7,
            circleSize: 180,
            loop: 0
        },
        {
            id: "numberThree",
            x: 150,
            y: 100,
            wait: 40,
            numberOfCirclesInAWave: 9,
            circleSize: 50,
            loop: 1
        },
        {
            id: "numberFour",
            x: 200,
            y: 400,
            wait: 100,
            numberOfCirclesInAWave: 2,
            circleSize: 250,
            loop: 1
        },
        {
            id: "numberFive",
            x: 250,
            y: 420,
            wait: 20,
            numberOfCirclesInAWave: 9,
            circleSize: 50,
            loop: 0
        },
        {
            id: "numberSix",
            x: 300,
            y: 430,
            wait: 0,
            numberOfCirclesInAWave: 2,
            circleSize: 250,
            loop: 0
        },
        {
            id: "numberSeven",
            x: 50,
            y: 300,
            wait: 100,
            numberOfCirclesInAWave: 2,
            circleSize: 150,
            loop: 1
        },
        {
            id: "numberEight",
            x: 140,
            y: 222,
            wait: 70,
            numberOfCirclesInAWave: 7,
            circleSize: 180,
            loop: 0
        },
        {
            id: "numberNine",
            x: 127,
            y: 198,
            wait: 40,
            numberOfCirclesInAWave: 9,
            circleSize: 50,
            loop: 1
        },
        {
            id: "numberTen",
            x: 299,
            y: 427,
            wait: 130,
            numberOfCirclesInAWave: 2,
            circleSize: 250,
            loop: 1
        },
        {
            id: "numberEleven",
            x: 257,
            y: 426,
            wait: 20,
            numberOfCirclesInAWave: 9,
            circleSize: 50,
            loop: 0
        },
        {
            id: "numberTwelve",
            x: 333,
            y: 436,
            wait: 0,
            numberOfCirclesInAWave: 2,
            circleSize: 250,
            loop: 0
        },
        {
            id: "number13",
            x: 540,
            y: 320,
            wait: 147,
            numberOfCirclesInAWave: 2,
            circleSize: 150,
            loop: 1
        },
        {
            id: "number14",
            x: 180,
            y: 240,
            wait: 77,
            numberOfCirclesInAWave: 7,
            circleSize: 180,
            loop: 0
        },
        {
            id: "number15",
            x: 157,
            y: 120,
            wait: 46,
            numberOfCirclesInAWave: 9,
            circleSize: 50,
            loop: 1
        },
        {
            id: "number16",
            x: 169,
            y: 421,
            wait: 130,
            numberOfCirclesInAWave: 2,
            circleSize: 250,
            loop: 1
        },
        {
            id: "number17",
            x: 255,
            y: 410,
            wait: 210,
            numberOfCirclesInAWave: 9,
            circleSize: 50,
            loop: 0
        },
        {
            id: "number18",
            x: 320,
            y: 533,
            wait: 20,
            numberOfCirclesInAWave: 2,
            circleSize: 250,
            loop: 0
        }
    ],
    allWaves2: [
        {
            id: "numberOne",
            x: 300,
            y: 300,
            wait: 200,
            numberOfCirclesInAWave: 12,
            circleSize: 150,
            loop: 1
        },
        {
            id: "numberTwo",
            x: 200,
            y: 400,
            wait: 300,
            numberOfCirclesInAWave: 9,
            circleSize: 110,
            loop: 0
        }
    ]
};

/*
 * start the animation
 */
radioWave(allWaves.allWaves);


/*
 *  demo to show a radiowave at the mouse pointer when you click somewhere
 */
document.querySelector("body").onclick = function (ev) {
    "use strict";
    var clickWaves =
    {
        allWaves: [
            {
                x: mouseCoords(ev).x,
                y: mouseCoords(ev).y,
                wait: 0,
                numberOfCirclesInAWave: 12,
                circleSize: 150,
                loop: 1
            }
        ]
    };
    radioWave(clickWaves.allWaves);
};


/*
 * get the mouse coordinates
 */
function mouseCoords(ev) {
    "use strict";
    // from http://www.webreference.com/programming/javascript/mk/column2/
    if (ev.pageX || ev.pageY) {
        return {x: ev.pageX, y: ev.pageY};
    }
    return {
        x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y: ev.clientY + document.body.scrollTop - document.body.clientTop
    };
}


/*
 * indication of number of frames per second
 * found on http://stackoverflow.com/questions/5078913/html5-canvas-performance-calculating-loops-frames-per-second
 */
(function fpsCalculator() {
    "use strict";
    var fpsViewer = document.createElement("p");
    fpsViewer.setAttribute("id", "fps");
    fpsViewer.style.position = "absolute";
    fpsViewer.style.top = "10px";
    fpsViewer.style.left = "10px";
    document.body.appendChild(fpsViewer);

    var fps = 0, now, lastUpdate = new Date * 1 - 1;

    // The higher this value, the less the FPS will be affected by quick changes
    // Setting this to 1 will show you the FPS of the last sampled frame only
    var fpsFilter = 50;

    function drawFrame() {
        // ... draw the frame ...
        var thisFrameFPS = 1000 / ((now = new Date) - lastUpdate);
        fps += (thisFrameFPS - fps) / fpsFilter;
        lastUpdate = now * 1 - 1;
        setTimeout(drawFrame, 1);
    }

    var fpsOut = document.getElementById('fps');
    setInterval(function () {
        fpsOut.innerHTML = fps.toFixed(1) + "fps";
    }, 1000);
    drawFrame();
}());