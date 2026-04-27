import { useState } from "react";

export default function TabPanel({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              active === i
                ? "bg-white text-brand-purple shadow-sm font-semibold"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.count != null && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                active === i ? "bg-brand-lavender text-brand-purple" : "bg-slate-200 text-brand-muted"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="animate-fade-in" key={active}>
        {tabs[active]?.content}
      </div>
    </div>
  );
}
