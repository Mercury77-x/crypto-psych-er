import pandas as pd
import numpy as np

class TradeAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = self._preprocess(df)

    def _preprocess(self, df):
        # 1. 清洗列名 (去空格，转小写，方便匹配)
        df.columns = [c.strip() for c in df.columns]
        
        # 2. 定义列名映射字典 (Universal Mapper)
        # 格式: '内部标准名': ['可能的CSV列名1', '可能的CSV列名2', ...]
        column_mapping = {
            'Symbol': ['Symbol', 'Instrument', 'Pair', 'Contract', '币种', '交易对'],
            'Side': ['Side', 'Direction', 'Type', '方向', '买卖'],
            'Size': ['Size', 'Amount', 'Quantity', 'Qty', 'Vol', '数量', '张数'],
            'Entry Price': ['Entry Price', 'Avg. Open Price', 'Avg Entry Price', 'Open Price', 'Price', '开仓均价', '开仓价'],
            'Avg. Close Price': ['Avg. Close Price', 'Close Price', 'Exit Price', 'Price', 'Avg Price', '平仓均价', '平仓价', '成交均价'],
            'Closed Vol.': ['Closed Vol.', 'Closed Volume', 'Size', 'Qty', 'Amount', '成交量', '平仓数量'],
            'Closing PNL': ['Closing PNL', 'Realized PNL', 'PnL', 'Profit', 'Net Profit', '已实现盈亏', '盈亏'],
            'Opened': ['Opened', 'Open Time', 'Date', 'Time', 'Created Time', '开仓时间', '时间'],
            'Closed': ['Closed', 'Close Time', 'Update Time', 'Finished Time', '平仓时间', '更新时间']
        }

        # 3. 智能重命名
        # 遍历我们的标准列名
        for standard_col, aliases in column_mapping.items():
            # 如果标准列名已经在 CSV 里了，跳过
            if standard_col in df.columns:
                continue
            
            # 否则，去 aliases 里找，看 CSV 里有没有对应的别名
            found = False
            for alias in aliases:
                # 尝试精准匹配
                if alias in df.columns:
                    df.rename(columns={alias: standard_col}, inplace=True)
                    found = True
                    break
                # 尝试忽略大小写匹配
                if not found:
                    for csv_col in df.columns:
                        if csv_col.lower() == alias.lower():
                            df.rename(columns={csv_col: standard_col}, inplace=True)
                            found = True
                            break
                if found: break
            
            # 如果找了一圈还是没找到，且该列不是必须的，可以给默认值
            # 注意：Entry Price, Closing PNL 等是必须的，找不到会报错，这属于正常风控

        # --- 4. 容错处理 (补全逻辑) ---
        
        # 容错 A: 如果找不到 'Closed Vol.' 但有 'Size'，就用 Size
        if 'Closed Vol.' not in df.columns and 'Size' in df.columns:
             df['Closed Vol.'] = df['Size']

        # 容错 B: 如果找不到 'Avg. Close Price'，这很致命。
        # 尝试查看是否有 'Price' 列，如果有，就把它当做 Close Price
        if 'Avg. Close Price' not in df.columns and 'Price' in df.columns:
            df['Avg. Close Price'] = df['Price']

        # 容错 C: 确保时间列是时间格式
        if 'Opened' in df.columns:
            df['Opened'] = pd.to_datetime(df['Opened'], errors='coerce')
        if 'Closed' in df.columns:
            df['Closed'] = pd.to_datetime(df['Closed'], errors='coerce')
        
        # 如果 'Closed' 时间缺失，用 'Opened' 顶替（避免计算持仓时间报错）
        if 'Closed' not in df.columns and 'Opened' in df.columns:
            df['Closed'] = df['Opened']

        # --- 5. 计算逻辑 (保持不变) ---
        
        # 持仓时长 (分钟)
        # fillna(0) 防止时间解析失败导致报错
        df['duration_minutes'] = (df['Closed'] - df['Opened']).dt.total_seconds().fillna(0) / 60
        
        # 估算手续费
        # 确保列都是数字类型
        cols_to_numeric = ['Entry Price', 'Avg. Close Price', 'Closed Vol.', 'Closing PNL']
        for c in cols_to_numeric:
            if c in df.columns:
                df[c] = pd.to_numeric(df[c], errors='coerce').fillna(0)

        # 必须确保这几列存在，否则 analyzer 无法工作
        required_cols = ['Entry Price', 'Avg. Close Price', 'Closed Vol.', 'Closing PNL']
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise ValueError(f"CSV 格式错误，缺少关键列: {missing}。请检查 CSV 表头。")

        df['est_fee'] = (df['Entry Price'] + df['Avg. Close Price']) * df['Closed Vol.'] * 0.0005
        
        # 净利润
        df['Net PnL'] = df['Closing PNL'] - df['est_fee']
        
        # 星期几 / 小时
        if 'Opened' in df.columns:
            df['day_name'] = df['Opened'].dt.day_name()
            df['open_hour'] = df['Opened'].dt.hour
        else:
            df['day_name'] = 'Unknown'
            df['open_hour'] = 0
            
        # 确保 Side 存在
        if 'Side' not in df.columns:
            df['Side'] = 'Long' # 默认值
        
        # 确保 Symbol 存在
        if 'Symbol' not in df.columns:
            df['Symbol'] = 'Unknown'

        return df

    def get_analysis_json(self):
        df = self.df
        
        # --- 1. 基础盈亏 ---
        total_pnl = df['Net PnL'].sum()
        gross_pnl = df['Closing PNL'].sum()
        total_fees = df['est_fee'].sum()
        
        # 真实盈亏 (Realized)
        real_loss = df[df['Net PnL'] < 0]['Net PnL'].sum()
        real_profit = df[df['Net PnL'] > 0]['Net PnL'].sum()
        
        # 总交易额 Volume
        total_volume = ((df['Entry Price'] + df['Avg. Close Price']) * df['Closed Vol.']).sum()

        # --- 2. 胜率与风控 ---
        total_trades = len(df)
        winning_trades = df[df['Net PnL'] > 0]
        losing_trades = df[df['Net PnL'] < 0]
        
        win_rate = len(winning_trades) / total_trades if total_trades > 0 else 0
        
        # 盈亏比
        avg_win = winning_trades['Net PnL'].mean() if not winning_trades.empty else 0
        avg_loss = abs(losing_trades['Net PnL'].mean()) if not losing_trades.empty else 0
        rr_ratio = avg_win / avg_loss if avg_loss > 0 else 0
        
        # 利润因子
        profit_factor = real_profit / abs(real_loss) if abs(real_loss) > 0 else 0
        
        # 期望值
        expectancy = df['Net PnL'].mean()

        # --- 3. 多空偏好 ---
        longs = df[df['Side'].str.lower().isin(['long', 'buy'])]
        shorts = df[df['Side'].str.lower().isin(['short', 'sell'])]
        
        direction_stats = {
            "long": {"count": len(longs), "pnl": longs['Net PnL'].sum() if not longs.empty else 0},
            "short": {"count": len(shorts), "pnl": shorts['Net PnL'].sum() if not shorts.empty else 0}
        }

        # --- 4. 持仓时间分类 ---
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
        
        # --- 6. 资产偏好 ---
        if total_trades > 0:
            asset_grp = df.groupby('Symbol').agg({'Net PnL': 'sum', 'Opened': 'count'}).reset_index()
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

        # --- 7. 连胜/连败 ---
        if total_trades > 0:
            df_sorted = df.sort_values('Closed')
            df_sorted['result_sign'] = np.sign(df_sorted['Net PnL'])
            df_sorted['group_id'] = (df_sorted['result_sign'] != df_sorted['result_sign'].shift()).cumsum()
            streak_groups = df_sorted.groupby(['group_id', 'result_sign'])
            
            max_loss_streak = 0
            max_loss_amount = 0
            loss_culprits = []
            max_win_streak = 0
            max_win_amount = 0
            win_heroes = []

            for (gid, sign), group in streak_groups:
                if sign == -1: 
                    if len(group) > max_loss_streak:
                        max_loss_streak = len(group)
                        max_loss_amount = group['Net PnL'].sum()
                        loss_culprits = group.groupby('Symbol')['Net PnL'].sum().sort_values().head(3).index.tolist()
                elif sign == 1: 
                    if len(group) > max_win_streak:
                        max_win_streak = len(group)
                        max_win_amount = group['Net PnL'].sum()
                        win_heroes = group.groupby('Symbol')['Net PnL'].sum().sort_values(ascending=False).head(3).index.tolist()
        else:
            max_loss_streak = 0
            max_loss_amount = 0
            loss_culprits = []
            max_win_streak = 0
            max_win_amount = 0
            win_heroes = []

        # --- 8. 时间分析 ---
        hourly_pnl = df.groupby('open_hour')['Net PnL'].sum().to_dict()
        daily_pnl = df.groupby('day_name')['Net PnL'].sum().sort_values(ascending=False)
        best_day = daily_pnl.index[0] if not daily_pnl.empty else "N/A"
        worst_day = daily_pnl.index[-1] if not daily_pnl.empty else "N/A"

        # --- 9. 效率 ---
        avg_loss_abs = abs(avg_loss) if abs(avg_loss) > 0 else 1
        # df['pnl_normalized'] = df['Net PnL'] / avg_loss_abs
        
        df['efficiency'] = abs(df['Closing PNL']) / df['duration_minutes'].replace(0, 1)
        avg_efficiency = df['efficiency'].mean() if not df.empty else 0

        # --- 组装最终 JSON ---
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