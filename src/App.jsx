import React, { useState, useEffect } from 'react';

// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================
const SUPABASE_URL = 'https://ewvgrtalxwrssfyuopmc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dmdydGFseHdyc3NmeXVvcG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODAyMDgsImV4cCI6MjA4NDA1NjIwOH0.wANHY-m4Dn4e2qxJgliF9zalf8BQx9KEsLOzqWxq5Lg';

// ============================================
// HELPER PARA SUPABASE
// ============================================
const supabaseRequest = async (endpoint, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };
  
  if (options.method === 'POST') {
    headers['Prefer'] = 'return=representation';
  }
  
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase error:', response.status, errorText);
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// ============================================
// UTILIDADES
// ============================================
const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  return timeStr.substring(0, 5);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
};

const calcularHoras = (registro) => {
  if (!registro) return { trabajadas: 0, extras: 0 };
  
  const parseTime = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  
  const entrada = parseTime(registro.entrada);
  const salidaComida = parseTime(registro.salida_comida);
  const entradaComida = parseTime(registro.entrada_comida);
  const salida = parseTime(registro.salida_tarde);
  
  let minutosTrabajados = 0;
  
  if (entrada && salidaComida) {
    minutosTrabajados += salidaComida - entrada;
  }
  if (entradaComida && salida) {
    minutosTrabajados += salida - entradaComida;
  }
  
  const horasTrabajadas = minutosTrabajados / 60;
  const horasExtras = Math.max(0, horasTrabajadas - 8);
  
  return { trabajadas: horasTrabajadas, extras: horasExtras };
};

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// ============================================
// ICONOS
// ============================================
const Icons = {
  Sun: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Coffee: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  Utensils: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  ),
  Moon: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  Plus: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
};

// ============================================
// ESTILOS
// ============================================
const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    padding: '30px 20px',
    color: 'white',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '5px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.7,
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '16px',
    marginBottom: '12px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
  },
  buttonDisabled: {
    background: '#94a3b8',
    cursor: 'not-allowed',
  },
  fichajeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  fichajeCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  fichajeIcon: {
    color: '#2563eb',
    marginBottom: '8px',
  },
  fichajeLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '4px',
  },
  fichajeTime: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '10px',
  },
  fichajeBtn: {
    padding: '8px 16px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  ubicacionBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
  },
  ubicacionOk: {
    background: '#dcfce7',
    color: '#166534',
  },
  ubicacionError: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  summaryCard: {
    background: '#f0f9ff',
    borderRadius: '12px',
    padding: '16px',
  },
  summaryTitle: {
    fontSize: '14px',
    color: '#0369a1',
    marginBottom: '12px',
    fontWeight: '600',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  summaryItem: {
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#64748b',
    display: 'block',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
  },
  // Admin styles
  adminHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    color: 'white',
  },
  adminTitle: {
    fontSize: '20px',
    fontWeight: '700',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    padding: '0 20px',
    marginBottom: '20px',
    overflowX: 'auto',
  },
  tab: {
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    background: 'white',
    color: '#1e3a5f',
  },
  adminContent: {
    padding: '0 20px 20px',
  },
  filterRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  filterInput: {
    flex: 1,
    minWidth: '140px',
    padding: '10px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '12px 8px',
    borderBottom: '2px solid #e2e8f0',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '12px',
  },
  td: {
    padding: '12px 8px',
    borderBottom: '1px solid #f1f5f9',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  messageSuccess: {
    background: '#dcfce7',
    color: '#166534',
  },
  messageError: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  ubicacionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  deleteBtn: {
    background: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
  },
};

// ============================================
// COMPONENTE: LOGIN
// ============================================
const Login = ({ onLogin }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const data = await supabaseRequest('usuarios?select=id,nombre,rol');
        setUsuarios(data || []);
      } catch (err) {
        console.error('Error cargando usuarios:', err);
        setError('Error de conexión');
      }
      setCargando(false);
    };
    cargarUsuarios();
  }, []);

  const handleLogin = async () => {
    if (!selectedUser || !pin) {
      setError('Selecciona usuario e introduce PIN');
      return;
    }

    try {
      const data = await supabaseRequest(`usuarios?id=eq.${selectedUser}&pin=eq.${pin}&select=*`);
      if (data && data.length > 0) {
        onLogin(data[0]);
      } else {
        setError('PIN incorrecto');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  if (cargando) {
    return (
      <div style={styles.app}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo}>⏱️ Control Viajes</div>
            <div style={styles.subtitle}>Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>⏱️ Control Viajes</div>
          <div style={styles.subtitle}>GNC Hipatia</div>
        </div>

        <div style={styles.card}>
          <select
            style={styles.input}
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Selecciona tu nombre</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>

          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="PIN"
            style={styles.input}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          {error && (
            <div style={{ ...styles.message, ...styles.messageError }}>
              {error}
            </div>
          )}

          <button style={styles.button} onClick={handleLogin}>
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: PANEL TÉCNICO
// ============================================
const TecnicoPanel = ({ usuario, onLogout }) => {
  const [registroHoy, setRegistroHoy] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [ubicacionValida, setUbicacionValida] = useState(false);
  const [ubicacionNombre, setUbicacionNombre] = useState('');
  const [cargando, setCargando] = useState(true);
  const [fichando, setFichando] = useState(false);
  const [horaActual, setHoraActual] = useState(new Date());

  const hoy = new Date().toISOString().split('T')[0];

  // Reloj
  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar registro de hoy
        const registros = await supabaseRequest(
          `registros?usuario_id=eq.${usuario.id}&fecha=eq.${hoy}&select=*`
        );
        setRegistroHoy(registros?.[0] || null);

        // Cargar ubicaciones
        const ubics = await supabaseRequest('ubicaciones?activa=eq.true&select=*');
        setUbicaciones(ubics || []);
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
      setCargando(false);
    };
    cargarDatos();
  }, [usuario.id, hoy]);

  // Geolocalización - CORREGIDO: usar latitude/longitude del navegador
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // CORRECCIÓN: El navegador devuelve 'latitude' y 'longitude', NO 'lat' y 'lng'
          const { latitude, longitude } = pos.coords;
          setUbicacionActual({ latitud: latitude, longitud: longitude });

          // Verificar si está en alguna ubicación autorizada
          let enUbicacion = false;
          let nombreUbicacion = '';

          for (const ubic of ubicaciones) {
            const distancia = calcularDistancia(
              latitude, longitude,
              parseFloat(ubic.latitud), parseFloat(ubic.longitud)
            );
            if (distancia <= ubic.radio) {
              enUbicacion = true;
              nombreUbicacion = ubic.nombre;
              break;
            }
          }

          setUbicacionValida(enUbicacion);
          setUbicacionNombre(nombreUbicacion);
        },
        (err) => {
          console.error('Error GPS:', err);
          setUbicacionValida(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [ubicaciones]);

  const fichar = async (tipo) => {
    if (!ubicacionValida || fichando) return;

    setFichando(true);
    const ahora = new Date();
    const hora = ahora.toTimeString().substring(0, 8);

    try {
      if (!registroHoy) {
        // Crear nuevo registro
        const nuevoRegistro = {
          usuario_id: usuario.id,
          fecha: hoy,
          [tipo]: hora,
          [`ubicacion_${tipo}`]: ubicacionNombre,
        };
        const data = await supabaseRequest('registros', {
          method: 'POST',
          body: JSON.stringify(nuevoRegistro),
        });
        setRegistroHoy(data?.[0]);
      } else {
        // Actualizar registro existente
        await supabaseRequest(`registros?id=eq.${registroHoy.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            [tipo]: hora,
            [`ubicacion_${tipo}`]: ubicacionNombre,
          }),
        });
        setRegistroHoy({ ...registroHoy, [tipo]: hora });
      }
    } catch (err) {
      console.error('Error fichando:', err);
      alert('Error al fichar. Inténtalo de nuevo.');
    }

    setFichando(false);
  };

  const { trabajadas, extras } = calcularHoras(registroHoy);

  if (cargando) {
    return (
      <div style={styles.app}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo}>⏱️ Control Viajes</div>
            <div style={styles.subtitle}>Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>
            {horaActual.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={styles.subtitle}>
            {horaActual.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>{usuario.nombre}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Técnico</div>
            </div>
            <button onClick={onLogout} style={{ ...styles.logoutBtn, background: '#f1f5f9', color: '#64748b' }}>
              <Icons.LogOut />
            </button>
          </div>

          <div style={{
            ...styles.ubicacionBadge,
            ...(ubicacionValida ? styles.ubicacionOk : styles.ubicacionError)
          }}>
            <Icons.MapPin />
            {ubicacionValida ? `📍 ${ubicacionNombre}` : '⚠️ Fuera de zona autorizada'}
          </div>

          <div style={styles.fichajeGrid}>
            <div style={styles.fichajeCard}>
              <div style={styles.fichajeIcon}><Icons.Sun /></div>
              <div style={styles.fichajeLabel}>Entrada</div>
              <div style={styles.fichajeTime}>{formatTime(registroHoy?.entrada)}</div>
              <button
                style={{ ...styles.fichajeBtn, opacity: registroHoy?.entrada || !ubicacionValida ? 0.5 : 1 }}
                onClick={() => fichar('entrada')}
                disabled={registroHoy?.entrada || !ubicacionValida || fichando}
              >
                {registroHoy?.entrada ? '✓' : 'Fichar'}
              </button>
            </div>

            <div style={styles.fichajeCard}>
              <div style={styles.fichajeIcon}><Icons.Coffee /></div>
              <div style={styles.fichajeLabel}>Salida comida</div>
              <div style={styles.fichajeTime}>{formatTime(registroHoy?.salida_comida)}</div>
              <button
                style={{ ...styles.fichajeBtn, opacity: registroHoy?.salida_comida || !registroHoy?.entrada || !ubicacionValida ? 0.5 : 1 }}
                onClick={() => fichar('salida_comida')}
                disabled={registroHoy?.salida_comida || !registroHoy?.entrada || !ubicacionValida || fichando}
              >
                {registroHoy?.salida_comida ? '✓' : 'Fichar'}
              </button>
            </div>

            <div style={styles.fichajeCard}>
              <div style={styles.fichajeIcon}><Icons.Utensils /></div>
              <div style={styles.fichajeLabel}>Vuelta comida</div>
              <div style={styles.fichajeTime}>{formatTime(registroHoy?.entrada_comida)}</div>
              <button
                style={{ ...styles.fichajeBtn, opacity: registroHoy?.entrada_comida || !registroHoy?.salida_comida || !ubicacionValida ? 0.5 : 1 }}
                onClick={() => fichar('entrada_comida')}
                disabled={registroHoy?.entrada_comida || !registroHoy?.salida_comida || !ubicacionValida || fichando}
              >
                {registroHoy?.entrada_comida ? '✓' : 'Fichar'}
              </button>
            </div>

            <div style={styles.fichajeCard}>
              <div style={styles.fichajeIcon}><Icons.Moon /></div>
              <div style={styles.fichajeLabel}>Salida tarde</div>
              <div style={styles.fichajeTime}>{formatTime(registroHoy?.salida_tarde)}</div>
              <button
                style={{ ...styles.fichajeBtn, opacity: registroHoy?.salida_tarde || !registroHoy?.entrada_comida || !ubicacionValida ? 0.5 : 1 }}
                onClick={() => fichar('salida_tarde')}
                disabled={registroHoy?.salida_tarde || !registroHoy?.entrada_comida || !ubicacionValida || fichando}
              >
                {registroHoy?.salida_tarde ? '✓' : 'Fichar'}
              </button>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Resumen del día</h3>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Horas trabajadas</span>
                <span style={styles.summaryValue}>{trabajadas.toFixed(1)}h</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Horas extras</span>
                <span style={{ ...styles.summaryValue, color: extras > 0 ? '#f59e0b' : '#6b7280' }}>
                  {extras.toFixed(1)}h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: PANEL ADMINISTRADOR
// ============================================
const AdminPanel = ({ usuario, onLogout }) => {
  const [vista, setVista] = useState('registros');
  const [usuarios, setUsuarios] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  // Filtros
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');

  // Nueva ubicación
  const [nuevaUbicacion, setNuevaUbicacion] = useState({
    nombre: '',
    lat: '',
    lng: '',
    radio: 200
  });

  // Nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    pin: '',
    rol: 'tecnico'
  });

  const cargarDatos = async () => {
    try {
      const [usrs, regs, ubics] = await Promise.all([
        supabaseRequest('usuarios?select=*'),
        supabaseRequest('registros?select=*&order=fecha.desc,created_at.desc'),
        supabaseRequest('ubicaciones?select=*'),
      ]);
      setUsuarios(usrs || []);
      setRegistros(regs || []);
      setUbicaciones(ubics || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setMensaje({ tipo: 'error', texto: 'Error cargando datos' });
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Auto-limpiar mensajes
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const getNombreUsuario = (id) => {
    const u = usuarios.find(u => u.id === id);
    return u ? u.nombre : 'Desconocido';
  };

  const registrosFiltrados = registros.filter(r => {
    if (filtroFecha && r.fecha !== filtroFecha) return false;
    if (filtroUsuario && r.usuario_id !== parseInt(filtroUsuario)) return false;
    return true;
  });

  const agregarUbicacion = async () => {
    const { nombre, lat: latStr, lng: lngStr, radio } = nuevaUbicacion;
    
    // Validación
    if (!nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'Introduce un nombre para la ubicación' });
      return;
    }
    
    if (!latStr || !lngStr) {
      setMensaje({ tipo: 'error', texto: 'Introduce las coordenadas (latitud y longitud)' });
      return;
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      setMensaje({ tipo: 'error', texto: 'Las coordenadas deben ser números válidos (usa punto, no coma)' });
      return;
    }

    if (lat < -90 || lat > 90) {
      setMensaje({ tipo: 'error', texto: 'La latitud debe estar entre -90 y 90' });
      return;
    }

    if (lng < -180 || lng > 180) {
      setMensaje({ tipo: 'error', texto: 'La longitud debe estar entre -180 y 180' });
      return;
    }

    try {
      // Enviar con los nombres de campo de la base de datos (latitud/longitud)
      await supabaseRequest('ubicaciones', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          latitud: lat,
          longitud: lng,
          radio: parseInt(radio) || 200,
        }),
      });
      
      setMensaje({ tipo: 'success', texto: `✓ Ubicación "${nombre}" añadida correctamente` });
      setNuevaUbicacion({ nombre: '', lat: '', lng: '', radio: 200 });
      cargarDatos();
    } catch (err) {
      console.error('Error añadiendo ubicación:', err);
      setMensaje({ tipo: 'error', texto: 'Error al añadir ubicación: ' + err.message });
    }
  };

  const eliminarUbicacion = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la ubicación "${nombre}"?`)) return;

    try {
      await supabaseRequest(`ubicaciones?id=eq.${id}`, {
        method: 'DELETE',
      });
      setMensaje({ tipo: 'success', texto: 'Ubicación eliminada' });
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar ubicación' });
    }
  };

  const agregarUsuario = async () => {
    const { nombre, pin, rol } = nuevoUsuario;
    
    if (!nombre.trim() || !pin.trim()) {
      setMensaje({ tipo: 'error', texto: 'Completa nombre y PIN' });
      return;
    }

    try {
      await supabaseRequest('usuarios', {
        method: 'POST',
        body: JSON.stringify({ nombre: nombre.trim(), pin: pin.trim(), rol }),
      });
      setMensaje({ tipo: 'success', texto: 'Usuario creado' });
      setNuevoUsuario({ nombre: '', pin: '', rol: 'tecnico' });
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al crear usuario' });
    }
  };

  const eliminarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar al usuario "${nombre}"?`)) return;

    try {
      await supabaseRequest(`usuarios?id=eq.${id}`, { method: 'DELETE' });
      setMensaje({ tipo: 'success', texto: 'Usuario eliminado' });
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar usuario' });
    }
  };

  const exportarCSV = () => {
    const headers = ['Fecha', 'Técnico', 'Entrada', 'Salida Comida', 'Vuelta Comida', 'Salida', 'Horas', 'Extras'];
    const rows = registrosFiltrados.map(r => {
      const { trabajadas, extras } = calcularHoras(r);
      return [
        r.fecha,
        getNombreUsuario(r.usuario_id),
        r.entrada || '',
        r.salida_comida || '',
        r.entrada_comida || '',
        r.salida_tarde || '',
        trabajadas.toFixed(1),
        extras.toFixed(1),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fichajes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (cargando) {
    return (
      <div style={styles.app}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo}>⚙️ Panel Admin</div>
            <div style={styles.subtitle}>Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <div style={styles.adminHeader}>
        <div style={styles.adminTitle}>⚙️ Panel Administrador</div>
        <button onClick={onLogout} style={styles.logoutBtn}>
          <Icons.LogOut /> Salir
        </button>
      </div>

      <div style={styles.tabs}>
        {[
          { id: 'registros', label: '📋 Registros', icon: Icons.Calendar },
          { id: 'ubicaciones', label: '📍 Ubicaciones', icon: Icons.MapPin },
          { id: 'usuarios', label: '👥 Usuarios', icon: Icons.Users },
          { id: 'estadisticas', label: '📊 Estadísticas', icon: Icons.BarChart },
        ].map(tab => (
          <button
            key={tab.id}
            style={{ ...styles.tab, ...(vista === tab.id ? styles.tabActive : {}) }}
            onClick={() => setVista(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.adminContent}>
        {mensaje && (
          <div style={{
            ...styles.message,
            ...(mensaje.tipo === 'success' ? styles.messageSuccess : styles.messageError)
          }}>
            {mensaje.texto}
          </div>
        )}

        {/* VISTA: REGISTROS */}
        {vista === 'registros' && (
          <div style={styles.card}>
            <div style={styles.filterRow}>
              <input
                type="date"
                style={styles.filterInput}
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
              <select
                style={styles.filterInput}
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
              >
                <option value="">Todos los técnicos</option>
                {usuarios.filter(u => u.rol === 'tecnico').map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
              <button
                onClick={exportarCSV}
                style={{ ...styles.button, width: 'auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Icons.Download /> CSV
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Fecha</th>
                    <th style={styles.th}>Técnico</th>
                    <th style={styles.th}>Entrada</th>
                    <th style={styles.th}>S.Com</th>
                    <th style={styles.th}>V.Com</th>
                    <th style={styles.th}>Salida</th>
                    <th style={styles.th}>Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.slice(0, 50).map(r => {
                    const { trabajadas, extras } = calcularHoras(r);
                    return (
                      <tr key={r.id}>
                        <td style={styles.td}>{formatDate(r.fecha)}</td>
                        <td style={styles.td}>{getNombreUsuario(r.usuario_id)}</td>
                        <td style={styles.td}>{formatTime(r.entrada)}</td>
                        <td style={styles.td}>{formatTime(r.salida_comida)}</td>
                        <td style={styles.td}>{formatTime(r.entrada_comida)}</td>
                        <td style={styles.td}>{formatTime(r.salida_tarde)}</td>
                        <td style={styles.td}>
                          <strong>{trabajadas.toFixed(1)}h</strong>
                          {extras > 0 && <span style={{ color: '#f59e0b' }}> (+{extras.toFixed(1)})</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {registrosFiltrados.length === 0 && (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                  No hay registros
                </p>
              )}
            </div>
          </div>
        )}

        {/* VISTA: UBICACIONES */}
        {vista === 'ubicaciones' && (
          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b' }}>
              Añadir nueva ubicación
            </h3>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Nombre del lugar</label>
              <input
                type="text"
                placeholder="Ej: Cliente Munich, Taller Burgos..."
                style={styles.input}
                value={nuevaUbicacion.nombre}
                onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, nombre: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Latitud</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej: 42.3439"
                  style={styles.input}
                  value={nuevaUbicacion.lat}
                  onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, lat: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Longitud</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej: -3.6969"
                  style={styles.input}
                  value={nuevaUbicacion.lng}
                  onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, lng: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Radio (metros)</label>
              <input
                type="number"
                placeholder="200"
                style={styles.input}
                value={nuevaUbicacion.radio}
                onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, radio: e.target.value })}
              />
              <small style={{ color: '#64748b', fontSize: '12px' }}>
                El técnico podrá fichar si está dentro de este radio desde las coordenadas
              </small>
            </div>

            <button style={styles.button} onClick={agregarUbicacion}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Icons.Plus /> Añadir ubicación
              </span>
            </button>

            <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>
              Ubicaciones registradas ({ubicaciones.length})
            </h3>

            {ubicaciones.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center' }}>
                No hay ubicaciones registradas
              </p>
            ) : (
              ubicaciones.map(u => (
                <div key={u.id} style={styles.ubicacionItem}>
                  <div>
                    <strong style={{ color: '#1e293b' }}>{u.nombre}</strong>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      📍 {u.latitud}, {u.longitud} • Radio: {u.radio}m
                      {u.activa === false && <span style={{ color: '#ef4444' }}> (inactiva)</span>}
                    </div>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => eliminarUbicacion(u.id, u.nombre)}
                  >
                    <Icons.Trash /> Eliminar
                  </button>
                </div>
              ))
            )}

            <div style={{ marginTop: '20px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', fontSize: '13px', color: '#0369a1' }}>
              <strong>💡 Cómo obtener coordenadas:</strong><br />
              1. Abre Google Maps<br />
              2. Haz clic derecho en el punto exacto<br />
              3. Haz clic en las coordenadas que aparecen (se copian automáticamente)<br />
              4. Pega primero la latitud, luego la longitud
            </div>
          </div>
        )}

        {/* VISTA: USUARIOS */}
        {vista === 'usuarios' && (
          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b' }}>
              Añadir nuevo técnico
            </h3>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Nombre completo</label>
              <input
                type="text"
                placeholder="Nombre del técnico"
                style={styles.input}
                value={nuevoUsuario.nombre}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>PIN (4 dígitos)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234"
                maxLength={4}
                style={styles.input}
                value={nuevoUsuario.pin}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, pin: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <button style={styles.button} onClick={agregarUsuario}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Icons.Plus /> Añadir técnico
              </span>
            </button>

            <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>
              Usuarios registrados ({usuarios.length})
            </h3>

            {usuarios.map(u => (
              <div key={u.id} style={styles.ubicacionItem}>
                <div>
                  <strong style={{ color: '#1e293b' }}>{u.nombre}</strong>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {u.rol === 'admin' ? '👑 Administrador' : '👷 Técnico'} • PIN: {u.pin}
                  </div>
                </div>
                {u.rol !== 'admin' && (
                  <button
                    style={styles.deleteBtn}
                    onClick={() => eliminarUsuario(u.id, u.nombre)}
                  >
                    <Icons.Trash />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VISTA: ESTADÍSTICAS */}
        {vista === 'estadisticas' && (
          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b' }}>
              Resumen por técnico
            </h3>

            {usuarios.filter(u => u.rol === 'tecnico').map(u => {
              const registrosUsuario = registros.filter(r => r.usuario_id === u.id);
              const totalHoras = registrosUsuario.reduce((acc, r) => acc + calcularHoras(r).trabajadas, 0);
              const totalExtras = registrosUsuario.reduce((acc, r) => acc + calcularHoras(r).extras, 0);
              const diasTrabajados = registrosUsuario.length;

              return (
                <div key={u.id} style={{ ...styles.ubicacionItem, flexDirection: 'column', alignItems: 'stretch' }}>
                  <strong style={{ color: '#1e293b', marginBottom: '8px' }}>{u.nombre}</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>{diasTrabajados}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Días</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>{totalHoras.toFixed(1)}h</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Horas</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>{totalExtras.toFixed(1)}h</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Extras</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const App = () => {
  const [usuario, setUsuario] = useState(null);

  const handleLogin = (user) => {
    setUsuario(user);
  };

  const handleLogout = () => {
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  if (usuario.rol === 'admin') {
    return <AdminPanel usuario={usuario} onLogout={handleLogout} />;
  }

  return <TecnicoPanel usuario={usuario} onLogout={handleLogout} />;
};

export default App;
