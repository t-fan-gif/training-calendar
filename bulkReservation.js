// bulkReservation.js

// 「一括予約」ボタンがクリックされたときに表示
function showBulkReservationPage() {
  document.getElementById("calendar").style.display = "none"; // カレンダー非表示
  document.getElementById("reservationForm").style.display = "none"; // 単一予約フォーム非表示
  document.getElementById("bulkReservationPage").style.display = "block"; // 一括予約表示
  document.getElementById("dropdownMenu").style.display = "none"; // メニュー非表示
      if (!document.getElementById("start-0")) {
      populateDefaultTimeSettings(); // 初回のみ生成
      }
    document.getElementById("bulkReservationPage").style.display = "block";
  flatpickr("#multiDateCalendar", {
    mode: "multiple",
    inline: true,
    dateFormat: "Y-m-d",
    disableMobile: true,
    locale: "ja"
  });
}

// 戻るボタンを押したときにカレンダーを再表示
function showMainPage() {
  document.getElementById("calendar").style.display = "block"; // カレンダー表示
  document.getElementById("bulkReservationPage").style.display = "none"; // 一括予約非表示
}

// 日付選択用のflatpickr初期化
document.addEventListener("DOMContentLoaded", function() {
  flatpickr("#multiDateCalendar", {
    mode: "multiple",         // 複数日選択
    inline: true,             // 常時表示カレンダー
    dateFormat: "Y-m-d",
    locale: "ja",             // 日本語対応（任意）
    onChange: function(selectedDates, dateStr, instance) {
      console.log("選択された日付:", selectedDates);
      // ここで予約の仮表示や処理を入れてもOK
    }
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
        <td><input type="time" id="start-${i}" value="00:00" onchange="autoFillEndTime(${i})"/></td>
        <td><input type="time" id="end-${i}" value="00:00"/></td>
      `;

      table.appendChild(row);
    });
  }

    function autoFillEndTime(index) {
    const startInput = document.getElementById(`start-${index}`);
    const endInput = document.getElementById(`end-${index}`);

    const [hours, minutes] = startInput.value.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    let newHours = (hours + 3) % 24;
    let newMinutes = minutes;

    // 2桁に揃える
    const pad = (n) => n.toString().padStart(2, "0");

    endInput.value = `${pad(newHours)}:${pad(newMinutes)}`;
  }
