export async function loadBulkReservationView() {
  const container = document.createElement("div");
  container.innerHTML = `
    <h2>一括予約</h2>
    <form id="bulkForm">
      <input type="text" name="name" placeholder="名前">
      <input type="text" name="dates" placeholder="2025-05-01,2025-05-02">
      <button type="submit">送信</button>
    </form>
  `;

  container.querySelector("#bulkForm").addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    alert(`予約者: ${formData.get("name")}、日付: ${formData.get("dates")}`);
  });

  return container;
}
