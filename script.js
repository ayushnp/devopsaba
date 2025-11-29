const countdownElement = document.getElementById("countdown");

const eventDate = new Date("May 10, 2026 10:00:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const gap = eventDate - now;

  const days = Math.floor(gap / (1000 * 60 * 60 * 24));
  const hours = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((gap % (1000 * 60)) / 1000);

  if (gap > 0) {
    countdownElement.textContent = `Starts in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else {
    countdownElement.textContent = "The event has started!";
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();
