// For mobile users, show another type of navbar and add the take picture button
window.addEventListener("DOMContentLoaded", () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const takePicBtnMobile = document.getElementById("takePicBtn");
    const takePicBtnPC = document.getElementById("startCameraBtn");
    const navbarPC = document.getElementById("navbarPC");
    const navbarMobile = document.getElementById("navbarMobile");

    if (takePicBtnMobile && !isMobile) {
        takePicBtnMobile.style.display = "none";
    }

    if(takePicBtnPC && isMobile){
        takePicBtnPC.style.display = "none";
    }

    if (navbarPC) {
        navbarPC.style.display = isMobile ? "none" : ""; // If mobile true, then navbarPC = none, else do nothing
    }

    if (navbarMobile) {
        navbarMobile.style.display = isMobile ? "" : "none"; // Same logic
    }
});
