-- ============================================================
-- Al Huzaifa Furniture — Demo Seed Data
-- Run AFTER 001_schema.sql
-- ============================================================

-- ── Client ────────────────────────────────────────────────────
insert into clients (id, name, logo_url, created_at) values
  ('00000000-0000-0000-0000-000000000001', 'Al Huzaifa Furniture', '', '2024-01-01 00:00:00+00');

-- ── Demo user (create via Supabase Auth dashboard first, then link) ──
-- After creating demo@alhuzaifa.ae in Auth, run:
-- insert into profiles (id, client_id, full_name, role)
-- values ('<auth-user-uuid>', '00000000-0000-0000-0000-000000000001', 'Demo Admin', 'admin');

-- ── Leads ─────────────────────────────────────────────────────
insert into leads (id, client_id, name, phone, email, source, status, whatsapp_status, call_status, ai_summary, transcript, interest, created_at, updated_at) values

('lead-001','00000000-0000-0000-0000-000000000001','Ahmed Al Rashidi','+971501234567','ahmed.rashidi@gmail.com','meta_ad','qualified','handed_off','answered',
'Customer inquired about the L-shaped corner sofa in grey. Bot confirmed availability and price (AED 3,200). Customer asked about delivery to Sharjah — bot confirmed 3-5 business days. Customer requested a callback to finalise the order. Conversation handed to human agent. Recommended next action: call back before 6PM.',
'[10:32 AM] Bot: Hello! Thank you for your interest in Al Huzaifa Furniture. How can I help you today?
[10:33 AM] Customer: Hi I saw your ad for the corner sofa
[10:35 AM] Bot: Our L-shaped corner sofa in grey is AED 3,200 including free delivery.
[10:36 AM] Customer: Can you deliver to Sharjah?
[10:37 AM] Bot: Absolutely! We deliver across UAE including Sharjah in 3–5 business days.
[10:38 AM] Customer: Can someone call me to discuss payment?
[10:41 AM] Bot: Done! Our team will call you after 5 PM.',
'L-shaped corner sofa in grey (AED 3,200)',now() - interval '2 days',now() - interval '1 day'),

('lead-002','00000000-0000-0000-0000-000000000001','Mohammed Al Mansoori','+971502345678','moh.mansoori@hotmail.com','meta_ad','qualified','handed_off','answered',
'Customer inquired about the King Bedroom Set in walnut finish (AED 7,200). Bot provided full product details and 0% installment options. Customer confirmed strong interest and requested to speak with a consultant. Call completed — customer requested invoice. Recommended next action: send invoice and follow up on payment.',
'[02:15 PM] Bot: Welcome to Al Huzaifa Furniture! What are you looking for today?
[02:16 PM] Customer: I need a full king bedroom set
[02:17 PM] Bot: Our King Bedroom Set (6-piece) in walnut finish is AED 7,200.
[02:21 PM] Customer: Do you have installment?
[02:22 PM] Bot: Yes! 0% installment on 3, 6, or 12 months with UAE bank cards.
[02:24 PM] Customer: Ok please connect me to someone to order
[02:25 PM] Bot: Connecting you now! A consultant will reach out within 30 minutes.',
'King Bedroom Set — walnut finish (AED 7,200)',now() - interval '3 days',now() - interval '2 days'),

('lead-003','00000000-0000-0000-0000-000000000001','Fatima Al Zaabi','+971503456789','fatima.zaabi@gmail.com','meta_ad','qualified','replied','answered',
'Customer inquired about the 3+2 Sofa Set in grey velvet (AED 4,600). Confirmed stain-resistant coating and 2-year warranty. Customer placed intent to order — connected to sales team. Call made and answered. Recommended next action: confirm delivery slot and process payment.',
'[03:45 PM] Bot: Hello! Thanks for reaching out to Al Huzaifa Furniture.
[03:47 PM] Bot: Our 3+2 sofa set in grey velvet is AED 4,600.
[03:48 PM] Customer: Is it stain resistant?
[03:49 PM] Bot: Yes! Protective coating included — spills wipe clean easily. 2-year warranty.
[03:52 PM] Customer: Ok I want to order. What is next?
[03:53 PM] Bot: I will connect you with our sales team now!',
'3+2 Sofa Set in grey velvet (AED 4,600)',now() - interval '4 days',now() - interval '3 days'),

('lead-004','00000000-0000-0000-0000-000000000001','Salem Al Nuaimi','+971504567890','salem.nuaimi@gmail.com','website','qualified','handed_off','answered',
'Customer inquired about the Oak TV Unit (AED 2,100). Confirmed delivery to Dubai JVC (free). Customer requested to proceed with order. Order confirmed via voice call. Recommended next action: schedule delivery.',
'[06:30 PM] Bot: Hello! Welcome to Al Huzaifa Furniture.
[06:31 PM] Customer: Looking for a TV unit something modern
[06:32 PM] Bot: Our Oak TV Unit is AED 2,100. Fits TVs up to 75 inches.
[06:35 PM] Customer: What is the delivery time to Dubai JVC?
[06:36 PM] Bot: 3-5 business days. Free delivery for your order.
[06:37 PM] Customer: Ok add me to the order list',
'Oak TV Unit & Media Console (AED 2,100)',now() - interval '1 day',now() - interval '12 hours'),

('lead-005','00000000-0000-0000-0000-000000000001','Khalid Al Shamsi','+971505678901','khalid.shamsi@yahoo.com','meta_ad','qualified','replied','answered',
'Customer inquired about the L-shaped corner sofa with chaise in dark brown (AED 5,200). Bot confirmed stock and delivery timeline to Ajman. Customer confirmed purchase intent. Voice call answered and order placed. Recommended next action: confirm assembly date.',
'[11:20 AM] Customer: Hi do you have corner sofa with chaise
[11:21 AM] Bot: Yes! Our L-shaped sofa with chaise in dark brown is AED 5,200.
[11:22 AM] Customer: Delivery to Ajman?
[11:23 AM] Bot: Yes, free delivery to Ajman in 4–6 days.
[11:24 AM] Customer: Ok I will take it',
'L-shaped corner sofa with chaise (AED 5,200)',now() - interval '5 days',now() - interval '4 days'),

('lead-006','00000000-0000-0000-0000-000000000001','Mariam Al Kaabi','+971506789012','mariam.kaabi@gmail.com','google','qualified','handed_off','answered',
'Customer inquired about the King Bedroom Set in white lacquer (AED 6,800). Interested in delivery to Abu Dhabi Reem Island. Bot confirmed free delivery and assembly. Customer connected to sales consultant and order confirmed.',
'[09:15 AM] Customer: Do you have white bedroom sets?
[09:16 AM] Bot: Yes! Our King Bedroom Set in white lacquer is AED 6,800. 6-piece set including wardrobe.
[09:17 AM] Customer: Delivery to Abu Dhabi Reem Island?
[09:18 AM] Bot: Yes! Free delivery and professional assembly included.
[09:19 AM] Customer: Perfect, please connect me with sales',
'King Bedroom Set — white lacquer (AED 6,800)',now() - interval '6 days',now() - interval '5 days'),

('lead-007','00000000-0000-0000-0000-000000000001','Vikram Sharma','+971507890123','vikram.sharma@gmail.com','meta_ad','qualified','replied','callback',
'Customer interested in the 8-seater Walnut Dining Table (AED 5,400). Asked about extendable options. Bot confirmed 10-seater extension. Customer visited showroom and confirmed purchase pending final measurements. Recommended next action: follow up on measurement confirmation.',
'[11:05 AM] Customer: Do you have 8 seater dining tables?
[11:07 AM] Bot: Yes! Our 8-seater walnut dining table is AED 5,400. Extendable to 10-seater!
[11:10 AM] Customer: I want to visit showroom
[11:11 AM] Bot: Our showroom is in Al Quoz, Dubai. Open 10AM–10PM daily.',
'8-seater Walnut Dining Table (AED 5,400)',now() - interval '7 days',now() - interval '6 days'),

('lead-008','00000000-0000-0000-0000-000000000001','Latifa Al Qassimi','+971508901234','latifa.qassimi@gmail.com','tiktok','qualified','handed_off','answered',
'Customer inquired about the 3+2 sofa set in beige from a TikTok ad. Confirmed price (AED 4,200). Requested delivery to Sharjah Al Nahda. Bot handed conversation to agent who completed the sale.',
'[04:10 PM] Customer: Hi I saw your video on TikTok about the beige sofa
[04:11 PM] Bot: Our 3+2 sofa set in beige is AED 4,200! Very popular design.
[04:12 PM] Customer: Can you deliver to Sharjah Al Nahda?
[04:13 PM] Bot: Yes! Free delivery to Sharjah in 3–5 days.
[04:14 PM] Customer: I want to buy please',
'3+2 Sofa Set in beige (AED 4,200)',now() - interval '3 days',now() - interval '2 days'),

('lead-009','00000000-0000-0000-0000-000000000001','Rashid Al Khoury','+971509012345','rashid.khoury@hotmail.com','website','qualified','replied','answered',
'Customer inquired about the sliding wardrobe 3-door 210cm. Confirmed free professional assembly. Customer decided on cash on delivery. Order placed and delivery scheduled for next week.',
'[09:20 AM] Customer: I need a wardrobe for master bedroom
[09:22 AM] Bot: Our 3-door mirror sliding wardrobe in 210cm is AED 3,800 with free assembly!
[09:25 AM] Customer: Does it come assembled?
[09:26 AM] Bot: Yes! Free professional assembly included.
[09:27 AM] Customer: Perfect. I will pay cash on delivery',
'Sliding Wardrobe 3-door 210cm (AED 3,800)',now() - interval '8 days',now() - interval '7 days'),

('lead-010','00000000-0000-0000-0000-000000000001','Priya Menon','+971510123456','priya.menon@gmail.com','google','qualified','handed_off','answered',
'Customer inquired about the L-shaped corner sofa in grey (AED 3,200) for Dubai Sports City. Confirmed delivery timeline. Customer placed order via sales call. Recommended next action: dispatch delivery.',
'[02:30 PM] Customer: Looking for L-shaped sofa grey
[02:31 PM] Bot: Our L-shaped corner sofa in grey is AED 3,200 including delivery.
[02:33 PM] Customer: How long to deliver to Sports City Dubai?
[02:34 PM] Bot: 3–5 business days, free delivery.
[02:35 PM] Customer: Great, connect me with sales',
'L-shaped corner sofa in grey (AED 3,200)',now() - interval '9 days',now() - interval '8 days'),

-- CONTACTED leads
('lead-016','00000000-0000-0000-0000-000000000001','Omar Al Dhaheri','+971516789012','omar.dhaheri@gmail.com','meta_ad','contacted','replied','callback',
'Customer interested in the 8-seater dining table (AED 5,400). Currently comparing with another vendor. Bot sent catalogue link. Voice call ended with callback request. Recommended next action: call back with a special discount offer.',
'[01:00 PM] Customer: Hi what dining tables do you have
[01:01 PM] Bot: We have beautiful dining sets! Our 8-seater walnut table is AED 5,400.
[01:03 PM] Customer: I am comparing with other stores. Can you give discount?
[01:04 PM] Bot: I can arrange a special offer for you. Let me have a consultant call you back.',
'8-seater Dining Table walnut (AED 5,400)',now() - interval '13 days',now() - interval '12 days'),

('lead-017','00000000-0000-0000-0000-000000000001','Noura Al Blooshi','+971517890123','noura.blooshi@hotmail.com','meta_ad','contacted','replied','not_answered',
'Customer inquired about the sliding wardrobe 3-door 180cm. Showed interest but mentioned needing to measure room first. Voice call attempted — not answered. Recommended next action: WhatsApp follow-up.',
'[10:05 AM] Customer: Do you have smaller wardrobes?
[10:07 AM] Bot: Yes! Our 3-door sliding wardrobe is available in 180cm for the same price AED 3,800.
[10:08 AM] Customer: I need to measure my room first
[10:09 AM] Bot: Take your time! Our team can also help with measurements.',
'Sliding Wardrobe 3-door 180cm (AED 3,800)',now() - interval '14 days',now() - interval '13 days'),

('lead-018','00000000-0000-0000-0000-000000000001','Aisha Al Ketbi','+971518901234','aisha.ketbi@gmail.com','website','contacted','replied','callback',
'Customer inquired about children''s bedroom set (AED 3,600). Asked about age-appropriate designs. Bot shared catalogue. Customer said comparing with other stores. Recommended next action: offer 5% discount to close.',
'[03:20 PM] Customer: Do you have kids bedroom sets?
[03:21 PM] Bot: Yes! Our Children Bedroom Set 3-piece is AED 3,600. Safe, durable, and age-appropriate designs.
[03:23 PM] Customer: My kids are 7 and 10. Would it suit them?
[03:24 PM] Bot: Perfect age range! The set includes twin beds, study desk, and wardrobe. Great for siblings sharing a room.',
'Children''s Bedroom Set 3-piece (AED 3,600)',now() - interval '5 days',now() - interval '4 days'),

-- NEW leads
('lead-031','00000000-0000-0000-0000-000000000001','Abdullah Al Hameli','+971531234567','abd.hameli@gmail.com','meta_ad','new','sent','queued',
'New lead from Meta Ad. Interest: L-shaped corner sofa in grey (AED 3,200). WhatsApp message sent with product details. Awaiting customer reply. Recommended next action: follow up in 2 hours.',
'[10:00 AM] Bot: Hello! Thank you for your interest in Al Huzaifa Furniture. We noticed you clicked on our L-shaped sofa ad. Can we help? Our grey sofa is AED 3,200 with free UAE delivery.',
'L-shaped corner sofa in grey (AED 3,200)',now() - interval '1 day',now() - interval '20 hours'),

('lead-032','00000000-0000-0000-0000-000000000001','Saeed Al Mansouri','+971532345678','saeed.mansouri@hotmail.com','meta_ad','new','sent','queued',
'New lead from Meta Ad. Interest: 3+2 Sofa Set in beige (AED 4,200). WhatsApp message sent. Awaiting reply.',
'[11:30 AM] Bot: Hi! You showed interest in our 3+2 sofa set. The beige fabric version is AED 4,200 with free delivery across UAE. Would you like to know more?',
'3+2 Sofa Set in beige (AED 4,200)',now() - interval '4 hours',now() - interval '4 hours'),

('lead-033','00000000-0000-0000-0000-000000000001','Deepa Nair','+971533456789','deepa.nair@gmail.com','google','new','sent','queued',
'New lead from Google. Interest: King Bedroom Set walnut (AED 7,200). WhatsApp sent. Awaiting reply.',
'[09:45 AM] Bot: Hello! You enquired about bedroom furniture on our website. Our King Bedroom Set in walnut is AED 7,200 with free delivery and assembly. Reply YES to learn more!',
'King Bedroom Set — walnut (AED 7,200)',now() - interval '1 day',now() - interval '22 hours'),

-- COLD leads
('lead-041','00000000-0000-0000-0000-000000000001','Hind Al Hajri','+971541234567','hind.hajri@gmail.com','meta_ad','cold','no_reply','not_answered',
'Lead captured from Meta Ad. WhatsApp message sent — no response after 3 attempts over 7 days. Voice call attempted — not answered. Marked as cold. Recommended next action: re-engage with promotional offer in 30 days.',
'[02:00 PM] Bot: Hi! You showed interest in Al Huzaifa Furniture. We would love to help you find the perfect piece for your home.
[05:00 PM] Bot: Just checking in! Is there anything specific you are looking for?
[Next day 10:00 AM] Bot: Final follow-up from Al Huzaifa Furniture. Feel free to message anytime!',
'L-shaped corner sofa in beige (AED 3,200)',now() - interval '22 days',now() - interval '15 days'),

('lead-042','00000000-0000-0000-0000-000000000001','Mansour Al Sabah','+971542345678','mansour.sabah@hotmail.com','meta_ad','cold','no_reply','not_answered',
'Lead captured from Meta Ad. No response to 3 WhatsApp follow-ups. Call not answered. Cold after 7 days. Recommended next action: re-engage in 30 days.',
'[02:00 PM] Bot: Hi Mansour! You showed interest in our King Bedroom Set. The walnut finish is AED 7,200 with free delivery.
[05:00 PM] Bot: Still here if you need anything! Our team is happy to help.
[Next day] Bot: Final follow-up. Feel free to reach out anytime.',
'King Bedroom Set (AED 6,800)',now() - interval '24 days',now() - interval '17 days');

-- ── WhatsApp Events ────────────────────────────────────────────
insert into whatsapp_events (lead_id, client_id, event_type, created_at) values
  ('lead-001','00000000-0000-0000-0000-000000000001','message_sent',      now() - interval '2 days' + interval '2 minutes'),
  ('lead-001','00000000-0000-0000-0000-000000000001','message_received',   now() - interval '2 days' + interval '8 minutes'),
  ('lead-001','00000000-0000-0000-0000-000000000001','bot_replied',        now() - interval '2 days' + interval '9 minutes'),
  ('lead-001','00000000-0000-0000-0000-000000000001','agent_assigned',     now() - interval '2 days' + interval '30 minutes'),
  ('lead-001','00000000-0000-0000-0000-000000000001','conversation_closed',now() - interval '2 days' + interval '90 minutes'),
  ('lead-002','00000000-0000-0000-0000-000000000001','message_sent',       now() - interval '3 days' + interval '2 minutes'),
  ('lead-002','00000000-0000-0000-0000-000000000001','message_received',   now() - interval '3 days' + interval '10 minutes'),
  ('lead-002','00000000-0000-0000-0000-000000000001','bot_replied',        now() - interval '3 days' + interval '11 minutes'),
  ('lead-002','00000000-0000-0000-0000-000000000001','agent_assigned',     now() - interval '3 days' + interval '35 minutes'),
  ('lead-002','00000000-0000-0000-0000-000000000001','conversation_closed',now() - interval '3 days' + interval '120 minutes'),
  ('lead-003','00000000-0000-0000-0000-000000000001','message_sent',       now() - interval '4 days' + interval '2 minutes'),
  ('lead-003','00000000-0000-0000-0000-000000000001','message_received',   now() - interval '4 days' + interval '12 minutes'),
  ('lead-003','00000000-0000-0000-0000-000000000001','bot_replied',        now() - interval '4 days' + interval '13 minutes'),
  ('lead-004','00000000-0000-0000-0000-000000000001','message_sent',       now() - interval '1 day'  + interval '2 minutes'),
  ('lead-004','00000000-0000-0000-0000-000000000001','message_received',   now() - interval '1 day'  + interval '7 minutes'),
  ('lead-004','00000000-0000-0000-0000-000000000001','bot_replied',        now() - interval '1 day'  + interval '8 minutes'),
  ('lead-004','00000000-0000-0000-0000-000000000001','agent_assigned',     now() - interval '1 day'  + interval '25 minutes'),
  ('lead-004','00000000-0000-0000-0000-000000000001','conversation_closed',now() - interval '1 day'  + interval '60 minutes'),
  ('lead-031','00000000-0000-0000-0000-000000000001','message_sent',       now() - interval '1 day'  + interval '2 minutes'),
  ('lead-032','00000000-0000-0000-0000-000000000001','message_sent',       now() - interval '4 hours'+ interval '2 minutes'),
  ('lead-041','00000000-0000-0000-0000-000000000001','message_sent',       now() - interval '22 days'+ interval '2 minutes'),
  ('lead-042','00000000-0000-0000-0000-000000000001','message_sent',       now() - interval '24 days'+ interval '2 minutes');

-- ── Call Events ────────────────────────────────────────────────
insert into call_events (lead_id, client_id, event_type, duration_seconds, outcome, created_at) values
  ('lead-001','00000000-0000-0000-0000-000000000001','call_started', 0,   'answered', now() - interval '2 days' + interval '4 hours'),
  ('lead-001','00000000-0000-0000-0000-000000000001','call_ended',   234, 'answered', now() - interval '2 days' + interval '4 hours' + interval '4 minutes'),
  ('lead-001','00000000-0000-0000-0000-000000000001','call_analyzed',234, 'answered', now() - interval '2 days' + interval '5 hours'),
  ('lead-002','00000000-0000-0000-0000-000000000001','call_started', 0,   'answered', now() - interval '3 days' + interval '4 hours'),
  ('lead-002','00000000-0000-0000-0000-000000000001','call_ended',   312, 'answered', now() - interval '3 days' + interval '4 hours' + interval '6 minutes'),
  ('lead-002','00000000-0000-0000-0000-000000000001','call_analyzed',312, 'qualified',now() - interval '3 days' + interval '5 hours'),
  ('lead-003','00000000-0000-0000-0000-000000000001','call_started', 0,   'answered', now() - interval '4 days' + interval '4 hours'),
  ('lead-003','00000000-0000-0000-0000-000000000001','call_ended',   198, 'answered', now() - interval '4 days' + interval '4 hours' + interval '3 minutes'),
  ('lead-004','00000000-0000-0000-0000-000000000001','call_started', 0,   'answered', now() - interval '1 day'  + interval '4 hours'),
  ('lead-004','00000000-0000-0000-0000-000000000001','call_ended',   156, 'answered', now() - interval '1 day'  + interval '4 hours' + interval '3 minutes'),
  ('lead-016','00000000-0000-0000-0000-000000000001','call_started', 0,   'callback', now() - interval '13 days'+ interval '4 hours'),
  ('lead-016','00000000-0000-0000-0000-000000000001','call_ended',   45,  'callback', now() - interval '13 days'+ interval '4 hours' + interval '1 minute'),
  ('lead-017','00000000-0000-0000-0000-000000000001','call_started', 0,   'not_answered', now() - interval '14 days'+ interval '4 hours'),
  ('lead-017','00000000-0000-0000-0000-000000000001','call_ended',   0,   'not_answered', now() - interval '14 days'+ interval '4 hours'),
  ('lead-041','00000000-0000-0000-0000-000000000001','call_started', 0,   'not_answered', now() - interval '21 days'+ interval '4 hours'),
  ('lead-041','00000000-0000-0000-0000-000000000001','call_ended',   0,   'not_answered', now() - interval '21 days'+ interval '4 hours');
