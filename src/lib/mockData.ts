import { Sucursal, NivelParqueo, Espacio, Vehiculo, Cliente, Tarifa, Pension, Empleado, Ticket } from '@/types/api';

export const INITIAL_SUCURSALES: Sucursal[] = [
  {
    id: 1,
    nombre: 'Campus Central UMES - Zona 10',
    direccion: 'Avenida La Reforma 16-54, Zona 10, Ciudad de Guatemala',
    telefono_contacto: '2411-1800',
    capacidad_maxima: 120,
  },
  {
    id: 2,
    nombre: 'Sede Pradera Concepción',
    direccion: 'Km 15.5 Carretera a El Salvador, Santa Catarina Pinula',
    telefono_contacto: '2333-8899',
    capacidad_maxima: 80,
  },
  {
    id: 3,
    nombre: 'Edificio Las Américas',
    direccion: 'Avenida Las Américas 8-22, Zona 13',
    telefono_contacto: '2244-9000',
    capacidad_maxima: 60,
  },
];

export const INITIAL_NIVELES: NivelParqueo[] = [
  { id: 1, sucursal_id: 1, nombre_nivel: 'Sótano 1 (Nivel A)' },
  { id: 2, sucursal_id: 1, nombre_nivel: 'Sótano 2 (Nivel B)' },
  { id: 3, sucursal_id: 1, nombre_nivel: 'Planta Baja / Techado' },
  { id: 4, sucursal_id: 2, nombre_nivel: 'Nivel Único Principal' },
  { id: 5, sucursal_id: 3, nombre_nivel: 'Sótano Ejecutivo' },
];

export const INITIAL_TARIFAS: Tarifa[] = [
  {
    id: 1,
    tipo_vehiculo_id: 1, // Sedán / Automóvil
    monto_por_hora: 15.0,
    monto_fraccion: 5.0,
    estado_activo: true,
  },
  {
    id: 2,
    tipo_vehiculo_id: 2, // Motocicleta
    monto_por_hora: 8.0,
    monto_fraccion: 3.0,
    estado_activo: true,
  },
  {
    id: 3,
    tipo_vehiculo_id: 3, // Camioneta / SUV
    monto_por_hora: 20.0,
    monto_fraccion: 7.0,
    estado_activo: true,
  },
];

export const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 1,
    usuario_id: 3,
    nit_facturacion: '3489214-5',
    nombre_facturacion: 'Lic. Fernando Morales Cabrera',
    telefono: '5521-9988',
  },
  {
    id: 2,
    usuario_id: 4,
    nit_facturacion: '8872149-1',
    nombre_facturacion: 'Dra. Claudia María Estrada',
    telefono: '4100-3322',
  },
  {
    id: 3,
    usuario_id: 5,
    nit_facturacion: 'CF',
    nombre_facturacion: 'Consumidor Final',
    telefono: '5050-1122',
  },
];

export const INITIAL_VEHICULOS: Vehiculo[] = [
  { id: 1, placa: 'P123ABC', marca: 'Toyota', color: 'Gris Plata', cliente_id: 1 },
  { id: 2, placa: 'P890XYZ', marca: 'Honda Civic', color: 'Azul Marino', cliente_id: 2 },
  { id: 3, placa: 'M456QWE', marca: 'Yamaha FZ', color: 'Negro', cliente_id: 3 },
  { id: 4, placa: 'P741LKJ', marca: 'Mazda CX-5', color: 'Rojo Vino', cliente_id: 1 },
  { id: 5, placa: 'P902QWE', marca: 'Hyundai Tucson', color: 'Blanco', cliente_id: 2 },
];

export const INITIAL_PENSIONES: Pension[] = [
  {
    id: 1,
    cliente_id: 1,
    vehiculo_id: 1,
    tarifa_id: 1,
    fecha_inicio: '2026-11-01T00:00:00Z',
    fecha_fin: '2026-11-30T23:59:59Z',
    estado: 'ACTIVA',
  },
  {
    id: 2,
    cliente_id: 2,
    vehiculo_id: 2,
    tarifa_id: 1,
    fecha_inicio: '2026-11-01T00:00:00Z',
    fecha_fin: '2026-12-15T23:59:59Z',
    estado: 'ACTIVA',
  },
  {
    id: 3,
    cliente_id: 3,
    vehiculo_id: 3,
    tarifa_id: 2,
    fecha_inicio: '2026-10-01T00:00:00Z',
    fecha_fin: '2026-10-31T23:59:59Z',
    estado: 'VENCIDA',
  },
];

export const INITIAL_EMPLEADOS: Empleado[] = [
  {
    id: 1,
    usuario_id: 1,
    nombres: 'Roberto Carlos',
    apellidos: 'Gómez Méndez',
    dpi: '2541987450101',
    telefono: '4122-8877',
  },
  {
    id: 2,
    usuario_id: 2,
    nombres: 'Marta Elena',
    apellidos: 'Sánchez Morales',
    dpi: '1899554420101',
    telefono: '5566-3344',
  },
  {
    id: 3,
    usuario_id: 3,
    nombres: 'Esteban',
    apellidos: 'Villagrán López',
    dpi: '3001889950101',
    telefono: '5899-7711',
  },
];

export const INITIAL_ESPACIOS: Espacio[] = [
  // Sótano 1
  { id: 1, nivel_id: 1, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'A-01' },
  { id: 2, nivel_id: 1, estado_id: 2, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'A-02', placa_ocupante: 'P890XYZ', hora_ingreso: new Date(Date.now() - 7200000).toISOString(), es_pensionado: true },
  { id: 3, nivel_id: 1, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'A-03' },
  { id: 4, nivel_id: 1, estado_id: 2, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'A-04', placa_ocupante: 'P741LKJ', hora_ingreso: new Date(Date.now() - 3600000).toISOString() },
  { id: 5, nivel_id: 1, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'A-05' },
  { id: 6, nivel_id: 1, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'A-06' },
  { id: 7, nivel_id: 1, estado_id: 2, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'A-07', placa_ocupante: 'P123ABC', hora_ingreso: new Date(Date.now() - 14400000).toISOString(), es_pensionado: true },
  { id: 8, nivel_id: 1, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'A-08' },
  { id: 9, nivel_id: 1, estado_id: 1, tipo_vehiculo_id: 2, es_techado: true, numero_identificador: 'M-01' },
  { id: 10, nivel_id: 1, estado_id: 2, tipo_vehiculo_id: 2, es_techado: true, numero_identificador: 'M-02', placa_ocupante: 'M456QWE', hora_ingreso: new Date(Date.now() - 5400000).toISOString() },
  { id: 11, nivel_id: 1, estado_id: 1, tipo_vehiculo_id: 2, es_techado: true, numero_identificador: 'M-03' },
  { id: 12, nivel_id: 1, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'A-09' },

  // Sótano 2
  { id: 13, nivel_id: 2, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'B-01' },
  { id: 14, nivel_id: 2, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'B-02' },
  { id: 15, nivel_id: 2, estado_id: 2, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'B-03', placa_ocupante: 'P902QWE', hora_ingreso: new Date(Date.now() - 1800000).toISOString() },
  { id: 16, nivel_id: 2, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'B-04' },
  { id: 17, nivel_id: 2, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'B-05' },
  { id: 18, nivel_id: 2, estado_id: 1, tipo_vehiculo_id: 1, es_techado: true, numero_identificador: 'B-06' },

  // Planta Baja
  { id: 19, nivel_id: 3, estado_id: 1, tipo_vehiculo_id: 1, es_techado: false, numero_identificador: 'PB-01' },
  { id: 20, nivel_id: 3, estado_id: 2, tipo_vehiculo_id: 1, es_techado: false, numero_identificador: 'PB-02', placa_ocupante: 'P554MNO', hora_ingreso: new Date(Date.now() - 9000000).toISOString() },
  { id: 21, nivel_id: 3, estado_id: 1, tipo_vehiculo_id: 1, es_techado: false, numero_identificador: 'PB-03' },
  { id: 22, nivel_id: 3, estado_id: 1, tipo_vehiculo_id: 1, es_techado: false, numero_identificador: 'PB-04' },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 101,
    codigo: 'TCK-2026-8841',
    placa: 'P741LKJ',
    espacio_id: 4,
    hora_entrada: new Date(Date.now() - 3600000).toISOString(),
    pagado: false,
  },
  {
    id: 102,
    codigo: 'TCK-2026-9912',
    placa: 'M456QWE',
    espacio_id: 10,
    hora_entrada: new Date(Date.now() - 5400000).toISOString(),
    pagado: false,
  },
  {
    id: 103,
    codigo: 'TCK-2026-7734',
    placa: 'P902QWE',
    espacio_id: 15,
    hora_entrada: new Date(Date.now() - 1800000).toISOString(),
    pagado: false,
  },
  {
    id: 104,
    codigo: 'TCK-2026-6655',
    placa: 'P554MNO',
    espacio_id: 20,
    hora_entrada: new Date(Date.now() - 9000000).toISOString(),
    pagado: false,
  },
  {
    id: 105,
    codigo: 'TCK-2026-2101',
    placa: 'P890XYZ',
    espacio_id: 2,
    hora_entrada: new Date(Date.now() - 7200000).toISOString(),
    pagado: false,
  },
  {
    id: 106,
    codigo: 'TCK-2026-2102',
    placa: 'P123ABC',
    espacio_id: 7,
    hora_entrada: new Date(Date.now() - 14400000).toISOString(),
    pagado: false,
  },
];

