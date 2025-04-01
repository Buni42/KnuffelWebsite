
Dropzone.options.myDropzone = {
    paramName: "image",  // Ensure it matches the backend name
    maxFilesize: 100,  // MB limit
    maxFiles: 10, // Maximum files per upload
    acceptedFiles: "image/*", //accept only images
    clickable: "#uploadBtn",
    
    autoProcessQueue: false,  // Automatically upload -> we dont want this, we want an actual working button to confirm the upload.
    init: function() {
        var myDropzone = this

        document.getElementById("submitBtn").disabled = true;
        myDropzone.on("addedfile", function() {
            document.getElementById("submitBtn").disabled = false;
        });


        document.getElementById("submitBtn").addEventListener("click", function () {
            myDropzone.processQueue();  // Manually trigger upload
        });
        
        // Remove preview after each successful upload
        myDropzone.on("success", function (file) {
            setTimeout(function () {
                myDropzone.removeFile(file);
            }, 1000); // Delay to show success message briefly
        });

        // Remove all previews when queue is complete
        myDropzone.on("queuecomplete", function () {
            setTimeout(function () {
                myDropzone.removeAllFiles(true); // Removes all uploaded file previews
            }, 1000);
        });

        myDropzone.on("error", function (file, response) {
            if (response.includes("429")) {
                alert("Upload limit exceeded. Try again later.");
            } else {
                alert("Upload error: " + response);
            }
        });

        console.log("Dropzone initialized");
    }
};

