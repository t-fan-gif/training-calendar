// bulkReservation.js

// メニュー表示/非表示を切り替える
document.getElementById("menuToggle").addEventListener("click", function() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
});

// 「一括予約」ボタンがクリックされたときに表示
function showBulkReservationPage() {
  document.getElementById("calendar").style.display = "none"; // カレンダー非表示
  document.getElementById("bulkReservationPage").style.display = "block"; // 一括予約表示
  document.getElementById("dropdownMenu").style.display = "none"; // メニュー非表示
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

