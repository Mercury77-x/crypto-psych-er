import pandas as pd
import numpy as np

class TradeAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = self._preprocess(df)

    def _preprocess(self, df):
        # 1. 统一列名 (兼容常见交易所格式，按需调整)
        # 假设 CSV 包含: 'Symbol', 'Side', 'Size', 'Entry Price', 'Avg. Close Price', 'Closed Vol.', 'Closing PNL', 'Opened', 'Closed'
        # 如果列名不同，需要在这里做映射
        df.columns = [c.strip() for c in df.columns]
        
        # 2. 转换时间
        df['Opened'] = pd.to_datetime(df['Opened'])
        df['Closed'] = pd.to_datetime(df['Closed'])
        
        # 3. 计算基础字段
        # 持仓时长 (分钟)
        df['duration_minutes'] = (df['Closed'] - df['Opened']).dt.total_seconds() / 60
        # 估算手续费: (Entry Price + Avg. Close Price) * Closed Vol. * 0.0005
        # 注意：如果 CSV 里没有 Volume，可能需要用 Size / Entry Price 推算，这里默认有 Closed Vol.
        if 'Closed Vol.' not in df.columns and 'Size' in df.columns:
             # 简单容错：假设 Size 就是 Volume (合约通常是张数/币数)
             df['Closed Vol.'] = df['Size']
             
        df['est_fee'] = (df['Entry Price'] + df['Avg. Close Price']) * df['Closed Vol.'] * 0.0005
        
        # 净利润 = 毛盈亏 - 估算手续费
        df['Net PnL'] = df['Closing PNL'] - df['est_fee']
        
        # 星期几 (0=Monday, 6=Sunday)
        df['day_name'] = df['Opened'].dt.day_name()
        # 开仓小时 (0-23)
        df['open_hour'] = df['Opened'].dt.hour
        
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
        # Sum( (Entry Price + Avg. Close Price) * Closed Vol. )
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
        
        # 期望值 (Mean Net PnL)
        expectancy = df['Net PnL'].mean()

        # --- 3. 多空偏好 ---
        longs = df[df['Side'].str.lower() == 'long'] if 'Side' in df.columns else pd.DataFrame()
        shorts = df[df['Side'].str.lower() == 'short'] if 'Side' in df.columns else pd.DataFrame()
        
        direction_stats = {
            "long": {"count": len(longs), "pnl": longs['Net PnL'].sum() if not longs.empty else 0},
            "short": {"count": len(shorts), "pnl": shorts['Net PnL'].sum() if not shorts.empty else 0}
        }

        # --- 4. 持仓时间分类 ---
        # <5m, 5-15m, 15-60m, 1-4h(60-240m), >4h(240m)
        bins = [0, 5, 15, 60, 240, float('inf')]
        labels = ['剥头皮 (<5m)', '超短线 (5-15m)', '日内短线 (15-60m)', '日内波段 (1-4h)', '长线 (>4h)']
        df['duration_type'] = pd.cut(df['duration_minutes'], bins=bins, labels=labels)
        
        duration_stats = {}
        for label in labels:
            sub_df = df[df['duration_type'] == label]
            if not sub_df.empty:
                # Top 5 币种
                top_coins = sub_df.groupby('Symbol')['Net PnL'].sum().sort_values(ascending=False).head(5).index.tolist()
                win_rate_sub = len(sub_df[sub_df['Net PnL'] > 0]) / len(sub_df)
                duration_stats[label] = {
                    "count": len(sub_df),
                    "pnl": sub_df['Net PnL'].sum(),
                    "win_rate": win_rate_sub,
                    "top_coins": top_coins
                }

        # --- 5. 交易频率 & 时薪 ---
        days_span = (df['Closed'].max() - df['Opened'].min()).days + 1
        frequency = total_trades / days_span if days_span > 0 else total_trades
        
        total_hours = df['duration_minutes'].sum() / 60
        hourly_wage = total_pnl / total_hours if total_hours > 0 else 0
        
        # --- 6. 资产偏好 (Top/Bottom 5) ---
        asset_grp = df.groupby('Symbol').agg({
            'Net PnL': 'sum',
            'Opened': 'count' # 交易笔数
        }).reset_index()
        
        # 计算每个资产的胜率
        asset_win_rates = []
        for sym in asset_grp['Symbol']:
            sub = df[df['Symbol'] == sym]
            wr = len(sub[sub['Net PnL'] > 0]) / len(sub)
            asset_win_rates.append(wr)
        asset_grp['win_rate'] = asset_win_rates
        
        asset_sorted = asset_grp.sort_values('Net PnL', ascending=False)
        top_5_assets = asset_sorted.head(5).to_dict('records')
        bottom_5_assets = asset_sorted.tail(5).to_dict('records')

        # --- 7. 连胜/连败 (Streak) ---
        # 按平仓时间排序
        df_sorted = df.sort_values('Closed')
        # 创建盈亏符号列: 1=赢, -1=输
        df_sorted['result_sign'] = np.sign(df_sorted['Net PnL'])
        
        # 寻找连续段
        # 逻辑：如果 result_sign 和上一行不同，则 group_id + 1
        df_sorted['group_id'] = (df_sorted['result_sign'] != df_sorted['result_sign'].shift()).cumsum()
        
        streak_groups = df_sorted.groupby(['group_id', 'result_sign'])
        
        max_loss_streak = 0
        max_loss_amount = 0
        loss_culprits = []
        
        max_win_streak = 0
        max_win_amount = 0
        win_heroes = []

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

        # --- 8. 时间分析 ---
        # 黄金/垃圾时间
        hourly_pnl = df.groupby('open_hour')['Net PnL'].sum().to_dict()
        
        # 最佳/最差交易日
        daily_pnl = df.groupby('day_name')['Net PnL'].sum().sort_values(ascending=False)
        best_day = daily_pnl.index[0] if not daily_pnl.empty else "N/A"
        worst_day = daily_pnl.index[-1] if not daily_pnl.empty else "N/A"

        # --- 9. 盈亏同源性 & 效率 ---
        # 每一单盈亏 / 平均亏损额
        avg_loss_abs = abs(avg_loss) if abs(avg_loss) > 0 else 1
        df['pnl_normalized'] = df['Net PnL'] / avg_loss_abs
        
        # 持仓效率
        df['efficiency'] = abs(df['Closing PNL']) / df['duration_minutes'].replace(0, 1) # 避免除以0
        avg_efficiency = df['efficiency'].mean()

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
