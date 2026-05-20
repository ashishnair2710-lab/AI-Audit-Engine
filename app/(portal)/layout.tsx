import Sidebar from '@/components/Sidebar'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-gray">
      <Sidebar />
      <main className="flex-1 ml-60 pt-14">
        {children}
      </main>
    </div>
  )
}
