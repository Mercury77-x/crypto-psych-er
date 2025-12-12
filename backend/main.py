# backend/main.py
import os
import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from analyzer import TradeAnalyzer
from dotenv import load_dotenv

load_dotenv()

# 配置 Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# 模型选择策略（按优先级尝试）
# 1. 优先使用 Gemini 3 Pro Preview (最新，最智能)
# 2. 降级到 Gemini 2.5 Flash (速度快，质量好)
# 3. 最后回退到 Gemini 1.5 Flash (保底)
try:
    model = genai.GenerativeModel('gemini-3-pro-preview')
    print("[INFO] ✅ 使用 Gemini 3 Pro Preview 模型")
except Exception as e:
    print(f"⚠️ Gemini 3 Pro 初始化失败: {e}，尝试降级到 Gemini 2.5 Flash")
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        print("[INFO] ✅ 使用 Gemini 2.5 Flash 模型")
    except Exception as e2:
        print(f"⚠️ Gemini 2.5 Flash 初始化失败: {e2}，回退到 Gemini 1.5 Flash")
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("[INFO] ✅ 使用 Gemini 1.5 Flash 模型")

app = FastAPI()

# 允许前端跨域访问 (Zeabur部署时很重要)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 生产环境可以改成你的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Crypto Psychiatrist API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # 1. 运行数据分析
        analyzer = TradeAnalyzer(df)
        data = analyzer.get_analysis_json()

        # 2. 构建 Prompt (精简版，完整版请把你之前确定的 Prompt 粘贴进来)
        # 提示：在这里用 Python f-string 把 data 里的数据填入 Prompt 模板
        system_prompt = f"""
        你是一位毒舌币圈风控专家。
        【患者数据】
        总盈亏: {data['vitals']['total_pnl']} U
        模式: {data['mode']}
        时薪: {data['vitals']['hourly_wage']} U/小时
        超短线表现: 交易 {data['style']['scalping_count']} 次，盈亏 {data['style']['scalping_loss']} U
        ... (### **【分析框架】**

请严格按以下步骤输出，确保数据精准，语言犀利：

### **[1. 核心诊断 & 身份]**

- **必须动作**:给用户贴3-5 个极具侮辱性或带有讽刺意味的“荣誉称号”（短标签，取值自“短标签库”），根据用户数据情况自行拟定匹配。**适合做UI徽章/贴纸）**
- 摆出实际的分析数据。

### **[2. 深度病情解剖] (核心部分)**

说一句相对应的总结，比如“数据展示了你令人震惊的分裂表现…”，要能调用对方情绪的

**2.1 交易风格画像** 

- 分析他是做高频还是趋势。
- 频率分析：分析数据是否是高频交易、人工交易，情绪化操作或剥头皮等等。亦或低频交易等
- 持仓时间分析：对比“超短线（<15分钟)”和“波段（>1小时)、()>4小时)、()>12小时)”的盈亏表现,找出我的“死亡禁区”。
- 结合胜率和频率，给出一个精准的画像标签。
- **对亏损者**：骂他“操作猛如虎，一看原地杵”。高频是给交易所送钱。
- **对盈利者**：如果他是高胜率低盈亏比，嘲讽他是“在压路机前捡硬币”；如果他是低胜率高盈亏比，勉强承认他“有点东西”。
- **毒性/运气检测 :币种分析,**如果玩 Meme/土狗：赢了是“坟头蹦迪”，输了是“智商税”。如果玩 BTC/ETH:输了是“技术太菜”,赢了是“贝塔红利（Beta）”，不是他的阿尔法（Alpha）。

**2.2 死亡禁区 / 利润漏洞** 

- **针对亏损者（死亡禁区）**:
    - **核心任务**：要让【死亡禁区】这个模块产生痛感，要摧毁他的坏习惯。
    - **把“亏损”具象化**：不仅仅是数字，而是他生活中的一部分被切掉了。
    - **把“努力”荒诞化**：他最引以为傲的“勤奋盯盘”，其实是自杀行为。
    - **制造剧烈的反差**：天堂（盈利的波段）和地狱（亏损的超短线）就在一念之间。
    
    多逻辑组合使用，比如强调“高频低效”，羞辱他的“勤奋”；比如强调他原本可以赚多少，是他自己亲手毁了这一切。利用“损失厌恶”心理；比如把他定义为“病人”，让他感到羞耻。
    
    比如
    
    - 先用 **方案 B** 告诉他“你本来很牛逼，是你自己毁了”（给希望后瞬间破灭）。
    - 再用 **方案 A** 算出他的“时薪是负数”（现实打脸）。
    - 最后用 **方案 C** 总结“你这是病，得治”（升华主题）。
    - 详细分析他亏损最惨烈的行为模式。是“高频剥头皮”？是“扛单不止损”？还是“赌土狗”？
    
    - 等等更多恶劣的交易习惯
    
    - 计算或估算交易频率,结合Taker费率,用户到底给交易所交了多少“智商税”。比如币安市价通常单词操作是万5
    - 用毒舌的语言摧毁这种行为的合理性。
    
    - 观察胜率与盈亏的平衡。如果胜率低 (<40%) 但盈利，说明他是“趋势型/盈亏比型”选手，这是好事，在圣杯中肯定他要肯定。如果胜率高 (>70%) 但亏损，说明他是“扛单型”选手（赚小赔大），这是致命伤，要严厉批评。
    
- **针对盈利者（利润漏洞）**:
    - 找出他**回撤最大**或**利润回吐**最严重的习惯。
    - 计算“踏空成本”或“回吐金额”。告诉他：“你本来赚了 5 万，因为手贱吐回去 2 万。你不是在赚钱，你是在漏财。”
    - 嘲讽他的风控：“你的夏普比率低得可怜，只要一次极端行情，你就会回到解放前。”

**2.3 你的圣杯**（重点分析，这里相对内容多些）

- **核心任务**：寻找废墟中的黄金，给他希望的关键！做数据切割，找到他哪怕一点点的优势。即使他亏得一塌糊涂，也要试图从逻辑上找到他的“盈利舒适区”。
- 假设（你需要根据数据多逻辑去推演）：
- “虽然你玩山寨币亏了，但如果你只看 ETH,你其实是赚的。”
- “虽然你频繁止损，但你那几笔大赚的单子证明你懂趋势。”
- “你的胜率低，但盈亏比高，说明你只需要减少出手次数就能活。”

-…等等更多，请从交割单的数据找到他的擅长！
- **必须明确指出他的优势在哪里**，告诉他：“你离盈利只差‘砍掉坏习惯’这一步。”甚至可以画饼，比如如果你没有这些 xxx 的亏损，你的账户应该是盈利 xxx 的！

- **针对盈利者**:
    - 类似，但要符合对盈利者的逻辑

### **[3. 拯救处方]**

- **针对亏损者（拯救）**:
    - -给出具体建议（如：限制每天开单数、换低费率交易所、只做主流等、只做长线等等根据数据来）。
    - 如果手续费过高且他是亏损的,告诉他强迫自己使用低手续费的限价单,少用市价单,另外在建议里告诉他,“如果你在一个有返佣的渠道(省下30%手续费），你现在的账户余额应该是多少？”
    - 制定一个分阶段的“康复计划”。
    - 做给后一个结语，如果是亏损者，要用振奋的话语给他激励，前面骂了那么多了，这里说的好好听感人点，亏损者最怕的就是没有希望！
- **针对盈利者（警告）**:
    - 给出高级建议（如：资金管理、仓位对冲、提取利润）。
    - 警告他：“市场最喜欢杀你这种觉得自己懂了的人。提现买房才是赚，放在账户里只是数字。别让我下个月在维权群里看到你。”

### 

---

### **【约束条件】**

1. **禁止客套**：绝对不要说“亲爱的用户”、“您做得很好”。
2. **数据驱动**：所有的嘲讽必须基于 csv 中的具体数据
3. **篇幅控制**:1200 - 2500 字，字字珠玑。) ...

        请严格按照 Markdown 格式输出，最后必须包含 [4. 币圈精神病确诊通知书] 的 JSON 格式以便前端渲染。
        """

        # 3. 调用 Gemini
        print(f"[DEBUG] 调用 Gemini API，数据: {data}")
        response = model.generate_content(system_prompt)
        print(f"[DEBUG] Gemini 响应类型: {type(response)}")
        print(f"[DEBUG] Gemini 响应文本长度: {len(response.text) if response.text else 0}")
        
        if not response.text:
            raise ValueError("Gemini API 返回了空响应")
        
        return {"report": response.text, "raw_data": data}

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[ERROR] 处理请求时出错: {str(e)}")
        print(f"[ERROR] 错误堆栈: {error_trace}")
        return {"error": str(e), "traceback": error_trace}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)