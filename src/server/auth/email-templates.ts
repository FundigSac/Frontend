import type { OutgoingEmail } from "./email";

/**
 * Plantillas transaccionales sobrias en español. HTML con estilos en línea (los clientes de correo no
 * soportan variables CSS) y sin imágenes remotas. Todos los valores dinámicos se escapan.
 */
const BRAND = "FUNDIGSAC";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

type Layout = { preheader: string; title: string; paragraphs: string[]; cta?: { label: string; url: string }; footnote: string };

function render(to: string, subject: string, layout: Layout): OutgoingEmail {
  const text = [
    layout.title,
    "",
    ...layout.paragraphs,
    ...(layout.cta ? ["", `${layout.cta.label}: ${layout.cta.url}`] : []),
    "",
    layout.footnote,
    "",
    `${BRAND} · Hierro dúctil · Perú`,
  ].join("\n");
  const html = `<!doctype html>
<html lang="es-PE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5faff;font-family:Inter,Arial,Helvetica,sans-serif;color:#111d24;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(layout.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5faff;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #dce3e6;border-radius:8px;">
<tr><td style="padding:24px 24px 0 24px;font-size:20px;font-weight:700;letter-spacing:-0.01em;color:#004257;">${BRAND}</td></tr>
<tr><td style="padding:16px 24px 0 24px;font-size:20px;line-height:28px;font-weight:600;">${escapeHtml(layout.title)}</td></tr>
<tr><td style="padding:12px 24px 0 24px;font-size:15px;line-height:24px;color:#41484c;">${layout.paragraphs.map((p) => `<p style="margin:0 0 12px 0;">${escapeHtml(p)}</p>`).join("")}</td></tr>
${
  layout.cta
    ? `<tr><td style="padding:8px 24px 0 24px;"><a href="${escapeHtml(layout.cta.url)}" style="display:inline-block;background:#245a70;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;line-height:20px;padding:14px 24px;border-radius:6px;">${escapeHtml(layout.cta.label)}</a></td></tr>
<tr><td style="padding:16px 24px 0 24px;font-size:13px;line-height:20px;color:#52616b;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br><span style="word-break:break-all;color:#004257;">${escapeHtml(layout.cta.url)}</span></td></tr>`
    : ""
}
<tr><td style="padding:16px 24px 24px 24px;font-size:13px;line-height:20px;color:#52616b;">${escapeHtml(layout.footnote)}</td></tr>
</table></td></tr></table></body></html>`;
  return { to, subject, text, html };
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "";
const greet = (name: string) => (firstName(name) ? `Hola ${firstName(name)},` : "Hola,");

export function verificationEmail(to: string, name: string, url: string): OutgoingEmail {
  return render(to, "Confirma tu correo en FUNDIGSAC", {
    preheader: "Confirma tu correo para activar tu cuenta.",
    title: "Confirma tu correo",
    paragraphs: [greet(name), "Para activar tu cuenta de FUNDIGSAC, confirma que este correo te pertenece. El enlace es válido por 1 hora."],
    cta: { label: "Confirmar correo", url },
    footnote: "Si no creaste una cuenta en FUNDIGSAC, puedes ignorar este mensaje.",
  });
}

export function resetPasswordEmail(to: string, name: string, url: string, minutes: number): OutgoingEmail {
  return render(to, "Restablece tu contraseña de FUNDIGSAC", {
    preheader: "Enlace para crear una nueva contraseña.",
    title: "Restablece tu contraseña",
    paragraphs: [greet(name), `Recibimos una solicitud para restablecer la contraseña de tu cuenta. El enlace es de un solo uso y vence en ${minutes} minutos.`],
    cta: { label: "Crear nueva contraseña", url },
    footnote: "Si no solicitaste este cambio, ignora este mensaje: tu contraseña actual seguirá siendo válida. Nunca te pediremos tu contraseña por correo.",
  });
}

export function existingAccountEmail(to: string, name: string, loginUrl: string): OutgoingEmail {
  return render(to, "Intento de registro con tu correo en FUNDIGSAC", {
    preheader: "Ya existe una cuenta con este correo.",
    title: "Ya tienes una cuenta",
    paragraphs: [greet(name), "Alguien intentó crear una cuenta en FUNDIGSAC con este correo, pero ya existe una. Si fuiste tú, inicia sesión o recupera tu contraseña desde la página de acceso."],
    cta: { label: "Ir a iniciar sesión", url: loginUrl },
    footnote: "Si no fuiste tú, no necesitas hacer nada: tu cuenta no fue modificada.",
  });
}

export function passwordChangedEmail(to: string, name: string): OutgoingEmail {
  return render(to, "Tu contraseña de FUNDIGSAC fue actualizada", {
    preheader: "Aviso de seguridad: cambio de contraseña.",
    title: "Contraseña actualizada",
    paragraphs: [greet(name), "La contraseña de tu cuenta se restableció correctamente y se cerraron tus otras sesiones activas."],
    footnote: "Si no reconoces este cambio, restablece tu contraseña de inmediato y contáctanos.",
  });
}
