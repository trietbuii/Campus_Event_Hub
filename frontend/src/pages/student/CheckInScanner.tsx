import { useState, useEffect, useRef } from 'react';
import { useApp, type CheckInResult } from '../../context/AppContext';
import { useUser } from '../../context/UserContext';
import { BottomNav } from './EventList';

type CameraState = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable';

interface Props {
  onNavigate: (screen: string) => void;
}

export default function CheckInScanner({ onNavigate }: Props) {
  const { user } = useUser();
  const { getStudentPermissions, getEvent, checkIn, getCheckedInCount, getActiveParticipants } = useApp();
  const permissions = getStudentPermissions(user.studentId);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    permissions.length === 1 ? permissions[0].eventId : null
  );
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [history, setHistory] = useState<Array<{ name: string; studentId: string; time: string; success: boolean; message?: string }>>([]);
  const [tab, setTab] = useState<'scan' | 'history'>('scan');
  const [scanLine, setScanLine] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const id = setInterval(() => setScanLine(v => (v + 1.5) % 100), 16);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  async function startCamera() {
    setCameraState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraState('active');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setCameraState('denied');
      } else {
        setCameraState('unavailable');
      }
    }
  }

  function handleSelectEvent(eventId: string) {
    setSelectedEventId(eventId);
    setCameraState('idle');
    setResult(null);
  }

  function handleScan(code?: string) {
    const input = (code ?? manualCode).trim();
    if (!input) return;
    const res = checkIn(input);
    setResult(res);
    setHistory(prev => [{
      name: res.studentName ?? '—',
      studentId: res.studentId ?? input,
      time: res.time ?? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      success: res.success,
      message: res.success ? undefined : res.message,
    }, ...prev]);
    if (res.success) setTimeout(() => setResult(null), 2500);
    setManualCode('');
  }

  const selectedEvent = selectedEventId ? getEvent(selectedEventId) : null;
  const checkedIn = selectedEventId ? getCheckedInCount(selectedEventId) : 0;
  const totalActive = selectedEventId ? getActiveParticipants(selectedEventId).length : 0;

  // Event selection screen
  if (!selectedEventId || permissions.length > 1 && !selectedEventId) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: '#0f0f1a' }}>
        {/* Top Safe Area */}
        <div className="w-full shrink-0" style={{ height: 'max(88px, env(safe-area-inset-top, 88px))', background: '#0f0f1a' }} />
        
        <div className="px-4 pb-4">
          <div className="pt-3">
            <h1 className="font-display font-bold text-xl text-white">Điểm danh</h1>
            <p className="text-sm mt-1" style={{ color: '#475569' }}>Chọn sự kiện cần điểm danh</p>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-3 pb-32">
          {permissions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <svg className="w-8 h-8" style={{ color: '#334155' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <p className="font-medium" style={{ color: '#475569' }}>Bạn chưa có quyền điểm danh</p>
              <p className="text-sm mt-1" style={{ color: '#334155' }}>Liên hệ ban tổ chức để được cấp quyền</p>
            </div>
          ) : (
            permissions.map(perm => {
              const event = getEvent(perm.eventId);
              if (!event) return null;
              return (
                <button key={perm.id} onClick={() => handleSelectEvent(perm.eventId)}
                  className="w-full text-left p-4 rounded-2xl transition-all hover:scale-[1.01] group"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-display font-semibold text-base text-white leading-snug flex-1">{event.title}</h3>
                    <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(79,70,229,0.2)', color: '#818cf8' }}>
                      Được cấp quyền
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25" />
                      </svg>
                      {new Date(event.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {event.room}, {event.location}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#475569' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#4f46e5' }}>{getCheckedInCount(perm.eventId)}</span>
                      {' / '}{getActiveParticipants(perm.eventId).length} đã điểm danh
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#818cf8' }}>
                      Bắt đầu quét
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
        <BottomNav current="checkin" onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0f0f1a' }}>
      {/* Top Safe Area */}
      <div className="w-full shrink-0" style={{ height: 'max(88px, env(safe-area-inset-top, 88px))', background: '#0f0f1a' }} />

      {/* Header */}
      <div className="px-4 pb-3">
        <div className="pt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {permissions.length > 1 && (
              <button onClick={() => { setSelectedEventId(null); stopCamera(); setCameraState('idle'); }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="font-display font-bold text-base text-white">Điểm danh</h1>
              <p className="text-xs truncate" style={{ color: '#475569', maxWidth: 220 }}>{selectedEvent?.title}</p>
            </div>
          </div>
          <button onClick={() => onNavigate('explore')}
            className="px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#64748b' }}>
            Thoát
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 mb-3 flex gap-3">
        <div className="flex-1 px-3 py-2 rounded-xl text-center"
          style={{ background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.25)' }}>
          <div className="font-display font-bold text-lg" style={{ color: '#818cf8' }}>{checkedIn}</div>
          <div className="text-xs" style={{ color: '#475569' }}>Đã điểm danh</div>
        </div>
        <div className="flex-1 px-3 py-2 rounded-xl text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="font-display font-bold text-lg text-white">{totalActive}</div>
          <div className="text-xs" style={{ color: '#475569' }}>Đã đăng ký</div>
        </div>
        <div className="flex-1 px-3 py-2 rounded-xl text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="font-display font-bold text-lg" style={{ color: totalActive > 0 ? '#4ade80' : '#475569' }}>
            {totalActive > 0 ? Math.round((checkedIn / totalActive) * 100) : 0}%
          </div>
          <div className="text-xs" style={{ color: '#475569' }}>Tỷ lệ</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mb-3 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {(['scan', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: tab === t ? '#4f46e5' : 'transparent', color: tab === t ? 'white' : '#475569' }}>
            {t === 'scan' ? 'Quét mã QR' : `Lịch sử (${history.length})`}
          </button>
        ))}
      </div>

      {tab === 'scan' ? (
        <div className="flex-1 flex flex-col">
          {/* Camera viewport */}
          <div className="mx-4 rounded-3xl overflow-hidden relative flex-shrink-0"
            style={{ height: '52vw', maxHeight: 280, background: '#0a0a14' }}>

            {/* Actual video element */}
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover"
              autoPlay playsInline muted
              style={{ display: cameraState === 'active' ? 'block' : 'none' }} />

            {/* Idle state */}
            {cameraState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(79,70,229,0.2)' }}>
                  <svg className="w-8 h-8" style={{ color: '#818cf8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  </svg>
                </div>
                <button onClick={startCamera}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#4f46e5' }}>
                  Mở camera
                </button>
                <p className="text-xs" style={{ color: '#475569' }}>Sử dụng camera sau để quét mã QR</p>
              </div>
            )}

            {/* Requesting permission */}
            {cameraState === 'requesting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: '#4f46e5' }} />
                <p className="text-sm" style={{ color: '#64748b' }}>Đang yêu cầu quyền camera...</p>
              </div>
            )}

            {/* Camera denied */}
            {cameraState === 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(220,38,38,0.2)' }}>
                  <svg className="w-7 h-7" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: '#fca5a5' }}>Không có quyền truy cập camera</p>
                <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
                  Vui lòng cấp quyền camera trong cài đặt trình duyệt, sau đó thử lại.
                </p>
                <button onClick={startCamera}
                  className="px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                  Thử lại
                </button>
              </div>
            )}

            {/* Camera unavailable */}
            {cameraState === 'unavailable' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Không thể khởi động camera</p>
                <p className="text-xs" style={{ color: '#475569' }}>Sử dụng nhập mã thủ công bên dưới</p>
              </div>
            )}

            {/* Scan overlay (active camera) */}
            {cameraState === 'active' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-44 h-44">
                  {[['top-0', 'left-0'], ['top-0', 'right-0'], ['bottom-0', 'left-0'], ['bottom-0', 'right-0']].map(([v, h], i) => (
                    <div key={i} className={`absolute`} style={{ [v.split('-')[0]]: 0, [h.split('-')[0]]: 0, width: 28, height: 28 }}>
                      <div style={{ position: 'absolute', [v.split('-')[0]]: 0, [h.split('-')[0]]: 0, width: 2, height: 24, background: '#818cf8', borderRadius: 1 }} />
                      <div style={{ position: 'absolute', [v.split('-')[0]]: 0, [h.split('-')[0]]: 0, width: 24, height: 2, background: '#818cf8', borderRadius: 1 }} />
                    </div>
                  ))}
                  <div className="absolute left-0 right-0" style={{
                    height: 2, top: `${scanLine}%`,
                    background: 'linear-gradient(to right, transparent, #4f46e5, transparent)',
                    boxShadow: '0 0 8px #4f46e5',
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Manual code input */}
          <div className="mx-4 mt-4">
            <p className="text-xs mb-2" style={{ color: '#475569' }}>Nhập mã vé thủ công</p>
            <div className="flex gap-2">
              <input value={manualCode} onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                placeholder="VD: TKT-2026-003412"
                className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)' }} />
              <button onClick={() => handleScan()}
                className="px-4 py-3 rounded-2xl text-sm font-semibold text-white flex-shrink-0"
                style={{ background: '#4f46e5' }}>
                Xác nhận
              </button>
            </div>
          </div>

          {/* Demo scan — uses the seeded ticket for EVT001 */}
          <div className="px-4 mt-3 pb-6">
            <button onClick={() => handleScan('TKT-2026-003412|EVT005|22521001')}
              className="w-full py-3 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(79,70,229,0.2)', color: '#818cf8', border: '1px solid rgba(79,70,229,0.3)' }}>
              Quét demo (dùng vé mẫu)
            </button>
          </div>
        </div>
      ) : (
        /* History tab */
        <div className="flex-1 px-4 pb-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: '#334155' }}>Chưa có lịch sử điểm danh</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: h.success ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)' }}>
                    {h.success ? (
                      <svg className="w-4 h-4" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" style={{ color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{h.name}</p>
                    <p className="text-xs" style={{ color: '#475569', fontFamily: 'var(--font-mono)' }}>
                      {h.studentId} · {h.time}
                    </p>
                    {h.message && <p className="text-xs mt-0.5" style={{ color: '#dc2626' }}>{h.message}</p>}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{
                      background: h.success ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)',
                      color: h.success ? '#059669' : '#dc2626',
                    }}>
                    {h.success ? 'OK' : 'Lỗi'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scan result overlay */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: result.success ? 'rgba(5,150,105,0.97)' : 'rgba(220,38,38,0.97)' }}>
          <div className="text-center w-full max-w-sm">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              {result.success ? (
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0L22.303 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              )}
            </div>
            {result.success ? (
              <>
                <h2 className="font-display font-bold text-2xl text-white mb-3">Điểm danh thành công!</h2>
                <p className="font-display text-xl font-semibold mb-1" style={{ color: '#d1fae5' }}>{result.studentName}</p>
                <p className="text-sm mb-0.5" style={{ color: '#a7f3d0', fontFamily: 'var(--font-mono)' }}>MSSV: {result.studentId}</p>
                {result.faculty && <p className="text-sm" style={{ color: '#a7f3d0' }}>{result.faculty}</p>}
                {result.time && <p className="text-sm mt-1" style={{ color: '#6ee7b7', fontFamily: 'var(--font-mono)' }}>{result.time}</p>}
                <p className="text-xs mt-4 opacity-60 text-white">Tự động đóng sau 2 giây...</p>
              </>
            ) : (
              <>
                <h2 className="font-display font-bold text-2xl text-white mb-3">Điểm danh thất bại</h2>
                <p className="text-base mb-8" style={{ color: '#fecaca' }}>{result.message}</p>
                <button onClick={() => setResult(null)}
                  className="px-8 py-3 rounded-2xl text-sm font-bold"
                  style={{ background: 'white', color: '#dc2626' }}>
                  Thử lại
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav current="checkin" onNavigate={onNavigate} />
    </div>
  );
}
