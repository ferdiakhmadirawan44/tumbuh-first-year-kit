// ---------------------------------------------------------------------------
// TUMBUH — Reminder Card (Canvas, 1200 × 630)
// The share card: one glance, one countdown. It is built to be forwarded
// on WhatsApp and social media — the next vaccine, when it is due, where
// to go, how to confirm, and the child ID that ties it to the email, the
// page and the appointment card. All visuals are drawn in code (SVG sun,
// timeline, warm colours); there are no image assets. Warm cream and
// terracotta on purpose — this is a baby's first year, not an emergency.
// ---------------------------------------------------------------------------

import { Canvas, Circle, Column, Path, Row, Svg, Text } from "@hyper-elements/react";
import {
  childId,
  countdownLabel,
  defaultData,
  formatDateId,
  nextVisit,
  parseDate,
  type TumbuhData,
} from "./data.js";
import { ChildBadge, VisitTimelineSvg } from "./shared.js";
import { C, MONO_FONT, PRINT_FONT, PRINT_FONTS, tumbuhTheme } from "./theme.js";

export interface ReminderCardProps {
  data?: TumbuhData;
}

function ReminderCard({ data = defaultData }: ReminderCardProps) {
  const baby = data.baby;
  const next = nextVisit(data);
  const count = next ? countdownLabel(data, next) : { id: "—", en: "—" };
  const appt = data.appointment;
  const due = parseDate(appt.dateIso);
  return (
    <Canvas
      theme={tumbuhTheme}
      fonts={PRINT_FONTS}
      title={`TUMBUH — Vaksin ${next?.ageLabelId ?? ""} ${count.id.toLowerCase()} · ${baby.firstName}`}
      width={1200}
      height={630}
      lang="id"
      style={{ backgroundColor: C.page, fontFamily: PRINT_FONT, gap: 0 }}
    >
      {/* ---- Top: brand + child ---- */}
      <Column style={{ padding: [36, 48, 0, 48], gap: 12 }}>
        <Row style={{ gap: 16, alignItems: "center" }}>
          <Svg width={40} height={40} viewBox="0 0 40 40" title="Sun">
            <Circle cx={20} cy={20} r={16} style={{ fill: C.sun }} />
          </Svg>
          <Text style={{ color: C.terraDark, fontSize: 30, fontWeight: 800, letterSpacing: 4 }}>
            TUMBUH
          </Text>
          <ChildBadge data={data} />
          <Text
            style={{
              color: C.muted,
              fontSize: 14,
              fontFamily: MONO_FONT,
              flex: 1,
              textAlign: "right",
            }}
          >
            {baby.birthDateLabelId}
          </Text>
        </Row>

        {/* ---- The countdown ---- */}
        <Text
          style={{
            color: C.terraDark,
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: 2,
          }}
        >
          {count.id.toUpperCase()}
        </Text>
        <Text style={{ color: C.ink, fontSize: 30, fontWeight: 800 }}>
          {count.en} · Vaksin {next?.ageLabelId ?? ""} / {next?.ageLabelEn ?? ""} vaccines
        </Text>
        <Text style={{ color: C.ink, fontSize: 20, fontWeight: 700 }}>
          {next ? next.doses.map((d) => d.name).join(" · ") : "—"}
        </Text>
        <Text style={{ color: C.muted, fontSize: 18 }}>
          {formatDateId(due)} · {appt.time} · {appt.clinic}, {appt.clinicAddress}
        </Text>

        {/* ---- Timeline strip ---- */}
        <VisitTimelineSvg data={data} width={1104} height={84} />
      </Column>

      {/* ---- Hills divider into the dark band ---- */}
      <Svg width={1200} height={44} viewBox="0 0 1200 44" title="Hills">
        <Path
          d="M0,22 Q150,4 300,22 T600,22 T900,22 T1200,22 L1200,44 L0,44 Z"
          style={{ fill: C.ink }}
        />
      </Svg>

      {/* ---- Bottom band: confirm + proof ---- */}
      <Column style={{ backgroundColor: C.ink, padding: [8, 48, 32, 48], gap: 8 }}>
        <Row style={{ gap: 32 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 800, flex: 1 }}>
            Konfirmasi / Confirm: {appt.confirmUrl.replace("https://", "")}
          </Text>
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 800 }}>
            Status: Menunggu konfirmasi / Awaiting
          </Text>
        </Row>
        <Text style={{ color: "#D8CFC8", fontSize: 13, fontFamily: MONO_FONT }}>
          Child ID {childId(data.baby.birthDateIso)} · {baby.fullName} · Jadwal: {data.source}
        </Text>
      </Column>
    </Canvas>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(ReminderCard, { PreviewProps: {} });
