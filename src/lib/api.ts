// Cliente HTTP para Parqueos UMES con interceptor JWT y Proxy Interno (/api/backend/...)

import {
  AuthResponse,
  LoginDto,
  User,
  Rol,
  Sucursal,
  NivelParqueo,
  EstadoEspacio,
  TipoVehiculo,
  Espacio,
  Vehiculo,
  Cliente,
  Tarifa,
  Pension,
  PensionAccesoResponse,
  Ticket,
  MetodoPago,
  Pago,
  Empleado,
  AuditLog,
  UpdateClienteDto,
  UpdateUsuarioDto,
  UpdateEmpleadoDto,
  UpdateVehiculoDto,
  UpdateEspacioDto,
  UpdateEstadoEspacioDto,
  UpdateMetodoPagoDto,
  UpdateNivelParqueoDto,
  UpdateRolDto,
  UpdateSucursalDto,
  UpdateTipoVehiculoDto,
  UpdateTarifaDto,
  UpdatePensionDto,
  UpdateTicketDto,
  UpdatePagoDto,
  UpdateAuditLogDto,
} from '@/types/api';

const BASE_URL = '/api/backend';
export const AUTH_API_URL = 'https://apilogin-qh0o.onrender.com';
export const AUTH_API_KEY = 'LoginParqueo_2026_JVC_KEY';

// Helper de LocalStorage seguro en SSR
function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function getToken(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem('umes_token');
}

export function setToken(token: string): void {
  if (!isClient()) return;
  localStorage.setItem('umes_token', token);
}

export function removeToken(): void {
  if (!isClient()) return;
  localStorage.removeItem('umes_token');
  localStorage.removeItem('umes_user');
}

export function getCurrentUser(): User | null {
  if (!isClient()) return null;
  const userStr = localStorage.getItem('umes_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// ==========================================
// CLIENTE HTTP CON INTERCEPTOR JWT
// Todas las llamadas van directo a la API sin datos quemados
// ==========================================
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    let msg = errorData?.message || errorData?.error || `Error del servidor: HTTP ${response.status}`;
    if (Array.isArray(msg)) msg = msg.join(', ');
    throw new Error(msg);
  }

  if (response.status === 204) {
    return { ok: true, message: 'Operación realizada exitosamente' } as unknown as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return { ok: true } as unknown as T;
  }

  return await response.json();
}

// ==========================================
// SERVICIOS ESPECÍFICOS DEL SISTEMA DE PARQUEOS
// ==========================================
export const api = {
  // Autenticación Real con API
  auth: {
    login: async (credentials: LoginDto): Promise<AuthResponse> => {
      const authRes = await fetch(`${AUTH_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AUTH_API_KEY,
        },
        body: JSON.stringify({
          correo: credentials.email,
          password: credentials.password,
        }),
      });

      const authData = await authRes.json().catch(() => null);

      if (!authRes.ok || !authData?.ok) {
        const msg = authData?.detalle
          ? `${authData.mensaje}: ${authData.detalle}`
          : authData?.mensaje || 'Error al iniciar sesión';
        throw new Error(msg);
      }

      const u = authData.usuario;
      const usuario: User = {
        id: u.id,
        email: u.correo,
        rol_id: u.rol,
        nombre: `${u.nombre} ${u.apellido || ''}`.trim(),
      };
      const token =
        authData.token ||
        authData.access_token ||
        authData.jwt ||
        'auth_token_' + u.id + '_' + Date.now();
      setToken(token);
      if (isClient()) {
        localStorage.setItem('umes_user', JSON.stringify(usuario));
      }
      return {
        access_token: token,
        usuario,
      };
    },

    registro: async (data: {
      nombre: string;
      apellido: string;
      usuario: string;
      correo: string;
      password: string;
    }): Promise<{ ok: boolean; mensaje: string }> => {
      const res = await fetch(`${AUTH_API_URL}/api/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AUTH_API_KEY,
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok || !resData?.ok) {
        const msg = resData?.detalle
          ? `${resData.mensaje}: ${resData.detalle}`
          : resData?.mensaje || 'Error al registrar usuario';
        throw new Error(msg);
      }

      return resData;
    },

    logout: () => {
      removeToken();
      if (isClient()) {
        window.location.href = '/login';
      }
    },
  },

  // 1. Clientes
  clientes: {
    getAll: async (): Promise<Cliente[]> => request<Cliente[]>('/clientes'),
    create: async (data: Partial<Cliente>): Promise<Cliente> =>
      request<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      usuarioId: number | string,
      data: UpdateClienteDto
    ): Promise<Cliente> =>
      request<Cliente>(`/clientes/${usuarioId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (usuarioId: number | string): Promise<any> =>
      request<any>(`/clientes/${usuarioId}`, { method: 'DELETE' }),
  },

  // 2. Usuarios
  usuarios: {
    getAll: async (): Promise<User[]> => request<User[]>('/usuarios'),
    create: async (data: Partial<User & { password?: string; password_hash?: string }>): Promise<User> =>
      request<User>('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      idOrEmail: number | string,
      data: UpdateUsuarioDto
    ): Promise<User> =>
      request<User>(`/usuarios/${encodeURIComponent(idOrEmail)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (email: string): Promise<any> =>
      request<any>(`/usuarios/${encodeURIComponent(email)}`, { method: 'DELETE' }),
  },

  // 3. Empleados
  empleados: {
    getAll: async (): Promise<Empleado[]> => request<Empleado[]>('/empleados'),
    create: async (data: Partial<Empleado>): Promise<Empleado> =>
      request<Empleado>('/empleados', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      usuarioId: number | string,
      data: UpdateEmpleadoDto
    ): Promise<Empleado> =>
      request<Empleado>(`/empleados/${usuarioId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (usuarioId: number | string): Promise<any> =>
      request<any>(`/empleados/${usuarioId}`, { method: 'DELETE' }),
  },

  // 4. Vehículos
  vehiculos: {
    getAll: async (): Promise<Vehiculo[]> => request<Vehiculo[]>('/vehiculos'),
    getByPlaca: async (placa: string): Promise<Vehiculo | null> =>
      request<Vehiculo>(`/vehiculos/${encodeURIComponent(placa)}`),
    create: async (data: Partial<Vehiculo>): Promise<Vehiculo> =>
      request<Vehiculo>('/vehiculos', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      placa: string,
      data: UpdateVehiculoDto
    ): Promise<Vehiculo> =>
      request<Vehiculo>(`/vehiculos/${encodeURIComponent(placa)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (placa: string): Promise<any> =>
      request<any>(`/vehiculos/${encodeURIComponent(placa)}`, { method: 'DELETE' }),
  },

  // 5. Espacios de Parqueo
  espacios: {
    getAll: async (): Promise<Espacio[]> => {
      try {
        const res = await request<Espacio[]>('/espacios');
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {
        // En caso de fallo directo, recurrir a los disponibles del backend
      }
      return request<Espacio[]>('/espacios/disponibles').catch(() => []);
    },
    getDisponibles: async (): Promise<Espacio[]> =>
      request<Espacio[]>('/espacios/disponibles'),
    create: async (data: Partial<Espacio>): Promise<Espacio> =>
      request<Espacio>('/espacios', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      id: number | string,
      data: UpdateEspacioDto
    ): Promise<Espacio> =>
      request<Espacio>(`/espacios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (id: number | string): Promise<any> =>
      request<any>(`/espacios/${id}`, { method: 'DELETE' }),
  },

  // 6. Estados de Espacio
  estadosEspacio: {
    getAll: async (): Promise<EstadoEspacio[]> =>
      request<EstadoEspacio[]>('/estados-espacio'),
    create: async (data: Partial<EstadoEspacio>): Promise<EstadoEspacio> =>
      request<EstadoEspacio>('/estados-espacio', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: async (
      id: number | string,
      data: UpdateEstadoEspacioDto
    ): Promise<EstadoEspacio> =>
      request<EstadoEspacio>(`/estados-espacio/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (id: number | string): Promise<any> =>
      request<any>(`/estados-espacio/${id}`, { method: 'DELETE' }),
  },

  // 7. Métodos de Pago
  metodosPago: {
    getAll: async (): Promise<MetodoPago[]> =>
      request<MetodoPago[]>('/metodos-pago'),
    create: async (data: Partial<MetodoPago>): Promise<MetodoPago> =>
      request<MetodoPago>('/metodos-pago', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: async (
      id: number | string,
      data: UpdateMetodoPagoDto
    ): Promise<MetodoPago> =>
      request<MetodoPago>(`/metodos-pago/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (id: number | string): Promise<any> =>
      request<any>(`/metodos-pago/${id}`, { method: 'DELETE' }),
  },

  // 8. Niveles de Parqueo
  niveles: {
    getAll: async (): Promise<NivelParqueo[]> => {
      try {
        const res = await request<NivelParqueo[]>('/niveles-parqueo');
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {
        // En caso de fallo directo, extraer de las sucursales
      }
      try {
        const sucursales = await request<any[]>('/sucursales');
        const lista: NivelParqueo[] = [];
        if (Array.isArray(sucursales)) {
          sucursales.forEach((s) => {
            if (Array.isArray(s.niveles_parqueo)) {
              lista.push(...s.niveles_parqueo);
            }
          });
        }
        return lista;
      } catch {
        return [];
      }
    },
    getBySucursal: async (sucursalId: number): Promise<NivelParqueo[]> =>
      request<NivelParqueo[]>(`/niveles-parqueo/sucursal/${sucursalId}`),
    create: async (data: Partial<NivelParqueo>): Promise<NivelParqueo> =>
      request<NivelParqueo>('/niveles-parqueo', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: async (
      id: number | string,
      data: UpdateNivelParqueoDto
    ): Promise<NivelParqueo> =>
      request<NivelParqueo>(`/niveles-parqueo/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (id: number | string): Promise<any> =>
      request<any>(`/niveles-parqueo/${id}`, { method: 'DELETE' }),
  },

  // 9. Roles
  roles: {
    getAll: async (): Promise<Rol[]> => request<Rol[]>('/roles'),
    create: async (data: Partial<Rol>): Promise<Rol> =>
      request<Rol>('/roles', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      id: number | string,
      data: UpdateRolDto
    ): Promise<Rol> =>
      request<Rol>(`/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (id: number | string): Promise<any> =>
      request<any>(`/roles/${id}`, { method: 'DELETE' }),
  },

  // 10. Sucursales
  sucursales: {
    getAll: async (): Promise<Sucursal[]> => request<Sucursal[]>('/sucursales'),
    create: async (data: Partial<Sucursal>): Promise<Sucursal> =>
      request<Sucursal>('/sucursales', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      id: number | string,
      data: UpdateSucursalDto
    ): Promise<Sucursal> =>
      request<Sucursal>(`/sucursales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (id: number | string): Promise<any> =>
      request<any>(`/sucursales/${id}`, { method: 'DELETE' }),
  },

  // 11. Tipos de Vehículo
  tiposVehiculo: {
    getAll: async (): Promise<TipoVehiculo[]> =>
      request<TipoVehiculo[]>('/tipos-vehiculo'),
    create: async (data: Partial<TipoVehiculo>): Promise<TipoVehiculo> =>
      request<TipoVehiculo>('/tipos-vehiculo', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: async (
      id: number | string,
      data: UpdateTipoVehiculoDto
    ): Promise<TipoVehiculo> =>
      request<TipoVehiculo>(`/tipos-vehiculo/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (id: number | string): Promise<any> =>
      request<any>(`/tipos-vehiculo/${id}`, { method: 'DELETE' }),
  },

  // 12. Tarifas
  tarifas: {
    getAll: async (): Promise<Tarifa[]> => request<Tarifa[]>('/tarifas'),
    create: async (data: Partial<Tarifa>): Promise<Tarifa> =>
      request<Tarifa>('/tarifas', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      id: number | string,
      data: UpdateTarifaDto
    ): Promise<Tarifa> =>
      request<Tarifa>(`/tarifas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (tipoVehiculoId: number | string): Promise<any> =>
      request<any>(`/tarifas/vehiculo/${tipoVehiculoId}`, { method: 'DELETE' }),
  },

  // 13. Pensiones
  pensiones: {
    getAll: async (): Promise<Pension[]> => request<Pension[]>('/pensiones'),
    verificarAcceso: async (vehiculoId: number): Promise<PensionAccesoResponse> =>
      request<PensionAccesoResponse>(`/pensiones/vehiculo/${vehiculoId}/acceso`),
    create: async (data: Partial<Pension>): Promise<Pension> =>
      request<Pension>('/pensiones', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      id: number | string,
      data: UpdatePensionDto
    ): Promise<Pension> =>
      request<Pension>(`/pensiones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (vehiculoId: number | string): Promise<any> =>
      request<any>(`/pensiones/vehiculo/${vehiculoId}`, { method: 'DELETE' }),
  },

  // 14. Tickets
  tickets: {
    getAll: async (): Promise<Ticket[]> => request<Ticket[]>('/tickets'),
    registrarEntrada: async (data: { placa: string; espacio_id: number }): Promise<Ticket> =>
      request<Ticket>('/tickets/entrada', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    registrarSalida: async (codigo: string): Promise<any> =>
      request<any>(`/tickets/salida/${encodeURIComponent(codigo)}`, {
        method: 'PUT',
      }),
    update: async (
      codigo: string,
      data: UpdateTicketDto
    ): Promise<Ticket> =>
      request<Ticket>(`/tickets/${encodeURIComponent(codigo)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (codigo: string): Promise<any> =>
      request<any>(`/tickets/${encodeURIComponent(codigo)}`, { method: 'DELETE' }),
  },

  // 15. Pagos
  pagos: {
    getAll: async (): Promise<Pago[]> => request<Pago[]>('/pagos'),
    procesar: async (data: Partial<Pago>): Promise<Pago> =>
      request<Pago>('/pagos', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      id: number | string,
      data: UpdatePagoDto
    ): Promise<Pago> =>
      request<Pago>(`/pagos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (ticketId: number | string): Promise<any> =>
      request<any>(`/pagos/ticket/${ticketId}`, { method: 'DELETE' }),
  },

  // 16. Bitácora / Auditoría (Audit Logs)
  auditLogs: {
    getAll: async (): Promise<AuditLog[]> => request<AuditLog[]>('/audit-logs'),
    create: async (data: Partial<AuditLog>): Promise<AuditLog> =>
      request<AuditLog>('/audit-logs', { method: 'POST', body: JSON.stringify(data) }),
    update: async (
      id: number | string,
      data: UpdateAuditLogDto
    ): Promise<AuditLog> =>
      request<AuditLog>(`/audit-logs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: async (usuarioId: number | string): Promise<any> =>
      request<any>(`/audit-logs/usuario/${usuarioId}`, { method: 'DELETE' }),
  },
};
