"use client"

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Bandaged Bitcoin - top left */}
      <div className="absolute top-[10%] left-[5%] float-element opacity-60">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          {/* Bitcoin circle */}
          <circle cx="80" cy="80" r="60" stroke="#00ff88" strokeWidth="3" fill="none" />
          {/* Bitcoin B */}
          <text x="80" y="95" textAnchor="middle" fill="#00ff88" fontSize="60" fontWeight="bold">
            ₿
          </text>
          {/* Bandages */}
          <path d="M30 50 L130 110" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
          <path d="M30 110 L130 50" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
          {/* Medical cross on bandage */}
          <rect x="72" y="65" width="16" height="30" fill="#ff003c" />
          <rect x="65" y="72" width="30" height="16" fill="#ff003c" />
        </svg>
      </div>

      {/* Skull with crypto eyes - top right */}
      <div className="absolute top-[8%] right-[8%] float-element-reverse opacity-50">
        <svg width="140" height="180" viewBox="0 0 140 180" fill="none">
          {/* Skull outline */}
          <ellipse cx="70" cy="70" rx="55" ry="65" stroke="#00ff88" strokeWidth="2" fill="none" />
          {/* Eye sockets with ETH symbols */}
          <circle cx="45" cy="60" r="18" stroke="#00ff88" strokeWidth="2" fill="none" />
          <circle cx="95" cy="60" r="18" stroke="#00ff88" strokeWidth="2" fill="none" />
          <text x="45" y="66" textAnchor="middle" fill="#00ff88" fontSize="18">
            Ξ
          </text>
          <text x="95" y="66" textAnchor="middle" fill="#00ff88" fontSize="18">
            Ξ
          </text>
          {/* Nose */}
          <path d="M65 85 L70 100 L75 85" stroke="#00ff88" strokeWidth="2" fill="none" />
          {/* Jaw */}
          <path d="M30 110 Q70 160 110 110" stroke="#00ff88" strokeWidth="2" fill="none" />
          {/* Teeth */}
          <line x1="40" y1="120" x2="40" y2="135" stroke="#00ff88" strokeWidth="2" />
          <line x1="55" y1="125" x2="55" y2="140" stroke="#00ff88" strokeWidth="2" />
          <line x1="70" y1="128" x2="70" y2="143" stroke="#00ff88" strokeWidth="2" />
          <line x1="85" y1="125" x2="85" y2="140" stroke="#00ff88" strokeWidth="2" />
          <line x1="100" y1="120" x2="100" y2="135" stroke="#00ff88" strokeWidth="2" />
        </svg>
      </div>

      {/* Brain with chart pattern - left middle */}
      <div className="absolute top-[45%] left-[3%] float-element opacity-40" style={{ animationDelay: "-2s" }}>
        <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
          {/* Brain outline */}
          <path
            d="M60 10 Q20 10 15 40 Q10 70 40 85 Q50 90 60 85 Q70 90 80 85 Q110 70 105 40 Q100 10 60 10"
            stroke="#00ff88"
            strokeWidth="2"
            fill="none"
          />
          {/* Brain folds with candlestick pattern */}
          <path d="M35 30 L35 50 M30 35 L40 35 M30 45 L40 45" stroke="#ff003c" strokeWidth="2" />
          <path d="M55 25 L55 55 M50 30 L60 30 M50 50 L60 50" stroke="#00ff88" strokeWidth="2" />
          <path d="M75 35 L75 60 M70 40 L80 40 M70 55 L80 55" stroke="#ff003c" strokeWidth="2" />
          <path d="M90 30 L90 50 M85 35 L95 35 M85 45 L95 45" stroke="#00ff88" strokeWidth="2" />
        </svg>
      </div>

      {/* IV Drip bag with USDT - right middle */}
      <div className="absolute top-[50%] right-[5%] float-element-reverse opacity-50" style={{ animationDelay: "-3s" }}>
        <svg width="80" height="160" viewBox="0 0 80 160" fill="none">
          {/* IV Stand */}
          <line x1="40" y1="0" x2="40" y2="20" stroke="#666" strokeWidth="2" />
          {/* Bag */}
          <rect x="15" y="20" width="50" height="70" rx="5" stroke="#00ff88" strokeWidth="2" fill="none" />
          {/* Fluid */}
          <rect x="18" y="45" width="44" height="42" rx="3" fill="#00ff88" fillOpacity="0.2" />
          {/* USDT symbol */}
          <text x="40" y="40" textAnchor="middle" fill="#00ff88" fontSize="14" fontWeight="bold">
            USDT
          </text>
          {/* Drip tube */}
          <path d="M40 90 L40 120 Q40 130 50 135 L60 140" stroke="#00ff88" strokeWidth="2" fill="none" />
          {/* Drip drops */}
          <circle cx="40" cy="105" r="3" fill="#00ff88" className="pulse-soft" />
        </svg>
      </div>

      {/* Heart with broken chart line - bottom left */}
      <div className="absolute bottom-[15%] left-[8%] float-element opacity-50" style={{ animationDelay: "-4s" }}>
        <svg width="120" height="110" viewBox="0 0 120 110" fill="none">
          {/* Heart outline */}
          <path
            d="M60 100 L15 55 Q0 30 25 15 Q45 5 60 25 Q75 5 95 15 Q120 30 105 55 L60 100"
            stroke="#ff003c"
            strokeWidth="2"
            fill="none"
          />
          {/* Broken line chart inside */}
          <path
            d="M25 55 L40 55 L45 35 L55 65 L65 45 L75 60 L80 40 L95 55"
            stroke="#ff003c"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Pill capsule with BTC - bottom right */}
      <div
        className="absolute bottom-[20%] right-[12%] float-element-reverse opacity-45"
        style={{ animationDelay: "-1s" }}
      >
        <svg width="100" height="50" viewBox="0 0 100 50" fill="none">
          {/* Capsule */}
          <rect x="5" y="10" width="90" height="30" rx="15" stroke="#00ff88" strokeWidth="2" fill="none" />
          {/* Divider */}
          <line x1="50" y1="10" x2="50" y2="40" stroke="#00ff88" strokeWidth="2" />
          {/* Left side - BTC */}
          <text x="27" y="30" textAnchor="middle" fill="#00ff88" fontSize="14" fontWeight="bold">
            BTC
          </text>
          {/* Right side - filled */}
          <rect x="50" y="10" width="45" height="30" rx="15" fill="#ff003c" fillOpacity="0.3" />
          <text x="73" y="30" textAnchor="middle" fill="#ff003c" fontSize="14" fontWeight="bold">
            -99%
          </text>
        </svg>
      </div>

      {/* Syringe with liquidation - center left */}
      <div
        className="absolute top-[70%] left-[15%] float-element opacity-35 rotate-45"
        style={{ animationDelay: "-5s" }}
      >
        <svg width="140" height="40" viewBox="0 0 140 40" fill="none">
          {/* Syringe body */}
          <rect x="30" y="10" width="80" height="20" stroke="#666" strokeWidth="2" fill="none" />
          {/* Plunger */}
          <rect x="110" y="12" width="25" height="16" stroke="#666" strokeWidth="2" fill="none" />
          {/* Needle */}
          <path d="M30 20 L5 20" stroke="#666" strokeWidth="2" />
          {/* Liquid */}
          <rect x="32" y="12" width="50" height="16" fill="#ff003c" fillOpacity="0.3" />
          <text x="57" y="24" textAnchor="middle" fill="#ff003c" fontSize="10" fontWeight="bold">
            爆仓
          </text>
        </svg>
      </div>
    </div>
  )
}
