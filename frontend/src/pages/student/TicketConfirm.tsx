import type { Ticket } from '../../types';

interface Props {
  ticket: Ticket;
  onViewTickets: () => void;
  onGoHome: () => void;
}

export default function TicketConfirm({ ticket, onViewTickets, onGoHome }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center animate-fade-in" style={{ background: '#f4f5f9' }}>
      {/* Top Safe Area */}
      <div className="w-full shrink-0" style={{ height: 'max(88px, env(safe-area-inset-top, 88px))', background: '#f4f5f9' }} />

      <div className="flex flex-col items-center px-4 py-8 w-full">
        {/* Success icon */}
        <div className="mt-8 mb-6 hover-scale">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
          style={{ background: '#dcfce7' }}>
          <svg className="w-10 h-10" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-2xl text-center" style={{ color: '#1a1a2e' }}>
          Đăng ký giữ chỗ thành công!
        </h1>
        <p className="text-center text-sm mt-2" style={{ color: '#64748b' }}>
          Mã vé đã được tạo và lưu vào hồ sơ của bạn
        </p>
      </div>

      {/* Ticket card */}
      <div className="w-full max-w-sm glass rounded-3xl overflow-hidden hover-scale">
        {/* Top band */}
        <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#c7d2fe' }}>SỰ KIỆN</p>
          <h2 className="text-white font-display font-bold text-base leading-tight">{ticket.eventTitle}</h2>
        </div>

        {/* Ticket details */}
        <div className="px-6 py-4 space-y-3">
          <TicketRow emoji="📅" label="Thời gian"
            value={`${new Date(ticket.eventDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} · ${ticket.eventTime}`} />
          <TicketRow emoji="📍" label="Địa điểm" value={ticket.eventLocation} />
          <TicketRow emoji="👤" label="Sinh viên" value={`${ticket.studentName} · ${ticket.studentId}`} />
          <TicketRow emoji="🏛️" label="Khoa" value={ticket.faculty} />
        </div>

        {/* Dashed separator */}
        <div className="flex items-center px-6">
          <div className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
          <div className="w-4 h-4 rounded-full mx-2 flex-shrink-0" style={{ background: '#f4f5f9' }} />
          <div className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
        </div>

        {/* QR code section */}
        <div className="px-6 py-6 flex flex-col items-center">
          <div className="w-48 h-48 rounded-2xl flex items-center justify-center mb-3 bg-white shadow-sm"
            style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
            <QRPattern seed={hashCode(ticket.id)} />
          </div>
          <p className="font-mono text-sm font-bold tracking-wider" style={{ color: '#1a1a2e', fontFamily: 'var(--font-mono)' }}>
            {ticket.id}
          </p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Xuất trình mã này khi check-in</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm space-y-3 mt-8">
        <button onClick={onViewTickets}
          className="btn-primary w-full py-3.5 rounded-2xl font-semibold text-sm">
          Xem trong Vé của tôi
        </button>
        <button onClick={onGoHome}
          className="w-full py-3 text-sm font-medium hover-scale"
          style={{ color: '#64748b' }}>
          Quay về trang chủ
        </button>
      </div>
      </div>
    </div>
  );
}

function TicketRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base">{emoji}</span>
      <div>
        <p className="text-xs" style={{ color: '#94a3b8' }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{value}</p>
      </div>
    </div>
  );
}

function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function QRPattern({ seed }: { seed: number }) {
  const size = 160;
  const cellSize = 8;
  const cols = Math.floor(size / cellSize);

  function seededRandom(i: number) {
    const x = Math.sin(seed + i) * 10000;
    return x - Math.floor(x);
  }

  const cells = Array.from({ length: cols * cols }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const inCorner = (row < 4 && col < 4) || (row < 4 && col >= cols - 4) || (row >= cols - 4 && col < 4);
    if (inCorner) {
      const edgeRow = row === 0 || row === 3 || (row >= cols - 4 && (row === cols - 4 || row === cols - 1));
      const edgeCol = col === 0 || col === 3 || col === cols - 4 || col === cols - 1;
      return edgeRow || edgeCol;
    }
    return seededRandom(i) > 0.55;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {cells.map((filled, i) => {
        if (!filled) return null;
        const row = Math.floor(i / cols);
        const col = i % cols;
        return <rect key={i} x={col * cellSize} y={row * cellSize} width={cellSize - 0.5} height={cellSize - 0.5} fill="#1a1a2e" rx={1} />;
      })}
    </svg>
  );
}
