-- Agrega campo cbu_alias a reservas para incluir en mensajes de confirmación
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS cbu_alias TEXT;
