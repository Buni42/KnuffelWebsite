// For mobile users, show another type of navbar and add the take picture button
window.addEventListener("DOMContentLoaded", () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const takePicBtn = document.getElementById("takePicBtn");
    const navbarPC = document.getElementById("navbarPC");
    const navbarMobile = document.getElementById("navbarMobile");

    if (takePicBtn && !isMobile) {
        takePicBtn.style.display = "none";
    }

    if (navbarPC) {
        navbarPC.style.display = isMobile ? "none" : "";
    }

    if (navbarMobile) {
        navbarMobile.style.display = isMobile ? "" : "none";
    }
});
