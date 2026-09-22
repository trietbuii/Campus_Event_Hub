export type NotifType = 'event_reminder' | 'reg_close' | 'reg_success' | 'reg_cancelled' | 'checkin_reminder' | 'event_update' | 'event_cancelled';
export type NotifAction = 'event-detail' | 'ticket-confirm' | 'tickets';

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  action?: NotifAction;
  eventId?: string;
}

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'event_reminder',
    title: 'Sự kiện sắp diễn ra',
    description: 'Ngày hội nghề nghiệp AI & Kỹ thuật dữ liệu sẽ diễn ra ngày mai lúc 08:30.',
    time: '10 phút trước',
    read: false,
    action: 'event-detail',
    eventId: 'EVT001',
  },
  {
    id: 'n2',
    type: 'checkin_reminder',
    title: 'Nhắc nhở check-in',
    description: 'Sự kiện Kỹ năng lãnh đạo dành cho sinh viên của bạn sẽ bắt đầu sau 2 giờ.',
    time: '2 giờ trước',
    read: false,
    action: 'tickets',
  },
  {
    id: 'n3',
    type: 'reg_success',
    title: 'Đăng ký thành công',
    description: 'Bạn đã đăng ký Ngày hội nghề nghiệp AI & Kỹ thuật dữ liệu.',
    time: 'Hôm qua',
    read: true,
    action: 'ticket-confirm',
    eventId: 'EVT001',
  },
  {
    id: 'n4',
    type: 'event_update',
    title: 'Sự kiện đã cập nhật',
    description: 'Địa điểm của Hội thảo Điện toán đám mây & DevOps đã được thay đổi.',
    time: 'Hôm qua',
    read: true,
    action: 'event-detail',
    eventId: 'EVT002',
  },
  {
    id: 'n5',
    type: 'reg_close',
    title: 'Sắp đóng đăng ký',
    description: 'Ngày hội Đổi mới sáng tạo & Khởi nghiệp sẽ đóng đăng ký lúc 23:59 hôm nay.',
    time: '3 giờ trước',
    read: true,
    action: 'event-detail',
    eventId: 'EVT004',
  },
];

const TYPE_ICON: Record<NotifType, { path: string; bg: string; color: string }> = {
  event_reminder: {
    bg: '#eef2ff', color: '#4f46e5',
    path: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5',
  },
  reg_close: {
    bg: '#fef9c3', color: '#a16207',
    path: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  reg_success: {
    bg: '#dcfce7', color: '#15803d',
    path: 'm4.5 12.75 6 6 9-13.5',
  },
  checkin_reminder: {
    bg: '#e0f2fe', color: '#0369a1',
    path: 'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0',
  },
  event_update: {
    bg: '#f0fdf4', color: '#059669',
    path: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
  },
  event_cancelled: {
    bg: '#fee2e2', color: '#b91c1c',
    path: 'M6 18 18 6M6 6l12 12',
  },
  reg_cancelled: {
    bg: '#fee2e2', color: '#b91c1c',
    path: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
  },
};

export function getNotifIcon(type: NotifType) { return TYPE_ICON[type]; }
