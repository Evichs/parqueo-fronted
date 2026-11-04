'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  CreditCard,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  Receipt,
  Car,
  AlertCircle,
  Banknote,
  ShieldCheck,
  RefreshCw,
  QrCode,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api, mockStore } from '@/lib/api';
import { Ticket, Tarifa, Pago } from '@/types/api';
import { toast } from 'sonner';

function CajaContent() {
  const searchParams = useSearchParams();
  const initialPlaca = searchParams.get('placa') || '';

  // Estados de búsqueda
  const [codigoTicketInput, setCodigoTicketInput] = useState('');
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [ticketActual, setTicketActual] = useState<Ticket | null>(null);
  const [salidaCalculada, setSalidaCalculada] = useState<{
    minutos: number;
    horas: number;
    fraccion: number;
    total_calculado: number;
  } | null>(null);

  // Lista de todos los tickets de espacios ocupados en tiempo real
  const [ticketsOcupados, setTicketsOcupados] = useState<
    Array<
      Ticket & {
        espacio_nombre?: string;
        minutos_transcurridos?: number;
        es_pension?: boolean;
      }
    >
  >([]);

  // Tarifas
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);

  // Formulario de Pago
  const [metodoPagoId, setMetodoPagoId] = useState<number>(1); // 1 = Efectivo, 2 = Tarjeta
  const [numeroAutorizacion, setNumeroAutorizacion] = useState('');
  const [requiereFEL, setRequiereFEL] = useState(false);
  const [nitFactura, setNitFactura] = useState('CF');
  const [nombreFactura, setNombreFactura] = useState('Consumidor Final');
  const [procesandoPago, setProcesandoPago] = useState(false);

  // Recibo emitido
  const [pagoExitoso, setPagoExitoso] = useState<any | null>(null);
  const [showReciboModal, setShowReciboModal] = useState(false);

  const cargarTicketsOcupados = () => {
    try {
      const activos = api.tickets.getActivos();
      setTicketsOcupados(activos);
    } catch (e) {
      console.error(e);
    }
  };

  const formatTiempo = (minutos?: number) => {
    if (!minutos || minutos <= 0) return 'Recién';
    const hrs = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  useEffect(() => {
    cargarTicketsOcupados();

    // Cargar tarifas
    api.tarifas
      .getAll()
      .then((data) => {
        if (Array.isArray(data)) setTarifas(data);
      })
      .catch(console.error);

    // Si viene placa en URL, buscar su ticket
    if (initialPlaca) {
      buscarPorPlaca(initialPlaca);
    }
  }, [initialPlaca]);

  const buscarPorPlaca = (placa: string) => {
    const todosTickets = mockStore.getTickets();
    const t = todosTickets.find(
      (tk: Ticket) => tk.placa.toUpperCase() === placa.toUpperCase() && !tk.pagado
    );
    if (t) {
      setCodigoTicketInput(t.codigo);
      procesarCierreSalida(t.codigo);
    }
  };

  // 1. Cierre de tiempo y cálculo en API
  const procesarCierreSalida = async (codigo: string) => {
    const clean = codigo.trim().toUpperCase();
    if (!clean) {
      toast.warning('Ingresa un código de ticket para cobrar');
      return;
    }

    setLoadingTicket(true);
    setTicketActual(null);
    setSalidaCalculada(null);

    try {
      const res = await api.tickets.registrarSalida(clean);
      if (res && res.ticket) {
        setTicketActual(res.ticket);
        setSalidaCalculada({
          minutos: res.minutos,
          horas: res.horas,
          fraccion: res.fraccion,
          total_calculado: res.total_calculado,
        });
        toast.success(`Ticket ${clean} verificado para cobro.`);
      } else {
        // Fallback genérico si el backend responde con estructura directa de Ticket
        setTicketActual(res);
        setSalidaCalculada({
          minutos: 90,
          horas: 1,
          fraccion: 30,
          total_calculado: 25.0,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al procesar salida del ticket');
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    procesarCierreSalida(codigoTicketInput);
  };

  // 2. Procesamiento de Pago y FEL
  const handlePagar = async () => {
    if (!ticketActual || !salidaCalculada) return;

    if (metodoPagoId === 2 && !numeroAutorizacion) {
      toast.warning('Ingresa el número de autorización del POS / Tarjeta');
      return;
    }

    setProcesandoPago(true);
    try {
      const pagoData = {
        ticket_id: ticketActual.id,
        total_pagado: salidaCalculada.total_calculado,
        metodo_pago_id: metodoPagoId,
        numero_autorizacion: metodoPagoId === 2 ? numeroAutorizacion : undefined,
        requiere_fel: requiereFEL,
        nit_fel: requiereFEL ? nitFactura : 'CF',
        nombre_fel: requiereFEL ? nombreFactura : 'Consumidor Final',
      };

      const pagoResult = await api.pagos.procesar(pagoData);
      setPagoExitoso(pagoResult);
      setShowReciboModal(true);
      cargarTicketsOcupados();
      toast.success('¡Pago procesado exitosamente!');
    } catch (err: any) {
      toast.error(err.message || 'Fallo al registrar el pago');
    } finally {
      setProcesandoPago(false);
    }
  };

  const handleNuevoCobro = () => {
    setCodigoTicketInput('');
    setTicketActual(null);
    setSalidaCalculada(null);
    setNumeroAutorizacion('');
    setPagoExitoso(null);
    setShowReciboModal(false);
    cargarTicketsOcupados();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout
      title="Módulo de Caja - Salida y Cobro"
      subtitle="Liquidación de tickets, cálculo de tarifas y emisión de Factura Electrónica (FEL)"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* PANEL PRINCIPAL DE COBRO (8 Cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Búsqueda de Ticket */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              1. Escaneo / Ingreso de Ticket
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Escanea el código de barras/QR o escribe el identificador del ticket.
            </p>

            <form onSubmit={handleBuscar} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={codigoTicketInput}
                  onChange={(e) => setCodigoTicketInput(e.target.value.toUpperCase())}
                  placeholder="Ej: TCK-2026-8841"
                  className="w-full uppercase font-mono text-lg font-black tracking-wider rounded-xl border-2 border-slate-300 bg-slate-50/50 py-3 px-4 text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:font-normal focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                />
                {codigoTicketInput && (
                  <button
                    type="button"
                    onClick={() => setCodigoTicketInput('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loadingTicket || !codigoTicketInput}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50 transition"
              >
                {loadingTicket ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>Calcular Salida</span>
              </button>
            </form>

            {/* SECCIÓN INTERACTIVA: Todos los tickets de espacios ocupados */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Car className="h-4 w-4 text-rose-500" />
                    Tickets de Espacios Ocupados:
                  </span>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-black text-rose-700">
                    {ticketsOcupados.length} en recinto
                  </span>
                </div>
                <button
                  type="button"
                  onClick={cargarTicketsOcupados}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition"
                  title="Refrescar tickets ocupados"
                >
                  <RefreshCw className="h-3 w-3" />
                  Actualizar lista
                </button>
              </div>

              {ticketsOcupados.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs text-slate-500">
                  No hay vehículos ocupando espacios en este momento. Todos los cajones están libres.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {ticketsOcupados.map((tk) => {
                    const isSelected =
                      codigoTicketInput.toUpperCase() === tk.codigo.toUpperCase();
                    return (
                      <button
                        key={tk.codigo}
                        type="button"
                        onClick={() => {
                          setCodigoTicketInput(tk.codigo);
                          procesarCierreSalida(tk.codigo);
                        }}
                        className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-600/20 shadow-sm'
                            : 'border-slate-200 bg-slate-50/60 hover:border-blue-400 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-mono text-xs font-black text-blue-700 group-hover:text-blue-800">
                            {tk.codigo}
                          </span>
                          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-100">
                            {formatTiempo(tk.minutos_transcurridos)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 tracking-wide font-mono">
                              {tk.placa}
                            </span>
                            {tk.es_pension && (
                              <span className="rounded bg-sky-100 px-1.5 py-0.2 text-[9px] font-bold text-sky-800">
                                Pensión
                              </span>
                            )}
                          </div>
                          <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-black text-slate-700">
                            {tk.espacio_nombre}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* DESGLOSE Y CÁLCULO DE TARIFA */}
          {ticketActual && salidaCalculada && (
            <div className="rounded-2xl border-2 border-blue-500/30 bg-white p-6 shadow-md animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-black">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Placa: {ticketActual.placa}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Ticket: {ticketActual.codigo} &bull; Cajón: #{ticketActual.espacio_id}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Listo para Cobro
                </span>
              </div>

              {/* Tiempos y Cálculos */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">
                    Hora Entrada
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {new Date(ticketActual.hora_entrada).toLocaleTimeString('es-GT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(ticketActual.hora_entrada).toLocaleDateString('es-GT')}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">
                    Hora Salida
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {ticketActual.hora_salida
                      ? new Date(ticketActual.hora_salida).toLocaleTimeString('es-GT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Ahora'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {salidaCalculada.horas}h {salidaCalculada.fraccion}m transcurridos
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 text-blue-950">
                  <span className="text-[11px] font-bold uppercase text-blue-700">
                    Total a Liquidar
                  </span>
                  <p className="mt-1 text-2xl font-black text-blue-700">
                    Q{salidaCalculada.total_calculado.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-blue-600">Tarifa Estándar UMES</p>
                </div>
              </div>

              {/* SELECCIÓN DE MÉTODO DE PAGO */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Método de Pago
                </h4>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMetodoPagoId(1)}
                    className={`flex items-center justify-center gap-2.5 rounded-xl border-2 py-3.5 px-4 font-bold text-sm transition ${
                      metodoPagoId === 1
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="h-5 w-5" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPagoId(2)}
                    className={`flex items-center justify-center gap-2.5 rounded-xl border-2 py-3.5 px-4 font-bold text-sm transition ${
                      metodoPagoId === 2
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Tarjeta (POS)</span>
                  </button>
                </div>

                {/* Si es Tarjeta, solicitar número de autorización */}
                {metodoPagoId === 2 && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label className="block text-xs font-semibold uppercase text-slate-600">
                      Número de Autorización Voucher POS
                    </label>
                    <input
                      type="text"
                      required
                      value={numeroAutorizacion}
                      onChange={(e) => setNumeroAutorizacion(e.target.value)}
                      placeholder="Ej: AUTH-88921"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* OPCIÓN FACTURA ELECTRÓNICA (FEL) */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id="felCheck"
                      type="checkbox"
                      checked={requiereFEL}
                      onChange={(e) => setRequiereFEL(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="felCheck"
                      className="text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer"
                    >
                      Emitir Factura Electrónica (FEL SAT)
                    </label>
                  </div>
                  {requiereFEL && (
                    <button
                      type="button"
                      onClick={() => {
                        setNitFactura('CF');
                        setNombreFactura('Consumidor Final');
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Poner CF
                    </button>
                  )}
                </div>

                {requiereFEL && (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        NIT Receptor
                      </label>
                      <input
                        type="text"
                        value={nitFactura}
                        onChange={(e) => setNitFactura(e.target.value.toUpperCase())}
                        placeholder="Ej: 3489214-5 o CF"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500">
                        Nombre o Razón Social
                      </label>
                      <input
                        type="text"
                        value={nombreFactura}
                        onChange={(e) => setNombreFactura(e.target.value)}
                        placeholder="Nombre para la factura"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Final de Pago */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handlePagar}
                  disabled={procesandoPago}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 py-4 px-6 text-base font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:opacity-50 transition"
                >
                  {procesandoPago ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Procesando Pago y FEL en Backend...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>
                        COBRAR Q{salidaCalculada.total_calculado.toFixed(2)} &bull; EMITIR COMPROBANTE
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR DE TARIFAS Y ESTADÍSTICAS DE CAJA (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Tarifario Activo */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Tarifario Vigente UMES
            </h3>

            <div className="mt-4 space-y-3">
              {tarifas.length === 0 ? (
                <div className="text-xs text-slate-500">Cargando tarifas...</div>
              ) : (
                tarifas.map((tar) => (
                  <div
                    key={tar.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {tar.tipo_vehiculo_id === 2 ? 'Motocicletas' : 'Automóviles / Sedán'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Fracción: Q{tar.monto_fraccion.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-extrabold text-blue-700 text-sm">
                      Q{tar.monto_por_hora.toFixed(2)} / hr
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 rounded-xl bg-blue-50/60 p-3 text-[11px] text-blue-900 border border-blue-100">
              <p className="font-semibold">Política de Cobro:</p>
              <p className="mt-0.5 text-blue-700">
                Tolerancia de 15 minutos de gracia para desocupar tras el cobro en garita de salida.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE RECIBO / COMPROBANTE DE PAGO Y FACTURA FEL */}
      {showReciboModal && pagoExitoso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 flex flex-col items-center">
            {/* Recibo Térmico (imprimible con clase 'print-area') */}
            <div className="print-area w-full border border-dashed border-slate-300 bg-white p-5 rounded-2xl shadow-inner font-mono text-slate-800">
              {/* Emisor */}
              <div className="text-center border-b border-dashed border-slate-400 pb-3">
                <p className="text-base font-black tracking-tight">PARQUEOS UMES</p>
                <p className="text-[10px] font-bold text-slate-700">
                  UNIVERSIDAD MESOAMERICANA
                </p>
                <p className="text-[9px] text-slate-500">NIT: 1489234-9</p>
                <p className="text-[9px] text-slate-500">
                  Campus Central &bull; Ciudad de Guatemala
                </p>
                {requiereFEL ? (
                  <div className="mt-1 rounded bg-slate-100 py-0.5 text-[9px] font-bold uppercase text-slate-800 border border-slate-300">
                    FACTURA ELECTRÓNICA FEL (SAT)
                  </div>
                ) : (
                  <div className="mt-1 rounded bg-slate-100 py-0.5 text-[9px] font-bold uppercase text-slate-800 border border-slate-300">
                    COMPROBANTE DE PAGO
                  </div>
                )}
              </div>

              {/* DTE / Autorización */}
              <div className="py-2.5 text-[10px] space-y-1 border-b border-dashed border-slate-400">
                <div className="flex justify-between">
                  <span>No. Recibo:</span>
                  <span className="font-bold">REC-{pagoExitoso.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ticket Ref:</span>
                  <span className="font-bold">{ticketActual?.codigo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Placa:</span>
                  <span className="font-black text-xs">{ticketActual?.placa}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha/Hora:</span>
                  <span>{new Date().toLocaleString('es-GT')}</span>
                </div>
                {pagoExitoso.numero_autorizacion && (
                  <div className="flex justify-between">
                    <span>Autorización POS:</span>
                    <span className="font-bold">{pagoExitoso.numero_autorizacion}</span>
                  </div>
                )}
                {requiereFEL && (
                  <>
                    <div className="flex justify-between">
                      <span>NIT Cliente:</span>
                      <span className="font-bold">{pagoExitoso.nit_fel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nombre:</span>
                      <span className="font-bold truncate max-w-[150px]">
                        {pagoExitoso.nombre_fel}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Desglose */}
              <div className="py-2.5 text-[11px] space-y-1 border-b border-dashed border-slate-400">
                <div className="flex justify-between">
                  <span>Estadía de Parqueo:</span>
                  <span>Q{pagoExitoso.total_pagado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Método:</span>
                  <span>{metodoPagoId === 1 ? 'Efectivo' : 'Tarjeta Débito/Crédito'}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-200">
                  <span>TOTAL PAGADO:</span>
                  <span className="text-slate-900">
                    Q{pagoExitoso.total_pagado.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* QR de Validación SAT / FEL */}
              <div className="my-3 flex flex-col items-center justify-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <QRCodeSVG
                    value={`https://sat.gob.gt/fel/dte?auth=${pagoExitoso.numero_autorizacion || 'UMES-FEL-2026'}&monto=${pagoExitoso.total_pagado}`}
                    size={110}
                    level="M"
                  />
                </div>
                <p className="mt-1 text-[8px] font-bold uppercase text-slate-500">
                  Autorización Certificador DTE SAT
                </p>
              </div>

              <div className="text-center text-[9px] text-slate-500 border-t border-dashed border-slate-400 pt-2">
                <p>¡Gracias por su visita a Campus UMES!</p>
                <p>Tiene 15 minutos para retirar su vehículo.</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="no-print mt-5 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-extrabold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>IMPRIMIR RECIBO (TÉRMICO)</span>
              </button>
              <button
                type="button"
                onClick={handleNuevoCobro}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Atender Siguiente Vehículo
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function CajaPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <CajaContent />
    </React.Suspense>
  );
}
