import { useState } from 'react';
import type { Ticket } from '../../types';
import { BottomNav } from './EventList';
import { useApp } from '../../context/AppContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../components/Toast';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#eef2ff', text: '#4338ca', label: 'Chưa check-in' },
  attended: { bg: '#dcfce7', text: '#15803d', label: 'Đã tham dự' },
  cancelled: { bg: '#fee2e2', text: '#b91c1c', label: 'Đã hủy' },
};

interface Props {
  onNavigate: (screen: string) => void;
  onSelectEvent: (eventId: string) => void;
}

export default function MyTickets({ onNavigate, onSelectEvent }: Props) {
  const { tickets, cancelTicket } = useApp();
  const { user } = useUser();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const [showQR, setShowQR] = useState<Ticket | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<Ticket | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const myTickets = tickets.filter(t => t.studentId === user.studentId);
  const upcoming = myTickets.filter(t => t.status === 'pending');
  const history = myTickets.filter(t => t.status !== 'pending');
  const list = tab === 'upcoming' ? upcoming : history;

  async function handleCancel() {
    if (!showCancelModal || cancelling) return;
    setCancelling(true);
    
    // Simulate delay for realism
    await new Promise(res => setTimeout(res, 500));
    
    const result = cancelTicket(showCancelModal.id);
    if (result.success) {
      showToast('Đã hủy vé thành công', 'success');
    } else {
      showToast(result.error ?? 'Hủy vé thất bại', 'error');
    }
    
    setCancelling(false);
    setShowCancelModal(null);
  }

  return (
    <div className="flex flex-col min-h-screen animate-fade-in" style={{ background: '#f4f5f9' }}>
      {/* Top Safe Area */}
      <div className="w-full shrink-0" style={{ height: 'max(88px, env(safe-area-inset-top, 88px))', background: 'white' }} />

      {/* Header */}
      <div className="bg-white px-4 pb-0 shadow-sm glass">
        <div>
          <h1 className="font-display font-bold text-xl mb-4" style={{ color: '#1a1a2e' }}>Vé của tôi</h1>
          <div className="flex border-b" style={{ borderColor: '#f1f5f9' }}>
            {(['upcoming', 'history'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors"
                style={{ borderColor: tab === t ? '#4f46e5' : 'transparent', color: tab === t ? '#4f46e5' : '#94a3b8' }}>
                {t === 'upcoming' ? `Sắp diễn ra (${upcoming.length})` : `Lịch sử (${history.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-4 space-y-4" style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
        {list.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f1f5f9' }}>
              <svg className="w-8 h-8" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: '#94a3b8' }}>Chưa có vé nào</p>
          </div>
        ) : (
          list.map(ticket => {
            const ss = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.pending;
            return (
              <div key={(ticket as any)._id || ticket.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover-scale glass">
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <button className="font-display font-semibold text-sm leading-snug flex-1 text-left hover:underline"
                      style={{ color: '#1a1a2e' }}
                      onClick={() => onSelectEvent(ticket.eventId)}>
                      {ticket.eventTitle}
                    </button>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                      style={{ background: ss.bg, color: ss.text }}>{ss.label}</span>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <p className="text-xs" style={{ color: '#64748b' }}>
                      📅 {new Date(ticket.eventDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {ticket.eventTime}
                    </p>
                    <p className="text-xs" style={{ color: '#64748b' }}>📍 {ticket.eventLocation}</p>
                    {ticket.checkinTime && (
                      <p className="text-xs" style={{ color: '#059669' }}>✓ Check-in lúc {ticket.checkinTime}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {ticket.status === 'pending' && (
                      <>
                        <button onClick={() => setShowQR(ticket)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: '#4f46e5', color: 'white' }}>
                          Hiện mã QR
                        </button>
                        <button onClick={() => setShowCancelModal(ticket)}
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: '#fee2e2', color: '#b91c1c' }}>
                          Hủy vé
                        </button>
                      </>
                    )}
                    {ticket.status === 'attended' && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#f0fdf4' }}>
                        <svg className="w-4 h-4" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span className="text-xs font-semibold" style={{ color: '#059669' }}>Đã tham dự</span>
                      </div>
                    )}
                    {ticket.status === 'cancelled' && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#fff7f7' }}>
                        <span className="text-xs font-semibold" style={{ color: '#b91c1c' }}>Vé đã bị hủy</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Ticket ID footer */}
                <div className="px-4 py-2 border-t flex justify-between" style={{ borderColor: '#f8fafc', background: '#fafafa' }}>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>Mã vé</span>
                  <span className="text-xs font-medium" style={{ color: '#1a1a2e', fontFamily: 'var(--font-mono)' }}>{ticket.id}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#e2e8f0' }} />
            <h2 className="font-display font-bold text-lg text-center mb-1" style={{ color: '#1a1a2e' }}>Mã QR của bạn</h2>
            <p className="text-xs text-center mb-6" style={{ color: '#94a3b8' }}>{showQR.eventTitle}</p>
            <div className="flex justify-center mb-4">
              <div className="w-56 h-56 rounded-2xl flex items-center justify-center" style={{ background: '#f8fafc', border: '2px solid #e2e8f0' }}>
                <MiniQR seed={hashCode(showQR.id)} />
              </div>
            </div>
            <p className="text-center text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-mono)', color: '#1a1a2e' }}>
              {showQR.id}
            </p>
            <p className="text-xs text-center mb-6" style={{ color: '#94a3b8' }}>Xuất trình mã này khi check-in</p>
            <button onClick={() => setShowQR(null)}
              className="w-full py-3 rounded-2xl text-sm font-semibold"
              style={{ background: '#f1f5f9', color: '#475569' }}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fee2e2' }}>
              <svg className="w-6 h-6" style={{ color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-lg text-center mb-2" style={{ color: '#1a1a2e' }}>Xác nhận hủy vé</h3>
            <p className="text-sm text-center mb-1" style={{ color: '#1a1a2e', fontWeight: 600 }}>{showCancelModal.eventTitle}</p>
            <p className="text-sm text-center mb-6" style={{ color: '#64748b' }}>
              Bạn có chắc chắn muốn hủy? Slot này sẽ được nhường lại cho sinh viên khác.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(null)} disabled={cancelling}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: '#f1f5f9', color: '#475569' }}>
                Giữ vé
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ background: '#dc2626', opacity: cancelling ? 0.7 : 1 }}>
                {cancelling ? 'Đang hủy...' : 'Hủy vé'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav current="tickets" onNavigate={onNavigate} />
    </div>
  );
}

function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function MiniQR({ seed }: { seed: number }) {
  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      {[[0, 0], [126, 0], [0, 126]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x + 2} y={y + 2} width={52} height={52} fill="none" stroke="#1a1a2e" strokeWidth={6} rx={4} />
          <rect x={x + 16} y={y + 16} width={24} height={24} fill="#1a1a2e" rx={2} />
        </g>
      ))}
      {Array.from({ length: 200 }, (_, i) => {
        const v = Math.sin(seed + i * 7.3 + 1);
        if (v * 0.5 + 0.5 < 0.45) return null;
        const col = (i % 16) * 10 + 20;
        const row = Math.floor(i / 16) * 10 + 20;
        if (col < 70 && (row < 70 || row > 110)) return null;
        if (col > 110 && row < 70) return null;
        return <rect key={i} x={col} y={row} width={8} height={8} fill="#1a1a2e" rx={1} />;
      })}
    </svg>
  );
}
