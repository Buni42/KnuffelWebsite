document.getElementById("fileInput").addEventListener("change", function(event) {
    let previewContainer = document.getElementById("previewContainer");
    previewContainer.innerHTML = "";  

    let file = event.target.files[0];
    if (file) {
        let img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = "300px";
        previewContainer.appendChild(img);
    }
});
