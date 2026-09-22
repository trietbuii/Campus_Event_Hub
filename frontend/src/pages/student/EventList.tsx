import { useState } from 'react';
import { TOPIC_LABELS } from '../../types';
import type { Topic, EventStatus } from '../../types';
import { getNotifIcon, type Notification } from '@data/notifications';
import { useUser } from '../../context/UserContext';
import { useApp, computeEventStatus, EVENT_STATUS_LABELS, type LiveEvent } from '../../context/AppContext';

export { TOPIC_LABELS };

interface Props {
  onSelectEvent: (eventId: string) => void;
  onNavigate: (screen: string) => void;
}

const STATUS_COLORS: Record<EventStatus, { bg: string; text: string }> = {
  open: { bg: '#dcfce7', text: '#15803d' },
  nearly_full: { bg: '#fef9c3', text: '#a16207' },
  full: { bg: '#fee2e2', text: '#b91c1c' },
  draft: { bg: '#f1f5f9', text: '#64748b' },
  closed: { bg: '#e0e7ff', text: '#4338ca' },
  ended: { bg: '#f1f5f9', text: '#94a3b8' },
};

const TOPIC_COLORS: Record<Topic, string> = {
  academic: '#4f46e5',
  skill: '#0891b2',
  culture: '#7c3aed',
  sport: '#059669',
  community: '#d97706',
};

export default function EventList({ onSelectEvent, onNavigate }: Props) {
  const { user } = useUser();
  const { events, notifications, getUserActiveTicket, computeStatus, markNotificationRead, markAllRead } = useApp();
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState<Topic | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = events.filter(e => {
    const status = computeStatus(e);
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.speaker.toLowerCase().includes(search.toLowerCase());
    const matchTopic = topic === 'all' || e.topic === topic;
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    const matchDate = !dateFilter || e.date === dateFilter;
    const matchLocation = !locationFilter || e.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchSearch && matchTopic && matchStatus && matchDate && matchLocation;
  });

  function handleNotifClick(notif: Notification) {
    markNotificationRead(notif.id);
    setShowNotifPanel(false);
    if (notif.action === 'tickets') onNavigate('tickets');
    else if (notif.action === 'ticket-confirm') onNavigate('tickets');
    else if (notif.action === 'event-detail' && notif.eventId) onSelectEvent(notif.eventId);
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f4f5f9' }}>
      {/* Top Safe Area */}
      <div className="w-full shrink-0" style={{ height: 'max(88px, env(safe-area-inset-top, 88px))', background: 'white' }} />

      {/* Sticky header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-4 pt-3 pb-3">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                Xin chào, {user.displayName} 👋
              </p>
              <h1 className="font-display font-bold text-xl" style={{ color: '#1a1a2e' }}>Khám phá sự kiện</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <button
                className="relative flex items-center justify-center rounded-full"
                style={{ minWidth: 44, minHeight: 44, background: '#f8fafc' }}
                onClick={() => setShowNotifPanel(true)}>
                <svg className="w-5 h-5" style={{ color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex items-center justify-center rounded-full font-bold text-white"
                    style={{ width: unreadCount > 9 ? 18 : 16, height: 16, fontSize: 10, background: '#dc2626', lineHeight: 1 }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {/* Avatar → Profile */}
              <button onClick={() => onNavigate('profile')}
                className="flex items-center justify-center rounded-full font-display font-bold text-white text-xs overflow-hidden"
                style={{ minWidth: 44, minHeight: 44, background: '#4f46e5' }}>
                {user.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : user.initials}
              </button>
            </div>
          </div>

          {/* Search + filter */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm sự kiện, diễn giả..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2e8f0', background: '#f8fafc' }} />
            </div>
            <button onClick={() => setShowFilterSheet(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium flex-shrink-0"
              style={{ borderColor: '#e2e8f0', background: 'white', color: '#475569' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
              </svg>
              Bộ lọc
            </button>
          </div>

          {/* Topic chips — true horizontal scroll */}
          <div className="relative">
            <div className="flex gap-2 pb-1 no-scrollbar" style={{ overflowX: 'auto', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
              <Chip label="Tất cả" active={topic === 'all'} onClick={() => setTopic('all')} color="#4f46e5" />
              {(Object.keys(TOPIC_LABELS) as Topic[]).map(t => (
                <Chip key={t} label={TOPIC_LABELS[t]} active={topic === t}
                  onClick={() => setTopic(topic === t ? 'all' : t)} color={TOPIC_COLORS[t]} />
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-1 w-6 pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, white)' }} />
          </div>

          {/* Status chips */}
          <div className="relative mt-2">
            <div className="flex gap-2 pb-1 no-scrollbar" style={{ overflowX: 'auto', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
              {(['open', 'nearly_full', 'full'] as EventStatus[]).map(s => (
                <Chip key={s} label={EVENT_STATUS_LABELS[s]} active={statusFilter === s}
                  onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                  color={s === 'open' ? '#059669' : s === 'nearly_full' ? '#d97706' : '#dc2626'} />
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-1 w-6 pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, white)' }} />
          </div>
        </div>
      </div>

      {/* Event grid */}
      <div className="flex-1 px-4 py-4" style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
        <p className="text-xs font-medium mb-3" style={{ color: '#94a3b8' }}>{filtered.length} sự kiện</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(event => (
            <EventCard key={event.id} event={event}
              isRegistered={!!getUserActiveTicket(event.id, user.studentId)}
              onSelect={() => onSelectEvent(event.id)} />
          ))}
        </div>
      </div>

      {/* Filter bottom sheet */}
      {showFilterSheet && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowFilterSheet(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-5 shadow-2xl"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#e2e8f0' }} />
            <h3 className="font-display font-bold text-lg mb-5" style={{ color: '#1a1a2e' }}>Bộ lọc sự kiện</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: '#475569' }}>Chủ đề</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setTopic('all')} className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: topic === 'all' ? '#4f46e5' : '#f1f5f9', color: topic === 'all' ? 'white' : '#64748b' }}>
                    Tất cả
                  </button>
                  {(Object.keys(TOPIC_LABELS) as Topic[]).map(t => (
                    <button key={t} onClick={() => setTopic(topic === t ? 'all' : t)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ background: topic === t ? TOPIC_COLORS[t] : '#f1f5f9', color: topic === t ? 'white' : '#64748b' }}>
                      {TOPIC_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: '#475569' }}>Trạng thái</p>
                <div className="flex flex-wrap gap-2">
                  {(['open', 'nearly_full', 'full'] as EventStatus[]).map(s => (
                    <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ background: statusFilter === s ? '#4f46e5' : '#f1f5f9', color: statusFilter === s ? 'white' : '#64748b' }}>
                      {EVENT_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: '#475569' }}>Ngày tổ chức</p>
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#e2e8f0' }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: '#475569' }}>Địa điểm</p>
                <input type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                  placeholder="Nhập địa điểm..."
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#e2e8f0' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setTopic('all'); setStatusFilter('all'); setDateFilter(''); setLocationFilter(''); setShowFilterSheet(false); }}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                style={{ borderColor: '#e2e8f0', color: '#475569' }}>
                Xóa bộ lọc
              </button>
              <button onClick={() => setShowFilterSheet(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ background: '#4f46e5' }}>
                Áp dụng
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notification panel */}
      {showNotifPanel && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setShowNotifPanel(false)} />
          <div className="fixed z-50 bg-white shadow-2xl overflow-hidden
            bottom-0 left-0 right-0 rounded-t-3xl
            md:bottom-auto md:top-20 md:right-4 md:left-auto md:w-96 md:rounded-2xl"
            style={{ maxHeight: '80vh' }}>
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#f1f5f9' }}>
              <h3 className="font-display font-bold text-base" style={{ color: '#1a1a2e' }}>Thông báo</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-medium" style={{ color: '#4f46e5' }}>
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
                <button onClick={() => setShowNotifPanel(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                  <svg className="w-4 h-4" style={{ color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
              {notifications.some(n => !n.read) && (
                <>
                  <p className="px-5 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8', background: '#f8fafc' }}>Mới</p>
                  {notifications.filter(n => !n.read).map(n => (
                    <NotifItem key={n.id} notif={n} onClick={() => handleNotifClick(n)} />
                  ))}
                </>
              )}
              {notifications.some(n => n.read) && (
                <>
                  <p className="px-5 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8', background: '#f8fafc' }}>Trước đó</p>
                  {notifications.filter(n => n.read).map(n => (
                    <NotifItem key={n.id} notif={n} onClick={() => handleNotifClick(n)} />
                  ))}
                </>
              )}
              <div className="md:hidden" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
            </div>
          </div>
        </>
      )}

      <BottomNav current="explore" onNavigate={onNavigate} />
    </div>
  );
}

function EventCard({ event, isRegistered, onSelect }: { event: LiveEvent; isRegistered: boolean; onSelect: () => void }) {
  const status = computeEventStatus(event);
  const sc = STATUS_COLORS[status] ?? STATUS_COLORS.open;
  const pct = Math.round((event.registered / event.capacity) * 100);

  return (
    <button onClick={onSelect}
      className="bg-white rounded-2xl overflow-hidden shadow-sm text-left transition-all hover:shadow-md active:scale-[0.99] border"
      style={{ borderColor: '#f1f5f9' }}>
      <div className="relative" style={{ height: 160 }}>
        <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: TOPIC_COLORS[event.topic] }}>
            {TOPIC_LABELS[event.topic]}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: sc.bg, color: sc.text }}>
            {EVENT_STATUS_LABELS[status]}
          </span>
        </div>
        {isRegistered && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: 'rgba(5,150,105,0.9)', backdropFilter: 'blur(4px)' }}>
              ✓ Đã đăng ký
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-sm leading-snug mb-1.5" style={{ color: '#1a1a2e' }}>
          {event.title}
        </h3>
        <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>{event.speaker}</p>
        <div className="flex items-center gap-1 text-xs mb-0.5" style={{ color: '#64748b' }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" />
          </svg>
          <span>{new Date(event.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {event.time}</span>
        </div>
        <div className="flex items-center gap-1 text-xs mb-3" style={{ color: '#64748b' }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span className="truncate">{event.location}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              {event.registered} / {event.capacity} chỗ đã đăng ký
            </span>
            <span style={{ color: pct >= 90 ? '#dc2626' : pct >= 70 ? '#d97706' : '#059669' }}>
              {event.capacity - event.registered} còn lại
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
            <div className="h-full rounded-full"
              style={{ width: `${pct}%`, background: pct >= 90 ? '#dc2626' : pct >= 70 ? '#f59e0b' : '#4f46e5' }} />
          </div>
        </div>
        <div className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-center"
          style={{
            background: isRegistered ? '#dcfce7' : status === 'full' ? '#f1f5f9' : '#eef2ff',
            color: isRegistered ? '#15803d' : status === 'full' ? '#94a3b8' : '#4f46e5',
          }}>
          {isRegistered ? 'Xem vé' : status === 'full' ? 'Hết chỗ' : 'Xem chi tiết'}
        </div>
      </div>
    </button>
  );
}

function NotifItem({ notif, onClick }: { notif: Notification; onClick: () => void }) {
  const icon = getNotifIcon(notif.type);
  return (
    <button onClick={onClick}
      className="w-full text-left flex items-start gap-3 px-5 py-4 border-b transition-colors hover:bg-slate-50"
      style={{ borderColor: '#f8fafc', background: notif.read ? 'transparent' : '#fafbff' }}>
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
        style={{ background: icon.bg }}>
        <svg className="w-4 h-4" style={{ color: icon.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm leading-snug" style={{ color: '#1a1a2e', fontWeight: notif.read ? 500 : 700 }}>
            {notif.title}
          </p>
          {!notif.read && <div className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ background: '#4f46e5' }} />}
        </div>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#64748b' }}>{notif.description}</p>
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{notif.time}</p>
      </div>
    </button>
  );
}

function Chip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick}
      className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={{ background: active ? color : '#f1f5f9', color: active ? 'white' : '#64748b', whiteSpace: 'nowrap' }}>
      {label}
    </button>
  );
}

export function BottomNav({ current, onNavigate }: { current: string; onNavigate: (s: string) => void }) {
  const { user } = useUser();
  const { getStudentPermissions } = useApp();
  const hasCheckin = getStudentPermissions(user.studentId).length > 0;

  const items = [
    { id: 'explore', label: 'Trang chủ', icon: <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
    { id: 'tickets', label: 'Vé của tôi', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" /> },
    ...(hasCheckin ? [{
      id: 'checkin', label: 'Điểm danh',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5ZM6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />,
    }] : []),
    { id: 'profile', label: 'Hồ sơ', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /> },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-30"
      style={{ borderColor: '#e2e8f0', paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex" style={{ minHeight: 56 }}>
        {items.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            style={{ color: current === item.id ? '#4f46e5' : '#94a3b8', minHeight: 44 }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={current === item.id ? 2.5 : 1.5}>
              {item.icon}
            </svg>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
