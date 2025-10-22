-- Fix security warning: Set search_path for normalize_mobile_number function
DROP FUNCTION IF EXISTS normalize_mobile_number(TEXT, TEXT);

CREATE OR REPLACE FUNCTION normalize_mobile_number(
  mobile_number TEXT, 
  country_dial_code TEXT
)
RETURNS TEXT AS $$
DECLARE
  dial_code_escaped TEXT;
  dial_code_no_plus TEXT;
BEGIN
  -- Return NULL if inputs are NULL
  IF mobile_number IS NULL OR country_dial_code IS NULL THEN
    RETURN mobile_number;
  END IF;

  -- Remove spaces, dashes, parentheses
  mobile_number := regexp_replace(mobile_number, '[\s\-\(\)]', '', 'g');
  
  -- Escape the dial code for regex use (escape + sign)
  dial_code_escaped := replace(country_dial_code, '+', '\+');
  dial_code_no_plus := substring(country_dial_code from 2);
  
  -- Strip country code if included (with or without +)
  mobile_number := regexp_replace(mobile_number, '^' || dial_code_escaped, '');
  mobile_number := regexp_replace(mobile_number, '^\+?' || dial_code_no_plus, '');
  
  -- Remove leading zeros
  mobile_number := regexp_replace(mobile_number, '^0+', '');
  
  -- Reconstruct with country code
  RETURN country_dial_code || mobile_number;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = public;

-- Add comment explaining the function
COMMENT ON FUNCTION normalize_mobile_number IS 'Normalizes mobile numbers by removing leading zeros and ensuring proper E.164 format with country code';