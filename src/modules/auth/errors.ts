/**
 * Mapeo de códigos de error (OAuth y API) a mensajes seguros en español.
 * Nunca se muestran `error_description` ni textos que vengan del proveedor o del servidor:
 * sólo mensajes propios, para evitar fugas de información e inyección de contenido.
 */
export type ErrorTone = "info" | "warning" | "danger";
export type OAuthErrorView = {
  title: string;
  message: string;
  tone: ErrorTone;
  /** Destino sugerido (ruta interna). */
  action: { label: string; href: string };
};

const GENERIC: OAuthErrorView = {
  title: "No pudimos completar el acceso",
  message: "Ocurrió un problema al iniciar sesión con el proveedor. Inténtalo de nuevo o usa tu correo y contraseña.",
  tone: "danger",
  action: { label: "Volver a iniciar sesión", href: "/login" },
};

const MAP: Record<string, OAuthErrorView> = {
  access_denied: {
    title: "Acceso cancelado",
    message: "No se otorgó el permiso en el proveedor, por lo que no se inició sesión. Puedes intentarlo otra vez cuando quieras.",
    tone: "info",
    action: { label: "Volver a iniciar sesión", href: "/login" },
  },
  account_not_linked: {
    title: "Ese correo ya tiene una cuenta",
    message:
      "Ya existe una cuenta con este correo que no está vinculada a ese proveedor. Inicia sesión con tu correo y contraseña y vincula el proveedor desde Seguridad.",
    tone: "warning",
    action: { label: "Iniciar sesión con correo", href: "/login" },
  },
  email_not_found: {
    title: "El proveedor no compartió tu correo",
    message: "Necesitamos un correo para crear tu cuenta. Revisa los permisos concedidos o regístrate con tu correo.",
    tone: "warning",
    action: { label: "Crear cuenta con correo", href: "/registro" },
  },
  email_doesn_t_match: {
    title: "El correo no coincide",
    message: "El correo del proveedor es distinto al de tu cuenta, por seguridad no se vinculó.",
    tone: "warning",
    action: { label: "Ir a mi cuenta", href: "/cuenta/seguridad" },
  },
  signup_disabled: {
    title: "Registro no disponible",
    message: "Por ahora no se pueden crear cuentas con este método. Contáctanos si necesitas acceso.",
    tone: "warning",
    action: { label: "Ir a contacto", href: "/contacto" },
  },
  banned_user: {
    title: "Cuenta restringida",
    message: "Tu cuenta tiene el acceso restringido. Contacta a nuestro equipo para más información.",
    tone: "danger",
    action: { label: "Ver detalles", href: "/cuenta-restringida" },
  },
  state_mismatch: {
    title: "La solicitud expiró",
    message: "Por seguridad, la solicitud de acceso ya no es válida. Vuelve a intentarlo desde el inicio.",
    tone: "warning",
    action: { label: "Volver a iniciar sesión", href: "/login" },
  },
  please_restart_the_process: {
    title: "La solicitud expiró",
    message: "Por seguridad, la solicitud de acceso ya no es válida. Vuelve a intentarlo desde el inicio.",
    tone: "warning",
    action: { label: "Volver a iniciar sesión", href: "/login" },
  },
  invalid_code: {
    title: "No se pudo validar el acceso",
    message: "El proveedor no confirmó la solicitud. Inténtalo de nuevo en unos minutos.",
    tone: "danger",
    action: { label: "Volver a iniciar sesión", href: "/login" },
  },
  unable_to_get_user_info: {
    title: "No pudimos leer tu perfil",
    message: "El proveedor no entregó los datos necesarios. Inténtalo de nuevo o usa tu correo y contraseña.",
    tone: "danger",
    action: { label: "Volver a iniciar sesión", href: "/login" },
  },
  provider_not_found: {
    title: "Proveedor no disponible",
    message: "Este método de acceso aún no está habilitado. Usa tu correo y contraseña.",
    tone: "warning",
    action: { label: "Iniciar sesión con correo", href: "/login" },
  },
  unable_to_link_account: {
    title: "No se pudo vincular la cuenta",
    message: "No fue posible vincular este proveedor a tu cuenta. Inténtalo de nuevo desde Seguridad.",
    tone: "warning",
    action: { label: "Ir a Seguridad", href: "/cuenta/seguridad" },
  },
  account_already_linked_to_different_user: {
    title: "Cuenta ya vinculada",
    message: "Esa cuenta del proveedor ya está vinculada a otro usuario.",
    tone: "warning",
    action: { label: "Ir a Seguridad", href: "/cuenta/seguridad" },
  },
  invalid_callback_request: {
    title: "Solicitud no válida",
    message: "La respuesta del proveedor no es válida. Vuelve a intentarlo desde el inicio.",
    tone: "warning",
    action: { label: "Volver a iniciar sesión", href: "/login" },
  },
};

/** Normaliza el código recibido en `?error=` (minúsculas, sólo [a-z0-9_]). */
export function normalizeErrorCode(raw: unknown): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return "";
  return value.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 64);
}

export function mapOAuthError(raw: unknown): OAuthErrorView {
  const code = normalizeErrorCode(raw);
  return MAP[code] ?? GENERIC;
}

/** Mensajes para errores de la API de autenticación en formularios (códigos de Better Auth). */
const API_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos.",
  INVALID_PASSWORD: "La contraseña actual no es correcta.",
  INVALID_EMAIL: "Ingresa un correo válido.",
  PASSWORD_TOO_SHORT: "La contraseña es demasiado corta.",
  PASSWORD_TOO_LONG: "La contraseña es demasiado larga.",
  INVALID_TOKEN: "El enlace no es válido o ya fue usado.",
  TOKEN_EXPIRED: "El enlace expiró.",
  FAILED_TO_CREATE_USER: "No pudimos crear la cuenta. Inténtalo nuevamente.",
  USER_ALREADY_EXISTS: "No pudimos completar el registro con esos datos.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "No pudimos completar el registro con esos datos.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Tu cuenta no tiene contraseña. Usa “Crear contraseña” para definir una.",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "No puedes desvincular tu único método de acceso.",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Ese proveedor ya está vinculado.",
  SESSION_NOT_FRESH: "Por seguridad, vuelve a iniciar sesión para realizar este cambio.",
};

export const GENERIC_ERROR = "Ocurrió un error inesperado. Inténtalo nuevamente en unos minutos.";
export const RATE_LIMIT_ERROR = "Demasiados intentos. Espera unos minutos antes de volver a intentarlo.";

export type ApiError = { code?: string | null; status?: number | null; message?: string | null } | null | undefined;

export type ApiErrorKind = "invalid_credentials" | "email_not_verified" | "banned" | "rate_limited" | "invalid_token" | "other";

export function classifyApiError(error: ApiError): ApiErrorKind {
  if (!error) return "other";
  const code = String(error.code ?? "").toUpperCase();
  if (error.status === 429) return "rate_limited";
  if (code === "EMAIL_NOT_VERIFIED") return "email_not_verified";
  if (code === "BANNED_USER") return "banned";
  if (code === "INVALID_EMAIL_OR_PASSWORD") return "invalid_credentials";
  if (code === "INVALID_TOKEN" || code === "TOKEN_EXPIRED") return "invalid_token";
  return "other";
}

/** Mensaje seguro y en español para un error de la API (nunca se muestra `error.message` del servidor). */
export function apiErrorMessage(error: ApiError): string {
  if (!error) return GENERIC_ERROR;
  if (error.status === 429) return RATE_LIMIT_ERROR;
  const code = String(error.code ?? "").toUpperCase();
  if (code === "EMAIL_NOT_VERIFIED") return "Debes confirmar tu correo antes de iniciar sesión.";
  return API_MESSAGES[code] ?? GENERIC_ERROR;
}
