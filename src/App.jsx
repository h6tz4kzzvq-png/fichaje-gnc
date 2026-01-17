import { useState, useEffect } from 'react';

// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================
const SUPABASE_URL = 'https://bjztcgvbkmgjfbrqvpsr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqenRjZ3Zia21namZicnF2cHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTMxMzEsImV4cCI6MjA4NDA2OTEzMX0.QCnrWvIxy2nlxxdkhPeF3cvi7iqBLEtYsDDggezrJN0';

const supabaseRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.method === 'POST' ? 'return=representation' : 'return=minimal',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error ${response.status}: ${error}`);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// ============================================
// ESTILOS
// ============================================
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  input: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  buttonSecondary: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'transparent',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '12px',
    textAlign: 'left',
    color: 'white',
    fontWeight: '600',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tab: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tabActive: {
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderBottom: '2px solid #667eea',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

// ============================================
// FUNCIÓN CALCULAR DISTANCIA
// ============================================
const calcularDistancia = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// ============================================
// COMPONENTE LOGIN
// ============================================
const Login = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const usuarios = await supabaseRequest(`usuarios?pin=eq.${pin}`);
      
      if (usuarios && usuarios.length > 0) {
        onLogin(usuarios[0]);
      } else {
        setError('PIN incorrecto');
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
        <div style={{ ...styles.card, width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: 'white', marginBottom: '10px', fontSize: '28px' }}>🏭 GNC Hipatia</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Sistema de Fichaje</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="password"
                placeholder="Introduce tu PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                style={styles.input}
                maxLength={4}
                autoFocus
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '10px', padding: '10px', marginBottom: '20px', color: '#fca5a5', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PANEL TRABAJADOR (con verificación de ubicación asignada)
// ============================================
const PanelTrabajador = ({ usuario, onLogout }) => {
  const [registroHoy, setRegistroHoy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [ubicacionAsignada, setUbicacionAsignada] = useState(null);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(true);

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargandoUbicacion(true);
    try {
      // Cargar ubicación asignada del usuario
      const usuarioData = await supabaseRequest(
        `usuarios?id=eq.${usuario.id}&select=*,ubicaciones:ubicacion_asignada_id(*)`
      );
      if (usuarioData && usuarioData[0] && usuarioData[0].ubicaciones) {
        setUbicacionAsignada(usuarioData[0].ubicaciones);
      }

      // Cargar registro de hoy
      const registros = await supabaseRequest(
        `registros?usuario_id=eq.${usuario.id}&fecha=eq.${hoy}`
      );
      if (registros && registros.length > 0) {
        setRegistroHoy(registros[0]);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setMensaje('Error cargando datos: ' + err.message);
    } finally {
      setCargandoUbicacion(false);
    }
  };

  const verificarUbicacion = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ valido: false, mensaje: '❌ Tu navegador no soporta geolocalización' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          
          // Verificar que tenga ubicación asignada
          if (!ubicacionAsignada) {
            resolve({ 
              valido: false, 
              mensaje: '⚠️ No tienes ubicación de trabajo asignada. Contacta con el administrador.' 
            });
            return;
          }

          // Calcular distancia a la ubicación asignada
          const distancia = calcularDistancia(lat, lng, ubicacionAsignada.lat, ubicacionAsignada.lng);
          
          if (distancia <= ubicacionAsignada.radio) {
            resolve({ 
              valido: true, 
              ubicacion: ubicacionAsignada.nombre,
              distancia: Math.round(distancia),
              coords: { lat, lng }
            });
          } else {
            resolve({ 
              valido: false, 
              mensaje: `❌ No estás en tu ubicación asignada (${ubicacionAsignada.nombre}). Distancia: ${Math.round(distancia)}m, máximo permitido: ${ubicacionAsignada.radio}m`
            });
          }
        },
        (error) => {
          resolve({ valido: false, mensaje: '❌ Error obteniendo ubicación: ' + error.message });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const fichar = async (tipo) => {
    setLoading(true);
    setMensaje('');

    try {
      const verificacion = await verificarUbicacion();
      
      if (!verificacion.valido) {
        setMensaje(verificacion.mensaje);
        setLoading(false);
        return;
      }

      const ahora = new Date().toISOString();
      let registro = registroHoy;

      if (!registro) {
        // Crear nuevo registro
        const nuevoId = `reg_${Date.now()}`;
        const nuevoRegistro = {
          id: nuevoId,
          fecha: hoy,
          usuario_id: usuario.id,
          [tipo]: ahora,
          ubicacion: verificacion.ubicacion,
        };

        await supabaseRequest('registros', {
          method: 'POST',
          body: JSON.stringify(nuevoRegistro),
        });

        registro = nuevoRegistro;
      } else {
        // Actualizar registro existente
        await supabaseRequest(`registros?id=eq.${registro.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ [tipo]: ahora }),
        });

        registro = { ...registro, [tipo]: ahora };
      }

      setRegistroHoy(registro);
      setMensaje(`✅ ${tipo === 'entrada' ? 'Entrada' : tipo === 'salida_comida' ? 'Salida a comer' : tipo === 'entrada_comida' ? 'Vuelta de comer' : 'Salida'} registrada en ${verificacion.ubicacion} (${verificacion.distancia}m)`);
    } catch (err) {
      setMensaje('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatHora = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const siguienteAccion = () => {
    if (!registroHoy || !registroHoy.entrada) return { tipo: 'entrada', texto: '🟢 Entrada', color: '#22c55e' };
    if (!registroHoy.salida_comida) return { tipo: 'salida_comida', texto: '🍽️ Salir a comer', color: '#f97316' };
    if (!registroHoy.entrada_comida) return { tipo: 'entrada_comida', texto: '🍽️ Volver de comer', color: '#3b82f6' };
    if (!registroHoy.salida_tarde) return { tipo: 'salida_tarde', texto: '🔴 Salida', color: '#ef4444' };
    return null;
  };

  const accion = siguienteAccion();

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: 'white', margin: 0 }}>👋 Hola, {usuario.nombre}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: '5px 0 0 0' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              
              {/* Mostrar ubicación asignada */}
              {cargandoUbicacion ? (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '10px 0 0 0' }}>
                  Cargando ubicación...
                </p>
              ) : ubicacionAsignada ? (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: '10px 0 0 0' }}>
                  📍 Ubicación de trabajo: <strong style={{ color: '#22c55e' }}>{ubicacionAsignada.nombre}</strong>
                </p>
              ) : (
                <p style={{ color: '#f97316', fontSize: '14px', margin: '10px 0 0 0' }}>
                  ⚠️ Sin ubicación asignada - Contacta con administración
                </p>
              )}
            </div>
            <button onClick={onLogout} style={{ ...styles.buttonSecondary, width: 'auto', padding: '8px 15px' }}>
              Salir
            </button>
          </div>

          {/* Estado del día */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ color: 'white', margin: '0 0 15px 0', fontSize: '16px' }}>📋 Hoy</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Entrada</div>
                <div style={{ color: '#22c55e', fontSize: '20px', fontWeight: 'bold' }}>{formatHora(registroHoy?.entrada)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Salida comer</div>
                <div style={{ color: '#f97316', fontSize: '20px', fontWeight: 'bold' }}>{formatHora(registroHoy?.salida_comida)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Vuelta comer</div>
                <div style={{ color: '#3b82f6', fontSize: '20px', fontWeight: 'bold' }}>{formatHora(registroHoy?.entrada_comida)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Salida</div>
                <div style={{ color: '#ef4444', fontSize: '20px', fontWeight: 'bold' }}>{formatHora(registroHoy?.salida_tarde)}</div>
              </div>
            </div>
          </div>

          {/* Mensaje */}
          {mensaje && (
            <div style={{
              background: mensaje.includes('✅') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${mensaje.includes('✅') ? '#22c55e' : '#ef4444'}`,
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              color: mensaje.includes('✅') ? '#86efac' : '#fca5a5',
              textAlign: 'center',
            }}>
              {mensaje}
            </div>
          )}

          {/* Botón de acción */}
          {accion ? (
            <button
              onClick={() => fichar(accion.tipo)}
              disabled={loading || !ubicacionAsignada}
              style={{
                ...styles.button,
                background: ubicacionAsignada ? accion.color : '#6b7280',
                fontSize: '20px',
                padding: '20px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '⏳ Verificando ubicación...' : accion.texto}
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '10px' }}>
              <span style={{ fontSize: '40px' }}>✅</span>
              <p style={{ color: '#22c55e', margin: '10px 0 0 0' }}>¡Jornada completada!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// PANEL ADMIN (con asignación de ubicación)
// ============================================
const PanelAdmin = ({ usuario, onLogout }) => {
  const [tab, setTab] = useState('fichajes');
  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', pin: '' });
  const [nuevaUbicacion, setNuevaUbicacion] = useState({ nombre: '', lat: '', lng: '', radio: '200' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [regs, usrs, ubis] = await Promise.all([
        supabaseRequest('registros?order=fecha.desc&limit=100'),
        supabaseRequest('usuarios?order=nombre'),
        supabaseRequest('ubicaciones?order=nombre'),
      ]);
      setRegistros(regs || []);
      setUsuarios(usrs || []);
      setUbicaciones(ubis || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para asignar ubicación a un técnico
  const asignarUbicacion = async (usuarioId, ubicacionId) => {
    try {
      const valor = ubicacionId === '' ? null : parseInt(ubicacionId);
      
      await supabaseRequest(`usuarios?id=eq.${usuarioId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ubicacion_asignada_id: valor
        }),
      });
      
      // Actualizar estado local
      setUsuarios(usuarios.map(u => 
        u.id === usuarioId 
          ? { ...u, ubicacion_asignada_id: valor }
          : u
      ));
      
      const ubicacion = ubicaciones.find(ub => ub.id === parseInt(ubicacionId));
      alert(ubicacionId ? `✅ Ubicación asignada: ${ubicacion?.nombre}` : '✅ Ubicación desasignada');
    } catch (err) {
      console.error('Error al asignar ubicación:', err);
      alert('Error al asignar ubicación: ' + err.message);
    }
  };

  const agregarUsuario = async () => {
    if (!nuevoUsuario.nombre.trim() || nuevoUsuario.pin.length !== 4) {
      alert('Introduce nombre y PIN de 4 dígitos');
      return;
    }

    try {
      const id = `tec_${Date.now()}`;
      await supabaseRequest('usuarios', {
        method: 'POST',
        body: JSON.stringify({
          id,
          nombre: nuevoUsuario.nombre.trim(),
          pin: nuevoUsuario.pin,
          rol: 'tecnico',
        }),
      });

      setUsuarios([...usuarios, { id, nombre: nuevoUsuario.nombre.trim(), pin: nuevoUsuario.pin, rol: 'tecnico' }]);
      setNuevoUsuario({ nombre: '', pin: '' });
      alert('✅ Usuario añadido');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;

    try {
      await supabaseRequest(`usuarios?id=eq.${id}`, { method: 'DELETE' });
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const agregarUbicacion = async () => {
    const { nombre, lat, lng, radio } = nuevaUbicacion;
    if (!nombre.trim() || !lat || !lng) {
      alert('Completa nombre, latitud y longitud');
      return;
    }

    try {
      const result = await supabaseRequest('ubicaciones', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radio: parseInt(radio) || 200,
        }),
      });

      await cargarDatos();
      setNuevaUbicacion({ nombre: '', lat: '', lng: '', radio: '200' });
      alert('✅ Ubicación añadida');
    } catch (err) {
      alert('Error al añadir ubicación: ' + err.message);
    }
  };

  const eliminarUbicacion = async (id) => {
    if (!confirm('¿Eliminar esta ubicación?')) return;

    try {
      await supabaseRequest(`ubicaciones?id=eq.${id}`, { method: 'DELETE' });
      setUbicaciones(ubicaciones.filter((u) => u.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getNombreUsuario = (id) => {
    const u = usuarios.find((usr) => usr.id === id);
    return u ? u.nombre : 'Desconocido';
  };

  const getNombreUbicacion = (id) => {
    const ub = ubicaciones.find((u) => u.id === id);
    return ub ? ub.nombre : 'Sin asignar';
  };

  const registrosFiltrados = registros
    .filter((r) => {
      if (filtroFecha && r.fecha !== filtroFecha) return false;
      if (filtroUsuario && r.usuario_id !== filtroUsuario) return false;
      return true;
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const formatHora = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const calcularHoras = (r) => {
    if (!r.entrada || !r.salida_tarde) return '-';
    const entrada = new Date(r.entrada);
    const salida = new Date(r.salida_tarde);
    let minutos = (salida - entrada) / 60000;

    if (r.salida_comida && r.entrada_comida) {
      const salidaComida = new Date(r.salida_comida);
      const entradaComida = new Date(r.entrada_comida);
      minutos -= (entradaComida - salidaComida) / 60000;
    }

    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins}m`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <p style={{ color: 'white' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: 'white', margin: 0 }}>🔧 Panel de Administración</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: '5px 0 0 0' }}>{usuario.nombre}</p>
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

          {/* Tab Fichajes */}
          {tab === 'fichajes' && (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  style={{ ...styles.input, width: 'auto' }}
                />
                <select
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  style={{ ...styles.input, width: 'auto' }}
                >
                  <option value="">Todos los usuarios</option>
                  {usuarios.filter((u) => u.rol === 'tecnico').map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
                <button onClick={cargarDatos} style={{ ...styles.button, width: 'auto', padding: '10px 20px' }}>
                  🔄 Actualizar
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Fecha</th>
                      <th style={styles.th}>Técnico</th>
                      <th style={styles.th}>Entrada</th>
                      <th style={styles.th}>Salida Comer</th>
                      <th style={styles.th}>Vuelta Comer</th>
                      <th style={styles.th}>Salida</th>
                      <th style={styles.th}>Total</th>
                      <th style={styles.th}>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ ...styles.td, textAlign: 'center' }}>
                          No hay registros
                        </td>
                      </tr>
                    ) : (
                      registrosFiltrados.map((r) => (
                        <tr key={r.id}>
                          <td style={styles.td}>{r.fecha}</td>
                          <td style={styles.td}>{getNombreUsuario(r.usuario_id)}</td>
                          <td style={{ ...styles.td, color: '#22c55e' }}>{formatHora(r.entrada)}</td>
                          <td style={{ ...styles.td, color: '#f97316' }}>{formatHora(r.salida_comida)}</td>
                          <td style={{ ...styles.td, color: '#3b82f6' }}>{formatHora(r.entrada_comida)}</td>
                          <td style={{ ...styles.td, color: '#ef4444' }}>{formatHora(r.salida_tarde)}</td>
                          <td style={{ ...styles.td, fontWeight: 'bold' }}>{calcularHoras(r)}</td>
                          <td style={styles.td}>{r.ubicacion || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Usuarios CON asignación de ubicación */}
          {tab === 'usuarios' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '15px' }}>👥 Gestión de Usuarios</h3>

              {/* Formulario añadir usuario */}
              <div style={{ ...styles.card, background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <h4 style={{ color: 'white', margin: '0 0 15px 0' }}>Añadir nuevo técnico</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={nuevoUsuario.nombre}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                    style={{ ...styles.input, flex: 1, minWidth: '150px' }}
                  />
                  <input
                    type="text"
                    placeholder="PIN (4 dígitos)"
                    value={nuevoUsuario.pin}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    style={{ ...styles.input, width: '120px' }}
                    maxLength={4}
                  />
                  <button onClick={agregarUsuario} style={{ ...styles.button, width: 'auto', padding: '10px 20px' }}>
                    + Añadir
                  </button>
                </div>
              </div>

              {/* Tabla de usuarios con asignación de ubicación */}
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>PIN</th>
                      <th style={styles.th}>Rol</th>
                      <th style={styles.th}>📍 Ubicación Asignada</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id}>
                        <td style={styles.td}>{u.nombre}</td>
                        <td style={styles.td}>{u.pin}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              background: u.rol === 'admin' ? '#3b82f6' : '#22c55e',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '12px',
                            }}
                          >
                            {u.rol === 'admin' ? '👑 Admin' : '🔧 Técnico'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {u.rol === 'tecnico' ? (
                            <select
                              value={u.ubicacion_asignada_id || ''}
                              onChange={(e) => asignarUbicacion(u.id, e.target.value)}
                              style={{
                                ...styles.input,
                                padding: '8px 12px',
                                fontSize: '13px',
                                width: '100%',
                                minWidth: '200px',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="">-- Sin asignar --</option>
                              {ubicaciones.map((ub) => (
                                <option key={ub.id} value={ub.id}>
                                  📍 {ub.nombre}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>N/A</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {u.rol !== 'admin' && (
                            <button
                              onClick={() => eliminarUsuario(u.id)}
                              style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Ubicaciones */}
          {tab === 'ubicaciones' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '15px' }}>📍 Gestión de Ubicaciones</h3>

              {/* Formulario añadir ubicación */}
              <div style={{ ...styles.card, background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <h4 style={{ color: 'white', margin: '0 0 15px 0' }}>Añadir nueva ubicación</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Nombre (ej: Cliente Munich)"
                    value={nuevaUbicacion.nombre}
                    onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, nombre: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Latitud (ej: 48.1351)"
                    value={nuevaUbicacion.lat}
                    onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, lat: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Longitud (ej: 11.5820)"
                    value={nuevaUbicacion.lng}
                    onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, lng: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="number"
                    placeholder="Radio (metros)"
                    value={nuevaUbicacion.radio}
                    onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, radio: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <button onClick={agregarUbicacion} style={{ ...styles.button, marginTop: '15px', width: 'auto', padding: '10px 30px' }}>
                  + Añadir ubicación
                </button>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '10px' }}>
                  💡 Consejo: Busca las coordenadas en Google Maps (clic derecho → "¿Qué hay aquí?")
                </p>
              </div>

              {/* Tabla de ubicaciones */}
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>Latitud</th>
                      <th style={styles.th}>Longitud</th>
                      <th style={styles.th}>Radio</th>
                      <th style={styles.th}>Técnicos asignados</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ubicaciones.map((ub) => {
                      const tecnicosAsignados = usuarios.filter(u => u.ubicacion_asignada_id === ub.id);
                      return (
                        <tr key={ub.id}>
                          <td style={styles.td}>{ub.nombre}</td>
                          <td style={styles.td}>{ub.lat}</td>
                          <td style={styles.td}>{ub.lng}</td>
                          <td style={styles.td}>{ub.radio}m</td>
                          <td style={styles.td}>
                            {tecnicosAsignados.length > 0 ? (
                              <span style={{ color: '#22c55e' }}>
                                {tecnicosAsignados.map(t => t.nombre).join(', ')}
                              </span>
                            ) : (
                              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Ninguno</span>
                            )}
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => eliminarUbicacion(ub.id)}
                              style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
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
      try {
        setUsuario(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('fichaje_usuario');
      }
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
