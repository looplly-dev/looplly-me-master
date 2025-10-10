// Country-specific household income ranges
export interface IncomeRange {
  value: string;
  label: string;
}

// Income ranges by country code
export const incomeRangesByCountry: Record<string, IncomeRange[]> = {
  // South Africa (ZAR)
  '+27': [
    { value: 'under-100k', label: 'Under R100,000' },
    { value: '100k-250k', label: 'R100,000 - R250,000' },
    { value: '250k-500k', label: 'R250,000 - R500,000' },
    { value: '500k-1m', label: 'R500,000 - R1,000,000' },
    { value: '1m-2m', label: 'R1,000,000 - R2,000,000' },
    { value: 'over-2m', label: 'Over R2,000,000' }
  ],
  
  // Nigeria (NGN)
  '+234': [
    { value: 'under-2m', label: 'Under ₦2,000,000' },
    { value: '2m-5m', label: '₦2,000,000 - ₦5,000,000' },
    { value: '5m-10m', label: '₦5,000,000 - ₦10,000,000' },
    { value: '10m-20m', label: '₦10,000,000 - ₦20,000,000' },
    { value: '20m-50m', label: '₦20,000,000 - ₦50,000,000' },
    { value: 'over-50m', label: 'Over ₦50,000,000' }
  ],
  
  // Kenya (KES)
  '+254': [
    { value: 'under-500k', label: 'Under KSh500,000' },
    { value: '500k-1m', label: 'KSh500,000 - KSh1,000,000' },
    { value: '1m-2m', label: 'KSh1,000,000 - KSh2,000,000' },
    { value: '2m-5m', label: 'KSh2,000,000 - KSh5,000,000' },
    { value: '5m-10m', label: 'KSh5,000,000 - KSh10,000,000' },
    { value: 'over-10m', label: 'Over KSh10,000,000' }
  ],
  
  // United Kingdom (GBP)
  '+44': [
    { value: 'under-20k', label: 'Under £20,000' },
    { value: '20k-35k', label: '£20,000 - £35,000' },
    { value: '35k-50k', label: '£35,000 - £50,000' },
    { value: '50k-75k', label: '£50,000 - £75,000' },
    { value: '75k-100k', label: '£75,000 - £100,000' },
    { value: 'over-100k', label: 'Over £100,000' }
  ],
  
  // India (INR)
  '+91': [
    { value: 'under-3l', label: 'Under ₹3,00,000' },
    { value: '3l-6l', label: '₹3,00,000 - ₹6,00,000' },
    { value: '6l-10l', label: '₹6,00,000 - ₹10,00,000' },
    { value: '10l-15l', label: '₹10,00,000 - ₹15,00,000' },
    { value: '15l-25l', label: '₹15,00,000 - ₹25,00,000' },
    { value: 'over-25l', label: 'Over ₹25,00,000' }
  ]
};

// Default fallback (USD)
export const defaultIncomeRanges: IncomeRange[] = [
  { value: 'under-25k', label: 'Under $25,000' },
  { value: '25k-50k', label: '$25,000 - $50,000' },
  { value: '50k-75k', label: '$50,000 - $75,000' },
  { value: '75k-100k', label: '$75,000 - $100,000' },
  { value: '100k-150k', label: '$100,000 - $150,000' },
  { value: 'over-150k', label: 'Over $150,000' }
];

export const getIncomeRangesForCountry = (countryCode: string): IncomeRange[] => {
  return incomeRangesByCountry[countryCode] || defaultIncomeRanges;
};
