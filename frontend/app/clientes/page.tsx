'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    nombre: '', cedula: '', telefono: '', direccion: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    cargarClientes();
  }, []);

  async function cargarClientes() {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } finally {
      setCargando(false);
    }
  }

  async function crearCliente(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/clientes', form);
    setForm({ nombre: '', cedula: '', telefono: '', direccion: '' });
    setMostrarForm(false);
    cargarClientes();
  }

  async function eliminarCliente(id: number) {
    if (!confirm('¿Eliminar este cliente?')) return;
    await api.delete(`/clientes/${id}`);
    cargarClientes();
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
          <button onClick={() => router.push('/prestamos')} className="text-gray-400 hover:text-white">Préstamos</button>
          <button onClick={() => { localStorage.removeItem('token'); router.push('/'); }} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded-lg text-sm">Cerrar sesión</button>
        </div>
      </nav>

      <div className="p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            + Nuevo Cliente
          </button>
        </div>

        {/* Formulario nuevo cliente */}
        {mostrarForm && (
          <form onSubmit={crearCliente} className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
            <h2 className="text-lg font-semibold mb-4">Nuevo Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cédula</label>
                <input
                  value={form.cedula}
                  onChange={e => setForm({...form, cedula: e.target.value})}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={e => setForm({...form, telefono: e.target.value})}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Dirección</label>
                <input
                  value={form.direccion}
                  onChange={e => setForm({...form, direccion: e.target.value})}
                  required
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

        {/* Lista de clientes */}
        {cargando ? (
          <div className="text-gray-400">Cargando clientes...</div>
        ) : clientes.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No hay clientes registrados</div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 font-medium">Nombre</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Cédula</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Teléfono</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Dirección</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cliente => (
                  <tr key={cliente.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 font-medium">{cliente.nombre}</td>
                    <td className="p-4 text-gray-400">{cliente.cedula}</td>
                    <td className="p-4 text-gray-400">{cliente.telefono}</td>
                    <td className="p-4 text-gray-400">{cliente.direccion}</td>
                    <td className="p-4">
                      <button
                        onClick={() => eliminarCliente(cliente.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}