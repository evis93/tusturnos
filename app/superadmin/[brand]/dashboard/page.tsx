'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { SUPERADMIN_COLORS } from '@/src/lib/brand-colors';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'domains', label: 'Domains', icon: 'domain' },
  { id: 'metrics', label: 'Metrics', icon: 'analytics' },
  { id: 'users', label: 'Users', icon: 'group' },
  { id: 'security', label: 'Security', icon: 'security' },
];

const DUMMY_LOGS = [
  { id: 1, timestamp: '2026-04-26 14:32:15', level: 'INFO', message: 'User login: admin@mensana.com' },
  { id: 2, timestamp: '2026-04-26 14:28:42', level: 'INFO', message: 'Company configuration updated' },
  { id: 3, timestamp: '2026-04-26 14:15:03', level: 'WARNING', message: 'Unusual API activity detected' },
  { id: 4, timestamp: '2026-04-26 13:45:22', level: 'INFO', message: 'System backup completed' },
  { id: 5, timestamp: '2026-04-26 13:12:08', level: 'INFO', message: 'Database optimization finished' },
];

export default function SuperadminDashboardPage({
  params,
}: {
  params: { brand: 'mensana' | 'tusturnos' };
}) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');

  if (!profile || profile.rol !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Solo superadmins pueden acceder aquí</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const colors = SUPERADMIN_COLORS;
  const getLogColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 bg-red-50';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 w-64 h-screen shadow-lg z-40 overflow-y-auto flex flex-col"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="p-6 border-b border-opacity-10 border-white">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined">terminal</span>
            NCR Console
          </h1>
          <p className="text-xs text-gray-300 mt-1">v1.0.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                activeNav === item.id
                  ? 'bg-white bg-opacity-20 text-white font-semibold'
                  : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-opacity-10 border-white">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-200 hover:bg-white hover:bg-opacity-10 transition-all text-left">
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 bg-white shadow-sm z-30 border-b border-gray-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeNav === 'dashboard' && 'Dashboard'}
              {activeNav === 'domains' && 'Dominios'}
              {activeNav === 'metrics' && 'Métricas'}
              {activeNav === 'users' && 'Usuarios'}
              {activeNav === 'security' && 'Seguridad'}
            </h2>

            <div className="flex items-center gap-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ focusRingColor: colors.secondary }}
                />
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <span className="material-symbols-outlined text-gray-600">notifications</span>
              </button>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <span className="material-symbols-outlined text-gray-600">help</span>
              </button>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <span className="material-symbols-outlined text-gray-600">settings</span>
              </button>

              <div className="flex items-center gap-2 pl-6 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br" style={{backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`}}></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{profile?.nombre || 'Superadmin'}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeNav === 'dashboard' && (
          <div className="flex-1 p-8">
            {/* Domain Status Cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {['Mensana', 'TusTurnos'].map((brand) => (
                <div key={brand} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{brand}</h3>
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Uptime</p>
                      <p className="text-2xl font-bold text-gray-900">99.9%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Sesiones Activas</p>
                      <p className="text-2xl font-bold text-gray-900">1,245</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Health & Logs Grid */}
            <div className="grid grid-cols-3 gap-6">
              {/* System Health */}
              <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
                <div className="space-y-3">
                  {['Database', 'API Server', 'Storage', 'Cache', 'Queue'].map((service, idx) => (
                    <div key={service} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700 w-24">{service}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${95 - idx * 5}%`,
                            backgroundColor: colors.secondary,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">{95 - idx * 5}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Logs */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Logs</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {DUMMY_LOGS.map((log) => (
                    <div key={log.id} className={`p-3 rounded-lg text-xs ${getLogColor(log.level)}`}>
                      <p className="font-mono text-xs opacity-70">{log.timestamp}</p>
                      <p className="font-semibold mt-1">{log.level}</p>
                      <p className="mt-1 opacity-90">{log.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Access Management Table */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Access Management</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Operator</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Domain</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { op: 'admin@mensana.com', domain: 'Mensana', role: 'Admin', status: 'Active' },
                      { op: 'admin@tusturnos.ar', domain: 'TusTurnos', role: 'Admin', status: 'Active' },
                      { op: 'support@nrc.com', domain: 'All', role: 'Support', status: 'Active' },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.op}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.domain}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.role}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other sections */}
        {activeNav !== 'dashboard' && (
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <span
                className="material-symbols-outlined text-6xl mb-4 block"
                style={{ color: colors.secondary }}
              >
                construction
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {activeNav === 'domains' && 'Gestión de Dominios'}
                {activeNav === 'metrics' && 'Métricas del Sistema'}
                {activeNav === 'users' && 'Gestión de Usuarios'}
                {activeNav === 'security' && 'Configuración de Seguridad'}
              </h2>
              <p className="text-gray-600">Próximamente...</p>
            </div>
          </div>
        )}
      </main>

      {/* FAB - Emergency Support */}
      <button
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all text-white font-bold text-lg flex items-center justify-center z-50"
        style={{ backgroundColor: colors.secondary }}
        title="Soporte de Emergencia"
      >
        <span className="material-symbols-outlined">emergency</span>
      </button>
    </div>
  );
}