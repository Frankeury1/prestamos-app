'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Pago {
  id: number;
  monto: string;
  fecha: string;
  prestamoId: number;
}

interface Prestamo {
  id: number;
  monto: string;
  interes: string;
  cuotas: number;
  estado: string;
  cliente: { nombre: string; cedula: string };
  pagos: Pago[];
}

export default function PagosPage() {
  const router = useRouter();
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);
  const [monto, setMonto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    cargarPrestamos();
  }, []);

  async function cargarPrestamos() {
    try {
      const res = await api.get('/prestamos');
      // Solo muestra préstamos activos
      setPrestamos(res.data.filter((p: Prestamo) => p.estado === 'ACTIVO'));
    } finally {
      setCargando(false);
    }
  }

  async function registrarPago(e: React.FormEvent) {
    e.preventDefault();
    if (!prestamoSeleccionado) return;
    setEnviando(true);
    setMensaje('');

    try {
      await api.post('/pagos', {
        monto: Number(monto),
        prestamoId: prestamoSeleccionado.id,
      });
      setMensaje('✅ Pago registrado correctamente');
      setMonto('');
      cargarPrestamos();

      // Actualiza el préstamo seleccionado con los nuevos datos
      const res = await api.get('/prestamos');
      const actualizado = res.data.find((p: Prestamo) => p.id === prestamoSeleccionado.id);
      setPrestamoSeleccionado(actualizado || null);
    } catch (err: any) {
      setMensaje(`❌ ${err.response?.data?.message || 'Error al registrar pago'}`);
    } finally {
      setEnviando(false);
    }
  }

  function calcularResumen(prestamo: Prestamo) {
    const monto = Number(prestamo.monto);
    const interes = Number(prestamo.interes);
    const totalAPagar = monto + (monto * interes / 100);
    const totalPagado = prestamo.pagos.reduce((s, p) => s + Number(p.monto), 0);
    const saldo = totalAPagar - totalPagado;
    const cuotaMensual = totalAPagar / prestamo.cuotas;
    return { totalAPagar, totalPagado, saldo, cuotaMensual };
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
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">Dashboard</button>
          <button onClick={() => router.push('/clientes')} className="text-gray-400 hover:text-white">Clientes</button>
          <button onClick={() => router.push('/prestamos')} className="text-gray-400 hover:text-white">Préstamos</button>
          <button onClick={() => { localStorage.removeItem('token'); router.push('/'); }} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded-lg text-sm">Cerrar sesión</button>
        </div>
      </nav>

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Registrar Pago</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Lista de préstamos activos */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-300">
              Préstamos Activos
            </h2>
            {cargando ? (
              <div className="text-gray-400">Cargando...</div>
            ) : prestamos.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No hay préstamos activos
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {prestamos.map(prestamo => {
                  const { totalAPagar, totalPagado, saldo } = calcularResumen(prestamo);
                  const porcentaje = Math.round((totalPagado / totalAPagar) * 100);
                  const seleccionado = prestamoSeleccionado?.id === prestamo.id;

                  return (
                    <div
                      key={prestamo.id}
                      onClick={() => setPrestamoSeleccionado(prestamo)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        seleccionado
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{prestamo.cliente.nombre}</p>
                          <p className="text-gray-400 text-sm">{prestamo.cliente.cedula}</p>
                        </div>
                        <p className="text-yellow-400 font-bold">
                          RD$ {Number(saldo).toLocaleString()}
                        </p>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{porcentaje}% pagado</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel de pago */}
          <div>
            {prestamoSeleccionado ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Pago — {prestamoSeleccionado.cliente.nombre}
                </h2>

                {/* Resumen financiero */}
                {(() => {
                  const { totalAPagar, totalPagado, saldo, cuotaMensual } =
                    calcularResumen(prestamoSeleccionado);
                  return (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Total a pagar</p>
                        <p className="font-bold text-white">RD$ {totalAPagar.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Saldo pendiente</p>
                        <p className="font-bold text-yellow-400">RD$ {saldo.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Total pagado</p>
                        <p className="font-bold text-green-400">RD$ {totalPagado.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Cuota mensual</p>
                        <p className="font-bold text-blue-400">
                          RD$ {Math.round(cuotaMensual).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Formulario de pago */}
                <form onSubmit={registrarPago}>
                  <label className="block text-sm text-gray-400 mb-1">
                    Monto a pagar (RD$)
                  </label>
                  <input
                    type="number"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    placeholder="916.67"
                    required
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 mb-4"
                  />

                  {mensaje && (
                    <div className={`p-3 rounded-lg text-sm mb-4 ${
                      mensaje.startsWith('✅')
                        ? 'bg-green-900/50 border border-green-700 text-green-400'
                        : 'bg-red-900/50 border border-red-700 text-red-400'
                    }`}>
                      {mensaje}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    {enviando ? 'Registrando...' : 'Registrar Pago'}
                  </button>
                </form>

                {/* Historial de pagos */}
                {prestamoSeleccionado.pagos.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">
                      Historial de pagos
                    </h3>
                    <div className="flex flex-col gap-2">
                      {prestamoSeleccionado.pagos.map(pago => (
                        <div
                          key={pago.id}
                          className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-2"
                        >
                          <span className="text-gray-400 text-sm">
                            {new Date(pago.fecha).toLocaleDateString('es-DO')}
                          </span>
                          <span className="text-green-400 font-semibold">
                            RD$ {Number(pago.monto).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex items-center justify-center h-48">
                <p className="text-gray-500">
                  Selecciona un préstamo para registrar un pago
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}