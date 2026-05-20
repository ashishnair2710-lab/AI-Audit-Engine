export type LeadSource = 'meta_ad' | 'google' | 'website' | 'tiktok'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'cold'
export type WhatsappStatus = 'sent' | 'replied' | 'no_reply' | 'handed_off'
export type CallStatus = 'queued' | 'answered' | 'not_answered' | 'callback'

export interface Lead {
  id: string
  client_id: string
  name: string
  phone: string
  email: string
  source: LeadSource
  status: LeadStatus
  whatsapp_status: WhatsappStatus
  call_status: CallStatus
  ai_summary: string
  transcript: string
  interest: string
  created_at: string
  updated_at: string
}

export interface WhatsappEvent {
  id: string
  lead_id: string
  client_id: string
  event_type: 'message_sent' | 'message_received' | 'bot_replied' | 'agent_assigned' | 'conversation_closed'
  created_at: string
}

export interface CallEvent {
  id: string
  lead_id: string
  client_id: string
  event_type: 'call_started' | 'call_ended' | 'call_analyzed'
  duration_seconds: number
  outcome: 'answered' | 'not_answered' | 'callback' | 'qualified'
  created_at: string
}

export interface Client {
  id: string
  name: string
  logo_url: string
  created_at: string
}

export interface TimelineEvent {
  id: string
  label: string
  detail?: string
  timestamp: string
  icon: 'lead' | 'whatsapp' | 'call' | 'qualified' | 'cold'
}
