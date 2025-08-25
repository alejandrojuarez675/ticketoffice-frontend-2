export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Muy débil' | 'Débil' | 'Aceptable' | 'Fuerte' | 'Excelente';
  color: 'error' | 'warning' | 'info' | 'success' | 'success';
};

export function hasLower(s: string) { return /[a-z]/.test(s); }
export function hasUpper(s: string) { return /[A-Z]/.test(s); }
export function hasNumber(s: string) { return /\d/.test(s); }

export function meetsBasicPasswordRules(pwd: string) {
  return pwd.length >= 8 && hasLower(pwd) && hasUpper(pwd) && hasNumber(pwd);
}

export function getPasswordStrength(pwd: string): PasswordStrength {
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (!pwd) return { score, label: 'Muy débil', color: 'error' };
  const bits = [pwd.length >= 8, hasLower(pwd), hasUpper(pwd), hasNumber(pwd)].filter(Boolean).length;
  if (bits >= 4) score = 4; else if (bits === 3) score = 3; else if (bits === 2) score = 2; else if (bits === 1) score = 1;
  const map: Record<number, PasswordStrength> = {
    0: { score: 0, label: 'Muy débil', color: 'error' },
    1: { score: 1, label: 'Débil', color: 'warning' },
    2: { score: 2, label: 'Aceptable', color: 'info' },
    3: { score: 3, label: 'Fuerte', color: 'success' },
    4: { score: 4, label: 'Excelente', color: 'success' },
  };
  return map[score];
}