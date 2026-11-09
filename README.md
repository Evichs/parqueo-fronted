# Parqueos UMES - Sistema de Gestión de Estacionamientos

Frontend empresarial desarrollado en **Next.js 14 (React)** con **TypeScript**, **Tailwind CSS**, **Lucide React**, **Sonner** y **qrcode.react** para la gestión integral de parqueos de la **Universidad Mesoamericana (UMES)**.

El sistema se conecta al backend alojado en Render (`https://parqueos-api.onrender.com`), integrando autenticación JWT, emisión de tickets con código QR, verificación de abonados/pensiones, cobro con Factura Electrónica (FEL SAT) y gestión de catálogos y tarifas.

---

## 🛠️ Arquitectura Técnica y Solución CORS

El backend en Render rechaza las peticiones preflight directas del navegador (OPTIONS responde 404). Por ello, se implementó un **rewrite interno** en `next.config.mjs` que actúa como proxy transparente:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://parqueos-api.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```

Todas las llamadas desde el cliente HTTP (`src/lib/api.ts`) se dirigen a `/api/backend/...`, evitando el bloqueo CORS del navegador e inyectando de forma automática el encabezado `Authorization: Bearer <token>`.

> **Modo Resiliente / Demostración Incluido:** Debido a que los servidores de Render en tier gratuito o servicios SOA externos pueden experimentar latencia o desconexión, el sistema incluye un switch ("Modo Resiliente / Demo") con datos iniciales de alta fidelidad para asegurar que cualquier evaluador pueda navegar y probar el 100% de los módulos sin interrupciones.

---

## 🚀 Módulos y Pantallas Desarrolladas

### 1. Autenticación (`/login`)
- Tarjeta de acceso estilizada con diseño moderno.
- Conexión directa a `POST /api/backend/auth/login`.
- Almacenamiento seguro del token JWT en `localStorage` y redirección automática.
- Botón de "Acceso Rápido Modo Operador / Demo" para pruebas instantáneas.

### 2. Dashboard General (`/dashboard`)
- Sidebar colapsable con navegación responsiva.
- Métricas operativas en tiempo real: Espacios libres vs ocupados, porcentaje de ocupación, vehículos en recinto e ingresos proyectados.
- **Mapa interactivo de parqueos**: Cuadrícula visual de cajones de estacionamiento con filtros por sede/sucursal, nivel y estado.
- Códigos cromáticos:
  - 🟢 **Verde**: Espacio libre / disponible.
  - 🔴 **Rojo**: Espacio ocupado con ticket rotativo.
  - 🔵 **Azul**: Espacio asignado a vehículo con pensión mensual vigente.
- Modal interactivo al hacer clic en cualquier cajón para ver detalles o derivar a Garita/Caja.

### 3. Módulo de Garita - Registro de Ingreso (`/garita`)
- Buscador rápido de placas vehiculares (`GET /api/backend/vehiculos/{placa}`).
- Modal para dar de alta vehículos no registrados (`POST /api/backend/vehiculos`).
- Verificador automático de pensión (`GET /api/backend/pensiones/vehiculo/{id}/acceso`).
- Selector de cajones disponibles (`GET /api/backend/espacios/disponibles`).
- Emisión de ticket (`POST /api/backend/tickets/entrada`).
- **Ticket Térmico (80mm)**: Simulación visual de ticket con código de barras, UUID, datos de la sede y código QR generado con `qrcode.react`, listo para imprimir mediante `window.print()`.

### 4. Módulo de Caja - Salida y Cobro (`/caja`)
- Búsqueda y escaneo por código de ticket o placa.
- Registro de salida y cálculo de tiempo (`PUT /api/backend/tickets/salida/{codigo}`).
- Cálculo visual del monto a pagar según las tarifas activas (`GET /api/backend/tarifas`).
- Procesamiento del pago (`POST /api/backend/pagos`):
  - Pago en efectivo.
  - Pago con tarjeta de crédito/débito con registro de número de autorización de POS.
  - Factura Electrónica (FEL SAT): Solicitud de NIT y nombre (o selección rápida de CF).
- **Comprobante Térmico / FEL**: Modal de factura con QR SAT listo para imprimir.

### 5. Módulo de Pensiones (`/pensiones`)
- Tabla estilizada de pensiones mensuales (`GET /api/backend/pensiones`) con estado visual de vigencia (Activa / Vencida).
- Modal para creación de pensiones (`POST /api/backend/pensiones`), vinculando cliente, vehículo y rango de fechas mensual.
- Creación rápida de nuevos clientes en el mismo flujo.
- **Edición completa de pensión:** Modal prellenado para actualizar cliente, vehículo, tarifa o rango de fechas (`PUT /api/backend/pensiones/:id`).
- **Eliminación y revocación:** Diálogo de confirmación con anulación de acceso (`DELETE /api/backend/pensiones/vehiculo/:vehiculoId`).

### 6. Catálogos y Configuración General (`/configuracion`)
Panel administrativo completo con soporte de visualización, creación, **Edición (PUT)** y **Eliminación (DELETE)** con modales dedicados y confirmaciones de seguridad:
- **Sucursales**: `PUT /api/backend/sucursales/:id` y `DELETE /api/backend/sucursales/:id`.
- **Niveles de Parqueo**: `PUT /api/backend/niveles-parqueo/:id` y `DELETE /api/backend/niveles-parqueo/:id`.
- **Espacios de Parqueo**: `PUT /api/backend/espacios/:id` y `DELETE /api/backend/espacios/:id`.
- **Tarifas por Vehículo**: `PUT /api/backend/tarifas/:id` y `DELETE /api/backend/tarifas/vehiculo/:tipoVehiculoId`.
- **Empleados de Garita/Caja**: `PUT /api/backend/empleados/:usuarioId` y `DELETE /api/backend/empleados/:usuarioId`.
- **Clientes**: `PUT /api/backend/clientes/:usuarioId` y `DELETE /api/backend/clientes/:usuarioId`.
- **Vehículos**: `PUT /api/backend/vehiculos/:placa` y `DELETE /api/backend/vehiculos/:placa`.
- **Usuarios del Sistema**: `PUT /api/backend/usuarios/:idOrEmail` y `DELETE /api/backend/usuarios/:email`.
- **Catálogos Auxiliares**:
  - Estados de Espacio (`PUT` y `DELETE` `/api/backend/estados-espacio/:id`).
  - Métodos de Pago (`PUT` y `DELETE` `/api/backend/metodos-pago/:id`).
  - Roles (`PUT` y `DELETE` `/api/backend/roles/:id`).
  - Tipos de Vehículo (`PUT` y `DELETE` `/api/backend/tipos-vehiculo/:id`).
- **Bitácora / Auditoría (Audit Logs)**: `PUT /api/backend/audit-logs/:id` y `DELETE /api/backend/audit-logs/usuario/:usuarioId`.
- **Tickets y Pagos (en Módulo Caja & Administración)**:
  - Tickets: `PUT /api/backend/tickets/:codigo` y `DELETE /api/backend/tickets/:codigo`.
  - Pagos: `PUT /api/backend/pagos/:id` y `DELETE /api/backend/pagos/ticket/:ticketId`.

---

## 💻 Instrucciones para Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

3. Compilar para producción:
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Credenciales y Conexión de Autenticación

El sistema está configurado y vinculado directamente con la API de autenticación oficial:
- **API Backend de Login:** `https://apilogin-qh0o.onrender.com` (`POST /api/login`)
- **Frontend Oficial de Login:** `https://frontend-login-parqueo.vercel.app/`
- **Usuario Administrador:** `admin@parqueo.com`
- **Contraseña:** `Admin123`
- **Rol:** Administrador (ID: 1)

> Al ingresar con estas credenciales en `/login` o presionar *"Entrar Directo como Admin"*, el sistema valida contra la API de login en Render y activa automáticamente el panel de control completo.

