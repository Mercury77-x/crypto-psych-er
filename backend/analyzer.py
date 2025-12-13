import pandas as pd
import numpy as np

class TradeAnalyzer:
    def __init__(self, df: pd.DataFrame):
        # 初始化时直接运行预处理
        self.df = self._preprocess(df)

    def _clean_numeric_column(self, series):
        """
        强力清洗工具：解决 '1,234.56' 这种带逗号的字符串，
        或者 ' 123 ' 这种带空格的数字，防止 Pandas 算成 0。
        """
        # 1. 转为字符串并去空格
        s = series.astype(str).str.strip()
        # 2. 去掉千分位逗号
        s = s.str.replace(',', '')
        # 3. 强制转为数字，非数字变成 NaN
        numeric_s = pd.to_numeric(s, errors='coerce')
        # 4. 把 NaN 填为 0.0，保证后续计算不报错
        return numeric_s.fillna(0.0)

    def _preprocess(self, df):
        """
        数据预处理核心逻辑
        """
        # 1. 清洗列名 (去前后空格)
        df.columns = [c.strip() for c in df.columns]
        
        # 2. 列名映射字典 (兼容中文、英文、拼写错误)
        column_mapping = {
            'Symbol': ['Symbol', 'symbol', 'Instrument', 'Pair', 'Contract', '币种', '交易对'],
            'Side': ['Side', 'Direction', 'Type', '方向', '买卖', 'BS', 'Position Side'],
            'Size': ['Size', 'Amount', 'Quantity', 'Qty', 'Vol', '数量', '张数', 'Exec Qty', 'Max Open Interest'], 
            'Entry Price': ['Entry Price', 'Avg. Open Price', 'Avg Entry Price', 'Open Price', '开仓均价', '开仓价', 'EntryPrice'],
            # 🚨 包含您 CSV 里的特殊拼写错误 'Pirce'
            'Avg. Close Price': [
                'Avg. Close Pirce', 
                'Avg. Close Price', 'Close Price', 'Exit Price', 'Avg Price', 
                '平仓均价', '平仓价', '成交均价', 'Price', 'Fill Price'
            ],
            'Closed Vol.': ['Closed Vol.', 'Closed Volume', 'Size', 'Qty', 'Amount', '成交量', '平仓数量'],
            'Closing PNL': ['Closing PNL', 'Realized PNL', 'PnL', 'Profit', 'Net Profit', '已实现盈亏', '盈亏', 'Realized Profit'],
            'Opened': ['Opened', 'Open Time', 'Date', 'Time', 'Created Time', '开仓时间', '时间', 'Create Time'],
            'Closed': ['Closed', 'Close Time', 'Update Time', 'Finished Time', '平仓时间', '更新时间']
        }

        # 3. 智能重命名列名
        for standard_col, aliases in column_mapping.items():
            # 如果标准名已经存在，跳过
            if standard_col in df.columns: 
                continue
            
            # 遍历别名寻找匹配
            for alias in aliases:
                # 忽略大小写匹配
                match_col = next((c for c in df.columns if c.lower() == alias.lower()), None)
                if match_col:
                    df.rename(columns={match_col: standard_col}, inplace=True)
                    break

        # --- 4. 容错逻辑 ---
        
        # 容错：如果没有 'Closed Vol.' 但有 'Size'，借用 Size
        if 'Closed Vol.' not in df.columns and 'Size' in df.columns:
             df['Closed Vol.'] = df['Size']

        # 🚨 关键：强力清洗数字列 (防止全是 0.00)
        cols_to_numeric = ['Entry Price', 'Avg. Close Price', 'Closed Vol.', 'Closing PNL']
        for c in cols_to_numeric:
            if c in df.columns:
                df[c] = self._clean_numeric_column(df[c])
            else:
                # 如果缺失关键列，先填 0 (后面会报错提醒)
                df[c] = 0.0

        # 时间列格式化
        if 'Opened' in df.columns:
            df['Opened'] = pd.to_datetime(df['Opened'], errors='coerce')
        if 'Closed' in df.columns:
            df['Closed'] = pd.to_datetime(df['Closed'], errors='coerce')
        
        # 如果缺少平仓时间，用开仓时间代替，避免持仓时间计算崩溃
        if 'Closed' not in df.columns and 'Opened' in df.columns:
            df['Closed'] = df['Opened']

        # --- 5. 完整性检查 ---
        required_cols = ['Entry Price', 'Avg. Close Price', 'Closed Vol.', 'Closing PNL']
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            # 抛出异常，前端会显示这个错误信息
            raise ValueError(f"缺少关键列: {missing}。CSV里实际有的列名是: {list(df.columns)}")

        # --- 6. 衍生指标计算 ---
        
        # 持仓时长 (分钟)
        df['duration_minutes'] = (df['Closed'] - df['Opened']).dt.total_seconds().fillna(0) / 60
        
        # 估算手续费 (双边万五)
        df['est_fee'] = (df['Entry Price'] + df['Avg. Close Price']) * df['Closed Vol.'] * 0.0005
        
        # 净利润 = 毛利 - 手续费
        df['Net PnL'] = df['Closing PNL'] - df['est_fee']
        
        # 补充时间特征 (星期几、小时)
        if 'Opened' in df.columns:
            df['day_name'] = df['Opened'].dt.day_name()
            df['open_hour'] = df['Opened'].dt.hour
        else:
            df['day_name'] = 'Unknown'
            df['open_hour'] = 0
            
        # 补全方向和币种
        if 'Side' not in df.columns: df['Side'] = 'Long'
        if 'Symbol' not in df.columns: df['Symbol'] = 'Unknown'

        return df

    def get_analysis_json(self):
        """
        计算所有指标并返回 JSON
        """
        df = self.df
        
        # --- 1. 基础体征 (Vitals) ---
        total_pnl = df['Net PnL'].sum()
        gross_pnl = df['Closing PNL'].sum()
        total_fees = df['est_fee'].sum()
        
        # 真实盈亏 (Realized) - 排除 0
        real_loss = df[df['Net PnL'] < 0]['Net PnL'].sum()
        real_profit = df[df['Net PnL'] > 0]['Net PnL'].sum()
        
        # 总交易额
        total_volume = ((df['Entry Price'] + df['Avg. Close Price']) * df['Closed Vol.']).sum()
        
        # 交易总数
        total_trades = len(df)
        winning_trades = df[df['Net PnL'] > 0]
        losing_trades = df[df['Net PnL'] < 0]

        # --- 2. 核心绩效 (Performance) ---
        win_rate = len(winning_trades) / total_trades if total_trades > 0 else 0
        
        avg_win = winning_trades['Net PnL'].mean() if not winning_trades.empty else 0
        avg_loss = abs(losing_trades['Net PnL'].mean()) if not losing_trades.empty else 0
        rr_ratio = avg_win / avg_loss if avg_loss > 0 else 0
        
        profit_factor = real_profit / abs(real_loss) if abs(real_loss) > 0 else 0
        expectancy = df['Net PnL'].mean()

        # --- 3. 多空偏好 (Direction) ---
        longs = df[df['Side'].str.lower().isin(['long', 'buy'])] if 'Side' in df.columns else pd.DataFrame()
        shorts = df[df['Side'].str.lower().isin(['short', 'sell'])] if 'Side' in df.columns else pd.DataFrame()
        
        direction_stats = {
            "long": {"count": len(longs), "pnl": longs['Net PnL'].sum() if not longs.empty else 0},
            "short": {"count": len(shorts), "pnl": shorts['Net PnL'].sum() if not shorts.empty else 0}
        }

        # --- 4. 持仓时间分布 (Duration) ---
        bins = [0, 5, 15, 60, 240, float('inf')]
        labels = ['剥头皮 (<5m)', '超短线 (5-15m)', '日内短线 (15-60m)', '日内波段 (1-4h)', '长线 (>4h)']
        df['duration_type'] = pd.cut(df['duration_minutes'], bins=bins, labels=labels)
        
        duration_stats = {}
        for label in labels:
            sub_df = df[df['duration_type'] == label]
            if not sub_df.empty:
                top_coins = sub_df.groupby('Symbol')['Net PnL'].sum().sort_values(ascending=False).head(5).index.tolist()
                win_rate_sub = len(sub_df[sub_df['Net PnL'] > 0]) / len(sub_df)
                duration_stats[label] = {
                    "count": len(sub_df),
                    "pnl": sub_df['Net PnL'].sum(),
                    "win_rate": win_rate_sub,
                    "top_coins": top_coins
                }
            else:
                 duration_stats[label] = {"count": 0, "pnl": 0, "win_rate": 0, "top_coins": []}

        # --- 5. 交易频率 & 时薪 ---
        if 'Closed' in df.columns and total_trades > 0:
            days_span = (df['Closed'].max() - df['Opened'].min()).days + 1
            frequency = total_trades / days_span if days_span > 0 else total_trades
        else:
            frequency = 0
        
        total_hours = df['duration_minutes'].sum() / 60
        hourly_wage = total_pnl / total_hours if total_hours > 0 else 0
        
        # --- 6. 资产偏好 (Assets) ---
        if total_trades > 0:
            asset_grp = df.groupby('Symbol').agg({'Net PnL': 'sum', 'Opened': 'count'}).reset_index()
            # 计算单币种胜率
            asset_win_rates = []
            for sym in asset_grp['Symbol']:
                sub = df[df['Symbol'] == sym]
                wr = len(sub[sub['Net PnL'] > 0]) / len(sub)
                asset_win_rates.append(wr)
            asset_grp['win_rate'] = asset_win_rates
            
            asset_sorted = asset_grp.sort_values('Net PnL', ascending=False)
            top_5_assets = asset_sorted.head(5).to_dict('records')
            bottom_5_assets = asset_sorted.tail(5).to_dict('records')
        else:
            top_5_assets = []
            bottom_5_assets = []

        # --- 7. 连胜/连败 (Streaks) ---
        max_loss_streak = 0
        max_loss_amount = 0
        loss_culprits = []
        max_win_streak = 0
        max_win_amount = 0
        win_heroes = []

        if total_trades > 0:
            df_sorted = df.sort_values('Closed')
            df_sorted['result_sign'] = np.sign(df_sorted['Net PnL'])
            # 巧妙算法：计算连续组
            df_sorted['group_id'] = (df_sorted['result_sign'] != df_sorted['result_sign'].shift()).cumsum()
            streak_groups = df_sorted.groupby(['group_id', 'result_sign'])
            
            for (gid, sign), group in streak_groups:
                if sign == -1: # 连败
                    if len(group) > max_loss_streak:
                        max_loss_streak = len(group)
                        max_loss_amount = group['Net PnL'].sum()
                        loss_culprits = group.groupby('Symbol')['Net PnL'].sum().sort_values().head(3).index.tolist()
                elif sign == 1: # 连胜
                    if len(group) > max_win_streak:
                        max_win_streak = len(group)
                        max_win_amount = group['Net PnL'].sum()
                        win_heroes = group.groupby('Symbol')['Net PnL'].sum().sort_values(ascending=False).head(3).index.tolist()

        # --- 8. 时间分析 (Timing) ---
        hourly_pnl = df.groupby('open_hour')['Net PnL'].sum().to_dict()
        daily_pnl = df.groupby('day_name')['Net PnL'].sum().sort_values(ascending=False)
        best_day = daily_pnl.index[0] if not daily_pnl.empty else "N/A"
        worst_day = daily_pnl.index[-1] if not daily_pnl.empty else "N/A"

        # --- 9. 持仓效率 (Efficiency) ---
        # 避免除以 0
        df['efficiency'] = abs(df['Closing PNL']) / df['duration_minutes'].replace(0, 1)
        avg_efficiency = df['efficiency'].mean() if not df.empty else 0

        # --- 10. 组装返回 ---
        return {
            "vitals": {
                "net_pnl": float(total_pnl),
                "gross_pnl": float(gross_pnl),
                "real_profit": float(real_profit),
                "real_loss": float(real_loss),
                "total_fees": float(total_fees),
                "volume": float(total_volume),
                "trade_count": int(total_trades),
                "hourly_wage": float(hourly_wage),
                "frequency": float(frequency)
            },
            "performance": {
                "win_rate": float(win_rate),
                "rr_ratio": float(rr_ratio),
                "profit_factor": float(profit_factor),
                "expectancy": float(expectancy),
                "avg_efficiency": float(avg_efficiency)
            },
            "direction": direction_stats,
            "duration_analysis": duration_stats,
            "assets": {
                "top_5": top_5_assets,
                "bottom_5": bottom_5_assets
            },
            "streaks": {
                "max_win": {
                    "count": int(max_win_streak),
                    "amount": float(max_win_amount),
                    "heroes": win_heroes
                },
                "max_loss": {
                    "count": int(max_loss_streak),
                    "amount": float(max_loss_amount),
                    "culprits": loss_culprits
                }
            },
            "timing": {
                "hourly_pnl": hourly_pnl,
                "best_day": best_day,
                "worst_day": worst_day
            }
        }