import React, { useState, useEffect } from 'react';

// ============================================
// CONFIGURACIÓN - CAMBIAR ESTOS VALORES
// ============================================
const SUPABASE_URL = 'https://ewvgrtalxwrssfyuopmc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dmdydGFseHdyc3NmeXVvcG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODAyMDgsImV4cCI6MjA4NDA1NjIwOH0.wANHY-m4Dn4e2qxJgliF9zalf8BQx9KEsLOzqWxq5Lg';

// ============================================
// UTILIDADES
// ============================================
const supabaseRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.method === 'POST' ? 'return=representation' : undefined,
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const formatTime = (date) => date ? new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--';
const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatDateShort = (date) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const calcularHoras = (registro) => {
  let minutos = 0;
  if (registro.entrada && registro.salida_comida) {
    minutos += (new Date(registro.salida_comida) - new Date(registro.entrada)) / 60000;
  }
  if (registro.entrada_comida && registro.salida) {
    minutos += (new Date(registro.salida) - new Date(registro.entrada_comida)) / 60000;
  }
  return (minutos / 60).toFixed(2);
};

// ============================================
// ESTILOS
// ============================================
const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#fff',
  },
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '20px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    background: 'linear-gradient(90deg, #4facfe, #00f2fe)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    marginBottom: '24px',
  },
  input: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '16px',
    marginBottom: '12px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#1a1a2e',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  buttonSecondary: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '12px',
  },
  fichajeBtn: {
    padding: '20px',
    borderRadius: '16px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '12px',
    width: '100%',
    transition: 'transform 0.2s, opacity 0.2s',
  },
  fichajeBtnActive: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#1a1a2e',
  },
  fichajeBtnDone: {
    background: 'rgba(0, 200, 150, 0.2)',
    color: '#00c896',
    border: '2px solid #00c896',
    cursor: 'default',
  },
  fichajeBtnDisabled: {
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'not-allowed',
  },
  gpsStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  gpsOk: {
    background: 'rgba(0, 200, 150, 0.15)',
    color: '#00c896',
    border: '1px solid rgba(0, 200, 150, 0.3)',
  },
  gpsError: {
    background: 'rgba(255, 100, 100, 0.15)',
    color: '#ff6b6b',
    border: '1px solid rgba(255, 100, 100, 0.3)',
  },
  gpsLoading: {
    background: 'rgba(255, 200, 100, 0.15)',
    color: '#ffc864',
    border: '1px solid rgba(255, 200, 100, 0.3)',
  },
  registroHoy: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginTop: '20px',
  },
  registroItem: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
  },
  registroLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '4px',
  },
  registroValor: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#4facfe',
  },
  error: {
    background: 'rgba(255, 100, 100, 0.15)',
    border: '1px solid rgba(255, 100, 100, 0.3)',
    color: '#ff6b6b',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  success: {
    background: 'rgba(0, 200, 150, 0.15)',
    border: '1px solid rgba(0, 200, 150, 0.3)',
    color: '#00c896',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  nav: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  navBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  navBtnActive: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#1a1a2e',
  },
  navBtnInactive: {
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.7)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    textAlign: 'left',
    padding: '12px 8px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  td: {
    padding: '12px 8px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  select: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    cursor: 'pointer',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  },
  badgeAdmin: {
    background: 'rgba(255, 200, 100, 0.2)',
    color: '#ffc864',
  },
  badgeTecnico: {
    background: 'rgba(79, 172, 254, 0.2)',
    color: '#4facfe',
  },
};

// ============================================
// COMPONENTE: LOGIN
// ============================================
const Login = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const users = await supabaseRequest(`usuarios?usuario=eq.${usuario}&password=eq.${password}`);
      if (users && users.length > 0) {
        onLogin(users[0]);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={{ ...styles.card, marginTop: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏱️</div>
            <h1 style={styles.title}>Control de Fichaje</h1>
            <p style={styles.subtitle}>GNC Hipatia</p>
          </div>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleLogin}>
            <input
              style={styles.input}
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
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
  const [ubicacion, setUbicacion] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('loading'); // loading, ok, error, fuera
  const [ubicacionTrabajo, setUbicacionTrabajo] = useState(null);
  const [registroHoy, setRegistroHoy] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  const hoy = new Date().toISOString().split('T')[0];

  // Cargar ubicaciones de trabajo
  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const ubicaciones = await supabaseRequest('ubicaciones?activa=eq.true');
        if (ubicaciones && ubicaciones.length > 0) {
          setUbicacionTrabajo(ubicaciones);
        }
      } catch (err) {
        console.error('Error cargando ubicaciones:', err);
      }
    };
    cargarUbicaciones();
  }, []);

  // Cargar registro de hoy
  useEffect(() => {
    const cargarRegistroHoy = async () => {
      try {
        const registros = await supabaseRequest(`fichajes?usuario_id=eq.${usuario.id}&fecha=eq.${hoy}`);
        if (registros && registros.length > 0) {
          setRegistroHoy(registros[0]);
        }
      } catch (err) {
        console.error('Error cargando registro:', err);
      }
    };
    cargarRegistroHoy();
  }, [usuario.id, hoy]);

  // Obtener GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUbicacion(coords);
        
        // Verificar si está en alguna ubicación de trabajo
        if (ubicacionTrabajo && ubicacionTrabajo.length > 0) {
          let dentroDeAlguna = false;
          for (const ub of ubicacionTrabajo) {
            const distancia = calcularDistancia(coords.lat, coords.lng, ub.latitud, ub.longitud);
            if (distancia <= ub.radio) {
              dentroDeAlguna = true;
              break;
            }
          }
          setGpsStatus(dentroDeAlguna ? 'ok' : 'fuera');
        } else {
          setGpsStatus('ok'); // Si no hay ubicaciones configuradas, permitir
        }
      },
      () => setGpsStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [ubicacionTrabajo]);

  const fichar = async (tipo) => {
    if (gpsStatus !== 'ok') {
      setMensaje({ tipo: 'error', texto: 'No puedes fichar fuera del lugar de trabajo' });
      return;
    }

    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const ahora = new Date().toISOString();
      
      if (!registroHoy) {
        // Crear nuevo registro
        const nuevoRegistro = {
          usuario_id: usuario.id,
          fecha: hoy,
          entrada: tipo === 'entrada' ? ahora : null,
          ubicacion_entrada: tipo === 'entrada' ? `${ubicacion.lat},${ubicacion.lng}` : null,
        };
        const resultado = await supabaseRequest('fichajes', {
          method: 'POST',
          body: JSON.stringify(nuevoRegistro),
        });
        setRegistroHoy(resultado[0]);
      } else {
        // Actualizar registro existente - SOLO si el campo está vacío
        const campo = tipo === 'entrada' ? 'entrada' : 
                      tipo === 'salida_comida' ? 'salida_comida' :
                      tipo === 'entrada_comida' ? 'entrada_comida' : 'salida';
        
        if (registroHoy[campo]) {
          setMensaje({ tipo: 'error', texto: 'Este fichaje ya está registrado' });
          setLoading(false);
          return;
        }

        const ubicacionCampo = `ubicacion_${campo}`;
        const actualizacion = {
          [campo]: ahora,
          [ubicacionCampo]: `${ubicacion.lat},${ubicacion.lng}`,
        };

        await supabaseRequest(`fichajes?id=eq.${registroHoy.id}`, {
          method: 'PATCH',
          body: JSON.stringify(actualizacion),
        });

        setRegistroHoy({ ...registroHoy, ...actualizacion });
      }

      setMensaje({ tipo: 'success', texto: '✓ Fichaje registrado correctamente' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar fichaje' });
    }
    setLoading(false);
  };

  const getBotonEstado = (tipo) => {
    if (!registroHoy) {
      return tipo === 'entrada' ? 'active' : 'disabled';
    }
    
    const campos = ['entrada', 'salida_comida', 'entrada_comida', 'salida'];
    const indice = campos.indexOf(tipo);
    
    if (registroHoy[tipo]) return 'done';
    
    // Solo activar si el anterior está completado
    if (indice === 0) return 'active';
    if (registroHoy[campos[indice - 1]]) return 'active';
    return 'disabled';
  };

  const getBotonStyle = (estado) => {
    switch (estado) {
      case 'active': return { ...styles.fichajeBtn, ...styles.fichajeBtnActive };
      case 'done': return { ...styles.fichajeBtn, ...styles.fichajeBtnDone };
      default: return { ...styles.fichajeBtn, ...styles.fichajeBtnDisabled };
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Bienvenido</div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>{usuario.nombre}</div>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>Salir</button>
        </div>

        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{formatDate(new Date())}</div>
          </div>

          {/* Estado GPS */}
          <div style={{
            ...styles.gpsStatus,
            ...(gpsStatus === 'ok' ? styles.gpsOk : 
                gpsStatus === 'loading' ? styles.gpsLoading : styles.gpsError)
          }}>
            <span style={{ fontSize: '18px' }}>
              {gpsStatus === 'ok' ? '📍' : gpsStatus === 'loading' ? '🔄' : '⚠️'}
            </span>
            <span>
              {gpsStatus === 'ok' && 'Ubicación verificada - Puedes fichar'}
              {gpsStatus === 'loading' && 'Obteniendo ubicación...'}
              {gpsStatus === 'error' && 'Error de GPS - Activa la ubicación'}
              {gpsStatus === 'fuera' && 'Fuera del área de trabajo'}
            </span>
          </div>

          {mensaje.texto && (
            <div style={mensaje.tipo === 'error' ? styles.error : styles.success}>
              {mensaje.texto}
            </div>
          )}

          {/* Botones de fichaje */}
          <button
            style={getBotonStyle(getBotonEstado('entrada'))}
            onClick={() => fichar('entrada')}
            disabled={getBotonEstado('entrada') !== 'active' || loading || gpsStatus !== 'ok'}
          >
            {registroHoy?.entrada ? '✓' : '→'} Entrada {registroHoy?.entrada && `(${formatTime(registroHoy.entrada)})`}
          </button>

          <button
            style={getBotonStyle(getBotonEstado('salida_comida'))}
            onClick={() => fichar('salida_comida')}
            disabled={getBotonEstado('salida_comida') !== 'active' || loading || gpsStatus !== 'ok'}
          >
            {registroHoy?.salida_comida ? '✓' : '🍽️'} Salida comida {registroHoy?.salida_comida && `(${formatTime(registroHoy.salida_comida)})`}
          </button>

          <button
            style={getBotonStyle(getBotonEstado('entrada_comida'))}
            onClick={() => fichar('entrada_comida')}
            disabled={getBotonEstado('entrada_comida') !== 'active' || loading || gpsStatus !== 'ok'}
          >
            {registroHoy?.entrada_comida ? '✓' : '🍽️'} Vuelta comida {registroHoy?.entrada_comida && `(${formatTime(registroHoy.entrada_comida)})`}
          </button>

          <button
            style={getBotonStyle(getBotonEstado('salida'))}
            onClick={() => fichar('salida')}
            disabled={getBotonEstado('salida') !== 'active' || loading || gpsStatus !== 'ok'}
          >
            {registroHoy?.salida ? '✓' : '←'} Salida {registroHoy?.salida && `(${formatTime(registroHoy.salida)})`}
          </button>

          {/* Resumen del día */}
          {registroHoy && (
            <div style={styles.registroHoy}>
              <div style={styles.registroItem}>
                <div style={styles.registroLabel}>Entrada</div>
                <div style={styles.registroValor}>{formatTime(registroHoy.entrada)}</div>
              </div>
              <div style={styles.registroItem}>
                <div style={styles.registroLabel}>Salida comida</div>
                <div style={styles.registroValor}>{formatTime(registroHoy.salida_comida)}</div>
              </div>
              <div style={styles.registroItem}>
                <div style={styles.registroLabel}>Vuelta comida</div>
                <div style={styles.registroValor}>{formatTime(registroHoy.entrada_comida)}</div>
              </div>
              <div style={styles.registroItem}>
                <div style={styles.registroLabel}>Salida</div>
                <div style={styles.registroValor}>{formatTime(registroHoy.salida)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: PANEL ADMINISTRADOR
// ============================================
const PanelAdmin = ({ usuario, onLogout }) => {
  const [vista, setVista] = useState('informes');
  const [usuarios, setUsuarios] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [fichajes, setFichajes] = useState([]);
  const [filtros, setFiltros] = useState({ usuario_id: '', desde: '', hasta: '' });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Nueva ubicación
  const [nuevaUbicacion, setNuevaUbicacion] = useState({ nombre: '', latitud: '', longitud: '', radio: 200 });
  
  // Nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', usuario: '', password: '', rol: 'tecnico' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [usrs, ubis] = await Promise.all([
        supabaseRequest('usuarios?order=nombre'),
        supabaseRequest('ubicaciones?order=nombre'),
      ]);
      setUsuarios(usrs || []);
      setUbicaciones(ubis || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  const buscarFichajes = async () => {
    try {
      let query = 'fichajes?order=fecha.desc';
      if (filtros.usuario_id) query += `&usuario_id=eq.${filtros.usuario_id}`;
      if (filtros.desde) query += `&fecha=gte.${filtros.desde}`;
      if (filtros.hasta) query += `&fecha=lte.${filtros.hasta}`;
      
      const datos = await supabaseRequest(query);
      setFichajes(datos || []);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al buscar fichajes' });
    }
  };

  const agregarUbicacion = async () => {
    if (!nuevaUbicacion.nombre || !nuevaUbicacion.latitud || !nuevaUbicacion.longitud) {
      setMensaje({ tipo: 'error', texto: 'Completa todos los campos' });
      return;
    }
    try {
      await supabaseRequest('ubicaciones', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nuevaUbicacion.nombre,
          latitud: parseFloat(nuevaUbicacion.latitud),
          longitud: parseFloat(nuevaUbicacion.longitud),
          radio: parseInt(nuevaUbicacion.radio),
          activa: true,
        }),
      });
      setMensaje({ tipo: 'success', texto: 'Ubicación añadida' });
      setNuevaUbicacion({ nombre: '', latitud: '', longitud: '', radio: 200 });
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al añadir ubicación' });
    }
  };

  const toggleUbicacion = async (id, activa) => {
    try {
      await supabaseRequest(`ubicaciones?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ activa: !activa }),
      });
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar ubicación' });
    }
  };

  const agregarUsuario = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.usuario || !nuevoUsuario.password) {
      setMensaje({ tipo: 'error', texto: 'Completa todos los campos' });
      return;
    }
    try {
      await supabaseRequest('usuarios', {
        method: 'POST',
        body: JSON.stringify(nuevoUsuario),
      });
      setMensaje({ tipo: 'success', texto: 'Usuario creado' });
      setNuevoUsuario({ nombre: '', usuario: '', password: '', rol: 'tecnico' });
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al crear usuario' });
    }
  };

  const getNombreUsuario = (id) => {
    const usr = usuarios.find(u => u.id === id);
    return usr ? usr.nombre : 'Desconocido';
  };

  const exportarCSV = () => {
    if (fichajes.length === 0) return;
    
    const headers = ['Fecha', 'Trabajador', 'Entrada', 'Salida Comida', 'Vuelta Comida', 'Salida', 'Horas'];
    const rows = fichajes.map(f => [
      f.fecha,
      getNombreUsuario(f.usuario_id),
      formatTime(f.entrada),
      formatTime(f.salida_comida),
      formatTime(f.entrada_comida),
      formatTime(f.salida),
      calcularHoras(f),
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fichajes_${filtros.desde || 'todos'}_${filtros.hasta || 'todos'}.csv`;
    a.click();
  };

  return (
    <div style={styles.app}>
      <div style={{ ...styles.container, maxWidth: '800px' }}>
        <div style={styles.header}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Administrador</div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>{usuario.nombre}</div>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>Salir</button>
        </div>

        {/* Navegación */}
        <div style={styles.nav}>
          {['informes', 'ubicaciones', 'usuarios'].map(v => (
            <button
              key={v}
              style={{ ...styles.navBtn, ...(vista === v ? styles.navBtnActive : styles.navBtnInactive) }}
              onClick={() => setVista(v)}
            >
              {v === 'informes' ? '📊 Informes' : v === 'ubicaciones' ? '📍 Ubicaciones' : '👥 Usuarios'}
            </button>
          ))}
        </div>

        {mensaje.texto && (
          <div style={mensaje.tipo === 'error' ? styles.error : styles.success}>
            {mensaje.texto}
          </div>
        )}

        {/* Vista: Informes */}
        {vista === 'informes' && (
          <div style={styles.card}>
            <h2 style={{ ...styles.title, fontSize: '20px', marginBottom: '20px' }}>Generar Informe</h2>
            
            <select
              style={styles.select}
              value={filtros.usuario_id}
              onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}
            >
              <option value="">Todos los trabajadores</option>
              {usuarios.filter(u => u.rol === 'tecnico').map(u => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Desde</label>
                <input
                  style={styles.input}
                  type="date"
                  value={filtros.desde}
                  onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Hasta</label>
                <input
                  style={styles.input}
                  type="date"
                  value={filtros.hasta}
                  onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ ...styles.button, flex: 1 }} onClick={buscarFichajes}>
                🔍 Buscar
              </button>
              <button 
                style={{ ...styles.buttonSecondary, flex: 1, marginTop: '8px' }} 
                onClick={exportarCSV}
                disabled={fichajes.length === 0}
              >
                📥 Exportar CSV
              </button>
            </div>

            {fichajes.length > 0 && (
              <div style={{ marginTop: '24px', overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Fecha</th>
                      <th style={styles.th}>Trabajador</th>
                      <th style={styles.th}>Entrada</th>
                      <th style={styles.th}>Sal. Comida</th>
                      <th style={styles.th}>Vta. Comida</th>
                      <th style={styles.th}>Salida</th>
                      <th style={styles.th}>Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fichajes.map(f => (
                      <tr key={f.id}>
                        <td style={styles.td}>{formatDateShort(f.fecha)}</td>
                        <td style={styles.td}>{getNombreUsuario(f.usuario_id)}</td>
                        <td style={styles.td}>{formatTime(f.entrada)}</td>
                        <td style={styles.td}>{formatTime(f.salida_comida)}</td>
                        <td style={styles.td}>{formatTime(f.entrada_comida)}</td>
                        <td style={styles.td}>{formatTime(f.salida)}</td>
                        <td style={{ ...styles.td, color: '#4facfe', fontWeight: '600' }}>{calcularHoras(f)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="6" style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>Total horas:</td>
                      <td style={{ ...styles.td, color: '#00c896', fontWeight: '700', fontSize: '16px' }}>
                        {fichajes.reduce((sum, f) => sum + parseFloat(calcularHoras(f)), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Vista: Ubicaciones */}
        {vista === 'ubicaciones' && (
          <div style={styles.card}>
            <h2 style={{ ...styles.title, fontSize: '20px', marginBottom: '20px' }}>Ubicaciones de Trabajo</h2>
            
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'rgba(255,255,255,0.8)' }}>Añadir nueva ubicación</h3>
              <input
                style={styles.input}
                placeholder="Nombre (ej: Cliente Munich)"
                value={nuevaUbicacion.nombre}
                onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, nombre: e.target.value })}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <input
                  style={styles.input}
                  placeholder="Latitud"
                  value={nuevaUbicacion.latitud}
                  onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, latitud: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="Longitud"
                  value={nuevaUbicacion.longitud}
                  onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, longitud: e.target.value })}
                />
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Radio (m)"
                  value={nuevaUbicacion.radio}
                  onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, radio: e.target.value })}
                />
              </div>
              <button style={styles.button} onClick={agregarUbicacion}>➕ Añadir ubicación</button>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
                💡 Tip: En Google Maps, haz clic derecho en el punto y copia las coordenadas
              </p>
            </div>

            {ubicaciones.length > 0 && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Coordenadas</th>
                    <th style={styles.th}>Radio</th>
                    <th style={styles.th}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ubicaciones.map(u => (
                    <tr key={u.id}>
                      <td style={styles.td}>{u.nombre}</td>
                      <td style={styles.td}>{u.latitud}, {u.longitud}</td>
                      <td style={styles.td}>{u.radio}m</td>
                      <td style={styles.td}>
                        <button
                          style={{
                            ...styles.badge,
                            background: u.activa ? 'rgba(0,200,150,0.2)' : 'rgba(255,100,100,0.2)',
                            color: u.activa ? '#00c896' : '#ff6b6b',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => toggleUbicacion(u.id, u.activa)}
                        >
                          {u.activa ? 'Activa' : 'Inactiva'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Vista: Usuarios */}
        {vista === 'usuarios' && (
          <div style={styles.card}>
            <h2 style={{ ...styles.title, fontSize: '20px', marginBottom: '20px' }}>Gestión de Usuarios</h2>
            
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'rgba(255,255,255,0.8)' }}>Crear nuevo usuario</h3>
              <input
                style={styles.input}
                placeholder="Nombre completo"
                value={nuevoUsuario.nombre}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  style={styles.input}
                  placeholder="Usuario"
                  value={nuevoUsuario.usuario}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, usuario: e.target.value })}
                />
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Contraseña"
                  value={nuevoUsuario.password}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                />
              </div>
              <select
                style={styles.select}
                value={nuevoUsuario.rol}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
              >
                <option value="tecnico">Técnico</option>
                <option value="admin">Administrador</option>
              </select>
              <button style={styles.button} onClick={agregarUsuario}>➕ Crear usuario</button>
            </div>

            {usuarios.length > 0 && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Usuario</th>
                    <th style={styles.th}>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id}>
                      <td style={styles.td}>{u.nombre}</td>
                      <td style={styles.td}>{u.usuario}</td>
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
