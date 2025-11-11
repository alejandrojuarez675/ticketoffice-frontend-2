export type FeatureFlags = {
  DASHBOARD: boolean;
  EVENTS: boolean;
  VALIDATE: boolean;
  TICKETS: boolean;
  PROFILE: boolean;
  REPORTS: boolean;
  USERS: boolean;
  SETTINGS: boolean;
  COUPONS: boolean;
};

export const FEATURES: FeatureFlags = {
  // MVP ON
  DASHBOARD: true,
  EVENTS: true,
  VALIDATE: true,
  TICKETS: true, // para QR y vista del ticket si se comparte enlace
  // MVP OFF (ocultas por ahora)
  PROFILE: false,
  REPORTS: false,
  USERS: false,
  SETTINGS: false,
  COUPONS: false,
};

export const isOn = (k: keyof FeatureFlags) => FEATURES[k];