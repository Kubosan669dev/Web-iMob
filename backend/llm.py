"""
llm.py — GỌI MÔ HÌNH AI (chạy local bằng Ollama).

Ollama sau khi cài sẽ tự chạy một server nhỏ ở địa chỉ localhost:11434.
File này chỉ làm một việc: gửi hội thoại sang đó và nhận câu trả lời về.

Muốn đổi sang AI khác (Gemini, GPT...) sau này? Chỉ cần sửa hàm
`hoi_ai()` bên dưới — phần còn lại của backend không phải đụng tới.
"""

import os
import httpx

# Địa chỉ Ollama + tên model. Có thể ghi đè bằng biến môi trường.
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

# Thời gian chờ tối đa (giây). Máy yếu sinh chữ chậm nên để rộng rãi.
TIMEOUT = 120


class LoiKetNoiAI(Exception):
    """Lỗi riêng để main.py biết là 'AI không chạy được' mà báo cho khách."""


async def hoi_ai(messages: list[dict]) -> str:
    """
    Gửi danh sách tin nhắn cho AI và nhận câu trả lời.

    messages có dạng:
        [{"role": "system",    "content": "hướng dẫn cho AI"},
         {"role": "user",      "content": "câu hỏi của khách"},
         {"role": "assistant", "content": "câu AI đã trả lời trước đó"}]
    """
    payload = {
        "model": MODEL,
        "messages": messages,
        "stream": False,  # False = chờ trả lời đủ rồi mới gửi về một lần
        "options": {
            # temperature thấp = trả lời bám sát dữ liệu, ít "bay bổng"/bịa.
            # Để 0.2 sau khi thử nghiệm thấy 0.3 vẫn còn bịa địa chỉ.
            "temperature": 0.2,
            "num_predict": 400,  # giới hạn độ dài câu trả lời
        },
    }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
            r.raise_for_status()
            data = r.json()
    except httpx.ConnectError as e:
        raise LoiKetNoiAI(
            "Không kết nối được Ollama. Kiểm tra Ollama đã chạy chưa "
            "(mở terminal gõ: ollama serve)."
        ) from e
    except httpx.HTTPStatusError as e:
        raise LoiKetNoiAI(
            f"Ollama báo lỗi {e.response.status_code}. "
            f"Có thể chưa tải model '{MODEL}' (gõ: ollama pull {MODEL})."
        ) from e

    # Ollama trả về dạng {"message": {"role": "assistant", "content": "..."}}
    return data["message"]["content"].strip()


async def kiem_tra_ollama() -> dict:
    """Kiểm tra Ollama có chạy không và đã có model chưa (dùng cho /api/health)."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            r.raise_for_status()
            ten_models = [m["name"] for m in r.json().get("models", [])]
    except Exception:
        return {"ollama": False, "model_san_sang": False, "models": []}

    # Ollama đặt tên kiểu "qwen2.5:3b" — so khớp cả khi thiếu phần ":3b"
    co_model = any(m.split(":")[0] == MODEL.split(":")[0] for m in ten_models)
    return {"ollama": True, "model_san_sang": co_model, "models": ten_models}
