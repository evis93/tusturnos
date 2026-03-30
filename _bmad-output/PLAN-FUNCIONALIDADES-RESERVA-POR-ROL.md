# Plan de Funcionalidades - Ciclo de Reservas por Rol

**Versión:** 1.0  
**Fecha:** 2026-03-30  
**Autor:** QA Engineer  
**Alcance:** Funcionalidades de reserva desde todos los roles  
**Prioridad:** P1 — Core del sistema

---

## Resumen Ejecutivo

Este plan desglosa **todas las funcionalidades del ciclo de reservas** (búsqueda, creación, confirmación, notificaciones, cancelación, estado) agrupadas por rol de usuario. Cada funcionalidad incluye su máquina de estados, reglas de negocio aplicables, y consideraciones de testing.

---

## Índice

1. [CLIENTE](#cliente-funcionalidades)
2. [PROFESIONAL](#profesional-funcionalidades)
3. [ADMIN (Empresa)](#admin-empresa-funcionalidades)
4. [SUPERADMIN](#superadmin-funcionalidades)
5. [Matriz de Interacciones](#matriz-de-interacciones-entre-roles)
6. [Estados y Transiciones](#máquina-de-estados-global)
7. [Testing por Funcionalidad](#plan-de-testing)

---

## CLIENTE — Funcionalidades

### F-CLI-01: Búsqueda de Profesionales

**Descripción:** El cliente busca profesionales disponibles según criterios de geolocalización, especialidad, disponibilidad y modalidad.

**Actores:** Cliente (autenticado o anónimo)

**Flujo Principal:**
1. Cliente accede a `empresa.mensana.com.ar` (o TusTurnos equivalente)
2. Permite acceso a ubicación (geolocalización)
3. Ve lista de profesionales ordenados por distancia
4. Filtra por:
   - Especialidad / categoría
   - Disponibilidad (fecha/hora)
   - Modalidad (presencial | no presencial | ambas)
5. Ordena por reputación (cuando esté implementado), disponibilidad próxima, distancia

**Datos Retornados:**
- Foto, nombre, especialidades
- Próximos horarios disponibles
- Precio (rango o precio del servicio)
- Modalidad
- Distancia al cliente
- Rating (cuando esté implementado)

**Reglas de Negocio:**
- **RB-01**: Solo se muestran profesionales de la misma marca (Mensana ↔ TusTurnos sin mezcla)
- **RB-02**: La búsqueda geolocalizada usa el campo `geography` de Supabase
- **RB-03**: Se excluyen profesionales con disponibilidad bloqueada (excepciones)
- **RB-04**: Se respeta la modalidad configurada del profesional

**Estados:**
- `loading` → `results` | `no_results`

**Casos de Test:**
- ✅ Búsqueda exitosa con resultados
- ✅ Búsqueda sin resultados (nada disponible)
- ✅ Filtro por especialidad
- ✅ Filtro por disponibilidad (fecha futura)
- ✅ Ordenamiento por distancia
- ✅ Aislamiento de marcas (cliente Mensana no ve TusTurnos)
- ✅ Geolocalización desactivada → usar ubicación del perfil
- ✅ Geolocalización desactivada + sin ubicación guardada → error

---

### F-CLI-02: Ver Perfil del Profesional y Servicios

**Descripción:** El cliente visualiza el perfil completo del profesional y sus servicios disponibles.

**Actores:** Cliente

**Flujo Principal:**
1. Cliente hace clic en profesional de resultados de búsqueda
2. Navega a `/profesional/[id]`
3. Ve:
   - Foto(s) y galería
   - Nombre, especialidades, descripción/bio
   - Servicios con nombre, descripción, duración, precio
   - Monto de seña por servicio
   - Modalidad (presencial/no presencial)
   - Dirección (si presencial)
   - Horarios disponibles (próximos 7 o 30 días)
   - Rating/reseñas (cuando esté implementado)

**Datos:**
```
{
  id: string,
  nombre: string,
  foto_url: string,
  especialidades: string[],
  descripcion: string,
  modalidad: "presencial" | "no_presencial" | "ambas",
  servicios: [
    { id, nombre, descripcion, duracion_minutos, precio, seña_monto, seña_porcentaje }
  ],
  direccion: string,
  coordenadas: { lat, lng },
  disponibilidad: { fecha: date, horarios: string[] }
}
```

**Reglas:**
- **RB-05**: Los servicios muestran tanto el precio como el monto de seña (fijo o % calculado)
- **RB-06**: La disponibilidad se calcula en base al horario semanal de la empresa + excepciones del profesional

**Casos de Test:**
- ✅ Ver perfil completo sin errores
- ✅ Servicios se cargan correctamente
- ✅ Disponibilidad muestra horarios reales (sin bloqueados)
- ✅ Seña calcula correctamente si es % del precio
- ✅ Dirección oculta si profesional selecciona "no presencial"
- ✅ Carga de galería correcta
- ✅ Profesional sin servicios aún → estado especial

---

### F-CLI-03: Seleccionar Servicio y Horario

**Descripción:** El cliente elige un servicio y un horario disponible para reservar.

**Actores:** Cliente

**Flujo Principal:**
1. Cliente desde perfil del profesional selecciona un servicio
2. Elige una fecha
3. Ve horarios disponibles para esa fecha (bloques de duración del servicio)
4. Selecciona un horario
5. Se le muestra resumen:
   - Profesional, servicio, fecha, hora
   - Duración, precio, seña
   - Modalidad, dirección (si aplica)
   - Botón "Continuar" o "Reservar"

**Datos:**
```
{
  profesional_id: string,
  servicio_id: string,
  fecha: date,
  hora_inicio: time,
  duracion_minutos: number,
  precio: number,
  seña_monto: number,
  cliente_nombre: string (pre-rellenado si existe),
  cliente_email: string,
  cliente_telefono: string
}
```

**Reglas:**
- **RB-07**: No se puede seleccionar una fecha/hora que esté:
  - En el pasado
  - Bloqueada por excepción del profesional
  - Ya ocupada por otra reserva confirmada
- **RB-08**: La duración del bloque = duración del servicio (no hay solapamientos)
- **RB-09**: Si el cliente no está autenticado, se muestra pantalla de login/registro **antes** del resumen

**Casos de Test:**
- ✅ Seleccionar servicio y horario válido
- ✅ Intentar seleccionar horario en el pasado → bloquear
- ✅ Intentar seleccionar horario ocupado → mostrar como no disponible
- ✅ Seleccionar la misma fecha/hora que otro cliente → mostrar como ocupado
- ✅ Horarios disponibles se actualizan en tiempo real (caché o polling)
- ✅ Cliente no autenticado → redirigir a login
- ✅ Resumen muestra datos correctos (precio, seña, duración)

---

### F-CLI-04: Autenticación y Registro del Cliente

**Descripción:** El cliente se autentica o se registra (por plataforma, por profesional o auto-registro).

**Actores:** Cliente

**Flujo Principal — Auto-registro:**
1. Cliente hace clic en "Crear Cuenta"
2. Ingresa: nombre, email, teléfono, contraseña
3. Sistema valida email único
4. Crea `auth.user` en Supabase
5. Redirige a dashboard o de vuelta a flujo de reserva

**Flujo Principal — Registro por Profesional:**
1. Profesional ingresa datos del cliente (nombre, email, teléfono)
2. Sistema crea automáticamente `auth.user` con contraseña `123456`
3. Envía notificación WhatsApp con instrucciones de cambio de contraseña
4. Al primer login, cliente **debe** cambiar contraseña

**Flujo Principal — Login:**
1. Cliente ingresa email y contraseña
2. Valida credenciales
3. Si es primer login + fue registrado por profesional → fuerza cambio de contraseña
4. Redirige a dashboard

**Datos:**
```
{
  nombre: string,
  email: string (único),
  telefono: string (único),
  contraseña: string,
  primer_login: boolean (default true si registró profesional)
}
```

**Reglas:**
- **RB-10**: Un cliente puede tener múltiples reservas en distintas empresas con el mismo `auth.user`
- **RB-11**: La contraseña inicial de registro por profesional es `123456` (temporal)
- **RB-12**: Al primer login con contraseña temporal, se fuerza cambio (modal bloqueante)
- **RB-13**: Email y teléfono deben ser únicos en la plataforma

**Casos de Test:**
- ✅ Auto-registro con datos válidos
- ✅ Registro con email duplicado → error
- ✅ Registro con teléfono duplicado → error
- ✅ Contraseña débil → validar
- ✅ Login exitoso
- ✅ Login con credenciales inválidas → error
- ✅ Primer login con contraseña temporal → fuerza cambio
- ✅ Registro por profesional crea usuario con `contraseña = 123456`
- ✅ Recuperación de contraseña (flow completo)

---

### F-CLI-05: Crear Reserva y Pago de Seña (MercadoPago)

**Descripción:** El cliente confirma la reserva y realiza el pago de la seña.

**Actores:** Cliente, Processador de Pagos (MercadoPago)

**Flujo Principal:**
1. Cliente revisa resumen de reserva
2. Confirma datos (nombre, email, teléfono, dirección si aplica)
3. Hace clic en "Pagar Seña"
4. Redirige a MercadoPago (iframe o ventana emergente)
5. Realiza pago exitoso
6. MercadoPago retorna a `callback_url` con `payment_id`
7. Sistema:
   - Valida el pago con MercadoPago API
   - Crea reserva en estado `PENDIENTE`
   - Retiene la seña en cuenta de plataforma
   - Crea `cliente_id` si no existe
   - Envía notificación WhatsApp al cliente: "Solicitud recibida"
   - Envía notificación WhatsApp al profesional: "Nueva reserva pendiente"
8. Redirige a cliente a pantalla de "Reserva Exitosa" con detalles

**Datos de Reserva Creada:**
```
{
  id: uuid,
  cliente_id: uuid,
  profesional_id: uuid,
  empresa_id: uuid,
  servicio_id: uuid,
  fecha: date,
  hora_inicio: time,
  duracion_minutos: number,
  precio: number,
  seña_monto: number,
  estado: "PENDIENTE",
  payment_id: string (MercadoPago),
  created_at: timestamp,
  updated_at: timestamp
}
```

**Reglas de Negocio:**
- **RB-14**: La seña se retiene en la plataforma, no en la cuenta del profesional
- **RB-15**: Si el pago falla, no se crea la reserva. Se muestra mensaje de error
- **RB-16**: El cliente puede intentar el pago nuevamente
- **RB-17**: Sistema debe manejar reintentos de MercadoPago (webhook de confirmación)

**Casos de Test:**
- ✅ Pago exitoso → crear reserva en estado PENDIENTE
- ✅ Pago rechazado → no crear reserva, mostrar error
- ✅ Timeout de pago → manejar gracefully
- ✅ Webhook de MercadoPago confirma pago correctamente
- ✅ Duplicación de webhook → idempotencia (no crear 2 reservas)
- ✅ Seña se calcula correctamente (monto fijo vs %)
- ✅ Cliente recibe notificación WhatsApp
- ✅ Profesional recibe notificación WhatsApp
- ✅ Datos de reserva se guardan correctamente
- ✅ Primer login de cliente nuevo → cambio de contraseña

---

### F-CLI-06: Recibir Confirmación/Rechazo de Reserva

**Descripción:** El cliente recibe notificación cuando el profesional confirma o rechaza su reserva.

**Actores:** Cliente, Profesional

**Flujo Principal — Confirmación:**
1. Profesional ve reserva pendiente y hace clic "Confirmar"
2. Sistema actualiza estado a `CONFIRMADA`
3. Envía notificación WhatsApp al cliente: "Tu reserva ha sido confirmada" + detalles
4. Cliente ve su reserva como confirmada en su dashboard

**Flujo Principal — Rechazo:**
1. Profesional hace clic "Rechazar"
2. Sistema actualiza estado a `RECHAZADA`
3. Inicia devolución automática de seña
4. Envía notificación WhatsApp al cliente: "Tu reserva ha sido rechazada" + opción de reagendar

**Datos:**
```
{
  reserva_id: uuid,
  estado_anterior: "PENDIENTE",
  estado_nuevo: "CONFIRMADA" | "RECHAZADA",
  actualizado_por: profesional_id,
  comentario_profesional: string (opcional, para rechazo)
}
```

**Reglas:**
- **RB-18**: When a reservation is rejected, the down payment is automatically returned within 24 hours
- **RB-19**: El cliente puede ver historial de cambios de estado en detalle de reserva

**Casos de Test:**
- ✅ Profesional confirma → estado CONFIRMADA, cliente notificado
- ✅ Profesional rechaza → estado RECHAZADA, devolución iniciada, cliente notificado
- ✅ Notificación WhatsApp llega correctamente
- ✅ Cliente ve confirmación en dashboard
- ✅ Cambio de estado 24h después → sin problemas de race condition
- ✅ Múltiples reservas pendientes → cada una se procesa independientemente

---

### F-CLI-07: Cancelación de Reserva por Cliente

**Descripción:** El cliente cancela una reserva confirmada, con reglas de plazo y devolución de seña.

**Actores:** Cliente

**Flujo Principal:**
1. Cliente accede a reserva en estado `CONFIRMADA`
2. Hace clic en "Cancelar Reserva"
3. Sistema calcula:
   - Plazo de cancelación configurado por empresa (ej: 48h, 7 días)
   - Tiempo desde ahora hasta fecha/hora de turno
   - Si está dentro del plazo → "Seña será devuelta"
   - Si está fuera del plazo → "Perderá la seña" (warning explícito)
4. Muestra modal de confirmación con advertencia clara
5. Si cliente confirma fuera de plazo:
   - Pide confirmación adicional: "¿Está seguro? Perderá $XX"
6. Si confirma:
   - Estado → `CANCELADA_CLIENTE`
   - Si dentro de plazo: inicia devolución de seña (reintegro a MercadoPago)
   - Si fuera de plazo: seña queda retenida en plataforma
   - Notifica al profesional: "Reserva cancelada por cliente"

**Datos:**
```
{
  reserva_id: uuid,
  estado: "CANCELADA_CLIENTE",
  razon: string (opcional),
  seña_devuelta: boolean,
  dentro_de_plazo: boolean,
  timestamp_cancelacion: timestamp
}
```

**Reglas de Negocio:**
- **RB-20**: El plazo de cancelación es configurable por admin de empresa (ej: 48h antes del turno)
- **RB-21**: Si cliente cancela dentro del plazo → seña devuelta íntegra en 1-3 días hábiles
- **RB-22**: Si cliente cancela fuera del plazo → seña retenida sin devolución (confirmación explícita obligatoria)
- **RB-23**: No se puede cancelar una reserva ya completada o rechazada

**Casos de Test:**
- ✅ Cancelación dentro del plazo → seña devuelta, profesional notificado
- ✅ Cancelación fuera del plazo → warning mostrado, confirmación doble solicitada
- ✅ Cancelación fuera del plazo confirma → seña no devuelta, registrado
- ✅ No se puede cancelar reserva fuera de estado CONFIRMADA
- ✅ Plazo se calcula correctamente (considerar zonas horarias)
- ✅ Devolución de seña se procesa en MercadoPago
- ✅ Cliente recibe confirmación de cancelación

---

### F-CLI-08: Solicitar Cambio de Horario

**Descripción:** El cliente propone un cambio de fecha/hora para su reserva confirmada.

**Actores:** Cliente, Profesional

**Flujo Principal:**
1. Cliente ve reserva confirmada
2. Hace clic "Cambiar Horario"
3. Ve calendario de disponibilidad del profesional nuevamente
4. Selecciona nueva fecha/hora
5. Envía solicitud (sin pago adicional)
6. Estado → `CAMBIO_SOLICITADO`
7. Notifica al profesional: "Cliente propone cambio a [nueva fecha/hora]"
8. Profesional:
   - Acepta cambio → nueva reserva en estado PENDIENTE (se reinicia flujo de confirmación con misma seña)
   - Rechaza cambio → vuelve anterior a CONFIRMADA
   - Propone otro horario → envía nueva propuesta

**Datos:**
```
{
  reserva_original_id: uuid,
  estado: "CAMBIO_SOLICITADO",
  fecha_propuesta: date,
  hora_propuesta: time,
  solicitado_por: "cliente" | "profesional",
  timestamp_solicitud: timestamp
}
```

**Reglas:**
- **RB-24**: Un cambio de horario **no consume seña adicional**. Se reutiliza la misma seña pagada
- **RB-25**: Si se acepta el cambio, se crea una nueva reserva en estado PENDIENTE con misma seña
- **RB-26**: La seña permanece retenida durante todo el proceso de cambio

**Casos de Test:**
- ✅ Cliente solicita cambio a horario disponible
- ✅ Profesional acepta cambio → nueva reserva PENDIENTE creada con misma seña
- ✅ Profesional rechaza cambio → reserva vuelve a CONFIRMADA
- ✅ Cliente no puede cambiar a horario ocupado
- ✅ Cambio no crea cargo adicional
- ✅ Múltiples cambios solicitados → última propuesta válida

---

### F-CLI-09: Recordatorios Automáticos

**Descripción:** El cliente recibe recordatorios automáticos de sus reservas confirmadas.

**Actores:** Sistema (scheduled job)

**Flujo Principal:**
1. Sistema ejecuta job cada hora (o configurado)
2. Busca reservas en estado `CONFIRMADA` con:
   - `fecha_turno - ahora = 24 horas ± 30 min`
   - O `fecha_turno - ahora = 1 hora ± 15 min`
3. Para cada reserva:
   - Envía WhatsApp al cliente: "Recordatorio: Tu reserva es mañana / en 1 hora"
   - Incluye profesional, hora, dirección, link a confirmación de asistencia (cuando esté implementado)
4. Marca como notificado en DB para evitar duplicados

**Datos:**
```
{
  reserva_id: uuid,
  tipo_recordatorio: "24h" | "1h",
  enviado_at: timestamp,
  canal: "whatsapp"
}
```

**Reglas:**
- **RB-27**: Se envía 1 recordatorio a 24h antes (entre 23h 30min y 24h 30min)
- **RB-28**: Se envía 1 recordatorio a 1h antes (entre 45min y 1h 15min)
- **RB-29**: Si hay error de envío, se reintentan hasta 3 veces en 5 minutos
- **RB-30**: No se envía recordatorio si reserva fue cancelada

**Casos de Test:**
- ✅ Recordatorio 24h se envía correctamente
- ✅ Recordatorio 1h se envía correctamente
- ✅ Idempotencia: no se envía dos veces el mismo recordatorio
- ✅ Recordatorio no se envía si reserva está cancelada
- ✅ Mensaje incluye datos correctos (profesional, hora, dirección)
- ✅ Timezone del cliente respetado (si está guardado en perfil)
- ✅ Error de envío → reintentos

---

### F-CLI-10: Ver Dashboard / Historial de Reservas

**Descripción:** El cliente ve un dashboard con sus reservas actuales, pasadas y pendientes.

**Actores:** Cliente autenticado

**Flujo Principal:**
1. Cliente accede a `/dashboard` o `/mis-reservas`
2. Ve tabs: "Próximas" | "Confirmadas" | "Pasadas" | "Canceladas"
3. Cada tab muestra:
   - Lista de reservas con: profesional, servicio, fecha/hora, estado
   - Acciones disponibles según estado (Cancelar, Cambiar horario, etc.)
   - Detalles de reserva si hace clic
4. Detalle incluye:
   - Datos del profesional (foto, nombre, teléfono)
   - Servicio, precio, seña pagada
   - Historial de cambios de estado

**Reglas:**
- **RB-31**: Cliente solo ve sus propias reservas (en todas las empresas)
- **RB-32**: Reservas completadas (fecha superada) → auto-movidas a "Pasadas"
- **RB-33**: Mostrar opción de "Reagendar" en reservas canceladas (profesional)

**Casos de Test:**
- ✅ Dashboard carga correctamente
- ✅ Tabs muestran reservas en estado correcto
- ✅ Detalle de reserva muestra todos los datos
- ✅ Acciones disponibles según estado (solo Cancelar en CONFIRMADA, etc.)
- ✅ Historial de cambios visible
- ✅ Reserva completada auto-movida a "Pasadas"
- ✅ Múltiples empresas → todas las reservas visibles

---

## PROFESIONAL — Funcionalidades

### F-PRO-01: Ver Agenda

**Descripción:** El profesional visualiza su agenda de turnos confirmados y pendientes.

**Actores:** Profesional autenticado

**Flujo Principal:**
1. Profesional accede a `/agenda` o `/panel`
2. Ve vista de agenda: Día | Semana | Mes (selector)
3. Cada turno confirmado muestra:
   - Cliente, servicio, horario, duración
   - Estado (PENDIENTE, CONFIRMADA, etc.)
   - Acciones rápidas (Confirmar, Rechazar, Cancelar)
4. Bloques ocupados aparecen en color diferente
5. Bloques disponibles en blanco
6. Puede hacer clic en un bloque para ver detalles

**Datos:**
```
{
  reservas: [
    {
      id, cliente_nombre, servicio_nombre, 
      fecha, hora_inicio, duracion, estado, 
      seña_monto
    }
  ]
}
```

**Reglas:**
- **RB-34**: Se muestra solo agenda de este profesional
- **RB-35**: Bloques ocupados = reservas CONFIRMADAS (no PENDIENTES, no RECHAZADAS)
- **RB-36**: Excepciones (bloqueos) aparecen como bloques no disponibles

**Casos de Test:**
- ✅ Agenda diaria carga correctamente
- ✅ Agenda semanal y mensual funcionan
- ✅ Turnos confirmados aparecen como ocupados
- ✅ Turnos pendientes aparecen pero con estilo diferente
- ✅ Excepciones de disponibilidad aparecen como bloques
- ✅ Cambio entre vistas sin errores
- ✅ Scroll en vista mensual

---

### F-PRO-02: Ver Lista de Reservas Pendientes

**Descripción:** El profesional ve todas sus reservas en estado PENDIENTE para confirmar o rechazar.

**Actores:** Profesional

**Flujo Principal:**
1. Profesional accede a "/reservas-pendientes" o tab en panel
2. Ve lista de todas las reservas PENDIENTE:
   - Cliente, servicio, fecha/hora, seña pagada
   - Tiempo desde que se recibió (ej: "hace 2 horas")
3. Ordenadas por fecha de turno (próximas primero)
4. Puede:
   - Hacer clic para ver detalle completo
   - Confirmar directamente
   - Rechazar directamente
   - Proponer cambio de horario

**casos de Test:**
- ✅ Lista carga todas las PENDIENTES
- ✅ Ordenamiento por fecha correcta
- ✅ Tiempo desde recepción se actualiza (display)
- ✅ Acciones rápidas disponibles
- ✅ Detalle completo muestra datos de cliente

---

### F-PRO-03: Confirmar Reserva

**Descripción:** El profesional confirma una reserva pendiente.

**Actores:** Profesional

**Flujo Principal:**
1. Profesional hace clic en "Confirmar" en reserva PENDIENTE
2. Modal opcional: ¿Enviar confirmación al cliente?
   - Por defecto: "Solo notificación" (se ejecuta automáticamente)
   - Opción: "Escribir mensaje personalizado"
3. Si selecciona personalizado:
   - Se abre WhatsApp Web pre-rellenado con template + texto adicional
   - Profesional puede editar antes de enviar
   - Confirmación es manual (user envía desde WhatsApp)
4. Sistema:
   - Cambia estado a `CONFIRMADA`
   - Bloquea el horario (no disponible para otros clientes)
   - Envía notificación WhatsApp al cliente (template estándar)
   - Registra timestamp de confirmación

**Datos:**
```
{
  reserva_id: uuid,
  confirmada_por: profesional_id,
  estado: "CONFIRMADA",
  timestamp_confirmacion: timestamp,
  mensaje_personalizado: string (opcional)
}
```

**Reglas:**
- **RB-37**: Confirmar genera bloqueo automático del horario
- **RB-38**: No se puede confirmar si el horario ya está ocupado (race condition check)
- **RB-39**: Cliente recibe notificación WhatsApp con link a reserva
- **RB-40**: Se puede confirmar parcialmente (confirmar múltiples al mismo tiempo)

**Casos de Test:**
- ✅ Confirmar con notificación automática
- ✅ Estado cambia correctamente a CONFIRMADA
- ✅ Horario bloqueado automáticamente
- ✅ Cliente notificado
- ✅ Confirmación personalizada abre WhatsApp
- ✅ Race condition: 2 profesionales confirman mismo horario → fallo en el 2do

---

### F-PRO-04: Rechazar Reserva

**Descripción:** El profesional rechaza una reserva pendiente (sin propuesta de cambio).

**Actores:** Profesional

**Flujo Principal:**
1. Profesional hace clic en "Rechazar"
2. Modal:
   - Razón del rechazo (dropdown: "No disponible", "Alcance fuera de especialidad", "Otro")
   - Campo opcional: comentario
   - Checkbox: "¿Proponer alternativa?" (redirige a F-PRO-05)
3. Si confirma:
   - Estado → `RECHAZADA`
   - Inicia devolución automática de seña (24h)
   - Envía notificación WhatsApp al cliente: "Lamentablemente no pudimos agendar"
   - Incluye razón si es estándar

**Datos:**
```
{
  reserva_id: uuid,
  rechazada_por: profesional_id,
  estado: "RECHAZADA",
  razon: string,
  comentario: string (opcional),
  timestamp_rechazo: timestamp
}
```

**Reglas:**
- **RB-41**: Rechazo automáticamente inicia devolución de seña
- **RB-42**: Devolución se procesa en MercadoPago dentro de 24 horas
- **RB-43**: Cliente recibe notificación con opción de reagendar
- **RB-44**: No se puede rechazar reserva ya confirmada

**Casos de Test:**
- ✅ Rechazo simple
- ✅ Estado cambia a RECHAZADA
- ✅ Devolución de seña iniciada
- ✅ Cliente notificado
- ✅ Razón se registra correctamente
- ✅ Cliente ve opción de reagendar en notificación

---

### F-PRO-05: Proponer Cambio de Horario

**Descripción:** El profesional sugiere un cambio de fecha/hora para una reserva (PENDIENTE o CONFIRMADA).

**Actores:** Profesional

**Flujo Principal:**
1. Profesional elige reserva y hace clic "Proponer Cambio"
2. Calendario se abre con su disponibilidad
3. Selecciona nueva fecha/hora
4. Sistema valida disponibilidad
5. Envía propuesta al cliente vía WhatsApp:
   - "He propuesto cambiar tu cita a [nueva fecha/hora]. ¿Te parece?"
   - Link para aceptar/rechazar desde plataforma
6. Estados:
   - Reserva original → `CAMBIO_SOLICITADO`
   - Cliente acepta → nueva reserva `PENDIENTE` con misma seña
   - Cliente rechaza → reserva vuelve al estado anterior

**Reglas:**
- **RB-45**: No consume seña adicional
- **RB-46**: Seña se mantiene retenida durante cambio
- **RB-47**: Si cliente rechaza propuesta, profesional puede hacer otra

**Casos de Test:**
- ✅ Propuesta con horario válido
- ✅ Cliente notificado
- ✅ Cliente acepta → nueva reserva creada en PENDIENTE
- ✅ Cliente rechaza → vuelve al estado anterior
- ✅ Múltiples propuestas → última es válida

---

### F-PRO-06: Cancelar Reserva (Profesional)

**Descripción:** El profesional cancela una reserva (cualquier estado excepto COMPLETADA).

**Actores:** Profesional

**Flujo Principal:**
1. Profesional hace clic "Cancelar Reserva"
2. Modal de confirmación: razón (dropdown + comentario opcional)
3. Advertencia clara: "El cliente recibirá devolución de seña"
4. Si confirma:
   - Estado → `CANCELADA_PROFESIONAL`
   - Inicia devolución inmediata de seña a cliente
   - Envía notificación WhatsApp al cliente: "Lamentablemente debo cancelar tu cita por [razón]"
   - Invita al cliente a reagendar
   - Profesional recibe confirmación en panel

**Datos:**
```
{
  reserva_id: uuid,
  cancelada_por_profesional: true,
  razon: string,
  estado: "CANCELADA_PROFESIONAL",
  timestamp_cancelacion: timestamp
}
```

**Reglas:**
- **RB-48**: Cancelación por profesional SIEMPRE devuelve seña (sin excepciones)
- **RB-49**: Devolución se procesa en máx 24h
- **RB-50**: Horario queda disponible nuevamente para otros clientes

**Casos de Test:**
- ✅ Cancelación simple
- ✅ Estado correcto
- ✅ Devolución iniciada
- ✅ Cliente notificado
- ✅ Horario disponible nuevamente
- ✅ No se puede cancelar COMPLETADA

---

### F-PRO-07: Configurar Servicios

**Descripción:** El profesional define, edita y elimina sus servicios.

**Actores:** Profesional

**Flujo Principal — Crear:**
1. Profesional accede a "Mis Servicios"
2. Botón "+ Nuevo Servicio"
3. Formulario:
   - Nombre del servicio
   - Descripción
   - Duración (minutos)
   - Precio
   - Tipo de seña: Fijo | Porcentaje del precio
   - Monto de seña
4. Valida:
   - Duración > 0
   - Precio > 0
   - Seña (fijo o %) > 0 y < precio
5. Guarda
6. Servicio aparece en búsqueda de clientes

**Flujo Principal — Editar:**
1. Profesional selecciona servicio
2. Modifica campos (excepto si hay reservas PENDIENTES/CONFIRMADAS con este servicio)
3. Guarda

**Flujo Principal — Eliminar:**
1. Profesional selecciona servicio
2. Si hay reservas activas → bloquear eliminación, sugerir inactivar
3. Si no hay reservas → elimina

**Datos:**
```
{
  profesional_id: uuid,
  nombre: string,
  descripcion: string,
  duracion_minutos: number,
  precio: number,
  seña_tipo: "fijo" | "porcentaje",
  seña_monto: number | null,
  seña_porcentaje: number | null,
  activo: boolean,
  created_at, updated_at
}
```

**Reglas:**
- **RB-51**: Un profesional puede tener múltiples servicios
- **RB-52**: Cambio de precio de servicio no afecta reservas existentes (precio es snapshot en el momento)
- **RB-53**: Cambio de seña sí afecta nuevas reservas

**Casos de Test:**
- ✅ Crear servicio nuevo
- ✅ Validación de campos
- ✅ Editar servicio
- ✅ Eliminar si no hay reservas
- ✅ Bloquear eliminación si hay reservas activas
- ✅ Servicio aparece en búsqueda después de crear
- ✅ Cambio de precio no refleja en reservas antiguas
- ✅ Múltiples servicios

---

### F-PRO-08: Configurar Disponibilidad (Excepciones)

**Descripción:** El profesional define excepciones sobre el horario base de la empresa.

**Actores:** Profesional

**Flujo Principal:**
1. Profesional accede a "Disponibilidad"
2. Ve horario base de empresa (heredado)
3. Puede agregar excepciones:
   - **Bloquear fecha**: ej "25 de Diciembre, no hay atención"
   - **Bloquear rango**: ej "1-15 de Enero, vacaciones"
   - **Bloquear horarios específicos**: ej "Miércoles 14:00-15:00, reunión"
4. Visualización: calendario con excepciones marcadas
5. Puede editar o eliminar excepciones

**Datos:**
```
{
  profesional_id: uuid,
  tipo: "fecha_completa" | "rango_fechas" | "horario_especifico",
  fecha_inicio: date,
  fecha_fin: date (null si fecha_completa),
  hora_inicio: time (null si fecha_completa),
  hora_fin: time (null si fecha_completa),
  descripcion: string (ej: "Vacaciones"),
  created_at, updated_at
}
```

**Reglas:**
- **RB-54**: Las excepciones se suman al horario base (no lo reemplazan)
- **RB-55**: Si hay reservas confirmadas en una fecha que se bloquea → advertencia
- **RB-56**: Puede bloquear desde hoy en adelante
- **RB-57**: No puede bloquear fechas pasadas

**Casos de Test:**
- ✅ Bloquear fecha completa
- ✅ Bloquear rango de fechas
- ✅ Bloquear horario específico
- ✅ Visualización en calendario correcta
- ✅ Editar excepción
- ✅ Eliminar excepción
- ✅ Advertencia si hay reservas en fecha bloqueada
- ✅ No permite bloquear pasado

---

### F-PRO-09: Ver Historial de Reservas

**Descripción:** El profesional ve todas sus reservas históricas (completadas, rechazadas, canceladas).

**Actores:** Profesional

**Flujo Principal:**
1. Profesional accede a "Historial" o "Todas las Reservas"
2. Ve lista con filtros:
   - Por estado (CONFIRMADA, COMPLETADA, RECHAZADA, CANCELADA)
   - Por rango de fechas
   - Por cliente (búsqueda)
3. Columnas: Cliente, Servicio, Fecha, Hora, Estado, Precio, Seña, Acciones
4. Puede hacer clic para ver detalle completo (incluye transacciones de pago)

**Casos de Test:**
- ✅ Cargar historial completo
- ✅ Filtros funcionan correctamente
- ✅ Búsqueda por cliente
- ✅ Rango de fechas
- ✅ Detalle incluye info de pago

---

## ADMIN (Empresa) — Funcionalidades

### F-ADM-01: Crear Cliente Manualmente

**Descripción:** El admin crea un cliente en el sistema para que él o sus profesionales puedan hacer reservas.

**Actores:** Admin

**Flujo Principal:**
1. Admin accede a "Clientes" → "+ Nuevo Cliente"
2. Formulario:
   - Nombre
   - Email (único)
   - Teléfono (único)
   - Dirección (opcional)
   - Coordenadas geográficas (opcional, si presencial)
3. Sistema crea automáticamente `auth.user` con contraseña temporal `123456`
4. Envía notificación WhatsApp: "Tu cuenta ha sido creada. Contraseña temporal: 123456. Cámbiala al ingresar"
5. Cliente aparece en sistema

**Reglas:**
- **RB-58**: Contraseña temporal obligatoria en primer login
- **RB-59**: Email y teléfono deben ser únicos en la plataforma

**Casos de Test:**
- ✅ Crear cliente nuevo
- ✅ Validación de email único
- ✅ Validación de teléfono único
- ✅ Cliente puede acceder con contraseña temporal
- ✅ Primer login fuerza cambio de contraseña

---

### F-ADM-02: Configurar Horario Base de Empresa

**Descripción:** El admin define el horario semanal de atención base para toda la empresa (heredado por profesionales).

**Actores:** Admin

**Flujo Principal:**
1. Admin accede a "Configuración" → "Horario Base"
2. Tabla con días de semana: Lunes a Domingo
3. Para cada día:
   - Checkbox: "Se trabaja este día"
   - Hora inicio / Hora fin
   - Ej: Lun-Vie 09:00-18:00, Sábado 09:00-13:00
4. Guarda

**Datos:**
```
{
  empresa_id: uuid,
  dia_semana: 0-6 (0=Domingo),
  se_trabaja: boolean,
  hora_inicio: time,
  hora_fin: time
}
```

**Reglas:**
- **RB-60**: Profesionales heredan este horario como base y pueden ajustar excepciones
- **RB-61**: Cambio de horario base no afecta reservas existentes
- **RB-62**: Cambio de horario base sí afecta disponibilidad futura

**Casos de Test:**
- ✅ Configurar horario completo
- ✅ Múltiples rangos de horas (si se implementa)
- ✅ Guardar correctamente
- ✅ Profesionales ven horario base actualizado

---

### F-ADM-03: Configurar Política de Cancelación del Cliente

**Descripción:** El admin define cuánto tiempo antes puede el cliente cancelar sin penalidades.

**Actores:** Admin

**Flujo Principal:**
1. Admin accede a "Configuración" → "Política de Cancelación"
2. Campo: Plazo (número) + Unidad (horas | días)
   - Ej: "48 horas", "7 días"
3. Explicación clara: "Si el cliente cancela más de X [unidad] antes del turno, recibe devolución completa"
4. Guarda

**Datos:**
```
{
  empresa_id: uuid,
  plazo_cantidad: number,
  plazo_unidad: "horas" | "dias",
  descripcion: string (para mostrar al cliente)
}
```

**Reglas:**
- **RB-63**: Cliente cancela dentro del plazo → seña devuelta
- **RB-64**: Cliente cancela fuera del plazo → requiere confirmación doble y seña retenida
- **RB-65**: Cambio de política no afecta reservas existentes (aplica a nuevas)

**Casos de Test:**
- ✅ Configurar plazo en horas
- ✅ Configurar plazo en días
- ✅ Cálculo correcto en flujo de cancelación cliente
- ✅ Cambio de política no afecta reservas antiguas

---

### F-ADM-04: Ver Todas las Reservas de la Empresa

**Descripción:** El admin ve un dashboard consolidado de todas las reservas de todos sus profesionales.

**Actores:** Admin

**Flujo Principal:**
1. Admin accede a "Reservas" → panel consolidado
2. Vista tabla con columnas:
   - Fecha/Hora, Profesional, Cliente, Servicio, Estado, Seña Pagada, Acciones
3. Filtros:
   - Por profesional
   - Por estado (PENDIENTE, CONFIRMADA, COMPLETADA, etc.)
   - Por rango de fechas
4. Ordenamiento por fecha (próximos primero)
5. Ver detalle de reserva (incluye historial de cambios)

**Reglas:**
- **RB-66**: Admin ve todas sus reservas pero no las de otras empresas

**Casos de Test:**
- ✅ Dashboard carga todas las reservas
- ✅ Filtros funcionan
- ✅ Ordenamiento correcto
- ✅ Detalle accesible

---

### F-ADM-05: Gestionar Profesionales (CRUD)

**Descripción:** El admin puede crear, editar y eliminar profesionales en su empresa.

**Actores:** Admin

**Flujo Principal — Crear:**
1. Admin accede a "Profesionales" → "+ Nuevo"
2. Formulario:
   - Nombre, foto, especialidades
   - Descripción/bio
   - Email, teléfono
   - Modalidad (presencial/no presencial/ambas)
   - Dirección + coordenadas (si presencial)
3. Sistema crea automáticamente `auth.user` con rol "profesional"
4. Contraseña temporal `123456`
5. Profesional recibe notificación

**Flujo Principal — Editar:**
1. Admin selecciona profesional
2. Modify campos permitidos
3. Guarda

**Flujo Principal — Eliminar:**
1. Si tiene reservas activas → bloquear
2. Si no → elimina

**Casos de Test:**
- ✅ Crear profesional
- ✅ Editar datos
- ✅ Bloquear eliminación si tiene reservas activas
- ✅ Profesional accede con credenciales temporales

---

## SUPERADMIN — Funcionalidades

### F-SUP-01: Gestión de Tenants

**Descripción:** Superadmin crea y configura nuevas empresas/tenants (Mensana o TusTurnos).

**Actores:** Superadmin

**Flujo Principal:**
1. Accede a "Tenants"
2. "+ Nuevo Tenant"
3. Formulario:
   - Nombre empresa
   - Slug (subdominio)
   - Marca (Mensana vs TusTurnos)
   - Admin email/teléfono
   - Colores (primario, secundario, background)
   - Logo URL
   - Dominio personalizado (opcional)
4. Sistema:
   - Crea registro en `empresas`
   - Configura ThemeContext
   - Crea usuario admin con rol "admin"
   - Envía credenciales

**Reglas:**
- **RB-67**: Slug debe ser único dentro de la marca
- **RB-68**: Cada tenant tiene su propia base de datos lógica (multi-tenant Supabase)

---

## Matriz de Interacciones Entre Roles

### Flujo de Reserva End-to-End Típico

```
CLIENTE                    PROFESIONAL           ADMIN               SISTEMA
   |                            |                  |                    |
   |---Busca profesional---->|  |                  |                    |
   |<--Query disponibilidad--|  |                  |                    |
   |---Ver perfil---------->|  |                  |                    |
   |---Selecciona horario-->|  |                  |                    |
   |---Paga seña------------|  |                  |---Webhook MercadoPago
   |                            |<--Notificación--|  |
   |                            |---Confirma----->|  |
   |<--Confirmación WhatsApp----|  |                 |
   |---Recordatorio 24h---------|  |                 |
   |---Recordatorio 1h----------|  |                 |
   |---Cancela (plazo)----------|  |                 |
   |<--Devolución seña---------|  |                 |
```

---

## Máquina de Estados Global

### Estados Principales

```
┌─────────────────────────────────────────────────────────────┐
│                     PENDIENTE                                │
│         (Seña pagada, esperando confirmación profesional)    │
├──────┬──────────────────────────────────────────────────┬───┤
│      │                                                   │   │
│      ▼                                                   ▼   │
│  CONFIRMADA                                         RECHAZADA
│  (Horario bloqueado)                                (Seña devuelto)
│      │                                                   │
│      ├──────────────────┬─────────────────────────┬────┘
│      │                  │                         │
│      ▼                  ▼                         ▼
│  CAMBIO_SOLICITADO   CANCELADA_CLIENTE    (Fin de ciclo)
│  (Propuesta de cambio) (Seña devuelta 
│      │                  si plazo OK)
│      │                  │
│      ├──────────────────┘
│      │
│      └──→ PENDIENTE (nuevo ciclo con misma seña)
│           OR
│           RECHAZADO (profesional rechaza cambio)
│      │
│      ▼
│  CANCELADA_PROFESIONAL
│  (Seña devuelta siempre)
│      │
│      ▼
│  COMPLETADA
│  (Fecha/hora superada, reserva fue confirmada)
│
└─────────────────────────────────────────────────────────────┘
```

---

## Plan de Testing

### Sumario por Funcionalidad

| ID | Funcionalidad | Escenarios Positivos | Escenarios Negativos | Edge Cases | Prioridad |
|----|----|---|---|---|---|
| F-CLI-01 | Búsqueda | 5 | 3 | 4 | P1 |
| F-CLI-02 | Perfil profesional | 4 | 2 | 3 | P1 |
| F-CLI-03 | Seleccionar horario | 5 | 4 | 5 | P1 |
| F-CLI-04 | Auth cliente | 6 | 5 | 4 | P1 |
| F-CLI-05 | Crear reserva + pago | 7 | 6 | 6 | P1 |
| F-CLI-06 | Recibir confirmación | 3 | 2 | 2 | P1 |
| F-CLI-07 | Cancelar reserva | 6 | 4 | 5 | P1 |
| F-CLI-08 | Cambio de horario | 5 | 3 | 4 | P1 |
| F-CLI-09 | Recordatorios | 4 | 3 | 4 | P2 |
| F-CLI-10 | Dashboard cliente | 4 | 2 | 3 | P2 |
| F-PRO-01 | Ver agenda | 4 | 2 | 3 | P1 |
| F-PRO-02 | Pendientes | 3 | 2 | 2 | P1 |
| F-PRO-03 | Confirmar | 4 | 3 | 3 | P1 |
| F-PRO-04 | Rechazar | 4 | 2 | 2 | P1 |
| F-PRO-05 | Proponer cambio | 5 | 3 | 4 | P1 |
| F-PRO-06 | Cancelar pro | 4 | 2 | 2 | P1 |
| F-PRO-07 | Config servicios | 6 | 4 | 4 | P1 |
| F-PRO-08 | Config disponibilidad | 5 | 3 | 5 | P1 |
| F-PRO-09 | Historial | 3 | 2 | 2 | P2 |
| F-ADM-01 | Crear cliente | 3 | 2 | 2 | P2 |
| F-ADM-02 | Horario base | 3 | 1 | 2 | P1 |
| F-ADM-03 | Política cancelación | 2 | 1 | 2 | P1 |
| F-ADM-04 | Ver reservas empresa | 4 | 2 | 3 | P2 |
| F-ADM-05 | Gestionar profesionales | 5 | 3 | 3 | P2 |

**Total de test cases:** ~130 escenarios

---

### Grupo de Testing Recomendado

#### Fase 1 (Semana 1-2) — Core Crítico
- F-CLI-01, F-CLI-02, F-CLI-03
- F-CLI-04, F-CLI-05, F-CLI-06
- F-PRO-01, F-PRO-03, F-PRO-04
- F-PRO-07, F-PRO-08
- F-ADM-02, F-ADM-03

**Resultado:** Cliente puede reservar end-to-end, profesional confirma/rechaza, seña se retiene/devuelve correctamente.

#### Fase 2 (Semana 3-4) — Funcionalidades Secundarias
- F-CLI-07, F-CLI-08
- F-PRO-05, F-PRO-06
- F-ADM-01, F-ADM-04, F-ADM-05
- F-CLI-09, F-CLI-10, F-PRO-02, F-PRO-09

**Resultado:** Cambios, cancelaciones, recordatorios, dashboards funcionan.

---

## Notas de Implementación

### Consideraciones Técnicas

1. **Multi-tenant:** Todos los tests deben validar aislamiento de datos entre marcas (Mensana ↔ TusTurnos)
2. **Timezone:** Recordatorios y cálculos de plazo respetan timezone del cliente (si está disponible)
3. **Race Conditions:** Tests de confirmación concurrente, cambios de estado simultáneos
4. **Idempotencia:** Webhooks de MercadoPago, reintento de notificaciones
5. **API Integration:** Mocks de MercadoPago, WhatsApp wa.me
6. **Database Transactions:** Rollback en caso de fallo de pago
7. **Caching:** Disponibilidad puede estar cacheada, validar invalidación

---

## Próximos Pasos

1. **Crear test suite por funcionalidad** usando Vitest + React Testing Library
2. **Definir fixtures/mocks** de Supabase y MercadoPago
3. **Implementar AAA pattern** (Arrange, Act, Assert) con helpers reutilizables
4. **Ejecutar en CI/CD** tras cada commit
5. **Coverage mínimo:** 80% para funcionalidades P1
