# backend/check_models.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("正在查询可用模型列表...")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        # 重点找带有 'gemini-3' 或 'pro' 的
        print(f"- {m.name}")
