// File Header: This js file is served as server-side implementation

// Library declarations
var http=require('http')
            , fs = require('fs')
            , path =require('path')
            , express = require('express')
            , app = express()
            , socket=require('socket.io')
            , TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1') // text to speech
            , VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3') // visual recognition identifier
            , winston = require('winston') // to provide logging capability
            , env = process.env.NODE_ENV || 'development'
            , ss = require('socket.io-stream')
            , logDir = 'log';

// Join path from server to public folder:
app.use(express.static(path.join(__dirname, 'public')));

// Creating Visual Recognition
var visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    api_key: '272e2f6735aef5eb96b28a01c891d10a1befc9db'
});

// Creating Text to Speech Service
var text_to_speech = new TextToSpeechV1 ({
    username: "2b58351e-3631-4c1d-ab8d-69310341820d",
    password: "5ngrGa5DIcOJ"
});

// Creating the server
var server=http.createServer(app).listen(1996, function() {
    console.log("Listening at: http://localhost:1996")
});

// Connected server now will classify image object
socket.listen(server).on("connection", function(socket){
    logger.info("A client has connected to this port.")
    
    // Server detects that image has been uploaded
    socket.on('uploadImage',function(image){
        logger.info("Client requested for Watson Visual Recognition Service.");
        logger.info("Client has chosen picture to pass to Watson Visual Recognition API.")

        // passing of parameters for visual recognition
        // images file is image object
        var params = {
            images_file: image,
        };

        // notify client side to update the status and send face details to the client
        visualRecognition.detectFaces(params, function(err, response) {
            if (err){
                console.log(err);
                socket.emit('updateStatus', 'Failure', 'red');
                logger.info("Picture failed to pass to Watson Visual Recognition API.");
            }
            else{
                var result = JSON.stringify(response, null, 2)
                socket.emit('updateStatus', 'Success', 'chartreuse');
                logger.info("Picture successfully passed to Watson Visual Recognition API.");
                socket.emit('result',result);
                logger.info("Data obtained: JSON Object: " + result)
            }
          });        
     
    });
    
    // Convert text to speech (in mp3 format)
    socket.on('passMeAudio', function(text){
        
        // parameter required by the watson text-to-speech api
        var params = {
          text: text,
          voice: 'en-US_AllisonVoice',
          accept: 'audio/mp3'
        };
        
        // start new stream
        var stream = ss.createStream();

        // pass it to the client
        ss(socket).emit('audioStream', stream);
        
        // Pipe the synthesized text (audio) to the stream that is just given to the client.
        text_to_speech.synthesize(params).on('error', function(error) {
            console.log('Error:', error);
        }).pipe(stream);
           
    });
});

// create time stamp
const tsFormat = () => (new Date()).toLocaleTimeString();

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

// create winston logger
const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({ 
        timestamp: tsFormat,
        colorize: true ,
        level : 'info'
    }),
    // show what is going to be displayed in the result.txt file
    new (winston.transports.File)({
        filename: `${logDir}/results.log`,
        timestamp: tsFormat,
        level: env === 'development' ? 'debug' : 'info'  //dynamic level
      })
  ]
});
logger.info("Thank you for using this program!");