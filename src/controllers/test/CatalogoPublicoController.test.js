/**
 * Tests for CatalogoPublicoController
 *
 * No external dependencies to mock — the controller works entirely with
 * in-memory static data.  Tests cover:
 *   - obtenerCategorias: shape, count, required fields
 *   - obtenerServicios: default ('todos'), known category, unknown category,
 *     edge-case inputs (null, undefined, empty string, numeric, mixed-case)
 */

import { describe, it, expect } from 'vitest';
import { CatalogoPublicoController } from '../CatalogoPublicoController.js';

// ── obtenerCategorias ──────────────────────────────────────────────────────────
describe('CatalogoPublicoController.obtenerCategorias', () => {
  it('returns success:true', () => {
    const result = CatalogoPublicoController.obtenerCategorias();
    expect(result.success).toBe(true);
  });

  it('returns an array in data', () => {
    const { data } = CatalogoPublicoController.obtenerCategorias();
    expect(Array.isArray(data)).toBe(true);
  });

  it('returns exactly 4 categories', () => {
    const { data } = CatalogoPublicoController.obtenerCategorias();
    expect(data).toHaveLength(4);
  });

  it('always includes the "todos" category', () => {
    const { data } = CatalogoPublicoController.obtenerCategorias();
    const todos = data.find(c => c.id === 'todos');
    expect(todos).toBeDefined();
    expect(todos.label).toBe('Todos');
  });

  it('each category has id, label and icon', () => {
    const { data } = CatalogoPublicoController.obtenerCategorias();
    for (const cat of data) {
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('label');
      expect(cat).toHaveProperty('icon');
      expect(typeof cat.id).toBe('string');
      expect(typeof cat.label).toBe('string');
      expect(typeof cat.icon).toBe('string');
    }
  });

  it('contains masajes, yoga and terapias categories', () => {
    const { data } = CatalogoPublicoController.obtenerCategorias();
    const ids = data.map(c => c.id);
    expect(ids).toContain('masajes');
    expect(ids).toContain('yoga');
    expect(ids).toContain('terapias');
  });

  it('returns the same reference on repeated calls (static data)', () => {
    const first  = CatalogoPublicoController.obtenerCategorias().data;
    const second = CatalogoPublicoController.obtenerCategorias().data;
    expect(first).toBe(second);
  });
});

// ── obtenerServicios ───────────────────────────────────────────────────────────
describe('CatalogoPublicoController.obtenerServicios', () => {

  // ── default / "todos" ────────────────────────────────────────────────────────
  describe('when called with no argument (defaults to "todos")', () => {
    it('returns success:true', () => {
      const result = CatalogoPublicoController.obtenerServicios();
      expect(result.success).toBe(true);
    });

    it('returns all 3 services', () => {
      const { data } = CatalogoPublicoController.obtenerServicios();
      expect(data).toHaveLength(3);
    });
  });

  describe('when called with categoriaId = "todos"', () => {
    it('returns all services', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('todos');
      expect(data).toHaveLength(3);
    });

    it('returns success:true', () => {
      expect(CatalogoPublicoController.obtenerServicios('todos').success).toBe(true);
    });
  });

  // ── filtering by known category ───────────────────────────────────────────────
  describe('when called with a known categoriaId', () => {
    it('returns only masajes services', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('masajes');
      expect(data).toHaveLength(1);
      expect(data[0].categoria_id).toBe('masajes');
      expect(data[0].nombre).toBe('Masaje Descontracturante');
    });

    it('returns only yoga services', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('yoga');
      expect(data).toHaveLength(1);
      expect(data[0].categoria_id).toBe('yoga');
      expect(data[0].nombre).toBe('Hatha Yoga Personalizado');
    });

    it('returns only terapias services', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('terapias');
      expect(data).toHaveLength(1);
      expect(data[0].categoria_id).toBe('terapias');
      expect(data[0].nombre).toBe('Terapia Reiki');
    });

    it('returns success:true for known category', () => {
      expect(CatalogoPublicoController.obtenerServicios('masajes').success).toBe(true);
    });
  });

  // ── shape of service objects ──────────────────────────────────────────────────
  describe('service object shape', () => {
    it('each service has all required fields', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('todos');
      const requiredFields = [
        'id', 'categoria_id', 'categoria_label', 'nombre',
        'precio', 'duracion_minutos', 'tipo', 'tipo_icon',
        'rating', 'descripcion', 'accion', 'imagen',
      ];
      for (const svc of data) {
        for (const field of requiredFields) {
          expect(svc, `service "${svc.nombre}" missing field "${field}"`).toHaveProperty(field);
        }
      }
    });

    it('precio and duracion_minutos are positive numbers', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('todos');
      for (const svc of data) {
        expect(typeof svc.precio).toBe('number');
        expect(svc.precio).toBeGreaterThan(0);
        expect(typeof svc.duracion_minutos).toBe('number');
        expect(svc.duracion_minutos).toBeGreaterThan(0);
      }
    });

    it('rating is between 0 and 5 inclusive', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('todos');
      for (const svc of data) {
        expect(svc.rating).toBeGreaterThanOrEqual(0);
        expect(svc.rating).toBeLessThanOrEqual(5);
      }
    });

    it('accion is either "reservar" or "consultar"', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('todos');
      const validAcciones = ['reservar', 'consultar'];
      for (const svc of data) {
        expect(validAcciones).toContain(svc.accion);
      }
    });

    it('imagen is a non-empty string (URL)', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('todos');
      for (const svc of data) {
        expect(typeof svc.imagen).toBe('string');
        expect(svc.imagen.length).toBeGreaterThan(0);
      }
    });
  });

  // ── edge cases ────────────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('returns empty array for an unknown category', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('pilates');
      expect(data).toEqual([]);
    });

    it('returns success:true even for an unknown category', () => {
      expect(CatalogoPublicoController.obtenerServicios('pilates').success).toBe(true);
    });

    it('returns empty array for an empty string (not "todos")', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('');
      // '' !== 'todos' → filter by '' → no match
      expect(data).toEqual([]);
    });

    it('is case-sensitive: "Masajes" does not match "masajes"', () => {
      const { data } = CatalogoPublicoController.obtenerServicios('Masajes');
      expect(data).toEqual([]);
    });

    it('treats null as a non-"todos" value and returns empty array', () => {
      // null !== 'todos' → filter by null → no categoria_id equals null
      const { data } = CatalogoPublicoController.obtenerServicios(null);
      expect(data).toEqual([]);
    });

    it('treats a numeric id as an unknown category', () => {
      const { data } = CatalogoPublicoController.obtenerServicios(1);
      expect(data).toEqual([]);
    });

    it('returns success:true regardless of input', () => {
      const inputs = [undefined, null, '', 'nonexistent', 42, 'TODOS'];
      for (const input of inputs) {
        expect(CatalogoPublicoController.obtenerServicios(input).success).toBe(true);
      }
    });
  });

  // ── immutability / repeated calls ─────────────────────────────────────────────
  describe('data integrity across calls', () => {
    it('returns the same array reference for repeated "todos" calls', () => {
      const first  = CatalogoPublicoController.obtenerServicios('todos').data;
      const second = CatalogoPublicoController.obtenerServicios('todos').data;
      expect(first).toBe(second);
    });

    it('each filtered call returns a fresh filtered array', () => {
      const a = CatalogoPublicoController.obtenerServicios('masajes').data;
      const b = CatalogoPublicoController.obtenerServicios('masajes').data;
      // Same content but different array instances (filter always creates a new array)
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });
});
