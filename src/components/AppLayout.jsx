import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_rgba(238,244,255,0.88)_42%,_rgba(217,227,244,0.6)_100%)] p-3 text-on-surface dark:bg-[radial-gradient(circle_at_top_left,_rgba(15,24,39,0.98),_rgba(7,13,24,1)_42%,_rgba(3,7,15,1)_100%)] sm:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1680px] gap-3 sm:min-h-[calc(100vh-2rem)] sm:gap-4">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-hidden">
          <div className="bg-app-shell h-full rounded-[2rem] shadow-[0_24px_70px_rgba(37,99,235,0.12)] ring-1 ring-app backdrop-blur-sm dark:shadow-[0_28px_80px_rgba(1,6,16,0.68)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
