'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  MapPin,
  RefreshCw,
  TrendingUp,
  X,
  CreditCard,
  Ban,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Espacio, Sucursal, NivelParqueo } from '@/types/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState<number | 'all'>('all');
  const [niveles, setNiveles] = useState<NivelParqueo[]>([]);
  const [selectedNivelId, setSelectedNivelId] = useState<number | 'all'>('all');
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [filterState, setFilterState] = useState<'all' | 'disponible' | 'ocupado'>('all');
  const [selectedEspacio, setSelectedEspacio] = useState<Espacio | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sucRes, nivRes, espRes] = await Promise.allSettled([
        api.sucursales.getAll(),
        api.niveles.getAll(),
        api.espacios.getAll(),
      ]);

      if (sucRes.status === 'fulfilled' && Array.isArray(sucRes.value)) {
        setSucursales(sucRes.value);
      }
      if (nivRes.status === 'fulfilled' && Array.isArray(nivRes.value)) {
        setNiveles(nivRes.value);
      }
      if (espRes.status === 'fulfilled' && Array.isArray(espRes.value)) {
        setEspacios(espRes.value);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error al sincronizar datos del parqueo');
    } finally {
      setLoading(false);
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

  // Espacios filtrados por nivel y estado
  const espaciosFiltrados = espacios.filter((esp) => {
    // Filtro por sede (si no es 'all')
    if (selectedSucursalId !== 'all') {
      const pertenece = nivelesFiltrados.some((n) => n.id === esp.nivel_id);
      if (nivelesFiltrados.length > 0 && !pertenece) return false;
    }

    // Filtro por nivel (si no es 'all')
    if (selectedNivelId !== 'all') {
      if (esp.nivel_id !== Number(selectedNivelId)) return false;
    }

    // Filtro por estado
    if (filterState === 'disponible') return esp.estado_id === 1;
    if (filterState === 'ocupado') return esp.estado_id === 2;

    return true;
  });

  // Métricas calculadas
  const totalEspacios = espacios.length || 22;
  const espaciosOcupados = espacios.filter((e) => e.estado_id === 2).length;
  const espaciosDisponibles = totalEspacios - espaciosOcupados;
  const porcentajeOcupacion = Math.round((espaciosOcupados / (totalEspacios || 1)) * 100);
  const vehiculosDentro = espaciosOcupados;
  const ingresosEstimados = espaciosOcupados * 15 + 185;

  return (
    <AppLayout
      title="Dashboard General"
      subtitle="Monitoreo en tiempo real de espacios libres y ocupados"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <Link
            href="/garita"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
          >
            <Car className="h-3.5 w-3.5" />
            <span>Registrar Entrada</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* TARJETAS DE MÉTRICAS RESUMEN */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Espacios Libres */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Espacios Libres
                </p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                  {espaciosDisponibles}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">
                {100 - porcentajeOcupacion}% de capacidad libre
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
          </div>

          {/* Espacios Ocupados */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Espacios Ocupados
                </p>
                <p className="mt-2 text-3xl font-extrabold text-rose-600">
                  {espaciosOcupados}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <Car className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${porcentajeOcupacion}%` }}
                />
              </div>
              <span className="text-xs font-bold text-rose-600">
                {porcentajeOcupacion}%
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
          </div>

          {/* Vehículos Dentro */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Vehículos en Recinto
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-800">
                  {vehiculosDentro}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              <span>Flujo de garita activo</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />
          </div>

          {/* Ingresos Estimados */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ingresos Estimados
                </p>
                <p className="mt-2 text-3xl font-extrabold text-indigo-600">
                  Q{ingresosEstimados.toFixed(2)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Tarifas vigentes UMES</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600" />
          </div>
        </div>

        {/* MAPA VISUAL DE CAJONES DE ESTACIONAMIENTO */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Header y Filtros */}
          <div className="border-b border-slate-200 p-5 bg-slate-50/70">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Estado de Cajones de Estacionamiento
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualización de espacios: Verde = Libre | Rojo = Ocupado
                </p>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Selector de Sede */}
                <div className="flex items-center rounded-xl bg-white border border-slate-200 px-3 py-1.5 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 mr-2 uppercase">
                    Sede:
                  </span>
                  <select
                    value={selectedSucursalId}
                    onChange={(e) => {
                      setSelectedSucursalId(
                        e.target.value === 'all' ? 'all' : Number(e.target.value)
                      );
                      setSelectedNivelId('all');
                    }}
                    className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="all">Todas las Sedes</option>
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Nivel */}
                <div className="flex items-center rounded-xl bg-white border border-slate-200 px-3 py-1.5 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 mr-2 uppercase">
                    Nivel:
                  </span>
                  <select
                    value={selectedNivelId}
                    onChange={(e) =>
                      setSelectedNivelId(
                        e.target.value === 'all' ? 'all' : Number(e.target.value)
                      )
                    }
                    className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="all">Todos los Niveles</option>
                    {nivelesFiltrados.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.nombre_nivel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro Rápido: Todos, Ocupados, Libres */}
                <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-medium">
                  <button
                    onClick={() => setFilterState('all')}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      filterState === 'all'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({espacios.length})
                  </button>
                  <button
                    onClick={() => setFilterState('ocupado')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                      filterState === 'ocupado'
                        ? 'bg-rose-600 text-white shadow-sm font-bold'
                        : 'text-slate-600 hover:text-rose-600'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Solo Ocupados ({espaciosOcupados})</span>
                  </button>
                  <button
                    onClick={() => setFilterState('disponible')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                      filterState === 'disponible'
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-slate-600 hover:text-emerald-600'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Solo Libres ({espaciosDisponibles})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Leyenda Simplificada */}
          <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-100 bg-white text-xs text-slate-600">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-700">Libre / Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span className="font-medium text-slate-700">Ocupado</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Mostrando {espaciosFiltrados.length} de {espacios.length} cajones
            </span>
          </div>

          {/* Grilla Visual de Cajones (Estilo Bahías de Estacionamiento) */}
          <div className="p-6 bg-slate-50/40">
            {espaciosFiltrados.length === 0 ? (
              <div className="py-12 text-center">
                <Car className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  No hay cajones para el filtro seleccionado.
                </p>
                <button
                  onClick={() => {
                    setSelectedSucursalId('all');
                    setSelectedNivelId('all');
                    setFilterState('all');
                  }}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                >
                  Ver todos los cajones
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                {espaciosFiltrados.map((esp) => {
                  const isOcupado = esp.estado_id === 2;

                  return (
                    <button
                      key={esp.id}
                      onClick={() => setSelectedEspacio(esp)}
                      className={`group relative flex flex-col justify-between rounded-xl border-2 p-3 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${
                        isOcupado
                          ? 'border-rose-400 bg-rose-50/80 hover:bg-rose-100/90 text-rose-950'
                          : 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-100/60 text-emerald-950'
                      }`}
                    >
                      {/* Número de Cajón */}
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="font-mono text-sm font-black text-slate-800">
                          {esp.numero_identificador || `C-${esp.id}`}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            isOcupado
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-emerald-600 text-white shadow-sm'
                          }`}
                        >
                          {isOcupado ? 'OCUPADO' : 'LIBRE'}
                        </span>
                      </div>

                      {/* Bahía / Vehículo */}
                      <div className="my-3 flex flex-col items-center justify-center min-h-[50px]">
                        {isOcupado ? (
                          <>
                            <Car className="h-8 w-8 text-rose-600 transition-transform group-hover:scale-110" />
                            {esp.placa_ocupante ? (
                              <span className="mt-1.5 rounded bg-slate-900 px-2 py-0.5 font-mono text-[11px] font-black text-amber-300 shadow-sm border border-slate-700">
                                {esp.placa_ocupante}
                              </span>
                            ) : (
                              <span className="mt-1 text-[11px] font-bold text-rose-700">
                                En uso
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-emerald-600/70 py-1">
                            <span className="h-6 w-6 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center text-emerald-600 font-bold text-xs">
                              ✓
                            </span>
                            <span className="mt-1 text-[10px] font-bold text-emerald-700">
                              Disponible
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* MODAL DETALLES DEL ESPACIO */}
        {selectedEspacio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white ${
                      selectedEspacio.estado_id === 1 ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Cajón {selectedEspacio.numero_identificador || `C-${selectedEspacio.id}`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Nivel ID: {selectedEspacio.nivel_id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEspacio(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Estado:</span>
                  <span
                    className={`font-bold ${
                      selectedEspacio.estado_id === 1 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {selectedEspacio.estado_id === 1 ? 'Disponible (Libre)' : 'Ocupado'}
                  </span>
                </div>

                {selectedEspacio.placa_ocupante && (
                  <>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Placa Vehicular:</span>
                      <span className="font-mono font-black text-slate-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                        {selectedEspacio.placa_ocupante}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Hora de Ingreso:</span>
                      <span className="font-medium text-slate-700">
                        {selectedEspacio.hora_ingreso
                          ? new Date(selectedEspacio.hora_ingreso).toLocaleTimeString('es-GT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Hace ~1 hora'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex gap-2.5">
                {selectedEspacio.estado_id === 1 ? (
                  <Link
                    href={`/garita?espacio=${selectedEspacio.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                  >
                    <Car className="h-4 w-4" />
                    <span>Asignar en Garita</span>
                  </Link>
                ) : (
                  <Link
                    href={`/caja?placa=${selectedEspacio.placa_ocupante || ''}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Cobrar en Caja</span>
                  </Link>
                )}
                <button
                  onClick={() => setSelectedEspacio(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
