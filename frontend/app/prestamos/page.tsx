'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Prestamo {
  id: number;
  monto: string;
  interes: string;
  cuotas: number;
  estado: string;
  fechaInicio: string;
  cliente: { nombre: string; cedula: string };
  pagos: { monto: string }[];
}

interface Cliente {
  id: number;
  nombre: string;
}

export default function PrestamosPage() {
  const router = useRouter();
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    monto: '', interes: '', cuotas: '', clienteId: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [p, c] = await Promise.all([
        api.get('/prestamos'),
        api.get('/clientes'),
      ]);
      setPrestamos(p.data);
      setClientes(c.data);
    } finally {
      setCargando(false);
    }
  }

  async function crearPrestamo(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    // Decodifica el token para obtener el usuarioId
    const payload = JSON.parse(atob(token!.split('.')[1]));
    await api.post('/prestamos', {
      monto: Number(form.monto),
      interes: Number(form.interes),
      cuotas: Number(form.cuotas),
      clienteId: Number(form.clienteId),
      usuarioId: payload.sub,
    });
    setForm({ monto: '', interes: '', cuotas: '', clienteId: '' });
    setMostrarForm(false);
    cargarDatos();
  }

  function calcularSaldo(prestamo: Prestamo) {
    const monto = Number(prestamo.monto);
    const interes = Number(prestamo.interes);
    const totalAPagar = monto + (monto * interes / 100);
    const totalPagado = prestamo.pagos.reduce((s, p) => s + Number(p.monto), 0);
    return { totalAPagar, totalPagado, saldo: totalAPagar - totalPagado };
  }

  function colorEstado(estado: string) {
    if (estado === 'ACTIVO') return 'bg-green-900 text-green-400';
    if (estado === 'PAGADO') return 'bg-blue-900 text-blue-400';
    return 'bg-red-900 text-red-400';
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
          <button onClick={() => { localStorage.removeItem('token'); router.push('/'); }} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded-lg text-sm">Cerrar sesión</button>
        </div>
      </nav>

      <div className="p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Préstamos</h1>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
          >
            + Nuevo Préstamo
          </button>
        </div>

        {/* Formulario */}
        {mostrarForm && (
          <form onSubmit={crearPrestamo} className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
            <h2 className="text-lg font-semibold mb-4">Nuevo Préstamo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cliente</label>
                <select
                  value={form.clienteId}
                  onChange={e => setForm({...form, clienteId: e.target.value})}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Monto (RD$)</label>
                <input
                  type="number"
                  value={form.monto}
                  onChange={e => setForm({...form, monto: e.target.value})}
                  required
                  placeholder="10000"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Interés (%)</label>
                <input
                  type="number"
                  value={form.interes}
                  onChange={e => setForm({...form, interes: e.target.value})}
                  required
                  placeholder="10"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cuotas</label>
                <input
                  type="number"
                  value={form.cuotas}
                  onChange={e => setForm({...form, cuotas: e.target.value})}
                  required
                  placeholder="12"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold">Guardar</button>
              <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg">Cancelar</button>
            </div>
          </form>
        )}

        {/* Lista de préstamos */}
        {cargando ? (
          <div className="text-gray-400">Cargando préstamos...</div>
        ) : prestamos.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No hay préstamos registrados</div>
        ) : (
          <div className="grid gap-4">
            {prestamos.map(prestamo => {
              const { totalAPagar, totalPagado, saldo } = calcularSaldo(prestamo);
              const porcentaje = Math.round((totalPagado / totalAPagar) * 100);
              return (
                <div key={prestamo.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{prestamo.cliente.nombre}</h3>
                      <p className="text-gray-400 text-sm">{prestamo.cliente.cedula}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorEstado(prestamo.estado)}`}>
                      {prestamo.estado}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-xs">Monto</p>
                      <p className="font-semibold">RD$ {Number(prestamo.monto).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Total a pagar</p>
                      <p className="font-semibold">RD$ {totalAPagar.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Pagado</p>
                      <p className="font-semibold text-green-400">RD$ {totalPagado.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Saldo pendiente</p>
                      <p className="font-semibold text-yellow-400">RD$ {saldo.toLocaleString()}</p>
                    </div>
                  </div>
                  {/* Barra de progreso */}
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{porcentaje}% pagado</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}