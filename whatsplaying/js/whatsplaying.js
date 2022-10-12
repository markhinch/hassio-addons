let host, port, username, password;
let useTLS = false;
let cleansession = true;
let reconnectTimeout = 3000;
let mqtt;

function MQTTconnect(config) {
    host = config.host;
    port = config.mqtt_port;
    username = config.username;
    password = config.password;
    if (typeof path == "undefined") {
        path = '/';
    }
    mqtt = new Paho.MQTT.Client(host, port, path, "mqtt_panel" + parseInt(Math.random() * 100, 10));

    let options = {
        timeout: 3,
        useSSL: useTLS,
        cleanSession: cleansession,
        onSuccess: onConnect,
        onFailure: function (message) {
            showIcon("failed");
            setTimeout(MQTTconnect, reconnectTimeout);
        },
        userName: username,
        password: password
    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;
    console.log("Host: " + host + ", Port: " + port + ", Path: " + path + " TLS: " + useTLS);
    mqtt.connect(options);
};

function onConnect() {
    console.log('Connected to ' + host + ':' + port + path);
    showIcon("connected");

    message = new Paho.MQTT.Message("Question");
    message.destinationName = "whatsplaying/asking";
    mqtt.send(message);

    //mqtt.subscribe('whatsplaying/artwork', { qos: 0 });
    mqtt.subscribe('whatsplaying/artwork', { qos: 0 });
    mqtt.subscribe('whatsplaying/action', { qos: 0 });
};

function onConnectionLost(response) {
    setTimeout(MQTTconnect, reconnectTimeout);
    showIcon("lost");
    console.log("Connection lost. Reconnecting...");
};

function onMessageArrived(message) {
//    navigator.wakeLock.request();

    let topic = message.destinationName;
//    $('#message').html(topic + ', ' + payload);
    let subtopic = topic.split('/')[1];
    if(subtopic == 'artwork') {
        let payload = JSON.parse(message.payloadString);
        $('#artwork').css('background-image', "url('" + payload.artUri + "')");
    } else if(subtopic == 'action') {
	console.log("0");
        let payload = message.payloadString;
        showAction(payload);
	console.log("1");
    }
    //showIcon(payload.state);
};

function showAction(whichAction) {
    //$('#action').html(whichAction);
    //return false;
    console.log("2");
    $('#action').html(whichAction).addClass('animate-flicker').delay(4000).queue(function( next ){
	console.log("3");
        $(this).removeClass('animate-flicker'); 
        next();
    });
}

function showIcon(whichState) {
    return false;
    $('#icon_' + whichState).addClass('animate-flicker').delay(4000).queue(function( next ){
        $(this).removeClass('animate-flicker'); 
        next();
    });
}

//$(document).ready(function () {
//    MQTTconnect();
//});

