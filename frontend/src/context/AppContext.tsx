import { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';
import { db } from '@config/firebase';
import { EVENTS } from '@data/mock';
import type { Ticket, Topic } from '../types';
import { INITIAL_NOTIFICATIONS, type Notification, type NotifType, type NotifAction } from '@data/notifications';
import type { UserData } from './UserContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export type EventStatus = 'open' | 'nearly_full' | 'full' | 'draft' | 'closed' | 'ended';

export type PermissionStatus = 'active' | 'suspended' | 'revoked' | 'expired';

export interface CheckInPermission {
  id: string;
  studentId: string;
  studentName: string;
  eventId: string;
  status: PermissionStatus;
  grantedAt: string;
  validFrom?: string;
  validUntil?: string;
}

export interface GrantPermissionResult {
  success: boolean;
  permission?: CheckInPermission;
  error?: string;
}
export interface RevokePermissionResult { success: boolean; error?: string; }

export interface LiveEvent {
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
  registrationOpen: boolean;
  isCancelled: boolean;
  banner: string;
  organizer: string;
  benefits: string[];
  schedule: { time: string; title: string }[];
}

export interface RegisterResult {
  success: boolean;
  ticket?: Ticket;
  error?: string;
}

export interface CancelResult {
  success: boolean;
  error?: string;
}

export interface CheckInResult {
  success: boolean;
  type: 'success' | 'already_checked_in' | 'cancelled_ticket' | 'not_found' | 'wrong_event';
  ticket?: Ticket;
  studentName?: string;
  studentId?: string;
  faculty?: string;
  time?: string;
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function computeEventStatus(e: LiveEvent): EventStatus {
  if (e.isCancelled) return 'closed';
  if (!e.registrationOpen) return 'closed';
  if (e.registered >= e.capacity) return 'full';
  const ratio = (e.capacity - e.registered) / e.capacity;
  if (ratio <= 0.2) return 'nearly_full';
  return 'open';
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  open: 'Còn chỗ',
  nearly_full: 'Sắp hết',
  full: 'Hết chỗ',
  draft: 'Bản nháp',
  closed: 'Đã đóng',
  ended: 'Đã kết thúc',
};

// ─── Seed permissions ─────────────────────────────────────────────────────────

// Student 22521001 (Cao Duy Anh) has been granted check-in permission for EVT001
const SEED_PERMISSIONS: CheckInPermission[] = [
  {
    id: 'PERM-001',
    studentId: '22521001',
    studentName: 'Cao Duy Anh',
    eventId: 'EVT001',
    status: 'active',
    grantedAt: '2026-09-20 09:00',
  },
];

let _permSeq = 1;
function nextPermId() { return `PERM-${String(100 + _permSeq++).padStart(3, '0')}`; }

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_LIVE_EVENTS: LiveEvent[] = EVENTS.map(e => ({
  ...e,
  registrationOpen: e.status !== 'closed' && e.status !== 'ended',
  isCancelled: false,
}));

// Pre-existing tickets: EVT005 (upcoming, pending) + past attended event
// EVT001 is NOT pre-registered so the demo "register" flow starts fresh at 180/200
const SEED_TICKETS: Ticket[] = [
  {
    id: 'TKT-2026-003412',
    eventId: 'EVT005',
    eventTitle: 'Ngày hội việc làm Công nghệ 2026',
    eventDate: '2026-11-12',
    eventTime: '08:00 – 17:00',
    eventLocation: 'Sân trung tâm & Hội trường B',
    studentId: '22521001',
    studentName: 'Cao Duy Anh',
    faculty: 'Công nghệ Thông tin',
    status: 'pending',
    qrCode: 'TKT-2026-003412|EVT005|22521001',
    registeredAt: '2026-09-18 14:30',
  },
  {
    id: 'TKT-2026-000711',
    eventId: 'EVT_PAST',
    eventTitle: 'Cuộc thi Lập trình ACM ICPC Qualifier',
    eventDate: '2026-09-15',
    eventTime: '08:00 – 12:00',
    eventLocation: 'Phòng máy C1',
    studentId: '22521001',
    studentName: 'Cao Duy Anh',
    faculty: 'Công nghệ Thông tin',
    status: 'attended',
    checkinTime: '07:52',
    qrCode: 'TKT-2026-000711|EVT_PAST|22521001',
    registeredAt: '2026-09-10 11:00',
  },
];

let _ticketSeq = 1;
function nextTicketId(): string {
  return `TKT-2026-${String(4000 + _ticketSeq++).padStart(4, '0')}`;
}

function nowStr() {
  return new Date().toLocaleString('vi-VN');
}
function nowTime() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function newNotifId() {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function makeNotif(
  type: NotifType,
  title: string,
  description: string,
  action?: NotifAction,
  eventId?: string,
): Notification {
  return { id: newNotifId(), type, title, description, time: 'Vừa xong', read: false, action, eventId };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextType {
  events: LiveEvent[];
  tickets: Ticket[];
  notifications: Notification[];
  permissions: CheckInPermission[];

  getEvent: (id: string) => LiveEvent | undefined;
  computeStatus: (e: LiveEvent) => EventStatus;

  getUserActiveTicket: (eventId: string, studentId: string) => Ticket | undefined;
  getActiveParticipants: (eventId: string) => Ticket[];
  getCheckedInCount: (eventId: string) => number;

  registerEvent: (event: LiveEvent, user: UserData) => RegisterResult;
  cancelTicket: (ticketId: string) => CancelResult;
  checkIn: (qrCode: string) => CheckInResult;

  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // Permission management
  getStudentPermissions: (studentId: string) => CheckInPermission[];
  getEventPermissions: (eventId: string) => CheckInPermission[];
  grantCheckinPermission: (studentId: string, studentName: string, eventId: string, validFrom?: string, validUntil?: string) => GrantPermissionResult;
  revokePermission: (permId: string) => RevokePermissionResult;
  suspendPermission: (permId: string) => RevokePermissionResult;
  reactivatePermission: (permId: string) => RevokePermissionResult;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Load initial state from Firestore
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('ceh_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [permissions, setPermissions] = useState<CheckInPermission[]>(() => {
    const saved = localStorage.getItem('ceh_permissions');
    return saved ? JSON.parse(saved) : SEED_PERMISSIONS;
  });

  useEffect(() => {
    let unsubEvents = () => {};
    let unsubTickets = () => {};

    const init = async () => {
      console.log("DB value inside useEffect:", db);
      const eventsRef = collection(db, 'events');
      const eventsSnap = await getDocs(eventsRef);
      if (eventsSnap.empty) {
        console.log('Seeding events...');
        for (const e of INITIAL_LIVE_EVENTS) {
          await setDoc(doc(eventsRef, e.id), e);
        }
      }
      unsubEvents = onSnapshot(eventsRef, snapshot => {
        setEvents(snapshot.docs.map(d => d.data() as LiveEvent));
      });

      const ticketsRef = collection(db, 'tickets');
      const ticketsSnap = await getDocs(ticketsRef);
      if (ticketsSnap.empty) {
        console.log('Seeding tickets...');
        for (const t of SEED_TICKETS) {
          await setDoc(doc(ticketsRef, t.id), t);
        }
      }
      unsubTickets = onSnapshot(ticketsRef, snapshot => {
        setTickets(snapshot.docs.map(d => d.data() as Ticket));
      });
    };

    init();

    return () => {
      unsubEvents();
      unsubTickets();
    };
  }, []);

  // Sync state changes back to localStorage for notifications and permissions only
  useEffect(() => { localStorage.setItem('ceh_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('ceh_permissions', JSON.stringify(permissions)); }, [permissions]);

  function getEvent(id: string) { return events.find(e => e.id === id); }

  function getUserActiveTicket(eventId: string, studentId: string) {
    return tickets.find(t => t.eventId === eventId && t.studentId === studentId && t.status !== 'cancelled');
  }

  function getActiveParticipants(eventId: string) {
    return tickets.filter(t => t.eventId === eventId && t.status !== 'cancelled');
  }

  function getCheckedInCount(eventId: string) {
    return tickets.filter(t => t.eventId === eventId && t.status === 'attended').length;
  }

  function registerEvent(event: LiveEvent, user: UserData): RegisterResult {
    if (event.isCancelled) return { success: false, error: 'Sự kiện đã bị hủy.' };
    if (!event.registrationOpen) return { success: false, error: 'Đăng ký đã đóng.' };
    const remaining = event.capacity - event.registered;
    if (remaining <= 0) return { success: false, error: 'Sự kiện đã hết chỗ.' };

    // Duplicate check: use functional update to read latest tickets
    let existingTicket: Ticket | undefined;
    setTickets(prev => {
      existingTicket = prev.find(t => t.eventId === event.id && t.studentId === user.studentId && t.status !== 'cancelled');
      return prev;
    });
    if (existingTicket) return { success: false, error: 'Bạn đã đăng ký sự kiện này.', ticket: existingTicket };

    const ticketId = nextTicketId();
    const newTicket: Ticket = {
      id: ticketId,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: `${event.time} – ${event.endTime}`,
      eventLocation: `${event.room}, ${event.location}`,
      studentId: user.studentId,
      studentName: user.name,
      faculty: user.faculty,
      status: 'pending',
      qrCode: `${ticketId}|${event.id}|${user.studentId}`,
      registeredAt: nowStr(),
    };

    // Optimistic update locally
    setTickets(prev => [...prev, newTicket]);
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, registered: e.registered + 1 } : e));
    setNotifications(prev => [
      makeNotif('reg_success', 'Đăng ký thành công', `Bạn đã đăng ký ${event.title}.`, 'ticket-confirm', event.id),
      ...prev,
    ]);

    // Async write to Firestore
    setDoc(doc(db, 'tickets', ticketId), newTicket).catch(console.error);
    updateDoc(doc(db, 'events', event.id), { registered: increment(1) }).catch(console.error);

    return { success: true, ticket: newTicket };
  }

  function cancelTicket(ticketId: string): CancelResult {
    // Read latest tickets synchronously via functional form
    let err: string | undefined;
    let targetTicket: Ticket | undefined;

    setTickets(prev => {
      targetTicket = prev.find(t => t.id === ticketId);
      if (!targetTicket) { err = 'Không tìm thấy vé.'; return prev; }
      if (targetTicket.status === 'cancelled') { err = 'Vé đã bị hủy trước đó.'; return prev; }
      if (targetTicket.status === 'attended') { err = 'Vé đã được check-in và không thể hủy.'; return prev; }
      return prev.map(t => t.id === ticketId ? { ...t, status: 'cancelled' as const } : t);
    });

    if (err || !targetTicket) return { success: false, error: err };

    setEvents(prev => prev.map(e => e.id === targetTicket!.eventId
      ? { ...e, registered: Math.max(0, e.registered - 1) }
      : e));
    setNotifications(prev => [
      makeNotif('reg_cancelled', 'Đã hủy vé', `Bạn đã hủy vé tham gia ${targetTicket!.eventTitle}.`, undefined, targetTicket!.eventId),
      ...prev,
    ]);

    // Async update to Firestore
    updateDoc(doc(db, 'tickets', ticketId), { status: 'cancelled' }).catch(console.error);
    updateDoc(doc(db, 'events', targetTicket!.eventId), { registered: increment(-1) }).catch(console.error);

    return { success: true };
  }

  function checkIn(qrCode: string): CheckInResult {
    const ticket = tickets.find(t => t.qrCode === qrCode);
    if (!ticket) {
      // Also try matching by ticket id (in case QR was the id)
      const byId = tickets.find(t => t.id === qrCode);
      if (!byId) return { success: false, type: 'not_found', message: 'Không tìm thấy vé trong hệ thống.' };
      return checkInTicket(byId);
    }
    return checkInTicket(ticket);
  }

  function checkInTicket(ticket: Ticket): CheckInResult {
    if (ticket.status === 'cancelled') return {
      success: false, type: 'cancelled_ticket',
      message: 'Vé đã bị hủy và không thể check-in.',
    };
    if (ticket.status === 'attended') return {
      success: false, type: 'already_checked_in', ticket,
      studentName: ticket.studentName,
      studentId: ticket.studentId,
      message: 'Vé đã được check-in trước đó.',
    };

    const time = nowTime();
    const updated = { ...ticket, status: 'attended' as const, checkinTime: time };
    setTickets(prev => prev.map(t => t.id === ticket.id ? updated : t));

    // Async update to Firestore
    updateDoc(doc(db, 'tickets', ticket.id), { status: 'attended', checkinTime: time }).catch(console.error);

    return {
      success: true, type: 'success',
      ticket: updated,
      studentName: ticket.studentName,
      studentId: ticket.studentId,
      faculty: ticket.faculty,
      time,
      message: 'Điểm danh thành công!',
    };
  }

  function markNotificationRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }
  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function getStudentPermissions(studentId: string) {
    return permissions.filter(p => p.studentId === studentId && p.status === 'active');
  }
  function getEventPermissions(eventId: string) {
    return permissions.filter(p => p.eventId === eventId && p.status !== 'revoked');
  }

  function grantCheckinPermission(studentId: string, studentName: string, eventId: string, validFrom?: string, validUntil?: string): GrantPermissionResult {
    const existing = permissions.find(p => p.studentId === studentId && p.eventId === eventId && p.status !== 'revoked');
    if (existing) return { success: false, error: 'Sinh viên này đã được cấp quyền điểm danh cho sự kiện.' };
    const perm: CheckInPermission = {
      id: nextPermId(),
      studentId, studentName, eventId,
      status: 'active',
      grantedAt: nowStr(),
      validFrom, validUntil,
    };
    setPermissions(prev => [...prev, perm]);
    return { success: true, permission: perm };
  }

  function revokePermission(permId: string): RevokePermissionResult {
    const perm = permissions.find(p => p.id === permId);
    if (!perm) return { success: false, error: 'Không tìm thấy quyền.' };
    setPermissions(prev => prev.map(p => p.id === permId ? { ...p, status: 'revoked' as const } : p));
    return { success: true };
  }

  function suspendPermission(permId: string): RevokePermissionResult {
    const perm = permissions.find(p => p.id === permId);
    if (!perm) return { success: false, error: 'Không tìm thấy quyền.' };
    setPermissions(prev => prev.map(p => p.id === permId ? { ...p, status: 'suspended' as const } : p));
    return { success: true };
  }

  function reactivatePermission(permId: string): RevokePermissionResult {
    const perm = permissions.find(p => p.id === permId);
    if (!perm) return { success: false, error: 'Không tìm thấy quyền.' };
    setPermissions(prev => prev.map(p => p.id === permId ? { ...p, status: 'active' as const } : p));
    return { success: true };
  }

  return (
    <AppContext.Provider value={{
      events, tickets, notifications, permissions,
      getEvent, computeStatus: computeEventStatus,
      getUserActiveTicket, getActiveParticipants, getCheckedInCount,
      registerEvent, cancelTicket, checkIn,
      markNotificationRead, markAllRead,
      getStudentPermissions, getEventPermissions,
      grantCheckinPermission, revokePermission, suspendPermission, reactivatePermission,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
