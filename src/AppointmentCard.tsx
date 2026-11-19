// ---------------------------------------------------------------------------
// TUMBUH — Appointment Card (PDF)
// The printable card for one baby's next appointment: when, where, which
// vaccines, what to bring, and how to confirm — plus the full first-year
// schedule on page 2. It is printed from the SAME birth date as the email,
// the page and the reminder — the child ID on this card is the child ID on
// all of them, so a printed card can never disagree with the reminder on
// the parent's phone.
// ---------------------------------------------------------------------------

import {
  Column,
  Divider,
  Document,
  Heading,
  PageNumber,
  Row,
  Text,
  token,
} from "@hyper-elements/react";
import {
  childId,
  defaultData,
  formatDateId,
  parseDate,
  type TumbuhData,
  type VisitStatus,
} from "./data.js";
import {
  AppointmentBlock,
  ChildBadge,
  ChildProof,
  SampleNote,
  ScheduleTable,
} from "./shared.js";
import { C, MONO_FONT, PRINT_FONT, PRINT_FONTS, STATUS_COLORS, tumbuhTheme } from "./theme.js";

export interface AppointmentCardProps {
  data?: TumbuhData;
}

/** One checklist row: a square box + the text. */
function CheckItem({ children }: { children: string }) {
  return (
    <Row style={{ gap: 10, alignItems: "start" }}>
      <Column
        style={{
          width: 15,
          height: 15,
          border: `2px solid ${C.ink}`,
          borderRadius: 3,
        }}
      />
      <Text style={{ flex: 1 }}>{children}</Text>
    </Row>
  );
}

function AppointmentCard({ data = defaultData }: AppointmentCardProps) {
  const baby = data.baby;
  const appt = data.appointment;
  const due = parseDate(appt.dateIso);
  return (
    <Document
      theme={tumbuhTheme}
      fonts={PRINT_FONTS}
      title={`TUMBUH — Kartu Janji Temu / Appointment Card (${baby.firstName}, ${formatDateId(due)})`}
      size="A4"
      orientation="portrait"
      lang="id"
      style={{ fontFamily: PRINT_FONT, fontSize: 13 }}
    >
      {/* ================= Page 1: the appointment ================= */}
      <Document.Page style={{ gap: 14 }}>
        <Column
          style={{ backgroundColor: C.terraDark, borderRadius: 10, padding: 20, gap: 8 }}
        >
          <Row style={{ gap: 12, alignItems: "center" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>
              TUMBUH
            </Text>
            <ChildBadge data={data} />
          </Row>
          <Heading level={1} style={{ color: "#FFFFFF" }}>
            Kartu Janji Temu / Appointment Card
          </Heading>
          <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
            {baby.fullName} · Lahir / Born {baby.birthDateLabelId} · {baby.birthWeight} ·{" "}
            {baby.birthLength}
          </Text>
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Janji temu berikutnya / Next appointment</Heading>
          <AppointmentBlock data={data} withActions={false} />
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Yang dibawa / What to bring</Heading>
          <Column style={{ gap: 6 }}>
            {data.bringList.map((b) => (
              <CheckItem key={b.id}>{`${b.id} / ${b.en}`}</CheckItem>
            ))}
            <CheckItem>
              Kartu janji temu ini (sudah dicetak) / This appointment card (printed)
            </CheckItem>
          </Column>
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Cara konfirmasi / How to confirm</Heading>
          <Text>
            Buka tautan ini atau pindai kode di klinik: / Open this link or scan the code at the
            clinic:
          </Text>
          <Text style={{ fontFamily: MONO_FONT, fontSize: 12, fontWeight: 700 }}>
            {appt.confirmUrl}
          </Text>
          <Text style={{ fontSize: 12, color: token("colors.muted") }}>
            Status saat kartu ini dicetak:{" "}
            {appt.status === "awaiting"
              ? "Menunggu konfirmasi / Awaiting confirmation"
              : appt.status === "confirmed"
                ? "Terkonfirmasi / Confirmed"
                : "Dijadwalkan ulang / Rescheduled"}{" "}
            — status ini adalah field data yang diperbarui klinik. / The status when this card
            was printed — it is a data field the clinic updates.
          </Text>
        </Column>

        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          Page <PageNumber /> of <PageNumber total /> · Child ID {childId(data.baby.birthDateIso)}
        </Text>
      </Document.Page>

      {/* ================= Page 2: full schedule, legend, proof ================= */}
      <Document.Page style={{ gap: 10 }}>
        <Column style={{ gap: 8 }}>
          <Heading level={2}>Jadwal lengkap tahun pertama / Full first-year schedule</Heading>
          <Text style={{ color: token("colors.muted") }}>
            IDAI 2024 &amp; Kemenkes 2025 — tanggal jatuh tempo dihitung dari tanggal lahir{" "}
            {baby.firstName}. / Due dates are computed from {baby.firstName}&apos;s birth date.
          </Text>
          <ScheduleTable data={data} />
          <Text style={{ fontSize: 12, color: token("colors.muted") }}>
            * JE hanya di daerah endemis. / JE in endemic areas only.
          </Text>
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Arti warna / What the colours mean</Heading>
          {(["done", "due-soon", "upcoming", "overdue"] as VisitStatus[]).map((s) => {
            const c = STATUS_COLORS[s];
            return (
              <Row key={s} style={{ gap: 10, alignItems: "center" }}>
                <Column
                  style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.color }}
                />
                <Text style={{ fontSize: 12, fontWeight: 700, color: c.dark }}>
                  {s === "done"
                    ? "Selesai / Done"
                    : s === "due-soon"
                      ? "Segera / Due soon — dalam 7 hari / within 7 days"
                      : s === "upcoming"
                        ? "Mendatang / Upcoming"
                        : "Terlambat / Overdue"}
                </Text>
              </Row>
            );
          })}
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={3}>Satu tanggal lahir, satu jadwal / One birth date, one schedule</Heading>
          <ChildProof data={data} />
        </Column>

        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
        <SampleNote />
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          Page <PageNumber /> of <PageNumber total /> · {data.source} · {appt.clinic},{" "}
          {appt.clinicAddress}
        </Text>
      </Document.Page>
    </Document>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(AppointmentCard, { PreviewProps: {} });
