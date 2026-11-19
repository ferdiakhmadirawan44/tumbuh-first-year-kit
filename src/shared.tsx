// ---------------------------------------------------------------------------
// Shared pieces of the TUMBUH kit — used by all four outputs so the kit can
// never disagree with itself. Every piece reads the SAME `data` object and
// derives everything from the birth date; nothing is re-typed per output.
//
// The bilingual rule: every label is Indonesian first, English second,
// from the same data — the two languages are rendered from one source, so
// they can never drift apart.
// ---------------------------------------------------------------------------

import {
  Button,
  Circle,
  Column,
  Divider,
  Link,
  Line,
  Rect,
  Row,
  Span,
  Svg,
  Table,
  TableCell,
  TableRow,
  Text,
  token,
} from "@hyper-elements/react";
import {
  ageDays,
  ageParts,
  childId,
  confirmationLabel,
  countdownLabel,
  dueDate,
  formatDateEn,
  formatDateId,
  nextVisit,
  parseDate,
  statusLabel,
  visitStatus,
  type TumbuhData,
  type Visit,
  type VisitStatus,
} from "./data.js";
import { C, MONO_FONT, STATUS_COLORS } from "./theme.js";

/** Bilingual label: Indonesian line, then the English line, muted. The
 *  signature of this kit — used everywhere a label appears. */
export function Bi({
  id,
  en,
  size = 14,
  bold = false,
  align,
}: {
  id: string;
  en: string;
  size?: number;
  bold?: boolean;
  align?: "left" | "center" | "right";
}) {
  return (
    <Column style={{ gap: 0 }}>
      <Text
        style={{
          fontSize: size,
          fontWeight: bold ? 700 : 400,
          textAlign: align,
        }}
      >
        {id}
      </Text>
      <Text
        style={{
          fontSize: Math.max(11, size - 2),
          color: token("colors.muted"),
          textAlign: align,
        }}
      >
        {en}
      </Text>
    </Column>
  );
}

/** Status pill — tinted by status, bilingual on one line. */
export function StatusPill({ status }: { status: VisitStatus }) {
  const c = STATUS_COLORS[status];
  const label = statusLabel(status);
  return (
    <Column
      style={{
        backgroundColor: c.tint,
        borderRadius: 999,
        padding: [4, 12],
        alignItems: "center",
        width: 150,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: 700, color: c.dark, textAlign: "center" }}>
        {label.id} · {label.en}
      </Text>
    </Column>
  );
}

/** The child badge: child ID over the baby's name. Stacked, not side by
 *  side — DejaVu Bold is wider than it looks, and a side-by-side badge
 *  would wrap the ID. The fixed width only has to fit the longest line. */
export function ChildBadge({ data }: { data: TumbuhData }) {
  return (
    <Column
      style={{
        backgroundColor: "#FFFFFF",
        border: `2px solid ${C.terra}`,
        borderRadius: 14,
        padding: [10, 18],
        gap: 2,
        alignItems: "center",
        justifyContent: "start",
        width: 260,
      }}
    >
      <Text
        style={{
          color: C.terraDark,
          fontWeight: 800,
          fontSize: 14,
          fontFamily: MONO_FONT,
          textAlign: "center",
        }}
      >
        {childId(data.baby.birthDateIso)}
      </Text>
      <Text style={{ color: C.terraDark, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
        {data.baby.fullName}
      </Text>
    </Column>
  );
}

/**
 * The proof strip — IDENTICAL text on the email, the page, the card and
 * the reminder. If any output ever shows a different child ID, the kit
 * is broken; that is the whole point of "one birth date, one schedule".
 */
export function ChildProof({ data, dark }: { data: TumbuhData; dark?: boolean }) {
  const color = dark ? "#F5E6DC" : token("colors.muted");
  return (
    <Column style={{ gap: 4 }}>
      <Text style={{ fontSize: 12, color, fontFamily: MONO_FONT }}>
        Child ID {childId(data.baby.birthDateIso)} · Born {data.baby.birthDateLabelEn}
      </Text>
      <Text style={{ fontSize: 12, color }}>
        Schedule: {data.source}
      </Text>
      <Text style={{ fontSize: 12, fontWeight: 700, color: dark ? "#FFFFFF" : C.ink }}>
        One birth date, one schedule — this ID is identical on the email, the page, the
        appointment card and the reminder.
      </Text>
    </Column>
  );
}

/** Short date, e.g. "20 Nov 2026" — the same in both languages. */
function shortDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Short date from an ISO date, e.g. "15 Okt 2026". */
function shortDateIso(iso: string): string {
  return shortDate(parseDate(iso));
}

/**
 * The first-year timeline as an SVG chart (Page + Canvas): a progress line
 * from birth to today, one dot per visit coloured by its status, due
 * dates underneath. Visits are spaced as milestones (like the SIAGA gauge
 * chart spaces readings) — the exact due date is printed under every dot,
 * so nothing about the timing is approximate.
 */
export function VisitTimelineSvg({
  data,
  width = 560,
  height = 132,
}: {
  data: TumbuhData;
  width?: number;
  height?: number;
}) {
  const n = data.visits.length;
  const slot = width / n;
  const cx = (i: number) => i * slot + slot / 2;
  const yMid = 34;
  const progressX = (ageDays(data) / 274) * width; // 274 days ≈ 9 months
  return (
    <Column style={{ gap: 6 }}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        title="First-year immunisation timeline, birth to 9 months"
      >
        {/* Track */}
        <Line
          x1={cx(0)}
          y1={yMid}
          x2={cx(n - 1)}
          y2={yMid}
          style={{ stroke: C.track, strokeWidth: 6 }}
        />
        {/* Progress: birth → today */}
        <Line
          x1={cx(0)}
          y1={yMid}
          x2={Math.min(progressX, cx(n - 1))}
          y2={yMid}
          style={{ stroke: C.terra, strokeWidth: 6 }}
        />
        {/* Sun at birth */}
        <Circle cx={cx(0)} cy={yMid} r={13} style={{ fill: C.sun }} />
        {data.visits.map((v, i) => {
          const status = visitStatus(data, v);
          const c = STATUS_COLORS[status];
          return (
            <Circle
              key={v.id}
              cx={cx(i)}
              cy={yMid}
              r={i === 0 ? 5 : 9}
              style={{ fill: c.color, stroke: "#FFFFFF", strokeWidth: 3 }}
            />
          );
        })}
        {/* Milestone labels */}
        {data.visits.map((v, i) => (
          <Rect
            key={v.id}
            x={cx(i) - 1}
            y={yMid + 26}
            width={2}
            height={10}
            style={{ fill: C.faint }}
          />
        ))}
      </Svg>
      <Row style={{ gap: 0 }}>
        {data.visits.map((v) => {
          const status = visitStatus(data, v);
          const c = STATUS_COLORS[status];
          return (
            <Column key={v.id} style={{ flex: 1, gap: 2, alignItems: "center" }}>
              <Text style={{ fontSize: 12, fontWeight: 700, color: c.dark, textAlign: "center" }}>
                {v.ageLabelId} · {v.ageLabelEn}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: MONO_FONT,
                  color: token("colors.muted"),
                  textAlign: "center",
                }}
              >
                {shortDate(dueDate(data, v))}
              </Text>
            </Column>
          );
        })}
      </Row>
      <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
        Enam kunjungan tahun pertama — ditampilkan sebagai tonggak · Six first-year visits,
        shown as milestones
      </Text>
    </Column>
  );
}

/** The timeline as layout rows (Email + Document: no SVG needed). */
export function VisitBars({ data }: { data: TumbuhData }) {
  return (
    <Column style={{ gap: 10 }}>
      {data.visits.map((v) => {
        const status = visitStatus(data, v);
        const c = STATUS_COLORS[status];
        const due = dueDate(data, v);
        return (
          <Row key={v.id} style={{ gap: 12, alignItems: "center", justifyContent: "start" }}>
            {/* A drawn dot, not a "●" character: the PDF renderer measures
                the glyph far wider than it draws, which pushed text columns
                off-centre in the SIAGA guide. */}
            <Column
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: c.color,
                border: "2px solid #FFFFFF",
              }}
            />
            <Column style={{ gap: 0, width: 120 }}>
              <Text style={{ fontWeight: 700, fontSize: 13 }}>
                {v.ageLabelId} · {v.ageLabelEn}
              </Text>
              <Text style={{ fontSize: 12, color: token("colors.muted"), fontFamily: MONO_FONT }}>
                {v.givenOnIso ? `Diberikan ${shortDateIso(v.givenOnIso)}` : shortDate(due)}
              </Text>
            </Column>
            <Text style={{ flex: 1, fontSize: 13 }}>
              {v.doses.map((d) => d.name).join(" · ")}
            </Text>
            <StatusPill status={status} />
          </Row>
        );
      })}
    </Column>
  );
}

/** The full schedule as a table (Page + Document). */
export function ScheduleTable({ data }: { data: TumbuhData }) {
  return (
    <Table
      style={{
        cellPadding: [10, 8],
        rowBorder: { width: 1, style: "solid", color: C.border },
      }}
    >
      <TableRow header>
        <TableCell>
          <Span style={{ fontWeight: 700 }}>Kunjungan / Visit</Span>
        </TableCell>
        <TableCell>
          <Span style={{ fontWeight: 700 }}>Vaksin / Vaccines</Span>
        </TableCell>
        <TableCell>
          <Span style={{ fontWeight: 700 }}>Jatuh tempo / Due</Span>
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <Span style={{ fontWeight: 700 }}>Status</Span>
        </TableCell>
      </TableRow>
      {data.visits.map((v, i) => {
        const status = visitStatus(data, v);
        const due = dueDate(data, v);
        return (
          <TableRow
            key={v.id}
            style={i % 2 === 1 ? { backgroundColor: C.zebra } : undefined}
          >
            <TableCell style={{ fontWeight: 700 }}>
              {`${v.ageLabelId} · ${v.ageLabelEn}`}
            </TableCell>
            <TableCell>
              {v.doses.map((d) => d.name).join(" · ")}
              {v.doses.some((d) => d.conditional) ? " *" : ""}
            </TableCell>
            <TableCell style={{ fontFamily: MONO_FONT, fontSize: 13 }}>
              {v.givenOnIso ? `Diberikan ${v.givenOnLabelId}` : `${formatDateId(due)}`}
            </TableCell>
            <TableCell style={{ textAlign: "right" }}>
              <Span
                style={{
                  color: STATUS_COLORS[status].dark,
                  fontWeight: 700,
                }}
              >
                {`${statusLabel(status).id} · ${statusLabel(status).en}`}
              </Span>
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
}

/** What each vaccine protects against — bilingual list. */
export function ProtectsList({ visit }: { visit: Visit }) {
  return (
    <Column style={{ gap: 8 }}>
      {visit.doses.map((d) => (
        <Column key={d.name} style={{ gap: 0 }}>
          <Text style={{ fontWeight: 700, fontSize: 13 }}>
            {d.name}
            {d.conditional ? " *" : ""}
          </Text>
          <Text style={{ fontSize: 13 }}>{d.protectsId}</Text>
          <Text style={{ fontSize: 12, color: token("colors.muted") }}>{d.protectsEn}</Text>
        </Column>
      ))}
    </Column>
  );
}

/**
 * The next appointment — details, countdown, the confirmation action and
 * the confirmation status. The confirm button links to the clinic's
 * confirmation URL for this child ID; the status is a data field the
 * clinic updates after the parent confirms, so the status on the email,
 * the page, the card and the reminder always matches. `withActions` is
 * false on the printed card: a PDF has no hover and no clickable button,
 * so the card shows the confirmation URL as text in its own section
 * instead.
 */
export function AppointmentBlock({ data, withActions = true }: { data: TumbuhData; withActions?: boolean }) {
  const next = nextVisit(data);
  const appt = data.appointment;
  const due = parseDate(appt.dateIso);
  const conf = confirmationLabel(appt.status);
  const count = next ? countdownLabel(data, next) : { id: "—", en: "—" };
  return (
    <Column style={{ gap: 12 }}>
      <Row style={{ gap: 24 }}>
        <Column style={{ gap: 2, flex: 1 }}>
          <Bi id="Tanggal janji temu" en="Appointment date" size={12} />
          <Text style={{ fontFamily: MONO_FONT, fontSize: 20, fontWeight: 700 }}>
            {formatDateId(due)}
          </Text>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>
            {formatDateEn(due)} · {appt.time}
          </Text>
        </Column>
        <Column style={{ gap: 2, flex: 1 }}>
          <Bi id="Klinik" en="Clinic" size={12} />
          <Text style={{ fontSize: 16, fontWeight: 700 }}>{appt.clinic}</Text>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>{appt.clinicAddress}</Text>
        </Column>
      </Row>
      <Row style={{ gap: 24 }}>
        <Column style={{ gap: 2, flex: 1 }}>
          <Bi id="Vaksin pada kunjungan ini" en="Vaccines at this visit" size={12} />
          <Text style={{ fontSize: 14, fontWeight: 700 }}>
            {next ? next.doses.map((d) => d.name).join(" · ") : "—"}
          </Text>
        </Column>
        <Column style={{ gap: 2, flex: 1 }}>
          <Bi id="Hitung mundur" en="Countdown" size={12} />
          <Text style={{ fontSize: 20, fontWeight: 800, color: C.terraDark }}>
            {count.id} · {count.en}
          </Text>
        </Column>
      </Row>
      {withActions && (
        <Row style={{ gap: 12, alignItems: "center" }}>
          <Button href={appt.confirmUrl}>Konfirmasi Janji Temu / Confirm Appointment</Button>
          <Link href={appt.rescheduleUrl}>Jadwal ulang / Reschedule</Link>
        </Row>
      )}
      <Text style={{ fontSize: 13 }}>
        Status:{" "}
        <Span style={{ fontWeight: 700 }}>
          {conf.id} · {conf.en}
        </Span>{" "}
        —{" "}
        <Span style={{ color: token("colors.muted") }}>
          status ini adalah field data yang diperbarui klinik setelah orang tua mengonfirmasi /
          this status is a data field the clinic updates once the parent confirms.
        </Span>
      </Text>
    </Column>
  );
}

/** The baby's age line — computed from the birth date. */
export function AgeLine({ data }: { data: TumbuhData }) {
  const parts = ageParts(data);
  const days = ageDays(data);
  return (
    <Text style={{ fontSize: 14 }}>
      Usia / Age:{" "}
      <Span style={{ fontWeight: 700 }}>
        {parts.months} bulan {parts.days} hari · {parts.months} month{parts.months === 1 ? "" : "s"}
        , {parts.days} day{parts.days === 1 ? "" : "s"}
      </Span>{" "}
      ({days} hari / {days} days) — lahir / born {data.baby.birthDateLabelId}
    </Text>
  );
}

/** Small divider + "sample scenario" note used at the foot of every output. */
export function SampleNote() {
  return (
    <Column style={{ gap: 8 }}>
      <Divider style={{ borderTop: { width: 1, style: "solid", color: "#E5D5C8" } }} />
      <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
        SAMPLE SCENARIO — a fictional baby, Aira Putri Maharani, born 20 September 2026. Not a
        real medical record. The clinic, birth weight/length and given dates are illustrative;
        the schedule rules (IDAI 2024 / Kemenkes 2025) and the date arithmetic are real.
      </Text>
    </Column>
  );
}
