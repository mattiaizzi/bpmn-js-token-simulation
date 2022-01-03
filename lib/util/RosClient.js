// recuperiamo la libreria
const roslib = window.ROSLIB;
// instanziamo il client ROS
const ros = new roslib.Ros();

// Metodi per collegarsi ai vari eventi
ros.on('error', function(error) {
console.log('error');
});

ros.on('connection', function() {
console.log('Connection made!');
});
ros.on('close', function() {
console.log('Connection closed.');
});

// Connessione con il server avviato in precedenza
ros.connect('ws://localhost:9090');

// Collegamento al topic
var topic = new ROSLIB.Topic({
ros : ros,
name : '/example_topic',
messageType : 'std_msgs/String'
});

export {
    ros, topic
}