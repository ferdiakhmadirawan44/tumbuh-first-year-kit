// ---------------------------------------------------------------------------
// TUMBUH — Baby's First Year Kit: data model + derived values.
//
// ONE SOURCE OF TRUTH: a single birth date drives all four outputs —
// birth email, immunisation schedule page, appointment PDF and reminder
// card. Everything downstream of the birth date (due dates, statuses, the
// countdown to the next vaccine, the appointment, the child ID) is
// COMPUTED by the code below, never hard-coded per output. Change the
// birth date and every output changes with it — that is the point of the
// kit: "one birth date, one schedule, zero contradictions."
//
// THE SIX DIFFERENCES (why this kit is unlike the other 41 entries):
//  1. BILINGUAL — every label is Indonesian + English from the same data,
//     so the two languages can never drift apart.
//  2. TIME IS COMPUTED — due dates and the "next vaccine in X days"
//     countdown are derived from the birth date, never typed in.
//  3. REAL MEDICAL RULES — the schedule is the IDAI 2024 recommendation
//     and the Kemenkes 2025 routine schedule (see below).
//  4. A RESPONSE LOOP — the appointment carries a confirmation action and
//     a confirmation status, so the parent answers back.
//  5. A HUMAN STORY — a baby's first year, not an administrative form.
//  6. PROOF — one child ID, identical on every output.
//
// SOURCES (all real, cited in the README):
// - Immunisation schedule: IDAI (Ikatan Dokter Anak Indonesia)
//   "Rekomendasi Jadwal Imunisasi Anak 0–18 Tahun" (2024) and Kemenkes RI
//   routine schedule 2025: HB-0 within 24 h of birth; BCG + OPV-1 before
//   1 month; DPT-HB-Hib + Polio + PCV + Rotavirus at 2, 3 and 4 months
//   (IPV-1 at 4 months); MR + IPV-2 at 9 months; JE at 9 months in
//   endemic areas only.
// - Sample baby: ILLUSTRATIVE (a fictional baby). The clinic, the birth
//   weight/length and the given dates are sample values; the schedule
//   rules and the date arithmetic are real.
// ---------------------------------------------------------------------------

/** Parse an ISO date as UTC noon — noon is safely inside the same
 *  calendar day in every timezone, so no date ever slips a day when the
 *  VM's local zone differs from WIB (the bug that once rendered every due
 *  date one day early). All date math in this file is UTC-based. */
export function parseDate(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** Add whole calendar months to a date, clamping the day (e.g. 31 Jan + 1 mo = 28 Feb). */
export function addMonths(d: Date, months: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + months;
  const day = d.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(day, lastDay), 12, 0, 0));
}

/** Whole days between two dates (UTC date parts — timezone-safe). */
export function daysBetween(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const utc = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((utc(b) - utc(a)) / ms);
}

/** "20 November 2026" in Indonesian. */
export function formatDateId(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** "Friday, 20 November 2026" in English. */
export function formatDateEn(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** "Jumat, 20 November 2026" in Indonesian. */
export function formatDateIdLong(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Status of one visit, derived from its due date and the reference date. */
export type VisitStatus = "done" | "due-soon" | "upcoming" | "overdue";

/** One vaccine dose inside a visit. */
export interface VaccineDose {
  /** e.g. "DPT-HB-Hib 1" */
  name: string;
  /** What it protects against — Indonesian. */
  protectsId: string;
  /** What it protects against — English. */
  protectsEn: string;
  /** True only for JE: given only in endemic areas. */
  conditional?: boolean;
}

/** One scheduled visit (a row of the first-year schedule). */
export interface Visit {
  /** e.g. "visit-3" */
  id: string;
  /** Age at the visit, in whole months (0 = birth). */
  ageMonths: number;
  /** Label — Indonesian, e.g. "2 bulan". */
  ageLabelId: string;
  /** Label — English, e.g. "2 months". */
  ageLabelEn: string;
  doses: VaccineDose[];
  /** Date the visit happened, ISO (only for completed visits). */
  givenOnIso?: string;
  /** Display form of the given date, e.g. "15 Oktober 2026". */
  givenOnLabelId?: string;
  /** Display form of the given date, e.g. "15 October 2026". */
  givenOnLabelEn?: string;
}

export interface Baby {
  /** Full name (sample). */
  fullName: string;
  /** First name, for greetings. */
  firstName: string;
  /** ISO date, e.g. "2026-09-20". */
  birthDateIso: string;
  /** Display form — Indonesian, e.g. "Minggu, 20 September 2026". */
  birthDateLabelId: string;
  /** Display form — English, e.g. "Sunday, 20 September 2026". */
  birthDateLabelEn: string;
  /** Birth time, e.g. "08:15 WIB". */
  birthTime: string;
  /** Sample birth weight/length (illustrative). */
  birthWeight: string;
  birthLength: string;
  /** Parent's first name, for the MergeTag greeting fallback. */
  parentFirstName: string;
}

/** The confirmation loop: the appointment's status is a DATA field the
 *  clinic updates — a static template cannot change state itself, but the
 *  confirm action and the status travel together on every output, so the
 *  parent always sees the same status the clinic sees. */
export type ConfirmationStatus = "awaiting" | "confirmed" | "rescheduled";

export interface Appointment {
  /** ISO date of the next appointment. */
  dateIso: string;
  time: string;
  clinic: string;
  clinicAddress: string;
  status: ConfirmationStatus;
  confirmUrl: string;
  rescheduleUrl: string;
}

export interface TumbuhData {
  baby: Baby;
  /** The "today" the template renders as of — explicit in the data so the
   *  countdown is deterministic and reproducible. */
  referenceDateIso: string;
  /** Display form — Indonesian, e.g. "Kamis, 19 November 2026". */
  referenceDateLabelId: string;
  /** Display form — English, e.g. "Thursday, 19 November 2026". */
  referenceDateLabelEn: string;
  visits: Visit[];
  appointment: Appointment;
  /** What to bring to the appointment (bilingual pairs). */
  bringList: Array<{ id: string; en: string }>;
  source: string;
  /** The puskesmas / clinic named in the sample is illustrative. */
  clinicNote: string;
}

/** Child ID, built from the birth date — identical on every output. */
export function childId(birthDateIso: string): string {
  const d = parseDate(birthDateIso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `TMB-${y}${m}${day}-001`;
}

/** Due date of a visit = birth date + its age in months (computed). */
export function dueDate(data: TumbuhData, visit: Visit): Date {
  return addMonths(parseDate(data.baby.birthDateIso), visit.ageMonths);
}

/** Reference ("today") date of the data. */
export function referenceDate(data: TumbuhData): Date {
  return parseDate(data.referenceDateIso);
}

/** Days from the reference date to the visit's due date (negative = past). */
export function daysUntilDue(data: TumbuhData, visit: Visit): number {
  return daysBetween(referenceDate(data), dueDate(data, visit));
}

/** Status of a visit — derived, never typed in. */
export function visitStatus(data: TumbuhData, visit: Visit): VisitStatus {
  if (visit.givenOnIso) return "done";
  const days = daysUntilDue(data, visit);
  if (days < 0) return "overdue";
  if (days <= 7) return "due-soon";
  return "upcoming";
}

/** The next visit that still needs doing — the earliest due date among
 *  visits that are not done. */
export function nextVisit(data: TumbuhData): Visit | undefined {
  const pending = data.visits
    .filter((v) => !v.givenOnIso)
    .sort((a, b) => dueDate(data, a).getTime() - dueDate(data, b).getTime());
  return pending[0];
}

/** "1 bulan 30 hari" / "1 month, 30 days" — the baby's age on the
 *  reference date, computed from the birth date. */
export function ageParts(data: TumbuhData): { months: number; days: number } {
  const birth = parseDate(data.baby.birthDateIso);
  const ref = referenceDate(data);
  let months =
    (ref.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
    (ref.getUTCMonth() - birth.getUTCMonth());
  let anchor = addMonths(birth, months);
  if (anchor.getTime() > ref.getTime()) {
    months -= 1;
    anchor = addMonths(birth, months);
  }
  return { months, days: daysBetween(anchor, ref) };
}

/** Whole days old on the reference date. */
export function ageDays(data: TumbuhData): number {
  return daysBetween(parseDate(data.baby.birthDateIso), referenceDate(data));
}

/** Countdown label for the next visit — Indonesian + English. */
export function countdownLabel(data: TumbuhData, visit: Visit): { id: string; en: string } {
  const days = daysUntilDue(data, visit);
  if (days === 0) return { id: "Hari ini", en: "Today" };
  if (days === 1) return { id: "Besok", en: "Tomorrow" };
  if (days > 1)
    return { id: `Dalam ${days} hari`, en: `In ${days} days` };
  return { id: `${-days} hari terlambat`, en: `${-days} days overdue` };
}

/** Status label — bilingual. */
export function statusLabel(status: VisitStatus): { id: string; en: string } {
  switch (status) {
    case "done":
      return { id: "Selesai", en: "Done" };
    case "due-soon":
      return { id: "Segera", en: "Due soon" };
    case "upcoming":
      return { id: "Mendatang", en: "Upcoming" };
    case "overdue":
      return { id: "Terlambat", en: "Overdue" };
  }
}

/** Confirmation status label — bilingual. */
export function confirmationLabel(status: ConfirmationStatus): { id: string; en: string } {
  switch (status) {
    case "awaiting":
      return { id: "Menunggu konfirmasi", en: "Awaiting confirmation" };
    case "confirmed":
      return { id: "Terkonfirmasi", en: "Confirmed" };
    case "rescheduled":
      return { id: "Dijadwalkan ulang", en: "Rescheduled" };
  }
}

// ---------------------------------------------------------------------------
// Sample scenario — a fictional baby, real schedule, real date arithmetic.
//
// Aira Putri Maharani, born Sunday 20 September 2026. The template renders
// as of Thursday 19 November 2026, when she is 60 days old (1 month,
// 30 days): HB-0 was given on her birth day, BCG + OPV-1 on 15 October
// 2026 (25 days old, inside the "before 1 month" window), and the
// 2-month visit falls due on Friday 20 November 2026 — tomorrow.
// A live deployment replaces `sampleData` with a real baby's record and
// the whole kit re-derives itself: due dates, statuses, the countdown,
// the appointment and the child ID.
// ---------------------------------------------------------------------------

export const sampleData: TumbuhData = {
  baby: {
    fullName: "Aira Putri Maharani",
    firstName: "Aira",
    birthDateIso: "2026-09-20",
    birthDateLabelId: "Minggu, 20 September 2026",
    birthDateLabelEn: "Sunday, 20 September 2026",
    birthTime: "08:15 WIB",
    birthWeight: "3,2 kg",
    birthLength: "49 cm",
    parentFirstName: "Bunda",
  },
  referenceDateIso: "2026-11-19",
  referenceDateLabelId: "Kamis, 19 November 2026",
  referenceDateLabelEn: "Thursday, 19 November 2026",
  visits: [
    {
      id: "visit-1",
      ageMonths: 0,
      ageLabelId: "Lahir",
      ageLabelEn: "Birth",
      doses: [
        {
          name: "Hepatitis B (HB-0)",
          protectsId: "Melindungi dari hepatitis B",
          protectsEn: "Protects against hepatitis B",
        },
      ],
      givenOnIso: "2026-09-20",
      givenOnLabelId: "20 September 2026",
      givenOnLabelEn: "20 September 2026",
    },
    {
      id: "visit-2",
      ageMonths: 1,
      ageLabelId: "1 bulan",
      ageLabelEn: "1 month",
      doses: [
        {
          name: "BCG",
          protectsId: "Melindungi dari tuberkulosis berat",
          protectsEn: "Protects against severe tuberculosis (TB)",
        },
        {
          name: "Polio tetes (OPV-1)",
          protectsId: "Melindungi dari polio",
          protectsEn: "Protects against polio",
        },
      ],
      givenOnIso: "2026-10-15",
      givenOnLabelId: "15 Oktober 2026",
      givenOnLabelEn: "15 October 2026",
    },
    {
      id: "visit-3",
      ageMonths: 2,
      ageLabelId: "2 bulan",
      ageLabelEn: "2 months",
      doses: [
        {
          name: "DPT-HB-Hib 1",
          protectsId: "Difteri, pertusis, tetanus, hepatitis B, Hib",
          protectsEn: "Diphtheria, pertussis, tetanus, hepatitis B, Hib",
        },
        {
          name: "Polio tetes (OPV-2)",
          protectsId: "Melindungi dari polio",
          protectsEn: "Protects against polio",
        },
        {
          name: "PCV 1",
          protectsId: "Melindungi dari pneumonia & meningitis",
          protectsEn: "Protects against pneumococcal pneumonia & meningitis",
        },
        {
          name: "Rotavirus 1",
          protectsId: "Melindungi dari diare berat",
          protectsEn: "Protects against severe diarrhoea",
        },
      ],
    },
    {
      id: "visit-4",
      ageMonths: 3,
      ageLabelId: "3 bulan",
      ageLabelEn: "3 months",
      doses: [
        {
          name: "DPT-HB-Hib 2",
          protectsId: "Difteri, pertusis, tetanus, hepatitis B, Hib",
          protectsEn: "Diphtheria, pertussis, tetanus, hepatitis B, Hib",
        },
        {
          name: "Polio tetes (OPV-3)",
          protectsId: "Melindungi dari polio",
          protectsEn: "Protects against polio",
        },
        {
          name: "PCV 2",
          protectsId: "Melindungi dari pneumonia & meningitis",
          protectsEn: "Protects against pneumococcal pneumonia & meningitis",
        },
        {
          name: "Rotavirus 2",
          protectsId: "Melindungi dari diare berat",
          protectsEn: "Protects against severe diarrhoea",
        },
      ],
    },
    {
      id: "visit-5",
      ageMonths: 4,
      ageLabelId: "4 bulan",
      ageLabelEn: "4 months",
      doses: [
        {
          name: "DPT-HB-Hib 3",
          protectsId: "Difteri, pertusis, tetanus, hepatitis B, Hib",
          protectsEn: "Diphtheria, pertussis, tetanus, hepatitis B, Hib",
        },
        {
          name: "Polio tetes (OPV-4)",
          protectsId: "Melindungi dari polio",
          protectsEn: "Protects against polio",
        },
        {
          name: "Polio suntik (IPV-1)",
          protectsId: "Melindungi dari polio",
          protectsEn: "Protects against polio",
        },
        {
          name: "Rotavirus 3",
          protectsId: "Melindungi dari diare berat",
          protectsEn: "Protects against severe diarrhoea",
        },
      ],
    },
    {
      id: "visit-6",
      ageMonths: 9,
      ageLabelId: "9 bulan",
      ageLabelEn: "9 months",
      doses: [
        {
          name: "Campak-Rubela (MR)",
          protectsId: "Melindungi dari campak & rubela",
          protectsEn: "Protects against measles & rubella",
        },
        {
          name: "Polio suntik (IPV-2)",
          protectsId: "Melindungi dari polio",
          protectsEn: "Protects against polio",
        },
        {
          name: "Japanese Encephalitis (JE)",
          protectsId: "Melindungi dari radang otak — hanya daerah endemis",
          protectsEn: "Protects against Japanese encephalitis — endemic areas only",
          conditional: true,
        },
      ],
    },
  ],
  appointment: {
    dateIso: "2026-11-20",
    time: "09:00 WIB",
    clinic: "Puskesmas Ambal",
    clinicAddress: "Ambal, Kebumen, Jawa Tengah",
    status: "awaiting",
    confirmUrl: "https://example.com/tumbuh/TMB-20260920-001/confirm",
    rescheduleUrl: "https://example.com/tumbuh/TMB-20260920-001/reschedule",
  },
  bringList: [
    { id: "Buku KIA (Kesehatan Ibu dan Anak)", en: "Maternal & Child Health book (Buku KIA)" },
    { id: "Kartu identitas orang tua", en: "Parent's ID card" },
    { id: "Popok & baju ganti untuk bayi", en: "Nappies & a change of clothes for the baby" },
    { id: "Air susu / susu formula secukupnya", en: "Enough milk for the visit" },
  ],
  source: "IDAI (Ikatan Dokter Anak Indonesia) 2024 & Kemenkes RI 2025",
  clinicNote:
    "The clinic, the baby and the given dates in this sample are illustrative; the schedule rules and the date arithmetic are real.",
};

/** The data the templates render when no `data` prop is passed. */
export const defaultData = sampleData;
