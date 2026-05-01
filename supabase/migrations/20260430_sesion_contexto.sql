-- Crear vista para obtener el contexto de sesión del usuario autenticado
-- Retorna el usuario, sus empresas asociadas, roles y datos de marca

DROP VIEW IF EXISTS v_sesion_contexto;

CREATE VIEW v_sesion_contexto AS
SELECT
  u.id AS usuario_id,
  u.auth_user_id,
  u.nombre_completo,
  u.email,
  r.rol AS rol_codigo,
  e.id AS empresa_id,
  e.nombre AS empresa_nombre,
  COALESCE(e.color_primary, '#000000') AS color_primary,
  COALESCE(e.color_secondary, '#666666') AS color_secondary,
  COALESCE(e.color_background, '#FFFFFF') AS color_background,
  e.logo_url
FROM usuarios u
INNER JOIN usuario_empresa ue ON u.id = ue.usuario_id
INNER JOIN empresas e ON ue.empresa_id = e.id
INNER JOIN roles r ON ue.rol_id = r.id
WHERE u.auth_user_id IS NOT NULL AND u.activo = true;
