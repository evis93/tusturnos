import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockServicioMaybeSingle = vi.fn()
const mockHorariosEq2 = vi.fn()
const mockExcepcionesEq3 = vi.fn()
const mockReservasLte = vi.fn()

function buildServicioQuery() {
  const query: any = {
    eq: vi.fn(() => query),
    or: vi.fn(() => query),
    maybeSingle: mockServicioMaybeSingle,
  }
  return query
}

vi.mock('@supabase/supabase-js', () => {
  const createClient = vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'servicios') {
        return {
          select: vi.fn(() => buildServicioQuery()),
        }
      }

      if (table === 'horarios_empresa') {
        const query: any = {
          eq: vi.fn(() => query),
        }
        query.eq
          .mockImplementationOnce(() => query)
          .mockImplementationOnce(mockHorariosEq2)
        return {
          select: vi.fn(() => query),
        }
      }

      if (table === 'disponibilidad_profesional') {
        const query: any = {
          eq: vi.fn(() => query),
        }
        query.eq
          .mockImplementationOnce(() => query)
          .mockImplementationOnce(() => query)
          .mockImplementationOnce(mockExcepcionesEq3)
        return {
          select: vi.fn(() => query),
        }
      }

      if (table === 'reservas') {
        const query: any = {
          eq: vi.fn(() => query),
          in: vi.fn(() => query),
          gte: vi.fn(() => query),
          lte: mockReservasLte,
        }
        return {
          select: vi.fn(() => query),
        }
      }

      throw new Error(`Tabla no mockeada en test: ${table}`)
    }),
  }))

  return { createClient }
})

import { GET } from './route'

function buildReq(url: string): any {
  return { url }
}

describe('GET /api/disponibilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
    mockHorariosEq2.mockResolvedValue({ data: [], error: null })
    mockExcepcionesEq3.mockResolvedValue({ data: [], error: null })
    mockReservasLte.mockResolvedValue({ data: [], error: null })
  })

  it('devuelve 404 cuando el servicio no existe', async () => {
    mockServicioMaybeSingle.mockResolvedValue({ data: null, error: null })

    const req = buildReq(
      'http://localhost:3000/api/disponibilidad?profesionalId=pro-1&empresaId=emp-1&servicioId=srv-x&fecha=2026-03-30'
    )

    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toBe('Servicio no encontrado')
  })

  it('devuelve 500 cuando falla la query del servicio (no enmascara como 404)', async () => {
    mockServicioMaybeSingle.mockResolvedValue({ data: null, error: { message: 'permission denied' } })

    const req = buildReq(
      'http://localhost:3000/api/disponibilidad?profesionalId=pro-1&empresaId=emp-1&servicioId=srv-x&fecha=2026-03-30'
    )

    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Error al consultar servicio')
  })

  it('usa duracionMinutos como fallback cuando servicios devuelve permission denied', async () => {
    mockServicioMaybeSingle.mockResolvedValue({ data: null, error: { message: 'permission denied for table servicios' } })

    const req = buildReq(
      'http://localhost:3000/api/disponibilidad?profesionalId=pro-1&empresaId=emp-1&servicioId=srv-x&fecha=2026-03-30&duracionMinutos=45'
    )

    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(Array.isArray(json.data.slots)).toBe(true)
  })
})
