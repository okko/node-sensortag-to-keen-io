var keen = require('keen.io');
var SensorTag = require('sensortag');

var keen = keen.configure({
    projectId: process.env.keen_io_projectId,
    writeKey: process.env.keen_io_writeKey
});

var uuid = process.env.sensortag_uuid;

function send_to_keenio(temperature,humidity,uuid) {
    console.log('\ttemperature = %d °C', temperature.toFixed(1));
    console.log('\thumidity = %d %', humidity.toFixed(1));
    console.log("");

    var eventdata = {};
    eventdata["SensorTag " + uuid] = [
	{
            "temperature": temperature.toFixed(1),
            "humidity": humidity.toFixed(1)
        }
    ];
    keen.addEvents(eventdata, function(err, res) {
	if (err) {
	    console.log("Error sending to keen " + err + res);
	}
    });
};

console.log('Init, discover uuids ' + uuid);
SensorTag.discover(function(sensorTag) {
    var uuid = sensorTag.uuid;
    console.log('Discovered ' + uuid);
    sensorTag.connect(function() {
	console.log('Connected');
	sensorTag.discoverServicesAndCharacteristics(function() {
	    console.log('discoverServicesAndCharacteristics ok');
            sensorTag.enableHumidity(function() {
		sensorTag.on('humidityChange', function(temperature, humidity) {
		    send_to_keenio(temperature,humidity,uuid);
		});
		
		sensorTag.notifyHumidity(function() {
		    console.log('notifyHumidity');
		});
	    });
	});
    });
}, uuid);


