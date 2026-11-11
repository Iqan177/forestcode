-- ============================================================
-- Phase 4: Automatisierung — DB Migration
-- Tabellen: appointments, deadlines, payment_links
-- ============================================================

-- 1. APPOINTMENTS (Terminbuchung)
CREATE TABLE IF NOT EXISTS appointments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_date date NOT NULL,
    appointment_time text,
    customer_name text NOT NULL,
    customer_email text,
    inquiry_id uuid REFERENCES inquiries(id),
    appointment_type text DEFAULT 'erstgespraech' CHECK (appointment_type IN ('erstgespraech', 'beratung', 'designreview', 'abnahme', 'support')),
    duration_minutes integer DEFAULT 30,
    notes text,
    status text DEFAULT 'geplant' CHECK (status IN ('geplant', 'bestaetigt', 'abgeschlossen', 'abgesagt')),
    created_at timestamptz DEFAULT now()
);

-- 2. DEADLINES (Fristen & Erinnerungen)
CREATE TABLE IF NOT EXISTS deadlines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    due_date date NOT NULL,
    priority text DEFAULT 'normal' CHECK (priority IN ('normal', 'hoch', 'kritisch')),
    inquiry_id uuid REFERENCES inquiries(id),
    inquiry_name text,
    reminder_days integer DEFAULT 1,
    reminder_sent boolean DEFAULT false,
    completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 3. PAYMENT_LINKS (Zahlungslinks)
CREATE TABLE IF NOT EXISTS payment_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id uuid REFERENCES invoices(id),
    invoice_number text,
    customer_name text,
    amount numeric DEFAULT 0,
    provider text DEFAULT 'paypal' CHECK (provider IN ('paypal', 'stripe', 'ueberweisung')),
    payment_link text,
    created_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- Appointments RLS
CREATE POLICY "Allow authenticated read appointments" ON appointments
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert appointments" ON appointments
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update appointments" ON appointments
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete appointments" ON appointments
    FOR DELETE TO authenticated USING (true);

-- Deadlines RLS
CREATE POLICY "Allow authenticated read deadlines" ON deadlines
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert deadlines" ON deadlines
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update deadlines" ON deadlines
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete deadlines" ON deadlines
    FOR DELETE TO authenticated USING (true);

-- Payment Links RLS
CREATE POLICY "Allow authenticated read payment_links" ON payment_links
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert payment_links" ON payment_links
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update payment_links" ON payment_links
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- Realtime subscriptions
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE deadlines;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_links;
