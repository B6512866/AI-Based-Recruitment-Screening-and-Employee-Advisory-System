# download_models.py
import os
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoProcessor, AutoModelForImageTextToText

CHAT_MODEL_ID = "typhoon-ai/typhoon2.5-qwen3-4b"
OCR_MODEL_ID  = "typhoon-ai/typhoon-ocr1.5-2b"

CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache")
os.makedirs(CACHE_DIR, exist_ok=True)

print("📥 กำลังเริ่มดาวน์โหลดโมเดล Typhoon AI จาก HuggingFace...")

print(f"\n1/2 ดาวน์โหลด Chatbot Model ({CHAT_MODEL_ID})...")
AutoTokenizer.from_pretrained(CHAT_MODEL_ID, cache_dir=CACHE_DIR)
AutoModelForCausalLM.from_pretrained(CHAT_MODEL_ID, cache_dir=CACHE_DIR)

print(f"\n2/2 ดาวน์โหลด OCR Model ({OCR_MODEL_ID})...")
AutoProcessor.from_pretrained(OCR_MODEL_ID, cache_dir=CACHE_DIR)
AutoModelForImageTextToText.from_pretrained(OCR_MODEL_ID, cache_dir=CACHE_DIR)

print("\n✅ ดาวน์โหลดโมเดลทั้งหมดเรียบร้อยแล้ว! พร้อมใช้งานออฟไลน์ได้ทันที")
