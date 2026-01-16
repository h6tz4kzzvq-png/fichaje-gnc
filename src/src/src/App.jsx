import React, { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE SUPABASE - GNC HIPATIA
// ═══════════════════════════════════════════════════════════════════════════════
const SUPABASE_URL = 'https://ewvgrtalxwrssfyuopmc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dmdydGFseHdyc3NmeXVvcG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODAyMDgsImV4cCI6MjA4NDA1NjIwOH0.wANHY-m4Dn4e2qxJgliF9zalf8BQx9KEsLOzqWxq5Lg';

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTE DE SUPABASE SIMPLIFICADO
// ═══════════════════════════════════════════════════════════════════════════════
const supabase = {
  from: (table) => ({
    select: async (columns = '*') => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
    selectWhere: async (columns = '*', field, value) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${field}=eq.${value}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
    selectWhereMultiple: async (columns = '*', filters) => {
      const filterStr = Object.entries(filters).map(([k, v]) => `${k}=eq.${v}`).join('&');
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${filterStr}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
    insert: async (data) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      return { data: result, error: res.ok ? null : result };
    },
    update: async (data, field, value) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${field}=eq.${value}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      return { data: result, error: res.ok ? null : result };
    },
  }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════
const formatTime = (date) => {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('es-ES', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const calcularHorasTrabajadas = (registro) => {
  if (!registro) return 0;
  let minutosTotales = 0;
  
  if (registro.entrada && registro.salida_comida) {
    minutosTotales += (new Date(registro.salida_comida) - new Date(registro.entrada)) / 60000;
  }
  if (registro.entrada_comida && registro.salida_tarde) {
    minutosTotales += (new Date(registro.salida_tarde) - new Date(registro.entrada_comida)) / 60000;
  }
  
  return Math.round(minutosTotales / 60 * 100) / 100;
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

// ═══════════════════════════════════════════════════════════════════════════════
// ICONOS SVG
// ═══════════════════════════════════════════════════════════════════════════════
const Icons = {
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  Location: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  Download: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  User: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILOS CSS
// ═══════════════════════════════════════════════════════════════════════════════
const styles = {
  container: {
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    padding: '16px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    maxWidth: '420px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    marginBottom: '12px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  buttonSecondary: {
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  },
  buttonDisabled: {
    background: '#94a3b8',
    cursor: 'not-allowed',
  },
  fichajeButton: {
    padding: '20px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '12px',
    width: '100%',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  fichajeCompletado: {
    background: '#f0fdf4',
    color: '#166534',
    border: '2px solid #86efac',
    cursor: 'default',
  },
  fichajePendiente: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#fff',
  },
  fichajeBloqueado: {
    background: '#f1f5f9',
    color: '#94a3b8',
    border: '2px dashed #cbd5e1',
    cursor: 'not-allowed',
  },
  registroCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #e2e8f0',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeLocked: {
    background: '#fef3c7',
    color: '#92400e',
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  alertError: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  alertSuccess: {
    background: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
  alertWarning: {
    background: '#fffbeb',
    color: '#92400e',
    border: '1px solid #fde68a',
  },
  infoBox: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '16px',
    fontSize: '14px',
    color: '#0369a1',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  tab: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#1e3a5f',
    color: '#fff',
  },
  tabInactive: {
    background: '#f1f5f9',
    color: '#64748b',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: PANTALLA DE LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin, usuarios, loading }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedUser) {
      setError('Selecciona tu nombre');
      return;
    }
    const user = usuarios.find(u => u.id === parseInt(selectedUser));
    if (!user) {
      setError('Usuario no encontrado');
      return;
    }
    if (user.pin !== pin) {
      setError('PIN incorrecto');
      return;
    }
    onLogin(user);
  };

  const tecnicos = usuarios.filter(u => u.rol === 'tecnico');

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>⏱️ GNC Hipatia</div>
          <div style={styles.subtitle}>Control de Fichaje</div>
        </div>

        {error && (
          <div style={{...styles.alert, ...styles.alertError}}>
            ⚠️ {error}
          </div>
        )}

        <div style={styles.infoBox}>
          <strong>📱 Fichaje desde obra</strong><br/>
          Selecciona tu nombre, introduce tu PIN y ficha tu jornada. Los fichajes quedan registrados de forma permanente.
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>
            Cargando usuarios...
          </div>
        ) : (
          <>
            <select
              style={styles.input}
              value={selectedUser}
              onChange={(e) => { setSelectedUser(e.target.value); setError(''); }}
            >
              <option value="">-- Selecciona tu nombre --</option>
              {tecnicos.map(user => (
                <option key={user.id} value={user.id}>{user.nombre}</option>
              ))}
            </select>

            <input
              type="password"
              placeholder="PIN (4 dígitos)"
              style={styles.input}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              maxLength={4}
              inputMode="numeric"
            />

            <button style={styles.button} onClick={handleLogin}>
              <Icons.User /> Entrar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: PANTALLA PRINCIPAL DE FICHAJE
// ═══════════════════════════════════════════════════════════════════════════════
function FichajeScreen({ user, onLogout, ubicaciones }) {
  const [tab, setTab] = useState('fichar');
  const [registroHoy, setRegistroHoy] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const hoyStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    cargarDatos();
    obtenerUbicacion();
  }, []);

  const cargarDatos = async () => {
    const { data: registrosHoy } = await supabase.from('fichajes').selectWhereMultiple('*', {
      usuario_id: user.id,
      fecha: hoyStr
    });
    if (registrosHoy && registrosHoy.length > 0) {
      setRegistroHoy(registrosHoy[0]);
    }

    const { data: todosRegistros } = await supabase.from('fichajes').selectWhere('*', 'usuario_id', user.id);
    if (todosRegistros) {
      setHistorial(todosRegistros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    }
  };

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalización no disponible');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        let ubicacionEncontrada = null;
        let distanciaMinima = Infinity;

        for (const ub of ubicaciones) {
          const distancia = calcularDistancia(latitude, longitude, ub.lat, ub.lng);
          if (distancia <= ub.radio && distancia < distanciaMinima) {
            distanciaMinima = distancia;
            ubicacionEncontrada = { ...ub, distancia: Math.round(distancia) };
          }
        }

        setUbicacionActual(ubicacionEncontrada);
        if (!ubicacionEncontrada) {
          setGeoError('No estás en ninguna ubicación de trabajo registrada');
        }
      },
      (error) => {
        setGeoError('No se pudo obtener tu ubicación. Activa el GPS.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const realizarFichaje = async (tipo) => {
    if (!ubicacionActual) {
      setMensaje({ tipo: 'error', texto: 'Debes estar en una ubicación de trabajo para fichar' });
      return;
    }

    setLoading(true);
    const ahora = new Date().toISOString();

    try {
      if (!registroHoy) {
        const nuevoRegistro = {
          usuario_id: user.id,
          fecha: hoyStr,
          ubicacion_id: ubicacionActual.id,
          ubicacion_nombre: ubicacionActual.nombre,
          [tipo]: ahora,
        };
        const { data, error } = await supabase.from('fichajes').insert(nuevoRegistro);
        if (error) throw error;
        setRegistroHoy(data[0]);
        setMensaje({ tipo: 'success', texto: `✅ Fichaje de ${getTipoLabel(tipo)} registrado` });
      } else {
        const { data, error } = await supabase.from('fichajes').update(
          { [tipo]: ahora },
          'id',
          registroHoy.id
        );
        if (error) throw error;
        setRegistroHoy({ ...registroHoy, [tipo]: ahora });
        setMensaje({ tipo: 'success', texto: `✅ Fichaje de ${getTipoLabel(tipo)} registrado` });
      }

      await cargarDatos();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar el fichaje' });
    }

    setLoading(false);
    setTimeout(() => setMensaje(null), 3000);
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      entrada: 'entrada',
      salida_comida: 'salida a comer',
      entrada_comida: 'vuelta de comer',
      salida_tarde: 'salida'
    };
    return labels[tipo] || tipo;
  };

  const getSiguienteFichaje = () => {
    if (!registroHoy) return 'entrada';
    if (!registroHoy.entrada) return 'entrada';
    if (!registroHoy.salida_comida) return 'salida_comida';
    if (!registroHoy.entrada_comida) return 'entrada_comida';
    if (!registroHoy.salida_tarde) return 'salida_tarde';
    return null;
  };

  const generarInformeCSV = () => {
    if (historial.length === 0) {
      setMensaje({ tipo: 'error', texto: 'No hay fichajes para exportar' });
      return;
    }

    let csv = 'Fecha,Ubicación,Entrada,Salida Comida,Entrada Comida,Salida Tarde,Horas Trabajadas\n';
    
    let totalHoras = 0;
    historial.forEach(reg => {
      const horas = calcularHorasTrabajadas(reg);
      totalHoras += horas;
      csv += `${formatDateShort(reg.fecha)},`;
      csv += `"${reg.ubicacion_nombre || 'Sin ubicación'}",`;
      csv += `${formatTime(reg.entrada)},`;
      csv += `${formatTime(reg.salida_comida)},`;
      csv += `${formatTime(reg.entrada_comida)},`;
      csv += `${formatTime(reg.salida_tarde)},`;
      csv += `${horas.toFixed(2)}\n`;
    });

    csv += `\nTOTAL,,,,,,${totalHoras.toFixed(2)} horas\n`;
    csv += `Técnico: ${user.nombre}\n`;
    csv += `Generado: ${new Date().toLocaleString('es-ES')}\n`;

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fichaje_${user.nombre.replace(/\s+/g, '_')}_${hoyStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setMensaje({ tipo: 'success', texto: '📥 Informe descargado' });
    setTimeout(() => setMensaje(null), 3000);
  };

  const siguienteFichaje = getSiguienteFichaje();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <div>
            <div style={{fontSize: '20px', fontWeight: '700', color: '#1e3a5f'}}>{user.nombre}</div>
            <div style={{fontSize: '13px', color: '#64748b'}}>{formatDate(new Date())}</div>
          </div>
          <button 
            onClick={onLogout}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#64748b',
              fontSize: '14px'
            }}
          >
            <Icons.Logout /> Salir
          </button>
        </div>

        {mensaje && (
          <div style={{
            ...styles.alert,
            ...(mensaje.tipo === 'success' ? styles.alertSuccess : styles.alertError)
          }}>
            {mensaje.texto}
          </div>
        )}

        <div style={styles.tabs}>
          <button 
            style={{...styles.tab, ...(tab === 'fichar' ? styles.tabActive : styles.tabInactive)}}
            onClick={() => setTab('fichar')}
          >
            ⏱️ Fichar
          </button>
          <button 
            style={{...styles.tab, ...(tab === 'historial' ? styles.tabActive : styles.tabInactive)}}
            onClick={() => setTab('historial')}
          >
            📋 Historial
          </button>
          <button 
            style={{...styles.tab, ...(tab === 'informe' ? styles.tabActive : styles.tabInactive)}}
            onClick={() => setTab('informe')}
          >
            📥 Informe
          </button>
        </div>

        {tab === 'fichar' && (
          <>
            {ubicacionActual ? (
              <div style={{...styles.alert, ...styles.alertSuccess}}>
                <Icons.Location />
                <div>
                  <strong>{ubicacionActual.nombre}</strong>
                  <div style={{fontSize: '12px', opacity: 0.8}}>A {ubicacionActual.distancia}m del punto</div>
                </div>
              </div>
            ) : geoError ? (
              <div style={{...styles.alert, ...styles.alertError}}>
                <Icons.Location />
                <div>
                  <strong>Fuera de zona</strong>
                  <div style={{fontSize: '12px'}}>{geoError}</div>
                </div>
              </div>
            ) : (
              <div style={{...styles.alert, ...styles.alertWarning}}>
                <Icons.Location />
                Obteniendo ubicación...
              </div>
            )}

            <div style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Icons.Lock />
              <span><strong>Fichaje permanente:</strong> Una vez registrado, no se puede modificar</span>
            </div>

            <div>
              {['entrada', 'salida_comida', 'entrada_comida', 'salida_tarde'].map((tipo) => {
                const yaFichado = registroHoy && registroHoy[tipo];
                const esSiguiente = tipo === siguienteFichaje;
                const bloqueado = !esSiguiente && !yaFichado;

                const labels = {
                  entrada: '🌅 Entrada',
                  salida_comida: '🍽️ Salida a comer',
                  entrada_comida: '☕ Vuelta de comer',
                  salida_tarde: '🌙 Salida'
                };

                let buttonStyle = styles.fichajeButton;
                if (yaFichado) {
                  buttonStyle = {...buttonStyle, ...styles.fichajeCompletado};
                } else if (esSiguiente) {
                  buttonStyle = {...buttonStyle, ...styles.fichajePendiente};
                } else {
                  buttonStyle = {...buttonStyle, ...styles.fichajeBloqueado};
                }

                return (
                  <button
                    key={tipo}
                    style={buttonStyle}
                    onClick={() => !yaFichado && esSiguiente && realizarFichaje(tipo)}
                    disabled={yaFichado || bloqueado || loading || !ubicacionActual}
                  >
                    {yaFichado ? (
                      <>
                        <Icons.Check />
                        {labels[tipo]} - {formatTime(registroHoy[tipo])}
                        <span style={styles.badge}>
                          <Icons.Lock /> Guardado
                        </span>
                      </>
                    ) : esSiguiente ? (
                      <>{labels[tipo]}</>
                    ) : (
                      <>{labels[tipo]}</>
                    )}
                  </button>
                );
              })}
            </div>

            {registroHoy && registroHoy.salida_tarde && (
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '14px', color: '#166534', marginBottom: '4px'}}>✅ Jornada completada</div>
                <div style={{fontSize: '28px', fontWeight: '700', color: '#166534'}}>
                  {calcularHorasTrabajadas(registroHoy).toFixed(1)} horas
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'historial' && (
          <>
            <div style={{marginBottom: '16px', color: '#64748b', fontSize: '14px'}}>
              Todos tus fichajes registrados ({historial.length} días)
            </div>

            {historial.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px 20px', color: '#94a3b8'}}>
                No hay fichajes registrados
              </div>
            ) : (
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                {historial.map((reg) => (
                  <div key={reg.id} style={styles.registroCard}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                      <div style={{fontWeight: '600', color: '#1e3a5f'}}>
                        {formatDateShort(reg.fecha)}
                      </div>
                      <span style={{...styles.badge, ...styles.badgeLocked}}>
                        <Icons.Lock /> Bloqueado
                      </span>
                    </div>
                    <div style={{fontSize: '12px', color: '#64748b', marginBottom: '8px'}}>
                      📍 {reg.ubicacion_nombre || 'Sin ubicación'}
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px'}}>
                      <div>🌅 Entrada: <strong>{formatTime(reg.entrada)}</strong></div>
                      <div>🍽️ Comida: <strong>{formatTime(reg.salida_comida)}</strong></div>
                      <div>☕ Vuelta: <strong>{formatTime(reg.entrada_comida)}</strong></div>
                      <div>🌙 Salida: <strong>{formatTime(reg.salida_tarde)}</strong></div>
                    </div>
                    <div style={{
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid #e2e8f0',
                      fontWeight: '600',
                      color: '#059669'
                    }}>
                      Total: {calcularHorasTrabajadas(reg).toFixed(1)} horas
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'informe' && (
          <>
            <div style={styles.infoBox}>
              <strong>📊 Informe del viaje</strong><br/>
              Descarga un archivo CSV con todos tus fichajes. Podrás abrirlo en Excel para ver el resumen completo.
            </div>

            {historial.length > 0 && (
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '14px', color: '#64748b', marginBottom: '8px'}}>Resumen total</div>
                <div style={{fontSize: '36px', fontWeight: '700', color: '#1e3a5f'}}>
                  {historial.reduce((sum, r) => sum + calcularHorasTrabajadas(r), 0).toFixed(1)}
                </div>
                <div style={{fontSize: '14px', color: '#64748b'}}>horas trabajadas</div>
                <div style={{fontSize: '13px', color: '#94a3b8', marginTop: '8px'}}>
                  en {historial.length} día{historial.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            <button 
              style={{...styles.button, ...styles.buttonSecondary}}
              onClick={generarInformeCSV}
              disabled={historial.length === 0}
            >
              <Icons.Download />
              Descargar informe (CSV)
            </button>

            <div style={{marginTop: '16px', fontSize: '13px', color: '#64748b', textAlign: 'center'}}>
              El archivo se abre con Excel, Google Sheets o similar
            </div>
          </>
        )}

        {tab === 'fichar' && (
          <button
            style={{
              marginTop: '16px',
              padding: '10px',
              width: '100%',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#64748b',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onClick={obtenerUbicacion}
          >
            🔄 Actualizar ubicación
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const { data: usuariosData } = await supabase.from('usuarios').select('*');
      const { data: ubicacionesData } = await supabase.from('ubicaciones').select('*');
      
      if (usuariosData) setUsuarios(usuariosData);
      if (ubicacionesData) setUbicaciones(ubicacionesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
    setLoading(false);
  };

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} usuarios={usuarios} loading={loading} />;
  }

  return <FichajeScreen user={user} onLogout={handleLogout} ubicaciones={ubicaciones} />;
}
