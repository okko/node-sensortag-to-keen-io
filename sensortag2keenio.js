
// 20 seconds in milliseconds
var measurementIntervalMs = 20000;

var keen = require('keen.io');
var SensorTag = require('sensortag');

var keen = keen.configure({
    projectId: process.env.keen_io_projectId,
    writeKey: process.env.keen_io_writeKey
});

var uuid = process.env.sensortag_uuid;

function send_to_keenio(temperature,humidity,uuid) {
    console.log(uuid + ' \ttemperature = %d °C', temperature);
    console.log(uuid + ' \thumidity = %d %', humidity);

    var eventdata = {};
    eventdata["SensorTag " + uuid] = [
	{
            "temperature": temperature,
            "humidity": humidity
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
    console.log(uuid + ' Discovered');
    sensorTag.connect(function() {
	console.log(uuid + ' Connected');
	sensorTag.discoverServicesAndCharacteristics(function() {
	    console.log(uuid + ' DiscoverServicesAndCharacteristics');
	    sensorTag.on('humidityChange', function(temperature, humidity) {
		// Ignore readings of a disabled sensor
		if (temperature == -46.85 && humidity == -6) {
		    return;
		}
		var temp = temperature.toFixed(2);
		var hum = humidity.toFixed(2);
		sensorTag.disableHumidity(function() {
		    console.log(uuid + ' Got reading, humidity sensor disabled for ' + measurementIntervalMs + ' ms');
		});
		send_to_keenio(temp,hum,uuid);
	    });
	    
	    setInterval(function() {
		sensorTag.enableHumidity(function() {
		    console.log(uuid + ' Humidity sensor enabled to get the next reading');
		});
	    }, measurementIntervalMs);
	    
	    sensorTag.notifyHumidity(function() {
		console.log(uuid + ' Humidity notifications enabled');
	    });
	});
    });
}, uuid);


