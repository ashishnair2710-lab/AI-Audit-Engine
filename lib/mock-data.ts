import type { Lead, WhatsappEvent, CallEvent, Client, TimelineEvent } from './types'

export const CLIENT: Client = {
  id: 'client-001',
  name: 'Al Huzaifa Furniture',
  logo_url: '',
  created_at: '2024-01-01T00:00:00Z',
}

function daysAgo(n: number, hourOffset = 0): string {
  const d = new Date('2026-05-20T12:00:00Z')
  d.setDate(d.getDate() - n)
  d.setHours(d.getHours() - hourOffset)
  return d.toISOString()
}

const TRANSCRIPTS: Record<string, string> = {
  sofa_grey: `[10:32 AM] Bot → Customer: Hello! Thank you for your interest in Al Huzaifa Furniture. How can I help you today? 🛋️
[10:33 AM] Customer → Bot: Hi I saw your ad for the corner sofa
[10:33 AM] Bot → Customer: Great choice! Our L-shaped corner sofa comes in grey, beige, and dark brown. Which colour appeals to you?
[10:34 AM] Customer → Bot: Grey looks nice. What's the price?
[10:35 AM] Bot → Customer: The L-shaped corner sofa in grey is AED 3,200 including free delivery. We also have a chaise version for AED 3,800.
[10:36 AM] Customer → Bot: Can you deliver to Sharjah?
[10:37 AM] Bot → Customer: Absolutely! We deliver across UAE including Sharjah in 3–5 business days. Free delivery on all orders above AED 3,000 ✅
[10:38 AM] Customer → Bot: Can someone call me to discuss payment?
[10:39 AM] Bot → Customer: Of course! I'll arrange a callback. What time works best?
[10:40 AM] Customer → Bot: Anytime after 5pm
[10:41 AM] Bot → Customer: Done! Our team will call you after 5 PM to finalise your order and discuss payment options.
[10:42 AM] Customer → Bot: Thanks`,

  bedroom_set: `[02:15 PM] Bot → Customer: Welcome to Al Huzaifa Furniture! What are you looking for today?
[02:16 PM] Customer → Bot: I need a full king bedroom set
[02:17 PM] Bot → Customer: Excellent! Our King Bedroom Set (6-piece) is available in white lacquer (AED 6,800) and walnut finish (AED 7,200). Both include bed frame, 2 side tables, dresser, mirror, and wardrobe.
[02:18 PM] Customer → Bot: Walnut looks better. Can I see more pictures?
[02:19 PM] Bot → Customer: I've sent you our catalogue link! 📸 The walnut set is our most popular — warm tones that suit modern Arabic interiors beautifully.
[02:21 PM] Customer → Bot: I like it. Do you have installment?
[02:22 PM] Bot → Customer: Yes! 0% installment available with UAE bank cards — 3, 6, or 12 months via Emirates NBD, FAB, ADCB, and more.
[02:24 PM] Customer → Bot: Ok please connect me to someone to order
[02:25 PM] Bot → Customer: Connecting you now! A consultant will reach out within 30 minutes. 🎉`,

  dining_marble: `[11:05 AM] Bot → Customer: Hi! Welcome to Al Huzaifa Furniture. How can I assist you?
[11:06 AM] Customer → Bot: Do you have marble top dining tables?
[11:07 AM] Bot → Customer: Yes! Our 6-seater Marble Top Dining Set is a bestseller at AED 4,800. Includes the table and 6 chairs in beige fabric.
[11:08 AM] Customer → Bot: What about 8-seater?
[11:09 AM] Bot → Customer: We have a stunning 8-seater walnut dining table at AED 5,400. Extendable to 10-seater! Very popular for family gatherings.
[11:10 AM] Customer → Bot: I'm comparing a few options. Do you have showroom?
[11:11 AM] Bot → Customer: Our showroom is in Al Quoz, Dubai and Industrial Area, Sharjah. Open 10AM–10PM daily including weekends!
[11:12 AM] Customer → Bot: Ok I'll visit
[11:13 AM] Bot → Customer: Wonderful! We'll note your interest. Our team will send you the exact showroom address and directions 🗺️`,

  sofa_set: `[03:45 PM] Bot → Customer: Hello! Thanks for reaching out to Al Huzaifa Furniture 😊
[03:46 PM] Customer → Bot: Hi, what sofa sets do you have for a living room
[03:47 PM] Bot → Customer: Our 3+2 sofa sets are very popular! Available in beige fabric (AED 4,200) and grey velvet (AED 4,600). Both come with 2 throw pillows included.
[03:48 PM] Customer → Bot: The grey velvet sounds good. Is it stain resistant?
[03:49 PM] Bot → Customer: Great question! Yes, our grey velvet has a protective coating — spills can be wiped clean easily. Also includes a 2-year warranty.
[03:50 PM] Customer → Bot: For a 5-person family would it be enough?
[03:51 PM] Bot → Customer: Perfect fit! The 3-seater + 2-seater combo gives comfortable seating for 5. You can also add an armchair for AED 800 extra.
[03:52 PM] Customer → Bot: Ok I want to order. What's next?
[03:53 PM] Bot → Customer: I'll connect you with our sales team now. They'll confirm your address, delivery slot, and payment method. Expect a call within 1 hour! 🎉`,

  wardrobe: `[09:20 AM] Bot → Customer: Good morning! How can Al Huzaifa Furniture help you today?
[09:21 AM] Customer → Bot: I need a wardrobe for master bedroom
[09:22 AM] Bot → Customer: We have beautiful sliding wardrobes! Our 3-door mirror sliding wardrobe (AED 3,800) is a top seller — saves space and makes the room look bigger.
[09:23 AM] Customer → Bot: What sizes do you have?
[09:24 AM] Bot → Customer: Available in 180cm, 210cm, and 240cm width. All include internal fittings: hanging rails, 4 shelves, 2 drawers.
[09:25 AM] Customer → Bot: 240cm please, I have space. Does it come assembled?
[09:26 AM] Bot → Customer: Yes! Free professional assembly included. Our team will install it in your home within the same delivery window.
[09:27 AM] Customer → Bot: Perfect. How do I pay?
[09:28 AM] Bot → Customer: You can pay online via card, bank transfer, or cash on delivery. Installments also available 0% on 6 months!
[09:30 AM] Customer → Bot: Let me check with my wife and get back to you
[09:31 AM] Bot → Customer: Of course! Take your time. I'll follow up in 24 hours. Here's our catalogue for her to browse too 😊`,

  no_reply: `[02:00 PM] Bot → Customer: Hi! You showed interest in Al Huzaifa Furniture through our ad. We'd love to help you find the perfect piece for your home 🏠
[-- No response after 3 hours --]
[05:00 PM] Bot → Customer: Just checking in! Is there anything specific you're looking for? We have sofas, bedrooms, dining sets and more — all with free UAE delivery.
[-- No response after 24 hours --]
[Next day 10:00 AM] Bot → Customer: Hi, this is a final follow-up from Al Huzaifa Furniture. If you'd like to explore our latest collection, our team is here to help. Feel free to message anytime!
[-- No response --]`,

  tv_unit: `[06:30 PM] Bot → Customer: Hello! Welcome to Al Huzaifa Furniture. What brings you here today?
[06:31 PM] Customer → Bot: Looking for a TV unit something modern
[06:32 PM] Bot → Customer: Great taste! Our Oak TV Unit & Media Console is AED 2,100. Features floating shelves, cable management, and fits TVs up to 75 inches.
[06:33 PM] Customer → Bot: Does it have storage for gaming stuff?
[06:34 PM] Bot → Customer: Yes! 3 enclosed cabinets below and 2 open shelves for consoles, remotes etc. Very practical design.
[06:35 PM] Customer → Bot: Nice. What's the delivery time to Abu Dhabi?
[06:36 PM] Bot → Customer: We deliver to Abu Dhabi in 4–6 business days. Free delivery for your order ✅
[06:37 PM] Customer → Bot: Ok add me to the order list
[06:38 PM] Bot → Customer: You're added! Our team will call you within 2 hours to confirm delivery details and payment. 📦`,
}

const SUMMARIES: Record<string, string> = {
  qualified_sofa: 'Customer inquired about the L-shaped corner sofa in grey. Bot confirmed availability and price (AED 3,200). Customer asked about delivery to Sharjah — bot confirmed 3-5 business days. Customer requested a callback to finalise the order. Conversation handed to human agent. Recommended next action: call back before 6PM.',
  qualified_bedroom: 'Customer inquired about the King Bedroom Set in walnut finish (AED 7,200). Bot provided full product details and 0% installment options. Customer confirmed strong interest and requested to speak with a consultant. Conversation handed off successfully. Call completed — customer requested invoice. Recommended next action: send invoice and follow up on payment.',
  qualified_sofa_set: 'Customer inquired about the 3+2 sofa set in grey velvet (AED 4,600). Confirmed stain-resistant coating and 2-year warranty. Customer placed intent to order — connected to sales team. Call made and answered. Recommended next action: confirm delivery slot and process payment.',
  qualified_tv: 'Customer inquired about the Oak TV Unit (AED 2,100). Confirmed delivery to Abu Dhabi (4-6 days, free). Customer requested to proceed with order. Conversation completed and order confirmed via voice call. Recommended next action: schedule delivery.',
  contacted_wardrobe: 'Customer inquired about the 3-door sliding wardrobe (AED 3,800, 240cm). Confirmed free assembly included. Customer said they need to check with family before deciding. Follow-up scheduled for 24 hours. Recommended next action: send catalogue and follow up tomorrow.',
  contacted_dining: 'Customer interested in both 6-seater marble top (AED 4,800) and 8-seater walnut dining table (AED 5,400). Mentioned comparing options and wants to visit showroom. Showroom location sent. Recommended next action: call to confirm showroom visit and offer a guided tour.',
  new_sofa: 'New lead from Meta Ad. Interest: L-shaped corner sofa in beige. WhatsApp message sent with product details and pricing (AED 3,200). Awaiting customer reply. Recommended next action: follow up in 2 hours with product images.',
  cold_no_reply: 'Lead captured from Meta Ad. WhatsApp message sent — no response after 3 attempts over 7 days. Voice call attempted — not answered twice. Marked as cold. Recommended next action: re-engage with promotional offer in 30 days.',
  contacted_bedroom: 'Customer showed interest in Children\'s Bedroom Set (AED 3,600). Asked about age-appropriate designs. Bot shared catalogue. Customer mentioned comparing with other stores. Recommended next action: offer a 5% discount to close.',
  qualified_wardrobe: 'Customer ordered the 3-door sliding wardrobe in 210cm. Confirmed delivery to Dubai Al Barsha. Payment discussed — chose cash on delivery. Delivery slot confirmed for next week. Recommended next action: confirm assembly team dispatch.',
}

type RawLead = [
  string, // name
  string, // phone
  string, // email
  Lead['source'],
  Lead['status'],
  Lead['whatsapp_status'],
  Lead['call_status'],
  string, // interest
  string, // location (for summary)
  number, // days ago
  string, // summary key
  string, // transcript key
]

const RAW: RawLead[] = [
  // QUALIFIED leads (15)
  ['Ahmed Al Rashidi',     '+971501234567', 'ahmed.rashidi@gmail.com',      'meta_ad', 'qualified', 'handed_off', 'answered',     'L-shaped corner sofa in grey (AED 3,200)',       'Sharjah',           2,  'qualified_sofa',     'sofa_grey'],
  ['Mohammed Al Mansoori', '+971502345678', 'moh.mansoori@hotmail.com',     'meta_ad', 'qualified', 'handed_off', 'answered',     'King Bedroom Set — walnut finish (AED 7,200)',   'Dubai Marina',      3,  'qualified_bedroom',  'bedroom_set'],
  ['Fatima Al Zaabi',      '+971503456789', 'fatima.zaabi@gmail.com',       'meta_ad', 'qualified', 'replied',    'answered',     '3+2 Sofa Set in grey velvet (AED 4,600)',        'Abu Dhabi Khalifa', 4,  'qualified_sofa_set', 'sofa_set'],
  ['Salem Al Nuaimi',      '+971504567890', 'salem.nuaimi@gmail.com',       'website', 'qualified', 'handed_off', 'answered',     'Oak TV Unit & Media Console (AED 2,100)',        'Dubai JVC',         1,  'qualified_tv',       'tv_unit'],
  ['Khalid Al Shamsi',     '+971505678901', 'khalid.shamsi@yahoo.com',      'meta_ad', 'qualified', 'replied',    'answered',     'L-shaped corner sofa with chaise (AED 5,200)',   'Ajman',             5,  'qualified_sofa',     'sofa_grey'],
  ['Mariam Al Kaabi',      '+971506789012', 'mariam.kaabi@gmail.com',       'google',  'qualified', 'handed_off', 'answered',     'King Bedroom Set — white lacquer (AED 6,800)',   'Abu Dhabi Reem Is.',6,  'qualified_bedroom',  'bedroom_set'],
  ['Vikram Sharma',        '+971507890123', 'vikram.sharma@gmail.com',      'meta_ad', 'qualified', 'replied',    'callback',     '8-seater Walnut Dining Table (AED 5,400)',       'Dubai Downtown',    7,  'qualified_sofa_set', 'dining_marble'],
  ['Latifa Al Qassimi',    '+971508901234', 'latifa.qassimi@gmail.com',     'tiktok',  'qualified', 'handed_off', 'answered',     '3+2 Sofa Set in beige (AED 4,200)',              'Sharjah Al Nahda',  3,  'qualified_sofa_set', 'sofa_set'],
  ['Rashid Al Khoury',     '+971509012345', 'rashid.khoury@hotmail.com',    'website', 'qualified', 'replied',    'answered',     'Sliding Wardrobe 3-door 210cm (AED 3,800)',      'Dubai Al Barsha',   8,  'qualified_wardrobe', 'wardrobe'],
  ['Priya Menon',          '+971510123456', 'priya.menon@gmail.com',        'google',  'qualified', 'handed_off', 'answered',     'L-shaped corner sofa in grey (AED 3,200)',       'Dubai Sports City', 9,  'qualified_sofa',     'sofa_grey'],
  ['Jassim Al Zarooni',    '+971511234567', 'jassim.zarooni@gmail.com',     'meta_ad', 'qualified', 'replied',    'answered',     '6-seater Marble Dining Set (AED 4,800)',         'Sharjah Muwaileh',  10, 'qualified_sofa_set', 'dining_marble'],
  ['Hessa Al Muhairy',     '+971512345678', 'hessa.muhairy@gmail.com',      'meta_ad', 'qualified', 'handed_off', 'callback',     'King Bedroom Set — walnut (AED 7,200)',          'Dubai Deira',       11, 'qualified_bedroom',  'bedroom_set'],
  ['Rajesh Kumar',         '+971513456789', 'rajesh.kumar@gmail.com',       'website', 'qualified', 'replied',    'answered',     '3+2 Sofa Set in grey velvet (AED 4,600)',        'Sharjah Al Qasimia',12, 'qualified_sofa_set', 'sofa_set'],
  ['Reem Al Breiki',       '+971514567890', 'reem.breiki@yahoo.com',        'tiktok',  'qualified', 'handed_off', 'answered',     'Sliding Wardrobe 240cm mirror (AED 3,800)',      'Dubai Mirdif',      6,  'qualified_wardrobe', 'wardrobe'],
  ['Sultan Al Ketbi',      '+971515678901', 'sultan.ketbi@gmail.com',       'meta_ad', 'qualified', 'replied',    'answered',     'Oak TV Unit & Media Console (AED 2,100)',        'Abu Dhabi Musaffah', 4, 'qualified_tv',       'tv_unit'],

  // CONTACTED leads (15)
  ['Omar Al Dhaheri',      '+971516789012', 'omar.dhaheri@gmail.com',       'meta_ad', 'contacted', 'replied',    'callback',     '8-seater Dining Table walnut (AED 5,400)',       'Dubai JVC',         13, 'contacted_dining',   'dining_marble'],
  ['Noura Al Blooshi',     '+971517890123', 'noura.blooshi@hotmail.com',    'meta_ad', 'contacted', 'replied',    'not_answered', 'Sliding Wardrobe 3-door 180cm (AED 3,800)',      'Sharjah',           14, 'contacted_wardrobe', 'wardrobe'],
  ['Aisha Al Ketbi',       '+971518901234', 'aisha.ketbi@gmail.com',        'website', 'contacted', 'replied',    'callback',     "Children's Bedroom Set 3-piece (AED 3,600)",     'Dubai Al Barsha',   5,  'contacted_bedroom',  'bedroom_set'],
  ['Tariq Al Ameri',       '+971519012345', 'tariq.ameri@gmail.com',        'meta_ad', 'contacted', 'sent',       'queued',       'L-shaped corner sofa in beige (AED 3,200)',      'Ajman',             15, 'new_sofa',           'sofa_grey'],
  ['Hassan Al Suwaidi',    '+971520123456', 'hassan.suwaidi@gmail.com',     'google',  'contacted', 'replied',    'not_answered', '6-seater Marble Dining Set (AED 4,800)',         'Abu Dhabi Khalifa', 16, 'contacted_dining',   'dining_marble'],
  ['Meera Al Qubaisi',     '+971521234567', 'meera.qubaisi@yahoo.com',      'meta_ad', 'contacted', 'replied',    'callback',     'King Bedroom Set — white lacquer (AED 6,800)',   'Dubai Downtown',    7,  'contacted_bedroom',  'bedroom_set'],
  ['Ali Hassan',           '+971522345678', 'ali.hassan99@gmail.com',       'meta_ad', 'contacted', 'replied',    'not_answered', '3+2 Sofa Set in beige (AED 4,200)',              'Dubai Sports City', 17, 'contacted_wardrobe', 'sofa_set'],
  ['Sana Malik',           '+971523456789', 'sana.malik@gmail.com',         'tiktok',  'contacted', 'replied',    'callback',     'Oak TV Unit & Media Console (AED 2,100)',        'Sharjah Muwaileh',  9,  'contacted_wardrobe', 'tv_unit'],
  ['Yusuf Al Mazrouei',    '+971524567890', 'yusuf.mazrouei@gmail.com',     'website', 'contacted', 'sent',       'queued',       'L-shaped corner sofa with chaise (AED 5,200)',   'Sharjah Al Nahda',  18, 'new_sofa',           'sofa_grey'],
  ['Shamsa Al Remeithi',   '+971525678901', 'shamsa.remeithi@hotmail.com',  'meta_ad', 'contacted', 'replied',    'not_answered', 'Sliding Wardrobe 240cm (AED 3,800)',             'Dubai Deira',       8,  'contacted_wardrobe', 'wardrobe'],
  ['John Mathew',          '+971526789012', 'john.mathew@gmail.com',        'google',  'contacted', 'replied',    'callback',     '8-seater Walnut Dining Table (AED 5,400)',       'Dubai Marina',      19, 'contacted_dining',   'dining_marble'],
  ['Bilal Ahmed',          '+971527890123', 'bilal.ahmed@gmail.com',        'meta_ad', 'contacted', 'replied',    'not_answered', 'King Bedroom Set walnut (AED 7,200)',            'Abu Dhabi Reem Is.',10, 'contacted_bedroom',  'bedroom_set'],
  ['Khawla Al Neyadi',     '+971528901234', 'khawla.neyadi@yahoo.com',      'meta_ad', 'contacted', 'sent',       'queued',       '3+2 Sofa Set in grey velvet (AED 4,600)',        'Dubai JVC',         20, 'new_sofa',           'sofa_set'],
  ['Moza Al Khateri',      '+971529012345', 'moza.khateri@gmail.com',       'website', 'contacted', 'replied',    'not_answered', '6-seater Marble Dining Set (AED 4,800)',         'Sharjah',           11, 'contacted_dining',   'dining_marble'],
  ['Imran Siddiqui',       '+971530123456', 'imran.siddiqui@gmail.com',     'tiktok',  'contacted', 'replied',    'callback',     'Oak TV Unit & Media Console (AED 2,100)',        'Ajman',             13, 'contacted_wardrobe', 'tv_unit'],

  // NEW leads (10)
  ['Abdullah Al Hameli',   '+971531234567', 'abd.hameli@gmail.com',         'meta_ad', 'new',       'sent',       'queued',       'L-shaped corner sofa in grey (AED 3,200)',       'Dubai Downtown',    1,  'new_sofa',           'sofa_grey'],
  ['Saeed Al Mansouri',    '+971532345678', 'saeed.mansouri@hotmail.com',   'meta_ad', 'new',       'sent',       'queued',       '3+2 Sofa Set in beige (AED 4,200)',              'Dubai Sports City', 0,  'new_sofa',           'sofa_set'],
  ['Deepa Nair',           '+971533456789', 'deepa.nair@gmail.com',         'google',  'new',       'sent',       'queued',       'King Bedroom Set — walnut (AED 7,200)',          'Abu Dhabi Khalifa', 1,  'new_sofa',           'bedroom_set'],
  ['Zayed Al Falasi',      '+971534567890', 'zayed.falasi@gmail.com',       'meta_ad', 'new',       'sent',       'queued',       'Sliding Wardrobe 210cm (AED 3,800)',             'Sharjah Muwaileh',  2,  'new_sofa',           'wardrobe'],
  ['Maria Jose',           '+971535678901', 'maria.jose@gmail.com',         'tiktok',  'new',       'sent',       'queued',       '6-seater Marble Dining Set (AED 4,800)',         'Dubai Marina',      0,  'new_sofa',           'dining_marble'],
  ['Hamdan Al Merri',      '+971536789012', 'hamdan.merri@gmail.com',       'meta_ad', 'new',       'sent',       'queued',       'L-shaped corner sofa in beige (AED 3,200)',      'Dubai Mirdif',      1,  'new_sofa',           'sofa_grey'],
  ['Obaid Al Tunaiji',     '+971537890123', 'obaid.tunaiji@yahoo.com',      'meta_ad', 'new',       'sent',       'queued',       'Children\'s Bedroom Set (AED 3,600)',            'Sharjah Al Nahda',  2,  'new_sofa',           'bedroom_set'],
  ['Sara Al Matrooshi',    '+971538901234', 'sara.matrooshi@gmail.com',     'website', 'new',       'sent',       'queued',       '8-seater Walnut Dining Table (AED 5,400)',       'Abu Dhabi Musaffah',0,  'new_sofa',           'dining_marble'],
  ['Khalfan Al Mazrouei',  '+971539012345', 'khalfan.mazrouei@gmail.com',   'meta_ad', 'new',       'sent',       'queued',       'Oak TV Unit (AED 2,100)',                        'Dubai Deira',       1,  'new_sofa',           'tv_unit'],
  ['Amna Al Hosani',       '+971540123456', 'amna.hosani@hotmail.com',      'meta_ad', 'new',       'sent',       'queued',       '3+2 Sofa Set in grey velvet (AED 4,600)',        'Ajman',             0,  'new_sofa',           'sofa_set'],

  // COLD leads (10)
  ['Hind Al Hajri',        '+971541234567', 'hind.hajri@gmail.com',         'meta_ad', 'cold',      'no_reply',   'not_answered', 'L-shaped corner sofa in beige (AED 3,200)',      'Sharjah',           22, 'cold_no_reply',      'no_reply'],
  ['Mansour Al Sabah',     '+971542345678', 'mansour.sabah@hotmail.com',    'meta_ad', 'cold',      'no_reply',   'not_answered', 'King Bedroom Set (AED 6,800)',                   'Dubai JVC',         24, 'cold_no_reply',      'no_reply'],
  ['Sheikha Al Mulla',     '+971543456789', 'sheikha.mulla@gmail.com',      'website', 'cold',      'no_reply',   'not_answered', '6-seater Marble Dining Set (AED 4,800)',         'Abu Dhabi Reem Is.',25, 'cold_no_reply',      'no_reply'],
  ['Zainab Hussain',       '+971544567890', 'zainab.hussain@gmail.com',     'meta_ad', 'cold',      'no_reply',   'not_answered', '3+2 Sofa Set (AED 4,200)',                       'Dubai Sports City', 26, 'cold_no_reply',      'no_reply'],
  ['Faisal Al Ghamdi',     '+971545678901', 'faisal.ghamdi@yahoo.com',      'meta_ad', 'cold',      'no_reply',   'not_answered', 'Sliding Wardrobe (AED 3,800)',                   'Sharjah Al Qasimia',27, 'cold_no_reply',      'no_reply'],
  ['Nadia Al Sheikh',      '+971546789012', 'nadia.sheikh@gmail.com',       'google',  'cold',      'no_reply',   'not_answered', 'Oak TV Unit (AED 2,100)',                        'Dubai Downtown',    28, 'cold_no_reply',      'no_reply'],
  ['Layla Al Sayed',       '+971547890123', 'layla.sayed@gmail.com',        'meta_ad', 'cold',      'no_reply',   'not_answered', 'L-shaped corner sofa (AED 3,200)',               'Ajman',             29, 'cold_no_reply',      'no_reply'],
  ['Waleed Al Nasser',     '+971548901234', 'waleed.nasser@hotmail.com',    'meta_ad', 'cold',      'no_reply',   'not_answered', 'King Bedroom Set (AED 7,200)',                   'Dubai Marina',      30, 'cold_no_reply',      'no_reply'],
  ['Dina El Masry',        '+971549012345', 'dina.masry@gmail.com',         'tiktok',  'cold',      'no_reply',   'not_answered', '8-seater Dining Table (AED 5,400)',              'Dubai Deira',       23, 'cold_no_reply',      'no_reply'],
  ['Yousif Al Zaabi',      '+971550123456', 'yousif.zaabi@gmail.com',       'website', 'cold',      'no_reply',   'not_answered', '3+2 Sofa Set (AED 4,200)',                       'Sharjah',           21, 'cold_no_reply',      'no_reply'],
]

export const LEADS: Lead[] = RAW.map((row, i) => {
  const [name, phone, email, source, status, whatsapp_status, call_status, interest, , daysAgoVal, summaryKey, transcriptKey] = row
  const created = daysAgo(daysAgoVal, i % 8)
  return {
    id: `lead-${String(i + 1).padStart(3, '0')}`,
    client_id: 'client-001',
    name,
    phone,
    email,
    source,
    status,
    whatsapp_status,
    call_status,
    ai_summary: SUMMARIES[summaryKey] ?? SUMMARIES['new_sofa'],
    transcript: TRANSCRIPTS[transcriptKey] ?? TRANSCRIPTS['sofa_grey'],
    interest,
    created_at: created,
    updated_at: daysAgo(daysAgoVal - 1, i % 6),
  }
})

// ─── WhatsApp Events ──────────────────────────────────────────────────────────

export const WHATSAPP_EVENTS: WhatsappEvent[] = LEADS.flatMap((lead, i) => {
  const base = new Date(lead.created_at).getTime()
  const mins = (m: number) => new Date(base + m * 60000).toISOString()
  const events: WhatsappEvent[] = [
    { id: `wa-${lead.id}-1`, lead_id: lead.id, client_id: 'client-001', event_type: 'message_sent', created_at: mins(2) },
  ]
  if (lead.whatsapp_status === 'replied' || lead.whatsapp_status === 'handed_off') {
    events.push({ id: `wa-${lead.id}-2`, lead_id: lead.id, client_id: 'client-001', event_type: 'message_received', created_at: mins(8 + i % 15) })
    events.push({ id: `wa-${lead.id}-3`, lead_id: lead.id, client_id: 'client-001', event_type: 'bot_replied', created_at: mins(9 + i % 15) })
  }
  if (lead.whatsapp_status === 'handed_off') {
    events.push({ id: `wa-${lead.id}-4`, lead_id: lead.id, client_id: 'client-001', event_type: 'agent_assigned', created_at: mins(30 + i % 20) })
    events.push({ id: `wa-${lead.id}-5`, lead_id: lead.id, client_id: 'client-001', event_type: 'conversation_closed', created_at: mins(60 + i % 30) })
  }
  return events
})

// ─── Call Events ──────────────────────────────────────────────────────────────

export const CALL_EVENTS: CallEvent[] = LEADS.flatMap((lead, i) => {
  if (lead.call_status === 'queued') return []
  const base = new Date(lead.created_at).getTime()
  const hrs = (h: number) => new Date(base + h * 3600000).toISOString()
  const durationMap: Record<string, number> = { answered: 180 + i * 12, callback: 45, not_answered: 0, qualified: 240 + i * 15 }
  const duration = durationMap[lead.call_status] ?? 0
  return [
    { id: `call-${lead.id}-1`, lead_id: lead.id, client_id: 'client-001', event_type: 'call_started', duration_seconds: 0, outcome: lead.call_status as CallEvent['outcome'], created_at: hrs(4 + i % 6) },
    { id: `call-${lead.id}-2`, lead_id: lead.id, client_id: 'client-001', event_type: 'call_ended', duration_seconds: duration, outcome: lead.call_status as CallEvent['outcome'], created_at: hrs(4 + i % 6 + 0.1) },
    { id: `call-${lead.id}-3`, lead_id: lead.id, client_id: 'client-001', event_type: 'call_analyzed', duration_seconds: duration, outcome: lead.call_status as CallEvent['outcome'], created_at: hrs(5 + i % 6) },
  ]
})

// ─── Timeline builder ─────────────────────────────────────────────────────────

export function buildTimeline(lead: Lead): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { id: 't1', label: 'Lead created', detail: `Source: ${lead.source.replace('_', ' ')}`, timestamp: lead.created_at, icon: 'lead' },
  ]
  const waEvents = WHATSAPP_EVENTS.filter(e => e.lead_id === lead.id)
  waEvents.forEach(e => {
    const labelMap: Record<string, string> = {
      message_sent: 'WhatsApp message sent',
      message_received: 'Customer replied via WhatsApp',
      bot_replied: 'AI bot replied',
      agent_assigned: 'Conversation handed to human agent',
      conversation_closed: 'WhatsApp conversation closed',
    }
    events.push({ id: e.id, label: labelMap[e.event_type] ?? e.event_type, timestamp: e.created_at, icon: 'whatsapp' })
  })
  const callEvts = CALL_EVENTS.filter(e => e.lead_id === lead.id)
  callEvts.forEach(e => {
    const labelMap: Record<string, string> = {
      call_started: 'Voice call initiated',
      call_ended: e.duration_seconds > 0 ? `Call ended (${Math.floor(e.duration_seconds / 60)}m ${e.duration_seconds % 60}s)` : 'Call not answered',
      call_analyzed: 'AI call summary generated',
    }
    events.push({ id: e.id, label: labelMap[e.event_type] ?? e.event_type, timestamp: e.created_at, icon: 'call' })
  })
  if (lead.status === 'qualified') events.push({ id: 'tq', label: 'Lead qualified', detail: 'Ready for sales handoff', timestamp: lead.updated_at, icon: 'qualified' })
  if (lead.status === 'cold') events.push({ id: 'tc', label: 'Lead marked cold', detail: 'No response after 7 days', timestamp: lead.updated_at, icon: 'cold' })
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

// ─── Dashboard metrics ────────────────────────────────────────────────────────

export function getDashboardMetrics() {
  const thisMonth = LEADS.filter(l => {
    const d = new Date(l.created_at)
    return d >= new Date('2026-04-20')
  })
  return {
    totalLeads: thisMonth.length,
    whatsappAnswered: thisMonth.filter(l => l.whatsapp_status === 'replied' || l.whatsapp_status === 'handed_off').length,
    callsMade: thisMonth.filter(l => l.call_status !== 'queued').length,
    qualifiedLeads: thisMonth.filter(l => l.status === 'qualified').length,
  }
}

export function getLeadsPerDay(days = 7): { date: string; leads: number }[] {
  const result: { date: string; leads: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date('2026-05-20')
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const count = LEADS.filter(l => l.created_at.startsWith(dateStr)).length
    result.push({ date: dateStr.slice(5), leads: count })
  }
  return result
}

// ─── WhatsApp report metrics ──────────────────────────────────────────────────

export function getWhatsappMetrics() {
  const initiated = LEADS.filter(l => l.whatsapp_status !== 'no_reply').length + LEADS.filter(l => l.whatsapp_status === 'no_reply').length
  const aiAnswered = LEADS.filter(l => l.whatsapp_status === 'replied' || l.whatsapp_status === 'handed_off').length
  const handedToHuman = LEADS.filter(l => l.whatsapp_status === 'handed_off').length
  const noReply = LEADS.filter(l => l.whatsapp_status === 'no_reply').length
  const responseRate = Math.round((aiAnswered / LEADS.length) * 100)
  return { initiated: LEADS.length, aiAnswered, handedToHuman, noReply, responseRate }
}

export function getChatsPerDay(days = 30): { date: string; chats: number }[] {
  const result: { date: string; chats: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date('2026-05-20')
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const count = WHATSAPP_EVENTS.filter(e => e.event_type === 'message_sent' && e.created_at.startsWith(dateStr)).length
    result.push({ date: dateStr.slice(5), chats: count || Math.floor(Math.random() * 3) })
  }
  return result
}

// ─── Calls report metrics ─────────────────────────────────────────────────────

export function getCallMetrics() {
  const made = CALL_EVENTS.filter(e => e.event_type === 'call_started').length
  const answered = CALL_EVENTS.filter(e => e.event_type === 'call_ended' && e.duration_seconds > 0).length
  const notAnswered = CALL_EVENTS.filter(e => e.event_type === 'call_ended' && e.duration_seconds === 0).length
  const callbacks = LEADS.filter(l => l.call_status === 'callback').length
  const durations = CALL_EVENTS.filter(e => e.event_type === 'call_ended' && e.duration_seconds > 0).map(e => e.duration_seconds)
  const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
  return { made, answered, notAnswered, callbacks, avgDuration }
}

export function getCallsPerDay(days = 30): { date: string; calls: number }[] {
  const result: { date: string; calls: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date('2026-05-20')
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const count = CALL_EVENTS.filter(e => e.event_type === 'call_started' && e.created_at.startsWith(dateStr)).length
    result.push({ date: dateStr.slice(5), calls: count || Math.floor(Math.random() * 2) })
  }
  return result
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date('2026-05-20T12:00:00Z').getTime()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
