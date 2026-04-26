-- Reemplaza el CHECK constraint de pagos_reservas.metodo_pago
-- para usar el mismo enum que reservas.metodo_pago (metodo_pago_enum)
-- Hay que bajar la vista que depende de la columna, alterar, y recrearla.

DROP VIEW IF EXISTS v_reportes_sucursal;

ALTER TABLE pagos_reservas
  DROP CONSTRAINT IF EXISTS pagos_reservas_metodo_pago_check;

ALTER TABLE pagos_reservas
  ALTER COLUMN metodo_pago TYPE public.metodo_pago_enum
    USING metodo_pago::public.metodo_pago_enum;

-- Recrear la vista
CREATE OR REPLACE VIEW v_reportes_sucursal AS
SELECT
  pr.sucursal_id,
  su.nombre                AS sucursal_nombre,
  r.servicio_id,
  sv.nombre                AS servicio_nombre,
  pr.metodo_pago::text     AS metodo_pago,
  COUNT(*)                 AS cantidad_pagos,
  SUM(pr.monto)            AS total_monto
FROM pagos_reservas pr
JOIN  reservas   r  ON r.id  = pr.reserva_id
LEFT JOIN sucursales su ON su.id = pr.sucursal_id
LEFT JOIN servicios  sv ON sv.id = r.servicio_id
GROUP BY pr.sucursal_id, su.nombre, r.servicio_id, sv.nombre, pr.metodo_pago;
