// File Header: This js file is mainly responsible for the animation of client page.

$(function(){
    
    // section variable declaration
    var $status = $('#status');
    var $progressText = $('#progressText');
    var $progressBar = $('#progressBar');
    var $resultArea = $('#resultArea');
    var $detailButton = $('#detailButton');
    var $uploadButton = $('#uploadButton');
    
    // scroll down animation and display result part on client page
    $detailButton.click(function() {
        $resultArea.css('display', 'flex');
        $('html,body').animate({ scrollTop: $resultArea.offset().top }, 1500);
    });
    
    // a function that shows progress animation on the login page
    // modified source code from www.w3schools.com 
    $uploadButton.click(function(){
        // disable upload button to prevent another upload session while one is being processed
        $uploadButton.prop("disabled",true);
        $uploadButton.css('cursor','not-allowed');
        console.log('Upload Button Disabled')
        
        // disable detail button to make the application logical
        $detailButton.prop("disabled",true);
        $detailButton.css('cursor','not-allowed');
        $detailButton.css('font-weight','100');
        
        // animation for showing the progression of uploading
        // only for fun
        $resultArea.css('display', 'none');
        $status.css('visibility', 'visible'); 
        $progressText.css('visibility', 'hidden'); 
        $progressBar.css('visibility', 'visible'); 
        $progressBar.css('background-color', 'cornflowerblue');

        var width = 1;
        var intervalID = setInterval(move, 15);

        // this method basically fills the status progress bar when it is less than 100%
        function move() {
            if (width >= 100) {
                clearInterval(intervalID);
                // put 'pending' text after 0.5 second
                setTimeout(function(){ $progressBar.text('Pending');
                                       console.log('Status: Pending...')
                                     }, 500);
            } 
            else {
                width++;
                $progressBar.css('width', width+'%');
                $progressBar.text(width + '%');
            }
        }
    });
    
    // customized event 'showDetail' enables/disables detail button according to progress status given
    $detailButton.bind('showDetail', function(e, data){
        var status = $progressBar.html();
        
        if(status == 'Success'){
            // make the detail button disable
            $detailButton.prop("disabled",false);
            $detailButton.css('cursor','pointer');
            $detailButton.css('font-weight','bold');
            
            console.log('Detail Button Enabled');
        }
        else{
            // enable the detail button
            $detailButton.prop("disabled",true);
            $detailButton.css('cursor','not-allowed');
            $detailButton.css('font-weight','100');
            
            console.log('Detail Button Disabled');
        }
        // enable the upload button
        $uploadButton.prop("disabled",false);
        $uploadButton.css('cursor','pointer');
        
        console.log('Upload Button Enabled');
    });

});