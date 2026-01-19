# Changelog - Fichaje GNC
## [1.0.1] - 2025-01-19

### 🐛 Corregido
- Corregida la generación de ID al crear nuevos técnicos
- El ID ahora lo genera Supabase automáticamente (antes causaba error "invalid input syntax for type integer")
Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2025-01-18

### ✨ Añadido
- **Sistema de autenticación por PIN** para técnicos y administradores
- **Verificación GPS obligatoria** con radio configurable por ubicación
- **4 fichajes diarios** secuenciales:
  - Entrada (inicio de jornada)
  - Salida a comer
  - Vuelta de comer
  - Salida (fin de jornada)
- **Panel de Administración** con:
  - Gestión de usuarios (crear, editar, eliminar)
  - Gestión de ubicaciones (crear, editar, eliminar)
  - Visualización de todos los fichajes
  - Asignación de ubicación específica por técnico
- **Cálculo automático de horas trabajadas** por jornada
- **Interfaz responsive** adaptada a móviles y tablets
- **Indicador visual de distancia** al punto de trabajo

### 🔧 Técnico
- Integración con Supabase como backend
- Despliegue automático en Vercel desde GitHub
- Geolocalización HTML5 con validación de precisión
- Row Level Security (RLS) en base de datos

### 📚 Documentación
- README.md con descripción del proyecto
- Manual de usuario para técnicos y administradores
- Documentación técnica completa
- Guía de instalación paso a paso
- Schema SQL de la base de datos

---

## [0.2.0] - 2025-01-17

### ✨ Añadido
- Asignación de ubicación específica por técnico
- Validación de que el técnico solo puede fichar en su ubicación asignada
- Campo `ubicacion_asignada_id` en tabla usuarios

### 🐛 Corregido
- Inconsistencia en nombres de campos GPS (lat/lng vs latitud/longitud)
- Errores de caché de esquema en PostgREST
- Problemas de conexión con URL incorrecta de Supabase

---

## [0.1.0] - 2025-01-15

### ✨ Añadido
- Estructura inicial del proyecto React
- Conexión básica con Supabase
- Prototipo de interfaz de fichaje
- Sistema básico de login

---

## Próximas Mejoras Planificadas

### [1.1.0] - Futuro
- [ ] Informes automáticos por email
- [ ] Exportación a Excel/PDF
- [ ] Dashboard con estadísticas
- [ ] Notificaciones push
- [ ] Modo offline con sincronización

### [1.2.0] - Futuro
- [ ] App móvil nativa (React Native)
- [ ] Integración con calendario
- [ ] Gestión de vacaciones y ausencias
- [ ] Firma digital en fichajes
