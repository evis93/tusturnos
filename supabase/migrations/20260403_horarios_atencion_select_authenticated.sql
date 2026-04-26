-- ============================================================
-- Permite leer horarios_atencion a cualquier usuario autenticado
-- Necesario para mostrar disponibilidad en la reserva del cliente
-- ============================================================

DROP POLICY IF EXISTS horarios_atencion_select_same_empresa ON public.horarios_atencion;

CREATE POLICY horarios_atencion_select_authenticated
	ON public.horarios_atencion
	FOR SELECT
	TO authenticated
	USING (true);
