```tsx
//src\app\auth\forgot\page.tsx
"use client";

import React, { useState } from "react";
import LightLayout from "@/components/layouts/LightLayout";
import AuthShell from "@/components/auth/AuthShell";
import SubmitButton from "@/components/forms/SubmitButton";
import { TextField, Alert, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";
import { useSnackbar } from "@/components/forms/SnackbarProvider";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "@/services/AuthService";

const Schema = z.object({
  email: z.string().email("Email inválido"),
});
type Data = z.infer<typeof Schema>;

const inputSx = {
  "& .MuiInputBase-input": {
    color: "common.white",
    WebkitTextFillColor: "white",
  },
  "& .MuiOutlinedInput-input": { color: "common.white" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.75)" },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.35)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.6)",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.light",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "primary.light" },
};

export default function ForgotPage() {
  const { showSnack } = useSnackbar();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Data>({
    resolver: zodResolver(Schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: Data) => {
    try {
      await AuthService.requestPasswordReset(data.email);
      setSent(true);
      showSnack({
        message:
          "Si el correo existe, te enviamos un enlace para restablecer la contraseña.",
        severity: "success",
      });
    } catch (err) {
      showSnack({
        message: "No se pudo procesar la solicitud. Intenta de nuevo.",
        severity: "error",
      });
    }
  };

  return (
    <LightLayout title="Recuperar contraseña - TicketOffice">
      <AuthShell
        title="Recuperar contraseña"
        textColor="common.white"
        footer={
          <MuiLink
            component={Link}
            href="/auth/login"
            underline="hover"
            sx={{ color: "primary.light" }}
          >
            Volver a iniciar sesión
          </MuiLink>
        }
      >
        {sent ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Si el correo proporcionado corresponde a una cuenta, recibirás un
            enlace para restablecer tu contraseña.
          </Alert>
        ) : (
          <Typography
            variant="body2"
            sx={{ mb: 2, color: "rgba(255,255,255,0.85)" }}
          >
            Ingresa tu correo y te enviaremos un enlace para restablecer tu
            contraseña.
          </Typography>
        )}

        {!sent && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message ?? " "}
              disabled={isSubmitting}
              sx={inputSx}
            />
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              loading={isSubmitting}
            >
              Enviar enlace
            </SubmitButton>
          </form>
        )}
      </AuthShell>
    </LightLayout>
  );
}
```

```tsx
//src\app\auth\login\page.tsx
"use client";

import React, { useState } from "react";
import LightLayout from "@/components/layouts/LightLayout";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  Paper,
} from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin/dashboard";

  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("Completa usuario y contraseña");
      return;
    }
    try {
      setLoading(true);
      await login({ username, password, remember });
      router.replace(next);
    } catch (err) {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LightLayout title="Iniciar sesión - TicketOffice">
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            Iniciar sesión
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={onSubmit}>
            <TextField
              fullWidth
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              autoComplete="username"
            />
            <TextField
              fullWidth
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
              }
              label="Recordarme"
              sx={{ mt: 1 }}
            />
            <Box sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </LightLayout>
  );
}
```

```tsx
//src\app\auth\register\page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import LightLayout from "@/components/layouts/LightLayout";
import AuthShell from "@/components/auth/AuthShell";
import SubmitButton from "@/components/forms/SubmitButton";
import PasswordField from "@/components/forms/PasswordField";
import PasswordStrengthBar from "@/components/forms/PasswordStrengthBar";
import {
  TextField,
  Alert,
  Link as MuiLink,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  InputAdornment,
  Box,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";
import { useAuth } from "@/hooks/useAuth";
import { useSnackbar } from "@/components/forms/SnackbarProvider";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getPasswordStrength,
  hasLower,
  hasUpper,
  hasNumber,
  meetsBasicPasswordRules,
} from "@/utils/password";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Collapse from "@mui/material/Collapse";

const usernameRegex = /^[A-Za-z][A-Za-z0-9._]{2,19}$/;
const forbidRepeats = /(\.\.|__|_\.)/;
const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,50}$/;

const RegisterSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "El usuario debe tener al menos 3 caracteres")
      .max(20, "Máximo 20 caracteres")
      .regex(
        usernameRegex,
        "Solo letras, números, punto y guion bajo; debe iniciar con letra"
      )
      .refine(
        (s) => !forbidRepeats.test(s),
        "Evita repeticiones de símbolos (.., __, _.)"
      ),
    firstName: z
      .string()
      .trim()
      .min(2, "Nombre demasiado corto")
      .max(50, "Nombre demasiado largo")
      .regex(nameRegex, "Nombre inválido"),
    lastName: z
      .string()
      .trim()
      .min(2, "Apellido demasiado corto")
      .max(50, "Apellido demasiado largo")
      .regex(nameRegex, "Apellido inválido"),
    email: z.string().trim().email("Email inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .refine((s) => hasLower(s), "Debe incluir minúsculas")
      .refine((s) => hasUpper(s), "Debe incluir mayúsculas")
      .refine((s) => hasNumber(s), "Debe incluir números"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterData = z.infer<typeof RegisterSchema>;

// Estilo robusto para inputs blancos (incluye WebkitTextFillColor para Safari/Autofill)
const inputWhiteSx = {
  "& .MuiInputBase-input": {
    color: "common.white",
    WebkitTextFillColor: "white",
  },
  "& .MuiOutlinedInput-input": { color: "common.white" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.75)" },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.35)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.6)",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.light",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "primary.light" },
};

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { showSnack } = useSnackbar();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
  const strength = useMemo(
    () => getPasswordStrength(passwordValue),
    [passwordValue]
  );

  // Disponibilidad
  const usernameValue = useWatch({
    control,
    name: "username",
    defaultValue: "",
  });
  const emailValue = useWatch({ control, name: "email", defaultValue: "" });
  const debouncedUser = useDebouncedValue(usernameValue, 500);
  const debouncedEmail = useDebouncedValue(emailValue, 500);
  const [userAvail, setUserAvail] = useState<
    "idle" | "loading" | "ok" | "taken"
  >("idle");
  const [mailAvail, setMailAvail] = useState<
    "idle" | "loading" | "ok" | "taken"
  >("idle");

  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!debouncedUser || errors.username) {
        setUserAvail("idle");
        return;
      }
      try {
        setUserAvail("loading");
        const r = await AuthService.checkAvailability({
          username: debouncedUser,
        });
        if (!active) return;
        setUserAvail(r.usernameAvailable ? "ok" : "taken");
      } catch {
        if (active) setUserAvail("idle");
      }
    })();
    return () => {
      active = false;
    };
  }, [debouncedUser, errors.username]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!debouncedEmail || errors.email) {
        setMailAvail("idle");
        return;
      }
      try {
        setMailAvail("loading");
        const r = await AuthService.checkAvailability({
          email: debouncedEmail,
        });
        if (!active) return;
        setMailAvail(r.emailAvailable ? "ok" : "taken");
      } catch {
        if (active) setMailAvail("idle");
      }
    })();
    return () => {
      active = false;
    };
  }, [debouncedEmail, errors.email]);

  const [pwdFocused, setPwdFocused] = useState(false);
  const showPwdHints = pwdFocused || passwordValue.length > 0;

  const rules = [
    { ok: passwordValue.length >= 8, label: "Mínimo 8 caracteres" },
    { ok: hasLower(passwordValue), label: "Al menos una minúscula" },
    { ok: hasUpper(passwordValue), label: "Al menos una mayúscula" },
    { ok: hasNumber(passwordValue), label: "Al menos un número" },
  ];

  const onSubmit = async (data: RegisterData) => {
    try {
      if (!meetsBasicPasswordRules(data.password)) return;
      await AuthService.register({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      });
      showSnack({
        message: "Cuenta creada con éxito. Inicia sesión para continuar.",
        severity: "success",
      });
      router.replace("/auth/login");
    } catch (err) {
      showSnack({
        message: err instanceof Error ? err.message : "Error al registrarse",
        severity: "error",
      });
    }
  };

  return (
    <LightLayout title="Registro - TicketOffice">
      <AuthShell
        title="Crear cuenta"
        footer={
          <MuiLink
            component={Link}
            href="/auth/login"
            underline="hover"
            sx={{ color: "primary.light" }}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </MuiLink>
        }
        textColor="common.white"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          {errors.root && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Usuario"
                autoComplete="off"
                {...register("username")}
                error={!!errors.username || userAvail === "taken"}
                helperText={
                  errors.username?.message ??
                  (userAvail === "taken" ? "Este usuario ya está en uso" : " ")
                }
                disabled={isSubmitting || isLoading}
                sx={inputWhiteSx}
                slotProps={{
                  input: {
                    endAdornment:
                      userAvail === "loading" ? (
                        <InputAdornment position="end">
                          <CircularProgress size={16} />
                        </InputAdornment>
                      ) : userAvail === "ok" ? (
                        <InputAdornment position="end">
                          <CheckIcon color="success" fontSize="small" />
                        </InputAdornment>
                      ) : userAvail === "taken" ? (
                        <InputAdornment position="end">
                          <CloseIcon color="error" fontSize="small" />
                        </InputAdornment>
                      ) : undefined,
                    inputProps: {
                      autoComplete: "off",
                      style: { WebkitTextFillColor: "white" },
                    },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre"
                autoComplete="off"
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message ?? " "}
                disabled={isSubmitting || isLoading}
                sx={inputWhiteSx}
                slotProps={{
                  input: {
                    inputProps: {
                      autoComplete: "off",
                      style: { WebkitTextFillColor: "white" },
                    },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Apellido"
                autoComplete="off"
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message ?? " "}
                disabled={isSubmitting || isLoading}
                sx={inputWhiteSx}
                slotProps={{
                  input: {
                    inputProps: {
                      autoComplete: "off",
                      style: { WebkitTextFillColor: "white" },
                    },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                autoComplete="email"
                {...register("email")}
                error={!!errors.email || mailAvail === "taken"}
                helperText={
                  errors.email?.message ??
                  (mailAvail === "taken" ? "Este correo ya está en uso" : " ")
                }
                disabled={isSubmitting || isLoading}
                sx={inputWhiteSx}
                slotProps={{
                  input: {
                    endAdornment:
                      mailAvail === "loading" ? (
                        <InputAdornment position="end">
                          <CircularProgress size={16} />
                        </InputAdornment>
                      ) : mailAvail === "ok" ? (
                        <InputAdornment position="end">
                          <CheckIcon color="success" fontSize="small" />
                        </InputAdornment>
                      ) : mailAvail === "taken" ? (
                        <InputAdornment position="end">
                          <CloseIcon color="error" fontSize="small" />
                        </InputAdornment>
                      ) : undefined,
                    inputProps: {
                      autoComplete: "email",
                      style: { WebkitTextFillColor: "white" },
                    },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <PasswordField
                      fullWidth
                      label="Contraseña"
                      autoComplete="new-password"
                      {...field}
                      onFocus={() => setPwdFocused(true)}
                      onBlur={(e) => {
                        field.onBlur();
                        setPwdFocused(false);
                      }}
                      error={!!fieldState.error}
                      helperText={
                        showPwdHints
                          ? fieldState.error?.message ??
                            "Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números."
                          : " "
                      }
                      disabled={isSubmitting || isLoading}
                      sx={inputWhiteSx}
                      slotProps={{
                        input: {
                          inputProps: {
                            autoComplete: "new-password",
                            style: { WebkitTextFillColor: "white" },
                          },
                        },
                      }}
                    />
                    {showPwdHints && (
                      <Collapse in={showPwdHints} timeout={200} unmountOnExit>
                        <PasswordStrengthBar strength={strength} />
                        <Box sx={{ mt: 1 }}>
                          {rules.map((r) => (
                            <Typography
                              key={r.label}
                              variant="caption"
                              sx={{
                                display: "block",
                                color: r.ok
                                  ? "success.main"
                                  : "rgba(255,255,255,0.7)",
                              }}
                            >
                              • {r.label}
                            </Typography>
                          ))}
                        </Box>
                      </Collapse>
                    )}
                  </>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <PasswordField
                fullWidth
                label="Confirmar contraseña"
                autoComplete="new-password"
                {...register("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message ?? " "}
                disabled={isSubmitting || isLoading}
                sx={inputWhiteSx}
                slotProps={{
                  input: {
                    inputProps: {
                      autoComplete: "new-password",
                      style: { WebkitTextFillColor: "white" },
                    },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    {...register("acceptTerms")}
                    sx={{ color: "rgba(255,255,255,0.85)" }}
                  />
                }
                label={
                  <span>
                    Acepto los{" "}
                    <MuiLink
                      component={Link}
                      href="/terms"
                      underline="hover"
                      sx={{ color: "primary.light" }}
                    >
                      Términos
                    </MuiLink>{" "}
                    y la{" "}
                    <MuiLink
                      component={Link}
                      href="/privacy"
                      underline="hover"
                      sx={{ color: "primary.light" }}
                    >
                      Política de Privacidad
                    </MuiLink>
                  </span>
                }
                sx={{ color: "rgba(255,255,255,0.9)" }}
              />
              {errors.acceptTerms && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {errors.acceptTerms.message}
                </Alert>
              )}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <SubmitButton
                type="submit"
                fullWidth
                variant="contained"
                loading={isSubmitting || isLoading}
              >
                Crear cuenta
              </SubmitButton>
            </Grid>
          </Grid>
        </form>
      </AuthShell>
    </LightLayout>
  );
}
```

```tsx
//src\app\auth\reset\page.tsx
"use client";

import React, { Suspense, useMemo, useState } from "react";
import LightLayout from "@/components/layouts/LightLayout";
import AuthShell from "@/components/auth/AuthShell";
import SubmitButton from "@/components/forms/SubmitButton";
import PasswordField from "@/components/forms/PasswordField";
import PasswordStrengthBar from "@/components/forms/PasswordStrengthBar";
import { Alert, Link as MuiLink, Box, Typography } from "@mui/material";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import {
  hasLower,
  hasNumber,
  hasUpper,
  getPasswordStrength,
  meetsBasicPasswordRules,
} from "@/utils/password";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "@/services/AuthService";
import { useSnackbar } from "@/components/forms/SnackbarProvider";

const Schema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .refine((s) => hasLower(s), "Debe incluir minúsculas")
      .refine((s) => hasUpper(s), "Debe incluir mayúsculas")
      .refine((s) => hasNumber(s), "Debe incluir números"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type Data = z.infer<typeof Schema>;

const inputSx = {
  "& .MuiInputBase-input": {
    color: "common.white",
    WebkitTextFillColor: "white",
  },
  "& .MuiOutlinedInput-input": { color: "common.white" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.75)" },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.35)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.6)",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.light",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "primary.light" },
};

function ResetPasswordContent() {
  const sp = useSearchParams();
  const token = sp.get("token");
  const router = useRouter();
  const { showSnack } = useSnackbar();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Data>({
    resolver: zodResolver(Schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const pwd = useWatch({ control, name: "password", defaultValue: "" });
  const strength = useMemo(() => getPasswordStrength(pwd), [pwd]);

  const [pwdFocused, setPwdFocused] = useState(false);
  const showHints = pwdFocused || pwd.length > 0;

  const rules = [
    { ok: pwd.length >= 8, label: "Mínimo 8 caracteres" },
    { ok: hasLower(pwd), label: "Al menos una minúscula" },
    { ok: hasUpper(pwd), label: "Al menos una mayúscula" },
    { ok: hasNumber(pwd), label: "Al menos un número" },
  ];

  const onSubmit = async (data: Data) => {
    try {
      if (!token) throw new Error("Token inválido");
      if (!meetsBasicPasswordRules(data.password)) return;
      await AuthService.resetPassword(token, data.password);
      showSnack({
        message: "Contraseña restablecida. Inicia sesión.",
        severity: "success",
      });
      router.replace("/auth/login");
    } catch {
      showSnack({
        message: "No se pudo restablecer la contraseña",
        severity: "error",
      });
    }
  };

  return (
    <LightLayout title="Restablecer contraseña - TicketOffice">
      <AuthShell
        title="Restablecer contraseña"
        textColor="common.white"
        footer={
          <MuiLink
            component={Link}
            href="/auth/login"
            underline="hover"
            sx={{ color: "primary.light" }}
          >
            Volver a iniciar sesión
          </MuiLink>
        }
      >
        {!token && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Token inválido.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <PasswordField
                  fullWidth
                  label="Nueva contraseña"
                  autoComplete="new-password"
                  {...field}
                  onFocus={() => setPwdFocused(true)}
                  onBlur={(e) => {
                    field.onBlur();
                    setPwdFocused(false);
                  }}
                  error={!!fieldState.error}
                  helperText={
                    showHints
                      ? fieldState.error?.message ??
                        "Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números."
                      : " "
                  }
                  disabled={isSubmitting}
                  sx={inputSx}
                />
                {showHints && (
                  <>
                    <PasswordStrengthBar strength={strength} />
                    <Box sx={{ mt: 1 }}>
                      {rules.map((r) => (
                        <Typography
                          key={r.label}
                          variant="caption"
                          sx={{
                            display: "block",
                            color: r.ok
                              ? "success.main"
                              : "rgba(255,255,255,0.7)",
                          }}
                        >
                          • {r.label}
                        </Typography>
                      ))}
                    </Box>
                  </>
                )}
              </>
            )}
          />

          <PasswordField
            fullWidth
            label="Confirmar contraseña"
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message ?? " "}
            disabled={isSubmitting}
            sx={inputSx}
          />

          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            loading={isSubmitting}
            disabled={!token}
          >
            Restablecer
          </SubmitButton>
        </form>
      </AuthShell>
    </LightLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
```

```tsx
//src\lib\http.ts
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface FetchJsonOptions<B = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: B;
  retries?: number; // default 0
  retryDelayMs?: number; // default 300
}

// Nuevo: provider global de token para Authorization
let authTokenProvider: (() => string | null) | null = null;
export function setAuthTokenProvider(provider: (() => string | null) | null) {
  authTokenProvider = provider;
}

export class HttpError extends Error {
  status: number;
  statusText: string;
  url: string;
  details?: unknown;
  constructor(
    url: string,
    status: number,
    statusText: string,
    details?: unknown
  ) {
    super(`HTTP ${status} ${statusText}`);
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function fetchJson<TResponse, B = unknown>(
  url: string,
  opts: FetchJsonOptions<B> = {}
): Promise<TResponse> {
  const {
    method = "GET",
    headers = {},
    body,
    retries = 0,
    retryDelayMs = 300,
  } = opts;

  const dynamicHeaders: Record<string, string> = {
    accept: "application/json",
    "Content-Type": "application/json",
    ...headers,
  };

  const token = authTokenProvider?.();
  if (token) {
    dynamicHeaders.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit = {
    method,
    headers: dynamicHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
  };

  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url, init);
      const isJson = res.headers
        .get("content-type")
        ?.includes("application/json");
      if (!res.ok) {
        let details: unknown;
        if (isJson) {
          try {
            details = await res.json();
          } catch {}
        } else {
          try {
            details = await res.text();
          } catch {}
        }
        if (
          attempt < retries &&
          (res.status === 429 || (res.status >= 500 && res.status < 600))
        ) {
          attempt++;
          await delay(retryDelayMs * attempt);
          continue;
        }
        throw new HttpError(url, res.status, res.statusText, details);
      }
      if (res.status === 204) return undefined as unknown as TResponse;
      if (isJson) {
        return (await res.json()) as TResponse;
      }
      return (await res.text()) as unknown as TResponse;
    } catch (err) {
      if (attempt < retries) {
        attempt++;
        await delay(retryDelayMs * attempt);
        continue;
      }
      throw err;
    }
  }
}

export const http = {
  get: <T,>(url: string, options?: Omit<FetchJsonOptions, "method" | "body">) =>
    fetchJson<T>(url, { method: "GET", ...(options || {}) }),
  post: <T, B = unknown>(
    url: string,
    body?: B,
    options?: Omit<FetchJsonOptions<B>, "method" | "body">
  ) => fetchJson<T, B>(url, { method: "POST", body, ...(options || {}) }),
  put: <T, B = unknown>(
    url: string,
    body?: B,
    options?: Omit<FetchJsonOptions<B>, "method" | "body">
  ) => fetchJson<T, B>(url, { method: "PUT", body, ...(options || {}) }),
  patch: <T, B = unknown>(
    url: string,
    body?: B,
    options?: Omit<FetchJsonOptions<B>, "method" | "body">
  ) => fetchJson<T, B>(url, { method: "PATCH", body, ...(options || {}) }),
  delete: <T,>(
    url: string,
    options?: Omit<FetchJsonOptions, "method" | "body">
  ) => fetchJson<T>(url, { method: "DELETE", ...(options || {}) }),
};
```

```tsx
//src\lib\logger.ts
type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const envLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || "info";
const current = LEVELS[envLevel] ?? LEVELS.info;

function safeSerialize(meta?: unknown) {
  try {
    return meta == null ? undefined : JSON.stringify(meta);
  } catch {
    return undefined;
  }
}

export const logger = {
  debug: (msg: string, meta?: unknown) => {
    if (current <= LEVELS.debug)
      console.debug(`[debug] ${msg}`, safeSerialize(meta));
  },
  info: (msg: string, meta?: unknown) => {
    if (current <= LEVELS.info)
      console.info(`[info] ${msg}`, safeSerialize(meta));
  },
  warn: (msg: string, meta?: unknown) => {
    if (current <= LEVELS.warn)
      console.warn(`[warn] ${msg}`, safeSerialize(meta));
  },
  error: (msg: string, meta?: unknown) => {
    if (current <= LEVELS.error)
      console.error(`[error] ${msg}`, safeSerialize(meta));
  },
};
```

```tsx
//src\lib\permissions.ts
import type { BackofficeRole } from "@/config/backofficeNav";

const rolePermissions = {
  admin: [
    "dashboard.read_global",
    "events.read_all",
    "events.create_any",
    "events.update_any",
    "events.delete_any",
    "sales.read_all",
    "validate.read_all",
    "users.read",
    "users.invite",
    "settings.read",
    "coupons.create_any",
  ] as const,
  seller: [
    "dashboard.read_self",
    "events.read_self",
    "events.create_self",
    "events.update_self",
    "events.delete_self",
    "sales.read_self",
    "validate.read_self",
    "coupons.create_self",
  ] as const,
} as const;

type RoleKey = keyof typeof rolePermissions; // 'admin' | 'seller'
export type Permission = (typeof rolePermissions)[RoleKey][number];

export function permissionsForRole(
  role: BackofficeRole | null | undefined
): Permission[] {
  if (!role) return [];
  // devolvemos una copia por seguridad
  return [...rolePermissions[role]];
}

export function can(permissions: Permission[], perm: Permission) {
  return permissions.includes(perm);
}

export function canAny(permissions: Permission[], list: Permission[]) {
  return list.some((p) => permissions.includes(p));
}

export const ALL_PERMISSIONS: Permission[] = Array.from(
  new Set<Permission>([
    ...rolePermissions.admin,
    ...rolePermissions.seller,
  ] as Permission[])
);
```

```tsx
//src\types\checkout.ts
export interface CheckoutSessionResponse {
  sessionId: string;
  expiredIn: number;
}

export interface BuyerData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  documentType: string;
  document: string;
}

export interface SessionDataRequest {
  mainEmail: string;
  buyer: BuyerData[];
  couponCode?: string;
}

export interface SessionInfoResponse {
  sessionId: string;
  eventId: string;
  priceId: string;
  quantity: number;
  mainEmail?: string;
  buyer?: BuyerData[];
}

export interface ProcessPaymentResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}
```

```tsx
//src\types\Event.ts
export interface Location {
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface Image {
  url: string;
  alt: string;
}

export interface Ticket {
  id: string;
  value: number;
  currency: string;
  type: string;
  isFree: boolean;
  stock: number;
}

export interface Organizer {
  id: string;
  name: string;
  url: string;
  logoUrl?: string;
}

export interface EventDetail {
  id: string;
  title: string;
  date: string;
  image: Image;
  tickets: Ticket[];
  description: string;
  additionalInfo: string[];
  organizer: Organizer | null;
  status: string;
  location: Location;
}

// For event lists (used in other components)
export interface EventForList {
  id: string;
  name: string;
  date: string;
  location: string;
  status: "ACTIVE" | "INACTIVE" | "SOLD_OUT";
}

export interface EventListResponse {
  events: EventForList[];
}
```

```tsx
//src\types\contract.ts
export type ImageDTO = { url: string; alt: string };
export type LocationDTO = {
  name: string;
  address: string;
  city: string;
  country: string;
};

export type TicketDTO = {
  id: string;
  value: number; // si usan centavos, renombrar a amount
  currency: string; // ideal: currencyCode ('COP' | 'ARS' | ...)
  type: string; // 'General' | 'VIP'...
  isFree: boolean;
  stock: number;
};

export type EventDetailPageResponse = {
  id: string;
  title: string;
  date: string; // ISO
  location: LocationDTO;
  image: ImageDTO;
  tickets: TicketDTO[];
  description?: string;
  additionalInfo?: string[];
  organizer?: OrganizerDTO;
  status: "ACTIVE" | "DRAFT" | string;
};

export type EventLightResponse = {
  id: string;
  name: string;
  date: string;
  location: string;
  bannerUrl: string;
  price: number;
  currency: string; // ideal: currencyCode
  status: string;
};

export type SearchResponse = {
  events: EventLightResponse[];
  hasEventsInYourCity: boolean;
  totalPages: number;
  currentPage: number; // confirmar 0-based
  pageSize: number;
};

export type CreateSessionRequest = {
  eventId: string;
  priceId: string;
  quantity: number; // 1..5
};
export type SessionCreatedResponse = {
  sessionId: string;
  expiredIn: number;
};

export type PersonalData = {
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  documentType?: string;
  document?: string;
};

export type BuyTicketsRequest = {
  mainEmail: string;
  buyer: PersonalData[]; // length === quantity
};

export type SaleLightDTO = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ticketType: string;
  price: number;
  validated: boolean;
};

export type SalesListResponse = { sales: SaleLightDTO[] };

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  role: string[]; // e.g., ['ADMIN'] | ['SELLER'] | ['USER']
  organizer?: OrganizerDTO;
};

export type OrganizerDTO = {
  id: string;
  name: string;
  url: string;
  logo?: ImageDTO;
};

// Extensiones sugeridas BE:
export type CheckoutStatusResponse = {
  status: "pending" | "approved" | "rejected" | "free_issued";
  sales?: SaleLightDTO[];
  mainEmail?: string;
};
export type MpPreferenceResponse = { preferenceId: string; initPoint: string };
```

```tsx
//src\types\Sales.ts
export interface SalesResponse {
  sales: Sale[];
}

export interface Sale {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ticketType: string;
  price: number;
  validated: boolean;
}
```

```tsx
//src\types\search-event.ts
export interface SearchEvent {
  id: string;
  name: string;
  date: string;
  location: string; // "Ciudad, País"
  bannerUrl: string;
  price: number;
  currency: string;
  status: "ACTIVE" | "INACTIVE" | "SOLD_OUT";
  minAge?: number;
  // Optional vendor (seller) info to enable client-side filtering
  vendorId?: string;
  vendorName?: string;
}

export interface SearchEventResponse {
  events: SearchEvent[];
  hasEventsInYourCity: boolean;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface SearchEventParams {
  country: string;
  city?: string;
  query?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  pageSize?: number;
  pageNumber?: number;
  // Optional comma-separated vendor IDs to filter by seller(s)
  vendors?: string;
}
```

```tsx
//src\utils\date.ts
export function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayRange(now = new Date()) {
  const from = toDateInputValue(now);
  const to = from;
  return { from, to };
}

export function weekendRange(ref = new Date()) {
  // 0=Dom ... 6=Sáb
  const day = ref.getDay();
  const diffToSat = (6 - day + 7) % 7;
  const saturday = new Date(ref);
  saturday.setDate(ref.getDate() + diffToSat);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  return { from: toDateInputValue(saturday), to: toDateInputValue(sunday) };
}
```

```tsx
//src\utils\eventsFilters.ts
import type { SearchEvent } from "@/types/search-event";

export type SortKey = "dateAsc" | "dateDesc" | "priceAsc" | "priceDesc";
export type Filters = {
  country?: string;
  city?: string;
  category?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  savedOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  adultOnly?: boolean;
  vendors?: string[]; // vendor IDs
};

export function parseLocation(loc: string) {
  const parts = loc.split(",").map((s) => s.trim());
  if (parts.length >= 2) return { city: parts[0], country: parts[1] };
  return { city: parts[0] ?? "", country: "" };
}

export function deriveCategory(name: string) {
  const n = name.toLowerCase();
  if (n.includes("festival")) return "Festival";
  if (n.includes("concierto")) return "Concierto";
  if (n.includes("teatro") || n.includes("obra")) return "Teatro";
  if (n.includes("feria")) return "Feria";
  if (n.includes("discoteca") || n.includes("club")) return "Discoteca";
  return "Otros";
}

export function buildFacets(events: SearchEvent[]) {
  const countries = new Set<string>();
  const citiesByCountry = new Map<string, Set<string>>();
  const categories = new Set<string>();

  for (const e of events) {
    const { city, country } = parseLocation(e.location);
    if (country) {
      countries.add(country);
      if (!citiesByCountry.has(country))
        citiesByCountry.set(country, new Set());
      if (city) citiesByCountry.get(country)!.add(city);
    }
    categories.add(deriveCategory(e.name));
  }

  const citiesFlat = new Set<string>();
  for (const set of citiesByCountry.values())
    for (const c of set) citiesFlat.add(c);

  return {
    countries: Array.from(countries).sort(),
    cities: Array.from(citiesFlat).sort(),
    categories: Array.from(categories).sort(),
    citiesByCountry: Array.from(citiesByCountry.entries()).reduce<
      Record<string, string[]>
    >((acc, [k, v]) => ((acc[k] = Array.from(v).sort()), acc), {}),
  };
}

export function applyFilters(
  list: SearchEvent[],
  filters: Filters,
  favoriteIds?: Set<string>
) {
  const fromTime = filters.dateFrom ? Date.parse(filters.dateFrom) : undefined;
  const toTimeExclusive = filters.dateTo
    ? Date.parse(filters.dateTo) + 24 * 60 * 60 * 1000 - 1
    : undefined;

  return list.filter((e) => {
    // No mostrar inactivos
    if (e.status === "INACTIVE") return false;

    if (filters.savedOnly && favoriteIds && !favoriteIds.has(e.id))
      return false;

    if (filters.minPrice !== undefined && e.price < filters.minPrice)
      return false;
    if (filters.maxPrice !== undefined && e.price > filters.maxPrice)
      return false;

    if (filters.adultOnly && !(e.minAge !== undefined && e.minAge >= 18))
      return false;

    // Vendors (seller) filter: accept if event vendorId is in selected list.
    if (filters.vendors && filters.vendors.length > 0) {
      const vid = e.vendorId ?? "";
      const vname = (e.vendorName ?? "").toLowerCase();
      const hasVendor = filters.vendors.some(
        (v) => v === vid || v.toLowerCase() === vname
      );
      if (!hasVendor) return false;
    }

    const { city, country } = parseLocation(e.location);
    if (filters.country && country !== filters.country) return false;
    if (filters.city && city !== filters.city) return false;

    const category = deriveCategory(e.name);
    if (filters.category && category !== filters.category) return false;

    const t = Date.parse(e.date);
    if (fromTime !== undefined && t < fromTime) return false;
    if (toTimeExclusive !== undefined && t > toTimeExclusive) return false;

    return true;
  });
}

export function sortEvents(list: SearchEvent[], sort: SortKey) {
  const arr = [...list];
  switch (sort) {
    case "dateAsc":
      return arr.sort(
        (a, b) => Number(new Date(a.date)) - Number(new Date(b.date))
      );
    case "dateDesc":
      return arr.sort(
        (a, b) => Number(new Date(b.date)) - Number(new Date(a.date))
      );
    case "priceAsc":
      return arr.sort((a, b) => a.price - b.price);
    case "priceDesc":
      return arr.sort((a, b) => b.price - a.price);
    default:
      return arr;
  }
}

export function paginate<T>(list: T[], page: number, pageSize: number) {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  return {
    slice: list.slice(start, end),
    total,
    totalPages,
    page: safePage,
    pageSize,
  };
}
```

```tsx
//src\utils\favorites.ts
const KEY = "favorite_events";

function safeParse(json: string | null): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function getFavoriteIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return new Set(safeParse(localStorage.getItem(KEY)));
}

export function isFavorite(id: string): boolean {
  return getFavoriteIds().has(id);
}

export function toggleFavorite(id: string): boolean {
  if (typeof window === "undefined") return false;
  const set = getFavoriteIds();
  if (set.has(id)) set.delete(id);
  else set.add(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  return set.has(id);
}

export function setFavorite(id: string, value: boolean): void {
  if (typeof window === "undefined") return;
  const set = getFavoriteIds();
  if (value) set.add(id);
  else set.delete(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
}
```

```tsx
//src\utils\format.ts

// Mapa simple país → { currencyCode, locale }
// Nota: usa nombres tal como los envías al BE (p.ej., "Colombia", "Argentina").
const countryToCurrency: Record<string, { code: string; locale: string }> = {
  Colombia: { code: "COP", locale: "es-CO" },
  Argentina: { code: "ARS", locale: "es-AR" },
  Chile: { code: "CLP", locale: "es-CL" },
  México: { code: "MXN", locale: "es-MX" },
  Mexico: { code: "MXN", locale: "es-MX" },
  Perú: { code: "PEN", locale: "es-PE" },
  Peru: { code: "PEN", locale: "es-PE" },
  Uruguay: { code: "UYU", locale: "es-UY" },
  Paraguay: { code: "PYG", locale: "es-PY" },
  Bolivia: { code: "BOB", locale: "es-BO" },
  Ecuador: { code: "USD", locale: "es-EC" },
  España: { code: "EUR", locale: "es-ES" },
  "Estados Unidos": { code: "USD", locale: "es-US" },
};

// Si no reconocemos el país, usamos COP por defecto (MVP)
export function getCurrencyForCountry(country?: string) {
  const key = (country || "").trim();
  return countryToCurrency[key] ?? { code: "COP", locale: "es-CO" };
}

// NUEVO: preferido en VIP/checkout
export function formatMoneyByCountry(value: number, country?: string) {
  const { code, locale } = getCurrencyForCountry(country);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
    }).format(value);
  } catch {
    return `${code} ${new Intl.NumberFormat(locale).format(value)}`;
  }
}

// Mantengo tu helper (por compatibilidad)
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "es-AR"
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${new Intl.NumberFormat(locale).format(value)} ${currency}`;
  }
}

export function formatEventDate(date: string | Date, locale: string = "es-AR") {
  const d = typeof date === "string" ? new Date(date) : date;
  const dateStr = d.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr, timeStr };
}
```

```tsx
//src\utils\password.ts
export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Muy débil" | "Débil" | "Aceptable" | "Fuerte" | "Excelente";
  color: "error" | "warning" | "info" | "success" | "success";
};

export function hasLower(s: string) {
  return /[a-z]/.test(s);
}
export function hasUpper(s: string) {
  return /[A-Z]/.test(s);
}
export function hasNumber(s: string) {
  return /\d/.test(s);
}

export function meetsBasicPasswordRules(pwd: string) {
  return pwd.length >= 8 && hasLower(pwd) && hasUpper(pwd) && hasNumber(pwd);
}

export function getPasswordStrength(pwd: string): PasswordStrength {
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (!pwd) return { score, label: "Muy débil", color: "error" };
  const bits = [
    pwd.length >= 8,
    hasLower(pwd),
    hasUpper(pwd),
    hasNumber(pwd),
  ].filter(Boolean).length;
  if (bits >= 4) score = 4;
  else if (bits === 3) score = 3;
  else if (bits === 2) score = 2;
  else if (bits === 1) score = 1;
  const map: Record<number, PasswordStrength> = {
    0: { score: 0, label: "Muy débil", color: "error" },
    1: { score: 1, label: "Débil", color: "warning" },
    2: { score: 2, label: "Aceptable", color: "info" },
    3: { score: 3, label: "Fuerte", color: "success" },
    4: { score: 4, label: "Excelente", color: "success" },
  };
  return map[score];
}
```

```tsx
//src\types\user.ts

export interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  role: "user" | "seller" | "admin";
  name: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterCredentials {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
```
