'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Building2,
  Layers,
  DollarSign,
  Users,
  Plus,
  RefreshCw,
  CheckCircle2,
  Phone,
  MapPin,
  Car,
  IdCard,
  X,
  Sliders,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Sucursal, NivelParqueo, Tarifa, Empleado } from '@/types/api';
import { toast } from 'sonner';

type ActiveTab = 'sucursales' | 'niveles' | 'tarifas' | 'empleados';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sucursales');
  const [loading, setLoading] = useState(true);

  // Datos
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [niveles, setNiveles] = useState<NivelParqueo[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados Form Sucursal
  const [sucNombre, setSucNombre] = useState('');
  const [sucDireccion, setSucDireccion] = useState('');
  const [sucTelefono, setSucTelefono] = useState('');
  const [sucCapacidad, setSucCapacidad] = useState(100);

  // Estados Form Nivel
  const [nivSucursalId, setNivSucursalId] = useState<number>(1);
  const [nivNombre, setNivNombre] = useState('');

  // Estados Form Tarifa
  const [tarTipoVehiculoId, setTarTipoVehiculoId] = useState<number>(1);
  const [tarMontoHora, setTarMontoHora] = useState(15.0);
  const [tarMontoFraccion, setTarMontoFraccion] = useState(5.0);
  const [tarActivo, setTarActivo] = useState(true);

  // Estados Form Empleado
  const [empNombres, setEmpNombres] = useState('');
  const [empApellidos, setEmpApellidos] = useState('');
  const [empDpi, setEmpDpi] = useState('');
  const [empTelefono, setEmpTelefono] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, nRes, tRes, eRes] = await Promise.allSettled([
        api.sucursales.getAll(),
        api.niveles.getAll(),
        api.tarifas.getAll(),
        api.empleados.getAll(),
      ]);

      if (sRes.status === 'fulfilled' && Array.isArray(sRes.value)) {
        setSucursales(sRes.value);
        if (sRes.value.length > 0 && !nivSucursalId) {
          setNivSucursalId(sRes.value[0].id);
        }
      }
      if (nRes.status === 'fulfilled' && Array.isArray(nRes.value)) setNiveles(nRes.value);
      if (tRes.status === 'fulfilled' && Array.isArray(tRes.value)) setTarifas(tRes.value);
      if (eRes.status === 'fulfilled' && Array.isArray(eRes.value)) setEmpleados(eRes.value);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar catálogos del sistema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (activeTab === 'sucursales') {
        const nueva = await api.sucursales.create({
          nombre: sucNombre,
          direccion: sucDireccion,
          telefono_contacto: sucTelefono,
          capacidad_maxima: Number(sucCapacidad),
        });
        setSucursales((prev) => [...prev, nueva]);
        toast.success('Sucursal creada exitosamente');
        setSucNombre('');
        setSucDireccion('');
        setSucTelefono('');
      } else if (activeTab === 'niveles') {
        const nuevo = await api.niveles.create({
          sucursal_id: Number(nivSucursalId),
          nombre_nivel: nivNombre,
        });
        setNiveles((prev) => [...prev, nuevo]);
        toast.success('Nivel de parqueo añadido con éxito');
        setNivNombre('');
      } else if (activeTab === 'tarifas') {
        const nueva = await api.tarifas.create({
          tipo_vehiculo_id: Number(tarTipoVehiculoId),
          monto_por_hora: Number(tarMontoHora),
          monto_fraccion: Number(tarMontoFraccion),
          estado_activo: tarActivo,
        });
        setTarifas((prev) => [...prev, nueva]);
        toast.success('Tarifa guardada exitosamente');
      } else if (activeTab === 'empleados') {
        const nuevo = await api.empleados.create({
          usuario_id: 1,
          nombres: empNombres,
          apellidos: empApellidos,
          dpi: empDpi,
          telefono: empTelefono,
        });
        setEmpleados((prev) => [...prev, nuevo]);
        toast.success('Empleado de garita registrado');
        setEmpNombres('');
        setEmpApellidos('');
        setEmpDpi('');
        setEmpTelefono('');
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar elemento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      title="Catálogos y Configuración General"
      subtitle="Gestión integral de sedes universitarias, áreas de estacionamiento, tarifarios y personal"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Recargar</span>
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>
              {activeTab === 'sucursales' && 'Nueva Sucursal'}
              {activeTab === 'niveles' && 'Nuevo Nivel'}
              {activeTab === 'tarifas' && 'Nueva Tarifa'}
              {activeTab === 'empleados' && 'Nuevo Empleado'}
            </span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* BARRA DE PESTAÑAS (TABS) */}
        <div className="flex rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('sucursales')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'sucursales'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Sucursales ({sucursales.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('niveles')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'niveles'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Niveles de Parqueo ({niveles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tarifas')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'tarifas'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Tarifas por Vehículo ({tarifas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('empleados')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'empleados'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Empleados de Garita ({empleados.length})</span>
          </button>
        </div>

        {/* CONTENIDO SEGÚN PESTAÑA */}

        {/* 1. TAB SUCURSALES */}
        {activeTab === 'sucursales' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sucursales.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold border border-blue-100">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{s.nombre}</h3>
                    <span className="text-[10px] font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      ID #{s.id}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                    <span>{s.direccion || 'Dirección central'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{s.telefono_contacto || 'PBX: 2411-1800'}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-400 font-medium">Capacidad Máxima:</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {s.capacidad_maxima} vehículos
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. TAB NIVELES DE PARQUEO */}
        {activeTab === 'niveles' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Nombre del Nivel</th>
                  <th className="py-3.5 px-5">Sucursal Asociada</th>
                  <th className="py-3.5 px-5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {niveles.map((n) => {
                  const suc = sucursales.find((s) => s.id === n.sucursal_id);
                  return (
                    <tr key={n.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-400">
                        #{n.id}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900 text-sm">
                        {n.nombre_nivel}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {suc?.nombre || `Sucursal ID #${n.sucursal_id}`}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          Habilitado
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. TAB TARIFAS */}
        {activeTab === 'tarifas' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {tarifas.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold border border-emerald-100">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {t.tipo_vehiculo_id === 2 ? 'Motocicleta' : 'Automóvil / Sedán'}
                      </h3>
                      <span className="text-[10px] text-slate-400">Tarifa #{t.id}</span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      t.estado_activo
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.estado_activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">Monto por Hora:</span>
                    <span className="text-xl font-extrabold text-blue-700 font-mono">
                      Q{t.monto_por_hora.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">Monto Fracción:</span>
                    <span className="text-sm font-bold text-slate-700 font-mono">
                      Q{t.monto_fraccion.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. TAB EMPLEADOS */}
        {activeTab === 'empleados' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Empleado</th>
                  <th className="py-3.5 px-5">DPI</th>
                  <th className="py-3.5 px-5">Teléfono</th>
                  <th className="py-3.5 px-5">Puesto Asignado</th>
                  <th className="py-3.5 px-5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empleados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold">
                          {emp.nombres.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {emp.nombres} {emp.apellidos}
                          </p>
                          <p className="text-[10px] text-slate-400">ID #{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-700">{emp.dpi}</td>
                    <td className="py-3.5 px-5 text-slate-600">{emp.telefono}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">
                      Operador de Garita &bull; Caja
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Activo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR ELEMENTO SEGÚN PESTAÑA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                {activeTab === 'sucursales' && 'Nueva Sucursal UMES'}
                {activeTab === 'niveles' && 'Nuevo Nivel de Parqueo'}
                {activeTab === 'tarifas' && 'Nueva Tarifa por Vehículo'}
                {activeTab === 'empleados' && 'Nuevo Empleado'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              {activeTab === 'sucursales' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Nombre Comercial</label>
                    <input
                      type="text"
                      required
                      value={sucNombre}
                      onChange={(e) => setSucNombre(e.target.value)}
                      placeholder="Ej: Campus Xela - Zona 3"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Dirección Física</label>
                    <input
                      type="text"
                      required
                      value={sucDireccion}
                      onChange={(e) => setSucDireccion(e.target.value)}
                      placeholder="Ej: 14 Avenida 5-20, Zona 3"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Teléfono Contacto</label>
                    <input
                      type="text"
                      value={sucTelefono}
                      onChange={(e) => setSucTelefono(e.target.value)}
                      placeholder="7761-4455"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Capacidad Máxima</label>
                    <input
                      type="number"
                      required
                      value={sucCapacidad}
                      onChange={(e) => setSucCapacidad(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                    />
                  </div>
                </>
              )}

              {activeTab === 'niveles' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Sucursal Perteneciente</label>
                    <select
                      value={nivSucursalId}
                      onChange={(e) => setNivSucursalId(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                    >
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Nombre del Nivel</label>
                    <input
                      type="text"
                      required
                      value={nivNombre}
                      onChange={(e) => setNivNombre(e.target.value)}
                      placeholder="Ej: Sótano 3 o Terraza Norte"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                    />
                  </div>
                </>
              )}

              {activeTab === 'tarifas' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Tipo de Vehículo</label>
                    <select
                      value={tarTipoVehiculoId}
                      onChange={(e) => setTarTipoVehiculoId(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                    >
                      <option value={1}>Sedán / Automóvil</option>
                      <option value={2}>Motocicleta</option>
                      <option value={3}>Camioneta / SUV</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Monto por Hora (Q)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={tarMontoHora}
                      onChange={(e) => setTarMontoHora(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Monto por Fracción (Q)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={tarMontoFraccion}
                      onChange={(e) => setTarMontoFraccion(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                    />
                  </div>
                </>
              )}

              {activeTab === 'empleados' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-600 uppercase">Nombres</label>
                      <input
                        type="text"
                        required
                        value={empNombres}
                        onChange={(e) => setEmpNombres(e.target.value)}
                        placeholder="Carlos"
                        className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 uppercase">Apellidos</label>
                      <input
                        type="text"
                        required
                        value={empApellidos}
                        onChange={(e) => setEmpApellidos(e.target.value)}
                        placeholder="Morales"
                        className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">DPI (13 dígitos)</label>
                    <input
                      type="text"
                      required
                      value={empDpi}
                      onChange={(e) => setEmpDpi(e.target.value)}
                      placeholder="2541987450101"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Teléfono</label>
                    <input
                      type="text"
                      value={empTelefono}
                      onChange={(e) => setEmpTelefono(e.target.value)}
                      placeholder="5544-3322"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900"
                    />
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Guardando...' : 'Guardar en Sistema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

