import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { CHART_BAR_DATA, CHART_PIE_DATA, CHART_LINE_DATA } from '@data/mock';
import { OrgLayout } from '../../layouts/OrgLayout';
import { useApp, computeEventStatus } from '../../context/AppContext';

const PIE_COLORS = ['#4f46e5', '#0891b2', '#7c3aed', '#059669', '#d97706'];

interface Props {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

type Preset = 'today' | '7d' | '30d' | 'this_month' | 'this_year' | 'custom';

function getPresetRange(p: Preset): { from: Date; to: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  if (p === 'today') return { from: today, to: tomorrow };
  if (p === '7d') return { from: new Date(today.getTime() - 6 * 86400000), to: tomorrow };
  if (p === '30d') return { from: new Date(today.getTime() - 29 * 86400000), to: tomorrow };
  if (p === 'this_month') return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) };
  if (p === 'this_year') return { from: new Date(now.getFullYear(), 0, 1), to: new Date(now.getFullYear(), 11, 31, 23, 59, 59) };
  return { from: new Date(today.getTime() - 29 * 86400000), to: tomorrow };
}

export default function Dashboard({ onNavigate, onLogout }: Props) {
  const [preset, setPreset] = useState<Preset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const { events, tickets } = useApp();

  const range = preset === 'custom' && customFrom && customTo
    ? { from: new Date(customFrom), to: new Date(customTo + 'T23:59:59') }
    : getPresetRange(preset);

  const rangeTickets = tickets.filter(t => {
    const d = new Date(t.registeredAt);
    return d >= range.from && d <= range.to;
  });

  const openEvents = events.filter(e => computeEventStatus(e) === 'open' || computeEventStatus(e) === 'nearly_full').length;
  const totalRegistrations = rangeTickets.filter(t => t.status !== 'cancelled').length;
  const attendedTickets = rangeTickets.filter(t => t.status === 'attended').length;
  const checkinRate = totalRegistrations > 0 ? Math.round((attendedTickets / totalRegistrations) * 100) : 0;

  const PRESETS: { v: Preset; l: string }[] = [
    { v: 'today', l: 'Hôm nay' },
    { v: '7d', l: '7 ngày' },
    { v: '30d', l: '30 ngày' },
    { v: 'this_month', l: 'Tháng này' },
    { v: 'this_year', l: 'Năm nay' },
    { v: 'custom', l: 'Tùy chỉnh' },
  ];

  return (
    <OrgLayout current="org-dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 lg:p-8 max-w-screen-xl">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4 lg:mb-6 animate-fade-in">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl" style={{ color: '#1a1a2e' }}>
              Tổng quan & Báo cáo
            </h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Theo dõi tình hình tổ chức và tham gia sự kiện
            </p>
          </div>
        </div>

        {/* Date range filter */}
        <div className="glass hover-scale rounded-2xl p-4 shadow-sm border mb-6 lg:mb-8 animate-fade-in" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map(({ v, l }) => (
              <button key={v} onClick={() => setPreset(v)}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                style={{ background: preset === v ? '#4f46e5' : '#f1f5f9', color: preset === v ? 'white' : '#64748b', border: preset === v ? 'none' : '1px solid #e2e8f0' }}>
                {l}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t" style={{ borderColor: '#f1f5f9' }}>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: '#64748b' }}>Từ ngày</label>
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2e8f0' }} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium whitespace-nowrap" style={{ color: '#64748b' }}>Đến ngày</label>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2e8f0' }} />
              </div>
              {customFrom && customTo && (
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                  {new Date(customFrom).toLocaleDateString('vi-VN')} – {new Date(customTo).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          )}
          {preset !== 'custom' && (
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              {range.from.toLocaleDateString('vi-VN')} – {range.to.toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        {/* KPI grid — 4 on desktop, 2×2 on laptop/tablet, 1 col on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 lg:mb-8">
          <KpiCard
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" />}
            label="Sự kiện đang mở" value={openEvents.toString()}
            change="+2 so với tháng trước" changePositive color="#4f46e5" bg="#eef2ff" />
          <KpiCard
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />}
            label="Tổng lượt đăng ký" value={totalRegistrations.toLocaleString('vi-VN')}
            change="+34% so với tháng trước" changePositive color="#0891b2" bg="#ecfeff" />
          <KpiCard
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />}
            label="Tỷ lệ điểm danh" value={`${checkinRate}%`}
            change="+5,2% so với tháng trước" changePositive color="#059669" bg="#ecfdf5" />
          <KpiCard
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />}
            label="Tổng số người tham gia" value="3.741"
            change="+18% so với tháng trước" changePositive color="#7c3aed" bg="#f5f3ff" />
        </div>

        {/* Charts — 2 col on large, 1 col on small */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
          {/* Bar chart — spans 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 lg:p-6 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
            <h2 className="font-display font-semibold text-base mb-1" style={{ color: '#1a1a2e' }}>
              Đăng ký và điểm danh theo sự kiện
            </h2>
            <p className="text-xs mb-5" style={{ color: '#94a3b8' }}>Số lượng sinh viên thực tế</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={CHART_BAR_DATA} barCategoryGap="35%" margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="event" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Inter' }}
                  axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} formatter={v => v === 'registered' ? 'Đăng ký' : 'Đã điểm danh'} />
                <Bar dataKey="registered" name="registered" fill="#4f46e5" radius={[3, 3, 0, 0]} />
                <Bar dataKey="checkin" name="checkin" fill="#0891b2" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart */}
          <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
            <h2 className="font-display font-semibold text-base mb-1" style={{ color: '#1a1a2e' }}>
              Phân bổ sinh viên theo khoa
            </h2>
            <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>% tham gia sự kiện</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={CHART_PIE_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={64}
                  paddingAngle={3} dataKey="value">
                  {CHART_PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }}
                  formatter={v => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-1">
              {CHART_PIE_DATA.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-xs truncate" style={{ color: '#475569', maxWidth: 120 }}>{d.name}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-mono)', color: '#1a1a2e' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line chart — full width */}
        <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
          <h2 className="font-display font-semibold text-base mb-1" style={{ color: '#1a1a2e' }}>
            Xu hướng đăng ký theo thời gian
          </h2>
          <p className="text-xs mb-5" style={{ color: '#94a3b8' }}>Lượt đăng ký theo tháng trong năm học 2025–2026</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CHART_LINE_DATA} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }}
                formatter={v => [`${v} lượt`, 'Đăng ký']} />
              <Line type="monotone" dataKey="registrations" stroke="#4f46e5" strokeWidth={2.5}
                dot={{ fill: '#4f46e5', r: 4, strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 6, fill: '#4f46e5' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </OrgLayout>
  );
}

function KpiCard({ icon, label, value, change, changePositive, color, bg }: {
  icon: React.ReactNode; label: string; value: string; change: string;
  changePositive: boolean; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <svg className="w-5 h-5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {icon}
          </svg>
        </div>
      </div>
      <div className="font-display font-bold text-2xl lg:text-3xl mb-1" style={{ color: '#1a1a2e' }}>{value}</div>
      <div className="text-sm font-medium mb-2 leading-snug" style={{ color: '#475569' }}>{label}</div>
      <div className="text-xs font-medium" style={{ color: changePositive ? '#059669' : '#dc2626' }}>
        {changePositive ? '↑' : '↓'} {change}
      </div>
    </div>
  );
}
