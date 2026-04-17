-- Sample documents — run this in Supabase SQL Editor to preview the Documents page
-- Replace 'client@example.com' with the actual email of your test client user

insert into public.documents (title, category, status, client_name, client_email, project_name, file_url, version) values
  ('Service Agreement 2024', 'contract', 'signed', 'Acme Corp', 'client@example.com', 'Website Redesign', null, '1.2'),
  ('Brand Strategy Proposal', 'proposal', 'pending_review', 'Acme Corp', 'client@example.com', 'Brand Refresh', null, '1.0'),
  ('Q1 Progress Report', 'report', 'approved', 'Acme Corp', 'client@example.com', 'Website Redesign', null, '1.0'),
  ('Invoice #INV-2024-001', 'invoice', 'approved', 'Acme Corp', 'client@example.com', null, null, null),
  ('Homepage Mockups', 'deliverable', 'approved', 'Acme Corp', 'client@example.com', 'Website Redesign', null, '2.1'),
  ('Project Creative Brief', 'brief', 'draft', 'Acme Corp', 'client@example.com', 'Brand Refresh', null, '1.0'),
  ('Technical Specifications', 'other', 'draft', 'Acme Corp', 'client@example.com', 'Website Redesign', null, '1.0'),
  ('NDA Agreement', 'contract', 'signed', 'Acme Corp', 'client@example.com', null, null, '1.0');
