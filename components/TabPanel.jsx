import { useState } from "react";

export default function TabPanel({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-brand-card/50 border border-brand-border rounded-xl p-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              active === i
                ? "bg-brand-navy text-white shadow-sm"
                : "text-brand-muted hover:text-white"
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.count != null && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                active === i ? "bg-brand-green/20 text-brand-green" : "bg-brand-border text-brand-muted"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6 animate-fade-in" key={active}>
        {tabs[active]?.content}
      </div>
    </div>
  );
}
