// src/hooks/useAuth.ts
'use client';

// Reexport del hook del contexto para evitar duplicación y estados divergentes.
export { useAuth } from '@/app/contexts/AuthContext';
export { useAuth as default } from '@/app/contexts/AuthContext';