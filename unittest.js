/*
Chai is a BDD / TDD assertion library
for node and the browser that can be delightfully paired with any javascript testing
framework.
*/ 
//describe() is merely for grouping, which you can nest as deep
// Here we should be getting the face, use getface ID, to return the number of faces and the fender and their age.
var chai = require('chai')
            , expect = chai.expect // Expect also allows you to include arbitrary messages to prepend to any failed assertions that might occur.
            , fs = require('fs')
            , VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3'); // visual recognition identifier

    var visualRecognition = new VisualRecognitionV3({
        version: '2018-03-19',
        api_key: '272e2f6735aef5eb96b28a01c891d10a1befc9db'
    });

    var images_file = fs.createReadStream('./Ginni_Rometty.jpg')

    var obj;

describe('visualTest', function() {

    // it() is a test case
    it('this should return number of faces', function () {

        var params = {
            images_file: images_file,
        };

        visualRecognition.detectFaces(params, function(err, response) {
            if (err){
                console.log(err);
            }
            else{
                obj = JSON.stringify(response, null, 2);
            };
        });
        
        setTimeout(function(){
            var facesNumber = obj.images[0].faces.length;
            expect(facesNumber).to.equal(1);
        },7000);
    });
    
    // it() is a test case
    it('this should return the average age', function () {

        var params = {
            images_file: images_file,
        };

        visualRecognition.detectFaces(params, function(err, response) {
            if (err){
                console.log(err);
            }
            else{
                obj = JSON.stringify(response, null, 2);
            };
        });
        
        setTimeout(function(){
            var maxAge = obj.images[0].faces[0].age.max;
            var minAge = obj.images[0].faces[0].age.min;
            var avgAge = Math.round((maxAge + minAge)/2);
            expect(avgAge).to.equal(52);
        },7000);
    });
});