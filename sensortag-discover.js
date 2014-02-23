
var SensorTag = require('sensortag');

console.log('Please turn on the sensortag now.');
console.log('Discovering... (CTRL+C to stop)');

SensorTag.discover(function(sensorTag) {
    console.log('Discovered sensorTag uuid: ' + sensorTag.uuid);
});

