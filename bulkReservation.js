export async function loadBulkReservationView() {
  const container = document.createElement("div");
  container.innerHTML = `
    <h2>一括予約</h2>
    <!-- 一括予約のフォーム -->
    <form id="bulkForm">
      <input type="text" name="name" placeholder="名前">
      <input type="text" id="multiDatePicker" placeholder="日付を選択" readonly />
      <button type="submit">送信</button>
    </form>
    
    <!-- 予約プレビュー表示部分 -->
    <div id="reservationPreview"></div>

    <!-- 曜日別デフォルト設定 -->
    <h3>曜日別デフォルト練習時間</h3>
    <div id="defaultTimeSettings">
      <table>
        <tr>
          <th>曜日</th><th>開始</th><th>終了</th>
        </tr>
        ${["日","月","火","水","木","金","土"].map((day, i) => `
          <tr>
            <td>${day}</td>
            <td><input type="time" id="start-${i}" /></td>
            <td><input type="time" id="end-${i}" /></td>
          </tr>
        `).join("")}
      </table>
    </div>
    
    <button id="applyDefaultTimes">選択日に予約適用</button>
  `;

  // DOMが完全に読み込まれてから処理を実行
  document.addEventListener("DOMContentLoaded", () => {
    const datePicker = document.getElementById("multiDatePicker");
    if (datePicker) {
      // 日付選択変更時にプレビュー更新
      datePicker.addEventListener("change", updateReservationPreview);
    }

    const applyButton = document.getElementById("applyDefaultTimes");
    if (applyButton) {
      // 適用ボタン押下時の処理
      applyButton.addEventListener("click", () => {
        const selectedDates = datePicker.value;
        alert(`選択した日付: ${selectedDates} にデフォルト練習時間を適用しました。`);
        updateReservationPreview();
      });
    }

    // 予約フォームの送信処理
    const bulkForm = document.querySelector("#bulkForm");
    if (bulkForm) {
      bulkForm.addEventListener("submit", e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        alert(`予約者: ${formData.get("name")}、日付: ${formData.get("dates")}`);
      });
    }
  });

  // 予約プレビューを更新する関数
  function updateReservationPreview() {
    const selectedDates = document.getElementById("multiDatePicker").value;
    let previewHTML = "<h4>予約プレビュー</h4>";
    previewHTML += `<p>選択した日付: ${selectedDates}</p>`;

    // 曜日別のデフォルト設定を表示
    previewHTML += "<ul>";
    ["日", "月", "火", "水", "木", "金", "土"].forEach((day, i) => {
      const start = document.getElementById(`start-${i}`).value;
      const end = document.getElementById(`end-${i}`).value;
      if (start && end) {
        previewHTML += `<li>${day}: ${start} 〜 ${end}</li>`;
      }
    });
    previewHTML += "</ul>";

    document.getElementById("reservationPreview").innerHTML = previewHTML;
  }

  return container;
}
