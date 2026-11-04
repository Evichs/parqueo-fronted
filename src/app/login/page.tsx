'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pestaña activa ('login' | 'registro')
  const [vista, setVista] = useState<'login' | 'registro'>('login');

  // Estado de alerta
  const [alerta, setAlerta] = useState<{
    mensaje: string;
    tipo: 'exito' | 'error';
  } | null>(null);

  // Formulario Login
  const [loginCorreo, setLoginCorreo] = useState('admin@parqueo.com');
  const [loginPassword, setLoginPassword] = useState('Admin123');
  const [cargandoLogin, setCargandoLogin] = useState(false);

  // Formulario Registro
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regUsuario, setRegUsuario] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [cargandoRegistro, setCargandoRegistro] = useState(false);

  // Transferencia de sesión si viene con query params desde Vercel
  useEffect(() => {
    const urlCorreo = searchParams.get('correo') || searchParams.get('email');
    if (urlCorreo) {
      api.auth.loginDemo(urlCorreo);
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  // Manejar Login
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlerta(null);
    setCargandoLogin(true);

    try {
      const data = await api.auth.login({
        email: loginCorreo.trim(),
        password: loginPassword,
      });

      const usuario = data.usuario;
      const nombreUsuario = usuario?.nombre || 'Usuario';
      const rolUsuario = usuario?.rol_id || 1;

      setAlerta({
        mensaje: `Inicio de sesión exitoso — Bienvenido ${nombreUsuario} (Rol: ${rolUsuario})`,
        tipo: 'exito',
      });

      // Redirigir al dashboard tras login correcto
      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setAlerta({
        mensaje: err.message || 'Error de conexión con la API de autenticación',
        tipo: 'error',
      });
    } finally {
      setCargandoLogin(false);
    }
  };

  // Manejar Registro
  const handleSubmitRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlerta(null);
    setCargandoRegistro(true);

    try {
      const res = await api.auth.registro({
        nombre: regNombre.trim(),
        apellido: regApellido.trim(),
        usuario: regUsuario.trim(),
        correo: regCorreo.trim(),
        password: regPassword,
      });

      setRegNombre('');
      setRegApellido('');
      setRegUsuario('');
      setRegCorreo('');
      setRegPassword('');
      setVista('login');
      setAlerta({
        mensaje: res.mensaje || 'Usuario registrado exitosamente',
        tipo: 'exito',
      });
    } catch (err: any) {
      setAlerta({
        mensaje: err.message || 'Error de conexión con la API de registro',
        tipo: 'error',
      });
    } finally {
      setCargandoRegistro(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <main className="main-container">
        <header className="brand-header">
          <h1 className="brand-title">Login Parqueo</h1>
          <p className="brand-subtitle">Inicia sesión o crea una cuenta</p>
        </header>

        <section className="auth-card">
          {/* Pestañas: Iniciar Sesión y Registrarse */}
          <div className="tabs-container">
            <button
              id="tabLogin"
              type="button"
              className={`tab-btn ${vista === 'login' ? 'active' : ''}`}
              onClick={() => {
                setVista('login');
                setAlerta(null);
              }}
            >
              Iniciar Sesión
            </button>
            <button
              id="tabRegistro"
              type="button"
              className={`tab-btn ${vista === 'registro' ? 'active' : ''}`}
              onClick={() => {
                setVista('registro');
                setAlerta(null);
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Alerta de éxito o error */}
          {alerta && (
            <div
              id="alertaBox"
              className={`alert-box ${
                alerta.tipo === 'exito' ? 'alert-success' : 'alert-error'
              }`}
            >
              {alerta.mensaje}
            </div>
          )}

          {/* Pestaña 1: Iniciar Sesión */}
          {vista === 'login' && (
            <div id="vistaLogin" className="view-section">
              <form id="formLogin" className="auth-form" onSubmit={handleSubmitLogin}>
                <div className="form-group">
                  <label htmlFor="loginCorreo">Correo</label>
                  <input
                    type="email"
                    id="loginCorreo"
                    required
                    value={loginCorreo}
                    onChange={(e) => setLoginCorreo(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="loginPassword">Contraseña</label>
                  <input
                    type="password"
                    id="loginPassword"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  id="btnSubmitLogin"
                  disabled={cargandoLogin}
                  className="btn-primary"
                >
                  {cargandoLogin ? 'Cargando...' : 'Iniciar Sesión'}
                </button>
              </form>
            </div>
          )}

          {/* Pestaña 2: Registrarse */}
          {vista === 'registro' && (
            <div id="vistaRegistro" className="view-section">
              <form id="formRegistro" className="auth-form" onSubmit={handleSubmitRegistro}>
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="regNombre">Nombre</label>
                    <input
                      type="text"
                      id="regNombre"
                      required
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      placeholder="Juan"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="regApellido">Apellido</label>
                    <input
                      type="text"
                      id="regApellido"
                      required
                      value={regApellido}
                      onChange={(e) => setRegApellido(e.target.value)}
                      placeholder="Pérez"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="regUsuario">Usuario</label>
                  <input
                    type="text"
                    id="regUsuario"
                    required
                    value={regUsuario}
                    onChange={(e) => setRegUsuario(e.target.value)}
                    placeholder="jperez"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="regCorreo">Correo</label>
                  <input
                    type="email"
                    id="regCorreo"
                    required
                    value={regCorreo}
                    onChange={(e) => setRegCorreo(e.target.value)}
                    placeholder="juan@correo.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="regPassword">Contraseña</label>
                  <input
                    type="password"
                    id="regPassword"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  id="btnSubmitRegistro"
                  disabled={cargandoRegistro}
                  className="btn-primary"
                >
                  {cargandoRegistro ? 'Registrando...' : 'Registrarse'}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
