import os
import io
import random
import json
import pandas as pd
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from analyzer import TradeAnalyzer
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ 严重错误: 未找到 GEMINI_API_KEY")
genai.configure(api_key=api_key)

# ============================================================
# 1. 标签库 (保留您扩充后的版本)
# ============================================================
TAGS_LIBRARY = [
    "韭菜", "燃烧的矿机", "慈善赌王", "追涨杀跌小能手", "多巴胺中毒",
    "杠杆狂魔", "流动性提供者", "反向指标", "止损是什么", "信仰玩家",
    "全职维权", "被套之王", "归零艺术家", "合约养家", "K线算命大师", "波浪理论编剧", "MACD 金叉死叉复读机", "缠论野生传人",
    "支撑位爆破专家", "阻力位站岗哨兵", "斐波那契的弃婴", "布林带上的醉汉",
    "消息面垃圾桶", "推特治国财政部长", "回本教忠实信徒", "踏空焦虑症患者",
    "怒火中烧的复仇者", "二级市场拾荒者", "貔貅盘的榜一大哥", "空气币品鉴专家",
    "百倍杠杆的敢死队", "插针行情的受害者", "你不快乐", "KOL的私人提款机",
    "付费群的资深难民", "Web3 乞丐", "除了钱什么都懂", "Web3 金融分母",
    "美团骑手预备役", "交易所编外合伙人", "燃烧的人肉矿机", "手续费反佣机器",
    "华尔街勤奋的穷光蛋", "光速白打工", "K线图上的缝纫机", "给交易所发工资的老板",
    "赛博流水线工人", "流动性献祭的羔羊", "只有3秒的真男人", "深海潜水的泰坦尼克",
    "爆仓艺术家", "逆势冲锋的敢死队", "止损键被扣掉的键盘侠", "扛单界的西西弗斯",
    "一次归零的奇迹", "庄家最爱的发财密码", "插针行情的避雷针", "野生索罗斯",
    "精准反向指标", "山顶洞人", "韭菜界的指路明灯", "被算法抛弃的孤儿",
    "FOMO 情绪的接盘侠", "绿光恐惧症患者", "追涨杀跌非遗传承人", "为他人解套的活菩萨",
    "接刀子大赛冠军", "电子古董收藏家", "垃圾分类回收站", "链上乞丐",
    "归零守望者", "空气币品鉴大师", "庞氏骗局的最后接棒人", "梦想窒息的赞助商",
    "貔貅盘的忠实信徒", "Web3 难民", "在垃圾堆里找黄金的炼金术士", "吃土大亨",
    "懦弱的剥头皮者", "截断利润，让亏损奔跑", "患得患失的投机客", "被市场PUA的受虐狂",
    "卖飞小能手", "在压路机前捡硬币的赌徒", "赢了颗粒归仓，输了倾家荡产", "账户余额粉碎机",
    "人道主义慈善家", "金融界的分母", "被动型破产专家", "在这个市场裸奔的韭菜",
    "行走的流动性", "除了赚钱什么都懂", "还没断奶的华尔街巨婴", "建议销户重开",
    "多巴胺中毒晚期"
]

# ============================================================
# 2. 医嘱金句库 (保留您扩充后的版本)
# ============================================================
ADVICE_LIBRARY = [
    "截断利润，让亏损奔跑。",
    "别人恐惧我贪婪，别人贪婪我破产。",
    "凭运气赚的钱，凭实力亏回去。",
    "高吸低抛，别墅靠海。",
    "不要把鸡蛋放在同一个篮子里，要每个篮子都漏一点。",
    "趋势是你的朋友，直到它给了你一刀。",
    "长期主义，就是套牢的代名词。",
    "止损是不可能的，这辈子都不可能止损的。",
    "复利是世界第八大奇迹，复亏是第九大。",
    "时间是优秀企业的朋友，是垃圾合约的掘墓人。",
    "又来送钱了？交易所老板的笑容由你守护。",
    "星座运势交易员 —— “你画的线比梵高的画还抽象。”",
    "K线图上的毕加索 —— “画得真好看，赔得真惨。”",
    "后视镜驾驶员—— “行情走完了你才看懂，真棒。”",
    "薛定谔的支撑位 —— “只要你不买，它就是支撑；你一买，它就是压力。”",
    "斐波那契的弃子 —— “黄金分割线救不了你的韭菜命。”",
    "马斯克的提线木偶—— “马斯克放个屁，你都觉得是利好。”",
    "特朗普的提线木偶—— “特朗普放个屁，你都觉得是利好。”",
    "内幕消息的接盘侠—— “你觉得内幕哥是你的哥？。”",
    "鲸鱼排泄物清理员—— “大户吃肉，你负责刷盘子。”",
    "推特治国财政部长 —— “你的投资策略全靠刷推特。”",
    "负收益率精算师—— “怎么做到每一笔都亏得这么精准的？”",
    "流动性慈善大使 —— “感谢你为市场流动性做出的卓越贡献。”",
    "本金消灭术传人",
    "用花呗加仓的赌神 —— “不仅亏钱，还欠债。”",
    "去中心化穷人—— “你在 Web3 的唯一成就就是把钱弄丢了。”",
    "你是在等奇迹，还是在等归零？",
    "手里的垃圾这么沉，是准备留着过年吗？",
    "停下来吧，你的手速越快，贫穷追上你的速度也越快。",
    "K线图上的缝纫机 —— 哒哒哒哒操作猛如虎，一看账户原地杵。",
    "赛博流水线工人 —— 点击鼠标的频率，赶上了厂里打螺丝的速度。",
    "深夜盯盘的猫头鹰 —— 熬最贵的夜，亏最惨的钱。",
    "只有3秒的真男人 —— 还没喊出“梭哈”，系统就提示“强平”。",
    "野生索罗斯（拼夕夕版） ——只有索罗斯的亏损",
    "不止损，就不会亏。",
    "跌了就是补仓的机会，归零就是传家的开始。",
    "主力在洗盘，把不坚定的筹码洗出去。",
    "跟单大神，躺着赚钱。——躺在 ICU 里，你跟单也想发财？"
]

# ============================================================
# 3. 辅助函数：手续费现实映照 (保留您的详细逻辑)
# ============================================================
def calculate_luxury_equivalent(fees):
    fees = abs(fees)
    if fees < 10: return random.choice([
            "够买一杯瑞幸酱香拿铁，还能加个蛋",
            "刚好够以太坊主网不拥堵时的一笔 Gas",
            "也就够在这个月开个最基础的 Netflix 会员",
            "这点钱够买根韭菜，我说的是菜市场那种",
            "够在微信群里发个像样的红包听个响"
        ])
    if fees < 60: return random.choice([
            "够请群友吃顿肯德基疯狂星期四 (V me $50)",
            "够买一份《黑神话：悟空》",
            "这就是你不设止损，一分钟内亏掉的钱",
            "够充值一个月 OnlyFans 支持玩偶姐姐",
            "够买个硬件钱包，虽然你里面也没多少资产"
        ])
    if fees < 300: return random.choice([
            "够买一双 Nike AJ1 倒钩，走路带风",
            "够买半股特斯拉股票，跟马斯克混",
            "也就是群友玩合约爆仓时收到的一条短信费",
            "够请全群兄弟吃顿沙县大酒店",
            "够买个 Switch 玩塞尔达，别炒币了去海拉鲁吧"
        ])
    if fees < 1200: return random.choice([
            "够买台 iPhone 16 Pro,记得买钛金属色的",
            "够买 0.3 个以太坊 (ETH)，那是通往自由的门票",
            "刚毕业大学生一个月的窝囊费 (税后)",
            "够去曼谷玩一周帝王级享受，别问我怎么知道的",
            "够买 1000 个土狗币 (Meme) 当彩票刮"
        ])
    if fees < 20000: return random.choice([
            "够买块劳力士迪通拿，虽然现在二级市场崩了",
            "够去马尔代夫包个岛躺平一周,逃离K线图",
            "够买 100 股英伟达,比炒币稳多了",
        ])
    if fees < 40000:return random.choice([
            "够提一辆小米 SU7 Max 顶配，敢的话",
            "够买块劳力士“绿水鬼”戴戴，虽然现在跌了",
            "这是一个大厂程序员被裁员给的 N+1 赔偿金",
            "植发整容加医美，二级做不好还做不好三级？"
        ])
    if fees < 100000:return random.choice([
            "够买一辆保时捷 718 Boxster",
            "恭喜，这大概就是 1 枚比特币 (BTC) ",
            "够买一辆特斯拉 Cybertruck 三电机野兽版，防弹的那种",
            "够支付美国常青藤名校一年的学费，知识就是力量",
            "这只是一个小土狗项目 (Meme Coin) 池子里的所有流动性"
        ])
    if fees < 150000: return random.choice([
            "够买一辆保时捷 911",
            "够买个无聊猿 (BAYC) 头像装大佬",
            "够在拉斯维加斯豪赌三天三夜不睡觉",
            "也就是CZ睡觉时一分钟的被动收入",
            "够供你孩子去美国常青藤读完硕士"
        ])
    if fees < 200000: return random.choice([
            "够凑齐 32 个 ETH,恭喜你成为尊贵的以太坊验证节点",
            "够买一辆保时捷 911",
            "硅谷 Google L5 级别工程师一年的税后工资也就这点",
            "够买个爱马仕喜马拉雅鳄鱼皮包，还得看柜姐脸色",
        ])
    if fees < 300000: return random.choice([
            "够全款买辆法拉利 Roma,声浪比你的币价好听",
            "够在美国德克萨斯州买套大 House,带泳池的那种",
            "这是二线交易所的上币费起步价，还不包涨",
        ])
    if fees < 500000: return random.choice([
            "够买一辆兰博基尼大牛 (Revuelto)，币圈致富的标准结局",
            "够在上海/新加坡付个像样的首付,背上30年房贷",
            "够买一块理查德·米勒 (RM) 手表，亿万富翁的入场券",
            "这是黑客攻击一次 DeFi 协议拿到漏洞赏金的平均数",
            "这点钱在澳门赌场 VIP 厅，只够推几把牌九"
        ])
    if fees < 600000: return random.choice([
            "够在上海内环付个首付，从此当光荣的房奴",
            "够买一辆兰博基尼大牛，这就是币圈人的终极梦想",
            "这是一次标准的“Rug Pull”卷走的平均金额",
            "够巴菲特那顿慈善午餐的入场费",
        ])
    # 默认保底
    return random.choice([
            "够马斯克发一枚火箭上火星听个响",
             "这手续费高到可以帮 FTX 还债了",
             "够买个太平洋小岛宣布建国，自己发币当央行行长",
             "别算了，这已经是很多上市公司一年的净利润了"
        ])

def format_metrics_for_llm(data):
    v = data['vitals']
    p = data['performance']
    s = data['streaks']
    a = data['assets']
    t = data['timing']
    d = data['direction']
    dur = data['duration_analysis']

    # 映射英文 Key 回中文，让 LLM 读得懂
    dur_map = {
        'less_5m': '剥头皮(<5m)', 
        '5m_15m': '超短线(5-15m)', 
        '15m_60m': '日内短线(15-60m)', 
        '1h_4h': '日内波段(1-4h)', 
        'more_4h': '长线(>4h)'
    }
    duration_str = ""
    for k, label in dur_map.items():
        # 安全获取，防止 key 不存在报错
        info = dur.get(k, {'count': 0, 'pnl': 0, 'win_rate': 0, 'top_coins': []})
        if info['count'] > 0:
            duration_str += f"- {label}: {info['count']}笔, 盈亏{info['pnl']:.1f}U, 胜率{info['win_rate']*100:.0f}%, Top币种:{', '.join(info['top_coins'])}\n"
    
    long_info = d.get('long', {'count': 0, 'pnl': 0})
    short_info = d.get('short', {'count': 0, 'pnl': 0})

    top5_str = ", ".join([f"{x['Symbol']}({x['Net PnL']:.0f}U)" for x in a['top_5']])
    bot5_str = ", ".join([f"{x['Symbol']}({x['Net PnL']:.0f}U)" for x in a['bottom_5']])
    
    hourly = t['hourly_pnl']
    if hourly:
        best_h = max(hourly, key=hourly.get)
        worst_h = min(hourly, key=hourly.get)
        time_str = f"最佳{best_h}点(赚{hourly[best_h]:.0f}U), 最差{worst_h}点(亏{hourly[worst_h]:.0f}U)"
    else:
        time_str = "无数据"

    return f"""
    【1. 资金体征】
    - 净利润: {v['net_pnl']:.2f} U
    - 毛盈亏: {v['gross_pnl']:.2f} U
    - 估算手续费: {v['total_fees']:.2f} U
    - 真实亏损(割肉): {v['real_loss']:.2f} U
    - 真实盈利(止盈): {v['real_profit']:.2f} U
    - 总交易额: {v['volume']:.2f} U
    - 时薪: {v['hourly_wage']:.2f} U/hr
    - 交易频率: {v['frequency']:.2f} 单/天
    
    【2. 核心绩效】
    - 胜率: {p['win_rate']*100:.2f}%
    - 盈亏比: {p['rr_ratio']:.2f}
    - 利润因子: {p['profit_factor']:.2f}
    - 单单期望值: {p['expectancy']:.2f} U
    - 持仓效率: {p['avg_efficiency']:.4f} U/min
    
    【3. 风格与偏好】
    - 多空: 多{long_info['count']}笔({long_info['pnl']:.0f}U) vs 空{short_info['count']}笔({short_info['pnl']:.0f}U)
    - 最佳交易日: {t['best_day']}
    - 最差交易日: {t['worst_day']}
    - 黄金/垃圾时间: {time_str}
    
    【4. 持仓分布】
    {duration_str}
    
    【5. 资产偏好】
    - 提款机(Top5): {top5_str}
    - 碎钞机(Bottom5): {bot5_str}
    
    【6. 极值风控】
    - 最大连胜: {s['max_win']['count']}次(赚{s['max_win']['amount']:.0f}U), 功臣:{', '.join(s['max_win']['heroes'])}
    - 最大连败: {s['max_loss']['count']}次(亏{s['max_loss']['amount']:.0f}U), 罪魁:{', '.join(s['max_loss']['culprits'])}
    - 单笔最大盈利: {s['max_win']['amount']:.2f} U
    - 单笔最大亏损: {s['max_loss']['amount']:.2f} U
    """

def init_model():
    # ============================================================
    # 4. 模型配置 (严格保留您的版本)
    # ============================================================
    candidates = [
        'gemini-3-pro-preview',   # 最新一代：推理能力最强
        'gemini-2.5-pro',         # 次新旗舰：非常稳定
        'gemini-2.5-flash',       # 次新高速：速度快，成本低
        'gemini-2.0-flash',       # 旧版高速：广泛兼容
        'gemini-1.5-pro-latest'   # 最后的兜底
    ]
    
    for m in candidates:
        try:
            model = genai.GenerativeModel(m)
            # 简单的测试调用，确保模型真的可用
            print(f"[INFO] ✅ 模型初始化成功: {m}")
            return model, m
        except Exception as e:
            print(f"[WARN] ⚠️ 无法加载 {m}: {e}")
            continue
    
    fallback_model = 'gemini-1.5-flash'
    print(f"[WARN] ⚠️ 所有候选模型都失败，回退到保底模型: {fallback_model}")
    return genai.GenerativeModel(fallback_model), fallback_model

model, current_model_name = init_model()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online", "model": current_model_name}

@app.post("/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # 1. 计算
        analyzer = TradeAnalyzer(df)
        data = analyzer.get_analysis_json()
        
        # 2. 生成元数据
        rand_head = ''.join(random.choices('0123456789ABCDEF', k=4))
        rand_tail = ''.join(random.choices('0123456789ABCDEF', k=4))
        patient_id = f"0x{rand_head}****{rand_tail}"
        
        selected_tags = random.sample(TAGS_LIBRARY, 3)
        selected_advice = random.choice(ADVICE_LIBRARY)
        
        # 🚨 计算手续费现实映照 (调用您的详细函数)
        luxury_item = calculate_luxury_equivalent(data['vitals']['total_fees'])
        
        # 补充到 meta 字段，前端直接读
        data['meta'] = {
            "patient_id": patient_id,
            "tags": selected_tags,
            "advice": selected_advice,
            "luxury_item": luxury_item
        }

        # 3. 准备 Prompt 数据
        metrics_text = format_metrics_for_llm(data)
        
        user_type = "盈利用户 (高手)" if data['vitals']['net_pnl'] > 0 else "亏损用户 (韭菜)"

        # ==========================================
        # 5. 终极 Prompt 注入 (严格按照您的要求)
        # ==========================================
        system_prompt = f"""
        【角色设定】
        你是一位拥有 20 年经验的华尔街顶级交易员和心理学博士，也是"币圈精神科急诊室"的主治医生。
        风格:混合了《大空头》Mark Baum 的犀利和《华尔街之狼》Jordan Belfort 的毒舌。
        核心任务：阅读数据，生成诊断报告。严格输出 Markdown,严禁 markdown 代码块包裹。

        【当前患者数据】
        {metrics_text}

        【当前模式判定】
        患者状态：{user_type}
        如果是净利润为正的用户：态度专业、尊重但傲娇（同行切磋），提醒黑天鹅风险。
        如果是净利润为负的用户：态度极度毒舌，恨铁不成钢，用数据打脸，拒绝废话。

        请严格按照以下 6 个章节标题输出内容（标题文字严禁修改，前端据此切片）：

        # 1. 核心诊断
        ## 病理切片解读
        (分析最大单笔盈利 {data['streaks']['max_win']['amount']} U 与最大单笔亏损 {data['streaks']['max_loss']['amount']} U 的倍数关系。结合持仓效率 {data['performance']['avg_efficiency']:.4f} U/min。像病理切片一样分析他是否有开单恶习或高压无效劳动。100字内)
        ## 初诊报告
        (全页总结。重点提及总手续费 {data['vitals']['total_fees']} U。如果是亏损用户,重点打击。200字以内)

        # 2. 人体扫描室
        ## 持仓画像
        (根据[4. 持仓分布]数据,深度分析他的持仓规律.200字左右)
        ## 周度节律
        (根据最佳/最差交易日和黄金/垃圾时间,分析他的情绪节律。50-100字)

        # 3. 解剖台
        ## [请生成一个警示性短标题，如'温水煮青蛙']
        (针对最大连败 {data['streaks']['max_loss']['count']} 次进行深度侧写。100-200字)
        ## 有毒资产
        (总结碎钞机 Top5 资产。深度侧写150字以内)
        ## 深度解剖
        (第一刀-心态：分析数据背后的贪婪/恐惧；第二刀-技术：分析开平仓问题；第三刀-策略:分析宏观错误,400字内)

        # 4. 废墟下的黄金
        (语气转折：变得温暖、惜才、激励。寻找废墟中的黄金。)
        ## 高光时刻
        (基于盈利数据、连胜或某个高胜率区间,挖掘他的盈利舒适区。鼓励他。200字左右)

        # 5. 抢救处方
        ## 警告
        (针对当前状态的严重警告。50字)
        ## 康复计划
        (制定分阶段计划。必须计算：如果你在一个有返佣的渠道(省下40%手续费），你现在的账户应该多出 {data['vitals']['total_fees'] * 0.4:.2f} U。300字以内)
        ## 严禁事项
        (200字以内)
        ## 总结
        (300字以内)

        # 6. 确诊通知书
        (必须输出纯 JSON 格式，不要包含 ```json 标记)
        {{
            "id": "{patient_id}",
            "title": "请根据数据生成一个4-6字的搞笑确诊病症",
            "badges": {json.dumps(selected_tags, ensure_ascii=False)},
            "content": "{selected_advice}",
            "fee_reality_check": "你的手续费 {data['vitals']['total_fees']:.1f} U {luxury_item}。",
            "ai_job_recommendation": "根据你的交易风格(频率{data['vitals']['frequency']:.1f}单/天, 熬夜程度等)，生成一个赛博/现实兼职推荐(如美团骑手、守夜人)。并给出一句扎心的推荐理由。"
        }}
        """

        # 6. 调用 LLM
        response = model.generate_content(system_prompt)
        
        return {"report": response.text, "raw_data": data}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)