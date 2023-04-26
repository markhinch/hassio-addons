# "What's Playing" Home Assistant Addon

This addon runs a simple local webserver that serves a basic webpage which simply shows album artwork and basic information which it receives via MQTT (best served via Node Red, using the "node-red-contrib-sonos-events" and "node-red-contrib-sonos-plus" palettes).

![What's Playing render](https://images.squarespace-cdn.com/content/636e179a0d1d302f2775a005/3c124a5f-0efb-46a9-96c0-b2a209aa67f7/Scene_230321_3.png?content-type=image%2Fpng)

This repo includes an STL for 3d printing a case. This is designed to work with a [Raspberry Pi Zero 2 W](https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/) and a [Pimoroni Hyperpixel (NON-touch version)](https://shop.pimoroni.com/products/hyperpixel-4-square?variant=30138251477075).

## Installation

- Follow the instructions [here](https://www.home-assistant.io/common-tasks/os#installing-third-party-add-ons), using this repo's URL - https://github.com/markhinch/hassio-addons.git
- If you are using a screen that you would like to be turned on and off (ie: Pimoroni attached to a RPi Zero 2 W), follow the additional instructions  [here](https://github.com/markhinch/pimoroni-commands/) on the Pi Zero
- Ensure you are running a local MQTT broker (Mosquitto recommended)
- Ensure you have Node Red set up and running
- Set the basic configuration variables in the Add-on and start it up
- Set up a Node Red flow (example below) to connect to the frontend
- Load up a web browser and checkensure that the frontend is being served (defaults to [http://homeassistant.local:777](http://homeassistant.local:777))

## Notes

The frontend is verrry basic at this point and is set up to work on a square screen which is rotated (due to some shenanigans with the Pimoroni Hyperpixel's rotation)

## Example Node Red flow

X.X.X.X is for Sonos
Y.Y.Y.Y is for the (optional) screen control http calls

```
[{"id":"7246a9c4f7fa383a","type":"sonosevents-selection","z":"57de5c55f069456b","name":"Sonos events listener","confignode":"91ee3d72e31aa9b0","playerHostname":"X.X.X.X","events":[{"fullName":"AVTransportService.content"}],"outputs":1,"x":140,"y":100,"wires":[["3b5be77abc725f1b"]]},{"id":"3b5be77abc725f1b","type":"delay","z":"57de5c55f069456b","name":"Rate limit","pauseType":"rate","timeout":"5","timeoutUnits":"seconds","rate":"1","nbRateUnits":"1","rateUnits":"second","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":true,"allowrate":false,"outputs":1,"x":420,"y":100,"wires":[["cbe5518934cbbfd5"]]},{"id":"cbe5518934cbbfd5","type":"function","z":"57de5c55f069456b","name":"Generate search term","func":"let searchTerm = '';\n\nsearchTerm += '\"' + msg.payload.artist + '\" ';\nsearchTerm += '\"' + msg.payload.title + '\" ';\n\nsearchTerm = encodeURIComponent(searchTerm);\n\nmsg.payload.searchTerm = \"https://www.google.com/search?q=\" + searchTerm;\n\nreturn msg;","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":720,"y":120,"wires":[["1d26b8693b5e96c3"]]},{"id":"43f7fb7a183c4e4f","type":"sonos-universal","z":"57de5c55f069456b","confignode":"a92b267f4f686c4f","command":"group.get.trackplus","state":"","stateType":"str","avoidCheckPlayerAvailability":false,"name":"Sonos events call","x":450,"y":160,"wires":[["cbe5518934cbbfd5"]]},{"id":"1d26b8693b5e96c3","type":"switch","z":"57de5c55f069456b","name":"","property":"payload.playbackstate","propertyType":"msg","rules":[{"t":"eq","v":"playing","vt":"str"},{"t":"null"}],"checkall":"true","repair":false,"outputs":2,"x":930,"y":120,"wires":[["36c54c1d6edbaace","3b93fc4c53b284d6"],[]]},{"id":"651bf52fbf731ebc","type":"mqtt in","z":"57de5c55f069456b","name":"What's Playing frontend request","topic":"whatsplaying/retrieve","qos":"2","datatype":"auto-detect","broker":"0c9aa73e147e8e2f","nl":false,"rap":true,"rh":0,"inputs":0,"x":170,"y":160,"wires":[["43f7fb7a183c4e4f"]]},{"id":"36c54c1d6edbaace","type":"mqtt out","z":"57de5c55f069456b","name":"Update What's Playing","topic":"whatsplaying/update","qos":"","retain":"","respTopic":"","contentType":"","userProps":"","correl":"","expiry":"","broker":"0c9aa73e147e8e2f","x":1180,"y":60,"wires":[]},{"id":"3b93fc4c53b284d6","type":"http request","z":"57de5c55f069456b","name":"Screen wake","method":"GET","ret":"txt","paytoqs":"ignore","url":"http://Y.Y.Y.Y:3000/wake","tls":"","persist":false,"proxy":"","insecureHTTPParser":false,"authType":"","senderr":false,"headers":[],"x":1150,"y":120,"wires":[["8d08902cb8762ada"]]},{"id":"8d08902cb8762ada","type":"trigger","z":"57de5c55f069456b","name":"","op1":"","op2":"","op1type":"pay","op2type":"payl","duration":"30","extend":true,"overrideDelay":true,"units":"min","reset":"","bytopic":"all","topic":"topic","outputs":2,"x":1390,"y":120,"wires":[[],["b018361c71d118b3"]]},{"id":"b018361c71d118b3","type":"http request","z":"57de5c55f069456b","name":"Screen sleep","method":"GET","ret":"txt","paytoqs":"ignore","url":"http://Y.Y.Y.Y:3000/sleep","tls":"","persist":false,"proxy":"","insecureHTTPParser":false,"authType":"","senderr":false,"headers":[],"x":1630,"y":120,"wires":[[]]},{"id":"91ee3d72e31aa9b0","type":"sonosevents-config","name":"Boaty Sonos","listenerHostname":"homeassistant.local","listenerPort":"","portType":"num"},{"id":"a92b267f4f686c4f","type":"sonos-config","name":"Lounge","serialnum":"","ipaddress":"X.X.X.X"},{"id":"0c9aa73e147e8e2f","type":"mqtt-broker","name":"MQTT HomeAssistant","broker":"homeassistant.local","port":"1883","clientid":"","autoConnect":true,"usetls":false,"protocolVersion":"4","keepalive":"60","cleansession":true,"birthTopic":"","birthQos":"0","birthPayload":"","birthMsg":{},"closeTopic":"","closeQos":"0","closePayload":"","closeMsg":{},"willTopic":"","willQos":"0","willPayload":"","willMsg":{},"userProps":"","sessionExpiry":""}]
```

![Node Red flow](https://images.squarespace-cdn.com/content/636e179a0d1d302f2775a005/9e4fb4f7-03c8-4e88-99d3-c559c5cd259b/Screenshot+2023-03-27+135502.png?content-type=image%2Fpng)

## Notes for getting up and running in alternative ways

For running the backend on Docker in Raspbian (ie: not as a Home Assistant Add-on), you can use this command to spin up the container:

`docker build --build-arg BUILD_FROM="python:3" -t whatsplaying_web .`

For running / testing the backend locally on your development machine, run with:

`python -m http.server`

Please note that to run outside of Home Assistant, you'll need manually create the config file. You can do this by creating a local `data/options.json` file (which is usually generated by the Addon on Home Assistant). This file looks like this:

```
{
	"mqtt_username": "",
	"mqtt_password": "",
	"mqtt_host": "homeassistant.local",
	"mqtt_port": 1884,
	"show_qr": false
}
```
---
For invoking the frontend on a Raspberry Pi kiosk at boot, create a file in the home directory named "kiosk.sh" (also `chmod +x` it) with the following:

```
#!/bin/bash

xset s noblank
xset s off
xset -dpms

unclutter -idle 0.5 -root &

sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/$USER/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/$USER/.config/chromium/Default/Preferences

/usr/bin/chromium-browser --noerrdialogs --kiosk http://homeassistant.local:777 &
```

Then edit ~/.config/lxsession/LXDE-pi/autostart and add the following:

`@/home/USERNAME/kiosk.sh`
