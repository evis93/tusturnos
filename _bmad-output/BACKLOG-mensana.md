# Backlog Priorizado — Mensana / TusTurnos

**Versión:** 1.0
**Fecha:** 2026-03-28
**Criterio de prioridad:** Primero que el profesional pueda operar su agenda. Segundo que el cliente pueda reservar.

---

## FASE 1 — Profesional operativo (MVP interno)
> El profesional puede ver, crear y gestionar sus reservas desde el panel. Sin pagos todavía.

### F1-01 · Base de datos: modelo de reservas
- [ ] Tabla `reservas` con todos los estados (`PENDIENTE`, `CONFIRMADA`, `RECHAZADA`, `CAMBIO_SOLICITADO`, `CANCELADA_CLIENTE`, `CANCELADA_PROFESIONAL`, `COMPLETADA`)
- [ ] Tabla `empresa_profesional` (N:M profesional ↔ empresa)
- [ ] Tabla `servicios` (nombre, duración, precio, seña_monto, seña_porcentaje)
- [ ] Tabla `horarios_empresa` (horario semanal base por empresa)
- [ ] Tabla `disponibilidad_profesional` (excepciones/ajustes por día)
- [ ] Tabla `notificaciones_pendientes` (recordatorios a disparar)
- [ ] RLS en todas las tablas nuevas
- [ ] Vista `v_reservas_profesional` con datos de cliente, servicio y empresa

### F1-02 · Perfil del profesional
- [ ] Pantalla `/profesional/perfil` — editar bio, foto, especialidades, modalidad (presencial/no presencial/ambas), WhatsApp
- [ ] Asociar profesional a una o más empresas
- [ ] Subida de foto de perfil a Supabase Storage

### F1-03 · Servicios del profesional
- [ ] Pantalla `/profesional/servicios` — CRUD de servicios
- [ ] Campos: nombre, descripción, duración (minutos), precio, tipo de seña (monto fijo o % del precio), valor de seña
- [ ] Validación: duración mínima 15 min, precio y seña >= 0

### F1-04 · Horario base de la empresa (Admin)
- [ ] Pantalla `/admin/horarios` — configurar días y rangos horarios semanales (ej: Lun–Vie 9:00–18:00)
- [ ] Selector de días activos + hora inicio/fin por día
- [ ] Guardar en `horarios_empresa`

### F1-05 · Disponibilidad del profesional
- [ ] Pantalla `/profesional/disponibilidad` — ver calendario mensual con bloques del horario base
- [ ] Agregar excepciones por día: bloquear horario, agregar horario extra
- [ ] El sistema calcula bloques disponibles según duración del servicio seleccionado
- [ ] Bloqueo automático de bloques al confirmar una reserva

### F1-06 · Agenda del profesional
- [ ] Pantalla `/profesional/agenda` — vista día / semana / mes
- [ ] Mostrar reservas con color por estado
- [ ] Click en reserva → panel lateral con detalle

### F1-07 · Gestión de reservas (profesional)
- [ ] Pantalla `/profesional/reservas` — lista con filtros por estado y fecha
- [ ] Pantalla `/profesional/reservas/[id]` — detalle completo
- [ ] Acciones disponibles según estado:
  - PENDIENTE → Confirmar | Rechazar | Solicitar cambio de horario
  - CONFIRMADA → Cancelar
  - CAMBIO_SOLICITADO → Proponer nuevo horario (genera nueva reserva PENDIENTE)

### F1-08 · Alta manual de cliente (Admin y Profesional)
- [ ] Formulario: nombre, email, teléfono
- [ ] Crear `auth.user` en Supabase con contraseña `123456`
- [ ] Enviar WhatsApp con aviso de acceso y pedido de cambio de contraseña
- [ ] Pantalla `/admin/clientes` con listado y buscador

### F1-09 · Creación de reserva por profesional/admin
- [ ] Formulario desde panel: seleccionar cliente (existente o crear), servicio, fecha/hora
- [ ] Validar disponibilidad al seleccionar horario
- [ ] Crear reserva en estado `PENDIENTE` (o `CONFIRMADA` directamente si el profesional la carga)
- [ ] Notificación WhatsApp al cliente

---

## FASE 2 — Cliente puede reservar
> El cliente entra a la página de una empresa y puede hacer una reserva completa con pago de seña.

### F2-01 · Página pública de empresa
- [ ] Pantalla `/[empresa]` — logo, nombre, descripción, lista de profesionales
- [ ] Aplicar theming: `color_primario`, `color_secundario`, `color_background` de la empresa
- [ ] SEO básico: title y meta description por empresa

### F2-02 · Listado de profesionales con búsqueda
- [ ] Pantalla `/[empresa]/profesionales`
- [ ] Filtros: especialidad, modalidad, disponibilidad próxima
- [ ] Ordenar por distancia (geolocalización del browser) y luego por reseña (cuando exista)
- [ ] Card de profesional: foto, nombre, especialidades, próximos horarios, precio desde

### F2-03 · Perfil público del profesional
- [ ] Pantalla `/[empresa]/profesional/[id]`
- [ ] Bio, especialidades, galería, servicios con precios y duración
- [ ] Calendario de disponibilidad (solo días con slots libres)
- [ ] CTA "Reservar" por servicio

### F2-04 · Flujo de reserva (cliente)
- [ ] Pantalla `/[empresa]/reservar` — stepper:
  1. Seleccionar servicio
  2. Seleccionar fecha y horario disponible
  3. Login / registro si no está autenticado
  4. Confirmar datos de la reserva + mostrar monto de seña
  5. Pago de seña (MercadoPago)
  6. Confirmación: "Tu solicitud fue enviada, el profesional la confirmará"
- [ ] Bloqueo optimista del horario durante el proceso de pago (TTL 10 min)

### F2-05 · Autenticación del cliente
- [ ] Pantalla `/[empresa]/auth/login`
- [ ] Pantalla `/[empresa]/auth/registro` — nombre, email, teléfono, contraseña
- [ ] Pantalla `/[empresa]/auth/cambiar-clave` — forzado si la contraseña es `123456`
- [ ] Redirección post-login al paso de la reserva donde quedó

### F2-06 · Integración MercadoPago (señas)
- [ ] Crear preferencia de pago en `/api/pagos/crear-preferencia` con monto de seña
- [ ] Webhook `/api/pagos/webhook` — actualiza estado de seña en BD al recibir pago aprobado
- [ ] Retención automática: fondos quedan en cuenta de plataforma
- [ ] Devolución automática vía API al cancelar dentro de plazo o por profesional
- [ ] Retención automática cuando cliente cancela fuera de plazo (previa confirmación UI)

### F2-07 · Mis reservas (cliente)
- [ ] Pantalla `/cliente/reservas` — lista de reservas activas e historial
- [ ] Pantalla `/cliente/reservas/[id]` — detalle con acciones:
  - Cancelar (con advertencia si está fuera del plazo → perderá seña)
  - Solicitar cambio de horario

### F2-08 · Perfil del cliente
- [ ] Pantalla `/cliente/perfil` — nombre, teléfono, dirección (para geolocalización)
- [ ] La dirección se usa como punto de referencia en búsqueda si no hay GPS

---

## FASE 3 — Notificaciones y automatismos
> El sistema notifica y recuerda sin intervención manual.

### F3-01 · Templates de mensajes WhatsApp
- [ ] Definir y documentar los 8 templates (ver PRD sección 6.3)
- [ ] Función utilitaria `generarLinkWA(telefono, template, datos)` → devuelve `wa.me` link
- [ ] Cada acción del panel abre el link en nueva pestaña

### F3-02 · Recordatorios automáticos — Vercel Cron
- [ ] Cron job `GET /api/cron/recordatorios` ejecutado cada 30 minutos
- [ ] Consulta reservas CONFIRMADAS con turno en las próximas 24h que no tienen recordatorio enviado
- [ ] Consulta reservas CONFIRMADAS con turno en la próxima 1h
- [ ] Genera links wa.me y los guarda en `notificaciones_pendientes`
- [ ] Marcar como `enviada_at` para no duplicar
- [ ] (Opcional v2) Trigger automático sin intervención del profesional via WhatsApp API

### F3-03 · Completado automático de reservas
- [ ] Cron job (mismo o separado) marca como `COMPLETADA` las reservas CONFIRMADAS cuya fecha/hora ya pasó

---

## FASE 4 — Admin de empresa operativo

### F4-01 · Dashboard del admin
- [ ] Pantalla `/admin/dashboard`
- [ ] Métricas: reservas del día, pendientes de confirmar, próximas 7 días
- [ ] Acceso rápido a reservas pendientes

### F4-02 · Gestión de profesionales (Admin)
- [ ] Pantalla `/admin/profesionales` — lista con estado activo/inactivo
- [ ] Alta de profesional: invitar por email o crear con datos
- [ ] Asignar a empresa, definir servicios disponibles para ese profesional

### F4-03 · Política de cancelación
- [ ] Pantalla `/admin/cancelaciones`
- [ ] Configurar plazo en horas o días para que el cliente pueda cancelar sin perder seña
- [ ] Se aplica globalmente a todos los servicios de la empresa (o por servicio en v2)

### F4-04 · Configuración de empresa
- [ ] Pantalla `/admin/empresa`
- [ ] Editar: logo, colores (picker), descripción, dirección, WhatsApp de contacto
- [ ] Preview en tiempo real del theming aplicado

---

## FASE 5 — Calidad y pulido

### F5-01 · Geolocalización mejorada
- [ ] Búsqueda por radio configurable (default 10km)
- [ ] Mapa visual opcional en `/[empresa]/profesionales`
- [ ] Fallback si el usuario no da permiso de ubicación → usar dirección de perfil o buscar sin filtro geográfico

### F5-02 · SEO y performance
- [ ] Metadata dinámica por empresa y por profesional
- [ ] Open Graph para compartir perfiles en redes
- [ ] Cache de páginas públicas (ISR o cache headers)

### F5-03 · Reseñas (sin urgencia)
- [ ] Solo habilitadas para reservas en estado COMPLETADA
- [ ] Rating 1–5 + comentario
- [ ] Moderación por admin antes de publicar

---

## Orden de implementación sugerido

```
F1-01 → F1-02 → F1-03 → F1-04 → F1-05   (base: datos + perfil + servicios + horarios)
     → F1-06 → F1-07 → F1-08 → F1-09    (agenda + reservas + clientes)
     → F2-01 → F2-02 → F2-03             (vitrina pública)
     → F2-05 → F2-04 → F2-06             (auth + reserva + pago)
     → F2-07 → F2-08                     (self-service cliente)
     → F3-01 → F3-02 → F3-03             (notificaciones + cron)
     → F4-01 → F4-02 → F4-03 → F4-04    (admin completo)
     → F5-xx                             (calidad)
```

---

*Generado con BMAD Analyst — Mensana/TusTurnos v1.0*
