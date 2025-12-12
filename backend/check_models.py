# backend/check_models.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

# 加载 .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print(f"当前 API Key 层级验证中...")
print("-" * 40)
print(f"可用的生成模型列表 (请复制下面的名称到 main.py):")
print("-" * 40)
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            # 这里打印出模型最原始的 ID
            print(f"👉 {m.name}")
except Exception as e:
    print(f"❌ 查询出错: {e}")
