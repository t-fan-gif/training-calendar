// bulkReservation.js

// 「一括予約」ボタンがクリックされたときに表示
function showBulkReservationPage() {
  document.getElementById("calendar").style.display = "none"; // カレンダー非表示
  document.getElementById("reservationForm").style.display = "none"; // 単一予約フォーム非表示
  document.getElementById("bulkReservationPage").style.display = "block"; // 一括予約表示
  document.getElementById("listChange").style.display = "none"; // リストボタン非表示
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

// ホームボタンを押したときにカレンダーを再表示
function home() {
  document.getElementById("calendar").style.display = "block"; // カレンダー表示
  document.getElementById("reservationForm").style.display = "block"; // 単一予約フォーム表示
  document.getElementById("bulkReservationPage").style.display = "none"; // 一括予約非表示
  document.getElementById("listChange").style.display = "flex"; // リストボタン非表示
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
        <td><select id="placeData" name="placeData" required>
            <option value="選択なし" selected>選択なし</option>
            <option value="山形大学" selected>山形大学</option>
            <option value="あかねヶ丘">あかねヶ丘</option>
            <option value="天童ND">天童ND</option>
          </select>

        <td><input type="time" id="start-${i}" value="00:00" onchange="autoFillEndTime(${i})"/></td>
        <td><input type="time" id="end-${i}" value="00:00"/></td>
      `;

      table.appendChild(row);
    });
  }

  /////////予約データ送信用/////////
async function sendBulkReservations() {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const selectedDates = flatpickr("#multiDateCalendar").selectedDates;
  const nameValue = document.getElementById('names');
  // 曜日ごとの設定を取得
  const defaultTimes = {};
  for (let i = 0; i < 7; i++) {
    const start = document.getElementById(`start-${i}`).value;
    const end = document.getElementById(`end-${i}`).value;

    const placeSelect = document.querySelectorAll('select[name="placeData"]')[i];
    const place = placeSelect.value;

    if (start && end && (start.value !== "00:00" || end.value !== "00:00")) {
    if (!placeSelect || placeSelect.value === "選択なし") {
      alert(`${days[i]}曜日の場所を選んでください`);
      return; // 処理中断
    }
  }

    defaultTimes[i] = { start, end, place };
  }
    // 各選択日付に対して予約データを作成
  const reservations = selectedDates.map(dateStr => {
    const dateObj = new Date(dateStr);
    const day = dateObj.getDay(); // 0〜6（日〜土）

    const { start, end, place } = defaultTimes[day] || {};

    return {
      eventType: "練習",
      name: nameValue,
      tournamentName: "",
      date: dateStr,
      startTime: start,
      endTime: end,
      location: place,
      memo: ""
    };
  });

  if (reservations.length === 0) {
    alert("予約データがありません");
    return;
  }

  const button = document.getElementById("bulkSubmitButton");
  button.disabled = true;
  button.textContent = "送信中";

  const payload = { reservations };

  // トークン追加（単一予約と同じく）
  if (sessionToken) {
    payload.sessionToken = sessionToken;
  } else if (idToken) {
    payload.token = idToken;
  } else {
    alert("ログインしてください！");
    button.disabled = false;
    button.textContent = "送信";
    return;
  }

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbyqMS4HODhhGJsHumGNdPC82490s1hVV09PUcUhOsrnAgJxq48iOgn_YoiRkuVx0ty60w/exec", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.success) {
      alert("一括予約を送信しました！");
      document.getElementById("bulkReservationForm").reset?.(); // フォームがあればリセット
      fetchEventsAndShowCalendar(); // カレンダー再取得（単一予約と同様）
    } else {
      alert("送信に失敗しました。");
    }
  } catch (error) {
    console.error("送信エラー", error);
    alert("通信エラーが発生しました。");
  } finally {
    button.disabled = false;
    button.textContent = "送信";
  }
}

///////////////////////////////////////////////////////

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

  //ローカルファイルに曜日の設定を保存する
  function saveDefaultTimes() {
  const defaultTimes = [];
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  
  days.forEach((day, i) => {
    const startTime = document.getElementById(`start-${i}`).value;
    const endTime = document.getElementById(`end-${i}`).value;
    
    // 保存するデータの形式を作成
    defaultTimes.push({
      day: day,
      start: startTime,
      end: endTime
    });
  });

  // localStorageに保存
  localStorage.setItem('defaultTimes', JSON.stringify(defaultTimes));
  alert("設定が保存されました！");
  }

  function loadDefaultTimes() {
  const savedTimes = JSON.parse(localStorage.getItem('defaultTimes'));

  if (savedTimes) {
    savedTimes.forEach((time, i) => {
      const startInput = document.getElementById(`start-${i}`);
      const endInput = document.getElementById(`end-${i}`);
      
      startInput.value = time.start;
      endInput.value = time.end;
    });
  }
  }

    // ページ読み込み時にデータをロード
    window.onload = function() {
      populateDefaultTimeSettings();
      loadDefaultTimes();
    };


  