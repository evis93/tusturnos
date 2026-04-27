'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/src/context/ThemeContext';
import * as catalogoActions from '@/src/actions/catalogo';

interface Props {
  categorias: any[];
  servicios: any[];
}

export default function CatalogoClient({ categorias, servicios: initialServicios }: Props) {
  const params = useParams();
  const brand = params.brand as string;
  const subdominio = params.subdominio as string;
  const { colors, empresaNombre } = useTheme();

  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [servicios, setServicios] = useState(initialServicios);
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = async (catId: string) => {
    setCategoriaActiva(catId);
    setLoading(true);
    const result = await catalogoActions.obtenerServicios(catId);
    setServicios((result as any).data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8fbff' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-blue-50">
        <Link href={`/${brand}/${subdominio}`} className="w-8 h-8 flex items-center justify-center text-gray-600">‹</Link>
        <span className="text-lg font-bold" style={{ color: colors.primary }}>
          {empresaNombre || 'catálogo'}
        </span>
        <div className="w-8" />
      </header>

      {/* Categorías */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categorias.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors"
              style={categoriaActiva === cat.id
                ? { backgroundColor: colors.primary, color: '#fff' }
                : { backgroundColor: '#fff', color: '#64748b', border: '1px solid #d0e8f5' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Servicios */}
      <div className="flex-1 px-4 pt-2 pb-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }} />
          </div>
        ) : (
          servicios.map((svc: any) => (
            <div key={svc.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-50">
              {svc.imagen && (
                <img src={svc.imagen} alt={svc.nombre} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.primaryFaded, color: colors.primary }}>
                    {svc.categoria_label}
                  </span>
                  <span className="text-xs text-yellow-500">★ {svc.rating}</span>
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">{svc.nombre}</h3>
                <p className="text-xs text-gray-500 mb-3">{svc.descripcion}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold" style={{ color: colors.primary }}>${svc.precio}</span>
                    <span className="text-xs text-gray-400 ml-1">· {svc.duracion_minutos} min</span>
                  </div>
                  <Link href={`/${brand}/${subdominio}/auth/login`}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: colors.primary }}>
                    {svc.accion === 'reservar' ? 'reservar' : 'consultar'}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
