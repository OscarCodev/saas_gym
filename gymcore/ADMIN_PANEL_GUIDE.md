# Panel de Administrador - Documentación

## 📋 Resumen de Cambios

Se ha implementado un panel completo de administrador para gestionar todos los gimnasios del SaaS GymCore.

### Backend Implementado ✅

**Archivo:** `backend/app/api/routes/admin.py`

**Endpoints creados:**
- `GET /api/v1/admin/stats` - Estadísticas globales del SaaS
- `GET /api/v1/admin/gyms` - Lista de todos los gimnasios (con filtros)
- `GET /api/v1/admin/gyms/{gym_id}` - Detalles de un gimnasio específico
- `PATCH /api/v1/admin/gyms/{gym_id}/toggle-status` - Activar/desactivar gimnasio

**Funcionalidad:**
- Verificación de rol `superadmin`
- Estadísticas: total de gimnasios, socios, ingresos
- Filtrado por estado (activo/inactivo)
- Búsqueda por nombre o email
- Ver detalles completos de cada gimnasio

### Frontend Implementado ✅

**Archivo:** `frontend/src/pages/AdminDashboard.jsx`

**Características:**
- Dashboard con tarjetas de estadísticas
- Tabla de gimnasios con búsqueda y filtros
- Modal de detalles para ver información completa
- Botones para activar/desactivar gimnasios
- UI moderna con Tailwind CSS

**Ruta:** `/admin` (protegida)

## 🔐 Crear Superadministrador

### Opción 1: Script Python

```bash
cd backend
python create_superadmin.py
```

Credenciales por defecto:
- **Email:** admin@gymcore.com
- **Password:** admin123

### Opción 2: Manualmente en la base de datos

1. Primero crear un gym ficticio para el admin:
```sql
INSERT INTO gyms (name, email, phone, address, plan_type, is_active, created_at, updated_at)
VALUES ('Admin System', 'admin@gymcore.com', '000000000', 'Sistema', 'system', 1, datetime('now'), datetime('now'));
```

2. Obtener el password hash (ejecutar en Python):
```python
from app.core.security import get_password_hash
print(get_password_hash("admin123"))
```

3. Crear el usuario superadmin:
```sql
INSERT INTO users (gym_id, email, hashed_password, full_name, role, is_active, created_at)
VALUES (
  (SELECT id FROM gyms WHERE email = 'admin@gymcore.com'),
  'admin@gymcore.com',
  '[HASH_AQUI]',
  'Administrador Sistema',
  'superadmin',
  1,
  datetime('now')
);
```

## 🚀 Uso

1. **Iniciar sesión** con las credenciales de admin
2. **El sistema detecta** el rol `superadmin`
3. **Redirigir** a `/admin` en lugar de `/dashboard`
4. **Gestionar** todos los gimnasios desde el panel

## 📊 Datos Mostrados

**Estadísticas Globales:**
- Total de gimnasios (activos/inactivos)
- Total de socios en toda la plataforma
- Nuevos gimnasios este mes
- Ingresos totales acumulados

**Por cada gimnasio:**
- Nombre, email, teléfono
- Plan contratado
- Estado (activo/inactivo)
- Cantidad de socios (total y activos)
- Fecha de registro
- Información de suscripción
- Lista de usuarios del gimnasio

## 🔧 Configuración Adicional Necesaria

### 1. Actualizar LoginPage para redirigir según rol

```javascript
// En LoginPage.jsx
const handleLogin = async () => {
  const data = await login(email, password);
  
  // Redirigir según rol
  if (data.user.role === 'superadmin') {
    navigate('/admin');
  } else if (data.gym.is_active) {
    navigate('/dashboard');
  } else {
    navigate('/checkout');
  }
};
```

### 2. Proteger la ruta de admin

Ya está configurada en `App.jsx`:
```javascript
<Route 
  path="/admin" 
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## 📝 Notas Importantes

1. **Seguridad:** La ruta `/admin` verifica el rol `superadmin` en el backend
2. **Base de datos:** El superadmin necesita un gym ficticio por la FK
3. **Contraseña:** Cambiar el password por defecto después del primer login
4. **Permisos:** Solo usuarios con rol `superadmin` pueden acceder

## 🎯 Próximos Pasos Sugeridos

- [ ] Agregar gráficos de crecimiento
- [ ] Exportar reportes de todos los gimnasios
- [ ] Gestión de planes de suscripción
- [ ] Logs de actividad de administradores
- [ ] Notificaciones push a gimnasios
