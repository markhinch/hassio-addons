let path;
let client;

function MQTTconnect(config) {
	//console.log(config.mqtt_host);
    if (typeof path == "undefined") {
        path = '/';
    }

	// Create MQTT client
	client = new Paho.MQTT.Client(config.mqtt_host, config.mqtt_port, path, "whatsplaying_" + (Math.random() * 1000));

        // useSSL: useTLS,
        // cleanSession: cleansession,
    let options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure,
        userName: config.mqtt_username,
        password: config.mqtt_password
    };

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

	// Connect to MQTT server
    client.connect(options);
};

// Callback function for failed connection
function onFailure() {
	setTimeout(MQTTconnect, 3000);
}

// Callback function for successful connection
function onConnect() {
	//console.log("Connected to MQTT server");

	// Ask for current state
	var message = new Paho.MQTT.Message("");
	message.destinationName = "whatsplaying/retrieve";
	client.send(message);

	// Subscribe to topic
	client.subscribe("whatsplaying/update");
}

// Callback function for lost connection
function onConnectionLost(responseObject) {
	if (responseObject.errorCode !== 0) {
		//console.log("Connection lost: " + responseObject.errorMessage);
	}
}

// Callback function for received message
function onMessageArrived(message) {
	//console.log("Message received: " + message.payloadString);

	// Parse message payload as JSON object
	var data = JSON.parse(message.payloadString);

	// Extract image URL from "image" field
	var imageUrl = data.artUri;

	// Update image element with new source
	document.getElementById("artwork").style.backgroundImage = 'url("' + imageUrl + '")';
}

fetch("data/options.json")
    .then(response => response.json())
    .then(json => MQTTconnect(json));

// Click after 5 seconds (to remove Midori interface)
setTimeout(() => {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const element = document.elementFromPoint(x, y);

    if (element) {
        element.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    }
}, 5000);