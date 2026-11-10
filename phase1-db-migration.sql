-- ============================================================
-- Forest Code Dashboard — Phase 1 DB Migration
-- Datum: 2026-11-10
-- ============================================================

-- 1) Status 'abgenommen' erlauben (falls noch nicht geschehen)
ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;
ALTER TABLE inquiries ADD CONSTRAINT inquiries_status_check
  CHECK (status IN ('neu', 'bearbeitung', 'abgeschlossen', 'bezahlt', 'abgenommen'));

-- 2) Neue Spalten für Phase 1 Features
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS notes text DEFAULT '';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS correction_rounds integer DEFAULT 0;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS abo_changes_used integer DEFAULT 0;

-- 3) status_changed_at Spalte (falls noch nicht vorhanden)
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;
