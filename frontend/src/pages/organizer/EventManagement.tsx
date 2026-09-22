import { useState } from 'react';
import { EVENTS } from '@data/mock';
import { STATUS_LABELS, TOPIC_LABELS } from '../../types';
import type { EventStatus, Topic } from '../../types';
import { OrgLayout } from '../../layouts/OrgLayout';

const STATUS_COLORS: Record<EventStatus, { bg: string; text: string }> = {
  open: { bg: '#dcfce7', text: '#15803d' },
  nearly_full: { bg: '#fef9c3', text: '#a16207' },
  full: { bg: '#fee2e2', text: '#b91c1c' },
  draft: { bg: '#f1f5f9', text: '#64748b' },
  closed: { bg: '#e0e7ff', text: '#4338ca' },
  ended: { bg: '#f1f5f9', text: '#94a3b8' },
};

interface Props {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function EventsManage({ onNavigate, onLogout }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = EVENTS.filter(e =>
    (statusFilter === 'all' || e.status === statusFilter) &&
    (e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase()))
  );

  const statusTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'draft', label: 'Bản nháp' },
    { id: 'open', label: 'Đang mở' },
    { id: 'nearly_full', label: 'Sắp hết' },
    { id: 'closed', label: 'Đã đóng' },
    { id: 'ended', label: 'Đã kết thúc' },
  ];

  return (
    <OrgLayout current="org-events" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 lg:p-8 max-w-screen-xl">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl" style={{ color: '#1a1a2e' }}>Quản lý sự kiện</h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>{EVENTS.length} sự kiện trong hệ thống</p>
          </div>
          <button onClick={() => onNavigate('org-event-form')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white whitespace-nowrap"
            style={{ background: '#4f46e5' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tạo sự kiện mới
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên sự kiện..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none bg-white"
              style={{ borderColor: '#e2e8f0' }} />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium bg-white"
              style={{ borderColor: '#e2e8f0', color: '#475569' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" />
              </svg>
              Lọc theo ngày
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium bg-white"
              style={{ borderColor: '#e2e8f0', color: '#475569' }}>
              Lọc theo chủ đề
            </button>
          </div>
        </div>

        {/* Status filter chips — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
          {statusTabs.map(t => (
            <button key={t.id} onClick={() => setStatusFilter(t.id)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: statusFilter === t.id ? '#4f46e5' : 'white',
                color: statusFilter === t.id ? 'white' : '#64748b',
                border: `1px solid ${statusFilter === t.id ? '#4f46e5' : '#e2e8f0'}`,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border" style={{ borderColor: '#f1f5f9' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                  {['Tên sự kiện', 'Ngày tổ chức', 'Địa điểm', 'Sức chứa', 'Đã đăng ký', 'Tỷ lệ', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
                      style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(event => {
                  const sc = STATUS_COLORS[event.status as EventStatus];
                  const pct = Math.round((event.registered / event.capacity) * 100);
                  return (
                    <tr key={event.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                      style={{ borderColor: '#f8fafc' }}>
                      <td className="px-4 py-4">
                        <div className="font-medium leading-snug" style={{ color: '#1a1a2e', maxWidth: 240 }}>{event.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{TOPIC_LABELS[event.topic as Topic]}</div>
                      </td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap" style={{ color: '#475569', fontFamily: 'var(--font-mono)' }}>
                        {new Date(event.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 text-xs" style={{ color: '#475569', maxWidth: 140 }}>{event.room}</td>
                      <td className="px-4 py-4 text-xs text-center font-mono" style={{ fontFamily: 'var(--font-mono)', color: '#475569' }}>{event.capacity}</td>
                      <td className="px-4 py-4 text-xs text-center font-mono" style={{ fontFamily: 'var(--font-mono)', color: '#475569' }}>{event.registered}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? '#dc2626' : '#4f46e5' }} />
                          </div>
                          <span className="text-xs font-mono" style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                          style={{ background: sc.bg, color: sc.text }}>
                          {STATUS_LABELS[event.status as EventStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <ActionBtn title="Xem" onClick={() => onNavigate('org-participants')}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          </ActionBtn>
                          <ActionBtn title="Chỉnh sửa" onClick={() => onNavigate('org-event-form')}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                          </ActionBtn>
                          <ActionBtn title="Người tham gia" onClick={() => onNavigate('org-participants')}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map(event => {
            const sc = STATUS_COLORS[event.status as EventStatus];
            const pct = Math.round((event.registered / event.capacity) * 100);
            return (
              <div key={event.id} className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-sm leading-snug" style={{ color: '#1a1a2e' }}>{event.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{TOPIC_LABELS[event.topic as Topic]}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{ background: sc.bg, color: sc.text }}>
                    {STATUS_LABELS[event.status as EventStatus]}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs mb-3" style={{ color: '#64748b' }}>
                  <p>📅 {new Date(event.date).toLocaleDateString('vi-VN')} · {event.room}</p>
                  <p>👥 {event.registered}/{event.capacity} chỗ ({pct}%)</p>
                </div>
                <div className="h-1.5 rounded-full mb-3" style={{ background: '#f1f5f9' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? '#dc2626' : '#4f46e5' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onNavigate('org-participants')}
                    className="flex-1 py-2 rounded-xl text-xs font-medium border"
                    style={{ borderColor: '#e2e8f0', color: '#475569', background: 'white' }}>
                    Người tham gia
                  </button>
                  <button onClick={() => onNavigate('org-event-form')}
                    className="flex-1 py-2 rounded-xl text-xs font-medium"
                    style={{ background: '#eef2ff', color: '#4f46e5' }}>
                    Chỉnh sửa
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

function ActionBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} title={title}
      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
      <svg className="w-4 h-4" style={{ color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {children}
      </svg>
    </button>
  );
}
