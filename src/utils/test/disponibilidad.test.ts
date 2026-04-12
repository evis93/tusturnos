import { describe, it, expect } from 'vitest'
import { calcularSlots } from '../disponibilidad'
import type { HorarioDia, ExcepcionDisponibilidad } from '@/src/types/disponibilidad'

// ─── helpers ────────────────────────────────────────────────────────────────

/** Builds a HorarioDia active on the given JS day-of-week (0=Sun…6=Sat) */
function horario(diaSemana: number, horaInicio: string, horaFin: string): HorarioDia {
  return { empresaId: 'emp1', diaSemana, horaInicio, horaFin, activo: true }
}

/** Argentina is UTC-3. An ISO timestamp for a given local AR date+time. */
function arTs(fecha: string, hora: string): string {
  // e.g. fecha='2026-03-30', hora='10:00' → '2026-03-30T13:00:00.000Z'
  const [h, m] = hora.split(':').map(Number)
  const utcH = h + 3
  return `${fecha}T${String(utcH).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`
}

/** A date whose .getDay() returns the desired weekday, using UTC date string. */
function dateFor(isoDate: string): Date {
  // new Date('2026-03-30') → Monday in UTC = day 1
  return new Date(isoDate)
}

// ─── basic slot generation ───────────────────────────────────────────────────

describe('calcularSlots — basic slot generation', () => {
  it('returns empty array when no active schedule matches the weekday', () => {
    // 2026-03-30 is a Monday (day 1). Schedule only for Tuesday (day 2).
    const h = [horario(2, '09:00', '10:00')]
    const result = calcularSlots(h, [], [], 30, dateFor('2026-03-30'))
    expect(result).toHaveLength(0)
  })

  it('returns empty array when the day has activo=false', () => {
    const h: HorarioDia[] = [
      { empresaId: 'emp1', diaSemana: 1, horaInicio: '09:00', horaFin: '10:00', activo: false },
    ]
    const result = calcularSlots(h, [], [], 30, dateFor('2026-03-30'))
    expect(result).toHaveLength(0)
  })

  it('generates the correct number of slots for a 1-hour window with 30-min duration', () => {
    // 09:00–10:00 → slots: 09:00-09:30, 09:30-10:00  (2 slots)
    const h = [horario(1, '09:00', '10:00')] // Monday
    const result = calcularSlots(h, [], [], 30, dateFor('2026-03-30'))
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ horaInicio: '09:00', horaFin: '09:30', disponible: true })
    expect(result[1]).toEqual({ horaInicio: '09:30', horaFin: '10:00', disponible: true })
  })

  it('generates slots for a full 8-hour day with 60-min services', () => {
    // 09:00–17:00 → 8 slots of 60 min
    const h = [horario(1, '09:00', '17:00')]
    const result = calcularSlots(h, [], [], 60, dateFor('2026-03-30'))
    expect(result).toHaveLength(8)
    expect(result[0].horaInicio).toBe('09:00')
    expect(result[7].horaFin).toBe('17:00')
  })

  it('does NOT include a partial slot at the end', () => {
    // 09:00–10:00 with 45-min duration → only 1 slot (09:00-09:45), 09:45-10:30 overflows
    const h = [horario(1, '09:00', '10:00')]
    const result = calcularSlots(h, [], [], 45, dateFor('2026-03-30'))
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ horaInicio: '09:00', horaFin: '09:45', disponible: true })
  })

  it('all slots start as disponible=true when no reservas and no bloqueos', () => {
    const h = [horario(1, '08:00', '12:00')]
    const result = calcularSlots(h, [], [], 30, dateFor('2026-03-30'))
    expect(result.every(s => s.disponible)).toBe(true)
  })
})

// ─── bloqueos por excepción ──────────────────────────────────────────────────

describe('calcularSlots — bloqueos por excepción', () => {
  const baseHorario = [horario(1, '09:00', '12:00')] // Monday, 6 slots of 30 min

  function bloqueo(fecha: string, horaInicio: string, horaFin: string): ExcepcionDisponibilidad {
    return {
      usuarioId: 'usr1',
      empresaId: 'emp1',
      fecha,
      tipo: 'bloqueo',
      horaInicio,
      horaFin,
    }
  }

  it('marks a slot as unavailable when it exactly matches a bloqueo', () => {
    const exc = [bloqueo('2026-03-30', '09:00', '09:30')]
    const result = calcularSlots(baseHorario, exc, [], 30, dateFor('2026-03-30'))
    expect(result[0].disponible).toBe(false) // 09:00-09:30
    expect(result[1].disponible).toBe(true)  // 09:30-10:00
  })

  it('marks multiple slots as unavailable for a wide bloqueo', () => {
    // Bloqueo 09:00–11:00 blocks the first 4 slots
    const exc = [bloqueo('2026-03-30', '09:00', '11:00')]
    const result = calcularSlots(baseHorario, exc, [], 30, dateFor('2026-03-30'))
    expect(result[0].disponible).toBe(false)
    expect(result[1].disponible).toBe(false)
    expect(result[2].disponible).toBe(false)
    expect(result[3].disponible).toBe(false)
    expect(result[4].disponible).toBe(true)
    expect(result[5].disponible).toBe(true)
  })

  it('ignores bloqueos on a different date', () => {
    const exc = [bloqueo('2026-03-31', '09:00', '09:30')] // Tuesday, not Monday
    const result = calcularSlots(baseHorario, exc, [], 30, dateFor('2026-03-30'))
    expect(result.every(s => s.disponible)).toBe(true)
  })

  it('ignores excepciones of tipo "extension"', () => {
    const exc: ExcepcionDisponibilidad[] = [
      { usuarioId: 'usr1', empresaId: 'emp1', fecha: '2026-03-30', tipo: 'extension', horaInicio: '09:00', horaFin: '09:30' },
    ]
    const result = calcularSlots(baseHorario, exc, [], 30, dateFor('2026-03-30'))
    expect(result.every(s => s.disponible)).toBe(true)
  })

  it('detects partial overlap: bloqueo starts inside a slot', () => {
    // Bloqueo 09:15–09:45 overlaps slots 09:00-09:30 and 09:30-10:00
    const exc = [bloqueo('2026-03-30', '09:15', '09:45')]
    const result = calcularSlots(baseHorario, exc, [], 30, dateFor('2026-03-30'))
    expect(result[0].disponible).toBe(false) // 09:00-09:30 overlaps
    expect(result[1].disponible).toBe(false) // 09:30-10:00 overlaps
    expect(result[2].disponible).toBe(true)  // 10:00-10:30 not affected
  })
})

// ─── bloqueos por reservas (UTC-3 conversion) ────────────────────────────────

describe('calcularSlots — ocupados por reservas existentes', () => {
  const baseHorario = [horario(1, '09:00', '12:00')] // Monday
  const lunes = dateFor('2026-03-30')

  it('marks a slot as unavailable when covered by an existing reserva', () => {
    const reservas = [
      { fechaHoraInicio: arTs('2026-03-30', '10:00'), fechaHoraFin: arTs('2026-03-30', '10:30') },
    ]
    const result = calcularSlots(baseHorario, [], reservas, 30, lunes)
    const slot1000 = result.find(s => s.horaInicio === '10:00')
    expect(slot1000?.disponible).toBe(false)
  })

  it('does not affect slots from other dates', () => {
    // Reserva on Tuesday 2026-03-31
    const reservas = [
      { fechaHoraInicio: arTs('2026-03-31', '09:00'), fechaHoraFin: arTs('2026-03-31', '09:30') },
    ]
    const result = calcularSlots(baseHorario, [], reservas, 30, lunes)
    expect(result.every(s => s.disponible)).toBe(true)
  })

  it('correctly converts UTC timestamp to AR time (UTC-3)', () => {
    // A reserva stored at 12:00 UTC corresponds to 09:00 AR
    const reservas = [
      { fechaHoraInicio: '2026-03-30T12:00:00.000Z', fechaHoraFin: '2026-03-30T12:30:00.000Z' },
    ]
    const result = calcularSlots(baseHorario, [], reservas, 30, lunes)
    const slot0900 = result.find(s => s.horaInicio === '09:00')
    expect(slot0900?.disponible).toBe(false)
  })

  it('does not block slots when the UTC timestamp falls on a different AR date', () => {
    // 2026-03-30T02:00:00Z = 2026-03-29T23:00:00 AR → different date
    const reservas = [
      { fechaHoraInicio: '2026-03-30T02:00:00.000Z', fechaHoraFin: '2026-03-30T02:30:00.000Z' },
    ]
    const result = calcularSlots(baseHorario, [], reservas, 30, lunes)
    expect(result.every(s => s.disponible)).toBe(true)
  })

  it('handles multiple reservas on the same day', () => {
    const reservas = [
      { fechaHoraInicio: arTs('2026-03-30', '09:00'), fechaHoraFin: arTs('2026-03-30', '09:30') },
      { fechaHoraInicio: arTs('2026-03-30', '11:00'), fechaHoraFin: arTs('2026-03-30', '11:30') },
    ]
    const result = calcularSlots(baseHorario, [], reservas, 30, lunes)
    expect(result.find(s => s.horaInicio === '09:00')?.disponible).toBe(false)
    expect(result.find(s => s.horaInicio === '11:00')?.disponible).toBe(false)
    // others remain available
    expect(result.find(s => s.horaInicio === '09:30')?.disponible).toBe(true)
    expect(result.find(s => s.horaInicio === '10:00')?.disponible).toBe(true)
  })
})

// ─── combinación: bloqueos + reservas ───────────────────────────────────────

describe('calcularSlots — bloqueos + reservas combinados', () => {
  const baseHorario = [horario(1, '09:00', '12:00')]
  const lunes = dateFor('2026-03-30')

  it('combines bloqueos and reservas to mark multiple slots unavailable', () => {
    const exc: ExcepcionDisponibilidad[] = [
      { usuarioId: 'u', empresaId: 'e', fecha: '2026-03-30', tipo: 'bloqueo', horaInicio: '09:00', horaFin: '09:30' },
    ]
    const reservas = [
      { fechaHoraInicio: arTs('2026-03-30', '10:00'), fechaHoraFin: arTs('2026-03-30', '10:30') },
    ]
    const result = calcularSlots(baseHorario, exc, reservas, 30, lunes)
    expect(result.find(s => s.horaInicio === '09:00')?.disponible).toBe(false)
    expect(result.find(s => s.horaInicio === '10:00')?.disponible).toBe(false)
    expect(result.find(s => s.horaInicio === '09:30')?.disponible).toBe(true)
    expect(result.find(s => s.horaInicio === '10:30')?.disponible).toBe(true)
  })
})

// ─── solapamiento parcial / overlap detection ────────────────────────────────

describe('calcularSlots — overlap detection logic', () => {
  const baseHorario = [horario(1, '09:00', '12:00')]
  const lunes = dateFor('2026-03-30')

  it('a bloqueo that ends exactly at slot start does NOT block the slot', () => {
    // Bloqueo 08:00–09:00: bFin(540) === slotInicio(540) → condition slotInicio < bFin is false
    const exc: ExcepcionDisponibilidad[] = [
      { usuarioId: 'u', empresaId: 'e', fecha: '2026-03-30', tipo: 'bloqueo', horaInicio: '08:00', horaFin: '09:00' },
    ]
    const result = calcularSlots(baseHorario, exc, [], 30, lunes)
    expect(result[0].disponible).toBe(true)
  })

  it('a bloqueo that starts exactly at slot end does NOT block the slot', () => {
    // Bloqueo 09:30–10:00: bInicio(570) === slotFin(570) for slot 09:00-09:30 → slotFin > bInicio is false
    const exc: ExcepcionDisponibilidad[] = [
      { usuarioId: 'u', empresaId: 'e', fecha: '2026-03-30', tipo: 'bloqueo', horaInicio: '09:30', horaFin: '10:00' },
    ]
    const result = calcularSlots(baseHorario, exc, [], 30, lunes)
    expect(result[0].disponible).toBe(true)  // 09:00-09:30 NOT blocked
    expect(result[1].disponible).toBe(false) // 09:30-10:00 IS blocked
  })

  it('a bloqueo strictly inside a slot blocks that slot', () => {
    // Bloqueo 09:10–09:20 is contained inside slot 09:00-09:30
    const exc: ExcepcionDisponibilidad[] = [
      { usuarioId: 'u', empresaId: 'e', fecha: '2026-03-30', tipo: 'bloqueo', horaInicio: '09:10', horaFin: '09:20' },
    ]
    const result = calcularSlots(baseHorario, exc, [], 30, lunes)
    expect(result[0].disponible).toBe(false)
  })
})

// ─── edge cases ──────────────────────────────────────────────────────────────

describe('calcularSlots — edge cases', () => {
  it('returns empty array when duration is longer than the schedule window', () => {
    const h = [horario(1, '09:00', '09:30')] // 30-min window
    const result = calcularSlots(h, [], [], 60, dateFor('2026-03-30'))
    expect(result).toHaveLength(0)
  })

  it('handles a single-slot window that exactly fits the duration', () => {
    const h = [horario(1, '09:00', '09:30')]
    const result = calcularSlots(h, [], [], 30, dateFor('2026-03-30'))
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ horaInicio: '09:00', horaFin: '09:30', disponible: true })
  })

  it('selects the correct day schedule when multiple days are configured', () => {
    const h: HorarioDia[] = [
      horario(1, '09:00', '10:00'), // Monday
      horario(2, '14:00', '16:00'), // Tuesday
    ]
    // 2026-03-31 is Tuesday
    const result = calcularSlots(h, [], [], 60, dateFor('2026-03-31'))
    expect(result).toHaveLength(2)
    expect(result[0].horaInicio).toBe('14:00')
  })

  it('prefers the active schedule when two entries exist for the same day', () => {
    const h: HorarioDia[] = [
      { empresaId: 'emp1', diaSemana: 1, horaInicio: '09:00', horaFin: '10:00', activo: false },
      { empresaId: 'emp1', diaSemana: 1, horaInicio: '14:00', horaFin: '16:00', activo: true },
    ]
    const result = calcularSlots(h, [], [], 60, dateFor('2026-03-30'))
    expect(result).toHaveLength(2)
    expect(result[0].horaInicio).toBe('14:00')
  })

  it('returns correct slot structure (horaInicio, horaFin, disponible)', () => {
    const h = [horario(1, '09:00', '09:30')]
    const result = calcularSlots(h, [], [], 30, dateFor('2026-03-30'))
    expect(result[0]).toHaveProperty('horaInicio')
    expect(result[0]).toHaveProperty('horaFin')
    expect(result[0]).toHaveProperty('disponible')
  })
})
