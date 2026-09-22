import { useState } from 'react';
import { BottomNav } from './EventList';
import { useToast } from '../../components/Toast';
import { useUser } from '../../context/UserContext';
import { useApp } from '../../context/AppContext';

interface Props {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function Profile({ onNavigate, onLogout }: Props) {
  const { showToast } = useToast();
  const { user, updateUser } = useUser();
  const { tickets } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [draft, setDraft] = useState({ name: user.name, phone: user.phone });

  // Real stats from tickets
  const myTickets = tickets.filter(t => t.studentId === user.studentId);
  const totalBooked = myTickets.filter(t => t.status !== 'cancelled').length;
  const totalAttended = myTickets.filter(t => t.status === 'attended').length;

  function handleSave() {
    updateUser({ name: draft.name, phone: draft.phone });
    setEditMode(false);
    showToast('Đã cập nhật hồ sơ thành công.', 'success');
  }

  function handleCancel() {
    setDraft({ name: user.name, phone: user.phone });
    setEditMode(false);
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#f4f5f9' }}>
      {/* Top Safe Area for Dynamic Island */}
      <div className="w-full shrink-0" style={{ height: 'max(88px, env(safe-area-inset-top, 88px))', background: 'white' }} />

      {/* Header */}
      <div className="bg-white shadow-sm px-4 pb-6">
        <h1 className="font-display font-bold text-xl mb-5" style={{ color: '#1a1a2e' }}>Hồ sơ cá nhân</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-display font-bold text-2xl text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}>
              {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.initials}
            </div>
            <button onClick={() => setShowAvatarModal(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
              style={{ background: '#4f46e5' }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              </svg>
            </button>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: '#1a1a2e' }}>{user.name}</h2>
            <p className="text-sm" style={{ color: '#64748b' }}>{user.role} · {user.faculty}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#059669' }} />
              <span className="text-xs font-medium" style={{ color: '#059669' }}>Tài khoản đang hoạt động</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats — real data from tickets */}
      <div className="grid grid-cols-3 gap-3 px-4 py-4">
        {[
          [String(totalBooked), 'Vé đã đặt'],
          [String(totalAttended), 'Đã tham dự'],
          [String(totalAttended * 10) + ' điểm', 'Rèn luyện'],
        ].map(([v, l]) => (
          <div key={l} className="bg-white rounded-2xl p-3 text-center shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
            <div className="font-display font-bold text-lg" style={{ color: '#4f46e5' }}>{v}</div>
            <div className="text-xs mt-0.5 leading-tight" style={{ color: '#94a3b8' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Info form */}
      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border" style={{ borderColor: '#f1f5f9' }}>
          <div className="px-4 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#f8fafc' }}>
            <h3 className="font-display font-semibold" style={{ color: '#1a1a2e' }}>Thông tin sinh viên</h3>
            {!editMode && (
              <button onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ color: '#4f46e5', background: '#eef2ff' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>

          {[
            { label: 'Họ và tên', value: user.name, editable: true, key: 'name' as const },
            { label: 'MSSV', value: user.studentId, editable: false },
            { label: 'Khoa / Viện', value: user.faculty, editable: false },
            { label: 'Email sinh viên', value: user.email, editable: false },
            { label: 'Số điện thoại', value: user.phone, editable: true, key: 'phone' as const },
            { label: 'Vai trò', value: user.role, editable: false },
          ].map(({ label, value, editable, key }) => (
            <div key={label} className="px-4 py-3 border-b last:border-0" style={{ borderColor: '#f8fafc' }}>
              <label className="block text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>{label}</label>
              {editMode && editable && key ? (
                <input
                  value={draft[key]}
                  onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                  className="w-full text-sm font-medium bg-transparent outline-none border-b pb-1"
                  style={{ color: '#1a1a2e', borderColor: '#4f46e5' }} />
              ) : (
                <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 mt-4 space-y-3">
        {editMode ? (
          <>
            <button onClick={handleSave}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white"
              style={{ background: '#4f46e5' }}>
              Lưu thay đổi
            </button>
            <button onClick={handleCancel}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm border"
              style={{ borderColor: '#e2e8f0', color: '#475569' }}>
              Hủy
            </button>
          </>
        ) : (
          <button onClick={onLogout}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm"
            style={{ background: '#fee2e2', color: '#b91c1c' }}>
            Đăng xuất
          </button>
        )}
      </div>

      {/* Avatar modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-base" style={{ color: '#1a1a2e' }}>Thay đổi ảnh đại diện</h3>
              <button onClick={() => setShowAvatarModal(false)}>
                <svg className="w-5 h-5" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Preview */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center font-display font-bold text-3xl text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}>
                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.initials}
              </div>
            </div>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
                style={{ borderColor: '#e2e8f0', color: '#1a1a2e' }}>
                <svg className="w-4 h-4" style={{ color: '#4f46e5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                Chọn ảnh từ thư viện
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
                style={{ borderColor: '#e2e8f0', color: '#1a1a2e' }}>
                <svg className="w-4 h-4" style={{ color: '#4f46e5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                </svg>
                Chụp ảnh
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
                style={{ borderColor: '#fee2e2', color: '#dc2626' }}
                onClick={() => { updateUser({ avatar: null }); setShowAvatarModal(false); showToast('Đã xóa ảnh đại diện.', 'info'); }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Xóa ảnh hiện tại
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAvatarModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#e2e8f0', color: '#475569' }}>
                Hủy
              </button>
              <button onClick={() => { setShowAvatarModal(false); showToast('Đã cập nhật ảnh đại diện.', 'success'); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#4f46e5' }}>
                Lưu ảnh
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav current="profile" onNavigate={onNavigate} />
    </div>
  );
}
