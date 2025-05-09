Dropzone.options.myDropzone = {
    paramName: "image",  // Ensure it matches the backend name
    maxFilesize: 10,  // MB limit
    maxFiles: 20, // Maximum files per upload
    acceptedFiles: "image/*", //accept only images
    clickable: "#myDropzone", // make dropzone itself clickable for dropzone
    addRemoveLinks: true,
    parallelUploads: 20, // Ensures all files are processed together
    autoProcessQueue: false,  // Automatically upload -> we dont want this, we want an actual working button to confirm the upload.

    init: function() {
        var myDropzone = this
        // The initial uploaded pictures, this is used to resize the dropzone
        let aantalFotoContenders = 0;

        // Set initial dropzone width and height
        document.getElementById("myDropzone").style.maxWidth = 1000 + 'px';
        document.getElementById("myDropzone").style.maxHeight = 300 + 'px';

        // Disable, only enable when there is a fotoContender (on file added)
        document.getElementById("submitBtn").disabled = true;

        myDropzone.on("addedfile", function() {
            document.getElementById("submitBtn").disabled = false;

            aantalFotoContenders += 1;
            console.log("aantal files in dropzone",aantalFotoContenders);

            // Set dropzone width 
            let dropzoneWidth = 150 * aantalFotoContenders;
            document.getElementById("myDropzone").style.maxWidth = dropzoneWidth + 'px';

            const previews = document.querySelectorAll('.dz-preview');
            let currentRowTop = null;
            let rowCount = 1;

            // Count every time a new row is added so that we can change the dropzone height based on that
            previews.forEach((preview) => {
                const top = preview.offsetTop;

                if (currentRowTop === null) {
                    currentRowTop = top;
                    rowCount++;
                } else if (top > currentRowTop) {
                    currentRowTop = top;
                    rowCount++;
                }
            });

            console.log(`Number of rows: ${rowCount}`);

            let dropzoneHeight = 300 * rowCount;
            document.getElementById("myDropzone").style.maxHeight = dropzoneHeight + 'px';
        });

        myDropzone.on("removedfile", function(){
            aantalFotoContenders -= 1;
            console.log("aantal files in dropzone",aantalFotoContenders);

            let dropzoneWidth = 150 * aantalFotoContenders;
            document.getElementById("myDropzone").style.maxWidth = dropzoneWidth + 'px';

            // Every uploaded file is removed from dropzone
            if (aantalFotoContenders == 0) {
                document.getElementById("submitBtn").disabled = true;
                document.getElementById("myDropzone").style.maxWidth = 1000 + 'px';
            }
        });


        document.getElementById("submitBtn").addEventListener("click", function () {
            myDropzone.processQueue();  // Manually trigger upload
            
        });
        
        // Remove all previews when queue is complete
        myDropzone.on("success", function () {
            console.log("file(s) uploaded.")
            document.getElementById("submitBtn").disabled = true; // Disable submit button again.

            setTimeout(function () {
                myDropzone.removeAllFiles(true); // Removes all uploaded file previews
            }, 1000); // Delay to show success message briefly
            
            // add accepted fotos from the que to aantal and redirect to bedrag page
            let aantalFotos = myDropzone.getAcceptedFiles().length;
            localStorage.setItem("aantalFotos", aantalFotos);
            window.location.href = "Bedrag";
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

        // Handle "Take Picture" button click
        document.getElementById("takePicBtn").addEventListener("click", function () {
            document.getElementById("cameraInput").click();  // Trigger hidden file input
        });
        

        // Handle file input (take picture)
        document.getElementById("cameraInput").addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                myDropzone.addFile(file); // Add manually to Dropzone
            }
        });


        // Take picture for desktop users
        const video = document.getElementById('video');
        const canvas = document.getElementById('cameraCanvas');
        const snapButton = document.getElementById('snap');
        const startCameraBtn = document.getElementById('startCameraBtn');

        
        let stream;

        // When "Take Picture" button is clicked
        startCameraBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            cameraContainer.style.display = 'block'; // Show the preview
        } catch (err) {
            alert("Could not access camera: " + err.message);
        }
        });
        
        
        // Take picture and add to dropzone previeuw 
        snapButton.addEventListener("click", function () {
            const ctx = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
            canvas.toBlob(function (blob) {
              const file = new File([blob], "webcam-picture.jpg", { type: "image/jpeg" });
              myDropzone.addFile(file); // Adds to Dropzone preview & queue
            }, "image/jpeg");
          });


    }
};


