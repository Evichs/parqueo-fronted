// Tipos e interfaces de la API de Parqueos UMES

export interface User {
  id: number;
  email: string;
  rol_id: number;
  rol?: Rol;
  nombre?: string;
  password_hash?: string;
}

export interface Rol {
  id: number;
  nombre: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  usuario?: User;
  user?: User;
  token?: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono_contacto: string;
  capacidad_maxima: number;
  created_at?: string;
}

export interface NivelParqueo {
  id: number;
  sucursal_id: number;
  nombre_nivel: string;
  sucursal?: Sucursal;
  created_at?: string;
}

export interface EstadoEspacio {
  id: number;
  nombre: string; // 'Disponible' | 'Ocupado' | 'Reservado' | 'Mantenimiento'
}

export interface TipoVehiculo {
  id: number;
  nombre: string; // 'Sedán' | 'SUV' | 'Moto' | 'Camión'
}

export interface Espacio {
  id: number;
  nivel_id: number;
  estado_id: number;
  tipo_vehiculo_id: number;
  es_techado: boolean;
  numero_identificador?: string;
  estado?: EstadoEspacio;
  nivel?: NivelParqueo;
  tipo_vehiculo?: TipoVehiculo;
  // Campos enriquecidos para vista interactiva:
  placa_ocupante?: string;
  hora_ingreso?: string;
  es_pensionado?: boolean;
}

export interface Vehiculo {
  id: number;
  placa: string;
  color?: string;
  marca?: string;
  cliente_id?: number;
  cliente?: Cliente;
  created_at?: string;
}

export interface Cliente {
  id: number;
  usuario_id: number;
  nit_facturacion?: string;
  nombre_facturacion?: string;
  telefono?: string;
  usuario?: User;
}

export interface Tarifa {
  id: number;
  tipo_vehiculo_id: number;
  monto_por_hora: number;
  monto_fraccion: number;
  estado_activo: boolean;
  tipo_vehiculo?: TipoVehiculo;
}

export interface Pension {
  id: number;
  cliente_id: number;
  vehiculo_id: number;
  tarifa_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado?: string;
  cliente?: Cliente;
  vehiculo?: Vehiculo;
  tarifa?: Tarifa;
}

export interface PensionAccesoResponse {
  tiene_acceso: boolean;
  acceso_valido?: boolean;
  mensaje?: string;
  pension?: Pension;
}

export interface Ticket {
  id: number;
  codigo: string;
  placa: string;
  espacio_id: number;
  hora_entrada: string;
  hora_salida?: string | null;
  total_calculado?: number;
  pagado?: boolean;
  empleado_id?: number;
  vehiculo_id?: number;
  vehiculo?: Vehiculo;
  espacio?: Espacio;
}

export interface MetodoPago {
  id: number;
  nombre: string;
}

export interface Pago {
  id: number;
  ticket_id: number;
  total_pagado: number;
  metodo_pago_id: number;
  numero_autorizacion?: string;
  requiere_fel: boolean;
  nit_fel?: string;
  nombre_fel?: string;
  fecha_pago?: string;
  ticket?: Ticket;
  metodo_pago?: MetodoPago;
}

export interface Empleado {
  id: number;
  usuario_id: number;
  nombres: string;
  apellidos: string;
  dpi: string;
  telefono: string;
  usuario?: User;
}

export interface AuditLog {
  id: number;
  usuario_id: number;
  accion: string;
  detalles: string;
  created_at: string;
  usuario?: User;
}

// ==========================================
// DTOs PARA EDICIÓN (PUT) Y CREACIÓN (POST)
// ==========================================

export interface UpdateClienteDto {
  nit_facturacion?: string;
  nombre_facturacion?: string;
  telefono?: string;
}

export interface UpdateUsuarioDto {
  email?: string;
  password_hash?: string;
  rol_id?: number;
}

export interface UpdateEmpleadoDto {
  nombres?: string;
  apellidos?: string;
  dpi?: string;
  telefono?: string;
}

export interface UpdateVehiculoDto {
  color?: string;
  marca?: string;
  cliente_id?: number;
}

export interface UpdateEspacioDto {
  nivel_id?: number;
  estado_id?: number;
  tipo_vehiculo_id?: number;
  es_techado?: boolean;
}

export interface UpdateEstadoEspacioDto {
  nombre?: string;
}

export interface UpdateMetodoPagoDto {
  nombre?: string;
}

export interface UpdateNivelParqueoDto {
  sucursal_id?: number;
  nombre_nivel?: string;
}

export interface UpdateRolDto {
  nombre?: string;
}

export interface UpdateSucursalDto {
  nombre?: string;
  direccion?: string;
  telefono_contacto?: string;
  capacidad_maxima?: number;
}

export interface UpdateTipoVehiculoDto {
  nombre?: string;
}

export interface UpdateTarifaDto {
  tipo_vehiculo_id?: number;
  monto_por_hora?: number;
  monto_fraccion?: number;
  estado_activo?: boolean;
}

export interface UpdatePensionDto {
  cliente_id?: number;
  vehiculo_id?: number;
  tarifa_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface UpdateTicketDto {
  vehiculoId?: number;
  espacioId?: number;
  empleadoId?: number;
}

export interface UpdatePagoDto {
  total_pagado?: number;
  metodo_pago_id?: number;
  numero_autorizacion?: string;
  requiere_fel?: boolean;
}

export interface UpdateAuditLogDto {
  accion?: string;
  detalles?: string;
}

