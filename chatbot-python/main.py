from fastapi import FastAPI
from pydantic import BaseModel
from pathlib import Path
from imob_bot import ChatBot, KienThuc

app = FastAPI(title="iMob Chatbot API")

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_FILE = DATA_DIR / "imob_chatbot_data.json"
if not DATA_FILE.exists():
    DATA_FILE = DATA_DIR / "sample_data.json"

chatbot = ChatBot(KienThuc.tu_file(DATA_FILE))

class ChatRequest(BaseModel):
    message: str
    history: list[dict[str, str]] = []

class ChatResponse(BaseModel):
    response: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    message = request.message.strip()
    if not message:
        return {"response": "Bạn vui lòng gửi câu hỏi nhé."}

    # Hiện tại backend chỉ trả lời text; nếu cần mở rộng thì thêm status/error later.
    answer = chatbot.tra_loi(message)
    return {"response": answer}
