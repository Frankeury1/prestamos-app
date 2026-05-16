'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Resumen {
  totalClientes: number;
  totalPrestamos: number;
  totalPagado: number;
  prestamosPendientes: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [resumen, setResumen] = useState<Resumen | null>(null);

  useEffect(() => {
    // Si no hay token redirige al login
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    cargarResumen();
  }, []);

  async function cargarResumen() {
    try {
      const [clientes, prestamos] = await Promise.all([
        api.get('/clientes'),
        api.get('/prestamos'),
      ]);

      const totalPagado = prestamos.data.reduce(
        (sum: number, p: any) =>
          sum + p.pagos.reduce((s: number, pago: any) => s + Number(pago.monto), 0),
        0
      );

      setResumen({
        totalClientes: clientes.data.length,
        totalPrestamos: prestamos.data.length,
        totalPagado,
        prestamosPendientes: prestamos.data.filter(
          (p: any) => p.estado === 'ACTIVO'
        ).length,
      });
    } catch {
      router.push('/');
    }
  }

  function cerrarSesion() {
    localStorage.removeItem('token');
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="text-xl font-bold">PréstamosPro</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/clientes')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Clientes
          </button>
          <button
            onClick={() => router.push('/prestamos')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Préstamos
          </button>
          <button 
          onClick={() => router.push('/pagos')} 
          className="text-gray-400 hover:text-white"
          >
            Pagos
            </button>
            
          <button
            onClick={cerrarSesion}
            className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded-lg text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Tarjetas de resumen */}
        {resumen ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <p className="text-gray-400 text-sm">Total Clientes</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">{resumen.totalClientes}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <p className="text-gray-400 text-sm">Total Préstamos</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{resumen.totalPrestamos}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <p className="text-gray-400 text-sm">Préstamos Activos</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{resumen.prestamosPendientes}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <p className="text-gray-400 text-sm">Total Cobrado</p>
              <p className="text-3xl font-bold text-purple-400 mt-1">
                RD$ {resumen.totalPagado.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Cargando...</div>
        )}
      </div>
    </main>
  );
}