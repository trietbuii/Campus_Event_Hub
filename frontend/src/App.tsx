import { useState } from 'react';
import { ToastProvider } from './components/Toast';
import { UserProvider } from './context/UserContext';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import EventList from './pages/student/EventList';
import EventDetail from './pages/student/EventDetail';
import TicketConfirm from './pages/student/TicketConfirm';
import MyTickets from './pages/student/MyTickets';
import Profile from './pages/student/Profile';
import Dashboard from './pages/organizer/Dashboard';
import EventManagement from './pages/organizer/EventManagement';
import EventForm from './pages/organizer/EventForm';
import Participants from './pages/organizer/Participants';
import Staff from './pages/organizer/Staff';
import CheckInScanner from './pages/student/CheckInScanner';
import type { Ticket } from './types';

export type Role = 'student' | 'organizer';

function AppInner() {
  const [role, setRole] = useState<Role | null>(null);
  const [screen, setScreen] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [confirmedTicket, setConfirmedTicket] = useState<Ticket | null>(null);

  function handleLogin(r: Role) {
    setRole(r);
    setScreen(r === 'organizer' ? 'org-dashboard' : 'home');
  }

  function handleLogout() {
    setRole(null);
    setScreen('home');
    setSelectedEventId(null);
    setConfirmedTicket(null);
  }

  function handleNavigate(s: string) {
    // Map 'explore' from BottomNav to 'home' (EventList screen)
    setScreen(s === 'explore' ? 'home' : s);
  }

  function handleSelectEvent(eventId: string) {
    setSelectedEventId(eventId);
    setScreen('event-detail');
  }

  function handleRegister(ticket: Ticket) {
    setConfirmedTicket(ticket);
    setScreen('ticket-confirm');
  }

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  if (role === 'student') {
    if (screen === 'event-detail' && selectedEventId) {
      return (
        <EventDetail
          eventId={selectedEventId}
          onBack={() => setScreen('home')}
          onRegister={handleRegister}
          onViewTicket={() => setScreen('tickets')}
        />
      );
    }
    if (screen === 'ticket-confirm' && confirmedTicket) {
      return (
        <TicketConfirm
          ticket={confirmedTicket}
          onViewTickets={() => setScreen('tickets')}
          onGoHome={() => setScreen('home')}
        />
      );
    }
    if (screen === 'tickets') {
      return <MyTickets onNavigate={handleNavigate} onSelectEvent={handleSelectEvent} />;
    }
    if (screen === 'profile') {
      return <Profile onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
    if (screen === 'checkin') {
      return <CheckInScanner onNavigate={handleNavigate} />;
    }
    return <EventList onSelectEvent={handleSelectEvent} onNavigate={handleNavigate} />;
  }

  if (role === 'organizer') {
    if (screen === 'org-events') return <EventManagement onNavigate={handleNavigate} onLogout={handleLogout} />;
    if (screen === 'org-event-form') return <EventForm onNavigate={handleNavigate} onLogout={handleLogout} />;
    if (screen === 'org-participants') return <Participants onNavigate={handleNavigate} onLogout={handleLogout} />;
    if (screen === 'org-staff') return <Staff onNavigate={handleNavigate} onLogout={handleLogout} />;
    return <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  return null;
}

export default function App() {
  return (
    <UserProvider>
      <AppProvider>
        <ToastProvider>
          <AppInner />
        </ToastProvider>
      </AppProvider>
    </UserProvider>
  );
}
