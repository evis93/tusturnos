'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { ConsultanteController } from '@/src/controllers/ConsultanteController';
import { Search, X, FolderOpen, Pencil, UserX, UserPlus } from 'lucide-react';
import TelefonoInput from '@/src/components/ui/TelefonoInput';

function Initials({ nombre, colors }: { nombre: string; colors: any }) {
  const initials = (nombre || '?')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div style={{ width: 44, height: 44, borderRadius: 22, background: colors.primaryFaded, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: colors.primary }}>{initials}</span>
    </div>
  );
}

export default function ClientesPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors } = useTheme();

  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const [modalEdit, setModalEdit] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<any>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorEdit, setErrorEdit] = useState('');

  const [modalAlta, setModalAlta] = useState(false);
  const [altaNombre, setAltaNombre] = useState('');
  const [altaEmail, setAltaEmail] = useState('');
  const [altaTelefono, setAltaTelefono] = useState('');
  const [altaAcceso, setAltaAcceso] = useState(false);
  const [creando, setCreando] = useState(false);
  const [errorAlta, setErrorAlta] = useState('');

  const cargarClientes = useCallback(async () => {
    setLoading(true);
    const result = await ConsultanteController.obtenerConsultantes(profile);
    if (result.success) setClientes(result.data || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { cargarClientes(); }, [cargarClientes]);

  useEffect(() => {
    if (!busqueda.trim()) { cargarClientes(); return; }
    const timer = setTimeout(async () => {
      setBuscando(true);
      const result = await ConsultanteController.buscarConsultantes(busqueda, profile);
      if (result.success) setClientes(result.data || []);
      setBuscando(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const clientesFiltrados = useMemo(() =>
    mostrarInactivos ? clientes : clientes.filter((c: any) => c.activo !== false),
    [clientes, mostrarInactivos]
  );

  const handleEditar = (cliente: any) => {
    setClienteEditando(cliente);
    setEditNombre(cliente.nombre_completo);
    setEditTelefono(cliente.telefono || '');
    setErrorEdit('');
    setModalEdit(true);
  };

  const handleDesactivar = async (cliente: any) => {
    if (!confirm(`¿Desactivar a ${cliente.nombre_completo}? Sus datos se conservarán.`)) return;
    const result = await ConsultanteController.eliminarConsultante(cliente.id, profile);
    if (result.success) {
      setClientes(prev => prev.map((c: any) => c.id === cliente.id ? { ...c, activo: false } : c));
    } else {
      alert(result.error || 'No se pudo desactivar');
    }
  };

  const handleGuardar = async () => {
    if (!editNombre.trim()) { setErrorEdit('El nombre es obligatorio'); return; }
    setGuardando(true);
    const result = await ConsultanteController.actualizarConsultante(
      clienteEditando.id,
      { nombre_completo: editNombre, telefono: editTelefono },
      profile,
    );
    setGuardando(false);
    if (result.success) { setModalEdit(false); cargarClientes(); }
    else setErrorEdit(result.error || 'No se pudo guardar');
  };

  const abrirModalAlta = () => {
    setAltaNombre(''); setAltaEmail(''); setAltaTelefono('');
    setAltaAcceso(false); setErrorAlta('');
    setModalAlta(true);
  };

  const handleCrearCliente = async () => {
    if (!altaNombre.trim()) { setErrorAlta('El nombre es obligatorio'); return; }
    if (altaAcceso && !altaEmail.trim()) { setErrorAlta('El email es obligatorio para habilitar el acceso'); return; }
    setCreando(true); setErrorAlta('');
    const result = await ConsultanteController.crearConsultante(
      { nombre_completo: altaNombre, email: altaEmail, telefono: altaTelefono, autorizar_acceso_app: altaAcceso },
      profile,
    );
    setCreando(false);
    if (result.success) {
      setModalAlta(false);
      cargarClientes();
      if (result.invitacionEnviada) alert('Cliente creado. Se envió un email de invitación para activar su cuenta.');
    } else {
      setErrorAlta(result.error || 'No se pudo crear el cliente');
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="relative inline-flex h-5 w-9 rounded-full transition-colors"
      style={{ background: value ? colors.primary : colors.borderLight }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5"
        style={{ transform: value ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Clientes</h1>
        <button
          onClick={abrirModalAlta}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ background: colors.primary }}
        >
          <UserPlus size={16} /> Agregar
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="buscar por nombre o email..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm focus:outline-none"
          style={{ borderColor: colors.border, color: colors.text }}
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Toggle inactivos */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <span className="text-xs" style={{ color: colors.textMuted }}>mostrar inactivos</span>
        <Toggle value={mostrarInactivos} onChange={() => setMostrarInactivos(p => !p)} />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }} />
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👤</p>
          <p style={{ color: colors.textSecondary }}>{busqueda ? 'Sin resultados' : 'No hay clientes registrados'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {buscando && (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: colors.primary }} />
            </div>
          )}
          {clientesFiltrados.map((cliente: any) => (
            <div
              key={cliente.id}
              className="bg-white rounded-xl border p-4 flex items-center gap-3"
              style={{ borderColor: colors.border, opacity: cliente.activo === false ? 0.6 : 1 }}
            >
              <Initials nombre={cliente.nombre_completo} colors={colors} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold truncate text-sm" style={{ color: colors.text }}>{cliente.nombre_completo}</p>
                  {cliente.activo === false && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: colors.borderLight, color: colors.textMuted }}>inactivo</span>
                  )}
                </div>
                {cliente.email && <p className="text-xs truncate" style={{ color: colors.textSecondary }}>{cliente.email}</p>}
                {cliente.telefono && <p className="text-xs" style={{ color: colors.textSecondary }}>{cliente.telefono}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {cliente.tiene_ficha && (
                  <button
                    onClick={() => router.push(`/admin/clientes/${cliente.id}`)}
                    className="p-2 rounded-lg transition"
                    style={{ background: colors.primaryFaded }}
                    title="Ver ficha"
                  >
                    <FolderOpen size={16} style={{ color: colors.primary }} />
                  </button>
                )}
                <button onClick={() => handleEditar(cliente)} className="p-2 rounded-lg hover:bg-gray-100 transition" title="Editar">
                  <Pencil size={16} style={{ color: colors.textSecondary }} />
                </button>
                {cliente.activo !== false && (
                  <button onClick={() => handleDesactivar(cliente)} className="p-2 rounded-lg transition" style={{ background: '#fee2e2' }} title="Desactivar">
                    <UserX size={16} className="text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal editar */}
      {modalEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>editar cliente</h2>
              <button onClick={() => setModalEdit(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <label className="block text-xs font-semibold mb-1 lowercase" style={{ color: colors.textSecondary }}>nombre</label>
            <input value={editNombre} onChange={e => setEditNombre(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm mb-3 focus:outline-none" style={{ borderColor: colors.border }} placeholder="nombre completo" />
            <label className="block text-xs font-semibold mb-1 lowercase" style={{ color: colors.textSecondary }}>teléfono</label>
            <TelefonoInput value={editTelefono} onChange={setEditTelefono} className="mb-1" />
            <p className="text-xs mb-4" style={{ color: colors.textMuted }}>el email no se puede modificar desde aquí</p>
            {errorEdit && <p className="text-xs text-red-500 mb-3">{errorEdit}</p>}
            <div className="flex gap-3">
              <button onClick={() => setModalEdit(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: colors.border, color: colors.text }}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60" style={{ background: colors.primary }}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal alta */}
      {modalAlta && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>nuevo cliente</h2>
              <button onClick={() => setModalAlta(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <label className="block text-xs font-semibold mb-1 lowercase" style={{ color: colors.textSecondary }}>nombre *</label>
            <input value={altaNombre} onChange={e => setAltaNombre(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm mb-3 focus:outline-none" style={{ borderColor: colors.border }} placeholder="nombre completo" />
            <label className="block text-xs font-semibold mb-1 lowercase" style={{ color: colors.textSecondary }}>email</label>
            <input value={altaEmail} onChange={e => setAltaEmail(e.target.value)} type="email" className="w-full px-3 py-2.5 rounded-xl border text-sm mb-3 focus:outline-none" style={{ borderColor: colors.border }} placeholder="email (opcional)" />
            <label className="block text-xs font-semibold mb-1 lowercase" style={{ color: colors.textSecondary }}>teléfono</label>
            <TelefonoInput value={altaTelefono} onChange={setAltaTelefono} className="mb-4" />
            <div className="flex items-center justify-between py-3 border-t mb-4" style={{ borderColor: colors.borderLight }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text }}>habilitar acceso a la app</p>
                <p className="text-xs" style={{ color: colors.textMuted }}>crea cuenta con contraseña 123456</p>
              </div>
              <Toggle value={altaAcceso} onChange={() => setAltaAcceso(p => !p)} />
            </div>
            {errorAlta && <p className="text-xs text-red-500 mb-3">{errorAlta}</p>}
            <div className="flex gap-3">
              <button onClick={() => setModalAlta(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: colors.border, color: colors.text }}>Cancelar</button>
              <button onClick={handleCrearCliente} disabled={creando} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60" style={{ background: colors.primary }}>
                {creando ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
