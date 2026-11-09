'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldAlert,
  CreditCard,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
  Car,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Radio,
} from 'lucide-react';
import { api, getToken, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AppLayout({
  children,
  title,
  subtitle,
  actions,
}: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    const user = getCurrentUser();
    setCurrentUser(user || { nombre: 'Administrador', email: 'admin@umes.edu.gt' });
  }, [router]);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Métricas y mapa interactivo',
    },
    {
      name: 'Garita (Entrada)',
      href: '/garita',
      icon: Car,
      description: 'Ingreso y emisión de tickets',
    },
    {
      name: 'Caja (Salida/Cobro)',
      href: '/caja',
      icon: CreditCard,
      description: 'Tarifación y pagos FEL',
    },
    {
      name: 'Pensiones',
      href: '/pensiones',
      icon: CalendarDays,
      description: 'Abonados y mensualidades',
    },
    {
      name: 'Configuración',
      href: '/configuracion',
      icon: Settings,
      description: 'Sucursales, tarifas y niveles',
    },
  ];

  const handleLogout = () => {
    toast.info('Sesión cerrada correctamente');
    api.auth.logout();
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      {/* Sidebar Móvil Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Principal */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-lg">
                  PARQUEOS
                </span>
                <span className="text-xs font-black uppercase tracking-wider bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                  UMES
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Control & Facturación
              </p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="font-medium text-slate-300">
              API Backend Conectada
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-5 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Módulos del Sistema
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span
                    className={`text-[11px] leading-tight ${
                      isActive ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Card */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-800/70 p-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                <User className="h-4 w-4" />
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-semibold text-white">
                  {currentUser?.nombre || 'Administrador'}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {currentUser?.email || 'admin@umes.edu.gt'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {title || 'Sistema de Parqueos UMES'}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-4 text-xs text-slate-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Render API v1.0</span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

