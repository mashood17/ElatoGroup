/**
 * Shared country-code list for every phone field across the site (Home/Stay/
 * Events enquiries, the scratch-card offer form). One source of truth so the
 * dropdown, validation and E.164 assembly all agree.
 */

export interface CountryCode {
  iso: string
  dialCode: string
  name: string
  flag: string
}

function flagFromIso(iso: string): string {
  return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
}

// India first (primary market), UAE second (existing secondary market) —
// both already had bespoke validation before the dropdown existed — then
// the rest alphabetically by name.
const RAW: [string, string, string][] = [
  ['IN', '+91', 'India'],
  ['AE', '+971', 'United Arab Emirates'],
  ['AU', '+61', 'Australia'],
  ['BH', '+973', 'Bahrain'],
  ['BD', '+880', 'Bangladesh'],
  ['BR', '+55', 'Brazil'],
  ['CA', '+1', 'Canada'],
  ['CN', '+86', 'China'],
  ['DK', '+45', 'Denmark'],
  ['EG', '+20', 'Egypt'],
  ['FR', '+33', 'France'],
  ['DE', '+49', 'Germany'],
  ['HK', '+852', 'Hong Kong'],
  ['ID', '+62', 'Indonesia'],
  ['IE', '+353', 'Ireland'],
  ['IT', '+39', 'Italy'],
  ['JP', '+81', 'Japan'],
  ['KE', '+254', 'Kenya'],
  ['KW', '+965', 'Kuwait'],
  ['MY', '+60', 'Malaysia'],
  ['MX', '+52', 'Mexico'],
  ['NP', '+977', 'Nepal'],
  ['NL', '+31', 'Netherlands'],
  ['NZ', '+64', 'New Zealand'],
  ['NG', '+234', 'Nigeria'],
  ['NO', '+47', 'Norway'],
  ['OM', '+968', 'Oman'],
  ['PK', '+92', 'Pakistan'],
  ['PH', '+63', 'Philippines'],
  ['QA', '+974', 'Qatar'],
  ['RU', '+7', 'Russia'],
  ['SA', '+966', 'Saudi Arabia'],
  ['SG', '+65', 'Singapore'],
  ['ZA', '+27', 'South Africa'],
  ['KR', '+82', 'South Korea'],
  ['ES', '+34', 'Spain'],
  ['LK', '+94', 'Sri Lanka'],
  ['SE', '+46', 'Sweden'],
  ['CH', '+41', 'Switzerland'],
  ['TH', '+66', 'Thailand'],
  ['TR', '+90', 'Turkey'],
  ['GB', '+44', 'United Kingdom'],
  ['US', '+1', 'United States'],
  ['VN', '+84', 'Vietnam'],
]

export const COUNTRY_CODES: CountryCode[] = RAW.map(([iso, dialCode, name]) => ({
  iso,
  dialCode,
  name,
  flag: flagFromIso(iso),
}))

export const DEFAULT_COUNTRY_ISO = 'IN'

export function dialCodeForIso(iso: string): string {
  return COUNTRY_CODES.find((c) => c.iso === iso)?.dialCode ?? '+91'
}
