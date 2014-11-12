//  Libreria de Audio

if (!window.AudioContext) {
    if (!window.webkitAudioContext) {
        alert('Su navegador no es compatible con la API de Audio.');
    }
    window.AudioContext = window.webkitAudioContext;
}

var context = new AudioContext();
var audioBuffer;
var sourceNode;
var gainNode;
var average;

// setup a javascript node
//scriptProcessor = context.createScriptProcessor(2048, 1, 1);

// load the sound
setupAudioNodes();
loadSound("resources/Coke_Music_low.mp3");

function setupAudioNodes() {
    // setup a javascript node
    scriptProcessor = context.createScriptProcessor(256, 1, 1);
    // connect to destination, else it isn't called
    scriptProcessor.connect(context.destination);

    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.9;
    //analyser.fftSize = 1024;
    analyser.fftSize = 2048;

    // create a buffer source node
    sourceNode = context.createBufferSource();

    // connect the source to the analyser
    sourceNode.connect(analyser);

    // we use the javascript node to draw at a specific interval.
    analyser.connect(scriptProcessor);

    gainNode = context.createGain();
    sourceNode.connect(gainNode);

    // and connect to destination, if you want audio
    //sourceNode.connect(context.destination);

    gainNode.connect(context.destination);
}

// load the specified sound
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {
        // decode the data
        context.decodeAudioData(request.response, function(buffer) {
            // when the audio is decoded play the sound
            audioBuffer = buffer;
        }, onError);
    }
    request.send();
}


function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);
}

function onError(e) {
    console.log(e);
}

scriptProcessor.onaudioprocess = function() {
    // get the average, bincount is fftsize / 2
    array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    average = getAverageVolume(array)
}

function getAverageVolume(array) {
    var values = 0;
    var average;
    var length = array.length;
    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += array[i];
    }
    average = values / length;
    return average;
}