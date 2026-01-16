import React, { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://ewvgrtalxwrssfyuopmc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dmdydGFseHdyc3NmeXVvcG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODAyMDgsImV4cCI6MjA4NDA1NjIwOH0.wANHY-m4Dn4e2qxJgliF9zalf8BQx9KEsLOzqWxq5Lg';

const supabase = {
  from: (table) => ({
    select: async (columns = '*') => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
    selectWhere: async (columns = '*', field, value) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${field}=eq.${value}`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
    selectWhereMultiple: async (columns = '*', filters) => {
      const filterStr = Object.entries(filters).map(([k, v]) => `${k}=eq.${v}`).join('&');
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${filterStr}`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
    insert: async (data) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      return { data: result, error: res.ok ? null : result };
    },
    update: async (data, field, value) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${field}=eq.${value}`, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      return { data: result, error: res.ok ? null : result };
    },
  }),
};

const formatTime = (date) => {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const formatDateShort = (date) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

const calcularHorasTrabajadas = (registro) => {
  if (!registro) return 0;
  let minutosTotales = 0;
  if (registro.entrada && registro.salida_comida) minutosTotales += (new Date(registro.salida_comida) - new Date(registro.entrada)) / 60000;
  if (registro.entrada_comida && registro.salida_tarde) minutosTotales += (new Date(registro.salida_tarde) - new Date(registro.entrada_comida)) / 60000;
  return Math.round(minutosTotales / 60 * 100) / 100;
};

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const styles = {
  container: { fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', padding: '16px' },
  card: { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxWidth: '420px', margin: '0 auto' },
  input: { width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e2e8f0', borderRadius: '10px', marginBottom: '12px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600', color: '#fff', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  fichajeBtn: { padding: '20px', fontSize: '18px', fontWeight: '600', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px', width: '100%' },
  completado: { background: '#f0fdf4', color: '#166534', border: '2px solid #86efac' },
  pendiente: { background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff' },
  bloqueado: { background: '#f1f5f9', color: '#94a3b8', border: '2px dashed #cbd5e1' },
  alert: { padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' },
  alertOk: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
  alertErr: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  alertWarn: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab: { flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  tabActive: { background: '#1e3a5f', color: '#fff' },
  tabInactive: { background: '#f1f5f9', color: '#64748b' },
};

function LoginScreen({ onLogin, usuarios, loading }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedUser) { setError('Selecciona tu nombre'); return; }
    const user = usuarios.find(u => u.id === parseInt(selectedUser));
    if (!user) { setError('Usuario no encontrado'); return; }
    if (user.pin !== pin) { setError('PIN incorrecto'); return; }
    onLogin(user);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a5f' }}>⏱️ GNC Hipatia</div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>Control de Fichaje</div>
        </div>
        {error && <div style={{...styles.alert, ...styles.alertErr}}>⚠️ {error}</div>}
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '14px', color: '#0369a1' }}>
          <strong>📱 Fichaje desde obra</strong><br/>Los fichajes quedan registrados de forma permanente.
        </div>
        {loading ? <div style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Cargando...</div> : (
          <>
            <select style={styles.input} value={selectedUser} onChange={(e) => { setSelectedUser(e.target.value); setError(''); }}>
              <option value="">-- Selecciona tu nombre --</option>
              {usuarios.filter(u => u.rol === 'tecnico').map(user => <option key={user.id} value={user.id}>{user.nombre}</option>)}
            </select>
            <input type="password" placeholder="PIN (4 digitos)" style={styles.input} value={pin} onChange={(e) => { setPin(e.target.value); setError(''); }} maxLength={4} inputMode="numeric" />
            <button style={styles.button} onClick={handleLogin}>👤 Entrar</button>
          </>
        )}
      </div>
    </div>
  );
}

function FichajeScreen({ user, onLogout, ubicaciones }) {
  const [tab, setTab] = useState('fichar');
  const [registroHoy, setRegistroHoy] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const hoyStr = new Date().toISOString().split('T')[0];

  useEffect(() => { cargarDatos(); obtenerUbicacion(); }, []);

  const cargarDatos = async () => {
    const { data: rHoy } = await supabase.from('fichajes').selectWhereMultiple('*', { usuario_id: user.id, fecha: hoyStr });
    if (rHoy && rHoy.length > 0) setRegistroHoy(rHoy[0]);
    const { data: todos } = await supabase.from('fichajes').selectWhere('*', 'usuario_id', user.id);
    if (todos) setHistorial(todos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
  };

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) { setGeoError('Geolocalizacion no disponible'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let found = null, minDist = Infinity;
        for (const ub of ubicaciones) {
          const dist = calcularDistancia(latitude, longitude, ub.lat, ub.lng);
          if (dist <= ub.radio && dist < minDist) { minDist = dist; found = { ...ub, distancia: Math.round(dist) }; }
        }
        setUbicacionActual(found);
        if (!found) setGeoError('No estas en ninguna ubicacion de trabajo');
      },
      () => setGeoError('No se pudo obtener ubicacion. Activa el GPS.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const realizarFichaje = async (tipo) => {
    if (!ubicacionActual) { setMensaje({ tipo: 'error', texto: 'Debes estar en ubicacion de trabajo' }); return; }
    setLoading(true);
    const ahora = new Date().toISOString();
    try {
      if (!registroHoy) {
        const { data } = await supabase.from('fichajes').insert({ usuario_id: user.id, fecha: hoyStr, ubicacion_id: ubicacionActual.id, ubicacion_nombre: ubicacionActual.nombre, [tipo]: ahora });
        setRegistroHoy(data[0]);
      } else {
        await supabase.from('fichajes').update({ [tipo]: ahora }, 'id', registroHoy.id);
        setRegistroHoy({ ...registroHoy, [tipo]: ahora });
      }
      setMensaje({ tipo: 'success', texto: '✅ Fichaje registrado' });
      await cargarDatos();
    } catch (e) { setMensaje({ tipo: 'error', texto: 'Error al guardar' }); }
    setLoading(false);
    setTimeout(() => setMensaje(null), 3000);
  };

  const getSiguiente = () => {
    if (!registroHoy || !registroHoy.entrada) return 'entrada';
    if (!registroHoy.salida_comida) return 'salida_comida';
    if (!registroHoy.entrada_comida) return 'entrada_comida';
    if (!registroHoy.salida_tarde) return 'salida_tarde';
    return null;
  };

  const generarCSV = () => {
    if (historial.length === 0) { setMensaje({ tipo: 'error', texto: 'No hay fichajes' }); return; }
    let csv = 'Fecha,Ubicacion,Entrada,Salida Comida,Entrada Comida,Salida Tarde,Horas\n';
    let total = 0;
    historial.forEach(r => {
      const h = calcularHorasTrabajadas(r); total += h;
      csv += `${formatDateShort(r.fecha)},"${r.ubicacion_nombre || ''}",${formatTime(r.entrada)},${formatTime(r.salida_comida)},${formatTime(r.entrada_comida)},${formatTime(r.salida_tarde)},${h.toFixed(2)}\n`;
    });
    csv += `\nTOTAL,,,,,,${total.toFixed(2)} horas\nTecnico: ${user.nombre}\nGenerado: ${new Date().toLocaleString('es-ES')}\n`;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `fichaje_${user.nombre.replace(/\s+/g, '_')}_${hoyStr}.csv`; link.click();
    setMensaje({ tipo: 'success', texto: '📥 Descargado' }); setTimeout(() => setMensaje(null), 3000);
  };

  const sig = getSiguiente();
  const labels = { entrada: '🌅 Entrada', salida_comida: '🍽️ Salida a comer', entrada_comida: '☕ Vuelta de comer', salida_tarde: '🌙 Salida' };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a5f' }}>{user.nombre}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>{formatDate(new Date())}</div>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', color: '#64748b', fontSize: '14px' }}>🚪 Salir</button>
        </div>
        {mensaje && <div style={{...styles.alert, ...(mensaje.tipo === 'success' ? styles.alertOk : styles.alertErr)}}>{mensaje.texto}</div>}
        <div style={styles.tabs}>
          <button style={{...styles.tab, ...(tab === 'fichar' ? styles.tabActive : styles.tabInactive)}} onClick={() => setTab('fichar')}>⏱️ Fichar</button>
          <button style={{...styles.tab, ...(tab === 'historial' ? styles.tabActive : styles.tabInactive)}} onClick={() => setTab('historial')}>📋 Historial</button>
          <button style={{...styles.tab, ...(tab === 'informe' ? styles.tabActive : styles.tabInactive)}} onClick={() => setTab('informe')}>📥 Informe</button>
        </div>

        {tab === 'fichar' && (
          <>
            {ubicacionActual ? (
              <div style={{...styles.alert, ...styles.alertOk}}>📍 <div><strong>{ubicacionActual.nombre}</strong><div style={{fontSize: '12px'}}>A {ubicacionActual.distancia}m</div></div></div>
            ) : geoError ? (
              <div style={{...styles.alert, ...styles.alertErr}}>📍 <div><strong>Fuera de zona</strong><div style={{fontSize: '12px'}}>{geoError}</div></div></div>
            ) : (
              <div style={{...styles.alert, ...styles.alertWarn}}>📍 Obteniendo ubicacion...</div>
            )}
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔒 <span><strong>Fichaje permanente:</strong> No se puede modificar</span>
            </div>
            {['entrada', 'salida_comida', 'entrada_comida', 'salida_tarde'].map((tipo) => {
              const done = registroHoy && registroHoy[tipo];
              const isSig = tipo === sig;
              let st = styles.fichajeBtn;
              if (done) st = {...st, ...styles.completado};
              else if (isSig) st = {...st, ...styles.pendiente};
              else st = {...st, ...styles.bloqueado};
              return (
                <button key={tipo} style={st} onClick={() => !done && isSig && realizarFichaje(tipo)} disabled={done || !isSig || loading || !ubicacionActual}>
                  {done ? <>✅ {labels[tipo]} - {formatTime(registroHoy[tipo])} <span style={{background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px'}}>🔒 Guardado</span></> : labels[tipo]}
                </button>
              );
            })}
            {registroHoy && registroHoy.salida_tarde && (
              <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '16px', marginTop: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#166534' }}>✅ Jornada completada</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#166534' }}>{calcularHorasTrabajadas(registroHoy).toFixed(1)} horas</div>
              </div>
            )}
            <button onClick={obtenerUbicacion} style={{ marginTop: '16px', padding: '10px', width: '100%', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>🔄 Actualizar ubicacion</button>
          </>
        )}

        {tab === 'historial' && (
          <>
            <div style={{ marginBottom: '16px', color: '#64748b', fontSize: '14px' }}>Fichajes registrados ({historial.length} dias)</div>
            {historial.length === 0 ? <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No hay fichajes</div> : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {historial.map((r) => (
                  <div key={r.id} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', color: '#1e3a5f' }}>{formatDateShort(r.fecha)}</div>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>🔒 Bloqueado</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>📍 {r.ubicacion_nombre || 'Sin ubicacion'}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div>🌅 {formatTime(r.entrada)}</div><div>🍽️ {formatTime(r.salida_comida)}</div>
                      <div>☕ {formatTime(r.entrada_comida)}</div><div>🌙 {formatTime(r.salida_tarde)}</div>
                    </div>
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontWeight: '600', color: '#059669' }}>Total: {calcularHorasTrabajadas(r).toFixed(1)} horas</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'informe' && (
          <>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '14px', color: '#0369a1' }}>
              <strong>📊 Informe del viaje</strong><br/>Descarga CSV para abrir en Excel.
            </div>
            {historial.length > 0 && (
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Total</div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#1e3a5f' }}>{historial.reduce((s, r) => s + calcularHorasTrabajadas(r), 0).toFixed(1)}</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>horas en {historial.length} dias</div>
              </div>
            )}
            <button style={{...styles.button, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'}} onClick={generarCSV} disabled={historial.length === 0}>📥 Descargar informe (CSV)</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.from('usuarios').select('*');
      const { data: ub } = await supabase.from('ubicaciones').select('*');
      if (u) setUsuarios(u);
      if (ub) setUbicaciones(ub);
      setLoading(false);
    })();
  }, []);

  if (!user) return <LoginScreen onLogin={setUser} usuarios={usuarios} loading={loading} />;
  return <FichajeScreen user={user} onLogout={() => setUser(null)} ubicaciones={ubicaciones} />;
}
