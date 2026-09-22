import { useState } from 'react';

interface Props {
  children: React.ReactNode;
  current: string;
  onNavigate: (s: string) => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: 'org-dashboard', label: 'Tổng quan', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /> },
  { id: 'org-events', label: 'Sự kiện', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" /> },
  { id: 'org-participants', label: 'Người tham gia', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /> },
  { id: 'org-staff', label: 'Nhân viên', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /> },
  { id: 'org-settings', label: 'Cài đặt', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /> },
];

export function OrgLayout({ children, current, onNavigate, onLogout }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: '#f4f5f9' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col bg-white border-r sticky top-0 h-screen flex-shrink-0"
        style={{ width: 248, borderColor: '#e2e8f0' }}>
        <SidebarContent current={current} onNavigate={s => { onNavigate(s); }} onLogout={onLogout} />
      </aside>

      {/* Mobile/tablet drawer backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile/tablet drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-xl transition-transform duration-300 lg:hidden`}
        style={{ width: 260, transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <SidebarContent current={current} onNavigate={s => { onNavigate(s); setDrawerOpen(false); }} onLogout={onLogout} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile/tablet header */}
        <header className="safe-area-top lg:hidden sticky top-0 z-30 bg-white border-b flex items-center justify-between px-4 py-3"
          style={{ borderColor: '#e2e8f0' }}>
          <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" style={{ color: '#475569' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-display font-bold"
              style={{ background: '#4f46e5' }}>CEH</div>
            <span className="font-display font-semibold text-sm" style={{ color: '#1a1a2e' }}>Campus Event Hub</span>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: '#0891b2' }}>BT</div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ current, onNavigate, onLogout }: { current: string; onNavigate: (s: string) => void; onLogout: () => void }) {
  return (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: '#f1f5f9' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-white text-xs"
            style={{ background: '#4f46e5' }}>CEH</div>
          <div>
            <div className="font-display font-bold text-sm leading-tight" style={{ color: '#1a1a2e' }}>Campus Event Hub</div>
            <div className="text-xs" style={{ color: '#94a3b8' }}>Ban tổ chức</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = current === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                background: isActive ? '#eef2ff' : 'transparent',
                color: isActive ? '#4f46e5' : '#64748b',
              }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={isActive ? 2.5 : 1.5}>
                {item.icon}
              </svg>
              <span className="truncate">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#4f46e5' }} />}
            </button>
          );
        })}
      </nav>

      {/* Profile & logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: '#f1f5f9' }}>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-left mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: '#0891b2' }}>BT</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: '#1a1a2e' }}>Ban Tổ Chức</div>
            <div className="text-xs truncate" style={{ color: '#94a3b8' }}>btc@campuseventhub.edu.vn</div>
          </div>
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:bg-red-50"
          style={{ color: '#94a3b8' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </>
  );
}
