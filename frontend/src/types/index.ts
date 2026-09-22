// ─── Domain Enums ───────────────────────────────────────────────────────────
export type EventStatus = 'open' | 'nearly_full' | 'full' | 'draft' | 'closed' | 'ended';
export type TicketStatus = 'pending' | 'attended' | 'cancelled';
export type Topic = 'academic' | 'skill' | 'culture' | 'sport' | 'community';

// ─── Domain Models ───────────────────────────────────────────────────────────
export interface Event {
  id: string;
  title: string;
  speaker: string;
  topic: Topic;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  room: string;
  capacity: number;
  registered: number;
  status: EventStatus;
  banner: string;
  organizer: string;
  benefits: string[];
  schedule: { time: string; title: string }[];
}

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  studentId: string;
  studentName: string;
  faculty: string;
  status: TicketStatus;
  checkinTime?: string;
  qrCode: string;
  registeredAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  assignedEvent: string;
  permission: string;
  accountStatus: 'active' | 'inactive' | 'locked';
  lastActive: string;
}

// ─── Label Maps ──────────────────────────────────────────────────────────────
export const TOPIC_LABELS: Record<Topic, string> = {
  academic: 'Học thuật',
  skill: 'Kỹ năng',
  culture: 'Văn nghệ',
  sport: 'Thể thao',
  community: 'Cộng đồng',
};

export const STATUS_LABELS: Record<EventStatus, string> = {
  open: 'Còn chỗ',
  nearly_full: 'Sắp hết',
  full: 'Hết chỗ',
  draft: 'Bản nháp',
  closed: 'Đã đóng',
  ended: 'Đã kết thúc',
};
