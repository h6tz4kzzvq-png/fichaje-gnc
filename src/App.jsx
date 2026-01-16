import React, { useState, useEffect } from 'react';

// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================
const SUPABASE_URL = 'https://ewvgrtalxwrssfyuopmc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dmdydGFseHdyc3NmeXVvcG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODAyMDgsImV4cCI6MjA4NDA1NjIwOH0.wANHY-m4Dn4e2qxJgliF9zalf8BQx9KEsLOzqWxq5Lg';

// Helper para llamadas a Supabase
const supabase = {
  from: (table) => ({
    select: async (columns = '*') => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
    insert: async (rows) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(rows),
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
    update: async (updates) => ({
      eq: async (column, value) => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        return { data, error: res.ok ? null : data };
      },
    }),
    delete: async () => ({
      eq: async (column, value) => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        });
        return { error: res.ok ? null : 'Error al eliminar' };
      },
    }),
  }),
};

// ============================================
// ESTILOS
// ============================================
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    margin: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  input: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: '2px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '16px',
    marginBottom: '15px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)',
    color: '#1e3a5f',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  buttonSecondary: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '2px solid rgba(255,255,255,0.3)',
    background: 'transparent',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  title: {
    color: 'white',
    textAlign: 'center',
    marginBottom: '10px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: '30px',
  },
  error: {
    background: 'rgba(255,100,100,0.2)',
    border: '1px solid rgba(255,100,100,0.5)',
    color: '#ff6b6b',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  success: {
    background: 'rgba(100,255,100,0.2)',
    border: '1px solid rgba(100,255,100,0.5)',
    color: '#6bff6b',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  fichajeBtn: {
    padding: '20px',
    borderRadius: '15px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '10px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid rgba(255,255,255,0.2)',
  },
  td: {
    color: 'white',
    padding: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    padding: '12px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    fontSize: '14px',
  },
  tabActive: {
    flex: 1,
    padding: '12px',
    border: 'none',
    background: 'transparent',
    color: 'white',
    cursor: 'pointer',
    borderBottom: '3px solid #00d4ff',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  badgeSuccess: {
    background: 'rgba(100,255,100,0.2)',
    color: '#6bff6b',
  },
  badgeWarning: {
    background: 'rgba(255,200,100,0.2)',
    color: '#ffc864',
  },
  badgePending: {
    background: 'rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.7)',
  },
  badgeAdmin: {
    background: 'rgba(255,100,100,0.2)',
    color: '#ff6b6b',
  },
  badgeTecnico: {
    background: 'rgba(100,200,255,0.2)',
    color: '#64c8ff',
  },
};

// ============================================
// COMPONENTE: LOGIN
// ============================================
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: err } = await supabase.from('usuarios').select('*');
      
      if (err) {
        setError('Error de conexión. Inténtalo de nuevo.');
        setLoading(false);
        return;
      }

      const user = data.find(
        (u) => u.nombre.toLowerCase() === username.toLowerCase() && u.pin === pin
      );

      if (user) {
        onLogin(user);
      } else {
        setError('Usuario o PIN incorrectos');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '50px' }}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>⏱️</div>
            <h1 style={styles.title}>Control de Fichaje</h1>
            <p style={styles.subtitle}>GNC Hipatia</p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              style={styles.input}
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              style={styles.input}
              type="password"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Conectando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: PANEL TRABAJADOR
// ============================================
const PanelTrabajador = ({ usuario, onLogout }) => {
  const [fichaje, setFichaje] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('obteniendo');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    cargarDatos();
    obtenerUbicacion();
  }, []);

  const cargarDatos = async () => {
    // Cargar ubicaciones permitidas
    const { data: ubis } = await supabase.from('ubicaciones').select('*');
    if (ubis) setUbicaciones(ubis.filter((u) => u.activa));

    // Cargar fichaje de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const { data: fichajes } = await supabase.from('fichajes').select('*');
    if (fichajes) {
      const fichajeHoy = fichajes.find(
        (f) => f.usuario_id === usuario.id && f.fecha === hoy
      );
      if (fichajeHoy) setFichaje(fichajeHoy);
    }
  };

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setGpsStatus('no-soportado');
      return;
    }

    setGpsStatus('obteniendo');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setGpsStatus('obtenido');
      },
      (err) => {
        setGpsStatus('error');
        setError('No se pudo obtener tu ubicación. Activa el GPS.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const verificarUbicacion = () => {
    if (!coords || ubicaciones.length === 0) return null;

    for (const ubi of ubicaciones) {
      const distancia = calcularDistancia(
        coords.lat,
        coords.lng,
        parseFloat(ubi.latitud),
        parseFloat(ubi.longitud)
      );
      if (distancia <= ubi.radio) {
        return ubi;
      }
    }
    return null;
  };

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (coords && ubicaciones.length > 0) {
      const ubi = verificarUbicacion();
      setUbicacionActual(ubi);
    }
  }, [coords, ubicaciones]);

  const fichar = async (tipo) => {
    setError('');
    setMensaje('');
    setLoading(true);

    // Verificar GPS
    if (gpsStatus !== 'obtenido') {
      setError('Esperando ubicación GPS...');
      setLoading(false);
      obtenerUbicacion();
      return;
    }

    // Verificar que está en ubicación permitida
    if (!ubicacionActual) {
      setError('No estás en una ubicación de trabajo autorizada');
      setLoading(false);
      return;
    }

    const ahora = new Date();
    const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);
    const hoy = ahora.toISOString().split('T')[0];
    const ubicacionTexto = `${ubicacionActual.nombre} (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`;

    try {
      if (!fichaje) {
        // Crear nuevo fichaje
        const nuevoFichaje = {
          usuario_id: usuario.id,
          fecha: hoy,
          entrada: tipo === 'entrada' ? hora : null,
          ubicacion_entrada: tipo === 'entrada' ? ubicacionTexto : null,
        };
        const { data, error: err } = await supabase.from('fichajes').insert([nuevoFichaje]);
        if (err) throw err;
        setFichaje(data[0]);
        setMensaje(`✅ Entrada registrada a las ${hora}`);
      } else {
        // Actualizar fichaje existente
        let updates = {};
        if (tipo === 'salida_comida' && !fichaje.salida_comida) {
          updates = { salida_comida: hora, ubicacion_salida_comida: ubicacionTexto };
        } else if (tipo === 'entrada_comida' && fichaje.salida_comida && !fichaje.entrada_comida) {
          updates = { entrada_comida: hora, ubicacion_entrada_comida: ubicacionTexto };
        } else if (tipo === 'salida' && !fichaje.salida) {
          updates = { salida: hora, ubicacion_salida: ubicacionTexto };
        } else {
          setError('Este fichaje ya está registrado');
          setLoading(false);
          return;
        }

        const { data, error: err } = await (await supabase.from('fichajes').update(updates)).eq('id', fichaje.id);
        if (err) throw err;
        setFichaje({ ...fichaje, ...updates });
        
        const mensajes = {
          salida_comida: `✅ Salida comida registrada a las ${hora}`,
          entrada_comida: `✅ Entrada comida registrada a las ${hora}`,
          salida: `✅ Salida registrada a las ${hora}`,
        };
        setMensaje(mensajes[tipo]);
      }
    } catch (err) {
      setError('Error al registrar el fichaje');
    }
    setLoading(false);
  };

  const getBtnStyle = (tipo, habilitado, completado) => {
    let bg = '#4a5568';
    if (completado) bg = '#48bb78';
    else if (habilitado) bg = tipo === 'entrada' || tipo === 'entrada_comida' ? '#4299e1' : '#ed8936';
    
    return {
      ...styles.fichajeBtn,
      background: bg,
      color: 'white',
      opacity: habilitado && !completado ? 1 : 0.6,
      cursor: habilitado && !completado ? 'pointer' : 'not-allowed',
    };
  };

  const entradaHecha = fichaje?.entrada;
  const salidaComidaHecha = fichaje?.salida_comida;
  const entradaComidaHecha = fichaje?.entrada_comida;
  const salidaHecha = fichaje?.salida;

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: 'white', margin: 0 }}>👤 {usuario.nombre}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: '5px 0 0 0', fontSize: '14px' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <button onClick={onLogout} style={{ ...styles.buttonSecondary, width: 'auto', padding: '8px 15px' }}>
              Salir
            </button>
          </div>

          {/* Estado GPS */}
          <div style={{
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: ubicacionActual ? 'rgba(72,187,120,0.2)' : gpsStatus === 'error' ? 'rgba(245,101,101,0.2)' : 'rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>
                {gpsStatus === 'obteniendo' ? '🔄' : ubicacionActual ? '📍' : '⚠️'}
              </span>
              <div>
                <div style={{ color: 'white', fontWeight: 'bold' }}>
                  {gpsStatus === 'obteniendo' ? 'Obteniendo ubicación...' :
                   ubicacionActual ? ubicacionActual.nombre : 'Fuera de zona autorizada'}
                </div>
                {coords && (
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
            {gpsStatus !== 'obteniendo' && (
              <button 
                onClick={obtenerUbicacion} 
                style={{ ...styles.buttonSecondary, marginTop: '10px', fontSize: '14px' }}
              >
                🔄 Actualizar ubicación
              </button>
            )}
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {mensaje && <div style={styles.success}>{mensaje}</div>}

          {/* Botones de fichaje */}
          <div>
            <button
              style={getBtnStyle('entrada', !entradaHecha && ubicacionActual, entradaHecha)}
              onClick={() => fichar('entrada')}
              disabled={entradaHecha || !ubicacionActual || loading}
            >
              🌅 Entrada {entradaHecha && `(${fichaje.entrada})`}
            </button>

            <button
              style={getBtnStyle('salida_comida', entradaHecha && !salidaComidaHecha && ubicacionActual, salidaComidaHecha)}
              onClick={() => fichar('salida_comida')}
              disabled={!entradaHecha || salidaComidaHecha || !ubicacionActual || loading}
            >
              🍽️ Salida comida {salidaComidaHecha && `(${fichaje.salida_comida})`}
            </button>

            <button
              style={getBtnStyle('entrada_comida', salidaComidaHecha && !entradaComidaHecha && ubicacionActual, entradaComidaHecha)}
              onClick={() => fichar('entrada_comida')}
              disabled={!salidaComidaHecha || entradaComidaHecha || !ubicacionActual || loading}
            >
              🍽️ Entrada comida {entradaComidaHecha && `(${fichaje.entrada_comida})`}
            </button>

            <button
              style={getBtnStyle('salida', entradaComidaHecha && !salidaHecha && ubicacionActual, salidaHecha)}
              onClick={() => fichar('salida')}
              disabled={!entradaComidaHecha || salidaHecha || !ubicacionActual || loading}
            >
              🌙 Salida {salidaHecha && `(${fichaje.salida})`}
            </button>
          </div>

          {salidaHecha && (
            <div style={{ ...styles.success, marginTop: '20px' }}>
              ✅ Jornada completada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: PANEL ADMIN
// ============================================
const PanelAdmin = ({ usuario, onLogout }) => {
  const [tab, setTab] = useState('fichajes');
  const [fichajes, setFichajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]);
  const [filtroUsuario, setFiltroUsuario] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    const [resFichajes, resUsuarios, resUbicaciones] = await Promise.all([
      supabase.from('fichajes').select('*'),
      supabase.from('usuarios').select('*'),
      supabase.from('ubicaciones').select('*'),
    ]);
    
    if (resFichajes.data) setFichajes(resFichajes.data);
    if (resUsuarios.data) setUsuarios(resUsuarios.data);
    if (resUbicaciones.data) setUbicaciones(resUbicaciones.data);
    setLoading(false);
  };

  const getNombreUsuario = (id) => {
    const u = usuarios.find((u) => u.id === id);
    return u ? u.nombre : 'Desconocido';
  };

  const fichajesFiltrados = fichajes.filter((f) => {
    if (filtroFecha && f.fecha !== filtroFecha) return false;
    if (filtroUsuario && f.usuario_id !== parseInt(filtroUsuario)) return false;
    return true;
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const calcularHoras = (f) => {
    if (!f.entrada || !f.salida) return '-';
    const entrada = new Date(`2000-01-01T${f.entrada}`);
    const salida = new Date(`2000-01-01T${f.salida}`);
    let minutos = (salida - entrada) / 60000;
    
    if (f.salida_comida && f.entrada_comida) {
      const salidaComida = new Date(`2000-01-01T${f.salida_comida}`);
      const entradaComida = new Date(`2000-01-01T${f.entrada_comida}`);
      minutos -= (entradaComida - salidaComida) / 60000;
    }
    
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins}m`;
  };

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: 'white', margin: 0 }}>🔧 Panel de Administración</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: '5px 0 0 0' }}>
                {usuario.nombre}
              </p>
            </div>
            <button onClick={onLogout} style={{ ...styles.buttonSecondary, width: 'auto', padding: '8px 15px' }}>
              Salir
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.2)', marginBottom: '20px' }}>
            <button style={tab === 'fichajes' ? styles.tabActive : styles.tab} onClick={() => setTab('fichajes')}>
              📋 Fichajes
            </button>
            <button style={tab === 'usuarios' ? styles.tabActive : styles.tab} onClick={() => setTab('usuarios')}>
              👥 Usuarios
            </button>
            <button style={tab === 'ubicaciones' ? styles.tabActive : styles.tab} onClick={() => setTab('ubicaciones')}>
              📍 Ubicaciones
            </button>
          </div>

          {loading && <p style={{ color: 'white', textAlign: 'center' }}>Cargando...</p>}

          {/* Tab Fichajes */}
          {!loading && tab === 'fichajes' && (
            <div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  style={{ ...styles.input, width: 'auto', marginBottom: 0 }}
                />
                <select
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  style={{ ...styles.input, width: 'auto', marginBottom: 0 }}
                >
                  <option value="">Todos los usuarios</option>
                  {usuarios.filter((u) => u.rol === 'tecnico').map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
                <button onClick={cargarDatos} style={{ ...styles.buttonSecondary, width: 'auto' }}>
                  🔄 Actualizar
                </button>
              </div>

              {fichajesFiltrados.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                  No hay fichajes para mostrar
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Técnico</th>
                        <th style={styles.th}>Fecha</th>
                        <th style={styles.th}>Entrada</th>
                        <th style={styles.th}>Salida comida</th>
                        <th style={styles.th}>Entrada comida</th>
                        <th style={styles.th}>Salida</th>
                        <th style={styles.th}>Horas</th>
                        <th style={styles.th}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fichajesFiltrados.map((f) => (
                        <tr key={f.id}>
                          <td style={styles.td}>{getNombreUsuario(f.usuario_id)}</td>
                          <td style={styles.td}>{f.fecha}</td>
                          <td style={styles.td}>{f.entrada || '-'}</td>
                          <td style={styles.td}>{f.salida_comida || '-'}</td>
                          <td style={styles.td}>{f.entrada_comida || '-'}</td>
                          <td style={styles.td}>{f.salida || '-'}</td>
                          <td style={styles.td}>{calcularHoras(f)}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              ...(f.salida ? styles.badgeSuccess : f.entrada ? styles.badgeWarning : styles.badgePending),
                            }}>
                              {f.salida ? 'Completo' : f.entrada ? 'En curso' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab Ubicaciones */}
          {!loading && tab === 'ubicaciones' && (
            <div>
              <NuevaUbicacion onCreated={cargarDatos} />
              
              {ubicaciones.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                  No hay ubicaciones configuradas
                </p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>Coordenadas</th>
                      <th style={styles.th}>Radio</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ubicaciones.map((u) => (
                      <tr key={u.id}>
                        <td style={styles.td}>{u.nombre}</td>
                        <td style={styles.td}>{u.latitud}, {u.longitud}</td>
                        <td style={styles.td}>{u.radio}m</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            ...(u.activa ? styles.badgeSuccess : styles.badgePending),
                          }}>
                            {u.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={async () => {
                              await (await supabase.from('ubicaciones').update({ activa: !u.activa })).eq('id', u.id);
                              cargarDatos();
                            }}
                            style={{ ...styles.buttonSecondary, width: 'auto', padding: '5px 10px', fontSize: '12px' }}
                          >
                            {u.activa ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab Usuarios */}
          {!loading && tab === 'usuarios' && (
            <div>
              <NuevoUsuario onCreated={cargarDatos} />
              
              {usuarios.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                  No hay usuarios
                </p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>PIN</th>
                      <th style={styles.th}>Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id}>
                        <td style={styles.td}>{u.nombre}</td>
                        <td style={styles.td}>{u.pin}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            ...(u.rol === 'admin' ? styles.badgeAdmin : styles.badgeTecnico),
                          }}>
                            {u.rol === 'admin' ? 'Admin' : 'Técnico'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: NUEVA UBICACIÓN
// ============================================
const NuevaUbicacion = ({ onCreated }) => {
  const [mostrar, setMostrar] = useState(false);
  const [nombre, setNombre] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [radio, setRadio] = useState('200');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const usarMiUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitud(pos.coords.latitude.toFixed(8));
          setLongitud(pos.coords.longitude.toFixed(8));
        },
        () => setError('No se pudo obtener la ubicación')
      );
    }
  };

  const guardar = async () => {
    if (!nombre || !latitud || !longitud) {
      setError('Completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    
    const { error: err } = await supabase.from('ubicaciones').insert([{
      nombre,
      latitud: parseFloat(latitud),
      longitud: parseFloat(longitud),
      radio: parseInt(radio),
      activa: true,
    }]);

    if (err) {
      setError('Error al guardar');
    } else {
      setNombre('');
      setLatitud('');
      setLongitud('');
      setRadio('200');
      setMostrar(false);
      onCreated();
    }
    setLoading(false);
  };

  if (!mostrar) {
    return (
      <button onClick={() => setMostrar(true)} style={{ ...styles.button, marginBottom: '20px' }}>
        + Nueva ubicación
      </button>
    );
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
      <h3 style={{ color: 'white', marginTop: 0 }}>Nueva ubicación</h3>
      {error && <div style={styles.error}>{error}</div>}
      
      <input
        style={styles.input}
        placeholder="Nombre (ej: Cliente Munich)"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="Latitud"
          value={latitud}
          onChange={(e) => setLatitud(e.target.value)}
        />
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="Longitud"
          value={longitud}
          onChange={(e) => setLongitud(e.target.value)}
        />
      </div>
      
      <button onClick={usarMiUbicacion} style={{ ...styles.buttonSecondary, marginBottom: '15px' }}>
        📍 Usar mi ubicación actual
      </button>
      
      <input
        style={styles.input}
        type="number"
        placeholder="Radio en metros"
        value={radio}
        onChange={(e) => setRadio(e.target.value)}
      />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={guardar} style={styles.button} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={() => setMostrar(false)} style={styles.buttonSecondary}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: NUEVO USUARIO
// ============================================
const NuevoUsuario = ({ onCreated }) => {
  const [mostrar, setMostrar] = useState(false);
  const [nombre, setNombre] = useState('');
  const [pin, setPin] = useState('');
  const [rol, setRol] = useState('tecnico');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const guardar = async () => {
    if (!nombre || !pin) {
      setError('Completa todos los campos');
      return;
    }
    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos');
      return;
    }
    setLoading(true);
    setError('');
    
    const { error: err } = await supabase.from('usuarios').insert([{
      nombre,
      pin,
      rol,
    }]);

    if (err) {
      setError('Error al guardar');
    } else {
      setNombre('');
      setPin('');
      setRol('tecnico');
      setMostrar(false);
      onCreated();
    }
    setLoading(false);
  };

  if (!mostrar) {
    return (
      <button onClick={() => setMostrar(true)} style={{ ...styles.button, marginBottom: '20px' }}>
        + Nuevo usuario
      </button>
    );
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
      <h3 style={{ color: 'white', marginTop: 0 }}>Nuevo usuario</h3>
      {error && <div style={styles.error}>{error}</div>}
      
      <input
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      
      <input
        style={styles.input}
        type="password"
        placeholder="PIN (mínimo 4 dígitos)"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />
      
      <select
        style={styles.input}
        value={rol}
        onChange={(e) => setRol(e.target.value)}
      >
        <option value="tecnico">Técnico</option>
        <option value="admin">Administrador</option>
      </select>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={guardar} style={styles.button} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={() => setMostrar(false)} style={styles.buttonSecondary}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function App() {
  const [usuario, setUsuario] = useState(null);

  const handleLogin = (usr) => {
    setUsuario(usr);
    localStorage.setItem('fichaje_usuario', JSON.stringify(usr));
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('fichaje_usuario');
  };

  useEffect(() => {
    const saved = localStorage.getItem('fichaje_usuario');
    if (saved) {
      setUsuario(JSON.parse(saved));
    }
  }, []);

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  if (usuario.rol === 'admin') {
    return <PanelAdmin usuario={usuario} onLogout={handleLogout} />;
  }

  return <PanelTrabajador usuario={usuario} onLogout={handleLogout} />;
}
