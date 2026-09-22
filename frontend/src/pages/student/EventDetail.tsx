import { useState } from 'react';
import { TOPIC_LABELS } from '../../types';
import type { Ticket } from '../../types';
import { useApp, computeEventStatus, EVENT_STATUS_LABELS } from '../../context/AppContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../components/Toast';

const TOPIC_COLORS: Record<string, string> = {
  academic: '#4f46e5',
  skill: '#0891b2',
  culture: '#7c3aed',
  sport: '#059669',
  community: '#d97706',
};

interface Props {
  eventId: string;
  onBack: () => void;
  onRegister: (ticket: Ticket) => void;
  onViewTicket: () => void;
}

const TABS = ['Giới thiệu', 'Lịch trình', 'Diễn giả', 'Quyền lợi'] as const;

export default function EventDetail({ eventId, onBack, onRegister, onViewTicket }: Props) {
  const { getEvent, getUserActiveTicket, registerEvent } = useApp();
  const { user } = useUser();
  const { showToast } = useToast();
  const [tab, setTab] = useState<typeof TABS[number]>('Giới thiệu');
  const [registering, setRegistering] = useState(false);

  const event = getEvent(eventId);
  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: '#94a3b8' }}>Không tìm thấy sự kiện</p>
      </div>
    );
  }

  const activeTicket = getUserActiveTicket(event.id, user.studentId);
  const status = computeEventStatus(event);
  const pct = Math.round((event.registered / event.capacity) * 100);

  // CTA state machine
  let ctaLabel = 'Đăng ký ngay';
  let ctaEnabled = true;
  let ctaStyle = { background: '#4f46e5', color: 'white' };

  if (activeTicket) {
    ctaLabel = 'Xem vé của tôi';
    ctaStyle = { background: '#eef2ff', color: '#4f46e5' };
  } else if (status === 'full') {
    ctaLabel = 'Hết chỗ — Không thể đăng ký';
    ctaEnabled = false;
    ctaStyle = { background: '#f1f5f9', color: '#94a3b8' };
  } else if (status === 'closed') {
    ctaLabel = 'Đăng ký đã đóng';
    ctaEnabled = false;
    ctaStyle = { background: '#f1f5f9', color: '#94a3b8' };
  } else if (status === 'ended') {
    ctaLabel = 'Sự kiện đã kết thúc';
    ctaEnabled = false;
    ctaStyle = { background: '#f1f5f9', color: '#94a3b8' };
  }

  async function handleCTA() {
    if (activeTicket) { onViewTicket(); return; }
    if (!ctaEnabled || registering) return;
    setRegistering(true);
    const result = registerEvent(event!, user);
    setRegistering(false);
    if (result.success && result.ticket) {
      onRegister(result.ticket);
    } else {
      showToast(result.error ?? 'Đăng ký thất bại', 'error');
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f4f5f9' }}>
      {/* Top Safe Area */}
      <div className="w-full shrink-0" style={{ height: 'max(88px, env(safe-area-inset-top, 88px))', background: 'white' }} />

      {/* Hero */}
      <div className="relative">
        <div className="relative h-64">
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.7) 100%)' }} />
        </div>
        <button onClick={onBack}
          className="absolute left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', top: 16 }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: TOPIC_COLORS[event.topic] }}>
              {TOPIC_LABELS[event.topic]}
            </span>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: 'white' }}>
              {EVENT_STATUS_LABELS[status]}
            </span>
            {activeTicket && (
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: 'rgba(5,150,105,0.85)', backdropFilter: 'blur(4px)' }}>
                ✓ Đã đăng ký
              </span>
            )}
          </div>
          <h1 className="text-white font-display font-bold text-xl leading-tight mb-1">{event.title}</h1>
          <p className="text-slate-300 text-sm">{event.speaker}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Info row */}
        <div className="bg-white px-4 py-4 space-y-2.5">
          <InfoRow icon="calendar" label={`${new Date(event.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} · ${event.time} – ${event.endTime}`} />
          <InfoRow icon="location" label={`${event.room}, ${event.location}`} />
          <InfoRow icon="people" label={`${event.registered} / ${event.capacity} chỗ đã đăng ký · còn ${event.capacity - event.registered} chỗ`} />
        </div>

        {/* Capacity bar */}
        <div className="bg-white mt-2 px-4 py-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium" style={{ color: '#1a1a2e' }}>Tình trạng chỗ trống</span>
            <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: pct >= 90 ? '#dc2626' : pct >= 70 ? '#d97706' : '#059669' }}>
              {pct}%
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ background: '#f1f5f9' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct >= 90 ? '#dc2626' : pct >= 70 ? '#f59e0b' : '#4f46e5' }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white mt-2">
          <div className="flex border-b overflow-x-auto" style={{ borderColor: '#f1f5f9', scrollbarWidth: 'none' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors"
                style={{ borderColor: tab === t ? '#4f46e5' : 'transparent', color: tab === t ? '#4f46e5' : '#94a3b8' }}>
                {t}
              </button>
            ))}
          </div>
          <div className="px-4 py-4">
            {tab === 'Giới thiệu' && (
              <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{event.description}</p>
            )}
            {tab === 'Lịch trình' && (
              <div className="space-y-3">
                {event.schedule.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-xs font-medium w-12 flex-shrink-0 pt-0.5"
                      style={{ fontFamily: 'var(--font-mono)', color: '#4f46e5' }}>{s.time}</span>
                    <div className="flex-1 border-l pl-3" style={{ borderColor: '#e2e8f0' }}>
                      <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{s.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'Diễn giả' && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ background: TOPIC_COLORS[event.topic] }}>
                  {event.speaker[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{event.speaker}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{event.organizer}</p>
                </div>
              </div>
            )}
            {tab === 'Quyền lợi' && (
              <ul className="space-y-2.5">
                {event.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#dcfce7' }}>
                      <svg className="w-3 h-3" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-sm" style={{ color: '#475569' }}>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Registration info — only if eligible to register */}
        {!activeTicket && ctaEnabled && (
          <div className="bg-white mt-2 px-4 py-4">
            <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#1a1a2e' }}>Thông tin đăng ký</h3>
            <div className="rounded-xl p-3 mb-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p className="text-xs font-medium" style={{ color: '#059669' }}>
                ✓ Thông tin được tự động điền từ hồ sơ cá nhân
              </p>
            </div>
            {[
              ['MSSV', user.studentId],
              ['Họ và tên', user.name],
              ['Email sinh viên', user.email],
              ['Khoa / Viện', user.faculty],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2.5 border-b last:border-0" style={{ borderColor: '#f8fafc' }}>
                <span className="text-sm" style={{ color: '#94a3b8' }}>{l}</span>
                <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Already registered info */}
        {activeTicket && (
          <div className="bg-white mt-2 px-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#059669' }}>Bạn đã đăng ký sự kiện này</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Mã vé: <span style={{ fontFamily: 'var(--font-mono)' }}>{activeTicket.id}</span></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4"
        style={{ borderColor: '#e2e8f0', paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}>
        <button onClick={handleCTA} disabled={!ctaEnabled || registering}
          className="w-full py-4 rounded-2xl font-display font-bold text-base transition-all"
          style={{ ...ctaStyle, cursor: ctaEnabled ? 'pointer' : 'not-allowed', opacity: registering ? 0.7 : 1 }}>
          {registering ? 'Đang xử lý...' : ctaLabel}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label }: { icon: string; label: string }) {
  const icons: Record<string, React.ReactNode> = {
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" />,
    location: <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />,
    people: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />,
  };
  return (
    <div className="flex items-start gap-3">
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#4f46e5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {icons[icon]}
      </svg>
      <span className="text-sm leading-snug" style={{ color: '#475569' }}>{label}</span>
    </div>
  );
}
