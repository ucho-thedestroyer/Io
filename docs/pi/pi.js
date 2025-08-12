// Example: Randomize visitor count to mimic old BBS style stats
document.addEventListener("DOMContentLoaded", function() {
  const stats = document.querySelectorAll(".right-column ul li");
  stats[0].textContent = `Visitors today: ${Math.floor(Math.random() * 100) + 1}`;
  stats[2].textContent = `Online now: ${Math.floor(Math.random() * 5) + 1}`;
});
