# Contribuir a Fichaje GNC

¡Gracias por tu interés en contribuir al proyecto! 🎉

## 📋 Antes de Contribuir

1. Asegúrate de tener acceso al repositorio
2. Lee la documentación técnica (`DOCUMENTACION_TECNICA.md`)
3. Configura tu entorno local siguiendo `GUIA_INSTALACION.md`

## 🔧 Configuración del Entorno de Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/fichaje-gnc.git
cd fichaje-gnc

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm start
```

## 📝 Flujo de Trabajo

### 1. Crear una rama
```bash
git checkout -b feature/nombre-de-la-feature
# o
git checkout -b fix/descripcion-del-bug
```

### 2. Hacer cambios
- Sigue el estilo de código existente
- Comenta el código cuando sea necesario
- Prueba los cambios localmente

### 3. Commit
Usa mensajes de commit descriptivos:
```bash
git commit -m "feat: añadir exportación a Excel"
git commit -m "fix: corregir validación de GPS en iOS"
git commit -m "docs: actualizar manual de usuario"
```

Prefijos recomendados:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formato (sin cambios de código)
- `refactor:` Refactorización
- `test:` Tests

### 4. Push y Pull Request
```bash
git push origin feature/nombre-de-la-feature
```
Luego crea un Pull Request en GitHub.

## 🧪 Testing

Antes de enviar cambios, verifica:
- [ ] La aplicación compila sin errores (`npm run build`)
- [ ] El login funciona correctamente
- [ ] La geolocalización funciona en móvil
- [ ] Los fichajes se guardan en la base de datos
- [ ] El panel de administración es accesible

## 🚫 Qué NO Hacer

- ❌ No subas credenciales reales (API keys, PINs, URLs con datos)
- ❌ No modifiques el schema de BD sin documentarlo
- ❌ No hagas commits directos a `main`
- ❌ No elimines validaciones de seguridad GPS

## 📞 Contacto

Para dudas o sugerencias:
- Email: f.huidobro@gnchypatia.com
- Issues: Crear un issue en GitHub

---

*Proyecto desarrollado para GNC Hipatia*
