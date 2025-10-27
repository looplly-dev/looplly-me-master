-- Update get_country_iso_from_dial_code to support all 193 countries
CREATE OR REPLACE FUNCTION public.get_country_iso_from_dial_code(p_dial_code text)
RETURNS text
LANGUAGE sql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE p_dial_code
    -- Africa
    WHEN '+213' THEN 'DZ'  -- Algeria
    WHEN '+244' THEN 'AO'  -- Angola
    WHEN '+229' THEN 'BJ'  -- Benin
    WHEN '+267' THEN 'BW'  -- Botswana
    WHEN '+226' THEN 'BF'  -- Burkina Faso
    WHEN '+257' THEN 'BI'  -- Burundi
    WHEN '+237' THEN 'CM'  -- Cameroon
    WHEN '+238' THEN 'CV'  -- Cape Verde
    WHEN '+236' THEN 'CF'  -- Central African Republic
    WHEN '+235' THEN 'TD'  -- Chad
    WHEN '+269' THEN 'KM'  -- Comoros
    WHEN '+242' THEN 'CG'  -- Congo
    WHEN '+253' THEN 'DJ'  -- Djibouti
    WHEN '+20'  THEN 'EG'  -- Egypt
    WHEN '+240' THEN 'GQ'  -- Equatorial Guinea
    WHEN '+291' THEN 'ER'  -- Eritrea
    WHEN '+251' THEN 'ET'  -- Ethiopia
    WHEN '+241' THEN 'GA'  -- Gabon
    WHEN '+220' THEN 'GM'  -- Gambia
    WHEN '+233' THEN 'GH'  -- Ghana
    WHEN '+224' THEN 'GN'  -- Guinea
    WHEN '+245' THEN 'GW'  -- Guinea-Bissau
    WHEN '+254' THEN 'KE'  -- Kenya
    WHEN '+266' THEN 'LS'  -- Lesotho
    WHEN '+231' THEN 'LR'  -- Liberia
    WHEN '+218' THEN 'LY'  -- Libya
    WHEN '+261' THEN 'MG'  -- Madagascar
    WHEN '+265' THEN 'MW'  -- Malawi
    WHEN '+223' THEN 'ML'  -- Mali
    WHEN '+222' THEN 'MR'  -- Mauritania
    WHEN '+230' THEN 'MU'  -- Mauritius
    WHEN '+212' THEN 'MA'  -- Morocco
    WHEN '+258' THEN 'MZ'  -- Mozambique
    WHEN '+264' THEN 'NA'  -- Namibia
    WHEN '+227' THEN 'NE'  -- Niger
    WHEN '+234' THEN 'NG'  -- Nigeria
    WHEN '+250' THEN 'RW'  -- Rwanda
    WHEN '+239' THEN 'ST'  -- Sao Tome and Principe
    WHEN '+221' THEN 'SN'  -- Senegal
    WHEN '+248' THEN 'SC'  -- Seychelles
    WHEN '+232' THEN 'SL'  -- Sierra Leone
    WHEN '+252' THEN 'SO'  -- Somalia
    WHEN '+27'  THEN 'ZA'  -- South Africa
    WHEN '+211' THEN 'SS'  -- South Sudan
    WHEN '+249' THEN 'SD'  -- Sudan
    WHEN '+255' THEN 'TZ'  -- Tanzania
    WHEN '+228' THEN 'TG'  -- Togo
    WHEN '+216' THEN 'TN'  -- Tunisia
    WHEN '+256' THEN 'UG'  -- Uganda
    WHEN '+260' THEN 'ZM'  -- Zambia
    WHEN '+263' THEN 'ZW'  -- Zimbabwe
    
    -- Asia
    WHEN '+93'  THEN 'AF'  -- Afghanistan
    WHEN '+880' THEN 'BD'  -- Bangladesh
    WHEN '+975' THEN 'BT'  -- Bhutan
    WHEN '+673' THEN 'BN'  -- Brunei
    WHEN '+855' THEN 'KH'  -- Cambodia
    WHEN '+86'  THEN 'CN'  -- China
    WHEN '+91'  THEN 'IN'  -- India
    WHEN '+62'  THEN 'ID'  -- Indonesia
    WHEN '+98'  THEN 'IR'  -- Iran
    WHEN '+964' THEN 'IQ'  -- Iraq
    WHEN '+972' THEN 'IL'  -- Israel
    WHEN '+81'  THEN 'JP'  -- Japan
    WHEN '+962' THEN 'JO'  -- Jordan
    WHEN '+7'   THEN 'KZ'  -- Kazakhstan (shared with Russia, default KZ for +7)
    WHEN '+850' THEN 'KP'  -- North Korea
    WHEN '+82'  THEN 'KR'  -- South Korea
    WHEN '+965' THEN 'KW'  -- Kuwait
    WHEN '+996' THEN 'KG'  -- Kyrgyzstan
    WHEN '+856' THEN 'LA'  -- Laos
    WHEN '+961' THEN 'LB'  -- Lebanon
    WHEN '+60'  THEN 'MY'  -- Malaysia
    WHEN '+960' THEN 'MV'  -- Maldives
    WHEN '+976' THEN 'MN'  -- Mongolia
    WHEN '+95'  THEN 'MM'  -- Myanmar
    WHEN '+977' THEN 'NP'  -- Nepal
    WHEN '+968' THEN 'OM'  -- Oman
    WHEN '+92'  THEN 'PK'  -- Pakistan
    WHEN '+63'  THEN 'PH'  -- Philippines
    WHEN '+974' THEN 'QA'  -- Qatar
    WHEN '+966' THEN 'SA'  -- Saudi Arabia
    WHEN '+65'  THEN 'SG'  -- Singapore
    WHEN '+94'  THEN 'LK'  -- Sri Lanka
    WHEN '+963' THEN 'SY'  -- Syria
    WHEN '+886' THEN 'TW'  -- Taiwan
    WHEN '+992' THEN 'TJ'  -- Tajikistan
    WHEN '+66'  THEN 'TH'  -- Thailand
    WHEN '+670' THEN 'TL'  -- Timor-Leste
    WHEN '+90'  THEN 'TR'  -- Turkey
    WHEN '+993' THEN 'TM'  -- Turkmenistan
    WHEN '+971' THEN 'AE'  -- United Arab Emirates
    WHEN '+998' THEN 'UZ'  -- Uzbekistan
    WHEN '+84'  THEN 'VN'  -- Vietnam
    WHEN '+967' THEN 'YE'  -- Yemen
    
    -- Europe
    WHEN '+355' THEN 'AL'  -- Albania
    WHEN '+376' THEN 'AD'  -- Andorra
    WHEN '+374' THEN 'AM'  -- Armenia
    WHEN '+43'  THEN 'AT'  -- Austria
    WHEN '+994' THEN 'AZ'  -- Azerbaijan
    WHEN '+375' THEN 'BY'  -- Belarus
    WHEN '+32'  THEN 'BE'  -- Belgium
    WHEN '+387' THEN 'BA'  -- Bosnia and Herzegovina
    WHEN '+359' THEN 'BG'  -- Bulgaria
    WHEN '+385' THEN 'HR'  -- Croatia
    WHEN '+357' THEN 'CY'  -- Cyprus
    WHEN '+420' THEN 'CZ'  -- Czech Republic
    WHEN '+45'  THEN 'DK'  -- Denmark
    WHEN '+372' THEN 'EE'  -- Estonia
    WHEN '+358' THEN 'FI'  -- Finland
    WHEN '+33'  THEN 'FR'  -- France
    WHEN '+995' THEN 'GE'  -- Georgia
    WHEN '+49'  THEN 'DE'  -- Germany
    WHEN '+30'  THEN 'GR'  -- Greece
    WHEN '+36'  THEN 'HU'  -- Hungary
    WHEN '+354' THEN 'IS'  -- Iceland
    WHEN '+353' THEN 'IE'  -- Ireland
    WHEN '+39'  THEN 'IT'  -- Italy (Vatican City also uses +39)
    WHEN '+371' THEN 'LV'  -- Latvia
    WHEN '+423' THEN 'LI'  -- Liechtenstein
    WHEN '+370' THEN 'LT'  -- Lithuania
    WHEN '+352' THEN 'LU'  -- Luxembourg
    WHEN '+389' THEN 'MK'  -- North Macedonia
    WHEN '+356' THEN 'MT'  -- Malta
    WHEN '+373' THEN 'MD'  -- Moldova
    WHEN '+377' THEN 'MC'  -- Monaco
    WHEN '+382' THEN 'ME'  -- Montenegro
    WHEN '+31'  THEN 'NL'  -- Netherlands
    WHEN '+47'  THEN 'NO'  -- Norway
    WHEN '+48'  THEN 'PL'  -- Poland
    WHEN '+351' THEN 'PT'  -- Portugal
    WHEN '+40'  THEN 'RO'  -- Romania
    WHEN '+381' THEN 'RS'  -- Serbia
    WHEN '+421' THEN 'SK'  -- Slovakia
    WHEN '+386' THEN 'SI'  -- Slovenia
    WHEN '+34'  THEN 'ES'  -- Spain
    WHEN '+46'  THEN 'SE'  -- Sweden
    WHEN '+41'  THEN 'CH'  -- Switzerland
    WHEN '+380' THEN 'UA'  -- Ukraine
    WHEN '+44'  THEN 'GB'  -- United Kingdom
    
    -- Americas (North America)
    WHEN '+1'     THEN 'US'  -- United States (default for +1)
    WHEN '+1-242' THEN 'BS'  -- Bahamas
    WHEN '+1-246' THEN 'BB'  -- Barbados
    WHEN '+1-268' THEN 'AG'  -- Antigua and Barbuda
    WHEN '+1-473' THEN 'GD'  -- Grenada
    WHEN '+1-758' THEN 'LC'  -- Saint Lucia
    WHEN '+1-767' THEN 'DM'  -- Dominica
    WHEN '+1-784' THEN 'VC'  -- Saint Vincent and the Grenadines
    WHEN '+1-809' THEN 'DO'  -- Dominican Republic
    WHEN '+1-868' THEN 'TT'  -- Trinidad and Tobago
    WHEN '+1-869' THEN 'KN'  -- Saint Kitts and Nevis
    WHEN '+1-876' THEN 'JM'  -- Jamaica
    WHEN '+501' THEN 'BZ'  -- Belize
    WHEN '+502' THEN 'GT'  -- Guatemala
    WHEN '+503' THEN 'SV'  -- El Salvador
    WHEN '+504' THEN 'HN'  -- Honduras
    WHEN '+505' THEN 'NI'  -- Nicaragua
    WHEN '+506' THEN 'CR'  -- Costa Rica
    WHEN '+507' THEN 'PA'  -- Panama
    WHEN '+52'  THEN 'MX'  -- Mexico
    WHEN '+53'  THEN 'CU'  -- Cuba
    WHEN '+509' THEN 'HT'  -- Haiti
    
    -- Americas (South America)
    WHEN '+54'  THEN 'AR'  -- Argentina
    WHEN '+591' THEN 'BO'  -- Bolivia
    WHEN '+55'  THEN 'BR'  -- Brazil
    WHEN '+56'  THEN 'CL'  -- Chile
    WHEN '+57'  THEN 'CO'  -- Colombia
    WHEN '+593' THEN 'EC'  -- Ecuador
    WHEN '+592' THEN 'GY'  -- Guyana
    WHEN '+595' THEN 'PY'  -- Paraguay
    WHEN '+51'  THEN 'PE'  -- Peru
    WHEN '+597' THEN 'SR'  -- Suriname
    WHEN '+598' THEN 'UY'  -- Uruguay
    WHEN '+58'  THEN 'VE'  -- Venezuela
    
    -- Oceania
    WHEN '+61'  THEN 'AU'  -- Australia
    WHEN '+679' THEN 'FJ'  -- Fiji
    WHEN '+686' THEN 'KI'  -- Kiribati
    WHEN '+692' THEN 'MH'  -- Marshall Islands
    WHEN '+691' THEN 'FM'  -- Micronesia
    WHEN '+674' THEN 'NR'  -- Nauru
    WHEN '+64'  THEN 'NZ'  -- New Zealand
    WHEN '+680' THEN 'PW'  -- Palau
    WHEN '+675' THEN 'PG'  -- Papua New Guinea
    WHEN '+685' THEN 'WS'  -- Samoa
    WHEN '+677' THEN 'SB'  -- Solomon Islands
    WHEN '+676' THEN 'TO'  -- Tonga
    WHEN '+688' THEN 'TV'  -- Tuvalu
    WHEN '+678' THEN 'VU'  -- Vanuatu
    WHEN '+378' THEN 'SM'  -- San Marino
    
    ELSE NULL
  END;
$function$;

-- Backfill existing profiles where country_iso is NULL but country_code exists
UPDATE profiles 
SET country_iso = get_country_iso_from_dial_code(country_code)
WHERE country_code IS NOT NULL 
  AND country_iso IS NULL;