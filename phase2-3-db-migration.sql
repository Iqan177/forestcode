-- ============================================================
-- PHASE 2+3 DATABASE MIGRATION
-- Angebotswesen (Quotes) + Kundenportal
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. QUOTES TABLE
CREATE TABLE IF NOT EXISTS quotes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    number text NOT NULL,
    inquiry_id uuid REFERENCES inquiries(id),
    customer_id text,
    customer_name text NOT NULL,
    customer_email text,
    amount numeric DEFAULT 0,
    items jsonb DEFAULT '[]'::jsonb,
    quote_status text DEFAULT 'offen' CHECK (quote_status IN ('offen', 'angenommen', 'abgelehnt', 'abgelaufen')),
    valid_until timestamptz,
    follow_up_sent boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 2. COUNTER FOR QUOTE IDs
INSERT INTO counters (name, value)
VALUES ('quote_id', 1000)
ON CONFLICT (name) DO NOTHING;

-- 3. CUSTOMER ACCOUNT TRACKING
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS customer_account_created boolean DEFAULT false;

-- 4. RLS POLICIES FOR QUOTES
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to quotes"
ON quotes FOR ALL
USING (true)
WITH CHECK (true);

-- Customer read access (for Kundenportal)
CREATE POLICY "Customers can view own quotes"
ON quotes FOR SELECT
USING (
    customer_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
    )
);

-- 5. RLS POLICY FOR CUSTOMER PORTAL (inquiries read)
CREATE POLICY "Customers can view own inquiries"
ON inquiries FOR SELECT
USING (
    email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
    )
);

-- 6. RLS POLICY FOR CUSTOMER PORTAL (invoices read)
CREATE POLICY "Customers can view own invoices"
ON invoices FOR SELECT
USING (
    customer_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
    )
);

-- 7. REALTIME for quotes
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
