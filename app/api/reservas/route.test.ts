import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSelectSingle = vi.fn()
const mockConflictoMaybeSingle = vi.fn()
const mockInsertSingle = vi.fn()

vi.mock('@supabase/supabase-js', () => {
  const createClient = vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'servicios') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: mockSelectSingle,
            })),
          })),
        }
      }

      if (table === 'reservas') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              in: vi.fn(() => ({
                lt: vi.fn(() => ({
                  gt: vi.fn(() => ({
                    maybeSingle: mockConflictoMaybeSingle,
                  })),
                })),
              })),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: mockInsertSingle,
            })),
          })),
        }
      }

      throw new Error(`Tabla no mockeada: ${table}`)
    }),
  }))

  return { createClient }
})

import { POST } from './route'

function buildReq(body: Record<string, unknown>): any {
  return {
    json: vi.fn().mockResolvedValue(body),
  }
}

describe('POST /api/reservas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  })

  it('crea reserva correctamente cuando servicio existe', async () => {
    mockSelectSingle.mockResolvedValue({
      data: {
        id: 'srv-1',
        nombre: 'Sesion',
        duracion_minutos: 60,
        sena_tipo: 'monto',
        sena_valor: 1000,
        precio: 5000,
      },
      error: null,
    })

    mockConflictoMaybeSingle.mockResolvedValue({ data: null, error: null })

    mockInsertSingle.mockResolvedValue({
      data: {
        id: 'res-1',
        servicio_id: 'srv-1',
        estado: 'PENDIENTE',
      },
      error: null,
    })

    const req = buildReq({
      empresaId: 'emp-1',
      clienteId: 'cli-1',
      profesionalId: 'pro-1',
      servicioId: 'srv-1',
      fechaHoraInicio: '2026-03-31T10:00:00.000Z',
    })

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.success).toBe(true)
    expect(json.data.id).toBe('res-1')
  })

  it('devuelve 404 cuando servicio no existe', async () => {
    mockSelectSingle.mockResolvedValue({ data: null, error: null })

    const req = buildReq({
      empresaId: 'emp-1',
      clienteId: 'cli-1',
      profesionalId: 'pro-1',
      servicioId: 'srv-inexistente',
      fechaHoraInicio: '2026-03-31T10:00:00.000Z',
    })

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toBe('Servicio no encontrado')
  })

  it('devuelve 500 cuando falla la query de servicio (no enmascara como 404)', async () => {
    mockSelectSingle.mockResolvedValue({ data: null, error: { message: 'permission denied' } })

    const req = buildReq({
      empresaId: 'emp-1',
      clienteId: 'cli-1',
      profesionalId: 'pro-1',
      servicioId: 'srv-1',
      fechaHoraInicio: '2026-03-31T10:00:00.000Z',
    })

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Error al consultar servicio')
  })

  it('normaliza servicioId con espacios y permite crear reserva (regresion alta completa)', async () => {
    mockSelectSingle.mockResolvedValue({
      data: {
        id: 'srv-1',
        nombre: 'Sesion',
        duracion_minutos: 45,
        sena_tipo: 'porcentaje',
        sena_valor: 20,
        precio: 10000,
      },
      error: null,
    })

    mockConflictoMaybeSingle.mockResolvedValue({ data: null, error: null })

    mockInsertSingle.mockResolvedValue({
      data: {
        id: 'res-2',
        servicio_id: 'srv-1',
        estado: 'PENDIENTE',
      },
      error: null,
    })

    const req = buildReq({
      empresaId: 'emp-1',
      clienteId: 'cli-1',
      profesionalId: 'pro-1',
      servicioId: '  srv-1  ',
      fechaHoraInicio: '2026-03-31T11:00:00.000Z',
    })

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.success).toBe(true)
    expect(json.data.servicio_id).toBe('srv-1')
  })
})
