# PRD — Plataforma Dual: Mensana + TusTurnos

**Versión:** 1.2
**Fecha:** 2026-03-28
**Autor:** BMAD Analyst
**Estado:** Aprobado — listo para diseño de pantallas

---

## 1. Resumen Ejecutivo

La plataforma es un sistema multi-tenant de gestión de turnos y marketplace de servicios, desplegado bajo **dos marcas distintas** que comparten la misma base de código y base de datos:

| Marca | Dominio | Público objetivo |
|-------|---------|-----------------|
| **Mensana** | `mensana.com.ar` | Profesionales de salud mental, holísticos, yoga, meditación |
| **TusTurnos** | `tusturnos.ar` | Peluquerías, estéticas, belleza y afines |

La separación de marcas es intencional: **no se mezcla el espacio de bienestar mental con el de belleza**. Cada empresa tiene su propia identidad visual (logo, colores primario, secundario y background) que se aplica dinámicamente en toda la interfaz.

Ambas marcas tendrán **web** (Next.js) y **app móvil** (React Native), usando la misma lógica y base de datos de Supabase.

Este documento define los requisitos para completar el ciclo de reservas end-to-end, el sistema de notificaciones, los perfiles de profesionales y el panel de gestión, aplicables a ambas marcas.

---

## 2. Contexto y Problema

### Estado actual
- Autenticación y roles funcionales (superadmin, admin, profesional, cliente)
- Base de datos Supabase con estructura base
- Deploy activo en Vercel (web Next.js) y EAS (app React Native)
- Arquitectura multi-tenant: cada empresa tiene subdominio `empresa.mensana.com.ar` / `empresa.tusturnos.ar` o dominio propio
- ThemeContext implementado: colores dinámicos por tenant (primario, secundario, background)
- Carga de disponibilidad día por día implementada parcialmente

### Problema a resolver
Los profesionales y empresas de bienestar no tienen una herramienta centralizada que les permita:
- Recibir reservas con confirmación y cobro de seña de forma ordenada
- Comunicar cambios, confirmaciones y recordatorios automáticamente
- Mostrar su perfil y servicios a clientes cercanos
- Gestionar su agenda sin depender de planillas o mensajes manuales

---

## 3. Objetivos

| Objetivo | Métrica de éxito |
|----------|-----------------|
| Ciclo de reserva completo funcional | Cliente puede reservar, pagar seña y recibir confirmación en < 5 min |
| Reducir no-shows | Recordatorios automáticos por WhatsApp el día anterior y 1h antes |
| Autonomía del profesional | Profesional gestiona agenda sin intervención de soporte |
| Expansión geográfica | Sistema de pagos compatible con Sudamérica y Europa |

---

## 4. Arquitectura Dual-Marca

### Discriminador de marca

La tabla `empresas` contiene la columna:

```sql
agenda_turnos BOOLEAN DEFAULT FALSE
```

| Valor | Marca | Dominio base |
|-------|-------|-------------|
| `false` | **Mensana** | `mensana.com.ar` |
| `true` | **TusTurnos** | `tusturnos.ar` |

### Resolución de marca en runtime

El middleware detecta el dominio del request y determina la marca activa:
- `*.mensana.com.ar` → contexto Mensana
- `*.tusturnos.ar` → contexto TusTurnos
- Dominio propio (CNAME) → se resuelve por `custom_domain` en `empresas` → hereda la marca de la empresa

### Theming dinámico por empresa

Cada empresa que contrata la plataforma configura sus propios colores:
- `color_primario` — botones, acentos, cabeceras
- `color_secundario` — elementos secundarios
- `color_background` — fondo general
- `logo_url` — logo de la empresa

Estos valores se aplican globalmente vía `ThemeContext` en toda la interfaz (web y app), haciendo que cada subdominio tenga identidad visual propia.

**Las plataformas Mensana y TusTurnos en sí mismas usan el mismo esquema de colores base. Lo único que las diferencia visualmente es el logo.**

### Regla de contenido
- Un cliente de `monalisa.tusturnos.ar` **nunca ve** empresas ni profesionales de Mensana y viceversa.
- La búsqueda geolocalizada filtra siempre dentro de la misma marca.

---

## 5. Usuarios y Roles

| Rol | Descripción |
|-----|-------------|
| **Cliente** | Busca profesionales, reserva turnos, paga seña, recibe notificaciones |
| **Profesional** | Gestiona agenda, confirma/rechaza reservas, configura servicios y disponibilidad |
| **Admin (empresa)** | Gestiona múltiples profesionales de su empresa, configura política de cancelación y horarios generales |
| **Superadmin** | Gestión global de la plataforma, configuración de tenants |

---

## 6. Alcance — Ciclo Actual (v1)

### En alcance
- Sistema de reservas completo con máquina de estados
- Cobro y gestión de señas vía MercadoPago (con soporte futuro a Stripe/Europa)
- Notificaciones WhatsApp (link wa.me) para todos los eventos de reserva
- Recordatorios automáticos (día anterior y 1h antes)
- Perfil del profesional con servicios, duración y disponibilidad
- Horario semanal recurrente de la empresa (configurable)
- Búsqueda geolocalizada de profesionales
- Panel de gestión para profesionales y admins
- Política de cancelación configurable por empresa

### Fuera de alcance (v2+)
- Videollamadas / sesiones online dentro de la plataforma
- Marketplace de contenido digital (packs de video, yoga, etc.)
- Integración API de WhatsApp Business (reemplazaría el link wa.me)
- Comisiones por reserva (modelo actual: cuota fija por empresa)
- Reseñas y ratings (previsto sin urgencia)

---

## 7. Requisitos Funcionales

---

### 6.1 Sistema de Reservas

#### Máquina de estados

```
PENDIENTE
  ├─→ CONFIRMADA     (profesional acepta)
  ├─→ RECHAZADA      (profesional rechaza sin propuesta de cambio)
  ├─→ CAMBIO_SOLICITADO  (profesional o cliente propone nuevo horario)
  │      └─→ PENDIENTE  (se acepta la propuesta → nueva reserva pendiente)
  ├─→ CANCELADA_CLIENTE   (cliente cancela)
  │      ├─ dentro del plazo configurado → seña devuelta
  │      └─ fuera del plazo → seña retenida por plataforma
  ├─→ CANCELADA_PROFESIONAL  (profesional cancela → seña devuelta al cliente, se reagenda)
  └─→ COMPLETADA     (fecha/hora del turno superada y reserva estaba confirmada)
```

#### Reglas de negocio
- **RB-01**: La seña queda retenida en la plataforma desde el momento del pago hasta la resolución (CONFIRMADA, RECHAZADA o CANCELADA).
- **RB-02**: Si el profesional cancela, la seña se devuelve íntegra al cliente. Se notifica y se invita a reagendar.
- **RB-03**: Si el cliente cancela fuera del plazo configurado, se le advierte antes de confirmar que perderá la seña. Si acepta, la seña queda en la plataforma.
- **RB-04**: Si el cliente cancela dentro del plazo, la seña se devuelve.
- **RB-05**: El plazo de cancelación del cliente es configurable por el admin de cada empresa (en horas o días).
- **RB-06**: El profesional puede cancelar en cualquier momento o solicitar cambio de horario.
- **RB-07**: Un cambio de horario genera una nueva reserva en estado PENDIENTE con la misma seña retenida.
- **RB-08**: El estado COMPLETADA se asigna automáticamente cuando la fecha/hora del turno confirmado ha pasado.

---

### 6.2 Señas y Pagos

#### Configuración
- El profesional define por servicio: monto fijo de seña **o** porcentaje del precio del servicio.
- Si define porcentaje, el sistema calcula el monto en el momento de la reserva.

#### Procesadores de pago
| Región | Procesador |
|--------|-----------|
| Sudamérica | MercadoPago |
| Europa / internacional | Stripe (implementación futura v1.1) |

- La plataforma detecta la región del tenant para mostrar el procesador correspondiente.
- Los fondos de señas quedan retenidos en la cuenta de la plataforma (no en la cuenta del profesional) hasta resolución.

#### Flujos de devolución
- Devolución automática vía API del procesador cuando corresponda (cancelación dentro de plazo o cancelación por profesional).
- Retención automática cuando cliente cancela fuera de plazo (previa advertencia y confirmación explícita del cliente).

---

### 6.3 Notificaciones WhatsApp

#### Mecanismo actual
Al hacer clic en una acción que genera notificación, la plataforma abre WhatsApp Web con un mensaje pre-redactado vía `wa.me` link. El profesional o sistema envía el mensaje manualmente.

#### Eventos y destinatarios

| Evento | Cliente recibe | Profesional recibe |
|--------|---------------|-------------------|
| Reserva creada (pendiente) | ✓ Confirmación de solicitud | ✓ Nueva reserva pendiente |
| Reserva confirmada | ✓ Confirmación con detalles | — |
| Reserva rechazada | ✓ Aviso de rechazo | — |
| Cambio de horario solicitado | ✓ Propuesta de nuevo horario | ✓ (si lo solicita el cliente) |
| Cancelación por profesional | ✓ Aviso + devolución seña | — |
| Cancelación por cliente | — | ✓ Aviso |
| Recordatorio día anterior | ✓ Recordatorio 24h antes | — |
| Recordatorio 1h antes | ✓ Recordatorio 1h antes | — |

#### Mensajes pre-redactados
Cada mensaje incluye: nombre del profesional, servicio, fecha, hora, dirección (si presencial) y link a la reserva en la plataforma.

---

### 6.4 Perfil del Profesional

#### Datos del perfil
- Nombre y foto
- Especialidades / categorías
- Descripción/bio
- Modalidad: presencial | no presencial | ambas (configurable por el profesional)
- Servicios: nombre, descripción, duración, precio, monto/porcentaje de seña
- Galería de fotos (opcional)
- Dirección y coordenadas geográficas (para búsqueda geolocalizada)
- Número de WhatsApp para notificaciones

#### Disponibilidad
- **Horario semanal de la empresa**: el admin configura los días y rangos horarios generales de atención (ej: Lun–Vie 9:00–18:00). Simple y reutilizable.
- **Disponibilidad del profesional**: el profesional puede ajustar día por día, bloqueando horarios o agregando excepciones sobre el horario base de la empresa.
- **Bloqueo automático**: al confirmar una reserva, el bloque horario queda ocupado y no aparece como disponible para otros clientes.
- **Duración de turno**: la duración la define el profesional por servicio. El sistema calcula los bloques disponibles en base a esa duración.

---

### 6.5 Búsqueda y Descubrimiento (Cliente)

#### Criterios de búsqueda
1. **Geolocalización** (primario): se usa la ubicación actual del dispositivo o el domicilio del cliente (si está guardado en su perfil). Se ordenan los profesionales por distancia usando el campo `geography` de Supabase.
2. **Especialidad / categoría**
3. **Disponibilidad** (fecha/hora)
4. **Modalidad** (presencial / no presencial)

#### Ordenamiento de resultados
1. Profesionales con mejor reseña (cuando reseñas estén implementadas)
2. Profesionales con disponibilidad próxima
3. Distancia al cliente

#### Vista del profesional en resultados
- Foto, nombre, especialidades
- Próximos horarios disponibles
- Precio y modalidad
- Distancia al cliente

---

### 6.6 Panel de Gestión — Profesional

- Vista de agenda: diaria, semanal, mensual
- Lista de reservas con filtros por estado
- Detalle de reserva: datos del cliente, servicio, seña pagada, acciones disponibles
- Acciones: Confirmar | Rechazar | Solicitar cambio de horario | Cancelar
- Configuración de servicios: CRUD de servicios con duración, precio y seña
- Configuración de disponibilidad: excepciones sobre horario base
- Historial de reservas completadas

---

### 6.7 Panel de Gestión — Admin de Empresa

- Gestión de profesionales: alta, baja, edición
- Horario semanal base de la empresa
- Política de cancelación del cliente (plazo en horas o días)
- Vista consolidada de todas las reservas de la empresa
- Configuración de datos de la empresa (nombre, logo, colores, dominio)

---

### 6.8 Registro de Clientes

#### Vías de registro
1. **Registro por profesional/admin**: El profesional crea la reserva e ingresa los datos del cliente (nombre, email, teléfono). El sistema crea automáticamente un `auth.user` en Supabase con contraseña temporal `123456` y envía una notificación WhatsApp al cliente indicando que debe cambiar su contraseña al ingresar por primera vez.
2. **Registro por plataforma**: Mensana (como plataforma) y TusTurnos pueden registrar clientes de forma independiente, sin que pertenezcan a ninguna empresa específica.
3. **Auto-registro**: El cliente puede registrarse por su cuenta desde la web.

#### Reglas
- **RB-09**: Al crear un cliente automáticamente, la contraseña inicial es `123456`. Al primer login se debe mostrar obligatoriamente el flujo de cambio de contraseña.
- **RB-10**: Un cliente puede tener reservas en múltiples empresas con el mismo `auth.user`.

---

### 6.9 Flujo del Cliente — Reservar un Turno

1. Cliente entra a `empresa.mensana.com.ar` o dominio propio
2. Busca profesionales (por ubicación, especialidad, disponibilidad)
3. Selecciona profesional → ve su perfil y servicios
4. Selecciona servicio y horario disponible
5. Si no está logueado → pantalla de login (el cliente ya fue registrado previamente por el profesional o se registra en este paso)
6. Confirma los datos de la reserva
7. Paga la seña (MercadoPago / Stripe)
8. Recibe notificación WhatsApp de "solicitud enviada"
9. Profesional confirma o rechaza
10. Cliente recibe notificación del resultado

---

## 8. Requisitos No Funcionales

| Categoría | Requisito |
|-----------|-----------|
| **Disponibilidad** | 99.5% uptime (Vercel + Supabase SLA) |
| **Performance** | Búsqueda geolocalizada < 2s en p95 |
| **Seguridad** | Señas nunca expuestas en frontend; todas las operaciones de pago server-side |
| **Multi-tenant** | Datos completamente aislados por empresa (RLS en Supabase) |
| **Internacionalización** | Soporte de moneda y procesador de pago por región |
| **Mobile** | Experiencia completa en React Native (app) y responsive web |
| **Notificaciones** | Recordatorios enviados por Vercel Cron Job (cada 30 min), no bloquean la UI |

---

## 9. Dependencias Técnicas

| Componente | Tecnología |
|-----------|-----------|
| Web | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Mobile | React Native + EAS |
| Backend / DB | Supabase (PostgreSQL + PostGIS para geolocalización) |
| Auth | Supabase Auth |
| Pagos (LATAM) | MercadoPago SDK |
| Pagos (Europa) | Stripe (v1.1) |
| Notificaciones | WhatsApp Web via `wa.me` links (API Business en v2) |
| Cron / Jobs | Vercel Cron Jobs (gratis en Hobby, incluido en Pro) + Supabase pg_cron como alternativa |
| Deploy web | Vercel |
| Deploy mobile | EAS (Expo) |
| DNS / Dominios | Cloudflare (wildcard DNS) |

---

## 10. Fuera de Alcance (Futuro)

- Videollamadas / sesiones online integradas en la plataforma
- Marketplace de contenido digital (packs de video, cursos, yoga)
- Integración WhatsApp Business API (mensajes automáticos sin abrir WhatsApp Web)
- Comisiones por reserva
- Sistema de reseñas y ratings
- Stripe / pagos internacionales (v1.1)
- App de escritorio / PWA avanzada

---

## 11. Decisiones Tomadas

| # | Decisión |
|---|----------|
| D-01 | El cliente **no puede reservar sin registrarse**. El profesional puede crear el cliente (auto-registro con pass `123456` + aviso de cambio). |
| D-02 | La devolución de señas es **automática** vía API del procesador. Los fondos se retienen en la plataforma hasta resolución. |
| D-03 | Recordatorios via **Vercel Cron Jobs** (gratis/incluido). Cron cada 30 min consulta reservas próximas y genera links wa.me. Backup: Supabase pg_cron. |
| D-04 | Las reseñas solo se pueden dejar sobre reservas en estado **COMPLETADA**. |
| D-05 | Un profesional **puede pertenecer a múltiples empresas**. La relación es N:M (profesional ↔ empresa). |

## 12. Modelo de Datos — Relaciones Clave

```
auth.users (Supabase)
  └── perfiles          (1:1 con auth.users — nombre, teléfono, rol)

empresas
  ├── agenda_turnos: BOOL  (false=Mensana, true=TusTurnos)
  ├── color_primario, color_secundario, color_background, logo_url
  ├── custom_domain (opcional, para tier Pro)
  ├── empresa_profesional  (N:M — un profesional puede estar en varias empresas)
  ├── servicios            (cada empresa define sus servicios)
  └── horarios_empresa     (horario semanal base)

profesionales
  └── disponibilidad       (excepciones/ajustes sobre horario base)
  └── servicios_profesional (servicios que ofrece dentro de cada empresa)

reservas
  ├── cliente_id → auth.users
  ├── profesional_id → profesionales
  ├── empresa_id → empresas
  ├── servicio_id → servicios
  ├── estado: PENDIENTE | CONFIRMADA | RECHAZADA | CAMBIO_SOLICITADO | CANCELADA_CLIENTE | CANCELADA_PROFESIONAL | COMPLETADA
  ├── seña_monto
  ├── seña_estado: RETENIDA | DEVUELTA | RETENIDA_PLATAFORMA
  └── seña_pago_id → referencia al procesador (MercadoPago / Stripe)

notificaciones_pendientes
  ├── reserva_id
  ├── tipo: RECORDATORIO_24H | RECORDATORIO_1H
  ├── destinatario: CLIENTE | PROFESIONAL
  └── enviada_at
```

---

*Documento generado con BMAD Analyst — Mensana v1.1*
