import { loadBulkReservationView } from './bulkReservation.js';

const app = document.getElementById("app");

document.addEventListener("DOMContentLoaded", () => {
  const menuBulk = document.getElementById("menuBulk");
  if (menuBulk) {
    menuBulk.addEventListener("click", async (e) => {
      e.preventDefault();
      app.innerHTML = "";
      const bulkView = await loadBulkReservationView();
      app.appendChild(bulkView);
    });
  }
});
