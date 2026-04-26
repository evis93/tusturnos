-- ============================================================
-- Ajusta la policy SELECT de horarios_atencion para clientes
-- ============================================================

DROP POLICY IF EXISTS horarios_atencion_select_same_empresa ON public.horarios_atencion;

DO $$
DECLARE
	role_column text;
BEGIN
	SELECT CASE
		WHEN EXISTS (
			SELECT 1
			FROM information_schema.columns
			WHERE table_schema = 'public'
				AND table_name = 'roles'
				AND column_name = 'rol'
		) THEN 'rol'
		WHEN EXISTS (
			SELECT 1
			FROM information_schema.columns
			WHERE table_schema = 'public'
				AND table_name = 'roles'
				AND column_name = 'nombre'
		) THEN 'nombre'
		ELSE NULL
	END INTO role_column;

	IF role_column IS NULL THEN
		RAISE EXCEPTION 'No se encontró una columna válida de nombre de rol en public.roles';
	END IF;

	EXECUTE format(
		'CREATE POLICY horarios_atencion_select_same_empresa
			ON public.horarios_atencion
			FOR SELECT
			TO authenticated
			USING (
				EXISTS (
					SELECT 1
					FROM public.usuario_empresa ue_actor
					JOIN public.roles r_actor ON r_actor.id = ue_actor.rol_id
					JOIN public.usuario_empresa ue_target ON ue_target.empresa_id = ue_actor.empresa_id
					JOIN public.usuarios u_actor ON u_actor.id = ue_actor.usuario_id
					WHERE u_actor.auth_user_id = auth.uid()
						AND ue_target.usuario_id = horarios_atencion.profesional_id
						AND r_actor.%I IN (''admin'', ''profesional'', ''superadmin'', ''cliente'')
				)
			)',
		role_column
	);
END $$;
