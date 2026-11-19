// ---------------------------------------------------------------------------
// TUMBUH — Birth Email
// The email a parent receives: a birth announcement and the first vaccine
// reminder, in Indonesian + English, from the same data. The next
// appointment, its countdown and its confirmation status are all derived
// from the birth date — so the email can never disagree with the page,
// the appointment card or the reminder that carry the same child ID.
// ---------------------------------------------------------------------------

import {
  Button,
  Column,
  Divider,
  Email,
  Heading,
  MergeTag,
  Menu,
  Row,
  Section,
  Span,
  Text,
  token,
} from "@hyper-elements/react";
import {
  countdownLabel,
  defaultData,
  dueDate,
  formatDateId,
  nextVisit,
  type TumbuhData,
} from "./data.js";
import {
  AgeLine,
  AppointmentBlock,
  Bi,
  ChildBadge,
  ChildProof,
  ProtectsList,
  SampleNote,
  VisitBars,
} from "./shared.js";
import { C, MONO_FONT, tumbuhTheme } from "./theme.js";

export interface BirthEmailProps {
  data?: TumbuhData;
}

function BirthEmail({ data = defaultData }: BirthEmailProps) {
  const baby = data.baby;
  const next = nextVisit(data);
  const count = next ? countdownLabel(data, next) : { id: "—", en: "—" };
  return (
    <Email
      theme={tumbuhTheme}
      title={`Selamat datang, ${baby.firstName}! — Vaksin ${next?.ageLabelId ?? ""} ${count.id.toLowerCase()} / Welcome, ${baby.firstName}!`}
      previewText={`Selamat datang, ${baby.firstName}! Vaksin ${next?.ageLabelId ?? ""} jatuh tempo ${count.id.toLowerCase()} — ${next?.doses.map((d) => d.name).join(", ") ?? ""}.`}
      lang="id"
      style={{ gap: 0 }}
    >
      {/* ---- Masthead: warm terracotta band ---- */}
      <Section
        tokens={{ colors: { background: C.terraDark, foreground: "#FFFFFF" } }}
        style={{ backgroundColor: C.terraDark, padding: [28, 0, 24, 0], gap: 16 }}
      >
        <Row style={{ gap: 14, alignItems: "center" }}>
          <Column style={{ gap: 2 }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: 3,
              }}
            >
              TUMBUH
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
              Tahun Pertama Bayi · Baby&apos;s First Year
            </Text>
          </Column>
        </Row>
        <Divider style={{ borderTop: { width: 1, style: "solid", color: "#FFFFFF" } }} />
        <Row style={{ gap: 16, alignItems: "center" }}>
          <ChildBadge data={data} />
          <Text style={{ color: "#FFFFFF", fontSize: 12, fontFamily: MONO_FONT, flex: 1 }}>
            Lahir / Born {baby.birthDateLabelId}
          </Text>
        </Row>
      </Section>

      {/* ---- Body ---- */}
      <Section style={{ padding: [24, 0, 8, 0], gap: 24 }}>
        {/* Hero: welcome */}
        <Column style={{ apply: ["card"] }}>
          <Text
            style={{
              fontSize: 12,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: token("colors.muted"),
            }}
          >
            Pengumuman kelahiran · Birth announcement
          </Text>
          <Heading level={1}>Selamat datang, {baby.firstName}! / Welcome, {baby.firstName}!</Heading>
          <Text>
            Halo, <MergeTag name="first_name" /> — <Span style={{ fontWeight: 700 }}>{baby.fullName}</Span>{" "}
            lahir pada <Span style={{ fontWeight: 700 }}>{baby.birthDateLabelId}</Span> pukul{" "}
            <Span style={{ fontWeight: 700 }}>{baby.birthTime}</Span>, dengan berat{" "}
            <Span style={{ fontWeight: 700 }}>{baby.birthWeight}</Span> dan panjang{" "}
            <Span style={{ fontWeight: 700 }}>{baby.birthLength}</Span>. /{" "}
            <Span style={{ fontWeight: 700 }}>{baby.fullName}</Span> was born on{" "}
            <Span style={{ fontWeight: 700 }}>{baby.birthDateLabelEn}</Span> at{" "}
            <Span style={{ fontWeight: 700 }}>{baby.birthTime}</Span>, weighing{" "}
            <Span style={{ fontWeight: 700 }}>{baby.birthWeight}</Span> and{" "}
            <Span style={{ fontWeight: 700 }}>{baby.birthLength}</Span> long.
          </Text>
          <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
          <AgeLine data={data} />
        </Column>

        {/* Next vaccine */}
        {next && (
          <Column style={{ apply: ["card"] }}>
            <Bi id="Vaksin berikutnya" en="Next vaccine" size={12} bold />
            <Heading level={2}>
              Vaksin {next.ageLabelId} — {count.id} · {next.ageLabelEn} vaccines — {count.en}
            </Heading>
            <Text style={{ color: token("colors.muted") }}>
              {next.doses.map((d) => d.name).join(" · ")} — jatuh tempo / due{" "}
              {formatDateId(dueDate(data, next))}. Satu kunjungan, empat perlindungan sekaligus. /
              One visit, four protections at once.
            </Text>
            <AppointmentBlock data={data} />
          </Column>
        )}

        {/* The first year at a glance */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Tahun pertama sekilas / The first year at a glance</Heading>
          <Text style={{ color: token("colors.muted") }}>
            {data.visits.length} kunjungan,{" "}
            {data.visits.reduce((n, v) => n + v.doses.length, 0)} dosis — semuanya dihitung dari
            tanggal lahir {baby.firstName}. / {data.visits.length} visits,{" "}
            {data.visits.reduce((n, v) => n + v.doses.length, 0)} doses — all computed from{" "}
            {baby.firstName}&apos;s birth date.
          </Text>
          <VisitBars data={data} />
        </Column>

        {/* What the next vaccines protect against */}
        {next && (
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Apa yang dilindungi vaksin ini / What these vaccines protect against</Heading>
            <ProtectsList visit={next} />
            <Text style={{ fontSize: 12, color: token("colors.muted") }}>
              * JE (Japanese Encephalitis) hanya diberikan di daerah endemis. / JE (Japanese
              Encephalitis) is given in endemic areas only.
            </Text>
          </Column>
        )}

        {/* Proof strip */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={3}>Satu tanggal lahir, satu jadwal / One birth date, one schedule</Heading>
          <ChildProof data={data} />
          <Button href={data.appointment.confirmUrl}>
            Konfirmasi Janji Temu / Confirm Appointment
          </Button>
        </Column>
      </Section>

      {/* ---- Footer ---- */}
      <Section style={{ padding: [24, 0, 32, 0], gap: 24 }}>
        <Menu
          items={[
            { text: "Jadwal lengkap / Full schedule", href: `https://example.com/tumbuh/${data.baby.birthDateIso}` },
            { text: "Kartu janji temu (PDF) / Appointment card (PDF)", href: `https://example.com/tumbuh/${data.baby.birthDateIso}/card.pdf` },
            { text: "Berhenti berlangganan / Unsubscribe", href: "https://example.com/unsubscribe" },
          ]}
          separator="·"
          style={{ fontSize: 13, color: token("colors.muted") }}
        />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          TUMBUH — pengingat imunisasi tahun pertama, dari {data.source}. Anda menerima email ini
          karena terdaftar di program imunisasi {data.appointment.clinic}. / TUMBUH — first-year
          immunisation reminders, from {data.source}.
        </Text>
        <SampleNote />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          {data.appointment.clinic} · {data.appointment.clinicAddress}
        </Text>
      </Section>
    </Email>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(BirthEmail, { PreviewProps: {} });
