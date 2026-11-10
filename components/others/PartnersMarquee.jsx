// components/PartnersMarquee.jsx

const PARTNERS = [
  { name: "Bitget", mono: "BG", color: "#34d399" },
  { name: "OKX", mono: "OK", color: "#000000" },
  { name: "Visa", mono: "V", color: "#1A1F71" },
  { name: "HTX", mono: "HX", color: "#238A3A" },
  { name: "MEXC", mono: "MX", color: "#16a34a" },
  { name: "Coinbase", mono: "CB", color: "#0052FF" },
  { name: "Ripple", mono: "XR", color: "#059669" },
  { name: "Kraken", mono: "KR", color: "#16a34a" },
  { name: "Binance", mono: "BN", color: "#F0B90B" },
  { name: "Bybit", mono: "BY", color: "#FFA400" },
  { name: "KuCoin", mono: "KC", color: "#24AE8F" },
  { name: "Uphold", mono: "UP", color: "#48CC67" },
  { name: "Gate.io", mono: "GT", color: "#17E6A1" },
  { name: "Mastercard", mono: "MC", color: "#EB001B" },
  { name: "Plaid", mono: "PL", color: "#000000" },
];

// Duplicated once so the track can loop seamlessly from -50% back to 0%.
const TRACK = [...PARTNERS, ...PARTNERS];

export default function PartnersMarquee() {
  return (
    <div className="mt-16 md:mt-20 border-t border-white/5 pt-8 w-full max-w-5xl [html.light_&]:border-black/10">
      <style>{`
        @keyframes partnersScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .partners-track {
          animation: partnersScroll 32s linear infinite;
        }
        .partners-viewport:hover .partners-track {
          animation-play-state: paused;
        }
      `}</style>

      <p className="text-xs text-gray-500 uppercase tracking-widest mb-6 text-center [html.light_&]:text-gray-500">
        Trusted by leading blockchain innovators
      </p>

      <div
        className="partners-viewport relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="partners-track flex w-max items-center gap-10 md:gap-14">
          {TRACK.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex items-center gap-2.5 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: partner.color }}
              >
                {partner.mono}
              </span>
              <span className="text-sm font-semibold tracking-wide text-gray-300 whitespace-nowrap [html.light_&]:text-gray-600">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
