import { describe, it, expect } from 'vitest'
import { generarLinkWA, WATemplate, DatosNotificacion } from '../whatsapp'

// ---------------------------------------------------------------------------
// Datos de prueba base
// ---------------------------------------------------------------------------
const BASE: DatosNotificacion = {
  profesionalNombre: 'Dra. María López',
  clienteNombre: 'Juan Pérez',
  servicio: 'Consulta Psicología',
  fechaHora: 'lunes 30/03 a las 10:00',
  linkReserva: 'https://mensana.com.ar/reservas/abc123',
}

const BASE_CON_DIRECCION: DatosNotificacion = {
  ...BASE,
  direccion: 'Av. Corrientes 1234, CABA',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parsearLink(link: string): { telefono: string; texto: string } {
  const url = new URL(link)
  const telefono = url.pathname.replace('/', '')
  const texto = url.searchParams.get('text') ?? ''
  return { telefono, texto }
}

// ---------------------------------------------------------------------------
// generarLinkWA — estructura del link
// ---------------------------------------------------------------------------
describe('generarLinkWA — estructura del link', () => {
  it('devuelve una URL de wa.me', () => {
    const link = generarLinkWA('+54 11 1234-5678', 'CONFIRMACION_CLIENTE', BASE)
    expect(link).toMatch(/^https:\/\/wa\.me\//)
  })

  it('elimina todos los caracteres no numéricos del teléfono', () => {
    const link = generarLinkWA('+54 11 1234-5678', 'CONFIRMACION_CLIENTE', BASE)
    const { telefono } = parsearLink(link)
    expect(telefono).toBe('541112345678')
  })

  it('acepta teléfono ya limpio (sólo dígitos)', () => {
    const link = generarLinkWA('541112345678', 'CONFIRMACION_CLIENTE', BASE)
    const { telefono } = parsearLink(link)
    expect(telefono).toBe('541112345678')
  })

  it('acepta teléfono con paréntesis y espacios', () => {
    const link = generarLinkWA('(011) 4444-5555', 'CONFIRMACION_CLIENTE', BASE)
    const { telefono } = parsearLink(link)
    expect(telefono).toBe('01144445555')
  })

  it('el parámetro text está correctamente codificado', () => {
    const link = generarLinkWA('1122334455', 'CONFIRMACION_CLIENTE', BASE)
    expect(link).toContain('?text=')
    // La URL debe poder parsearse sin error
    expect(() => new URL(link)).not.toThrow()
  })

  it('el mensaje decodificado contiene datos del cliente', () => {
    const link = generarLinkWA('1122334455', 'CONFIRMACION_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.servicio)
    expect(texto).toContain(BASE.profesionalNombre)
  })
})

// ---------------------------------------------------------------------------
// Template: NUEVA_RESERVA_PROFESIONAL
// ---------------------------------------------------------------------------
describe('template NUEVA_RESERVA_PROFESIONAL', () => {
  it('incluye el nombre del cliente en negrita', () => {
    const link = generarLinkWA('1100000001', 'NUEVA_RESERVA_PROFESIONAL', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(`*${BASE.clienteNombre}*`)
  })

  it('incluye servicio y fechaHora', () => {
    const link = generarLinkWA('1100000001', 'NUEVA_RESERVA_PROFESIONAL', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.servicio)
    expect(texto).toContain(BASE.fechaHora)
  })

  it('incluye el link de reserva', () => {
    const link = generarLinkWA('1100000001', 'NUEVA_RESERVA_PROFESIONAL', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.linkReserva)
  })
})

// ---------------------------------------------------------------------------
// Template: CONFIRMACION_CLIENTE
// ---------------------------------------------------------------------------
describe('template CONFIRMACION_CLIENTE', () => {
  it('incluye el servicio en negrita', () => {
    const link = generarLinkWA('1100000002', 'CONFIRMACION_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(`*${BASE.servicio}*`)
  })

  it('incluye nombre del profesional y fechaHora', () => {
    const link = generarLinkWA('1100000002', 'CONFIRMACION_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.profesionalNombre)
    expect(texto).toContain(BASE.fechaHora)
  })

  it('incluye la dirección cuando está presente', () => {
    const link = generarLinkWA('1100000002', 'CONFIRMACION_CLIENTE', BASE_CON_DIRECCION)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE_CON_DIRECCION.direccion!)
  })

  it('NO incluye "en undefined" cuando no hay dirección', () => {
    const link = generarLinkWA('1100000002', 'CONFIRMACION_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).not.toContain('en undefined')
    expect(texto).not.toMatch(/\ben\b.*undefined/)
  })

  it('incluye el link de reserva', () => {
    const link = generarLinkWA('1100000002', 'CONFIRMACION_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.linkReserva)
  })
})

// ---------------------------------------------------------------------------
// Template: RECHAZO_CLIENTE
// ---------------------------------------------------------------------------
describe('template RECHAZO_CLIENTE', () => {
  it('incluye el servicio en negrita', () => {
    const link = generarLinkWA('1100000003', 'RECHAZO_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(`*${BASE.servicio}*`)
  })

  it('incluye la fechaHora y el nombre del profesional', () => {
    const link = generarLinkWA('1100000003', 'RECHAZO_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.fechaHora)
    expect(texto).toContain(BASE.profesionalNombre)
  })

  it('no incluye el link de reserva (no se ofrece reagendar con link)', () => {
    const link = generarLinkWA('1100000003', 'RECHAZO_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).not.toContain(BASE.linkReserva)
  })
})

// ---------------------------------------------------------------------------
// Template: CAMBIO_SOLICITADO_CLIENTE
// ---------------------------------------------------------------------------
describe('template CAMBIO_SOLICITADO_CLIENTE', () => {
  it('incluye el nombre del profesional', () => {
    const link = generarLinkWA('1100000004', 'CAMBIO_SOLICITADO_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.profesionalNombre)
  })

  it('incluye el servicio en negrita', () => {
    const link = generarLinkWA('1100000004', 'CAMBIO_SOLICITADO_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(`*${BASE.servicio}*`)
  })

  it('incluye el link de reserva para revisar la propuesta', () => {
    const link = generarLinkWA('1100000004', 'CAMBIO_SOLICITADO_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.linkReserva)
  })
})

// ---------------------------------------------------------------------------
// Template: CAMBIO_SOLICITADO_PROFESIONAL
// ---------------------------------------------------------------------------
describe('template CAMBIO_SOLICITADO_PROFESIONAL', () => {
  it('incluye el nombre del cliente', () => {
    const link = generarLinkWA('1100000005', 'CAMBIO_SOLICITADO_PROFESIONAL', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.clienteNombre)
  })

  it('incluye el servicio en negrita y la fechaHora', () => {
    const link = generarLinkWA('1100000005', 'CAMBIO_SOLICITADO_PROFESIONAL', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(`*${BASE.servicio}*`)
    expect(texto).toContain(BASE.fechaHora)
  })

  it('incluye el link de reserva', () => {
    const link = generarLinkWA('1100000005', 'CAMBIO_SOLICITADO_PROFESIONAL', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.linkReserva)
  })
})

// ---------------------------------------------------------------------------
// Template: CANCELACION_PROFESIONAL_CLIENTE
// ---------------------------------------------------------------------------
describe('template CANCELACION_PROFESIONAL_CLIENTE', () => {
  it('incluye fechaHora y nombre del profesional', () => {
    const link = generarLinkWA('1100000006', 'CANCELACION_PROFESIONAL_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.fechaHora)
    expect(texto).toContain(BASE.profesionalNombre)
  })

  it('menciona devolución de seña', () => {
    const link = generarLinkWA('1100000006', 'CANCELACION_PROFESIONAL_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto.toLowerCase()).toContain('seña')
  })

  it('incluye el link para reagendar', () => {
    const link = generarLinkWA('1100000006', 'CANCELACION_PROFESIONAL_CLIENTE', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.linkReserva)
  })
})

// ---------------------------------------------------------------------------
// Template: CANCELACION_CLIENTE_PROFESIONAL
// ---------------------------------------------------------------------------
describe('template CANCELACION_CLIENTE_PROFESIONAL', () => {
  it('incluye el nombre del cliente', () => {
    const link = generarLinkWA('1100000007', 'CANCELACION_CLIENTE_PROFESIONAL', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.clienteNombre)
  })

  it('incluye fechaHora y servicio en negrita', () => {
    const link = generarLinkWA('1100000007', 'CANCELACION_CLIENTE_PROFESIONAL', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.fechaHora)
    expect(texto).toContain(`*${BASE.servicio}*`)
  })
})

// ---------------------------------------------------------------------------
// Template: RECORDATORIO_24H
// ---------------------------------------------------------------------------
describe('template RECORDATORIO_24H', () => {
  it('incluye servicio en negrita y nombre del profesional', () => {
    const link = generarLinkWA('1100000008', 'RECORDATORIO_24H', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(`*${BASE.servicio}*`)
    expect(texto).toContain(BASE.profesionalNombre)
  })

  it('incluye la fechaHora', () => {
    const link = generarLinkWA('1100000008', 'RECORDATORIO_24H', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.fechaHora)
  })

  it('incluye la dirección cuando está presente', () => {
    const link = generarLinkWA('1100000008', 'RECORDATORIO_24H', BASE_CON_DIRECCION)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE_CON_DIRECCION.direccion!)
  })

  it('no incluye "en undefined" cuando no hay dirección', () => {
    const link = generarLinkWA('1100000008', 'RECORDATORIO_24H', BASE)
    const { texto } = parsearLink(link)
    expect(texto).not.toContain('en undefined')
  })
})

// ---------------------------------------------------------------------------
// Template: RECORDATORIO_1H
// ---------------------------------------------------------------------------
describe('template RECORDATORIO_1H', () => {
  it('incluye servicio en negrita y nombre del profesional', () => {
    const link = generarLinkWA('1100000009', 'RECORDATORIO_1H', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(`*${BASE.servicio}*`)
    expect(texto).toContain(BASE.profesionalNombre)
  })

  it('incluye la fechaHora', () => {
    const link = generarLinkWA('1100000009', 'RECORDATORIO_1H', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain(BASE.fechaHora)
  })

  it('menciona "1 hora"', () => {
    const link = generarLinkWA('1100000009', 'RECORDATORIO_1H', BASE)
    const { texto } = parsearLink(link)
    expect(texto).toContain('1 hora')
  })
})

// ---------------------------------------------------------------------------
// Limpieza de teléfono — casos extremos
// ---------------------------------------------------------------------------
describe('limpieza de teléfono', () => {
  it('elimina guiones y puntos', () => {
    const link = generarLinkWA('011-4444.5555', 'CONFIRMACION_CLIENTE', BASE)
    const { telefono } = parsearLink(link)
    expect(telefono).toBe('01144445555')
  })

  it('elimina signo + y espacios', () => {
    const link = generarLinkWA('+1 (800) 555-0199', 'CONFIRMACION_CLIENTE', BASE)
    const { telefono } = parsearLink(link)
    expect(telefono).toBe('18005550199')
  })

  it('deja un teléfono vacío si sólo hay caracteres no numéricos', () => {
    const link = generarLinkWA('---', 'CONFIRMACION_CLIENTE', BASE)
    const { telefono } = parsearLink(link)
    expect(telefono).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Cobertura de todos los templates (smoke test)
// ---------------------------------------------------------------------------
const TODOS_LOS_TEMPLATES: WATemplate[] = [
  'NUEVA_RESERVA_PROFESIONAL',
  'CONFIRMACION_CLIENTE',
  'RECHAZO_CLIENTE',
  'CAMBIO_SOLICITADO_CLIENTE',
  'CAMBIO_SOLICITADO_PROFESIONAL',
  'CANCELACION_PROFESIONAL_CLIENTE',
  'CANCELACION_CLIENTE_PROFESIONAL',
  'RECORDATORIO_24H',
  'RECORDATORIO_1H',
]

describe('smoke test — todos los templates generan un link válido', () => {
  it.each(TODOS_LOS_TEMPLATES)('%s devuelve una URL wa.me', (template) => {
    const link = generarLinkWA('541112345678', template, BASE)
    expect(link).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
    expect(() => new URL(link)).not.toThrow()
  })
})
