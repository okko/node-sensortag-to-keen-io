node-sensortag-to-keen-io
=========================

Read Sensortag temp and humidity, send them to keen.io

## Installation on Raspberry Pi

### Install bluetooth libraries
```
sudo apt-get install libbluetooth-dev
```

### Install a more recent version of node to /opt/node
```
sudo mkdir /opt/node
wget http://nodejs.org/dist/v0.10.24/node-v0.10.24-linux-arm-pi.tar.gz
tar xvzf node-v0.10.24-linux-arm-pi.tar.gz
sudo cp -r node-v0.10.24-linux-arm-pi/* /opt/node
```
#### As root, dd these lines into /etc/profile before export PATH
```
NODE_JS_HOME="/opt/node"
PATH="$PATH:$NODE_JS_HOME/bin"
```
#### Logout for PATH changes to take effect
```
logout
```

#### login back
```
ssh pi@...
```

### install node modules
```
/opt/node/bin/npm install sensortag
/opt/node/bin/npm install keen.io
```

#### If and only if npm fails to load with https, set this and retry.
```
/opt/node/bin/npm config set registry http://registry.npmjs.org/
```


## Discover SensorTag uuids
The uuid per SensorTag may not be the same across machines.

```
sudo /opt/node/bin/node sensortag-discover.js
```

## Run daemon, as root
```
sudo keen_io_projectId=XX keen_io_writeKey=YY sensortag_uuid=X /opt/node/bin/node sensortag2keenio.js
```
