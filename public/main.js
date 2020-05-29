// File Header: This js file is mainly responsible for the main functionality of client page and interaction with server

/**
The constructor of the class we use for this assignment to build the client side
**/
function ImageRecognition(){
    // Link sections from index.html
    this.socket = io.connect();
    this.imageInput = document.getElementById("imageInput");
    this.status = document.getElementById("status");
    this.numOfFaces = document.getElementById("numOfFaces");
    this.detailButton = document.getElementById("detailButton");
    this.uploadButton = document.getElementById("uploadButton");
    this.progressText = document.getElementById("progressText");
    this.progressBar = document.getElementById("progressBar");
    this.resultContent = document.getElementById("resultContent");
    this.resultInput = document.getElementById("resultInput");
    this.resultOutput = document.getElementById("resultOutput");
    this.preview = document.getElementById("imagePreview");
    this.originalImage = document.createElement("img"); 
    
    // Button-related event and socket observers setup
    this.uploadButton.addEventListener('click',this.uploadButtonClicked.bind(this));
    this.detailButton.addEventListener('click',this.detailButtonClicked.bind(this));
    this.imageInput.addEventListener('change',this.previewFile.bind(this));
    this.updateStatus();
    this.getResult();
    this.setUpAudioStreamListener();
}

/**
This method shows the preview of the uploaded image
@precondition: file loaded has to be image or else it will not be shown in preview section
**/
ImageRecognition.prototype.previewFile = function() {
    var file    = document.getElementById("imageInput").files[0] // the image source
    var reader = new FileReader(); // literaly the reader for reading files
    
    // once it is loaded with data, it set the preview image to what reader got
    // originalImage is just used to keep the original image's size
    reader.addEventListener('load', () => {
        this.preview.src = reader.result;
        this.originalImage.src = reader.result;
        console.log('Preview Image Loaded');
    }, false);
    
    // read the file as url if there is a file
    if (file) {
        reader.readAsDataURL(file);
    }
}

/**
This method is responsible for passing the image buffer to the server
**/
ImageRecognition.prototype.uploadButtonClicked = function() {
    // clear cropped face images and the full image
    this.resultContent.innerHTML = "";
    // set interval for listening percentage changes
    var reader = new FileReader();
    var file    = document.getElementById("imageInput").files[0]
    var intervalID = setInterval(checkPercentage, 15);
    
    // read the file as buffer if there is a file
    if (file) {
        reader.readAsArrayBuffer(file);
    }
    
    // this function is to check whether the percentage is equal to 100%
    // if condition met, it will send image buffer to server and clear the image uploading input field
    function checkPercentage(){
        if(imageRecognition.progressBar.style.width == '100%'){
            console.log('Image Uploaded');
            
            // emit image buffer to server
            imageRecognition.socket.emit('uploadImage', reader.result);
            imageRecognition.imageInput.value = '';
            console.log('Input Field Clear')
            
            // kill interval
            clearInterval(intervalID);
        }
    }
}

/**
This method will play audio directly when detail button is clicked
**/
ImageRecognition.prototype.detailButtonClicked = function() {
    var audio = document.getElementById('audioHeader');
    audio.play();
    console.log('Audio Played');
}

/**
Listener for updating the status along with some interactive background colors
**/
ImageRecognition.prototype.updateStatus = function(){
    console.log('Status Listener Set Up Complete');
    
    this.socket.on('updateStatus', (status, bgcolor) => {
        // update status changes by modifying progress bar
        this.progressBar.textContent = status;
        this.progressBar.style.backgroundColor = bgcolor;
        console.log('Status: ' + status);
        
        // trigger customized event to activate a certain activity occurs in main2.js
        var event = document.createEvent("HTMLEvents");
        event.initEvent("showDetail", true, true);
        this.detailButton.dispatchEvent(event);
    });
}

/**
This method does a series of actions once it receives result
First, it will extract the data from the JSON object and store them into variables with meaningful name.
Then, it displays the number of faces.
After that, it will crop face images and draw boxes for highlighting face locations.
Certainly, the text input is sent to the server in order to use the text-to-speech service.
**/
ImageRecognition.prototype.getResult = function(){
    console.log('Result Listener Set Up Complete');
    
    this.socket.on('result', (string_obj)=>{
        var obj = JSON.parse(string_obj);
        var faces = obj.images[0].faces
        var minimumAges = faces.map(data => data.age.min)
        var maximumAges = faces.map(data => data.age.max)
        var faceLocations = faces.map(data => data.face_location)
        var genders = faces.map(data => data.gender.gender)
        var text = 'The number of faces in this image is '+faces.length +'.\n'; // the content of audio
        
        // set face number to show it on client page
        this.numOfFaces.textContent = faces.length;
        
        // this loop calls the method for cropping faces
        // it appends text data to generate the input for text-to-speech service
        for(var i = 0; i < faces.length; i++){
            var faceCounter = i + 1;
            var avgAge = Math.round((maximumAges[i]+minimumAges[i]) / 2)
            this.cropImage("face"+faceCounter, faceLocations[i], avgAge, genders[i])
            
            text = text + 'The average age for face ' + faceCounter + ' is ' + avgAge +
                   '-year-old and its gender is '+ genders[i].toLowerCase() + '.\n'
    
        }
        console.log('The Summary Of Data Received:\n'+text);
        
        // pass text to server
        this.socket.emit('passMeAudio', text)
        
        // draw boxes for highlighting faces
        this.drawBox(faceLocations);
        
    });
}

/**
This method is used to crop the image according to the face location obtained from the result
@param section_id: the id of element that the cropped face image is going to place on
@param face_loc: the JSON object that contains the information of face location (left, top, width, height)
@param age: an integer indicating the age of the cropped face image
@param gender: a string that can be either MALE or FEMALE
**/
ImageRecognition.prototype.cropImage = function(section_id, face_loc, age, gender){
    console.log('Cropping '+section_id.charAt(0).toUpperCase() + section_id.substr(1)+' Image');
    
    var newImg = this.getImagePortion(face_loc.height, face_loc.width, face_loc.left, face_loc.top);
    var ul = document.createElement('ul');
    var li_1 = document.createElement('li');
    var li_2 = document.createElement('li');
    var li_3 = document.createElement('li');
    var li_4 = document.createElement('li');
    var crop_face = document.createElement('img');
    
    // create li objects for showing data
    crop_face.src = newImg;
    li_1.appendChild(crop_face);
    li_2.textContent = 'ID: ' + section_id.toUpperCase();
    li_3.textContent = 'Age: ' + age;
    li_4.textContent = 'Gender: ' + gender;
    
    // place new faces on result area
    ul.appendChild(li_1);
    ul.appendChild(li_2);
    ul.appendChild(li_3);
    ul.appendChild(li_4);
    this.resultContent.appendChild(ul);
    
    console.log(section_id.charAt(0).toUpperCase() + section_id.substr(1) +' Image Cropped Successfully');
}

/**
This method is the main part of how to crop the image based on top, left, height and width
It will eventually return the source link for img object to refer
@param newHeight: the height of the face located with comparison to the original image
@param newWidht: the height of the face located with comparison to the original image
@param startX: the top left corner's X coordination of the face located with comparison to the original image
@param startY: the top left corner's Y coordination of the face located with comparison to the original image
@return: the cropped face image' source link (URL)
**/
ImageRecognition.prototype.getImagePortion = function(newHeight, newWidth, startX, startY){
    var tnCanvas = document.createElement('canvas');
    var tnCanvasContext = tnCanvas.getContext('2d');
    
    // set canvas context width and height
    tnCanvas.width = 250; 
    tnCanvas.height = 250;
    
    // draw image into another image with new sizes
    // return it as source link for img object to refer
    tnCanvasContext.drawImage(this.originalImage, startX, startY, newWidth, newHeight, 0, 0, 250, 250);
    return tnCanvas.toDataURL();
}

/**
This method is used to highlight all faces by drawing boxes on each face according to the face locations given
@param face_loc: a list of JSON objects that contains each face's location detail
**/
ImageRecognition.prototype.drawBox = function(face_loc){
    console.log('Highlighting Faces');
    
    var tnCanvas = document.createElement("canvas");
    var tnCanvasContext = tnCanvas.getContext("2d");
    
    // copy and paste the image onto the canvas
    tnCanvas.width = this.originalImage.width;
    tnCanvas.height = this.originalImage.height;
    tnCanvasContext.lineDashOffset = 10;
    tnCanvasContext.lineWidth = "4";
    tnCanvasContext.strokeStyle = "cyan";
    tnCanvasContext.setLineDash([10,10]);
    tnCanvasContext.drawImage(this.originalImage, 0, 0);
    
    // draw boxes according to (left, top, width, height)
    for(var i = 0; i < face_loc.length; i++){
        tnCanvasContext.rect(face_loc[i].left, face_loc[i].top, face_loc[i].width, face_loc[i].height);
        tnCanvasContext.stroke();
    }
    
    // convert image (on the canvas) to source link
    // assign it to fullImage section
    // eventually include it under resultHeader section
    this.resultInput.src = this.originalImage.src
    this.resultOutput.src = tnCanvas.toDataURL();
    
    console.log('Faces Highlighted Complete');
} 

/**
This method is used to set up the observer for getting the audio
**/
ImageRecognition.prototype.setUpAudioStreamListener = function(){
    console.log('Audio Stream Listener Set Up Complete');
    
    ss(this.socket).on('audioStream', function(stream) {
        console.log('Stream received');
        
        var parts = [];

        // while pumping stream data, get the chunk and push it into parts
        stream.on('data', (chunk) => {
            console.log('Receiving Chunks');
            parts.push(chunk);
        });
        
        // once it is done, audio stream is ready to be served
        // and it will be played directly
        stream.on('end', function () {
            console.log('All Chunks Received');
            var audio = document.getElementById('audioHeader');
            audio.src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
        });
    });
    
}

/**
Action when someone enters the website 
**/
window.onload = function() {
    window.imageRecognition = new ImageRecognition();
}
