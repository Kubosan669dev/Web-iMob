// Thời tiết hiện tại cho cột "Thực địa hôm nay" ở trang chat /hoi-dap.
//
// Nguồn: Open-Meteo (https://open-meteo.com) — miễn phí, KHÔNG cần khoá, gọi
// thẳng từ trình duyệt được (cho phép CORS). Chỉ gửi đi toạ độ của địa phương
// (data/diaPhuong.json → toaDo), không gửi gì về người xem.
//
// Thay cho các ô "21°C, sương mù nhẹ", "Mật độ khách: Bình thường" trong ảnh
// mẫu: nhiệt độ và trời mây là số đo thật; mật độ khách thì không có nguồn
// nào nên đã bỏ.
//
// Lỗi mạng / dịch vụ chết → trả null, giao diện tự ẩn ô thời tiết. Không bao
// giờ hiện số đoán.

const MO_TA = [
  [[0], "Trời quang"],
  [[1], "Ít mây"],
  [[2], "Có mây"],
  [[3], "Nhiều mây, u ám"],
  [[45, 48], "Sương mù"],
  [[51, 53, 55, 56, 57], "Mưa phùn"],
  [[61, 63, 80, 81], "Có mưa"],
  [[65, 82], "Mưa to"],
  [[66, 67], "Mưa lạnh"],
  [[71, 73, 75, 77, 85, 86], "Có tuyết"],
  [[95, 96, 99], "Có dông"],
];

export function moTaThoiTiet(ma) {
  return MO_TA.find(([ds]) => ds.includes(ma))?.[1] ?? "";
}

export async function layThoiTiet({ lat, lon }) {
  const q = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,weather_code,relative_humidity_2m",
    daily: "sunrise,sunset,temperature_2m_max,temperature_2m_min",
    timezone: "Asia/Bangkok", // UTC+7, cùng giờ Việt Nam
    forecast_days: "1",
  });
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const d = await res.json();
    const gio = (iso) => iso?.slice(11, 16) ?? ""; // "2026-11-16T17:21" -> "17:21"
    return {
      nhietDo: Math.round(d.current.temperature_2m),
      doAm: d.current.relative_humidity_2m,
      moTa: moTaThoiTiet(d.current.weather_code),
      cao: Math.round(d.daily.temperature_2m_max[0]),
      thap: Math.round(d.daily.temperature_2m_min[0]),
      binhMinh: gio(d.daily.sunrise[0]),
      hoangHon: gio(d.daily.sunset[0]),
      capNhat: gio(d.current.time),
    };
  } catch {
    return null;
  }
}
