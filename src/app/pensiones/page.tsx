'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
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
  Pencil,
  Trash2,
} from 'lucide-react';
import { api, getCurrentUser } from '@/lib/api';
import { Pension, Cliente, Vehiculo, Tarifa, User as UserEntity } from '@/types/api';
import { toast } from 'sonner';

export default function PensionesPage() {
  const [pensiones, setPensiones] = useState<Pension[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [usuarios, setUsuarios] = useState<UserEntity[]>([]);
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

  // Estados para Edición (PUT)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPension, setEditingPension] = useState<Pension | null>(null);
  const [editClienteId, setEditClienteId] = useState<number | ''>('');
  const [editVehiculoId, setEditVehiculoId] = useState<number | ''>('');
  const [editTarifaId, setEditTarifaId] = useState<number | ''>('');
  const [editFechaInicio, setEditFechaInicio] = useState('');
  const [editFechaFin, setEditFechaFin] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Estados para Eliminación (DELETE)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPension, setDeletingPension] = useState<Pension | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pensRes, cliRes, vehRes, tarRes, userRes] = await Promise.allSettled([
        api.pensiones.getAll(),
        api.clientes.getAll(),
        api.vehiculos.getAll(),
        api.tarifas.getAll(),
        api.usuarios.getAll(),
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
      if (userRes.status === 'fulfilled' && Array.isArray(userRes.value)) {
        setUsuarios(userRes.value);
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
      const resolvedUserId =
        getCurrentUser()?.id ||
        (usuarios.length > 0 ? usuarios[0].id : (clientes[0]?.usuario_id || 1));

      const nuevo = await api.clientes.create({
        usuario_id: resolvedUserId,
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

  // Abrir Modal de Edición
  const handleOpenEdit = (p: Pension) => {
    setEditingPension(p);
    setEditClienteId(p.cliente_id);
    setEditVehiculoId(p.vehiculo_id);
    setEditTarifaId(p.tarifa_id);
    setEditFechaInicio(p.fecha_inicio ? p.fecha_inicio.split('T')[0] : '');
    setEditFechaFin(p.fecha_fin ? p.fecha_fin.split('T')[0] : '');
    setShowEditModal(true);
  };

  // Enviar Edición (PUT /api/pensiones/:id)
  const handleUpdatePension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPension) return;

    setSavingEdit(true);
    try {
      await api.pensiones.update(editingPension.id, {
        cliente_id: Number(editClienteId),
        vehiculo_id: Number(editVehiculoId),
        tarifa_id: Number(editTarifaId),
        fecha_inicio: `${editFechaInicio}T00:00:00Z`,
        fecha_fin: `${editFechaFin}T23:59:59Z`,
      });

      toast.success('Pensión actualizada exitosamente');
      setShowEditModal(false);
      setEditingPension(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar la pensión');
    } finally {
      setSavingEdit(false);
    }
  };

  // Abrir Modal de Eliminación
  const handleOpenDelete = (p: Pension) => {
    setDeletingPension(p);
    setShowDeleteModal(true);
  };

  // Confirmar Eliminación (DELETE /api/pensiones/vehiculo/:vehiculoId)
  const handleConfirmDelete = async () => {
    if (!deletingPension) return;

    setDeleting(true);
    try {
      await api.pensiones.delete(deletingPension.vehiculo_id);
      toast.success('Pensión eliminada exitosamente');
      setShowDeleteModal(false);
      setDeletingPension(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar la pensión');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout
      title="Módulo de Pensiones y Abonados"
      subtitle="Administración de mensualidades prepagadas, vigencias y accesos autorizados"
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
                  <th className="py-3.5 px-5 text-center">Acceso Garita</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPensiones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
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
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${!isExpired
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

                        <td className="py-4 px-5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold ${!isExpired ? 'text-blue-600' : 'text-slate-400'
                              }`}
                          >
                            <ShieldCheck className="h-4 w-4" />
                            <span>{!isExpired ? 'Acceso Libre' : 'Bloqueado'}</span>
                          </span>
                        </td>

                        {/* ACCIONES: EDITAR (PUT) Y ELIMINAR (DELETE) */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              title="Editar Pensión"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(p)}
                              title="Eliminar Pensión"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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

      {/* MODAL EDITAR PENSIÓN (PUT /api/pensiones/:id) */}
      {showEditModal && editingPension && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-600" />
                Editar Pensión Mensual #{editingPension.id}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePension} className="mt-4 space-y-4 text-xs">
              {/* Cliente */}
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Cliente Titular
                </label>
                <select
                  value={editClienteId}
                  onChange={(e) => setEditClienteId(Number(e.target.value))}
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
                  value={editVehiculoId}
                  onChange={(e) => setEditVehiculoId(Number(e.target.value))}
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
                  value={editTarifaId}
                  onChange={(e) => setEditTarifaId(Number(e.target.value))}
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
                    value={editFechaInicio}
                    onChange={(e) => setEditFechaInicio(e.target.value)}
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
                    value={editFechaFin}
                    onChange={(e) => setEditFechaFin(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-800 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={savingEdit}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Guardando Cambios...</span>
                    </>
                  ) : (
                    <span>Actualizar Pensión</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR NUEVA PENSIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Nuevo Cliente Rápido</h4>
              <button
                onClick={() => setShowModalCliente(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleGuardarCliente} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Nombre / Razón Social</label>
                <input
                  type="text"
                  required
                  value={nombreClienteInput}
                  onChange={(e) => setNombreClienteInput(e.target.value)}
                  placeholder="Ej: Ing. Marco Antonio Solís"
                  className="mt-1 w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600">NIT</label>
                  <input
                    type="text"
                    value={nitClienteInput}
                    onChange={(e) => setNitClienteInput(e.target.value.toUpperCase())}
                    placeholder="CF o NIT"
                    className="mt-1 w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600">Teléfono</label>
                  <input
                    type="text"
                    value={telefonoClienteInput}
                    onChange={(e) => setTelefonoClienteInput(e.target.value)}
                    placeholder="5522-1133"
                    className="mt-1 w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalCliente(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoCliente}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {guardandoCliente ? 'Guardando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN DE PENSIÓN */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title="¿Eliminar Pensión?"
        message="¿Estás seguro de que deseas revocar y eliminar esta pensión mensual? El vehículo perderá el acceso libre automático en garita."
        itemName={
          deletingPension
            ? `${deletingPension.cliente?.nombre_facturacion || 'Cliente'} - Placa: ${deletingPension.vehiculo?.placa || deletingPension.vehiculo_id}`
            : undefined
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingPension(null);
        }}
      />
    </AppLayout>
  );
}
