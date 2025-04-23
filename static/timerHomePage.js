const countdownElement = document.getElementById("countdown");
const targetDate = new Date("2025-05-05T00:00:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance <= 0) {
    countdownElement.innerHTML = "NUUUUUUUU!!!!!!!!!!!";
    clearInterval(interval);
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  countdownElement.innerHTML = `${days} dagen ${hours}u ${minutes}m ${seconds}s`;
}

updateCountdown(); // eerste keer direct tonen
const interval = setInterval(updateCountdown, 1000);