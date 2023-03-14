let path;
let client;

function MQTTconnect(config) {
	console.log(config.mqtt_host);
    if (typeof path == "undefined") {
        path = '/';
    }

	// Create MQTT client
	client = new Paho.MQTT.Client(config.mqtt_host, config.mqtt_port, path, "whatsplaying");

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
	setTimeout(MQTTconnect, reconnectTimeout);
}

// Callback function for successful connection
function onConnect() {
	console.log("Connected to MQTT server");

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
		console.log("Connection lost: " + responseObject.errorMessage);
	}
}

// Callback function for received message
function onMessageArrived(message) {
	console.log("Message received: " + message.payloadString);

	// Parse message payload as JSON object
	var data = JSON.parse(message.payloadString);

	// Extract image URL from "image" field
	var imageUrl = data.artUri;

	// Update image element with new source
	document.getElementById("artwork").src = imageUrl;
}

fetch("data/options.json")
    .then(response => response.json())
    .then(json => MQTTconnect(json));