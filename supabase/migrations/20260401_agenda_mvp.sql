-- ============================================================
-- MENSANA Agenda MVP - Migración 2026-04-01
-- Schema real: empresas, usuarios, usuario_empresa, reservas
-- ============================================================

-- ── pagos_reservas ───────────────────────────────────────────
-- Tabla nueva para registrar pagos de reservas.
-- La tabla reservas ya existe con las columnas necesarias.

CREATE TABLE IF NOT EXISTS pagos_reservas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id      uuid NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  empresa_id      uuid NOT NULL REFERENCES empresas(id),
  monto           numeric(10,2) NOT NULL,
  metodo_pago     text NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia')),
  registrado_por  uuid REFERENCES usuarios(id),
  created_at      timestamptz DEFAULT now()
);

-- ── RLS pagos_reservas ───────────────────────────────────────
ALTER TABLE pagos_reservas ENABLE ROW LEVEL SECURITY;

-- Política de aislamiento por tenant: solo ve/inserta pagos de su empresa
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pagos_reservas'
      AND policyname = 'tenant_isolation_pagos'
  ) THEN
    CREATE POLICY tenant_isolation_pagos ON pagos_reservas
      USING (
        empresa_id IN (
          SELECT ue.empresa_id
          FROM usuario_empresa ue
          INNER JOIN usuarios u ON u.id = ue.usuario_id
          WHERE u.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

GRANT SELECT, INSERT ON pagos_reservas TO authenticated;

-- ── horarios_empresa - RLS (si no existe) ────────────────────
-- La tabla ya existe con: id, empresa_id, dia_semana, hora_inicio, hora_fin, activo, created_at
-- Solo habilitamos RLS si no estaba habilitado.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename   = 'horarios_empresa'
  ) THEN
    -- fallback: crear la tabla si por alguna razón no existe
    CREATE TABLE horarios_empresa (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      empresa_id  uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      dia_semana  integer NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
      hora_inicio time NOT NULL,
      hora_fin    time NOT NULL,
      activo      boolean NOT NULL DEFAULT true,
      created_at  timestamptz DEFAULT now()
    );
    ALTER TABLE horarios_empresa ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation_horarios ON horarios_empresa
      USING (
        empresa_id IN (
          SELECT ue.empresa_id
          FROM usuario_empresa ue
          INNER JOIN usuarios u ON u.id = ue.usuario_id
          WHERE u.auth_user_id = auth.uid()
        )
      );
    GRANT SELECT, INSERT, UPDATE, DELETE ON horarios_empresa TO authenticated;
  END IF;
END $$;

-- ── Índices útiles ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pagos_reservas_reserva_id
  ON pagos_reservas(reserva_id);

CREATE INDEX IF NOT EXISTS idx_pagos_reservas_empresa_id
  ON pagos_reservas(empresa_id);

CREATE INDEX IF NOT EXISTS idx_reservas_fecha
  ON reservas(fecha);

CREATE INDEX IF NOT EXISTS idx_reservas_profesional_fecha
  ON reservas(profesional_id, fecha);
