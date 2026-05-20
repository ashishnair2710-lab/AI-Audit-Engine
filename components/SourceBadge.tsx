import type { LeadSource } from '@/lib/types'

const SOURCE_STYLES: Record<LeadSource, string> = {
  meta_ad: 'bg-blue-50 text-blue-700 border border-blue-200',
  google:  'bg-red-50 text-red-700 border border-red-200',
  website: 'bg-teal-50 text-teal-700 border border-teal-200',
  tiktok:  'bg-pink-50 text-pink-700 border border-pink-200',
}

const SOURCE_ICONS: Record<LeadSource, React.ReactNode> = {
  meta_ad: (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
    </svg>
  ),
  google: (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
    </svg>
  ),
  website: (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
    </svg>
  ),
  tiktok: (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/>
    </svg>
  ),
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  meta_ad: 'Meta Ad',
  google: 'Google',
  website: 'Website',
  tiktok: 'TikTok',
}

export default function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_STYLES[source]}`}>
      {SOURCE_ICONS[source]}
      {SOURCE_LABELS[source]}
    </span>
  )
}
