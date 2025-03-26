
Dropzone.options.myDropzone = {
    paramName: "image",  // Ensure it matches the backend name
    maxFilesize: 10,  // MB limit
    acceptedFiles: "image/*",
    autoProcessQueue: true,  // Automatically upload -> we dont want this, we want an actual working button to confirm the upload.
    init: function() {
        console.log("Dropzone initialized");
    }
};

