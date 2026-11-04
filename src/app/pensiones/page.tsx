'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  CalendarDays,
  Plus,
  Search,
  UserCheck,
  Car,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  Calendar,
  Building,
  User,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Pension, Cliente, Vehiculo, Tarifa } from '@/types/api';
import { toast } from 'sonner';

export default function PensionesPage() {
  const [pensiones, setPensiones] = useState<Pension[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal registrar pensión
  const [showModal, setShowModal] = useState(false);
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [vehiculoId, setVehiculoId] = useState<number | ''>('');
  const [tarifaId, setTarifaId] = useState<number | ''>('');
  const [fechaInicio, setFechaInicio] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [fechaFin, setFechaFin] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [guardando, setGuardando] = useState(false);

  // Modal registrar nuevo cliente rápido
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [nombreClienteInput, setNombreClienteInput] = useState('');
  const [nitClienteInput, setNitClienteInput] = useState('CF');
  const [telefonoClienteInput, setTelefonoClienteInput] = useState('');
  const [guardandoCliente, setGuardandoCliente] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pensRes, cliRes, vehRes, tarRes] = await Promise.allSettled([
        api.pensiones.getAll(),
        api.clientes.getAll(),
        api.vehiculos.getAll(),
        api.tarifas.getAll(),
      ]);

      if (pensRes.status === 'fulfilled' && Array.isArray(pensRes.value)) {
        setPensiones(pensRes.value);
      }
      if (cliRes.status === 'fulfilled' && Array.isArray(cliRes.value)) {
        setClientes(cliRes.value);
        if (cliRes.value.length > 0 && !clienteId) setClienteId(cliRes.value[0].id);
      }
      if (vehRes.status === 'fulfilled' && Array.isArray(vehRes.value)) {
        setVehiculos(vehRes.value);
        if (vehRes.value.length > 0 && !vehiculoId) setVehiculoId(vehRes.value[0].id);
      }
      if (tarRes.status === 'fulfilled' && Array.isArray(tarRes.value)) {
        setTarifas(tarRes.value);
        if (tarRes.value.length > 0 && !tarifaId) setTarifaId(tarRes.value[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al sincronizar pensiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado de pensiones
  const filteredPensiones = pensiones.filter((p) => {
    const term = searchTerm.toLowerCase();
    const placa = p.vehiculo?.placa?.toLowerCase() || '';
    const cliente = p.cliente?.nombre_facturacion?.toLowerCase() || '';
    return placa.includes(term) || cliente.includes(term);
  });

  // Guardar nueva pensión
  const handleGuardarPension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !vehiculoId || !tarifaId) {
      toast.warning('Por favor completa todos los campos');
      return;
    }

    setGuardando(true);
    try {
      await api.pensiones.create({
        cliente_id: Number(clienteId),
        vehiculo_id: Number(vehiculoId),
        tarifa_id: Number(tarifaId),
        fecha_inicio: `${fechaInicio}T00:00:00Z`,
        fecha_fin: `${fechaFin}T23:59:59Z`,
      });

      toast.success('Pensión mensual activada exitosamente');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar la pensión');
    } finally {
      setGuardando(false);
    }
  };

  // Guardar nuevo cliente rápido
  const handleGuardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreClienteInput) return;

    setGuardandoCliente(true);
    try {
      const nuevo = await api.clientes.create({
        usuario_id: 1,
        nombre_facturacion: nombreClienteInput.trim(),
        nit_facturacion: nitClienteInput.trim() || 'CF',
        telefono: telefonoClienteInput.trim(),
      });

      setClientes((prev) => [...prev, nuevo]);
      setClienteId(nuevo.id);
      setShowModalCliente(false);
      setNombreClienteInput('');
      toast.success('Cliente registrado correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar cliente');
    } finally {
      setGuardandoCliente(false);
    }
  };

  return (
    <AppLayout
      title="Módulo de Pensiones y Abonados"
      subtitle="Administración de mensualidades prepagadas y accesos autorizados"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Pensión</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* BARRA DE BÚSQUEDA Y STATS */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por placa vehicular o nombre del cliente..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span>Total Activas: {pensiones.length}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Verificación Automática en Garita</span>
            </div>
          </div>
        </div>

        {/* TABLA DE PENSIONES */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Titular / Cliente</th>
                  <th className="py-3.5 px-5">Vehículo Asignado</th>
                  <th className="py-3.5 px-5">Plan Mensual</th>
                  <th className="py-3.5 px-5">Vigencia (Inicio - Fin)</th>
                  <th className="py-3.5 px-5 text-center">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acceso Garita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPensiones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 font-medium">No se encontraron pensiones registradas.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPensiones.map((p) => {
                    const isExpired = new Date(p.fecha_fin) < new Date();
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {p.cliente?.nombre_facturacion || `Cliente ID #${p.cliente_id}`}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                NIT: {p.cliente?.nit_facturacion || 'CF'} &bull; Tel:{' '}
                                {p.cliente?.telefono || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black bg-slate-900 text-amber-300 px-2 py-0.5 rounded border border-slate-800">
                              {p.vehiculo?.placa || `ID #${p.vehiculo_id}`}
                            </span>
                            <span className="text-slate-600 font-medium">
                              {p.vehiculo?.marca || ''} {p.vehiculo?.color || ''}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="font-semibold text-slate-800">
                            Pensión Mes Completo
                          </span>
                          <p className="text-[11px] text-slate-400">Plan Sedán / Ordinario</p>
                        </td>

                        <td className="py-4 px-5 text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {new Date(p.fecha_inicio).toLocaleDateString('es-GT')} &rarr;{' '}
                              {new Date(p.fecha_fin).toLocaleDateString('es-GT')}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              !isExpired
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {!isExpired ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                <span>Activa</span>
                              </>
                            ) : (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                                <span>Vencida</span>
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                              !isExpired ? 'text-blue-600' : 'text-slate-400'
                            }`}
                          >
                            <ShieldCheck className="h-4 w-4" />
                            <span>{!isExpired ? 'Acceso Libre' : 'Bloqueado'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRAR NUEVA PENSIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Nueva Pensión Mensual
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarPension} className="mt-4 space-y-4 text-xs">
              {/* Cliente */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold uppercase text-slate-600">
                    Cliente Titular
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowModalCliente(true)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    + Crear Cliente
                  </button>
                </div>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre_facturacion || `Cliente ${c.id}`} (NIT: {c.nit_facturacion || 'CF'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehículo */}
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Vehículo Autorizado
                </label>
                <select
                  value={vehiculoId}
                  onChange={(e) => setVehiculoId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.marca || 'Vehículo'} ({v.color || 'Color'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tarifa / Plan */}
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Tarifa / Plan Mensual
                </label>
                <select
                  value={tarifaId}
                  onChange={(e) => setTarifaId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  {tarifas.map((t) => (
                    <option key={t.id} value={t.id}>
                      Plan {t.tipo_vehiculo_id === 2 ? 'Motocicleta' : 'Automóvil'} - Q
                      {t.monto_por_hora * 25} / mes
                    </option>
                  ))}
                </select>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-600 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-800 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-600 mb-1">
                    Fecha de Fin (Vencimiento)
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-800 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {guardando ? 'Guardando...' : 'Activar Pensión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RÁPIDO REGISTRAR CLIENTE */}
      {showModalCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Nuevo Cliente Titular</h4>
            <form onSubmit={handleGuardarCliente} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={nombreClienteInput}
                  onChange={(e) => setNombreClienteInput(e.target.value)}
                  placeholder="Ej: Lic. Juan Méndez"
                  className="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600">NIT</label>
                <input
                  type="text"
                  value={nitClienteInput}
                  onChange={(e) => setNitClienteInput(e.target.value)}
                  placeholder="CF o número"
                  className="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600">Teléfono</label>
                <input
                  type="text"
                  value={telefonoClienteInput}
                  onChange={(e) => setTelefonoClienteInput(e.target.value)}
                  placeholder="5555-1234"
                  className="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalCliente(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoCliente}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 font-bold text-white hover:bg-blue-700"
                >
                  {guardandoCliente ? 'Guardando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

