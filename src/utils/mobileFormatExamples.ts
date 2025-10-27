export interface MobileFormatInfo {
  example: string;
  hint: string;
}

export const getMobileFormatInfo = (dialCode: string): MobileFormatInfo => {
  const formats: Record<string, MobileFormatInfo> = {
    '+27': {
      example: '0712345678',
      hint: 'Enter with or without leading 0'
    },
    '+234': {
      example: '08012345678',
      hint: 'Enter with or without leading 0'
    },
    '+254': {
      example: '0712345678',
      hint: 'Enter with or without leading 0'
    },
    '+44': {
      example: '07700900123',
      hint: 'Enter with or without leading 0'
    },
    '+91': {
      example: '9876543210',
      hint: 'Enter without leading 0'
    },
    '+65': {
      example: '82309359',
      hint: 'Enter without leading 0'
    },
    '+1': {
      example: '2025551234',
      hint: '10 digits, no leading 0'
    },
    '+61': {
      example: '0412345678',
      hint: 'Enter with or without leading 0'
    },
    '+81': {
      example: '09012345678',
      hint: 'Enter with or without leading 0'
    },
    '+86': {
      example: '13800138000',
      hint: 'Enter without leading 0'
    },
    '+33': {
      example: '0612345678',
      hint: 'Enter with or without leading 0'
    },
    '+49': {
      example: '01512345678',
      hint: 'Enter with or without leading 0'
    },
    '+971': {
      example: '0501234567',
      hint: 'Enter with or without leading 0'
    },
    '+966': {
      example: '0501234567',
      hint: 'Enter with or without leading 0'
    },
    '+20': {
      example: '01012345678',
      hint: 'Enter with or without leading 0'
    },
  };
  
  return formats[dialCode] || {
    example: '1234567890',
    hint: 'Enter without country code (leading 0 is okay)'
  };
};
