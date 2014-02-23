
// 20 seconds in milliseconds
var measurementIntervalMs = 20000;

var keen = require('keen.io');
var SensorTag = require('sensortag');

var keen = keen.configure({
    projectId: process.env.keen_io_projectId,
    writeKey: process.env.keen_io_writeKey
});

var uuids = process.env.sensortag_uuid;

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

console.log('Init, discover uuids ' + uuids);

function initialize(uuid) {
    SensorTag.discover(function(sensorTag) {
	var uuid = sensorTag.uuid;
	var intervalId;
	console.log(uuid + ' Discovered');
	
	// sensorTag.on('connect') doesn't fire for some reason
	function onConnect(sensorTag) {
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
			console.log(uuid + ' Got a reading, humidity sensor disabled for ' + measurementIntervalMs + ' ms');
		    });
		    send_to_keenio(temp,hum,uuid);
		});
		
		intervalId = setInterval(function() {
		    sensorTag.enableHumidity(function() {
			console.log(uuid + ' Humidity sensor enabled to get the next reading');
		    });
		}, measurementIntervalMs);
		
		sensorTag.notifyHumidity(function() {
		    console.log(uuid + ' Humidity notifications enabled');
		});
	    });
	}
	
	sensorTag.on('disconnect', function() {
	    console.log(uuid + ' Disconnected');
	    if (typeof intervalId !== 'undefined') {
		clearInterval(intervalId);
		intervalId = undefined;
	    }
	    console.log(uuid + ' CONNECTING (because got disconnected)');
	    sensorTag.connect(function() {
		onConnect(sensorTag);
	    });
	});
	
	// Initial connect
	console.log(uuid + ' CONNECTING');
	sensorTag.connect(function() {
	    onConnect(sensorTag);
	});
	
    }, uuid);
}

uuids.split(',').forEach(function(uuid) { initialize(uuid); });
