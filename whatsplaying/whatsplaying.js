let path;
let client;
let show_qr;

function MQTTconnect(config) {
	//console.log(config.mqtt_host);
    if (typeof path == "undefined") {
        path = '/';
    }

	// Create MQTT client
	client = new Paho.MQTT.Client(config.mqtt_host, config.mqtt_port, path, "whatsplaying_" + (Math.random() * 1000));
    show_qr = config.show_qr;

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
	setTimeout(initialLoad, 3000);
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

	showImage(imageUrl, data.artist, data.title);
    show_qr ? showQRCode(data.searchTerm) : hideQRCode();

//	document.getElementById("artwork").style.backgroundImage = 'url("' + imageUrl + '")';
}

function initialLoad() {
	fetch("data/options.json")
	    .then(response => response.json())
	    .then(json => MQTTconnect(json));
}

function showImage(imageUrl, bandName, songTitle) {
    var currentImage = document.getElementById("currentImage");

    // Update band name and song title
//    document.getElementById("bandName").textContent = bandName;
//    document.getElementById("songTitle").textContent = songTitle;

    // Preload the new image
    const newImage = new Image();
    newImage.src = imageUrl;

    // When the new image is loaded, start the transition
    newImage.onload = () => {
        // Fade out the current image
        currentImage.style.opacity = 0;

        // After the fade-out transition is complete, swap the images and fade in
        setTimeout(() => {
            currentImage.src = newImage.src;
            currentImage.style.opacity = 1;
        }, 2000);
    };
}

function showQRCode(url) {
    var qrCode = document.getElementById('qrCode');

    qrCode.classList.add('show');

    // Clear the div before adding the new QR code
    while (qrCode.firstChild) {
        qrCode.removeChild(qrCode.firstChild);
    }

    const qr = new QRCode(qrCode, {
        text: url,
        width: 162.5,
        height: 162.5,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L
    });
}

function hideQRCode() {
    if (qrCode.classList.contains('show')) {
        qrCode.classList.remove('show');
    }

    // Clear the div before adding the new QR code
    while (qrCode.firstChild) {
        qrCode.removeChild(qrCode.firstChild);
    }
}

window.onload = (event) => {
    initialLoad();
};
