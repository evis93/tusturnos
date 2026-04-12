# Database Schema - Mensana / TusTurnos

# Database Schema - Mensana / TusTurnos

## Overview

Este documento describe la estructura de la base de datos principal del sistema. Incluye tablas, relaciones e índices relevantes para el dominio de turnos, usuarios, empresas y pagos.

---

## usuarios

```sql
create table public.usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  nombre_completo text,
  email text unique,
  telefono text,
  activo boolean not null default true,
  created_at timestamp not null default now(),
  avatar_url text,
  location geography,
  foreign key (auth_user_id) references auth.users(id) on delete cascade
);

create index usuarios_location_idx 
on public.usuarios using gist (location);
```

---

## empresas

```sql
create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text unique not null,
  descripcion text,
  logo_url text,
  color_primary text,
  color_secondary text,
  color_background text,
  activa boolean default true,
  created_at timestamp default now(),
  plan uuid default gen_random_uuid(),
  url text,
  email_contacto text,
  location geography,
  agenda_turnos boolean default true,
  politica_cancelacion_horas integer default 24,
  whatsapp_contacto text,
  cierre_ultimo_at timestamptz
);

create unique index idx_empresas_url
on public.empresas(url)
where url is not null;
```

---

## roles

```sql
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  rol text unique not null
);
```

---

## usuario_empresa

```sql
create table public.usuario_empresa (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid,
  empresa_id uuid,
  rol_id uuid,
  sucursal_id uuid default gen_random_uuid(),

  unique (usuario_id, empresa_id, rol_id),

  foreign key (usuario_id) references usuarios(id) on delete cascade,
  foreign key (empresa_id) references empresas(id) on delete cascade,
  foreign key (rol_id) references roles(id)
);

create index idx_usuario_empresa 
on public.usuario_empresa (empresa_id);
```

---

## sucursales

```sql
create table public.sucursales (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid,
  nombre text not null,
  direccion text,
  location geography,
  activa boolean default true,
  created_at timestamp default now(),
  hora_apertura varchar,
  hora_cierre varchar,

  foreign key (empresa_id) references empresas(id) on delete cascade
);
```

---

## servicios

```sql
create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid,
  nombre text not null,
  descripcion text,
  duracion_minutos integer,
  precio numeric(10,2),
  activo boolean default true,
  created_at timestamp default now(),
  sena_tipo text default 'monto',
  sena_valor numeric(10,2) default 0,
  modalidad text default 'presencial',

  foreign key (empresa_id) references empresas(id) on delete cascade,

  check (modalidad in ('presencial','no_presencial','ambas')),
  check (sena_tipo in ('monto','porcentaje'))
);

create index idx_servicios_empresa 
on public.servicios (empresa_id);
```

---

## reservas

```sql
create table public.reservas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid,
  cliente_id uuid,
  profesional_id uuid,
  autor_id uuid,
  servicio_id uuid,
  sucursal_id uuid,

  fecha date not null,
  hora_inicio time not null,

  estado text default 'pendiente',
  pagado boolean default false,
  recordatorio_enviado boolean default false,

  created_at timestamp default now(),
  metodo_pago public.metodo_pago_enum,

  precio_total numeric,
  monto_seña numeric,
  seña_pagada boolean default false,
  monto_restante numeric(10,2),

  cliente_auth_user_id uuid,
  nota text,
  cbu_alias text,

  foreign key (empresa_id) references empresas(id) on delete cascade,
  foreign key (cliente_id) references usuarios(id) on delete cascade,
  foreign key (profesional_id) references usuarios(id),
  foreign key (autor_id) references usuarios(id),
  foreign key (servicio_id) references servicios(id),
  foreign key (sucursal_id) references sucursales(id)
);

create index idx_reservas_fecha on reservas(fecha);
create index idx_reservas_profesional_fecha on reservas(profesional_id, fecha);
create index idx_reservas_cliente_auth_user_id on reservas(cliente_auth_user_id);
```

---

## pagos_reservas

```sql
create table public.pagos_reservas (
  id uuid primary key default gen_random_uuid(),
  reserva_id uuid not null,
  sucursal_id uuid not null,
  monto numeric(10,2) not null,
  metodo_pago public.metodo_pago_enum not null,
  registrado_por uuid,
  created_at timestamptz default now(),

  foreign key (reserva_id) references reservas(id) on delete cascade,
  foreign key (sucursal_id) references sucursales(id),
  foreign key (registrado_por) references usuarios(id)
);

create index idx_pagos_reservas_reserva_id on pagos_reservas(reserva_id);
```

---

## fichas

```sql
create table public.fichas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null,
  sucursal_id uuid not null,
  profesional_id uuid not null,
  servicio_id uuid,
  fecha date not null,
  hora time not null,
  nota text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  foreign key (cliente_id) references usuarios(id),
  foreign key (profesional_id) references usuarios(id),
  foreign key (servicio_id) references servicios(id),
  foreign key (sucursal_id) references sucursales(id)
);
```

---

## resenas

```sql
create table public.resenas (
  id uuid primary key default gen_random_uuid(),
  reserva_id uuid,
  cliente_id uuid,
  empresa_id uuid,
  calificacion integer,
  comentario text,
  created_at timestamptz default now(),

  check (calificacion between 1 and 5)
);
```

---

## profesional_servicio

```sql
create table public.profesional_servicio (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid,
  servicio_id uuid,

  unique (profesional_id, servicio_id)
);
```

---

## planes

```sql
create table public.planes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  plan varchar,
  descripcion text,
  precio_mensual numeric,
  precio_anual numeric
);
```

---

## comentarios

```sql
create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid,
  usuario_id uuid,
  contenido text not null,
  aprobado boolean default false,
  created_at timestamp default now(),

  foreign key (empresa_id) references empresas(id) on delete cascade,
  foreign key (usuario_id) references usuarios(id) on delete cascade
);
```

---

## Notas para IA (Claude Code)

* Sistema multi-tenant basado en `empresa_id`
* Usuarios pueden tener múltiples roles vía `usuario_empresa`
* `reservas` es la entidad central del dominio
* Soporta pagos parciales (`pagos_reservas`)
* Soporta agenda por sucursal y profesional
* `geography` habilita búsquedas por proximidad
* Integración con auth externa (`auth.users`)

---
