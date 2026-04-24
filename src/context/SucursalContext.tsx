'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

interface Sucursal {
  id: string;
  nombre: string;
}

interface SucursalContextType {
  sucursales: Sucursal[];
  sucursalActiva: Sucursal | null;
  setSucursalActiva: (s: Sucursal) => void;
  loading: boolean;
}

const SucursalContext = createContext<SucursalContextType>({
  sucursales: [],
  sucursalActiva: null,
  setSucursalActiva: () => {},
  loading: false,
});

export const useSucursal = () => useContext(SucursalContext);

export const SucursalProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalActiva, setSucursalActivaState] = useState<Sucursal | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile?.empresaId) return;

    setLoading(true);
    supabase
      .from('sucursales')
      .select('id, nombre')
      .eq('empresa_id', profile.empresaId)
      .order('nombre')
      .then(({ data }) => {
        const lista: Sucursal[] = data || [];
        setSucursales(lista);

        if (lista.length === 0) {
          setSucursalActivaState(null);
          setLoading(false);
          return;
        }

        // Restaurar la última seleccionada, o usar la única / primera
        const savedId = typeof window !== 'undefined'
          ? localStorage.getItem(`sucursal_activa_${profile.empresaId}`)
          : null;
        const saved = lista.find(s => s.id === savedId);
        setSucursalActivaState(saved || lista[0]);
        setLoading(false);
      });
  }, [profile?.empresaId]);

  const setSucursalActiva = (s: Sucursal) => {
    setSucursalActivaState(s);
    if (profile?.empresaId && typeof window !== 'undefined') {
      localStorage.setItem(`sucursal_activa_${profile.empresaId}`, s.id);
    }
  };

  return (
    <SucursalContext.Provider value={{ sucursales, sucursalActiva, setSucursalActiva, loading }}>
      {children}
    </SucursalContext.Provider>
  );
};
