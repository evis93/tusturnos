# Esquema Operativo de Base de Datos (Mensana)

Fuente: [base.txt](base.txt)

## Objetivo

Este documento resume la estructura de datos real que usa la app para evitar regresiones por consultas mal scopeadas (tenant/empresa) y por joins inconsistentes.

## Entidades Core

### empresas
- PK: `id`
- Campos clave: `slug`, `agenda_turnos`, `politica_cancelacion_horas`, branding (`color_primary`, `color_secondary`, `color_background`), `whatsapp_contacto`
- Uso: discriminador multi-tenant y configuración de negocio

### usuarios
- PK: `id`
- FK: `auth_user_id -> auth.users.id`
- Campos clave: `email` (UNIQUE), `telefono`, `activo`

### roles
- PK: `id`
- `nombre` UNIQUE (`superadmin`, `admin`, `profesional`, `cliente`)

### usuario_empresa
- PK: `id`
- FK: `usuario_id -> usuarios.id`, `empresa_id -> empresas.id`, `rol_id -> roles.id`
- Uso: membresía y rol por empresa

### servicios
- PK: `id`
- FK: `empresa_id -> empresas.id`
- Campos clave: `duracion_minutos`, `precio`, `activo`, `sena_tipo`, `sena_valor`, `modalidad`

### reservas
- PK: `id`
- FK: `empresa_id -> empresas.id`, `cliente_id -> usuarios.id`, `profesional_id -> usuarios.id`, `servicio_id -> servicios.id`, `reserva_origen_id -> reservas.id`
- Campos clave: `fecha_hora_inicio`, `fecha_hora_fin`, `estado`, `sena_monto`, `sena_estado`, `created_by`
- Estado: enum `reserva_estado` (incluye `PENDIENTE`, `CONFIRMADA`, `CAMBIO_SOLICITADO`, etc.)

## Entidades Operativas

### horarios_empresa
- Base semanal por empresa (día de semana, hora inicio/fin, activo)

### disponibilidad_profesional
- Excepciones por profesional y fecha
- `tipo`: `bloqueo` o `extension`

### fichas
- Evolución clínica/registro por atención
- FK a `usuario_empresa`, `empresa`, `usuarios` (profesional), `servicios`

### profesional_servicio
- Relación N:M entre profesional y servicio

### notificaciones_pendientes
- Cola para recordatorios/confirmaciones/cancelaciones/cambios

### resenas
- Calificación de cliente por reserva/empresa

### sucursales
- Sedes por empresa

### empresa_config
- Config extendida por empresa (`config_json`)

## Relaciones Críticas (que más rompen si se ignoran)

1. `servicios` siempre vive dentro de una empresa (`servicios.empresa_id`)
2. `reservas.servicio_id` debe existir en `servicios.id` y corresponder al mismo tenant
3. `usuario_empresa` define permisos por empresa; no usar rol global de `usuarios`
4. `disponibilidad_profesional` se filtra por `usuario_id + empresa_id + fecha`
5. `reservas` para agenda/disponibilidad se filtra por profesional, estado activo y rango horario

## Reglas de Consulta Obligatorias

### Regla 1: Scoping multi-tenant
Toda query funcional debe filtrar por `empresa_id` cuando aplique.

### Regla 2: Servicio válido
En endpoints que usan `servicioId`:
- Filtrar por `id = servicioId`
- Filtrar por `empresa_id = empresaId`
- Filtrar por `activo = true`

### Regla 3: Estados ocupantes
Para conflictos de agenda/disponibilidad usar:
- `PENDIENTE`
- `CONFIRMADA`
- `CAMBIO_SOLICITADO`

### Regla 4: Diferenciar errores
- Si falla query SQL/supabase: responder 500
- Si no existe fila de negocio: responder 404/422 según caso

## Checklist de PR para evitar "mandarse cagadas"

- [ ] Toda query de negocio tiene scope por empresa
- [ ] `servicioId` se normaliza (`trim`) antes de consultar
- [ ] No se enmascaran errores de DB como "no encontrado"
- [ ] Tests cubren happy path y error real de DB
- [ ] Tests cubren "registro no existe" por separado

## Tablas en el schema (base.txt)

- comentarios
- disponibilidad_profesional
- empresa_config
- empresas
- fichas
- horarios_empresa
- notificaciones_pendientes
- planes
- profesional_servicio
- resenas
- reservas
- roles
- servicios
- spatial_ref_sys
- sucursales
- usuario_empresa
- usuarios
