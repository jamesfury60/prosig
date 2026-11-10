// components/HowItWorksSection.jsx

const STEPS = [
  {
    title: "Step Into First Access",
    body: "Join the waiting list to gain priority access. Submit your details and complete identity verification to unlock early trading benefits.",
  },
  {
    title: "Load Your Currency",
    body: "Fund your account with crypto. Easily transfer existing assets or buy digital currency directly on our platform.",
  },
  {
    title: "Order Your Trade Pass",
    body: "Secure your Trade Pass through our platform. Select from flexible options, including both digital and physical formats.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Visual card */}
        <div className="relative min-h-[360px] md:min-h-[420px] rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-green-950/40 to-[#080B11] [html.light_&]:border-black/10 [html.light_&]:from-green-100/70 [html.light_&]:to-white">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-green-500/25 blur-[90px] rounded-full pointer-events-none [html.light_&]:bg-green-300/35" />

          <div
            className="absolute inset-0 opacity-20 [html.light_&]:opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 14px)",
            }}
          />

          {/* Profile report mini card */}
          <div className="absolute top-10 left-6 right-6 md:right-24 p-4 rounded-2xl bg-[#0B0E17]/80 border border-green-500/20 backdrop-blur-sm [html.light_&]:bg-white/85 [html.light_&]:border-green-400/30">
            <span className="text-xs text-gray-300 [html.light_&]:text-gray-600">
              Profile Report
            </span>
          </div>

          {/* Priority access card */}
          <div className="absolute bottom-8 left-6 right-6 md:left-10 md:right-16 p-5 rounded-2xl bg-[#0B0E17]/95 border border-green-500/30 shadow-2xl [html.light_&]:bg-white/95 [html.light_&]:border-green-400/30 [html.light_&]:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-white [html.light_&]:text-gray-900">
                Priority Access
              </span>
              <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-gray-400 [html.light_&]:border-black/15 [html.light_&]:text-gray-500">
                ?
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden [html.light_&]:bg-black/10">
                  <div className="h-full w-[52%] rounded-full bg-gradient-to-r from-green-600 to-green-400" />
                </div>
                <span className="text-sm font-bold text-white shrink-0 [html.light_&]:text-gray-900">
                  52%
                </span>
              </div>
              <p className="text-[11px] text-gray-500 -mt-3 [html.light_&]:text-gray-500">
                Priority
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden [html.light_&]:bg-black/10">
                  <div className="h-full w-[32%] rounded-full bg-gradient-to-r from-gray-400 to-gray-200" />
                </div>
                <span className="text-sm font-bold text-white shrink-0 [html.light_&]:text-gray-900">
                  32%
                </span>
              </div>
              <p className="text-[11px] text-gray-500 -mt-3 [html.light_&]:text-gray-500">
                Other
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div>
          <span className="inline-block text-xs font-semibold text-green-400 uppercase tracking-wider px-3 py-1.5 rounded-full border border-green-500/30 mb-4 [html.light_&]:text-green-600 [html.light_&]:border-green-400/40">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white [html.light_&]:text-gray-900">
            From Idea to Action
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-8 [html.light_&]:text-gray-600">
            Simple Steps to Start Trading Safely and Confidently.
          </p>

          <div>
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="border-t border-white/10 py-6 first:pt-0 [html.light_&]:border-black/10"
              >
                <h3 className="font-semibold text-base md:text-lg mb-2 text-white [html.light_&]:text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed [html.light_&]:text-gray-600">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
