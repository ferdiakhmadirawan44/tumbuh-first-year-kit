// ---------------------------------------------------------------------------
// TUMBUH — Schedule Page
// The live dashboard for one baby's first year: the age, the countdown to
// the next vaccine, the full timeline, the whole schedule table, the
// appointment and its confirmation status. Everything on this page is
// derived from the same birth date as the email, the appointment card and
// the reminder — same child ID, same due dates, same countdown.
// ---------------------------------------------------------------------------

import {
  Column,
  Divider,
  Grid,
  Heading,
  Page,
  Row,
  Section,
  Span,
  Text,
  token,
} from "@hyper-elements/react";
import {
  ageDays,
  ageParts,
  countdownLabel,
  defaultData,
  formatDateId,
  nextVisit,
  parseDate,
  type TumbuhData,
  type VisitStatus,
} from "./data.js";
import {
  AppointmentBlock,
  ChildBadge,
  ChildProof,
  ProtectsList,
  SampleNote,
  ScheduleTable,
  VisitTimelineSvg,
} from "./shared.js";
import { C, MONO_FONT, STATUS_COLORS, tumbuhTheme } from "./theme.js";

export interface SchedulePageProps {
  data?: TumbuhData;
}

function SchedulePage({ data = defaultData }: SchedulePageProps) {
  const baby = data.baby;
  const next = nextVisit(data);
  const count = next ? countdownLabel(data, next) : { id: "—", en: "—" };
  const parts = ageParts(data);
  const doneCount = data.visits.filter((v) => v.givenOnIso).length;
  return (
    <Page
      theme={tumbuhTheme}
      title={`TUMBUH — Jadwal imunisasi ${baby.firstName}: vaksin ${next?.ageLabelId ?? ""} ${count.id.toLowerCase()}`}
      description={`Jadwal imunisasi tahun pertama ${baby.firstName} — vaksin ${next?.ageLabelId ?? ""} jatuh tempo ${count.id.toLowerCase()}, ${next?.doses.map((d) => d.name).join(", ") ?? ""}.`}
      width={1120}
      lang="id"
      style={{ backgroundColor: C.page, gap: 0 }}
    >
      {/* ---- Top bar ---- */}
      <Section style={{ padding: [20, 0, 0, 0], gap: 0 }}>
        <Row style={{ gap: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, flex: 1 }}>TUMBUH</Text>
          <Text style={{ fontSize: 13, color: token("colors.muted"), fontFamily: MONO_FONT }}>
            {baby.fullName}
          </Text>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>
            {data.referenceDateLabelId}
          </Text>
        </Row>
        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
      </Section>

      {/* ---- Hero: the countdown ---- */}
      <Section style={{ padding: [28, 0, 8, 0], gap: 24 }}>
        <Column
          style={{
            backgroundColor: C.terraDark,
            borderRadius: 16,
            padding: 32,
            gap: 16,
          }}
        >
          <Row style={{ gap: 16, alignItems: "center" }}>
            <ChildBadge data={data} />
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontFamily: MONO_FONT }}>
              Lahir / Born {baby.birthDateLabelId} · {baby.birthWeight} · {baby.birthLength}
            </Text>
          </Row>
          <Heading level={1} style={{ color: "#FFFFFF" }}>
            {baby.firstName} berusia {parts.months} bulan {parts.days} hari — vaksin {next?.ageLabelId ?? ""}{" "}
            {count.id.toLowerCase()}
          </Heading>
          <Text style={{ color: "#FFFFFF", fontSize: 15 }}>
            {baby.firstName} is {parts.months} month{parts.months === 1 ? "" : "s"}, {parts.days} day
            {parts.days === 1 ? "" : "s"} old ({ageDays(data)} days) — the {next?.ageLabelEn ?? ""}{" "}
            vaccines are due {count.en.toLowerCase()}.
          </Text>
          <Row style={{ gap: 32 }}>
            <Column style={{ gap: 2 }}>
              <Text style={{ fontSize: 12, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 }}>
                Vaksin berikutnya / Next vaccine
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 800, color: "#FFFFFF" }}>
                {count.id.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
                {next ? `${next.doses.map((d) => d.name).join(" · ")}` : "—"}
              </Text>
            </Column>
            <Column style={{ gap: 2 }}>
              <Text style={{ fontSize: 12, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 }}>
                Janji temu / Appointment
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 800, color: "#FFFFFF" }}>
                {formatDateId(parseDate(data.appointment.dateIso))}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
                {data.appointment.time} · {data.appointment.clinic}
              </Text>
            </Column>
            <Column style={{ gap: 2 }}>
              <Text style={{ fontSize: 12, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 }}>
                Selesai / Done
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 800, color: "#FFFFFF" }}>
                {doneCount} / {data.visits.length}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
                kunjungan / visits
              </Text>
            </Column>
          </Row>
        </Column>

        {/* ---- Timeline + appointment ---- */}
        <Grid columns={2} style={{ gap: 16 }}>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Linimasa tahun pertama / First-year timeline</Heading>
            <Text style={{ color: token("colors.muted") }}>
              Dari lahir sampai 9 bulan — setiap titik adalah satu kunjungan, diwarnai menurut
              statusnya. / From birth to 9 months — every dot is one visit, coloured by its
              status.
            </Text>
            <VisitTimelineSvg data={data} width={480} height={132} />
          </Column>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Janji temu berikutnya / Next appointment</Heading>
            <AppointmentBlock data={data} />
          </Column>
        </Grid>

        {/* ---- Full schedule ---- */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Jadwal lengkap / Full schedule</Heading>
          <Text style={{ color: token("colors.muted") }}>
            Jadwal imunisasi dasar IDAI 2024 &amp; Kemenkes 2025 — tanggal jatuh tempo dihitung dari
            tanggal lahir {baby.firstName}, bukan diketik. / The IDAI 2024 &amp; Kemenkes 2025
            schedule — due dates are computed from {baby.firstName}&apos;s birth date, never typed
            in.
          </Text>
          <ScheduleTable data={data} />
          <Text style={{ fontSize: 12, color: token("colors.muted") }}>
            * JE (Japanese Encephalitis) hanya diberikan di daerah endemis. / JE (Japanese
            Encephalitis) is given in endemic areas only.
          </Text>
        </Column>

        {/* ---- Status legend + what the next vaccines protect ---- */}
        <Grid columns={2} style={{ gap: 16 }}>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Arti warna / What the colours mean</Heading>
            <Text style={{ color: token("colors.muted") }}>
              Status setiap kunjungan dihitung dari tanggal jatuh temponya. / Every visit&apos;s
              status is computed from its due date.
            </Text>
            {(["done", "due-soon", "upcoming", "overdue"] as VisitStatus[]).map((s) => {
              const c = STATUS_COLORS[s];
              return (
                <Row key={s} style={{ gap: 12, alignItems: "center" }}>
                  <Column
                    style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c.color }}
                  />
                  <Column style={{ gap: 0, flex: 1 }}>
                    <Text style={{ fontWeight: 700, fontSize: 13, color: c.dark }}>
                      {s === "done"
                        ? "Selesai / Done"
                        : s === "due-soon"
                          ? "Segera / Due soon — dalam 7 hari / within 7 days"
                          : s === "upcoming"
                            ? "Mendatang / Upcoming"
                            : "Terlambat / Overdue"}
                    </Text>
                    <Text style={{ fontSize: 12, color: token("colors.muted") }}>
                      {s === "done"
                        ? "Vaksin sudah diberikan pada tanggal tercatat."
                        : s === "due-soon"
                          ? "Jatuh tempo minggu ini — segera konfirmasi janji temu."
                          : s === "upcoming"
                            ? "Jadwal mendatang, tanggal sudah dihitung."
                            : "Tanggal jatuh tempo sudah lewat — segera ke klinik."}
                    </Text>
                  </Column>
                </Row>
              );
            })}
            <Text style={{ fontSize: 12, color: token("colors.muted") }}>
              <Span style={{ fontWeight: 700 }}>Catatan / Note:</Span> jadwal bisa sedikit berbeda
              menurut program dan ketersediaan vaksin di tiap daerah — selalu konfirmasikan ke
              dokter atau petugas kesehatan. / Schedules may vary slightly by local programme and
              vaccine availability — always confirm with your doctor or health worker.
            </Text>
          </Column>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Yang dilindungi vaksin berikutnya / What the next vaccines protect</Heading>
            {next ? (
              <ProtectsList visit={next} />
            ) : (
              <Text style={{ color: token("colors.muted") }}>
                Semua vaksin tahun pertama sudah selesai. / All first-year vaccines are done.
              </Text>
            )}
          </Column>
        </Grid>

        {/* ---- Proof strip ---- */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={3}>Satu tanggal lahir, satu jadwal / One birth date, one schedule</Heading>
          <ChildProof data={data} />
        </Column>
      </Section>

      {/* ---- Footer ---- */}
      <Section style={{ padding: [24, 0, 32, 0], gap: 16 }}>
        <Text style={{ fontSize: 13, color: token("colors.muted"), textAlign: "center" }}>
          TUMBUH — pengingat imunisasi tahun pertama · {data.source} · {data.appointment.clinic},{" "}
          {data.appointment.clinicAddress}
        </Text>
        <SampleNote />
      </Section>
    </Page>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(SchedulePage, { PreviewProps: {} });
