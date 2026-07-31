import { z } from 'zod';

/** Persian (۰-۹) and Arabic-Indic (٠-٩) → ASCII 0-9 */
export function toEnglishDigits(input: string): string {
  return input.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660));
  });
}

/** Zod string that normalizes Persian/Arabic digits before further validation */
export function zEnglishDigitsString() {
  return z.string().transform(toEnglishDigits);
}

/** Iranian mobile: 09xxxxxxxxx (accepts Persian digits in input) */
export function zIranPhone() {
  return zEnglishDigitsString().pipe(
    z.string().regex(/^09\d{9}$/, 'شماره تلفن معتبر نیست')
  );
}

/** Numeric OTP / tracking codes */
export function zDigitCode(length: number, message: string) {
  return zEnglishDigitsString().pipe(z.string().length(length, message));
}
