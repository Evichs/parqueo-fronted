'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
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
  Pencil,
  Trash2,
  Shield,
  Tag,
  FileText,
  CreditCard,
  Warehouse,
  Sun,
  History,
  UserCheck,
} from 'lucide-react';
import { api, getCurrentUser } from '@/lib/api';
import {
  Sucursal,
  NivelParqueo,
  Tarifa,
  Empleado,
  Cliente,
  Vehiculo,
  User,
  Rol,
  EstadoEspacio,
  MetodoPago,
  TipoVehiculo,
  Espacio,
  AuditLog,
} from '@/types/api';
import { toast } from 'sonner';

type ActiveTab =
  | 'sucursales'
  | 'niveles'
  | 'espacios'
  | 'tarifas'
  | 'empleados'
  | 'clientes'
  | 'vehiculos'
  | 'usuarios'
  | 'catalogos'
  | 'auditoria';

type SubCatalogTab = 'estados' | 'metodos' | 'roles' | 'tipos';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sucursales');
  const [subTab, setSubTab] = useState<SubCatalogTab>('estados');
  const [loading, setLoading] = useState(true);

  // Datos principales
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [niveles, setNiveles] = useState<NivelParqueo[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [estadosEspacio, setEstadosEspacio] = useState<EstadoEspacio[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [tiposVehiculo, setTiposVehiculo] = useState<TipoVehiculo[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Registro actualmente seleccionado para Editar o Eliminar
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Estados Formularios - Sucursal
  const [sucNombre, setSucNombre] = useState('');
  const [sucDireccion, setSucDireccion] = useState('');
  const [sucTelefono, setSucTelefono] = useState('');
  const [sucCapacidad, setSucCapacidad] = useState(100);

  // Estados Formularios - Nivel
  const [nivSucursalId, setNivSucursalId] = useState<number>(1);
  const [nivNombre, setNivNombre] = useState('');

  // Estados Formularios - Espacio
  const [espNivelId, setEspNivelId] = useState<number>(1);
  const [espEstadoId, setEspEstadoId] = useState<number>(1);
  const [espTipoVehiculoId, setEspTipoVehiculoId] = useState<number>(1);
  const [espEsTechado, setEspEsTechado] = useState<boolean>(true);
  const [espNumero, setEspNumero] = useState('');

  // Estados Formularios - Tarifa
  const [tarTipoVehiculoId, setTarTipoVehiculoId] = useState<number>(1);
  const [tarMontoHora, setTarMontoHora] = useState(15.0);
  const [tarMontoFraccion, setTarMontoFraccion] = useState(5.0);
  const [tarActivo, setTarActivo] = useState(true);

  // Estados Formularios - Empleado
  const [empUsuarioId, setEmpUsuarioId] = useState<number>(1);
  const [empNombres, setEmpNombres] = useState('');
  const [empApellidos, setEmpApellidos] = useState('');
  const [empDpi, setEmpDpi] = useState('');
  const [empTelefono, setEmpTelefono] = useState('');

  // Estados Formularios - Cliente
  const [cliUsuarioId, setCliUsuarioId] = useState<number>(1);
  const [cliNit, setCliNit] = useState('CF');
  const [cliNombre, setCliNombre] = useState('');
  const [cliTelefono, setCliTelefono] = useState('');

  // Estados Formularios - Vehículo
  const [vehPlaca, setVehPlaca] = useState('');
  const [vehMarca, setVehMarca] = useState('');
  const [vehColor, setVehColor] = useState('');
  const [vehClienteId, setVehClienteId] = useState<number | undefined>(undefined);

  // Estados Formularios - Usuario
  const [usrEmail, setUsrEmail] = useState('');
  const [usrNombre, setUsrNombre] = useState('');
  const [usrRolId, setUsrRolId] = useState<number>(2);
  const [usrPassword, setUsrPassword] = useState('');

  // Estados Formularios - Catálogos simples (Nombre único)
  const [catNombre, setCatNombre] = useState('');

  // Estados Formularios - Bitácora / Auditoría
  const [audAccion, setAudAccion] = useState('');
  const [audDetalles, setAudDetalles] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [
        sRes,
        nRes,
        eRes,
        tRes,
        empRes,
        cRes,
        vRes,
        uRes,
        estRes,
        mRes,
        rRes,
        tvRes,
        aRes,
      ] = await Promise.allSettled([
        api.sucursales.getAll(),
        api.niveles.getAll(),
        api.espacios.getAll(),
        api.tarifas.getAll(),
        api.empleados.getAll(),
        api.clientes.getAll(),
        api.vehiculos.getAll(),
        api.usuarios.getAll(),
        api.estadosEspacio.getAll(),
        api.metodosPago.getAll(),
        api.roles.getAll(),
        api.tiposVehiculo.getAll(),
        api.auditLogs.getAll(),
      ]);

      if (sRes.status === 'fulfilled' && Array.isArray(sRes.value)) setSucursales(sRes.value);
      if (nRes.status === 'fulfilled' && Array.isArray(nRes.value)) setNiveles(nRes.value);
      if (eRes.status === 'fulfilled' && Array.isArray(eRes.value)) setEspacios(eRes.value);
      if (tRes.status === 'fulfilled' && Array.isArray(tRes.value)) setTarifas(tRes.value);
      if (empRes.status === 'fulfilled' && Array.isArray(empRes.value)) setEmpleados(empRes.value);
      if (cRes.status === 'fulfilled' && Array.isArray(cRes.value)) setClientes(cRes.value);
      if (vRes.status === 'fulfilled' && Array.isArray(vRes.value)) setVehiculos(vRes.value);
      if (uRes.status === 'fulfilled' && Array.isArray(uRes.value)) setUsuarios(uRes.value);
      if (estRes.status === 'fulfilled' && Array.isArray(estRes.value)) setEstadosEspacio(estRes.value);
      if (mRes.status === 'fulfilled' && Array.isArray(mRes.value)) setMetodosPago(mRes.value);
      if (rRes.status === 'fulfilled' && Array.isArray(rRes.value)) setRoles(rRes.value);
      if (tvRes.status === 'fulfilled' && Array.isArray(tvRes.value)) setTiposVehiculo(tvRes.value);
      if (aRes.status === 'fulfilled' && Array.isArray(aRes.value)) setAuditLogs(aRes.value);
    } catch (err) {
      console.error(err);
      toast.error('Error al sincronizar catálogos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ==========================================
  // PREPARAR APERTURA DE MODAL DE CREACIÓN
  // ==========================================
  const handleOpenCreateModal = () => {
    // Resetear formulario correspondiente
    setCatNombre('');
    if (activeTab === 'sucursales') {
      setSucNombre('');
      setSucDireccion('');
      setSucTelefono('');
      setSucCapacidad(100);
    } else if (activeTab === 'niveles') {
      setNivNombre('');
      setNivSucursalId(sucursales[0]?.id || 1);
    } else if (activeTab === 'espacios') {
      setEspNivelId(niveles[0]?.id || 1);
      setEspEstadoId(1);
      setEspTipoVehiculoId(1);
      setEspEsTechado(true);
      setEspNumero(`P-${espacios.length + 1}`);
    } else if (activeTab === 'tarifas') {
      setTarTipoVehiculoId(1);
      setTarMontoHora(15.0);
      setTarMontoFraccion(5.0);
      setTarActivo(true);
    } else if (activeTab === 'empleados') {
      setEmpUsuarioId(usuarios[0]?.id || 1);
      setEmpNombres('');
      setEmpApellidos('');
      setEmpDpi('');
      setEmpTelefono('');
    } else if (activeTab === 'clientes') {
      setCliUsuarioId(usuarios[0]?.id || 1);
      setCliNit('CF');
      setCliNombre('');
      setCliTelefono('');
    } else if (activeTab === 'vehiculos') {
      setVehPlaca('');
      setVehMarca('');
      setVehColor('');
      setVehClienteId(clientes[0]?.id);
    } else if (activeTab === 'usuarios') {
      setUsrEmail('');
      setUsrNombre('');
      setUsrRolId(2);
      setUsrPassword('');
    } else if (activeTab === 'auditoria') {
      setAudAccion('CONFIG_UPDATE');
      setAudDetalles('');
    }
    setShowCreateModal(true);
  };

  // ==========================================
  // GUARDAR CREACIÓN (POST)
  // ==========================================
  const handleCreate = async (e: React.FormEvent) => {
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
      } else if (activeTab === 'niveles') {
        const nuevo = await api.niveles.create({
          sucursal_id: Number(nivSucursalId),
          nombre_nivel: nivNombre,
        });
        setNiveles((prev) => [...prev, nuevo]);
        toast.success('Nivel añadido con éxito');
      } else if (activeTab === 'espacios') {
        const nuevo = await api.espacios.create({
          nivel_id: Number(espNivelId),
          estado_id: Number(espEstadoId),
          tipo_vehiculo_id: Number(espTipoVehiculoId),
          es_techado: Boolean(espEsTechado),
          numero_identificador: espNumero,
        });
        setEspacios((prev) => [...prev, nuevo]);
        toast.success('Espacio creado exitosamente');
      } else if (activeTab === 'tarifas') {
        const nueva = await api.tarifas.create({
          tipo_vehiculo_id: Number(tarTipoVehiculoId),
          monto_por_hora: Number(tarMontoHora),
          monto_fraccion: Number(tarMontoFraccion),
          estado_activo: tarActivo,
        });
        setTarifas((prev) => [...prev, nueva]);
        toast.success('Tarifa creada con éxito');
      } else if (activeTab === 'empleados') {
        const nuevo = await api.empleados.create({
          usuario_id: Number(empUsuarioId),
          nombres: empNombres,
          apellidos: empApellidos,
          dpi: empDpi,
          telefono: empTelefono,
        });
        setEmpleados((prev) => [...prev, nuevo]);
        toast.success('Empleado registrado exitosamente');
      } else if (activeTab === 'clientes') {
        const nuevo = await api.clientes.create({
          usuario_id: Number(cliUsuarioId),
          nit_facturacion: cliNit.trim() || 'CF',
          nombre_facturacion: cliNombre.trim(),
          telefono: cliTelefono.trim(),
        });
        setClientes((prev) => [...prev, nuevo]);
        toast.success('Cliente registrado exitosamente');
      } else if (activeTab === 'vehiculos') {
        const nuevo = await api.vehiculos.create({
          placa: vehPlaca.trim().toUpperCase(),
          marca: vehMarca.trim(),
          color: vehColor.trim(),
          cliente_id: vehClienteId ? Number(vehClienteId) : undefined,
        });
        setVehiculos((prev) => [...prev, nuevo]);
        toast.success('Vehículo registrado exitosamente');
      } else if (activeTab === 'usuarios') {
        const nuevo = await api.usuarios.create({
          email: usrEmail.trim().toLowerCase(),
          nombre: usrNombre.trim(),
          rol_id: Number(usrRolId),
          password: usrPassword,
        });
        setUsuarios((prev) => [...prev, nuevo]);
        toast.success('Usuario creado exitosamente');
      } else if (activeTab === 'catalogos') {
        if (subTab === 'estados') {
          const nuevo = await api.estadosEspacio.create({ nombre: catNombre.trim() });
          setEstadosEspacio((prev) => [...prev, nuevo]);
          toast.success('Estado de espacio agregado');
        } else if (subTab === 'metodos') {
          const nuevo = await api.metodosPago.create({ nombre: catNombre.trim() });
          setMetodosPago((prev) => [...prev, nuevo]);
          toast.success('Método de pago agregado');
        } else if (subTab === 'roles') {
          const nuevo = await api.roles.create({ nombre: catNombre.trim() });
          setRoles((prev) => [...prev, nuevo]);
          toast.success('Rol agregado');
        } else if (subTab === 'tipos') {
          const nuevo = await api.tiposVehiculo.create({ nombre: catNombre.trim() });
          setTiposVehiculo((prev) => [...prev, nuevo]);
          toast.success('Tipo de vehículo agregado');
        }
      } else if (activeTab === 'auditoria') {
        const userId = getCurrentUser()?.id || (usuarios.length > 0 ? usuarios[0].id : 1);
        const nuevo = await api.auditLogs.create({
          usuario_id: userId,
          accion: audAccion.trim(),
          detalles: audDetalles.trim(),
        });
        setAuditLogs((prev) => [nuevo, ...prev]);
        toast.success('Entrada de auditoría creada');
      }
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // PREPARAR APERTURA DE MODAL DE EDICIÓN (PUT)
  // ==========================================
  const handleOpenEditModal = (item: any) => {
    setSelectedItem(item);
    if (activeTab === 'sucursales') {
      setSucNombre(item.nombre || '');
      setSucDireccion(item.direccion || '');
      setSucTelefono(item.telefono_contacto || '');
      setSucCapacidad(item.capacidad_maxima || 50);
    } else if (activeTab === 'niveles') {
      setNivNombre(item.nombre_nivel || '');
      setNivSucursalId(item.sucursal_id || 1);
    } else if (activeTab === 'espacios') {
      setEspNivelId(item.nivel_id || 1);
      setEspEstadoId(item.estado_id || 1);
      setEspTipoVehiculoId(item.tipo_vehiculo_id || 1);
      setEspEsTechado(item.es_techado ?? true);
    } else if (activeTab === 'tarifas') {
      setTarTipoVehiculoId(item.tipo_vehiculo_id || 1);
      setTarMontoHora(item.monto_por_hora || 15);
      setTarMontoFraccion(item.monto_fraccion || 5);
      setTarActivo(item.estado_activo ?? true);
    } else if (activeTab === 'empleados') {
      setEmpNombres(item.nombres || '');
      setEmpApellidos(item.apellidos || '');
      setEmpDpi(item.dpi || '');
      setEmpTelefono(item.telefono || '');
    } else if (activeTab === 'clientes') {
      setCliNit(item.nit_facturacion || 'CF');
      setCliNombre(item.nombre_facturacion || '');
      setCliTelefono(item.telefono || '');
    } else if (activeTab === 'vehiculos') {
      setVehPlaca(item.placa || '');
      setVehMarca(item.marca || '');
      setVehColor(item.color || '');
      setVehClienteId(item.cliente_id);
    } else if (activeTab === 'usuarios') {
      setUsrEmail(item.email || '');
      setUsrNombre(item.nombre || '');
      setUsrRolId(item.rol_id || 2);
      setUsrPassword('');
    } else if (activeTab === 'catalogos') {
      setCatNombre(item.nombre || '');
    } else if (activeTab === 'auditoria') {
      setAudAccion(item.accion || '');
      setAudDetalles(item.detalles || '');
    }
    setShowEditModal(true);
  };

  // ==========================================
  // EJECUTAR EDICIÓN (PUT)
  // ==========================================
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSaving(true);
    try {
      if (activeTab === 'sucursales') {
        const updated = await api.sucursales.update(selectedItem.id, {
          nombre: sucNombre,
          direccion: sucDireccion,
          telefono_contacto: sucTelefono,
          capacidad_maxima: Number(sucCapacidad),
        });
        setSucursales((prev) => prev.map((s) => (s.id === selectedItem.id ? updated : s)));
        toast.success(`Sucursal #${selectedItem.id} actualizada`);
      } else if (activeTab === 'niveles') {
        const updated = await api.niveles.update(selectedItem.id, {
          sucursal_id: Number(nivSucursalId),
          nombre_nivel: nivNombre,
        });
        setNiveles((prev) => prev.map((n) => (n.id === selectedItem.id ? updated : n)));
        toast.success(`Nivel #${selectedItem.id} actualizado`);
      } else if (activeTab === 'espacios') {
        const updated = await api.espacios.update(selectedItem.id, {
          nivel_id: Number(espNivelId),
          estado_id: Number(espEstadoId),
          tipo_vehiculo_id: Number(espTipoVehiculoId),
          es_techado: Boolean(espEsTechado),
        });
        setEspacios((prev) => prev.map((esp) => (esp.id === selectedItem.id ? updated : esp)));
        toast.success(`Espacio #${selectedItem.id} actualizado`);
      } else if (activeTab === 'tarifas') {
        const updated = await api.tarifas.update(selectedItem.id, {
          tipo_vehiculo_id: Number(tarTipoVehiculoId),
          monto_por_hora: Number(tarMontoHora),
          monto_fraccion: Number(tarMontoFraccion),
          estado_activo: Boolean(tarActivo),
        });
        setTarifas((prev) => prev.map((t) => (t.id === selectedItem.id ? updated : t)));
        toast.success(`Tarifa #${selectedItem.id} actualizada`);
      } else if (activeTab === 'empleados') {
        const targetUserId = selectedItem.usuario_id || selectedItem.id;
        const updated = await api.empleados.update(targetUserId, {
          nombres: empNombres,
          apellidos: empApellidos,
          dpi: empDpi,
          telefono: empTelefono,
        });
        setEmpleados((prev) =>
          prev.map((emp) =>
            emp.usuario_id === targetUserId || emp.id === selectedItem.id ? updated : emp
          )
        );
        toast.success(`Empleado actualizado exitosamente`);
      } else if (activeTab === 'clientes') {
        const targetUserId = selectedItem.usuario_id || selectedItem.id;
        const updated = await api.clientes.update(targetUserId, {
          nit_facturacion: cliNit.trim() || 'CF',
          nombre_facturacion: cliNombre.trim(),
          telefono: cliTelefono.trim(),
        });
        setClientes((prev) =>
          prev.map((c) =>
            c.usuario_id === targetUserId || c.id === selectedItem.id ? updated : c
          )
        );
        toast.success(`Cliente actualizado exitosamente`);
      } else if (activeTab === 'vehiculos') {
        const updated = await api.vehiculos.update(selectedItem.placa, {
          marca: vehMarca.trim(),
          color: vehColor.trim(),
          cliente_id: vehClienteId ? Number(vehClienteId) : undefined,
        });
        setVehiculos((prev) =>
          prev.map((v) => (v.placa === selectedItem.placa ? updated : v))
        );
        toast.success(`Vehículo ${selectedItem.placa} actualizado`);
      } else if (activeTab === 'usuarios') {
        const targetIdOrEmail = selectedItem.id || selectedItem.email;
        const updated = await api.usuarios.update(targetIdOrEmail, {
          email: usrEmail.trim().toLowerCase(),
          rol_id: Number(usrRolId),
          password_hash: usrPassword ? usrPassword : undefined,
        });
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === selectedItem.id || u.email === selectedItem.email ? updated : u
          )
        );
        toast.success(`Usuario ${selectedItem.email} actualizado`);
      } else if (activeTab === 'catalogos') {
        if (subTab === 'estados') {
          const updated = await api.estadosEspacio.update(selectedItem.id, {
            nombre: catNombre.trim(),
          });
          setEstadosEspacio((prev) =>
            prev.map((est) => (est.id === selectedItem.id ? updated : est))
          );
          toast.success(`Estado #${selectedItem.id} actualizado`);
        } else if (subTab === 'metodos') {
          const updated = await api.metodosPago.update(selectedItem.id, {
            nombre: catNombre.trim(),
          });
          setMetodosPago((prev) =>
            prev.map((m) => (m.id === selectedItem.id ? updated : m))
          );
          toast.success(`Método de pago #${selectedItem.id} actualizado`);
        } else if (subTab === 'roles') {
          const updated = await api.roles.update(selectedItem.id, {
            nombre: catNombre.trim(),
          });
          setRoles((prev) => prev.map((r) => (r.id === selectedItem.id ? updated : r)));
          toast.success(`Rol #${selectedItem.id} actualizado`);
        } else if (subTab === 'tipos') {
          const updated = await api.tiposVehiculo.update(selectedItem.id, {
            nombre: catNombre.trim(),
          });
          setTiposVehiculo((prev) =>
            prev.map((tv) => (tv.id === selectedItem.id ? updated : tv))
          );
          toast.success(`Tipo de vehículo #${selectedItem.id} actualizado`);
        }
      } else if (activeTab === 'auditoria') {
        const updated = await api.auditLogs.update(selectedItem.id, {
          accion: audAccion.trim(),
          detalles: audDetalles.trim(),
        });
        setAuditLogs((prev) =>
          prev.map((a) => (a.id === selectedItem.id ? updated : a))
        );
        toast.success(`Registro de auditoría #${selectedItem.id} actualizado`);
      }
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar registro');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // PREPARAR APERTURA DE MODAL DE ELIMINACIÓN (DELETE)
  // ==========================================
  const handleOpenDeleteModal = (item: any) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // ==========================================
  // EJECUTAR ELIMINACIÓN (DELETE)
  // ==========================================
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      if (activeTab === 'sucursales') {
        await api.sucursales.delete(selectedItem.id);
        setSucursales((prev) => prev.filter((s) => s.id !== selectedItem.id));
        toast.success(`Sucursal #${selectedItem.id} eliminada exitosamente`);
      } else if (activeTab === 'niveles') {
        await api.niveles.delete(selectedItem.id);
        setNiveles((prev) => prev.filter((n) => n.id !== selectedItem.id));
        toast.success(`Nivel #${selectedItem.id} eliminado exitosamente`);
      } else if (activeTab === 'espacios') {
        await api.espacios.delete(selectedItem.id);
        setEspacios((prev) => prev.filter((e) => e.id !== selectedItem.id));
        toast.success(`Espacio #${selectedItem.id} eliminado exitosamente`);
      } else if (activeTab === 'tarifas') {
        const targetTipoId = selectedItem.tipo_vehiculo_id || selectedItem.id;
        await api.tarifas.delete(targetTipoId);
        setTarifas((prev) => prev.filter((t) => t.id !== selectedItem.id));
        toast.success(`Tarifa eliminada exitosamente`);
      } else if (activeTab === 'empleados') {
        const targetUserId = selectedItem.usuario_id || selectedItem.id;
        await api.empleados.delete(targetUserId);
        setEmpleados((prev) =>
          prev.filter((e) => e.usuario_id !== targetUserId && e.id !== selectedItem.id)
        );
        toast.success(`Empleado eliminado exitosamente`);
      } else if (activeTab === 'clientes') {
        const targetUserId = selectedItem.usuario_id || selectedItem.id;
        await api.clientes.delete(targetUserId);
        setClientes((prev) =>
          prev.filter((c) => c.usuario_id !== targetUserId && c.id !== selectedItem.id)
        );
        toast.success(`Cliente eliminado exitosamente`);
      } else if (activeTab === 'vehiculos') {
        await api.vehiculos.delete(selectedItem.placa);
        setVehiculos((prev) => prev.filter((v) => v.placa !== selectedItem.placa));
        toast.success(`Vehículo ${selectedItem.placa} eliminado exitosamente`);
      } else if (activeTab === 'usuarios') {
        await api.usuarios.delete(selectedItem.email);
        setUsuarios((prev) => prev.filter((u) => u.email !== selectedItem.email));
        toast.success(`Usuario ${selectedItem.email} eliminado exitosamente`);
      } else if (activeTab === 'catalogos') {
        if (subTab === 'estados') {
          await api.estadosEspacio.delete(selectedItem.id);
          setEstadosEspacio((prev) => prev.filter((est) => est.id !== selectedItem.id));
          toast.success(`Estado de espacio eliminado`);
        } else if (subTab === 'metodos') {
          await api.metodosPago.delete(selectedItem.id);
          setMetodosPago((prev) => prev.filter((m) => m.id !== selectedItem.id));
          toast.success(`Método de pago eliminado`);
        } else if (subTab === 'roles') {
          await api.roles.delete(selectedItem.id);
          setRoles((prev) => prev.filter((r) => r.id !== selectedItem.id));
          toast.success(`Rol eliminado`);
        } else if (subTab === 'tipos') {
          await api.tiposVehiculo.delete(selectedItem.id);
          setTiposVehiculo((prev) => prev.filter((tv) => tv.id !== selectedItem.id));
          toast.success(`Tipo de vehículo eliminado`);
        }
      } else if (activeTab === 'auditoria') {
        const targetUserId = selectedItem.usuario_id || 1;
        await api.auditLogs.delete(targetUserId);
        setAuditLogs((prev) => prev.filter((a) => a.usuario_id !== targetUserId));
        toast.success(`Registros de auditoría del usuario #${targetUserId} eliminados`);
      }
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar registro');
    } finally {
      setDeleting(false);
    }
  };

  // Helper para el nombre del ítem en ConfirmDeleteModal
  const getSelectedItemLabel = (): string => {
    if (!selectedItem) return '';
    if (activeTab === 'sucursales') return `Sucursal: ${selectedItem.nombre} (#${selectedItem.id})`;
    if (activeTab === 'niveles') return `Nivel: ${selectedItem.nombre_nivel} (#${selectedItem.id})`;
    if (activeTab === 'espacios') return `Cajón: ${selectedItem.numero_identificador || `#${selectedItem.id}`}`;
    if (activeTab === 'tarifas') return `Tarifa #${selectedItem.id} (Tipo: ${selectedItem.tipo_vehiculo_id})`;
    if (activeTab === 'empleados') return `Empleado: ${selectedItem.nombres} ${selectedItem.apellidos} (DPI: ${selectedItem.dpi})`;
    if (activeTab === 'clientes') return `Cliente: ${selectedItem.nombre_facturacion || selectedItem.id} (NIT: ${selectedItem.nit_facturacion || 'CF'})`;
    if (activeTab === 'vehiculos') return `Vehículo: Placa ${selectedItem.placa} (${selectedItem.marca})`;
    if (activeTab === 'usuarios') return `Usuario: ${selectedItem.email} (${selectedItem.nombre || 'Sin nombre'})`;
    if (activeTab === 'catalogos') return `${subTab.toUpperCase()}: ${selectedItem.nombre} (#${selectedItem.id})`;
    if (activeTab === 'auditoria') return `Auditoría: ${selectedItem.accion} (#${selectedItem.id})`;
    return `#${selectedItem.id}`;
  };

  return (
    <AppLayout
      title="Catálogos y Administración del Sistema"
      subtitle="Mantenimiento integral (CRUD) de todas las entidades, sedes, catálogos y parámetros del parqueo"
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
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>
              {activeTab === 'sucursales' && 'Nueva Sucursal'}
              {activeTab === 'niveles' && 'Nuevo Nivel'}
              {activeTab === 'espacios' && 'Nuevo Espacio'}
              {activeTab === 'tarifas' && 'Nueva Tarifa'}
              {activeTab === 'empleados' && 'Nuevo Empleado'}
              {activeTab === 'clientes' && 'Nuevo Cliente'}
              {activeTab === 'vehiculos' && 'Nuevo Vehículo'}
              {activeTab === 'usuarios' && 'Nuevo Usuario'}
              {activeTab === 'catalogos' && 'Nuevo Elemento'}
              {activeTab === 'auditoria' && 'Nuevo Log'}
            </span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* BARRA DE PESTAÑAS (TABS) PRINCIPALES */}
        <div className="flex rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('sucursales')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'sucursales'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Sucursales ({sucursales.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('niveles')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'niveles'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Niveles ({niveles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('espacios')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'espacios'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Warehouse className="h-4 w-4" />
            <span>Espacios ({espacios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tarifas')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'tarifas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Tarifas ({tarifas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('empleados')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'empleados'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Empleados ({empleados.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'clientes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Clientes ({clientes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vehiculos')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'vehiculos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Car className="h-4 w-4" />
            <span>Vehículos ({vehiculos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'usuarios'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <IdCard className="h-4 w-4" />
            <span>Usuarios ({usuarios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catalogos')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'catalogos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Catálogos Auxiliares</span>
          </button>

          <button
            onClick={() => setActiveTab('auditoria')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'auditoria'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Auditoría ({auditLogs.length})</span>
          </button>
        </div>

        {/* 1. SUCURSALES */}
        {activeTab === 'sucursales' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sucursales.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold border border-blue-100">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{s.nombre}</h3>
                        <span className="text-[10px] font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          ID #{s.id}
                        </span>
                      </div>
                    </div>
                    {/* Botones Acción */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        title="Editar Sucursal (PUT)"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(s)}
                        title="Eliminar Sucursal (DELETE)"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                      <span>{s.direccion || 'Sin dirección registrada'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{s.telefono_contacto || 'PBX: 2411-1800'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-400 font-medium">Capacidad:</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {s.capacidad_maxima} vehículos
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. NIVELES DE PARQUEO */}
        {activeTab === 'niveles' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Nombre del Nivel</th>
                  <th className="py-3.5 px-5">Sucursal Asociada</th>
                  <th className="py-3.5 px-5 text-center">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {niveles.map((n) => {
                  const suc = sucursales.find((s) => s.id === n.sucursal_id);
                  return (
                    <tr key={n.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-400">#{n.id}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900 text-sm">
                        {n.nombre_nivel}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {suc?.nombre || `Sucursal ID #${n.sucursal_id}`}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          Habilitado
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(n)}
                            title="Editar Nivel (PUT)"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(n)}
                            title="Eliminar Nivel (DELETE)"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. ESPACIOS DE PARQUEO */}
        {activeTab === 'espacios' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">ID / Código</th>
                  <th className="py-3.5 px-5">Nivel</th>
                  <th className="py-3.5 px-5">Tipo Vehículo</th>
                  <th className="py-3.5 px-5">Cubierta</th>
                  <th className="py-3.5 px-5 text-center">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {espacios.map((esp) => {
                  const niv = niveles.find((n) => n.id === esp.nivel_id);
                  return (
                    <tr key={esp.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {esp.numero_identificador || `#${esp.id}`}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {niv?.nombre_nivel || `Nivel ID #${esp.nivel_id}`}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-700">
                        {esp.tipo_vehiculo_id === 2 ? 'Motocicleta' : 'Automóvil'}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {esp.es_techado ? (
                          <span className="flex items-center gap-1 font-medium text-blue-700">
                            <Warehouse className="h-3.5 w-3.5 text-blue-500" /> Techado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-medium text-amber-700">
                            <Sun className="h-3.5 w-3.5 text-amber-500" /> Exterior
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            esp.estado_id === 1
                              ? 'bg-emerald-100 text-emerald-800'
                              : esp.estado_id === 2
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {esp.estado_id === 1 ? 'Disponible' : esp.estado_id === 2 ? 'Ocupado' : 'Otro'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(esp)}
                            title="Editar Espacio (PUT)"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(esp)}
                            title="Eliminar Espacio (DELETE)"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. TARIFAS */}
        {activeTab === 'tarifas' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {tarifas.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        title="Editar Tarifa (PUT)"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(t)}
                        title="Eliminar Tarifa (DELETE)"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-500">Monto por Hora:</span>
                      <span className="text-xl font-extrabold text-blue-700 font-mono">
                        Q{Number(t.monto_por_hora).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-500">Monto Fracción:</span>
                      <span className="text-sm font-bold text-slate-700 font-mono">
                        Q{Number(t.monto_fraccion).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estado:</span>
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
              </div>
            ))}
          </div>
        )}

        {/* 5. EMPLEADOS */}
        {activeTab === 'empleados' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Empleado</th>
                  <th className="py-3.5 px-5">DPI</th>
                  <th className="py-3.5 px-5">Teléfono</th>
                  <th className="py-3.5 px-5">Puesto Asignado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empleados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold">
                          {emp.nombres?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {emp.nombres} {emp.apellidos}
                          </p>
                          <p className="text-[10px] text-slate-400">ID #{emp.id} &bull; Usuario #{emp.usuario_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-700">{emp.dpi}</td>
                    <td className="py-3.5 px-5 text-slate-600">{emp.telefono}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">
                      Operador de Garita &bull; Caja
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          title="Editar Empleado (PUT)"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(emp)}
                          title="Eliminar Empleado (DELETE)"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. CLIENTES */}
        {activeTab === 'clientes' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">ID / Usuario</th>
                  <th className="py-3.5 px-5">Nombre / Razón Social</th>
                  <th className="py-3.5 px-5">NIT Facturación</th>
                  <th className="py-3.5 px-5">Teléfono</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5 font-mono text-slate-400">
                      #{c.id} (User: {c.usuario_id})
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 text-sm">
                      {c.nombre_facturacion || 'Sin nombre'}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-700">
                      {c.nit_facturacion || 'CF'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{c.telefono || 'N/A'}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          title="Editar Cliente (PUT)"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(c)}
                          title="Eliminar Cliente (DELETE)"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. VEHÍCULOS */}
        {activeTab === 'vehiculos' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Placa</th>
                  <th className="py-3.5 px-5">Marca / Modelo</th>
                  <th className="py-3.5 px-5">Color</th>
                  <th className="py-3.5 px-5">Cliente Titular</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehiculos.map((v) => {
                  const cli = clientes.find((c) => c.id === v.cliente_id);
                  return (
                    <tr key={v.placa} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-black text-amber-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-xs">
                          {v.placa}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">{v.marca || 'Genérica'}</td>
                      <td className="py-3.5 px-5 text-slate-600">{v.color || 'N/A'}</td>
                      <td className="py-3.5 px-5 text-slate-700">
                        {cli ? cli.nombre_facturacion : v.cliente_id ? `ID #${v.cliente_id}` : 'Particular / Ocasional'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(v)}
                            title="Editar Vehículo (PUT)"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(v)}
                            title="Eliminar Vehículo (DELETE)"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 8. USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Correo Electrónico</th>
                  <th className="py-3.5 px-5">Nombre Completo</th>
                  <th className="py-3.5 px-5">Rol Asignado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => {
                  const rol = roles.find((r) => r.id === u.rol_id);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5 font-mono text-slate-400">#{u.id}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">{u.email}</td>
                      <td className="py-3.5 px-5 text-slate-700">{u.nombre || 'Sin nombre'}</td>
                      <td className="py-3.5 px-5">
                        <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold">
                          {rol?.nombre || `Rol #${u.rol_id}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Editar Usuario (PUT)"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(u)}
                            title="Eliminar Usuario (DELETE)"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 9. CATÁLOGOS AUXILIARES */}
        {activeTab === 'catalogos' && (
          <div className="space-y-4">
            {/* Sub-Tabs de Catálogos */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setSubTab('estados')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  subTab === 'estados'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Estados de Espacio ({estadosEspacio.length})
              </button>
              <button
                onClick={() => setSubTab('metodos')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  subTab === 'metodos'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Métodos de Pago ({metodosPago.length})
              </button>
              <button
                onClick={() => setSubTab('roles')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  subTab === 'roles'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Roles de Acceso ({roles.length})
              </button>
              <button
                onClick={() => setSubTab('tipos')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  subTab === 'tipos'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tipos de Vehículo ({tiposVehiculo.length})
              </button>
            </div>

            {/* Tabla del Catálogo Seleccionado */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-5">ID</th>
                    <th className="py-3 px-5">Nombre / Descripción</th>
                    <th className="py-3 px-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(subTab === 'estados'
                    ? estadosEspacio
                    : subTab === 'metodos'
                    ? metodosPago
                    : subTab === 'roles'
                    ? roles
                    : tiposVehiculo
                  ).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5 font-mono text-slate-400">#{item.id}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900 text-sm">{item.nombre}</td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Editar Elemento (PUT)"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(item)}
                            title="Eliminar Elemento (DELETE)"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. BITÁCORA / AUDITORÍA */}
        {activeTab === 'auditoria' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Usuario ID</th>
                  <th className="py-3.5 px-5">Acción Registrada</th>
                  <th className="py-3.5 px-5">Detalles</th>
                  <th className="py-3.5 px-5">Fecha / Hora</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5 font-mono text-slate-400">#{log.id}</td>
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-700">
                      User #{log.usuario_id}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase text-slate-800 font-mono">
                        {log.accion}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 max-w-xs truncate">{log.detalles}</td>
                    <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                      {log.created_at ? new Date(log.created_at).toLocaleString('es-GT') : 'Reciente'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(log)}
                          title="Editar Log (PUT)"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(log)}
                          title="Eliminar Logs de Usuario (DELETE)"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CREACIÓN (POST) */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Nuevo Registro: {activeTab.toUpperCase()}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              {activeTab === 'sucursales' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Nombre</label>
                    <input
                      type="text"
                      required
                      value={sucNombre}
                      onChange={(e) => setSucNombre(e.target.value)}
                      placeholder="Campus Central UMES"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Dirección</label>
                    <input
                      type="text"
                      required
                      value={sucDireccion}
                      onChange={(e) => setSucDireccion(e.target.value)}
                      placeholder="Zona 10"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Teléfono</label>
                    <input
                      type="text"
                      value={sucTelefono}
                      onChange={(e) => setSucTelefono(e.target.value)}
                      placeholder="2411-1800"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Capacidad Máxima</label>
                    <input
                      type="number"
                      required
                      value={sucCapacidad}
                      onChange={(e) => setSucCapacidad(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'niveles' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Sucursal</label>
                    <select
                      value={nivSucursalId}
                      onChange={(e) => setNivSucursalId(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
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
                      placeholder="Sótano 1"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'espacios' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Nivel</label>
                    <select
                      value={espNivelId}
                      onChange={(e) => setEspNivelId(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    >
                      {niveles.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.nombre_nivel}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Identificador</label>
                    <input
                      type="text"
                      required
                      value={espNumero}
                      onChange={(e) => setEspNumero(e.target.value)}
                      placeholder="A-10"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="esp_techado_create"
                      checked={espEsTechado}
                      onChange={(e) => setEspEsTechado(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <label htmlFor="esp_techado_create" className="font-semibold text-slate-700">
                      Espacio Techado
                    </label>
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
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
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
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Monto Fracción (Q)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={tarMontoFraccion}
                      onChange={(e) => setTarMontoFraccion(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
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
                        className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 uppercase">Apellidos</label>
                      <input
                        type="text"
                        required
                        value={empApellidos}
                        onChange={(e) => setEmpApellidos(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">DPI</label>
                    <input
                      type="text"
                      required
                      value={empDpi}
                      onChange={(e) => setEmpDpi(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Teléfono</label>
                    <input
                      type="text"
                      value={empTelefono}
                      onChange={(e) => setEmpTelefono(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'clientes' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Nombre / Razón Social</label>
                    <input
                      type="text"
                      required
                      value={cliNombre}
                      onChange={(e) => setCliNombre(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">NIT Facturación</label>
                    <input
                      type="text"
                      value={cliNit}
                      onChange={(e) => setCliNit(e.target.value.toUpperCase())}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Teléfono</label>
                    <input
                      type="text"
                      value={cliTelefono}
                      onChange={(e) => setCliTelefono(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'vehiculos' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Placa</label>
                    <input
                      type="text"
                      required
                      value={vehPlaca}
                      onChange={(e) => setVehPlaca(e.target.value.toUpperCase())}
                      placeholder="P123ABC"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Marca / Modelo</label>
                    <input
                      type="text"
                      required
                      value={vehMarca}
                      onChange={(e) => setVehMarca(e.target.value)}
                      placeholder="Toyota Corolla"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Color</label>
                    <input
                      type="text"
                      required
                      value={vehColor}
                      onChange={(e) => setVehColor(e.target.value)}
                      placeholder="Gris"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'usuarios' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={usrEmail}
                      onChange={(e) => setUsrEmail(e.target.value)}
                      placeholder="operador@parqueo.com"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Nombre</label>
                    <input
                      type="text"
                      value={usrNombre}
                      onChange={(e) => setUsrNombre(e.target.value)}
                      placeholder="Nombre del usuario"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Rol</label>
                    <select
                      value={usrRolId}
                      onChange={(e) => setUsrRolId(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Contraseña</label>
                    <input
                      type="password"
                      required
                      value={usrPassword}
                      onChange={(e) => setUsrPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'catalogos' && (
                <div>
                  <label className="font-semibold text-slate-600 uppercase">Nombre / Descripción</label>
                  <input
                    type="text"
                    required
                    value={catNombre}
                    onChange={(e) => setCatNombre(e.target.value)}
                    placeholder="Descripción del elemento"
                    className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                  />
                </div>
              )}

              {activeTab === 'auditoria' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Acción</label>
                    <input
                      type="text"
                      required
                      value={audAccion}
                      onChange={(e) => setAudAccion(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Detalles</label>
                    <textarea
                      required
                      rows={3}
                      value={audDetalles}
                      onChange={(e) => setAudDetalles(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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

      {/* ========================================================================= */}
      {/* MODAL DE EDICIÓN (PUT) */}
      {/* ========================================================================= */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-600" />
                Editar: {activeTab.toUpperCase()} #{selectedItem.id || selectedItem.placa || selectedItem.email}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4 text-xs">
              {activeTab === 'sucursales' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Nombre</label>
                    <input
                      type="text"
                      required
                      value={sucNombre}
                      onChange={(e) => setSucNombre(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Dirección</label>
                    <input
                      type="text"
                      required
                      value={sucDireccion}
                      onChange={(e) => setSucDireccion(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Teléfono</label>
                    <input
                      type="text"
                      value={sucTelefono}
                      onChange={(e) => setSucTelefono(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Capacidad Máxima</label>
                    <input
                      type="number"
                      required
                      value={sucCapacidad}
                      onChange={(e) => setSucCapacidad(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'niveles' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Sucursal</label>
                    <select
                      value={nivSucursalId}
                      onChange={(e) => setNivSucursalId(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
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
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'espacios' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Nivel</label>
                    <select
                      value={espNivelId}
                      onChange={(e) => setEspNivelId(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    >
                      {niveles.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.nombre_nivel}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Estado</label>
                    <select
                      value={espEstadoId}
                      onChange={(e) => setEspEstadoId(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    >
                      <option value={1}>Disponible</option>
                      <option value={2}>Ocupado</option>
                      <option value={3}>Reservado</option>
                      <option value={4}>Mantenimiento</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Tipo Vehículo</label>
                    <select
                      value={espTipoVehiculoId}
                      onChange={(e) => setEspTipoVehiculoId(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    >
                      <option value={1}>Sedán / Automóvil</option>
                      <option value={2}>Motocicleta</option>
                      <option value={3}>Camioneta / SUV</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="esp_techado_edit"
                      checked={espEsTechado}
                      onChange={(e) => setEspEsTechado(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <label htmlFor="esp_techado_edit" className="font-semibold text-slate-700">
                      Espacio Techado
                    </label>
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
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
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
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Monto Fracción (Q)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={tarMontoFraccion}
                      onChange={(e) => setTarMontoFraccion(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="tar_activo_edit"
                      checked={tarActivo}
                      onChange={(e) => setTarActivo(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <label htmlFor="tar_activo_edit" className="font-semibold text-slate-700">
                      Tarifa Habilitada / Activa
                    </label>
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
                        className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 uppercase">Apellidos</label>
                      <input
                        type="text"
                        required
                        value={empApellidos}
                        onChange={(e) => setEmpApellidos(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">DPI</label>
                    <input
                      type="text"
                      required
                      value={empDpi}
                      onChange={(e) => setEmpDpi(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Teléfono</label>
                    <input
                      type="text"
                      value={empTelefono}
                      onChange={(e) => setEmpTelefono(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'clientes' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Nombre / Razón Social</label>
                    <input
                      type="text"
                      required
                      value={cliNombre}
                      onChange={(e) => setCliNombre(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">NIT Facturación</label>
                    <input
                      type="text"
                      value={cliNit}
                      onChange={(e) => setCliNit(e.target.value.toUpperCase())}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Teléfono</label>
                    <input
                      type="text"
                      value={cliTelefono}
                      onChange={(e) => setCliTelefono(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'vehiculos' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Placa (Solo Lectura)</label>
                    <input
                      type="text"
                      disabled
                      value={selectedItem.placa}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3 font-mono font-bold text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Marca / Modelo</label>
                    <input
                      type="text"
                      required
                      value={vehMarca}
                      onChange={(e) => setVehMarca(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Color</label>
                    <input
                      type="text"
                      required
                      value={vehColor}
                      onChange={(e) => setVehColor(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'usuarios' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={usrEmail}
                      onChange={(e) => setUsrEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Rol</label>
                    <select
                      value={usrRolId}
                      onChange={(e) => setUsrRolId(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Nueva Contraseña (Opcional)</label>
                    <input
                      type="password"
                      value={usrPassword}
                      onChange={(e) => setUsrPassword(e.target.value)}
                      placeholder="Dejar vacío para conservar la actual"
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              {activeTab === 'catalogos' && (
                <div>
                  <label className="font-semibold text-slate-600 uppercase">Nombre / Descripción</label>
                  <input
                    type="text"
                    required
                    value={catNombre}
                    onChange={(e) => setCatNombre(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                  />
                </div>
              )}

              {activeTab === 'auditoria' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Acción</label>
                    <input
                      type="text"
                      required
                      value={audAccion}
                      onChange={(e) => setAudAccion(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 uppercase">Detalles</label>
                    <textarea
                      required
                      rows={3}
                      value={audDetalles}
                      onChange={(e) => setAudDetalles(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3"
                    />
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN (DELETE) */}
      {/* ========================================================================= */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title={`¿Eliminar de ${activeTab.toUpperCase()}?`}
        message={`¿Estás seguro de que deseas eliminar este registro permanentemente? Esta acción ejecutará la petición DELETE correspondiente en la API.`}
        itemName={getSelectedItemLabel()}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
      />
    </AppLayout>
  );
}
