import type { Pair } from "./copy";

/** Textos de la interfaz de las láminas legales: cajetín, índice y validación de formularios. */
export type FormErrorCopy = {
  required: string;
  accept: string;
  email: string;
  short: string;
  format: string;
  date: string;
  amount: string;
  phone: string;
  one: string;
  many: string;
  consent: string;
};

export const SHEET_UI: Pair<{
  onThisPage: string;
  doc: string;
  company: string;
  ruc: string;
  updated: string;
  errors: FormErrorCopy;
  claims: { summary: string; type: string; deadline: string; deadlineValue: string; medium: string };
  deletion: { cta: string; tocDevice: string; confirmError: string; sending: string };
  notFound: { more: string };
}> = {
  es: {
    onThisPage: "En esta página",
    doc: "Documento",
    company: "Razón social",
    ruc: "RUC",
    updated: "Actualizado",
    errors: {
      required: "Completa este campo.",
      accept: "Marca esta casilla para continuar.",
      email: "Escribe un correo válido, por ejemplo nombre@empresa.com.",
      short: "Escribe al menos {n} caracteres.",
      format: "Revisa el formato de este dato.",
      date: "La fecha no puede ser posterior a hoy.",
      amount: "Escribe solo el número, por ejemplo 1500.50.",
      phone: "Escribe un teléfono de 7 a 20 caracteres: números y los signos + ( ) -.",
      one: "Revisa 1 campo antes de enviar:",
      many: "Revisa {n} campos antes de enviar:",
      consent: "Declaración de veracidad y uso de datos",
    },
    claims: { summary: "Tu hoja de reclamación", type: "Tipo", deadline: "Plazo de respuesta", deadlineValue: "Hasta 15 días hábiles", medium: "Respuesta por" },
    deletion: { cta: "Solicitar la eliminación", tocDevice: "En este dispositivo", confirmError: "Confirmación de eliminación", sending: "Enviando…" },
    notFound: { more: "Otros caminos" },
  },
  en: {
    onThisPage: "On this page",
    doc: "Document",
    company: "Company name",
    ruc: "Tax ID (RUC)",
    updated: "Updated",
    errors: {
      required: "Complete this field.",
      accept: "Tick this box to continue.",
      email: "Enter a valid email, for example name@company.com.",
      short: "Enter at least {n} characters.",
      format: "Check the format of this value.",
      date: "The date cannot be later than today.",
      amount: "Enter the number only, for example 1500.50.",
      phone: "Enter a phone number of 7 to 20 characters: digits and the signs + ( ) -.",
      one: "Check 1 field before sending:",
      many: "Check {n} fields before sending:",
      consent: "Truthfulness statement and data use",
    },
    claims: { summary: "Your complaint sheet", type: "Type", deadline: "Response time", deadlineValue: "Up to 15 business days", medium: "Answer by" },
    deletion: { cta: "Request deletion", tocDevice: "On this device", confirmError: "Deletion confirmation", sending: "Sending…" },
    notFound: { more: "Other ways forward" },
  },
};
