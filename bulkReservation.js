// bulkReservation.js

// 「一括予約」ボタンがクリックされたときに表示
function showBulkReservationPage() {
  document.getElementById("calendar").style.display = "none"; // カレンダー非表示
  document.getElementById("bulkReservationPage").style.display = "block"; // 一括予約表示
  document.getElementById("dropdownMenu").style.display = "none"; // メニュー非表示
      if (!document.getElementById("start-0")) {
      populateDefaultTimeSettings(); // 初回のみ生成
}
}

// 戻るボタンを押したときにカレンダーを再表示
function showMainPage() {
  document.getElementById("calendar").style.display = "block"; // カレンダー表示
  document.getElementById("bulkReservationPage").style.display = "none"; // 一括予約非表示
}

// 日付選択用のflatpickr初期化
document.addEventListener("DOMContentLoaded", function() {
  const datePicker = document.getElementById("multiDatePicker");

  flatpickr(datePicker, {
    mode: "multiple", // 複数日選択
    dateFormat: "Y-m-d",
  });
});

  // 一括予約ページが表示されたときにテーブル行を追加
  function populateDefaultTimeSettings() {
    const days = ["日","月","火","水","木","金","土"];
    const table = document.getElementById("defaultTimeTable");

    days.forEach((day, i) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${day}</td>
        <td><input type="time" id="start-${i}" /></td>
        <td><input type="time" id="end-${i}" /></td>
      `;

      table.appendChild(row);
    });
  }

