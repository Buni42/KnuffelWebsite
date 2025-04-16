
Dropzone.options.myDropzone = {
    paramName: "image",  // Ensure it matches the backend name
    maxFilesize: 10,  // MB limit
    maxFiles: 10, // Maximum files per upload
    acceptedFiles: "image/*", //accept only images
    //clickable: "#uploadBtn", // make uploadbtn clickable for dropzone
    clickable: "#myDropzone", // make dropzone itself clickable for dropzone
    addRemoveLinks: true,
    parallelUploads: 10, // Ensures all files are processed together
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
        
        // Remove preview after each successful upload -> dont need this, we can do it in one go when the queue is complete
     /*    myDropzone.on("success", function (file) {
            console.log("file uploaded.")

            document.getElementById("submitBtn").disabled = true; // Disable submit button again.
            setTimeout(function () {
                myDropzone.removeFile(file);
            }, 1000); // Delay to show success message briefly
        });
 */
        // Remove all previews when queue is complete
        myDropzone.on("queuecomplete", function () {
            console.log("file(s) uploaded.")
            document.getElementById("submitBtn").disabled = true; // Disable submit button again.

            setTimeout(function () {
                myDropzone.removeAllFiles(true); // Removes all uploaded file previews
            }, 1000); // Delay to show success message briefly
        });

        myDropzone.on("error", function (file, response, xhr) {
            console.log("Error Response:", response); // Debugging

            if (xhr && xhr.status === 429) {  // Check HTTP status
                alert("Upload limit exceeded. Try again later.");
                myDropzone.removeAllFiles(true);
            } else {
                alert("Upload error: " + (response?.message || response || "Unknown error"));
                myDropzone.removeAllFiles(true);
            }
        });

        console.log("Dropzone initialized");
    }
};

