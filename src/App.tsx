import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowLeft, ArrowRight, Bell, Bike, CalendarDays, Check, CheckCircle2,
  ChevronRight, CircleHelp, Clock3, Dumbbell, Ellipsis, HeartPulse, History,
  LogOut, Search, ShieldCheck, SlidersHorizontal, Sparkles, UserRound, X,
} from 'lucide-react';

type Tab = 'equipment' | 'reservations' | 'history' | 'profile';
type Category = 'Cardio' | 'Musculation';
type MachineStatus = 'Libre' | 'Occupé' | 'Réservé';
type Machine = { id: number; name: string; category: Category; status: MachineStatus; location: string; description: string; icon: typeof Activity; accent: string };
type Reservation = { id: string; machineId: number; date: string; start: number; status: 'Confirmée' | 'Terminée' | 'Annulée' };

const STORAGE_KEY = 'smartgym_reservations_v1';
const MACHINES: Machine[] = [
  { id: 1, name: 'Tapis de course 1', category: 'Cardio', status: 'Libre', location: 'Zone cardio · 1er étage', description: 'Un tapis performant pour vos séances d’endurance et de course à pied.', icon: Activity, accent: 'mint' },
  { id: 2, name: 'Vélo elliptique 2', category: 'Cardio', status: 'Occupé', location: 'Zone cardio · 1er étage', description: 'Un entraînement complet et doux pour les articulations.', icon: Bike, accent: 'blue' },
  { id: 3, name: 'Presse à jambes', category: 'Musculation', status: 'Libre', location: 'Espace musculation · RDC', description: 'Travaillez les quadriceps et les fessiers avec un mouvement guidé.', icon: Dumbbell, accent: 'peach' },
  { id: 4, name: 'Vélo droit 1', category: 'Cardio', status: 'Réservé', location: 'Zone cardio · 1er étage', description: 'Vélo de cardio avec résistance réglable et suivi de vos performances.', icon: Bike, accent: 'lavender' },
  { id: 5, name: 'Haltères guidés', category: 'Musculation', status: 'Libre', location: 'Espace musculation · RDC', description: 'Une station guidée pour progresser en toute sécurité.', icon: Dumbbell, accent: 'blue' },
  { id: 6, name: 'Rameur 2', category: 'Cardio', status: 'Libre', location: 'Zone cardio · 1er étage', description: 'Sollicitez l’ensemble du corps avec un mouvement fluide.', icon: Activity, accent: 'mint' },
  { id: 7, name: 'Poulie vis-à-vis', category: 'Musculation', status: 'Occupé', location: 'Espace musculation · RDC', description: 'Une station polyvalente pour varier vos exercices du haut du corps.', icon: Dumbbell, accent: 'peach' },
  { id: 8, name: 'Vélo elliptique 1', category: 'Cardio', status: 'Libre', location: 'Zone cardio · 1er étage', description: 'Entraînement cardiovasculaire à faible impact.', icon: Bike, accent: 'lavender' },
  { id: 9, name: 'Banc de développé', category: 'Musculation', status: 'Libre', location: 'Espace musculation · RDC', description: 'Banc réglable pour vos exercices de poussée et de renforcement.', icon: Dumbbell, accent: 'blue' },
  { id: 10, name: 'Tapis de course 2', category: 'Cardio', status: 'Réservé', location: 'Zone cardio · 1er étage', description: 'Tapis de course avec programmes d’entraînement personnalisés.', icon: Activity, accent: 'mint' },
  { id: 11, name: 'Vélo spinning 1', category: 'Cardio', status: 'Libre', location: 'Studio vélo · RDC', description: 'Vélo de spinning conçu pour les séances à haute intensité.', icon: Bike, accent: 'peach' },
  { id: 12, name: 'Presse pectorale', category: 'Musculation', status: 'Occupé', location: 'Espace musculation · RDC', description: 'Renforcez votre poitrine avec une trajectoire guidée.', icon: Dumbbell, accent: 'lavender' },
  { id: 13, name: 'Rameur 1', category: 'Cardio', status: 'Libre', location: 'Zone cardio · 1er étage', description: 'Un appareil complet pour travailler votre endurance.', icon: Activity, accent: 'blue' },
  { id: 14, name: 'Extension jambes', category: 'Musculation', status: 'Libre', location: 'Espace musculation · RDC', description: 'Machine ciblée pour renforcer les quadriceps.', icon: Dumbbell, accent: 'mint' },
  { id: 15, name: 'Vélo spinning 2', category: 'Cardio', status: 'Libre', location: 'Studio vélo · RDC', description: 'Réglez votre intensité et pédalez à votre rythme.', icon: Bike, accent: 'peach' },
  { id: 16, name: 'Tirage horizontal', category: 'Musculation', status: 'Libre', location: 'Espace musculation · RDC', description: 'Travaillez le dos et les épaules sur une station confortable.', icon: Dumbbell, accent: 'lavender' },
  { id: 17, name: 'Escalier cardio', category: 'Cardio', status: 'Occupé', location: 'Zone cardio · 1er étage', description: 'Montez en intensité sur cet appareil de cardio progressif.', icon: HeartPulse, accent: 'blue' },
  { id: 18, name: 'Smith machine', category: 'Musculation', status: 'Libre', location: 'Espace musculation · RDC', description: 'Barre guidée pour vos exercices de musculation en autonomie.', icon: Dumbbell, accent: 'mint' },
];

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'demo-1', machineId: 1, date: addDays(new Date(), 1), start: 17, status: 'Confirmée' },
  { id: 'demo-2', machineId: 3, date: addDays(new Date(), 3), start: 10, status: 'Confirmée' },
];

function addDays(date: Date, count: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return localDate(next);
}

function localDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(`${value}T12:00:00`));
}

function timeLabel(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function loadReservations(): Reservation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as Reservation[] : INITIAL_RESERVATIONS;
  } catch {
    return INITIAL_RESERVATIONS;
  }
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem('smartgym_signed_out') !== 'true');
  const [splash, setSplash] = useState(true);
  const [tab, setTab] = useState<Tab>('equipment');
  const [reservations, setReservations] = useState<Reservation[]>(loadReservations);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [bookingMachine, setBookingMachine] = useState<Machine | null>(null);
  const [bookingDate, setBookingDate] = useState(localDate(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [editingReservation, setEditingReservation] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [toast, setToast] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [historyPeriod, setHistoryPeriod] = useState('Tout');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setSplash(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations)); } catch { /* Local demo mode. */ }
  }, [reservations]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!selectedMachine && !cancelTarget) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedMachine(null);
        setCancelTarget(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedMachine, cancelTarget]);

  const futureReservations = useMemo(() => reservations
    .filter((reservation) => reservation.status === 'Confirmée' && reservation.date >= localDate(new Date()))
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start), [reservations]);
  const freeCount = MACHINES.filter((machine) => machine.status === 'Libre').length;
  const visibleMachines = MACHINES.filter((machine) => {
    const matchesQuery = machine.name.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'));
    const matchesFilter = filter === 'Tous' ||
      (filter === 'Libres' ? machine.status === 'Libre' : machine.category === filter);
    return matchesQuery && matchesFilter;
  });

  const openBooking = (machine: Machine, reservation?: Reservation) => {
    setSelectedMachine(null);
    setBookingMachine(machine);
    setBookingDate(reservation?.date ?? localDate(new Date()));
    setSelectedSlot(reservation?.start ?? null);
    setEditingReservation(reservation?.id ?? null);
    setConfirmation(null);
  };

  const confirmBooking = () => {
    if (!bookingMachine || selectedSlot === null) return;
    const newReservation: Reservation = {
      id: editingReservation ?? `reservation-${Date.now()}`,
      machineId: bookingMachine.id,
      date: bookingDate,
      start: selectedSlot,
      status: 'Confirmée',
    };
    setReservations((previous) => [
      ...previous.filter((reservation) => reservation.id !== editingReservation),
      newReservation,
    ]);
    setBookingMachine(null);
    setConfirmation(newReservation);
  };

  const cancelReservation = () => {
    if (!cancelTarget) return;
    setReservations((previous) => previous.filter((reservation) => reservation.id !== cancelTarget.id));
    setCancelTarget(null);
    setToast('Réservation annulée');
  };

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoginError('Adresse e-mail invalide');
      return;
    }
    if (password.length < 8) {
      setLoginError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    localStorage.removeItem('smartgym_signed_out');
    setAuthenticated(true);
    setLoginError('');
  };

  if (splash) return (
    <div className="splash">
      <span className="brand-mark"><Dumbbell size={27} strokeWidth={2.2} /></span>
      <strong>Smart Gym</strong>
      <span className="splash-loader" />
    </div>
  );

  if (!authenticated) return (
    <main className="login-page">
      <div className="login-brand"><span className="brand-mark"><Dumbbell size={25} /></span><span>Smart Gym</span></div>
      <form className="login-card" onSubmit={login}>
        <div className="eyebrow">RAVI DE VOUS REVOIR</div>
        <h1>Connexion</h1>
        <p className="muted">Accès réservé aux membres de la salle.</p>
        <label className="field-label" htmlFor="email">Adresse e-mail</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.fr" />
        <label className="field-label" htmlFor="password">Mot de passe</label>
        <div className="password-field">
          <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 caractères minimum" />
          <button type="button" className="text-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Masquer' : 'Afficher'}</button>
        </div>
        {loginError && <p className="form-error" role="alert">{loginError}</p>}
        <button className="button button-primary full-button" type="submit">Se connecter <ArrowRight size={17} /></button>
        <p className="login-note">Compte créé et activé par l’administrateur</p>
        <p className="login-help">Mot de passe oublié ? Contactez l’administrateur pour le réinitialiser.</p>
      </form>
      <p className="login-footer">Votre espace membre, en toute simplicité.</p>
    </main>
  );

  const machineForReservation = (reservation: Reservation) => MACHINES.find((machine) => machine.id === reservation.machineId)!;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => { setTab('equipment'); setBookingMachine(null); setConfirmation(null); }}>
          <span className="brand-mark"><Dumbbell size={22} strokeWidth={2.2} /></span>
          <span>smart<span className="brand-light">gym</span></span>
        </button>
        <div className="topbar-right">
          <span className={`live-indicator ${online ? '' : 'reconnecting'}`}><i />{online ? 'En direct' : 'Reconnexion...'}</span>
          <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setToast('Vous êtes à jour !')}><Bell size={19} /><i /></button>
          <button className="avatar-button" aria-label="Ouvrir mon profil" onClick={() => setTab('profile')}>ML</button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <div className="side-label">VOTRE ESPACE</div>
          <Navigation tab={tab} onSelect={(next) => { setTab(next); setBookingMachine(null); setConfirmation(null); }} />
          <div className="sidebar-bottom">
            <div className="help-card"><span className="help-icon"><CircleHelp size={18} /></span><strong>Besoin d’aide ?</strong><p>Notre équipe est là pour vous.</p><button onClick={() => setToast('Adressez-vous à l’accueil de la salle.')}>Contacter l’accueil <ArrowRight size={14} /></button></div>
            <div className="member-mini"><span className="avatar">ML</span><span><b>Marie Laurent</b><small>Membre · depuis 2024</small></span><Ellipsis size={18} className="member-more" /></div>
          </div>
        </aside>

        <main className="main-content">
          {bookingMachine ? (
            <BookingScreen
              machine={bookingMachine}
              date={bookingDate}
              setDate={(date) => { setBookingDate(date); setSelectedSlot(null); }}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              reservations={reservations.filter((reservation) => reservation.id !== editingReservation)}
              onBack={() => setBookingMachine(null)}
              onConfirm={confirmBooking}
            />
          ) : confirmation ? (
            <div className="confirmation-page">
              <div className="success-check"><Check size={34} /></div>
              <p className="eyebrow">C’EST RÉSERVÉ !</p>
              <h1>À vous de jouer.</h1>
              <p className="muted">Votre équipement vous attend. On se retrouve à la salle !</p>
              <div className="confirmation-card">
                <span className={`equipment-icon ${machineForReservation(confirmation).accent}`}><Dumbbell size={23} /></span>
                <div><strong>{machineForReservation(confirmation).name}</strong><p>{formatDate(confirmation.date)} · {timeLabel(confirmation.start)} – {timeLabel(confirmation.start + 1)}</p></div>
                <CheckCircle2 size={20} className="confirmed-icon" />
              </div>
              <div className="confirmation-actions"><button className="button button-primary" onClick={() => { setTab('reservations'); setConfirmation(null); }}>Voir mes réservations</button><button className="button button-secondary" onClick={() => setConfirmation(null)}>Retour aux équipements</button></div>
            </div>
          ) : (
            <>
              {tab === 'equipment' && <EquipmentScreen machines={visibleMachines} allCount={MACHINES.length} freeCount={freeCount} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} onDetails={setSelectedMachine} onBook={openBooking} />}
              {tab === 'reservations' && <ReservationsScreen reservations={futureReservations} machineForReservation={machineForReservation} onEdit={(reservation) => openBooking(machineForReservation(reservation), reservation)} onCancel={setCancelTarget} onBook={() => setTab('equipment')} />}
              {tab === 'history' && <HistoryScreen period={historyPeriod} setPeriod={setHistoryPeriod} />}
              {tab === 'profile' && <ProfileScreen onSignOut={() => { localStorage.setItem('smartgym_signed_out', 'true'); setAuthenticated(false); }} />}
            </>
          )}
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Navigation principale">
        <Navigation tab={tab} onSelect={(next) => { setTab(next); setBookingMachine(null); setConfirmation(null); }} mobile />
      </nav>

      {selectedMachine && <MachineDetails machine={selectedMachine} reservations={reservations} onClose={() => setSelectedMachine(null)} onBook={() => openBooking(selectedMachine)} />}
      {cancelTarget && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancelTarget(null); }}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-title"><span className="modal-icon warning-icon"><CalendarDays size={21} /></span><button className="modal-close" aria-label="Fermer" onClick={() => setCancelTarget(null)}><X size={19} /></button><h2 id="cancel-title">Annuler cette réservation ?</h2><p>Voulez-vous vraiment annuler votre créneau sur {machineForReservation(cancelTarget).name} ?</p><div className="modal-actions"><button className="button button-secondary" onClick={() => setCancelTarget(null)}>Garder</button><button className="button button-danger" onClick={cancelReservation}>Annuler la réservation</button></div></div></div>}
      {toast && <div className="toast" role="status"><CheckCircle2 size={19} />{toast}<button aria-label="Fermer" onClick={() => setToast('')}><X size={16} /></button></div>}
    </div>
  );
}

function Navigation({ tab, onSelect, mobile = false }: { tab: Tab; onSelect: (tab: Tab) => void; mobile?: boolean }) {
  const items: { id: Tab; label: string; icon: typeof Activity }[] = [
    { id: 'equipment', label: 'Équipements', icon: Dumbbell },
    { id: 'reservations', label: 'Mes réservations', icon: CalendarDays },
    { id: 'history', label: 'Historique', icon: History },
    { id: 'profile', label: 'Profil', icon: UserRound },
  ];
  return <div className={mobile ? 'mobile-nav-items' : 'side-nav'}>{items.map(({ id, label, icon: Icon }) => (
    <button key={id} type="button" className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => onSelect(id)}>
      <Icon size={19} strokeWidth={tab === id ? 2.2 : 1.8} /><span>{label}</span>
      {id === 'reservations' && !mobile && <span className="nav-count">2</span>}
    </button>
  ))}</div>;
}

function EquipmentScreen({ machines, allCount, freeCount, query, setQuery, filter, setFilter, onDetails, onBook }: {
  machines: Machine[]; allCount: number; freeCount: number; query: string; setQuery: (value: string) => void;
  filter: string; setFilter: (value: string) => void; onDetails: (machine: Machine) => void;
  onBook: (machine: Machine) => void;
}) {
  return <div className="screen">
    <div className="page-heading">
      <div><div className="eyebrow">VOTRE SALLE, À VOTRE RYTHME</div><h1>Équipements de la salle<span className="heading-period">.</span></h1><p>Choisissez votre prochain entraînement.</p></div>
      <div className="heading-decoration"><span className="decoration-circle circle-one" /><span className="decoration-circle circle-two" /><Dumbbell size={44} strokeWidth={1.3} /></div>
    </div>
    <div className="welcome-strip"><span className="welcome-spark"><Sparkles size={17} /></span><span>Bonjour Marie, <b>prête à bouger aujourd’hui ?</b></span><span className="welcome-date">{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span></div>
    <div className="overview-row">
      <div className="availability-card"><div className="availability-main"><span className="availability-icon"><Activity size={18} /></span><span><b>{freeCount} équipements libres</b><small>sur {allCount} dans votre salle</small></span></div><div className="availability-meter"><span style={{ width: `${(freeCount / allCount) * 100}%` }} /></div><div className="availability-foot"><span>Mis à jour en temps réel</span><span>{Math.round(freeCount / allCount * 100)} % disponibles</span></div></div>
      <div className="tip-card"><div className="tip-icon"><HeartPulse size={19} /></div><span className="eyebrow">LE CONSEIL DU JOUR</span><p>10 minutes d’échauffement, et c’est parti !</p><span className="tip-sun">✳</span></div>
    </div>
    <section className="equipment-section">
      <div className="section-heading"><div><h2>Trouvez votre équipement</h2><p>Réservez votre créneau en quelques secondes.</p></div><span className="result-count">{machines.length} équipements</span></div>
      <div className="equipment-toolbar">
        <label className="search-field"><Search size={18} /><input type="search" placeholder="Rechercher un équipement..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>
        <div className="filter-list" aria-label="Filtrer par catégorie"><SlidersHorizontal className="filter-icon" size={16} />{['Tous', 'Libres', 'Cardio', 'Musculation'].map((option) => <button key={option} className={`filter-chip ${filter === option ? 'selected' : ''}`} onClick={() => setFilter(option)}>{option}</button>)}</div>
      </div>
      {machines.length ? <div className="machine-grid">{machines.map((machine, index) => <MachineCard key={machine.id} machine={machine} index={index} onDetails={() => onDetails(machine)} onBook={() => onBook(machine)} />)}</div> : <EmptyState title="Aucun équipement trouvé" description="Essayez un autre nom ou modifiez vos filtres." />}
    </section>
  </div>;
}

function MachineCard({ machine, index, onDetails, onBook }: { machine: Machine; index: number; onDetails: () => void; onBook: () => void }) {
  const Icon = machine.icon;
  return <article className="machine-card" style={{ animationDelay: `${Math.min(index, 9) * 35}ms` }}>
    <button className="machine-card-main" onClick={onDetails} aria-label={`Voir le détail de ${machine.name}`}>
      <span className={`equipment-icon ${machine.accent}`}><Icon size={22} strokeWidth={1.8} /></span>
      <span className={`status-dot ${machine.status.toLowerCase()}`} aria-label={machine.status} />
      <span className="machine-copy"><strong>{machine.name}</strong><small>{machine.category} <i /> {machine.location.split(' · ')[0]}</small></span>
      <ChevronRight className="machine-chevron" size={17} />
    </button>
    <div className="machine-card-bottom"><StatusPill status={machine.status} /><button className={`machine-action ${machine.status === 'Libre' ? 'available' : ''}`} onClick={machine.status === 'Libre' ? onBook : onDetails}>{machine.status === 'Libre' ? 'Réserver' : machine.status === 'Réservé' ? 'Réservé · 18:00' : 'Indisponible'}{machine.status === 'Libre' && <ArrowRight size={14} />}</button></div>
  </article>;
}

function StatusPill({ status }: { status: MachineStatus }) {
  return <span className={`status-pill ${status.toLowerCase()}`}><i />{status}</span>;
}

function MachineDetails({ machine, reservations, onClose, onBook }: { machine: Machine; reservations: Reservation[]; onClose: () => void; onBook: () => void }) {
  const Icon = machine.icon;
  const today = localDate(new Date());
  const bookedHours = reservations.filter((reservation) => reservation.machineId === machine.id && reservation.date === today).map((reservation) => reservation.start);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title">
    <button className="modal-close" aria-label="Fermer" onClick={onClose}><X size={19} /></button>
    <div className={`detail-hero ${machine.accent}`}><span className="equipment-icon large"><Icon size={30} /></span><span className="detail-category">{machine.category}</span><StatusPill status={machine.status} /></div>
    <div className="details-content"><div><span className="eyebrow">VOTRE PROCHAIN OBJECTIF</span><h2 id="details-title">{machine.name}</h2><p className="detail-location"><span className="location-pin" />{machine.location}</p><p className="detail-description">{machine.description}</p></div>
      <div className="schedule-heading"><div><h3>Planning du jour</h3><p>Choisissez un créneau d’une heure.</p></div><span>{new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date())}</span></div>
      <div className="schedule-grid">{Array.from({ length: 13 }, (_, index) => index + 8).map((hour) => {
        const taken = (hour === 9 || hour === 13 || hour === 19 || bookedHours.includes(hour)) && machine.status !== 'Occupé';
        const past = today === localDate(new Date()) && hour <= new Date().getHours();
        return <span key={hour} className={`schedule-slot ${taken || past || machine.status === 'Occupé' ? 'taken' : 'free'}`}><i />{timeLabel(hour)}</span>;
      })}</div>
      <div className="schedule-legend"><span><i className="legend-free" />Disponible</span><span><i className="legend-busy" />Indisponible</span></div>
      <button className="button button-primary full-button detail-book-button" disabled={machine.status !== 'Libre'} onClick={onBook}>Réserver cet équipement <ArrowRight size={17} /></button>
    </div>
  </section></div>;
}

function BookingScreen({ machine, date, setDate, selectedSlot, setSelectedSlot, reservations, onBack, onConfirm }: {
  machine: Machine; date: string; setDate: (date: string) => void; selectedSlot: number | null;
  setSelectedSlot: (slot: number) => void; reservations: Reservation[]; onBack: () => void; onConfirm: () => void;
}) {
  const today = localDate(new Date());
  const maxDate = addDays(new Date(), 7);
  const existingHours = reservations.filter((reservation) => reservation.machineId === machine.id && reservation.date === date).map((reservation) => reservation.start);
  const blockedHours = new Set([9, 13, 19, ...existingHours]);
  const availableSlots = Array.from({ length: 13 }, (_, index) => index + 8).filter((hour) => hour > new Date().getHours() || date !== today);
  const Icon = machine.icon;
  return <div className="screen booking-screen">
    <button className="back-link" onClick={onBack}><ArrowLeft size={17} /> Retour aux équipements</button>
    <div className="booking-title"><div className="eyebrow">VOTRE SÉANCE, VOTRE MOMENT</div><h1>Réserver un équipement<span className="heading-period">.</span></h1><p>Plus qu’un créneau et votre prochaine séance est planifiée.</p></div>
    <div className="booking-layout">
      <section className="booking-main">
        <div className="booking-step"><span className="step-number">01</span><div className="step-content"><div className="step-heading"><h2>Choisissez votre équipement</h2><span>1 sélectionné</span></div><div className="selected-equipment"><span className={`equipment-icon ${machine.accent}`}><Icon size={22} /></span><span><b>{machine.name}</b><small>{machine.category} · {machine.location}</small></span><CheckCircle2 size={20} className="selected-check" /></div></div></div>
        <div className="booking-step"><span className="step-number">02</span><div className="step-content"><div className="step-heading"><h2>Choisissez la date</h2><span>Jusqu’à 7 jours à l’avance</span></div><label className="date-input-wrap"><CalendarDays size={18} /><input type="date" min={today} max={maxDate} value={date} onChange={(event) => setDate(event.target.value)} /></label><div className="date-shortcuts">{Array.from({ length: 5 }, (_, index) => addDays(new Date(), index)).map((value) => <button key={value} className={`date-shortcut ${date === value ? 'chosen' : ''}`} onClick={() => setDate(value)}><small>{indexDay(value)}</small><b>{new Date(`${value}T12:00:00`).getDate()}</b></button>)}</div></div></div>
        <div className="booking-step"><span className="step-number">03</span><div className="step-content"><div className="step-heading"><h2>Choisissez un créneau</h2><span>1 heure par réservation</span></div><div className="time-slots">{availableSlots.map((hour) => {
          const unavailable = blockedHours.has(hour) || machine.status !== 'Libre';
          return <button key={hour} disabled={unavailable} className={`time-slot ${selectedSlot === hour ? 'chosen' : ''}`} onClick={() => setSelectedSlot(hour)}>{timeLabel(hour)}</button>;
        })}</div><div className="slot-hint"><span className="hint-dot available-dot" />Disponible<span className="hint-dot unavailable-dot" />Indisponible</div></div></div>
      </section>
      <aside className="booking-summary"><div className="summary-top"><span className="summary-icon"><ShieldCheck size={20} /></span><span className="eyebrow">RÉCAPITULATIF</span></div><h3>Votre réservation</h3><p className="summary-intro">Vérifiez les détails avant de confirmer.</p><div className="summary-divider" /><div className="summary-detail"><span>Équipement</span><b>{machine.name}</b></div><div className="summary-detail"><span>Date</span><b>{formatDate(date)}</b></div><div className="summary-detail"><span>Créneau</span><b>{selectedSlot !== null ? `${timeLabel(selectedSlot)} – ${timeLabel(selectedSlot + 1)}` : 'À sélectionner'}</b></div><div className="summary-note"><Clock3 size={15} /><span>Présentez-vous quelques minutes avant votre séance.</span></div><button className="button button-primary full-button" disabled={selectedSlot === null} onClick={onConfirm}>Confirmer la réservation <ArrowRight size={16} /></button><button className="summary-cancel" onClick={onBack}>Annuler</button><p className="secure-note"><ShieldCheck size={13} />Annulation gratuite depuis vos réservations</p></aside>
    </div>
  </div>;
}

function indexDay(value: string) {
  const offset = Math.round((new Date(`${value}T12:00:00`).getTime() - new Date(`${localDate(new Date())}T12:00:00`).getTime()) / 86400000);
  return offset === 0 ? 'Aujourd’hui' : offset === 1 ? 'Demain' : new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(new Date(`${value}T12:00:00`));
}

function ReservationsScreen({ reservations, machineForReservation, onEdit, onCancel, onBook }: {
  reservations: Reservation[]; machineForReservation: (reservation: Reservation) => Machine;
  onEdit: (reservation: Reservation) => void; onCancel: (reservation: Reservation) => void; onBook: () => void;
}) {
  return <div className="screen">
    <div className="page-heading simple-heading"><div><div className="eyebrow">ON GARDE LE RYTHME</div><h1>Mes réservations<span className="heading-period">.</span></h1><p>Retrouvez et gérez vos prochaines séances.</p></div><span className="heading-icon"><CalendarDays size={25} /></span></div>
    <div className="reservation-summary"><span className="summary-icon"><CalendarDays size={19} /></span><span><b>{reservations.length} séance{reservations.length > 1 ? 's' : ''} à venir</b><small>Votre prochain rendez-vous approche !</small></span><span className="summary-decoration"><Activity size={25} /></span></div>
    {reservations.length ? <div className="reservation-list">{reservations.map((reservation) => {
      const machine = machineForReservation(reservation);
      const Icon = machine.icon;
      return <article key={reservation.id} className="reservation-card"><div className="reservation-date"><b>{new Date(`${reservation.date}T12:00:00`).getDate()}</b><span>{new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(new Date(`${reservation.date}T12:00:00`)).replace('.', '')}</span></div><span className={`equipment-icon ${machine.accent}`}><Icon size={22} /></span><div className="reservation-info"><div className="reservation-name-row"><h3>{machine.name}</h3><span className="confirmed-pill"><i />Confirmée</span></div><p>{machine.category} · {machine.location}</p><div className="reservation-time"><CalendarDays size={14} />{formatDate(reservation.date)}<i /> <Clock3 size={14} />{timeLabel(reservation.start)} – {timeLabel(reservation.start + 1)}</div></div><div className="reservation-actions"><button className="button button-secondary" onClick={() => onEdit(reservation)}>Modifier</button><button className="cancel-link" onClick={() => onCancel(reservation)}>Annuler</button></div></article>;
    })}</div> : <EmptyState title="Aucune réservation à venir" description="Votre prochain entraînement n’attend que vous." action="Réserver un équipement" onAction={onBook} />}
  </div>;
}

function HistoryScreen({ period, setPeriod }: { period: string; setPeriod: (period: string) => void }) {
  const now = new Date();
  const history: Reservation[] = [
    { id: 'history-1', machineId: 5, date: addDays(now, -2), start: 9, status: 'Terminée' as Reservation['status'] },
    { id: 'history-2', machineId: 2, date: addDays(now, -5), start: 17, status: 'Annulée' as Reservation['status'] },
    { id: 'history-3', machineId: 11, date: addDays(now, -12), start: 12, status: 'Terminée' as Reservation['status'] },
    { id: 'history-4', machineId: 3, date: addDays(now, -22), start: 10, status: 'Terminée' as Reservation['status'] },
  ];
  const days = period === '7 jours' ? 7 : period === '30 jours' ? 30 : Infinity;
  const entries = history.filter((reservation) => days === Infinity || (now.getTime() - new Date(`${reservation.date}T12:00:00`).getTime()) / 86400000 <= days);
  return <div className="screen"><div className="page-heading simple-heading"><div><div className="eyebrow">CHAQUE SÉANCE COMPTE</div><h1>Votre historique<span className="heading-period">.</span></h1><p>Un aperçu de votre régularité et de vos séances passées.</p></div><span className="heading-icon"><History size={25} /></span></div>
    <div className="history-toolbar"><div><h2>Activité récente</h2><p>{entries.length} séances enregistrées</p></div><div className="period-filter">{['7 jours', '30 jours', 'Tout'].map((option) => <button key={option} className={period === option ? 'selected' : ''} onClick={() => setPeriod(option)}>{option}</button>)}</div></div>
    {entries.length ? <div className="history-list">{entries.map((reservation) => { const machine = MACHINES.find((item) => item.id === reservation.machineId)!; const Icon = machine.icon; return <article className="history-item" key={reservation.id}><span className={`equipment-icon small ${machine.accent}`}><Icon size={18} /></span><div className="history-info"><b>{machine.name}</b><span>{formatDate(reservation.date)} · {timeLabel(reservation.start)} – {timeLabel(reservation.start + 1)}</span></div><span className={`history-status ${reservation.status === 'Terminée' ? 'done' : 'cancelled'}`}><i />{reservation.status}</span><ChevronRight size={17} className="history-chevron" /></article>; })}</div> : <EmptyState title="Aucune séance sur cette période" description="Vos réservations passées apparaîtront ici." />}
    <div className="history-note"><Sparkles size={18} /><span><b>La régularité fait la différence.</b> Chaque séance vous rapproche de vos objectifs.</span></div>
  </div>;
}

function ProfileScreen({ onSignOut }: { onSignOut: () => void }) {
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  return <div className="screen profile-screen"><div className="page-heading simple-heading"><div><div className="eyebrow">VOTRE ESPACE PERSONNEL</div><h1>Mon profil<span className="heading-period">.</span></h1><p>Vos informations de membre et préférences.</p></div><span className="heading-icon"><UserRound size={25} /></span></div>
    <section className="profile-card"><div className="profile-cover"><span className="profile-avatar">ML</span><div><h2>Marie Laurent</h2><p>Membre depuis le 14/03/2024</p></div><span className="member-tag"><ShieldCheck size={14} />Membre actif</span></div><div className="profile-details"><ProfileField label="Adresse e-mail" value="marie.laurent@email.fr" /><ProfileField label="Abonnement" value="Essentiel · Accès illimité" /><ProfileField label="Date d’inscription" value="14/03/2024" /><ProfileField label="Salle de rattachement" value="Smart Gym · République" /></div><p className="profile-admin-note"><ShieldCheck size={16} />Ces informations sont gérées par l’administration de votre salle.</p></section>
    <section className="settings-card"><div><h3>Votre application</h3><p>Une expérience pensée pour vous accompagner.</p></div><div className="version-row"><span>Version</span><b>1.0.0</b></div></section>
    <section className="signout-card"><span className="signout-icon"><LogOut size={19} /></span><div><b>Besoin de faire une pause ?</b><p>Vous pourrez vous reconnecter à tout moment.</p></div><button className="button button-secondary" onClick={() => setConfirmSignOut(true)}>Se déconnecter <ArrowRight size={15} /></button></section>
    {confirmSignOut && <div className="modal-backdrop"><div className="confirm-modal" role="dialog" aria-modal="true"><span className="modal-icon warning-icon"><LogOut size={20} /></span><button className="modal-close" onClick={() => setConfirmSignOut(false)} aria-label="Fermer"><X size={19} /></button><h2>Se déconnecter ?</h2><p>Vous devrez vous reconnecter pour retrouver votre espace membre.</p><div className="modal-actions"><button className="button button-secondary" onClick={() => setConfirmSignOut(false)}>Rester connecté</button><button className="button button-danger" onClick={onSignOut}>Se déconnecter</button></div></div></div>}
  </div>;
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return <div className="profile-field"><span>{label}</span><b>{value}</b></div>;
}

function EmptyState({ title, description, action, onAction }: { title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="empty-state"><span className="empty-icon"><Search size={22} /></span><h3>{title}</h3><p>{description}</p>{action && <button className="button button-primary" onClick={onAction}>{action}<ArrowRight size={16} /></button>}</div>;
}
