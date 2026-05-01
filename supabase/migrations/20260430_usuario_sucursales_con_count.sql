-- Vista para obtener sucursales del usuario con conteos
-- Permite redirigir directamente si el usuario solo tiene 1 sucursal

DROP VIEW IF EXISTS v_usuario_sucursales_con_count;

CREATE OR REPLACE VIEW v_usuario_sucursales_con_count AS
WITH sucursales_usuario AS (
  SELECT
    ue.usuario_id,
    s.id AS sucursal_id,
    s.nombre AS sucursal_nombre,
    s.direccion,
    s.location,
    e.id AS empresa_id,
    e.nombre AS empresa_nombre,
    ue.rol_id,
    r.rol AS rol_codigo
  FROM usuario_empresa ue
  JOIN empresas e ON e.id = ue.empresa_id
  JOIN sucursales s ON s.empresa_id = e.id
  JOIN roles r ON ue.rol_id = r.id
  WHERE e.activa = TRUE
    AND s.activa = TRUE
),
conteos AS (
  SELECT
    usuario_id,
    COUNT(DISTINCT sucursal_id) AS total_sucursales_usuario,
    COUNT(DISTINCT empresa_id) AS total_empresas_usuario
  FROM sucursales_usuario
  GROUP BY usuario_id
),
sucursales_por_empresa AS (
  SELECT
    usuario_id,
    empresa_id,
    COUNT(DISTINCT sucursal_id) AS sucursales_por_empresa
  FROM sucursales_usuario
  GROUP BY usuario_id, empresa_id
)
SELECT
  su.usuario_id,
  su.sucursal_id,
  su.sucursal_nombre,
  su.direccion,
  su.location,
  su.empresa_id,
  su.empresa_nombre,
  su.rol_id,
  su.rol_codigo,
  c.total_sucursales_usuario,
  c.total_empresas_usuario,
  spe.sucursales_por_empresa,
  e.color_primary,
  e.color_secondary,
  e.color_background,
  e.logo_url
FROM sucursales_usuario su
JOIN conteos c ON c.usuario_id = su.usuario_id
JOIN sucursales_por_empresa spe ON spe.usuario_id = su.usuario_id
  AND spe.empresa_id = su.empresa_id
JOIN empresas e ON e.id = su.empresa_id
ORDER BY su.usuario_id, su.empresa_nombre, su.sucursal_nombre;

-- Grant permissions
GRANT SELECT ON v_usuario_sucursales_con_count TO authenticated, anon, service_role;
