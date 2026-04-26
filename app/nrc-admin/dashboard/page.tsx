'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Download,
  Plus,
  ArrowRight,
  Edit,
  Filter,
  MoreVertical,
  LogIn as LoginIcon,
  Dns,
  AlertTriangle,
  Clock,
  MessageCircle,
  LayoutGrid as DashboardIcon,
  Globe,
  BarChart3,
  Users,
  Shield,
} from 'lucide-react';

const COLORS = {
  primary: '#002442',
  secondary: '#006876',
  primaryContainer: '#1a3a5a',
  primaryFixed: '#d1e4ff',
  background: '#f9f9ff',
  secondaryContainer: '#58e6ff',
};

const ACTIVITY = [
  {
    id: 1,
    type: 'login',
    title: 'User Access: mensana',
    description: 'Admin login from IP 192.168.1.1',
    time: 'Just now',
    icon: 'login',
  },
  {
    id: 2,
    type: 'dns',
    title: 'Domain Update: tusturnos',
    description: 'SSL Certificate renewed successfully',
    time: '15 mins ago',
    icon: 'dns',
  },
  {
    id: 3,
    type: 'error',
    title: 'Security Alert',
    description: "Failed login attempt on User 'guest_01'",
    time: '1 hour ago',
    icon: 'report_problem',
  },
  {
    id: 4,
    type: 'schedule',
    title: 'Backup Completed',
    description: 'Nightly snapshot for mensana_prod',
    time: '4 hours ago',
    icon: 'schedule',
  },
];

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', active: true },
  { label: 'Domains', icon: 'language', active: false },
  { label: 'Metrics', icon: 'insights', active: false },
  { label: 'Users', icon: 'manage_accounts', active: false },
  { label: 'Security', icon: 'shield', active: false },
];

const ACCESS_USERS = [
  {
    name: 'Julian Delgado',
    email: 'julian@ncr.systems',
    domain: 'mensana',
    role: 'SYSOP',
    status: 'Active',
    avatar: 'JD',
    avatarBg: 'bg-sky-100 text-sky-700',
  },
  {
    name: 'Marta Alvez',
    email: 'marta.a@mensana.com',
    domain: 'mensana, tusturnos',
    role: 'OWNER',
    status: 'Active',
    avatar: 'MA',
    avatarBg: 'bg-purple-100 text-purple-700',
  },
];

export default function NrcDashboardPage() {
  const [notificationCount] = useState(3);

  return (
    <div style={{ backgroundColor: COLORS.background }} className="min-h-screen">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 w-64 h-full z-50 overflow-y-auto shadow-xl border-r flex flex-col"
        style={{
          backgroundColor: COLORS.primaryContainer,
          borderColor: '#1a1a1a',
        }}
      >
        {/* Logo Section */}
        <div className="px-6 py-8 flex flex-col gap-2 border-b" style={{ borderColor: '#333' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded flex items-center justify-center"
              style={{ backgroundColor: '#0ef1f9' }}
            >
              <span className="material-symbols-outlined text-sm" style={{ color: COLORS.primary }}>
                terminal
              </span>
            </div>
            <div>
              <h1 className="text-white font-black uppercase tracking-widest text-sm">System Admin</h1>
              <p className="text-slate-400 text-[10px] tracking-wide uppercase">Managing mensana &amp; tusturnos</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href="#"
              className="flex items-center px-6 py-3 font-medium transition-all text-[13px] tracking-wide"
              style={{
                color: item.active ? '#fff' : '#9ca3af',
                backgroundColor: item.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderLeft: item.active ? `4px solid #0ef1f9` : 'none',
              }}
            >
              <span className="material-symbols-outlined mr-3 text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer Links */}
        <div className="p-6 border-t" style={{ borderColor: '#333' }}>
          <Link
            href="#"
            className="text-slate-400 flex items-center px-2 py-2 hover:text-white transition-all mb-2 text-[13px] font-manrope"
          >
            <MessageCircle size={18} className="mr-3" />
            Help Center
          </Link>
          <Link
            href="#"
            className="text-slate-400 flex items-center px-2 py-2 hover:text-white transition-all text-[13px] font-manrope"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Top Header */}
        <header
          className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-40 border-b"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: '#e5e7eb',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight" style={{ color: COLORS.primary }}>
              NCR Console
            </span>
            <span
              className="px-2 py-1 text-sky-700 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: '#f0f3ff' }}
            >
              v2.4.1 Stable
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <div
              className="relative flex items-center rounded-full px-4 py-1.5 w-64 group focus-within:border-sky-400 transition-colors border"
              style={{ backgroundColor: '#f9fafb', borderColor: '#d1d5db' }}
            >
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Global search..."
                className="bg-transparent border-none focus:ring-0 text-xs w-full text-slate-600 outline-none ml-2 placeholder:text-slate-400"
              />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4 text-slate-500">
              <button
                className="hover:bg-slate-50 p-2 rounded-full transition-colors relative"
                style={{ color: COLORS.primary }}
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span
                    className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white"
                    style={{ backgroundColor: '#ba1a1a' }}
                  />
                )}
              </button>
              <button className="hover:bg-slate-50 p-2 rounded-full transition-colors">
                <HelpCircle size={20} />
              </button>
              <button className="hover:bg-slate-50 p-2 rounded-full transition-colors">
                <Settings size={20} />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l" style={{ borderColor: '#e5e7eb' }}>
              <div
                className="w-8 h-8 rounded-full border flex items-center justify-center"
                style={{ borderColor: '#d1d5db', backgroundColor: '#e5e7eb' }}
              >
                <span className="text-xs font-bold">AN</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm" style={{ color: COLORS.primary }}>
                  Admin NCR
                </span>
                <span className="text-[10px] text-slate-500">System Lead</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-2" style={{ color: COLORS.primary }}>
                Overview Dashboard
              </h2>
              <p className="text-slate-600 text-sm">
                Peaceful management for mensana &amp; tusturnos infrastructure.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 border rounded-lg font-medium text-sm flex items-center gap-2 transition-colors hover:bg-slate-50"
                style={{ borderColor: COLORS.secondary, color: COLORS.secondary }}
              >
                <Download size={18} />
                Export Logs
              </button>
              <button
                className="px-4 py-2 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: COLORS.primaryContainer }}
              >
                <Plus size={18} />
                New Domain
              </button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* mensana Card */}
            <DomainCard
              title="mensana"
              subtitle="Cloud Psychology Platform"
              status="Healthy"
              uptime="99.98%"
              sessions="1,242"
              lastPing="2 mins ago"
              accentColor={COLORS.secondary}
            />

            {/* tusturnos Card */}
            <DomainCard
              title="Tusturnos"
              subtitle="Scheduling &amp; Booking Engine"
              status="Healthy"
              uptime="99.91%"
              sessions="856"
              lastPing="5 mins ago"
              accentColor={COLORS.primaryContainer}
            />

            {/* System Health */}
            <div
              className="col-span-12 lg:col-span-8 bg-white border rounded-xl shadow-sm p-8 overflow-hidden"
              style={{ borderColor: '#d1d5db' }}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold" style={{ color: COLORS.primary }}>
                  System Health Monitoring
                </h3>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">
                    CPU: 24%
                  </span>
                  <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">
                    MEM: 42%
                  </span>
                </div>
              </div>

              {/* Mock Chart */}
              <div className="relative h-48 w-full bg-slate-50 rounded-lg overflow-hidden">
                <div className="absolute inset-0 p-4 flex items-end gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${40 + Math.random() * 40}%`,
                        backgroundColor: `${COLORS.secondary}${Math.floor((0.2 + Math.random() * 0.8) * 255)
                          .toString(16)
                          .padStart(2, '0')}`,
                      }}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-t border-dashed w-full"
                      style={{ borderColor: '#d1d5db' }}
                    />
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="mt-6 flex justify-around text-center">
                <div>
                  <span className="text-xs text-slate-600 block">API Latency</span>
                  <span className="font-bold" style={{ color: COLORS.primary }}>
                    24ms
                  </span>
                </div>
                <div
                  className="h-8 w-[1px]"
                  style={{ backgroundColor: '#d1d5db' }}
                />
                <div>
                  <span className="text-xs text-slate-600 block">Error Rate</span>
                  <span className="font-bold" style={{ color: COLORS.primary }}>
                    0.02%
                  </span>
                </div>
                <div
                  className="h-8 w-[1px]"
                  style={{ backgroundColor: '#d1d5db' }}
                />
                <div>
                  <span className="text-xs text-slate-600 block">Traffic Peak</span>
                  <span className="font-bold" style={{ color: COLORS.primary }}>
                    4.2k rps
                  </span>
                </div>
              </div>
            </div>

            {/* System Logs */}
            <div
              className="col-span-12 lg:col-span-4 bg-white border rounded-xl shadow-sm flex flex-col overflow-hidden"
              style={{ borderColor: '#d1d5db' }}
            >
              <div className="p-8 border-b" style={{ borderColor: '#e5e7eb' }}>
                <h3 className="text-xl font-bold" style={{ color: COLORS.primary }}>
                  System Logs
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {ACTIVITY.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div
                      className="mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                      style={{
                        backgroundColor:
                          item.type === 'login'
                            ? '#58e6ff'
                            : item.type === 'dns'
                            ? '#d1e4ff'
                            : item.type === 'error'
                            ? '#ffdad6'
                            : '#e0e3e5',
                        color:
                          item.type === 'login'
                            ? COLORS.secondary
                            : item.type === 'dns'
                            ? COLORS.primary
                            : item.type === 'error'
                            ? '#ba1a1a'
                            : '#1f2425',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: COLORS.primary }}>
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-600">{item.description}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="p-4 w-full text-xs font-bold uppercase tracking-widest border-t transition-colors hover:bg-slate-50"
                style={{
                  color: COLORS.secondary,
                  borderColor: '#e5e7eb',
                }}
              >
                View Detailed Records
              </button>
            </div>
          </div>

          {/* Access Management Table */}
          <div
            className="bg-white border rounded-xl overflow-hidden shadow-sm"
            style={{ borderColor: '#d1d5db' }}
          >
            <div
              className="p-8 border-b flex justify-between items-center"
              style={{ borderColor: '#e5e7eb' }}
            >
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ color: COLORS.primary }}>
                  Access Management
                </h3>
                <p className="text-xs text-slate-600">
                  Grant and revoke administrative access across nodes.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border rounded hover:bg-slate-50 transition-colors">
                  <Filter size={18} />
                </button>
                <button className="p-2 border rounded hover:bg-slate-50 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#f0f3ff' }}>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wide text-slate-700">
                      Operator
                    </th>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wide text-slate-700">
                      Domain
                    </th>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wide text-slate-700">
                      Role
                    </th>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wide text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wide text-right text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                  {ACCESS_USERS.map((user) => (
                    <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 ${user.avatarBg} rounded-full flex items-center justify-center font-bold text-xs`}
                          >
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-semibold" style={{ color: COLORS.primary }}>
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-600">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.domain}</td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: user.role === 'OWNER' ? '#d1e4ff' : '#e0e3e5',
                            color: user.role === 'OWNER' ? COLORS.primary : '#1f2425',
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: COLORS.secondary }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: COLORS.secondary }}
                          />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-900 transition-colors">
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center pb-12 space-y-3">
            <p className="text-sm opacity-60" style={{ color: COLORS.primary }}>
              "Software systems, like human minds, thrive on balance and stability."
            </p>
            <div className="flex justify-center items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <span>Precision</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Reliability</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Passion</span>
            </div>
          </footer>
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <button
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform text-white"
          style={{ backgroundColor: COLORS.secondary }}
        >
          <span className="material-symbols-outlined text-2xl">support_agent</span>
          <span className="absolute right-full mr-4 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-sm text-white"
            style={{ backgroundColor: COLORS.primary }}>
            Emergency Support
          </span>
        </button>
      </div>
    </div>
  );
}

function DomainCard({
  title,
  subtitle,
  status,
  uptime,
  sessions,
  lastPing,
  accentColor,
}: {
  title: string;
  subtitle: string;
  status: string;
  uptime: string;
  sessions: string;
  lastPing: string;
  accentColor: string;
}) {
  return (
    <div
      className="col-span-12 lg:col-span-6 bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col"
      style={{ borderColor: '#d1d5db' }}
    >
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
              Active Infrastructure
            </span>
            <h3 className="text-2xl font-bold mt-1" style={{ color: COLORS.primary }}>
              {title}
            </h3>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1 text-white"
            style={{ backgroundColor: COLORS.secondaryContainer, color: COLORS.secondary }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS.secondary }}
            />
            {status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f3ff' }}>
            <span className="text-xs text-slate-600 block mb-1">Uptime (30d)</span>
            <span className="text-xl font-bold" style={{ color: COLORS.primary }}>
              {uptime}
            </span>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f3ff' }}>
            <span className="text-xs text-slate-600 block mb-1">Active Sessions</span>
            <span className="text-xl font-bold" style={{ color: COLORS.primary }}>
              {sessions}
            </span>
          </div>
        </div>
      </div>
      <div
        className="px-8 py-4 flex justify-between items-center"
        style={{ backgroundColor: '#fafbff', borderTop: '1px solid #e5e7eb' }}
      >
        <span className="text-xs text-slate-600">Last ping: {lastPing}</span>
        <Link
          href="#"
          className="text-xs font-semibold flex items-center gap-1 hover:underline transition-colors"
          style={{ color: accentColor }}
        >
          View Console <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
