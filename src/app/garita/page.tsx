'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Car,
  Search,
  Plus,
  ShieldCheck,
  Printer,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  RefreshCw,
  Sparkles,
  X,
  FileText,
  Pencil,
  Trash2,
  Building2,
} from 'lucide-react';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { QRCodeSVG } from 'qrcode.react';
import { api, getCurrentUser } from '@/lib/api';
import {
  Espacio,
  Vehiculo,
  PensionAccesoResponse,
  Ticket,
  Sucursal,
  NivelParqueo,
  User,
} from '@/types/api';
import { toast } from 'sonner';

function GaritaContent() {
  const searchParams = useSearchParams();
  const preselectedEspacioId = searchParams.get('espacio');

  // Usuario operador actual
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados de Sede / Sucursal y Nivel
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState<number | 'all'>('all');
  const [niveles, setNiveles] = useState<NivelParqueo[]>([]);
  const [selectedNivelId, setSelectedNivelId] = useState<number | 'all'>('all');

  // Estados de búsqueda
  const [placaInput, setPlacaInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [vehiculoEncontrado, setVehiculoEncontrado] = useState<Vehiculo | null>(null);
  const [vehiculoNoExiste, setVehiculoNoExiste] = useState(false);

  // Modal registrar vehículo nuevo
  const [showModalNuevoVehiculo, setShowModalNuevoVehiculo] = useState(false);
  const [marcaInput, setMarcaInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [creandoVehiculo, setCreandoVehiculo] = useState(false);

  // Estados Edición Vehículo (PUT /api/vehiculos/:placa)
  const [showModalEditarVehiculo, setShowModalEditarVehiculo] = useState(false);
  const [editMarcaInput, setEditMarcaInput] = useState('');
  const [editColorInput, setEditColorInput] = useState('');
  const [editClienteIdInput, setEditClienteIdInput] = useState<number | undefined>(undefined);
  const [editandoVehiculo, setEditandoVehiculo] = useState(false);

  // Estados Eliminación Vehículo (DELETE /api/vehiculos/:placa)
  const [showModalEliminarVehiculo, setShowModalEliminarVehiculo] = useState(false);
  const [eliminandoVehiculo, setEliminandoVehiculo] = useState(false);

  // Verificación de pensión
  const [verificandoPension, setVerificandoPension] = useState(false);
  const [pensionInfo, setPensionInfo] = useState<PensionAccesoResponse | null>(null);

  // Espacios disponibles
  const [espaciosDisponibles, setEspaciosDisponibles] = useState<Espacio[]>([]);
  const [selectedEspacioId, setSelectedEspacioId] = useState<number | ''>('');
  const [loadingEspacios, setLoadingEspacios] = useState(false);

  // Ticket emitido
  const [emitiendoTicket, setEmitiendoTicket] = useState(false);
  const [ticketEmitido, setTicketEmitido] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Cargar datos de sucursales, niveles y espacios disponibles
  const loadData = async () => {
    setLoadingEspacios(true);
    try {
      setCurrentUser(getCurrentUser());
      const [sucRes, nivRes, espRes] = await Promise.allSettled([
        api.sucursales.getAll(),
        api.niveles.getAll(),
        api.espacios.getDisponibles(),
      ]);

      if (sucRes.status === 'fulfilled' && Array.isArray(sucRes.value)) {
        setSucursales(sucRes.value);
      }
      if (nivRes.status === 'fulfilled' && Array.isArray(nivRes.value)) {
        setNiveles(nivRes.value);
      }
      if (espRes.status === 'fulfilled' && Array.isArray(espRes.value)) {
        setEspaciosDisponibles(espRes.value);
        if (preselectedEspacioId) {
          setSelectedEspacioId(Number(preselectedEspacioId));
        } else if (espRes.value.length > 0 && selectedEspacioId === '') {
          setSelectedEspacioId(espRes.value[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al sincronizar garita');
    } finally {
      setLoadingEspacios(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Niveles filtrados por la sucursal activa
  const nivelesFiltrados =
    selectedSucursalId === 'all'
      ? niveles
      : niveles.filter((n) => n.sucursal_id === Number(selectedSucursalId));

  // Espacios disponibles filtrados por sede y nivel
  const espaciosFiltrados = espaciosDisponibles.filter((esp) => {
    if (selectedSucursalId !== 'all') {
      const sucursalIdEspacio =
        esp.nivel?.sucursal_id ||
        niveles.find((n) => n.id === esp.nivel_id)?.sucursal_id;
      if (sucursalIdEspacio && sucursalIdEspacio !== Number(selectedSucursalId)) {
        return false;
      }
    }
    if (selectedNivelId !== 'all') {
      if (esp.nivel_id !== Number(selectedNivelId)) {
        return false;
      }
    }
    return true;
  });

  const selectedSucursal =
    selectedSucursalId !== 'all'
      ? sucursales.find((s) => s.id === Number(selectedSucursalId))
      : null;

  const selectedEspacioObj = espaciosDisponibles.find(
    (e) => e.id === Number(selectedEspacioId)
  );

  // Buscar placa
  const handleBuscarPlaca = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = placaInput.trim().toUpperCase();
    if (!clean) {
      toast.warning('Ingresa una placa vehicular');
      return;
    }

    setSearching(true);
    setVehiculoNoExiste(false);
    setVehiculoEncontrado(null);
    setPensionInfo(null);

    try {
      const veh = await api.vehiculos.getByPlaca(clean);
      if (veh) {
        setVehiculoEncontrado(veh);
        toast.success(`Vehículo encontrado: ${veh.marca || 'Registrado'} (${veh.color || 'N/A'})`);
        // Verificar pensión si tiene id
        if (veh.id) {
          verificarPension(veh.id);
        }
      } else {
        setVehiculoNoExiste(true);
        toast.info('La placa no está registrada en el sistema. Puedes agregarla ahora.');
      }
    } catch (err) {
      setVehiculoNoExiste(true);
      toast.info('Placa no registrada. Puedes registrar el vehículo o continuar con ticket regular.');
    } finally {
      setSearching(false);
    }
  };

  // Verificar pensión activa
  const verificarPension = async (vehiculoId: number) => {
    setVerificandoPension(true);
    try {
      const resp = await api.pensiones.verificarAcceso(vehiculoId);
      setPensionInfo(resp);
      if (resp.tiene_acceso || resp.acceso_valido) {
        toast.success('¡Vehículo con Pensión Activa Autorizada!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerificandoPension(false);
    }
  };

  // Registrar vehículo nuevo
  const handleCrearVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placaInput) return;
    setCreandoVehiculo(true);

    try {
      const nuevo = await api.vehiculos.create({
        placa: placaInput.trim().toUpperCase(),
        marca: marcaInput.trim() || 'No especificada',
        color: colorInput.trim() || 'No especificado',
      });
      setVehiculoEncontrado(nuevo);
      setVehiculoNoExiste(false);
      setShowModalNuevoVehiculo(false);
      toast.success('Vehículo registrado con éxito');
      if (nuevo.id) {
        verificarPension(nuevo.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar vehículo');
    } finally {
      setCreandoVehiculo(false);
    }
  };

  const handleOpenEditarVehiculo = () => {
    if (!vehiculoEncontrado) return;
    setEditMarcaInput(vehiculoEncontrado.marca || '');
    setEditColorInput(vehiculoEncontrado.color || '');
    setEditClienteIdInput(vehiculoEncontrado.cliente_id);
    setShowModalEditarVehiculo(true);
  };

  const handleSaveEditarVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculoEncontrado) return;
    setEditandoVehiculo(true);
    try {
      const updated = await api.vehiculos.update(vehiculoEncontrado.placa, {
        marca: editMarcaInput.trim(),
        color: editColorInput.trim(),
        cliente_id: editClienteIdInput ? Number(editClienteIdInput) : undefined,
      });
      setVehiculoEncontrado(updated);
      toast.success(`Vehículo ${updated.placa} actualizado exitosamente`);
      setShowModalEditarVehiculo(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar vehículo');
    } finally {
      setEditandoVehiculo(false);
    }
  };

  const handleOpenEliminarVehiculo = () => {
    if (!vehiculoEncontrado) return;
    setShowModalEliminarVehiculo(true);
  };

  const handleConfirmEliminarVehiculo = async () => {
    if (!vehiculoEncontrado) return;
    setEliminandoVehiculo(true);
    try {
      await api.vehiculos.delete(vehiculoEncontrado.placa);
      toast.success(`Vehículo ${vehiculoEncontrado.placa} eliminado exitosamente`);
      setShowModalEliminarVehiculo(false);
      setVehiculoEncontrado(null);
      setPensionInfo(null);
      setPlacaInput('');
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar vehículo');
    } finally {
      setEliminandoVehiculo(false);
    }
  };

  // Emitir ticket de entrada
  const handleEmitirTicket = async () => {
    const cleanPlaca = placaInput.trim().toUpperCase();
    if (!cleanPlaca) {
      toast.warning('Debes ingresar la placa del vehículo');
      return;
    }
    if (!selectedEspacioId) {
      toast.warning('Selecciona un espacio de parqueo disponible');
      return;
    }

    setEmitiendoTicket(true);
    try {
      const ticket = await api.tickets.registrarEntrada({
        placa: cleanPlaca,
        espacio_id: Number(selectedEspacioId),
      });

      setTicketEmitido(ticket);
      setShowTicketModal(true);
      toast.success(`Ticket generado: ${ticket.codigo}`);
      // Refrescar espacios y sedes
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al emitir ticket');
    } finally {
      setEmitiendoTicket(false);
    }
  };

  const resetForm = () => {
    setPlacaInput('');
    setVehiculoEncontrado(null);
    setVehiculoNoExiste(false);
    setPensionInfo(null);
    setShowTicketModal(false);
    setTicketEmitido(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout
      title="Módulo de Garita - Registro de Ingreso"
      subtitle="Lectura de placas, verificación de abonados y emisión inmediata de tickets"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* PANEL PRINCIPAL DE REGISTRO (8 Cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Tarjeta de Búsqueda de Placas */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              1. Identificación Vehicular (Placa)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Escribe o escanea la placa del vehículo que ingresa a la garita.
            </p>

            <form onSubmit={handleBuscarPlaca} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={placaInput}
                  onChange={(e) => setPlacaInput(e.target.value.toUpperCase())}
                  placeholder="Ej: P123ABC o M456QWE"
                  className="w-full uppercase font-mono text-xl tracking-widest font-black rounded-xl border-2 border-slate-300 bg-slate-50/50 py-3.5 px-4 text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:font-normal focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                />
                {placaInput && (
                  <button
                    type="button"
                    onClick={() => setPlacaInput('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={searching || !placaInput}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {searching ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>Buscar Placa</span>
              </button>
            </form>

            {/* Resultado de Búsqueda: Si existe */}
            {vehiculoEncontrado && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-950">
                        Vehículo Registrado: {vehiculoEncontrado.marca || 'Marca desconocida'}{' '}
                        &bull; {vehiculoEncontrado.color || 'Color no definido'}
                      </p>
                      <p className="font-mono text-xs text-emerald-800">
                        Placa: {vehiculoEncontrado.placa}
                      </p>
                    </div>
                  </div>
                  {/* Botones de Acción: Editar y Eliminar Vehículo */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleOpenEditarVehiculo}
                      title="Editar Vehículo (PUT)"
                      className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenEliminarVehiculo}
                      title="Eliminar Vehículo (DELETE)"
                      className="flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition shadow-2xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resultado de Búsqueda: Si NO existe */}
            {vehiculoNoExiste && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-950">
                        Placa {placaInput} no registrada previamente
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Puedes registrar sus datos ahora o emitir el ticket directamente.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModalNuevoVehiculo(true)}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Registrar Vehículo</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* VERIFICACIÓN DE PENSIÓN ACTIVA */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              2. Estado de Pensión / Acceso Abonado
            </h2>

            {verificandoPension ? (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 py-3">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span>Consultando estado de pensión en la API...</span>
              </div>
            ) : pensionInfo?.tiene_acceso || pensionInfo?.acceso_valido ? (
              <div className="mt-4 rounded-xl border-2 border-blue-500 bg-blue-50 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-block rounded bg-blue-600 px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
                      PENSIÓN MENSUAL VIGENTE
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-blue-950">
                      {pensionInfo.mensaje || 'Acceso Autorizado'}
                    </h3>
                    <p className="text-xs text-blue-800 mt-0.5">
                      Vence:{' '}
                      {pensionInfo.pension?.fecha_fin
                        ? new Date(pensionInfo.pension.fecha_fin).toLocaleDateString('es-GT')
                        : 'Fin de mes actual'}{' '}
                      &bull; Tarifa prepagada sin cobro por hora en caja.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>
                    {vehiculoEncontrado
                      ? 'Sin pensión activa asignada. Se aplicará cobro ordinario por tiempo al salir.'
                      : 'Ingresa una placa para verificar si posee pensión mensual autorizada.'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SELECTOR DE ESPACIO Y EMISIÓN DE TICKET */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  3. Asignación de Cajón & Emisión
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Selecciona la sede y el cajón disponible correspondiente para emitir el ticket.
                </p>
              </div>
              <button
                onClick={loadData}
                disabled={loadingEspacios}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <RefreshCw className={`h-3 w-3 ${loadingEspacios ? 'animate-spin' : ''}`} />
                <span>Refrescar Cajones</span>
              </button>
            </div>

            {/* Selectores de Sede / Sucursal y Nivel */}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-y border-slate-100 py-3 bg-slate-50/60 rounded-xl px-3">
              {/* Selector de Parqueo / Sede */}
              <div className="flex items-center rounded-xl bg-white border border-slate-200 px-3 py-1.5 shadow-xs">
                <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-[11px] font-bold uppercase text-slate-500 mr-2">
                  Sede / Parqueo:
                </span>
                <select
                  value={selectedSucursalId}
                  onChange={(e) => {
                    setSelectedSucursalId(
                      e.target.value === 'all' ? 'all' : Number(e.target.value)
                    );
                    setSelectedNivelId('all');
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todas las Sedes ({sucursales.length})</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Nivel */}
              <div className="flex items-center rounded-xl bg-white border border-slate-200 px-3 py-1.5 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-slate-500 mr-2">
                  Nivel:
                </span>
                <select
                  value={selectedNivelId}
                  onChange={(e) =>
                    setSelectedNivelId(
                      e.target.value === 'all' ? 'all' : Number(e.target.value)
                    )
                  }
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos los Niveles ({nivelesFiltrados.length})</option>
                  {nivelesFiltrados.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nombre_nivel}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[11px] font-semibold text-slate-500 ml-auto">
                Disponibles: <strong className="text-emerald-600">{espaciosFiltrados.length}</strong> de {espaciosDisponibles.length}
              </span>
            </div>

            {/* Grilla compacta de selección de espacios */}
            <div className="mt-4 max-h-56 overflow-y-auto pr-1">
              {espaciosFiltrados.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-center text-xs font-bold text-amber-800">
                  No hay cajones libres para la sede o nivel seleccionado. Selecciona "Todas las Sedes" o prueba con otra sucursal.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {espaciosFiltrados.map((esp) => {
                    const isSelected = selectedEspacioId === esp.id;
                    const sucursalNombre =
                      sucursales.find(
                        (s) =>
                          s.id ===
                          (esp.nivel?.sucursal_id ||
                            niveles.find((n) => n.id === esp.nivel_id)?.sucursal_id)
                      )?.nombre || 'Sede General';
                    const nivelNombre =
                      esp.nivel?.nombre_nivel ||
                      niveles.find((n) => n.id === esp.nivel_id)?.nombre_nivel ||
                      `Nivel ${esp.nivel_id}`;

                    return (
                      <button
                        key={esp.id}
                        type="button"
                        onClick={() => setSelectedEspacioId(esp.id)}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold scale-102'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-xs font-black tracking-tight">
                          {esp.numero_identificador || `C-${esp.id}`}
                        </span>
                        <span
                          className={`text-[10px] mt-0.5 font-semibold ${
                            isSelected ? 'text-blue-100' : 'text-slate-600'
                          }`}
                        >
                          {nivelNombre}
                        </span>
                        <span
                          className={`truncate max-w-full text-[9px] mt-0.5 ${
                            isSelected ? 'text-blue-200' : 'text-slate-400'
                          }`}
                          title={sucursalNombre}
                        >
                          {sucursalNombre}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Botón de Emisión Principal */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={handleEmitirTicket}
                disabled={emitiendoTicket || !placaInput || !selectedEspacioId}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 px-6 text-base font-extrabold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:opacity-50 transition"
              >
                {emitiendoTicket ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Generando Ticket en Backend...</span>
                  </>
                ) : (
                  <>
                    <Printer className="h-5 w-5" />
                    <span>EMITIR TICKET DE ENTRADA &bull; IMPRIMIR</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR DE INSTRUCCIONES Y GARITA EN VIVO (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Tarjeta de Garita Activa */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {selectedSucursal ? selectedSucursal.nombre : 'Todas las Sedes UMES'}
                </h3>
                <p className="text-[11px] text-slate-500 truncate">
                  {selectedSucursal ? selectedSucursal.direccion : 'Garita de Entrada General'}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Operador:</span>
                <span className="font-bold text-slate-800">
                  {currentUser?.nombre || 'Operador en Turno'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Sede Seleccionada:</span>
                <span className="font-bold text-blue-600 truncate max-w-[160px]">
                  {selectedSucursal ? selectedSucursal.nombre : 'Multisede'}
                </span>
              </div>
              {selectedSucursal?.telefono_contacto && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Teléfono:</span>
                  <span className="font-bold text-slate-800">
                    {selectedSucursal.telefono_contacto}
                  </span>
                </div>
              )}
              {selectedSucursal?.capacidad_maxima && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Capacidad Sede:</span>
                  <span className="font-bold text-slate-800">
                    {selectedSucursal.capacidad_maxima} vehículos
                  </span>
                </div>
              )}

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">Procedimiento de Garita:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Elige la sede o parqueo donde opera esta garita.</li>
                  <li>Digita o busca la placa vehicular.</li>
                  <li>El sistema avisa automáticamente si posee pensión.</li>
                  <li>Selecciona el cajón y presiona "Emitir Ticket".</li>
                  <li>Entrega el comprobante térmico con código QR.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRAR VEHÍCULO NUEVO */}
      {showModalNuevoVehiculo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Registrar Nuevo Vehículo
              </h3>
              <button
                onClick={() => setShowModalNuevoVehiculo(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearVehiculo} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Placa Vehicular
                </label>
                <input
                  type="text"
                  readOnly
                  value={placaInput}
                  className="mt-1 w-full font-mono text-sm font-bold uppercase rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Marca / Modelo
                </label>
                <input
                  type="text"
                  required
                  value={marcaInput}
                  onChange={(e) => setMarcaInput(e.target.value)}
                  placeholder="Ej: Toyota Corolla, Honda Civic, etc."
                  className="mt-1 w-full text-sm rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Color
                </label>
                <input
                  type="text"
                  required
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="Ej: Rojo, Gris Plata, Blanco, Negro"
                  className="mt-1 w-full text-sm rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalNuevoVehiculo(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creandoVehiculo}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {creandoVehiculo ? 'Guardando...' : 'Guardar y Continuar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EMERGENTE DEL TICKET TÉRMICO CON QR */}
      {showTicketModal && ticketEmitido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 flex flex-col items-center">
            {/* Contenedor del Ticket Térmico con clase 'print-area' */}
            <div className="print-area w-full border border-dashed border-slate-300 bg-white p-5 rounded-2xl shadow-inner font-mono text-slate-800">
              {/* Encabezado */}
              <div className="text-center border-b border-dashed border-slate-400 pb-3">
                <p className="text-base font-black tracking-tight">PARQUEOS UMES</p>
                <p className="text-[10px] uppercase font-bold text-slate-800">
                  {selectedSucursal?.nombre ||
                    (selectedEspacioObj?.nivel?.sucursal_id
                      ? sucursales.find(
                          (s) => s.id === selectedEspacioObj?.nivel?.sucursal_id
                        )?.nombre
                      : 'Universidad Mesoamericana')}
                </p>
                <p className="text-[9px] text-slate-500">
                  {selectedSucursal?.direccion || 'Control de Garita • PBX: 2411-1800'}
                </p>
              </div>

              {/* Datos del Ticket */}
              <div className="py-3 text-[11px] space-y-1.5 border-b border-dashed border-slate-400">
                <div className="flex justify-between font-bold">
                  <span>TICKET:</span>
                  <span className="text-slate-900">{ticketEmitido.codigo}</span>
                </div>
                <div className="flex justify-between">
                  <span>PLACA:</span>
                  <span className="font-black text-sm text-slate-900">
                    {ticketEmitido.placa}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SEDE / PARQUEO:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[170px]">
                    {selectedSucursal?.nombre ||
                      sucursales.find(
                        (s) => s.id === selectedEspacioObj?.nivel?.sucursal_id
                      )?.nombre ||
                      'Sede General'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CAJÓN / NIVEL:</span>
                  <span className="font-bold text-blue-700">
                    {selectedEspacioObj?.numero_identificador || `C-${ticketEmitido.espacio_id}`}
                    {selectedEspacioObj?.nivel?.nombre_nivel
                      ? ` (${selectedEspacioObj.nivel.nombre_nivel})`
                      : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>FECHA / HORA:</span>
                  <span>
                    {new Date(ticketEmitido.hora_entrada).toLocaleString('es-GT', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="my-4 flex flex-col items-center justify-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <QRCodeSVG
                    value={ticketEmitido.codigo}
                    size={135}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Conserva este ticket para el cobro
                </p>
              </div>

              {/* Tarifa Informativa */}
              <div className="text-center text-[9px] text-slate-500 border-t border-dashed border-slate-400 pt-2 space-y-0.5">
                <p>Tarifa Sedán: Q15.00/hora &bull; Q5.00 fracción</p>
                <p>No nos hacemos responsables por objetos de valor.</p>
                <p className="font-semibold text-slate-700 mt-1">¡Gracias por su visita!</p>
              </div>
            </div>

            {/* Botones de Acción (no se imprimen) */}
            <div className="no-print mt-5 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-extrabold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>IMPRIMIR TICKET (TÉRMICO)</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Registrar Nuevo Vehículo
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL EDITAR VEHÍCULO (PUT /api/vehiculos/:placa) */}
      {showModalEditarVehiculo && vehiculoEncontrado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-600" />
                Editar Vehículo: {vehiculoEncontrado.placa}
              </h3>
              <button
                onClick={() => setShowModalEditarVehiculo(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditarVehiculo} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Placa Vehicular (Identificador)
                </label>
                <input
                  type="text"
                  disabled
                  value={vehiculoEncontrado.placa}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3 font-mono font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Marca / Modelo
                </label>
                <input
                  type="text"
                  required
                  value={editMarcaInput}
                  onChange={(e) => setEditMarcaInput(e.target.value)}
                  placeholder="Ej: Toyota Corolla"
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  required
                  value={editColorInput}
                  onChange={(e) => setEditColorInput(e.target.value)}
                  placeholder="Ej: Gris Plata"
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalEditarVehiculo(false)}
                  disabled={editandoVehiculo}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editandoVehiculo}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {editandoVehiculo ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Actualizar Vehículo</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINACIÓN DE VEHÍCULO (DELETE /api/vehiculos/:placa) */}
      <ConfirmDeleteModal
        isOpen={showModalEliminarVehiculo}
        title="¿Eliminar Vehículo?"
        message="¿Estás seguro de que deseas eliminar este vehículo del registro del sistema?"
        itemName={vehiculoEncontrado ? `Vehículo Placa: ${vehiculoEncontrado.placa} (${vehiculoEncontrado.marca})` : undefined}
        loading={eliminandoVehiculo}
        onConfirm={handleConfirmEliminarVehiculo}
        onCancel={() => setShowModalEliminarVehiculo(false)}
      />
    </AppLayout>
  );
}

export default function GaritaPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <GaritaContent />
    </React.Suspense>
  );
}
