# FIT3140 Assignemnt 5

Libraries that you need to install: <br />
- socket.io <br />
- express <br />
- watson-developer-cloud <br />
- winston <br />
- socket.io-stream <br />
- mocha <br />
- chai <br />


### How to set up and use the system:
step 1 - open terminal <br />
step 2 - cd to the directory in which server.js is located <br />
step 3 - node server.js <br />
step 4 - log on to ‘http://localhost:1996’ <br />
step 5 - select the image you wish to upload by clicking the "Choose file" button, followed by clicking the "Upload" button <br />
step 6 - click on the "More Details" button if the status of uploading process is successful <br />
step 7 - scroll to the bottom of the page to replay the audio data if you wish to hear it again <br />

### Some issues you might face
- Unable to have face detecting or audio playing because quota exceeded as free trial limits the use of the API service <br />
- Audio stream passing delay occurs if many faces are detected after another process is conducted (Not really an error but imperfect implementation) <br />
- Unresponsive page design as our aim mainly focus on the functionality. The view is built according to 13 inches screen-size but it still looks nice when it comes to 15 inches screen-size by turning the page to full screen. <br />
