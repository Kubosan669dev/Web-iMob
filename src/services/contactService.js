// contactService: gửi form liên hệ.
// HIỆN TẠI: giả lập (delay + log ra console) — website chạy độc lập không cần backend.
// SAU NÀY: thay phần thân hàm bằng fetch POST `${API_BASE_URL}/api/contact`
// (component Contact KHÔNG phải sửa gì vì interface giữ nguyên).

export async function submitContact(formData) {
  // Giả lập độ trễ mạng
  await new Promise((resolve) => setTimeout(resolve, 900));

  console.log("[contactService] Gửi liên hệ (mock):", formData);
  return { success: true };
}
