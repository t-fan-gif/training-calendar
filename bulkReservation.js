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
  multicarendar = flatpickr("#multiDateCalendar", {
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
document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#multiDateCalendar", {
    mode: "multiple",         // 複数日選択
    inline: true,             // 常時表示カレンダー
    dateFormat: "Y-m-d",
    locale: "ja",             // 日本語対応（任意）
    onChange: function (selectedDates, dateStr, instance) {
      console.log("選択された日付:", selectedDates);
      // ここで予約の仮表示や処理を入れてもOK
    }
  });
});


// 一括予約ページが表示されたときにテーブル行を追加
function populateDefaultTimeSettings() {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const table = document.getElementById("defaultTimeTable");

  days.forEach((day, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${day}</td>
        <td><select id="placeData-${i}" name="placeData" required>
            <option value="選択なし" selected>選択なし</option>
            <option value="山形大学" >山形大学</option>
            <option value="あかねヶ丘">あかねヶ丘</option>
            <option value="天童ND">天童ND</option>
          </select>

        <td><input type="time" id="start-${i}" value="00:00" onchange="autoFillEndTime(${i})"/></td>
        <td><input type="time" id="end-${i}" value="00:00"/></td>
      `;

    table.appendChild(row);
  });
}

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}

/////////予約データ送信用/////////
async function sendBulkReservations() {
  const button = document.getElementById("vulusend");
  const selectedDates = multicarendar.selectedDates;
  const nameValue = document.getElementById('names').value;
  // 曜日ごとの設定を取得
  const reservations = [];
  let hasInvalidSetting = false;

  selectedDates.forEach((date) => {
    const uuid = generateUUID();
    const jsDate = new Date(date);
    const dayIndex = jsDate.getDay(); // 曜日番号（0=日曜）

    const placeSelect = document.getElementById(`placeData-${dayIndex}`);
    const startInput = document.getElementById(`start-${dayIndex}`);
    const endInput = document.getElementById(`end-${dayIndex}`);

    const placeValue = placeSelect?.value || "";
    const startTime = startInput?.value || "";
    const endTime = endInput?.value || "";

    // 必須設定が不足している場合はエラーフラグを立てる
    if (placeValue === "選択なし" || startTime === "" || endTime === "") {
      alert(`「${date.toLocaleDateString()}」の設定が不足しています。\n場所、開始時間、終了時間をすべて指定してください。`);
      hasInvalidSetting = true;
      return;
    }

    reservations.push({
      action: "create",
      id: uuid,
      eventType: "練習",
      name: nameValue,
      tournamentName: "",
      date: formatDateLocal(jsDate),
      startTime,
      endTime,
      location: placeValue,
      memo: ""
    });
  });

  if (hasInvalidSetting) {
    return; // 不正があれば送信しない
  }

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
    const response = await fetch("https://script.google.com/macros/s/AKfycbz_yJXvVOuFloGmRPLTtvEDAKDeNi-Dv-y3SFEQwPVHE3JmVYogvwhq96D2yKsC2mYpNg/exec", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.success) {
      alert("一括予約を送信しました！");
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
    const location = document.getElementById(`placeData-${i}`).value;

    // 保存するデータの形式を作成
    defaultTimes.push({
      day: day,
      start: startTime,
      end: endTime,
      location: location,
    });
  });

  const name = document.getElementById("names").value;
  const settings = {
    defaultTimes: defaultTimes,
    name: name,
  };

  // localStorageに保存
  localStorage.setItem('defaultTimes', JSON.stringify(settings));
  alert("設定が保存されました！");
}


function loadDefaultTimes() {
  const saved = JSON.parse(localStorage.getItem('defaultTimes'));
  if (!saved) return;

  const savedTimes = saved.defaultTimes || [];
  savedTimes.forEach((time, i) => {
    const startInput = document.getElementById(`start-${i}`);
    const endInput = document.getElementById(`end-${i}`);
    const locationInput = document.getElementById(`placeData-${i}`);

    if (startInput && endInput && locationInput) {
      startInput.value = time.start;
      endInput.value = time.end;
      locationInput.value = time.location;
    }
  });

  if (saved.name) {
    const nameInput = document.getElementById("names");
    if (nameInput) nameInput.value = saved.name;
  }
}

// ページ読み込み時にデータをロード
window.onload = function () {
  populateDefaultTimeSettings();
  loadDefaultTimes();
};

//////////IDの作成////////////////////
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
/////////////////////////////////////////

