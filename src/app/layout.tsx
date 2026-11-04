import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Parqueos UMES - Sistema Integral de Estacionamiento',
  description:
    'Sistema empresarial de control de acceso, facturación, garita y gestión de parqueos para la Universidad Mesoamericana.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}

