import { useState } from 'react';
import { OrgLayout } from '../../layouts/OrgLayout';
import { useApp, computeEventStatus, EVENT_STATUS_LABELS } from '../../context/AppContext';

interface Props {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const STATUS_MAP = {
  attended: { bg: '#dcfce7', text: '#15803d', label: 'Đã điểm danh' },
  pending: { bg: '#fef9c3', text: '#a16207', label: 'Chưa điểm danh' },
  cancelled: { bg: '#fee2e2', text: '#b91c1c', label: 'Đã hủy' },
};

const PERM_STATUS_MAP = {
  active: { bg: '#dcfce7', text: '#15803d', label: 'Đang hoạt động' },
  suspended: { bg: '#fef9c3', text: '#a16207', label: 'Tạm ngưng' },
  revoked: { bg: '#fee2e2', text: '#b91c1c', label: 'Đã thu hồi' },
  expired: { bg: '#f1f5f9', text: '#94a3b8', label: 'Hết hạn' },
};

export default function Participants({ onNavigate, onLogout }: Props) {
  const { events, tickets, getEventPermissions, grantCheckinPermission, revokePermission, suspendPermission, reactivatePermission } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'participants' | 'checkin' | 'staff'>('participants');

  // Event list view
  if (!selectedEventId) {
    return (
      <OrgLayout current="org-participants" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="p-6 lg:p-8 max-w-screen-xl">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl" style={{ color: '#1a1a2e' }}>Người tham gia</h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Chọn sự kiện để xem danh sách người tham gia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.map(event => {
              const eventTickets = tickets.filter(t => t.eventId === event.id);
              const attended = eventTickets.filter(t => t.status === 'attended').length;
              const total = eventTickets.filter(t => t.status !== 'cancelled').length;
              const status = computeEventStatus(event);

              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden"
                  style={{ borderColor: '#f1f5f9' }}>
                  <div className="relative h-28 overflow-hidden">
                    <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.6))' }} />
                    <div className="absolute bottom-2 left-3 right-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}>
                        {EVENT_STATUS_LABELS[status]}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-sm leading-snug mb-1" style={{ color: '#1a1a2e' }}>
                      {event.title}
                    </h3>
                    <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>
                      {new Date(event.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {event.location}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs" style={{ color: '#64748b' }}>
                        <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#4f46e5' }}>{total}</span> đăng ký
                        {' · '}
                        <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#059669' }}>{attended}</span> điểm danh
                      </div>
                      {total > 0 && (
                        <span className="text-xs font-semibold" style={{ color: '#d97706' }}>
                          {Math.round((attended / total) * 100)}%
                        </span>
                      )}
                    </div>
                    <button onClick={() => { setSelectedEventId(event.id); setActiveTab('participants'); }}
                      className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: '#4f46e5' }}>
                      Xem người tham gia
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </OrgLayout>
    );
  }

  // Participant detail view
  const event = events.find(e => e.id === selectedEventId);
  const allTickets = tickets.filter(t => t.eventId === selectedEventId);
  const participants = allTickets.map(t => ({
    mssv: t.studentId,
    name: t.studentName,
    faculty: t.faculty,
    registeredAt: t.registeredAt,
    status: t.status,
    checkinTime: t.checkinTime ?? '',
  }));
  const eventPerms = getEventPermissions(selectedEventId);

  return (
    <OrgLayout current="org-participants" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 lg:p-8 max-w-screen-xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#94a3b8' }}>
          <button onClick={() => setSelectedEventId(null)} className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Người tham gia
          </button>
          <span>/</span>
          <span className="truncate" style={{ color: '#1a1a2e', maxWidth: 280 }}>{event?.title}</span>
        </div>

        <div className="mb-5">
          <h1 className="font-display font-bold text-xl" style={{ color: '#1a1a2e' }}>
            {event?.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            {event?.date && new Date(event.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {event?.location}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 inline-flex" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
          {([
            ['participants', 'Người tham gia'],
            ['checkin', 'Điểm danh'],
            ['staff', 'Nhân viên điểm danh'],
          ] as const).map(([v, l]) => (
            <button key={v} onClick={() => setActiveTab(v)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{ background: activeTab === v ? '#4f46e5' : 'transparent', color: activeTab === v ? 'white' : '#64748b' }}>
              {l}
            </button>
          ))}
        </div>

        {activeTab === 'participants' && (
          <ParticipantsList participants={participants} allTickets={allTickets} />
        )}
        {activeTab === 'checkin' && (
          <CheckinView participants={participants} />
        )}
        {activeTab === 'staff' && (
          <StaffView
            eventId={selectedEventId}
            eventTitle={event?.title ?? ''}
            permissions={eventPerms}
            onGrant={grantCheckinPermission}
            onRevoke={revokePermission}
            onSuspend={suspendPermission}
            onReactivate={reactivatePermission}
          />
        )}
      </div>
    </OrgLayout>
  );
}

function ParticipantsList({ participants, allTickets }: {
  participants: ReturnType<typeof Array.prototype.map>;
  allTickets: import('@data/mock').Ticket[];
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'attended' | 'cancelled'>('all');
  const [search, setSearch] = useState('');

  const filtered = (participants as Array<{ mssv: string; name: string; faculty: string; registeredAt: string; status: string; checkinTime: string }>)
    .filter(p => (statusFilter === 'all' || p.status === statusFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.mssv.includes(search)));

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          ['Tổng đăng ký', (participants as any[]).length, '#4f46e5', '#eef2ff'],
          ['Đã điểm danh', (participants as any[]).filter((p: any) => p.status === 'attended').length, '#059669', '#dcfce7'],
          ['Chưa điểm danh', (participants as any[]).filter((p: any) => p.status === 'pending').length, '#d97706', '#fef9c3'],
          ['Đã hủy', (participants as any[]).filter((p: any) => p.status === 'cancelled').length, '#dc2626', '#fee2e2'],
        ].map(([label, val, color, bg]) => (
          <div key={label as string} className="bg-white rounded-xl px-4 py-3 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
            <div className="font-display font-bold text-2xl" style={{ color: color as string }}>{val as number}</div>
            <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{label as string}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm MSSV hoặc họ tên..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none bg-white"
            style={{ borderColor: '#e2e8f0' }} />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white overflow-x-auto no-scrollbar" style={{ border: '1px solid #e2e8f0' }}>
          {(['all', 'pending', 'attended', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={{ background: statusFilter === s ? '#4f46e5' : 'transparent', color: statusFilter === s ? 'white' : '#64748b' }}>
              {s === 'all' ? 'Tất cả' : s === 'pending' ? 'Chưa điểm danh' : s === 'attended' ? 'Đã điểm danh' : 'Đã hủy'}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border" style={{ borderColor: '#f1f5f9' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                {['STT', 'MSSV', 'Họ tên', 'Khoa', 'Thời gian đăng ký', 'Trạng thái', 'Điểm danh'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap" style={{ color: '#94a3b8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const ss = STATUS_MAP[p.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending;
                return (
                  <tr key={p.mssv} className="border-b last:border-0 hover:bg-slate-50 transition-colors" style={{ borderColor: '#f8fafc' }}>
                    <td className="px-4 py-3.5 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#475569' }}>{p.mssv}</td>
                    <td className="px-4 py-3.5 font-medium" style={{ color: '#1a1a2e' }}>{p.name}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: '#64748b' }}>{p.faculty}</td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{p.registeredAt}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ background: ss.bg, color: ss.text }}>{ss.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ fontFamily: 'var(--font-mono)', color: p.checkinTime ? '#059669' : '#cbd5e1' }}>
                      {p.checkinTime || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t flex justify-between items-center" style={{ borderColor: '#f1f5f9' }}>
          <span className="text-xs" style={{ color: '#94a3b8' }}>{filtered.length} kết quả</span>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium"
            style={{ borderColor: '#e2e8f0', color: '#475569' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(p => {
          const ss = STATUS_MAP[p.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending;
          return (
            <div key={p.mssv} className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                  style={{ background: '#4f46e5' }}>
                  {p.name.split(' ').slice(-2).map((w: string) => w[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{p.name}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                      style={{ background: ss.bg, color: ss.text }}>{ss.label}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>MSSV: {p.mssv}</p>
                </div>
              </div>
              <div className="text-xs space-y-0.5 ml-12" style={{ color: '#64748b' }}>
                <p>{p.faculty}</p>
                <p>Đăng ký: {p.registeredAt}</p>
                {p.checkinTime && <p style={{ color: '#059669' }}>Điểm danh: {p.checkinTime}</p>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: '#94a3b8' }}>Không có kết quả</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckinView({ participants }: { participants: any[] }) {
  const attended = participants.filter(p => p.status === 'attended');
  const pending = participants.filter(p => p.status === 'pending');

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          ['Đã điểm danh', attended.length, '#059669', '#dcfce7'],
          ['Chưa điểm danh', pending.length, '#d97706', '#fef9c3'],
          ['Tỷ lệ', participants.length > 0 ? `${Math.round((attended.length / participants.length) * 100)}%` : '0%', '#4f46e5', '#eef2ff'],
        ].map(([l, v, c, bg]) => (
          <div key={l as string} className="bg-white rounded-xl px-4 py-3 shadow-sm border text-center" style={{ borderColor: '#f1f5f9' }}>
            <div className="font-display font-bold text-2xl" style={{ color: c as string }}>{v}</div>
            <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{l}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#f1f5f9' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: '#f1f5f9' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>Danh sách đã điểm danh ({attended.length})</h3>
        </div>
        {attended.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>Chưa có ai điểm danh</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['MSSV', 'Họ tên', 'Thời gian điểm danh'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attended.map(p => (
                  <tr key={p.mssv} className="border-t hover:bg-slate-50" style={{ borderColor: '#f8fafc' }}>
                    <td className="px-4 py-3 text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#475569' }}>{p.mssv}</td>
                    <td className="px-4 py-3 font-medium text-sm" style={{ color: '#1a1a2e' }}>{p.name}</td>
                    <td className="px-4 py-3 text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#059669' }}>{p.checkinTime || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StaffView({ eventId, eventTitle, permissions, onGrant, onRevoke, onSuspend, onReactivate }: {
  eventId: string;
  eventTitle: string;
  permissions: import('../../context/AppContext').CheckInPermission[];
  onGrant: (studentId: string, studentName: string, eventId: string, validFrom?: string, validUntil?: string) => import('../../context/AppContext').GrantPermissionResult;
  onRevoke: (id: string) => import('../../context/AppContext').RevokePermissionResult;
  onSuspend: (id: string) => import('../../context/AppContext').RevokePermissionResult;
  onReactivate: (id: string) => import('../../context/AppContext').RevokePermissionResult;
}) {
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [searchStudent, setSearchStudent] = useState('');
  const [draftStudentId, setDraftStudentId] = useState('');
  const [draftStudentName, setDraftStudentName] = useState('');
  const [draftValidFrom, setDraftValidFrom] = useState('');
  const [draftValidUntil, setDraftValidUntil] = useState('');
  const [grantError, setGrantError] = useState('');
  const [grantSuccess, setGrantSuccess] = useState('');

  function handleGrant() {
    if (!draftStudentId.trim() || !draftStudentName.trim()) {
      setGrantError('Vui lòng điền MSSV và họ tên.');
      return;
    }
    const result = onGrant(draftStudentId.trim(), draftStudentName.trim(), eventId, draftValidFrom || undefined, draftValidUntil || undefined);
    if (result.success) {
      setGrantSuccess(`Đã cấp quyền điểm danh cho ${draftStudentName}.`);
      setDraftStudentId(''); setDraftStudentName(''); setDraftValidFrom(''); setDraftValidUntil('');
      setGrantError('');
      setTimeout(() => { setGrantSuccess(''); setShowGrantModal(false); }, 2000);
    } else {
      setGrantError(result.error ?? 'Lỗi không xác định.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-base" style={{ color: '#1a1a2e' }}>Nhân viên điểm danh</h3>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Sinh viên được cấp quyền điểm danh cho sự kiện này</p>
        </div>
        <button onClick={() => { setShowGrantModal(true); setGrantError(''); setGrantSuccess(''); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#4f46e5' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Cấp quyền
        </button>
      </div>

      {permissions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border" style={{ borderColor: '#f1f5f9' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#f1f5f9' }}>
            <svg className="w-6 h-6" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <p className="font-medium" style={{ color: '#94a3b8' }}>Chưa có nhân viên điểm danh</p>
          <p className="text-sm mt-1" style={{ color: '#cbd5e1' }}>Nhấn "+ Cấp quyền" để thêm sinh viên</p>
        </div>
      ) : (
        <div className="space-y-3">
          {permissions.map(perm => {
            const ps = PERM_STATUS_MAP[perm.status];
            return (
              <div key={perm.id} className="bg-white rounded-2xl p-4 border shadow-sm" style={{ borderColor: '#f1f5f9' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                      style={{ background: perm.status === 'active' ? '#4f46e5' : '#94a3b8' }}>
                      {perm.studentName.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{perm.studentName}</p>
                      <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>MSSV: {perm.studentId}</p>
                      {perm.validFrom && (
                        <p className="text-xs" style={{ color: '#64748b' }}>Từ {perm.validFrom}{perm.validUntil ? ` đến ${perm.validUntil}` : ''}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: ps.bg, color: ps.text }}>{ps.label}</span>
                    <div className="flex gap-1">
                      {perm.status === 'active' && (
                        <button onClick={() => onSuspend(perm.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: '#fef9c3', color: '#a16207' }}>
                          Tạm ngưng
                        </button>
                      )}
                      {perm.status === 'suspended' && (
                        <button onClick={() => onReactivate(perm.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: '#dcfce7', color: '#15803d' }}>
                          Kích hoạt
                        </button>
                      )}
                      {perm.status !== 'revoked' && (
                        <button onClick={() => setConfirmRevoke(perm.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: '#fee2e2', color: '#b91c1c' }}>
                          Thu hồi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grant permission modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-display font-bold text-lg mb-1" style={{ color: '#1a1a2e' }}>Cấp quyền điểm danh</h3>
            <p className="text-sm mb-5" style={{ color: '#64748b' }}>Sự kiện: <span className="font-medium" style={{ color: '#1a1a2e' }}>{eventTitle}</span></p>

            {grantSuccess ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#dcfce7' }}>
                  <svg className="w-6 h-6" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: '#059669' }}>{grantSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#475569' }}>MSSV sinh viên</label>
                  <input value={draftStudentId} onChange={e => setDraftStudentId(e.target.value)}
                    placeholder="VD: 22521001"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: '#e2e8f0', fontFamily: 'var(--font-mono)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#475569' }}>Họ và tên</label>
                  <input value={draftStudentName} onChange={e => setDraftStudentName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: '#e2e8f0' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#475569' }}>Từ ngày (tùy chọn)</label>
                    <input type="datetime-local" value={draftValidFrom} onChange={e => setDraftValidFrom(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                      style={{ borderColor: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#475569' }}>Đến ngày (tùy chọn)</label>
                    <input type="datetime-local" value={draftValidUntil} onChange={e => setDraftValidUntil(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                      style={{ borderColor: '#e2e8f0' }} />
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <p className="text-xs" style={{ color: '#15803d' }}>
                    ☑ Được phép điểm danh người tham gia sự kiện
                  </p>
                </div>
                {grantError && (
                  <div className="rounded-xl p-3" style={{ background: '#fee2e2' }}>
                    <p className="text-xs" style={{ color: '#b91c1c' }}>{grantError}</p>
                  </div>
                )}
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setShowGrantModal(false)}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                    style={{ borderColor: '#e2e8f0', color: '#475569' }}>
                    Hủy
                  </button>
                  <button onClick={handleGrant}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                    style={{ background: '#4f46e5' }}>
                    Cấp quyền
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revoke confirmation */}
      {confirmRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#fee2e2' }}>
              <svg className="w-6 h-6" style={{ color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-lg text-center mb-2" style={{ color: '#1a1a2e' }}>Thu hồi quyền điểm danh?</h3>
            <p className="text-sm text-center mb-6" style={{ color: '#64748b' }}>
              Sinh viên sẽ ngay lập tức mất quyền điểm danh cho sự kiện này.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRevoke(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                style={{ borderColor: '#e2e8f0', color: '#475569' }}>
                Hủy
              </button>
              <button onClick={() => { onRevoke(confirmRevoke); setConfirmRevoke(null); }}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ background: '#dc2626' }}>
                Thu hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
