-- ============================================================
-- Garantiza que horarios_atencion tenga la columna profesional_id
-- ============================================================

CREATE TABLE IF NOT EXISTS public.horarios_atencion (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	profesional_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
	dia_semana integer NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
	hora_inicio time without time zone NOT NULL,
	hora_fin time without time zone NOT NULL,
	activo boolean NOT NULL DEFAULT true,
	created_at timestamp with time zone DEFAULT now(),
	updated_at timestamp with time zone DEFAULT now()
);

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'horarios_atencion'
			AND column_name = 'terapeuta_id'
	) AND NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'horarios_atencion'
			AND column_name = 'profesional_id'
	) THEN
		EXECUTE 'ALTER TABLE public.horarios_atencion RENAME COLUMN terapeuta_id TO profesional_id';
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'horarios_atencion'
			AND column_name = 'profesional_id'
	) THEN
		EXECUTE 'ALTER TABLE public.horarios_atencion ADD COLUMN profesional_id uuid';
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'horarios_atencion'
			AND column_name = 'activo'
	) THEN
		EXECUTE 'ALTER TABLE public.horarios_atencion ADD COLUMN activo boolean NOT NULL DEFAULT true';
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'horarios_atencion'
			AND column_name = 'created_at'
	) THEN
		EXECUTE 'ALTER TABLE public.horarios_atencion ADD COLUMN created_at timestamp with time zone DEFAULT now()';
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'horarios_atencion'
			AND column_name = 'updated_at'
	) THEN
		EXECUTE 'ALTER TABLE public.horarios_atencion ADD COLUMN updated_at timestamp with time zone DEFAULT now()';
	END IF;
END $$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'horarios_atencion_profesional_id_fkey'
	) THEN
		ALTER TABLE public.horarios_atencion
			ADD CONSTRAINT horarios_atencion_profesional_id_fkey
			FOREIGN KEY (profesional_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
	END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_horarios_profesional
	ON public.horarios_atencion(profesional_id);

CREATE INDEX IF NOT EXISTS idx_horarios_profesional_dia
	ON public.horarios_atencion(profesional_id, dia_semana);
