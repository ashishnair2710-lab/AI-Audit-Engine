import TopBar from '@/components/TopBar'

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" subtitle="Account and portal configuration" />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-brand-border shadow-card p-10 text-center max-w-md mx-auto mt-8">
          <div className="w-12 h-12 rounded-full bg-brand-gray flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 className="text-base font-semibold text-brand-black mb-2">Settings</h3>
          <p className="text-sm text-brand-muted">Settings configuration will be available in the full version. This demo focuses on the lead management and reporting modules.</p>
        </div>
      </div>
    </>
  )
}
