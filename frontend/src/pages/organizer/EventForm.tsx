import { useState } from 'react';
import { OrgLayout } from '../../layouts/OrgLayout';

interface Props {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function EventForm({ onNavigate, onLogout }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: '',
    topic: '',
    description: '',
    regStart: '',
    regEnd: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    room: '',
    capacity: '',
  });

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Vui lòng nhập tên sự kiện.';
    if (!form.topic) e.topic = 'Vui lòng chọn chủ đề.';
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) <= 0)
      e.capacity = 'Sức chứa phải là số nguyên dương.';
    if (form.regEnd && form.eventDate && form.regEnd > form.eventDate)
      e.regEnd = 'Thời gian đóng đăng ký không được sau ngày diễn ra sự kiện.';
    return e;
  }

  function handleSubmit(publish: boolean) {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onNavigate('org-events');
  }

  return (
    <OrgLayout current="org-events" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="p-6 lg:p-8 max-w-screen-xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-2" style={{ color: '#94a3b8' }}>
          <button onClick={() => onNavigate('org-events')} className="hover:underline">Quản lý sự kiện</button>
          <span>/</span>
          <span style={{ color: '#1a1a2e' }}>Tạo sự kiện mới</span>
        </div>

        <h1 className="font-display font-bold text-2xl mb-6" style={{ color: '#1a1a2e' }}>Tạo sự kiện mới</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form — 2/3 width */}
          <div className="lg:col-span-2 space-y-5">
            {/* Section 1 */}
            <Section title="Thông tin chung">
              <FormField label="Tên sự kiện" required error={errors.title}>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="VD: Hội thảo Trí tuệ nhân tạo 2026" className={inputClass(!!errors.title)} />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Chủ đề" required error={errors.topic}>
                  <select value={form.topic} onChange={e => set('topic', e.target.value)}
                    className={inputClass(!!errors.topic)}>
                    <option value="">Chọn chủ đề</option>
                    <option value="academic">Học thuật</option>
                    <option value="skill">Kỹ năng</option>
                    <option value="culture">Văn nghệ</option>
                    <option value="sport">Thể thao</option>
                    <option value="community">Cộng đồng</option>
                  </select>
                </FormField>
                <FormField label="Ảnh banner">
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" className="hidden" id="banner-upload" />
                    <label htmlFor="banner-upload"
                      className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm cursor-pointer hover:bg-slate-50 transition-colors"
                      style={{ borderColor: '#e2e8f0', color: '#64748b' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      Tải lên banner
                    </label>
                  </div>
                </FormField>
              </div>
              <FormField label="Mô tả sự kiện">
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={4} placeholder="Mô tả chi tiết về sự kiện, chương trình và mục tiêu..."
                  className={inputClass(false)} style={{ resize: 'vertical' }} />
              </FormField>
            </Section>

            {/* Section 2 */}
            <Section title="Thời gian đăng ký">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Thời gian mở đăng ký">
                  <input type="datetime-local" value={form.regStart} onChange={e => set('regStart', e.target.value)}
                    className={inputClass(false)} />
                </FormField>
                <FormField label="Thời gian đóng đăng ký" error={errors.regEnd}>
                  <input type="datetime-local" value={form.regEnd} onChange={e => set('regEnd', e.target.value)}
                    className={inputClass(!!errors.regEnd)} />
                </FormField>
              </div>
            </Section>

            {/* Section 3 */}
            <Section title="Thời gian tổ chức">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Ngày tổ chức">
                  <input type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)}
                    className={inputClass(false)} />
                </FormField>
                <FormField label="Giờ bắt đầu">
                  <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
                    className={inputClass(false)} />
                </FormField>
                <FormField label="Giờ kết thúc">
                  <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
                    className={inputClass(false)} />
                </FormField>
              </div>
            </Section>

            {/* Section 4 */}
            <Section title="Địa điểm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Tên địa điểm / Trường">
                  <input value={form.location} onChange={e => set('location', e.target.value)}
                    placeholder="VD: Trường ĐH Công nghệ Thông tin" className={inputClass(false)} />
                </FormField>
                <FormField label="Phòng / Hội trường">
                  <input value={form.room} onChange={e => set('room', e.target.value)}
                    placeholder="VD: Hội trường A" className={inputClass(false)} />
                </FormField>
              </div>
            </Section>

            {/* Section 5 */}
            <Section title="Sức chứa">
              <FormField label="Số lượng tham gia tối đa" required error={errors.capacity}>
                <input type="number" min={1} value={form.capacity} onChange={e => set('capacity', e.target.value)}
                  placeholder="VD: 200" className={`${inputClass(!!errors.capacity)} max-w-xs`} />
              </FormField>
              <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>
                Sau khi đạt giới hạn, hệ thống sẽ tự động đóng đăng ký và hiển thị trạng thái "Hết chỗ".
              </p>
            </Section>

            {/* Section 6 */}
            <Section title="Nội dung chương trình">
              <textarea rows={5} placeholder="Mô tả lịch trình, các tiết mục và hoạt động trong sự kiện..."
                className={inputClass(false)} style={{ resize: 'vertical' }} />
            </Section>
          </div>

          {/* Preview sidebar — desktop only */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
                <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#1a1a2e' }}>Xem trước</h3>
                <div className="rounded-xl overflow-hidden mb-3" style={{ background: '#f8fafc', height: 120 }}>
                  <div className="w-full h-full flex items-center justify-center" style={{ color: '#cbd5e1' }}>
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                </div>
                <h4 className="font-display font-semibold text-sm leading-snug mb-2" style={{ color: form.title ? '#1a1a2e' : '#cbd5e1' }}>
                  {form.title || 'Tên sự kiện sẽ hiển thị ở đây'}
                </h4>
                <div className="space-y-1.5">
                  {[
                    form.eventDate ? `📅 ${new Date(form.eventDate).toLocaleDateString('vi-VN')}` : '📅 Chưa chọn ngày',
                    form.room || form.location ? `📍 ${form.room || form.location}` : '📍 Chưa có địa điểm',
                    form.capacity ? `👥 0/${form.capacity} chỗ` : '👥 Chưa có sức chứa',
                  ].map((t, i) => (
                    <p key={i} className="text-xs" style={{ color: '#94a3b8' }}>{t}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t" style={{ borderColor: '#e2e8f0' }}>
          <button onClick={() => onNavigate('org-events')}
            className="px-6 py-2.5 rounded-xl text-sm font-medium border"
            style={{ borderColor: '#e2e8f0', color: '#475569', background: 'white' }}>
            Hủy bỏ
          </button>
          <button onClick={() => handleSubmit(false)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: '#e2e8f0', color: '#4f46e5', background: '#eef2ff' }}>
            Lưu bản nháp
          </button>
          <button onClick={() => handleSubmit(true)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#4f46e5' }}>
            Công bố sự kiện
          </button>
        </div>
      </div>
    </OrgLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
      <h2 className="font-display font-semibold text-base mb-4 pb-3 border-b" style={{ color: '#1a1a2e', borderColor: '#f1f5f9' }}>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: '#475569' }}>
        {label}{required && <span className="ml-0.5" style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-indigo-500'}`;
}
