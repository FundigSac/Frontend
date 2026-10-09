import { z } from "zod";

/**
 * Validadores compartidos entre cliente y servidor (mensajes en español, es-PE).
 * La política de contraseña se refuerza además en Better Auth (minPasswordLength/maxPasswordLength).
 */
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

// Lista mínima de contraseñas triviales (se comparan en minúsculas, sin espacios).
const COMMON_PASSWORDS = new Set([
  "123456789012",
  "contraseña123",
  "contrasena123",
  "contraseña1234",
  "contrasena1234",
  "password1234",
  "password12345",
  "passw0rd1234",
  "qwertyuiop12",
  "qwerty123456",
  "administrador",
  "fundigsac1234",
  "fundigsac2026",
  "fundigsac12345",
  "iloveyou1234",
  "111111111111",
  "000000000000",
]);

export const emailSchema = z
  .string({ error: "Ingresa tu correo electrónico." })
  .trim()
  .toLowerCase()
  .min(1, "Ingresa tu correo electrónico.")
  .max(254, "El correo es demasiado largo.")
  .pipe(z.email({ error: "Ingresa un correo válido, por ejemplo nombre@empresa.com.pe." }));

export const nameSchema = z
  .string({ error: "Ingresa tu nombre." })
  .trim()
  .min(2, "Ingresa tu nombre completo.")
  .max(120, "El nombre es demasiado largo (máximo 120 caracteres).")
  // eslint-disable-next-line no-control-regex
  .refine((v) => !/[\u0000-\u001f\u007f<>]/.test(v), "El nombre contiene caracteres no permitidos.");

/** Contraseña nueva: longitud 12–128 y no trivial. (La de inicio de sesión sólo exige no estar vacía.) */
export const newPasswordSchema = z
  .string({ error: "Crea una contraseña." })
  .min(PASSWORD_MIN, `Usa al menos ${PASSWORD_MIN} caracteres.`)
  .max(PASSWORD_MAX, `Usa como máximo ${PASSWORD_MAX} caracteres.`)
  .refine((v) => v.trim().length > 0, "La contraseña no puede estar vacía.")
  .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase().replace(/\s+/g, "")), "Esa contraseña es demasiado común. Elige otra.")
  .refine((v) => new Set(v).size >= 5, "Usa una combinación más variada de caracteres.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: "Ingresa tu contraseña." }).min(1, "Ingresa tu contraseña.").max(PASSWORD_MAX, "Contraseña no válida."),
});

export const registerSchema = z
  .object({ name: nameSchema, email: emailSchema, password: newPasswordSchema })
  .superRefine((v, ctx) => {
    const local = v.email.split("@")[0] ?? "";
    if (v.password.toLowerCase() === v.email || (local.length >= 4 && v.password.toLowerCase().includes(local))) {
      ctx.addIssue({ code: "custom", path: ["password"], message: "La contraseña no debe contener tu correo." });
    }
  });

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z
  .object({ newPassword: newPasswordSchema, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden." });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual.").max(PASSWORD_MAX, "Contraseña no válida."),
    newPassword: newPasswordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden." })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ["newPassword"], message: "La nueva contraseña debe ser distinta de la actual." });

/** Dígito verificador del RUC peruano (módulo 11). */
export function isValidRuc(ruc: string): boolean {
  if (!/^(10|15|16|17|20)\d{9}$/.test(ruc)) return false;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(ruc[i]), 0);
  const check = (11 - (sum % 11)) % 10;
  return check === Number(ruc[10]);
}

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    // eslint-disable-next-line no-control-regex
    .refine((v) => !/[\u0000-\u001f\u007f<>]/.test(v), "Contiene caracteres no permitidos.")
    .transform((v) => (v === "" ? null : v));

export const profileSchema = z.object({
  name: nameSchema,
  company: optionalText(150, "La empresa es demasiado larga (máximo 150 caracteres)."),
  ruc: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => v === "" || isValidRuc(v), "Ingresa un RUC válido de 11 dígitos.")
    .transform((v) => (v === "" ? null : v)),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[0-9][0-9\s().-]{5,19}$/.test(v), "Ingresa un teléfono válido, por ejemplo +51 987 654 321.")
    .transform((v) => (v === "" ? null : v)),
});

export type ProfileInput = z.input<typeof profileSchema>;

/** Convierte los issues de zod en un mapa campo → primer mensaje. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
