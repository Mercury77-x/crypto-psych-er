# backend/analyzer.py
import pandas as pd

class TradeAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        # 数据标准化处理
        # 假设 CSV 列名可能不同，这里做简单的标准化映射（根据实际情况调整）
        # 必须确保有：pnl, fee, open_time, close_time, volume, symbol
        self.df.columns = [c.lower().strip().replace(' ', '_').replace('.', '') for c in self.df.columns]

        # 尝试转换时间
        if 'opened' in self.df.columns: self.df['open_time'] = pd.to_datetime(self.df['opened'])
        if 'closed' in self.df.columns: self.df['close_time'] = pd.to_datetime(self.df['closed'])

        # 核心字段清洗
        target_cols = {'closing_pnl': 'pnl', 'fee': 'fee', 'closed_vol': 'volume', 'symbol': 'symbol'}
        self.df = self.df.rename(columns=target_cols)

        # 确保数值类型
        for col in ['pnl', 'fee', 'volume']:
            if col in self.df.columns:
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(0)

        # 计算持仓时间
        if 'open_time' in self.df.columns and 'close_time' in self.df.columns:
            self.df['duration_mins'] = (self.df['close_time'] - self.df['open_time']).dt.total_seconds() / 60
        else:
            self.df['duration_mins'] = 0 # 兜底

    def get_analysis_json(self):
        # 1. 基础数据
        total_pnl = self.df['pnl'].sum()
        total_fees = self.df['fee'].sum() if 'fee' in self.df.columns else 0 # 有些csv可能没fee，需要估算
        total_trades = len(self.df)
        win_count = len(self.df[self.df['pnl'] > 0])
        win_rate = (win_count / total_trades * 100) if total_trades > 0 else 0

        # 2. 风格分析
        scalping = self.df[self.df['duration_mins'] < 15]
        swing = self.df[self.df['duration_mins'] >= 60]

        # 3. 毒性资产
        toxic_coin = "N/A"
        holy_coin = "N/A"
        if 'symbol' in self.df.columns:
            coin_stats = self.df.groupby('symbol')['pnl'].sum().sort_values()
            if not coin_stats.empty:
                toxic_coin = f"{coin_stats.index[0]} ({round(coin_stats.values[0], 2)} U)"
                holy_coin = f"{coin_stats.index[-1]} ({round(coin_stats.values[-1], 2)} U)"

        # 4. 时薪计算 (假设每单耗时10分钟)
        labor_hours = (total_trades * 10) / 60
        hourly_wage = total_pnl / labor_hours if labor_hours > 0 else 0

        return {
            "vitals": {
                "total_pnl": round(total_pnl, 2),
                "total_fees": round(total_fees, 2),
                "win_rate": round(win_rate, 2),
                "hourly_wage": round(hourly_wage, 2),
                "trade_count": total_trades
            },
            "style": {
                "scalping_count": len(scalping),
                "scalping_loss": round(scalping['pnl'].sum(), 2),
                "swing_count": len(swing),
                "swing_profit": round(swing['pnl'].sum(), 2)
            },
            "assets": {
                "toxic": toxic_coin,
                "holy": holy_coin
            },
            "mode": "Mode A" if total_pnl < 0 else "Mode B"
        }