# 🔒 Seguridad - Fichaje GNC

Este documento describe las consideraciones de seguridad del sistema.

## Medidas de Seguridad Implementadas

### 1. Autenticación
- **PIN de 4 dígitos** por usuario
- Cada técnico tiene un PIN único
- Los administradores tienen acceso adicional con su PIN

### 2. Verificación GPS
- **Obligatoria** para todos los fichajes
- Radio configurable por ubicación (por defecto 100m)
- Coordenadas almacenadas con cada fichaje
- Impide fichajes desde ubicaciones no autorizadas

### 3. Base de Datos
- **Row Level Security (RLS)** habilitado en Supabase
- Conexión cifrada HTTPS
- Claves API separadas (anon vs service_role)

### 4. Integridad de Datos
- Los fichajes **no pueden modificarse** una vez creados
- Secuencia obligatoria (entrada → salida comer → vuelta → salida)
- Timestamps automáticos del servidor

## ⚠️ Vulnerabilidades Conocidas

| Riesgo | Nivel | Mitigación |
|--------|-------|------------|
| PIN de 4 dígitos es débil | Medio | Uso interno, sin datos sensibles expuestos |
| GPS puede falsificarse en móviles rooteados | Medio | Auditoría periódica de fichajes anómalos |
| API key visible en frontend | Bajo | RLS limita acciones permitidas |

## 🛡️ Recomendaciones de Seguridad

### Para Administradores
1. **Cambiar PINs periódicamente** (cada 3-6 meses)
2. **Revisar fichajes sospechosos** (misma ubicación exacta siempre)
3. **No compartir credenciales** de Supabase
4. **Hacer backups** regulares de la base de datos

### Para Desarrollo
1. **Nunca** subir `.env` a Git
2. **Nunca** usar `service_role` key en frontend
3. **Validar** siempre en backend (RLS)
4. **Sanitizar** inputs de usuario

## 📧 Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad:

1. **NO** la publiques públicamente
2. Envía un email a: f.huidobro@gnchypatia.com
3. Incluye:
   - Descripción del problema
   - Pasos para reproducirlo
   - Impacto potencial

Responderemos en un plazo de 48-72 horas.

## 🔑 Gestión de Credenciales

### Credenciales del Sistema
| Elemento | Dónde se guarda | Quién tiene acceso |
|----------|-----------------|-------------------|
| URL Supabase | `.env` (local), Vercel (prod) | Desarrolladores |
| Anon Key | `.env` (local), Vercel (prod) | Desarrolladores |
| Service Role Key | Solo Supabase Dashboard | Administrador BD |
| PINs usuarios | Base de datos Supabase | Administradores |

### Rotación de Credenciales
- **PINs de usuario**: Cada 6 meses o cuando se solicite
- **API Keys de Supabase**: Anualmente o si hay compromiso
- **Acceso Vercel/GitHub**: Cuando cambie el equipo

## 📋 Checklist de Despliegue Seguro

Antes de cada despliegue a producción:

- [ ] Variables de entorno configuradas en Vercel
- [ ] `.env` NO incluido en el commit
- [ ] RLS habilitado en todas las tablas
- [ ] Sin `console.log` de datos sensibles
- [ ] Probado en dispositivo real (no emulador)

---

*Última actualización: Enero 2025*
