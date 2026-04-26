-- ═══════════════════════════════════════════════════════════════
-- Refactor fichas + pagos_reservas al nuevo schema
-- ═══════════════════════════════════════════════════════════════
-- La tabla fichas fue rediseñada:
--   - Reemplaza usuario_empresa_id/empresa_id por cliente_id (FK usuarios) + sucursal_id (FK sucursales)
--   - Elimina servicio_nombre, reserva_id (desnormalizados)
--   - Agrega hora NOT NULL
-- pagos_reservas ahora usa sucursal_id en vez de empresa_id
--   y solo acepta metodo_pago: efectivo | transferencia
-- ═══════════════════════════════════════════════════════════════

-- ── Vista v_fichas_cliente ────────────────────────────────────
DROP VIEW IF EXISTS v_fichas_cliente;
CREATE OR REPLACE VIEW v_fichas_cliente AS
SELECT
  f.id,
  f.cliente_id,
  (uc.nombre || ' ' || uc.apellido)  AS cliente_nombre,
  f.sucursal_id,
  su.nombre                           AS sucursal_nombre,
  f.profesional_id,
  (up.nombre || ' ' || up.apellido)  AS profesional_nombre,
  f.servicio_id,
  sv.nombre                           AS servicio_nombre,
  f.fecha,
  f.hora,
  f.nota,
  f.created_at
FROM fichas f
LEFT JOIN usuarios   uc ON uc.id = f.cliente_id
LEFT JOIN sucursales su ON su.id = f.sucursal_id
LEFT JOIN usuarios   up ON up.id = f.profesional_id
LEFT JOIN servicios  sv ON sv.id = f.servicio_id;

-- ── Vista v_reportes_sucursal ─────────────────────────────────
-- Muestra cuánto generó cada sucursal por servicio y método de pago
DROP VIEW IF EXISTS v_reportes_sucursal;
CREATE OR REPLACE VIEW v_reportes_sucursal AS
SELECT
  pr.sucursal_id,
  su.nombre                AS sucursal_nombre,
  r.servicio_id,
  sv.nombre                AS servicio_nombre,
  pr.metodo_pago,
  COUNT(*)                 AS cantidad_pagos,
  SUM(pr.monto)            AS total_monto
FROM pagos_reservas pr
JOIN  reservas   r  ON r.id  = pr.reserva_id
LEFT JOIN sucursales su ON su.id = pr.sucursal_id
LEFT JOIN servicios  sv ON sv.id = r.servicio_id
GROUP BY pr.sucursal_id, su.nombre, r.servicio_id, sv.nombre, pr.metodo_pago;

-- ── RLS fichas ────────────────────────────────────────────────
ALTER TABLE fichas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fichas_select ON fichas;
DROP POLICY IF EXISTS fichas_insert ON fichas;
DROP POLICY IF EXISTS fichas_update ON fichas;
DROP POLICY IF EXISTS fichas_delete ON fichas;
-- por si existían políticas con nombres anteriores
DROP POLICY IF EXISTS tenant_isolation_fichas ON fichas;

-- Aislamiento por empresa a través de sucursal
CREATE POLICY fichas_select ON fichas FOR SELECT
  USING (
    sucursal_id IN (
      SELECT s.id FROM sucursales s
      JOIN usuario_empresa ue ON ue.empresa_id = s.empresa_id
      JOIN usuarios u         ON u.id = ue.usuario_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY fichas_insert ON fichas FOR INSERT
  WITH CHECK (
    sucursal_id IN (
      SELECT s.id FROM sucursales s
      JOIN usuario_empresa ue ON ue.empresa_id = s.empresa_id
      JOIN usuarios u         ON u.id = ue.usuario_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY fichas_update ON fichas FOR UPDATE
  USING (
    sucursal_id IN (
      SELECT s.id FROM sucursales s
      JOIN usuario_empresa ue ON ue.empresa_id = s.empresa_id
      JOIN usuarios u         ON u.id = ue.usuario_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE ON fichas TO authenticated;

-- ── RLS pagos_reservas ────────────────────────────────────────
ALTER TABLE pagos_reservas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_pagos  ON pagos_reservas;
DROP POLICY IF EXISTS pagos_select            ON pagos_reservas;
DROP POLICY IF EXISTS pagos_insert            ON pagos_reservas;

CREATE POLICY pagos_select ON pagos_reservas FOR SELECT
  USING (
    sucursal_id IN (
      SELECT s.id FROM sucursales s
      JOIN usuario_empresa ue ON ue.empresa_id = s.empresa_id
      JOIN usuarios u         ON u.id = ue.usuario_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY pagos_insert ON pagos_reservas FOR INSERT
  WITH CHECK (
    sucursal_id IN (
      SELECT s.id FROM sucursales s
      JOIN usuario_empresa ue ON ue.empresa_id = s.empresa_id
      JOIN usuarios u         ON u.id = ue.usuario_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT ON pagos_reservas TO authenticated;

-- ── RLS reservas (fix permiso denegado en días anteriores) ────
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reservas_select ON reservas;
DROP POLICY IF EXISTS reservas_insert ON reservas;
DROP POLICY IF EXISTS reservas_update ON reservas;
DROP POLICY IF EXISTS reservas_delete ON reservas;
DROP POLICY IF EXISTS tenant_isolation_reservas ON reservas;

CREATE POLICY reservas_select ON reservas FOR SELECT
  USING (
    empresa_id IN (
      SELECT ue.empresa_id FROM usuario_empresa ue
      JOIN usuarios u ON u.id = ue.usuario_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY reservas_insert ON reservas FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT ue.empresa_id FROM usuario_empresa ue
      JOIN usuarios u ON u.id = ue.usuario_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Sin restricción de fecha — permite cobrar reservas de días anteriores
CREATE POLICY reservas_update ON reservas FOR UPDATE
  USING (
    empresa_id IN (
      SELECT ue.empresa_id FROM usuario_empresa ue
      JOIN usuarios u ON u.id = ue.usuario_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY reservas_delete ON reservas FOR DELETE
  USING (
    empresa_id IN (
      SELECT ue.empresa_id FROM usuario_empresa ue
      JOIN usuarios u ON u.id = ue.usuario_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON reservas TO authenticated;
