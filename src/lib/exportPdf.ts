import { jsPDF } from "jspdf";
import { BlockType, LessonPlan, WorksheetQuestion } from "./types";

/**
 * Briefing PDF. The layout mirrors the app's TailAdmin-derived design system:
 * the brand-500 header band, rounded cards, the colour-coded schedule timeline
 * and the warning/brand callouts all use the same palette as LessonPlanView.
 * Helvetica stands in for Outfit (embedding a TTF would bloat the bundle).
 */

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_H - 24;

const C = {
  brand50: "#ecf3ff",
  brand100: "#dde9ff",
  brand200: "#c2d6ff",
  brand500: "#465fff",
  brand700: "#2a31d8",
  white: "#ffffff",
  gray25: "#fcfcfd",
  gray200: "#e4e7ec",
  gray300: "#d0d5dd",
  gray400: "#98a2b3",
  gray500: "#667085",
  gray600: "#475467",
  gray700: "#344054",
  gray800: "#1d2939",
  gray900: "#101828",
  warning50: "#fffaeb",
  warning200: "#fedf89",
  warning500: "#f79009",
  warning700: "#b54708",
  success50: "#ecfdf3",
  success500: "#12b76a",
  blueLight50: "#f0f9ff",
  blueLight500: "#0ba5ec",
};

const BLOCK_ACCENT: Record<BlockType, string> = {
  warmup: C.blueLight500,
  teaching: C.brand500,
  exercise: C.success500,
  wrapup: C.warning500,
};

const BLOCK_TINT: Record<BlockType, string> = {
  warmup: C.blueLight50,
  teaching: C.brand50,
  exercise: C.success50,
  wrapup: C.warning50,
};

const BLOCK_LABEL: Record<BlockType, string> = {
  warmup: "Warm-up",
  teaching: "Teaching",
  exercise: "Exercise",
  wrapup: "Wrap-up",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface TextOpts {
  size?: number;
  bold?: boolean;
  color?: string;
  align?: "left" | "center" | "right";
  charSpace?: number;
}

interface CalloutTone {
  fill: string;
  border: string;
  badge: string;
  text: string;
}

class Pdf {
  doc: jsPDF;
  y = MARGIN;

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.doc.setLineJoin("round");
  }

  /** Opacity-scoped drawing; jsPDF otherwise keeps the GState global. */
  faded(opacity: number, draw: () => void) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = this.doc as any;
    doc.setGState(new doc.GState({ opacity }));
    draw();
    doc.setGState(new doc.GState({ opacity: 1 }));
  }

  text(value: string | string[], x: number, y: number, opts: TextOpts = {}) {
    this.doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    this.doc.setFontSize(opts.size ?? 10);
    this.doc.setTextColor(opts.color ?? C.gray700);
    this.doc.text(value, x, y, {
      align: opts.align ?? "left",
      charSpace: opts.charSpace ?? 0,
    });
  }

  wrap(value: string, width: number, size: number, bold = false): string[] {
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.doc.setFontSize(size);
    return this.doc.splitTextToSize(value || " ", width);
  }

  widthOf(value: string, size: number, bold = false): number {
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.doc.setFontSize(size);
    return this.doc.getTextWidth(value);
  }

  ensureSpace(height: number) {
    if (this.y + height > BOTTOM_LIMIT) this.newPage();
  }

  newPage() {
    this.doc.addPage();
    this.y = MARGIN + 8;
  }

  /** Uppercase eyebrow + hairline: the print echo of the app's card headers. */
  sectionHeading(label: string, hint?: string) {
    this.ensureSpace(18);
    this.doc.setFillColor(C.brand500);
    this.doc.roundedRect(MARGIN, this.y - 3.2, 1.6, 4, 0.8, 0.8, "F");
    this.text(label.toUpperCase(), MARGIN + 5, this.y, {
      size: 9,
      bold: true,
      color: C.gray900,
      charSpace: 0.45,
    });
    if (hint) {
      this.text(hint, PAGE_W - MARGIN, this.y, { size: 8.5, color: C.gray400, align: "right" });
    }
    this.y += 3.4;
    this.doc.setDrawColor(C.gray200);
    this.doc.setLineWidth(0.25);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 7;
  }

  card(height: number, opts: { fill?: string; border?: string; accent?: string } = {}) {
    const { fill = C.white, border = C.gray200, accent } = opts;
    this.doc.setFillColor(fill);
    this.doc.setDrawColor(border);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(MARGIN, this.y, CONTENT_W, height, 3, 3, "FD");
    if (accent) {
      this.doc.setFillColor(accent);
      this.doc.roundedRect(MARGIN + 1.1, this.y + 2.4, 1.4, height - 4.8, 0.7, 0.7, "F");
    }
  }

  /** Rounded chip; returns its width so callers can flow chips in a row. */
  pill(
    label: string,
    x: number,
    y: number,
    opts: {
      fill?: string;
      border?: string;
      color?: string;
      size?: number;
      icon?: (cx: number, cy: number) => void;
    } = {}
  ): number {
    const size = opts.size ?? 8;
    const iconW = opts.icon ? 5 : 0;
    const w = this.widthOf(label, size, true) + 7 + iconW;
    const h = 6.2;
    if (opts.fill) this.doc.setFillColor(opts.fill);
    if (opts.border) {
      this.doc.setDrawColor(opts.border);
      this.doc.setLineWidth(0.3);
    }
    const style = opts.fill && opts.border ? "FD" : opts.fill ? "F" : "D";
    this.doc.roundedRect(x, y - h + 2, w, h, h / 2, h / 2, style);
    if (opts.icon) opts.icon(x + 3.5, y - 1.5);
    this.text(label, x + 3.5 + iconW, y, { size, bold: true, color: opts.color ?? C.gray600 });
    return w;
  }

  /** Small bookmark/ribbon glyph, filled, centred on (cx, cy). */
  bookmarkIcon(cx: number, cy: number, color: string) {
    const w = 2.1, h = 2.6;
    const x = cx - w / 2, y = cy - h / 2;
    this.doc.setFillColor(color);
    this.doc.lines(
      [
        [w, 0],
        [0, h],
        [-w / 2, -h * 0.32],
        [-w / 2, h * 0.32],
      ],
      x,
      y,
      [1, 1],
      "F",
      true
    );
  }

  /** Small lightbulb glyph (bulb + base), filled, centred on (cx, cy). */
  lightbulbIcon(cx: number, cy: number, color: string) {
    this.doc.setFillColor(color);
    this.doc.circle(cx, cy - 0.4, 1.15, "F");
    this.doc.roundedRect(cx - 0.55, cy + 0.55, 1.1, 0.9, 0.25, 0.25, "F");
  }

  /** Vector star — the PDF core fonts have no glyph for U+2605. */
  star(cx: number, cy: number, r: number, filled: boolean) {
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (-90 + i * 36) * (Math.PI / 180);
      const radius = i % 2 === 0 ? r : r * 0.46;
      pts.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
    }
    const deltas = pts
      .slice(1)
      .map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]] as [number, number]);
    if (filled) {
      this.doc.setFillColor(C.warning500);
      this.doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], "F", true);
    } else {
      this.doc.setDrawColor(C.gray300);
      this.doc.setLineWidth(0.25);
      this.doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], "S", true);
    }
  }

  stars(count: number, x: number, cy: number) {
    for (let i = 0; i < 4; i++) this.star(x + i * 4, cy, 1.7, i < count);
  }
}

/* ---------------------------------------------------------------- header */

/** Fetches the app's actual logo mark and returns it as a PNG data URI. */
async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/logo-mark.png");
    const buf = await res.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return `data:image/png;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

function header(pdf: Pdf, plan: LessonPlan, logoDataUrl: string | null): number {
  const { doc } = pdf;
  const titleLines = pdf.wrap(plan.request.topic, CONTENT_W - 6, 21, true);
  const titleTop = 40;
  const pillY = titleTop + titleLines.length * 8.4 + 2;
  const bandH = pillY + 12;

  doc.setFillColor(C.brand500);
  doc.rect(0, 0, PAGE_W, bandH, "F");
  pdf.faded(0.16, () => {
    doc.setFillColor(C.white);
    doc.circle(PAGE_W - 14, 12, 26, "F");
    doc.circle(PAGE_W - 46, bandH - 4, 16, "F");
  });

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", MARGIN, 13, 11, 11, undefined, "FAST");
  }
  pdf.text("Alice", MARGIN + 15, 18.6, { size: 10.5, bold: true, color: C.white });
  pdf.text("AI TEACHING COPILOT", MARGIN + 15, 23, {
    size: 6.8,
    color: C.brand200,
    charSpace: 0.5,
  });
  pdf.text("LESSON BRIEFING", PAGE_W - MARGIN, 18.6, {
    size: 7.5,
    bold: true,
    color: C.brand100,
    align: "right",
    charSpace: 0.6,
  });
  pdf.text(formatDate(plan.createdAt), PAGE_W - MARGIN, 23, {
    size: 8,
    color: C.brand200,
    align: "right",
  });

  pdf.text(titleLines, MARGIN, titleTop, { size: 21, bold: true, color: C.white });

  const metas = [
    `Age ${plan.request.age}`,
    `${plan.durationMinutes} min`,
    `${plan.schedule.length} segments`,
    `${plan.worksheet.questions.length + plan.homework.questions.length} questions`,
  ];
  let x = MARGIN;
  metas.forEach((label) => {
    pdf.faded(0.85, () => {
      x += pdf.pill(label, x, pillY, { border: C.brand200, color: C.white }) + 4;
    });
  });

  return bandH;
}

/* -------------------------------------------------------------- sections */

function noteCallout(pdf: Pdf, notes: string) {
  const lines = pdf.wrap(notes, CONTENT_W - 16, 9.5);
  const h = lines.length * 4.8 + 13;
  pdf.ensureSpace(h + 6);
  pdf.card(h, { fill: C.gray25, accent: C.brand500 });
  pdf.text("TEACHER NOTES", MARGIN + 8, pdf.y + 7, {
    size: 7.5,
    bold: true,
    color: C.gray500,
    charSpace: 0.4,
  });
  pdf.text(lines, MARGIN + 8, pdf.y + 12.5, { size: 9.5, color: C.gray700 });
  pdf.y += h + 8;
}

function objectivesSection(pdf: Pdf, items: string[]) {
  pdf.sectionHeading("Learning objectives", `${items.length} total`);
  items.forEach((item, i) => {
    const lines = pdf.wrap(item, CONTENT_W - 12, 10);
    const h = lines.length * 5 + 2;
    pdf.ensureSpace(h);
    pdf.doc.setFillColor(C.brand50);
    pdf.doc.circle(MARGIN + 2.6, pdf.y - 1.4, 2.6, "F");
    pdf.text(String(i + 1), MARGIN + 2.6, pdf.y - 0.1, {
      size: 7,
      bold: true,
      color: C.brand700,
      align: "center",
    });
    pdf.text(lines, MARGIN + 9, pdf.y, { size: 10, color: C.gray700 });
    pdf.y += h;
  });
  pdf.y += 6;
}

function vocabularySection(pdf: Pdf, terms: string[]) {
  pdf.sectionHeading("Key vocabulary", `${terms.length} terms`);
  pdf.ensureSpace(9);
  let x = MARGIN;
  terms.forEach((term) => {
    const w = pdf.widthOf(term, 8.5, true) + 7;
    if (x > MARGIN && x + w > PAGE_W - MARGIN) {
      x = MARGIN;
      pdf.y += 9;
      pdf.ensureSpace(9);
    }
    pdf.pill(term, x, pdf.y, {
      fill: C.brand50,
      border: C.brand100,
      color: C.brand700,
      size: 8.5,
    });
    x += w + 3;
  });
  pdf.y += 12;
}

interface ScheduleMetrics {
  titleSize: number;
  descSize: number;
  titleLineH: number;
  descLineH: number;
  pad: number;
  gap: number;
  minH: number;
  labelSize: number;
  timeSize: number;
}

function scheduleMetrics(scale: number): ScheduleMetrics {
  return {
    titleSize: 10.5 * scale,
    descSize: 9.5 * scale,
    titleLineH: 5.2 * scale,
    descLineH: 4.6 * scale,
    pad: 12 * scale,
    gap: 4 * scale,
    minH: 20 * scale,
    labelSize: Math.max(6, 7.5 * scale),
    timeSize: Math.max(7.5, 10 * scale),
  };
}

/**
 * Every metric scales fully proportionally, so `available / naturalTotal`
 * is a good first estimate; a couple of refinement passes correct for
 * re-wrapping at the smaller font (which usually needs a bit less, not more).
 */
function solveScale(
  naturalTotal: number,
  available: number,
  minScale: number,
  totalAt: (scale: number) => number
): number {
  if (naturalTotal <= available) return 1;
  let scale = Math.max(minScale, available / naturalTotal);
  for (let i = 0; i < 3; i++) {
    const total = totalAt(scale);
    if (total <= available || scale <= minScale) break;
    scale = Math.max(minScale, scale * (available / total));
  }
  return scale;
}

function scheduleBlockHeight(
  pdf: Pdf,
  block: LessonPlan["schedule"][number],
  bodyW: number,
  m: ScheduleMetrics
): number {
  const titleLines = pdf.wrap(block.title, bodyW, m.titleSize, true);
  const descLines = pdf.wrap(block.description, bodyW, m.descSize);
  return Math.max(
    m.minH,
    titleLines.length * m.titleLineH + descLines.length * m.descLineH + m.pad
  );
}

function scheduleTotalHeight(pdf: Pdf, plan: LessonPlan, bodyW: number, scale: number): number {
  const m = scheduleMetrics(scale);
  return plan.schedule.reduce(
    (sum, block) => sum + scheduleBlockHeight(pdf, block, bodyW, m) + m.gap,
    0
  );
}

/**
 * Fits the whole lesson-flow timeline into the space left on the page it
 * starts on: scales fonts/padding down (never below 55%) rather than
 * spilling a page break in the middle of the schedule.
 */
function scheduleSection(pdf: Pdf, plan: LessonPlan) {
  const headingFootprint = 14.4;
  const bodyX = MARGIN + 30;
  const bodyW = PAGE_W - MARGIN - 6 - bodyX;
  const available = BOTTOM_LIMIT - pdf.y - headingFootprint;

  const naturalTotal = scheduleTotalHeight(pdf, plan, bodyW, 1);
  const scale = solveScale(naturalTotal, available, 0.55, (s) =>
    scheduleTotalHeight(pdf, plan, bodyW, s)
  );
  const m = scheduleMetrics(scale);

  pdf.sectionHeading("Lesson flow", `${plan.durationMinutes} minutes`);
  plan.schedule.forEach((block) => {
    const titleLines = pdf.wrap(block.title, bodyW, m.titleSize, true);
    const descLines = pdf.wrap(block.description, bodyW, m.descSize);
    const h = Math.max(
      m.minH,
      titleLines.length * m.titleLineH + descLines.length * m.descLineH + m.pad
    );
    pdf.ensureSpace(h + m.gap);

    pdf.card(h, {
      fill: BLOCK_TINT[block.type],
      border: C.gray200,
      accent: BLOCK_ACCENT[block.type],
    });

    pdf.doc.setFillColor(BLOCK_ACCENT[block.type]);
    pdf.doc.circle(MARGIN + 7.5, pdf.y + 6.6, 0.9, "F");
    pdf.text(BLOCK_LABEL[block.type], MARGIN + 10, pdf.y + 7.2, {
      size: m.labelSize,
      bold: true,
      color: C.gray600,
      charSpace: 0.3,
    });
    pdf.text(`${block.startMinute}–${block.endMinute} min`, MARGIN + 7, pdf.y + 7.2 + m.timeSize * 0.62 + 3.4, {
      size: m.timeSize,
      bold: true,
      color: C.gray900,
    });

    let ty = pdf.y + m.pad / 2 + m.titleLineH * 0.7;
    pdf.text(titleLines, bodyX, ty, { size: m.titleSize, bold: true, color: C.gray900 });
    ty += titleLines.length * m.titleLineH + 1;
    pdf.text(descLines, bodyX, ty, { size: m.descSize, color: C.gray600 });

    pdf.y += h + m.gap;
  });
  pdf.y += Math.max(2, 4 * scale);
}

function pageBanner(pdf: Pdf, title: string, subtitle: string) {
  const { doc } = pdf;
  const h = 18;
  doc.setFillColor(C.gray900);
  doc.roundedRect(MARGIN, pdf.y, CONTENT_W, h, 3, 3, "F");
  pdf.text(title.toUpperCase(), MARGIN + 7, pdf.y + 11.4, {
    size: 10,
    bold: true,
    color: C.white,
    charSpace: 0.6,
  });
  pdf.text(subtitle, PAGE_W - MARGIN - 7, pdf.y + 11.4, {
    size: 8.5,
    color: C.gray400,
    align: "right",
  });
  pdf.y += h + 9;
}

interface QuestionMetrics {
  promptSize: number;
  promptLineH: number;
  lineGap: number;
  pad: number;
  gap: number;
  badgeR: number;
}

function questionMetrics(scale: number): QuestionMetrics {
  return {
    promptSize: Math.max(6.5, 10 * scale),
    promptLineH: 5 * scale,
    lineGap: Math.max(3.2, 5.6 * scale),
    pad: 14 * scale,
    gap: 4 * scale,
    badgeR: Math.max(2, 3.1 * scale),
  };
}

function questionCardHeight(
  pdf: Pdf,
  q: WorksheetQuestion,
  innerW: number,
  m: QuestionMetrics
): number {
  const promptLines = pdf.wrap(q.prompt, innerW - 16, m.promptSize);
  const answerH = q.responseLines * m.lineGap + 3;
  return promptLines.length * m.promptLineH + answerH + m.pad;
}

function questionCard(pdf: Pdf, q: WorksheetQuestion, index: number, m: QuestionMetrics) {
  const innerX = MARGIN + 9;
  const innerW = CONTENT_W - 18;
  const promptLines = pdf.wrap(q.prompt, innerW - 16, m.promptSize);
  const h = questionCardHeight(pdf, q, innerW, m);
  pdf.ensureSpace(h + m.gap);

  pdf.card(h, { fill: C.white, border: C.gray200 });

  const badgeCy = pdf.y + m.pad / 2 + m.badgeR;
  pdf.doc.setFillColor(C.brand500);
  pdf.doc.circle(innerX + 1.5, badgeCy, m.badgeR, "F");
  pdf.text(String(index + 1), innerX + 1.5, badgeCy + 1.1, {
    size: Math.max(6, 7.5 * (m.badgeR / 3.1)),
    bold: true,
    color: C.white,
    align: "center",
  });
  pdf.stars(q.stars, innerX + 8, badgeCy);

  const promptTop = badgeCy + m.badgeR + 4;
  pdf.text(promptLines, innerX + 8, promptTop, { size: m.promptSize, color: C.gray800 });

  const top = promptTop + promptLines.length * m.promptLineH + 1;
  pdf.doc.setDrawColor(C.gray200);
  pdf.doc.setLineWidth(0.25);
  pdf.doc.setLineDashPattern([0.7, 1.3], 0);
  for (let i = 0; i < q.responseLines; i++) {
    const ly = top + i * m.lineGap;
    pdf.doc.line(innerX + 8, ly, MARGIN + innerW, ly);
  }
  pdf.doc.setLineDashPattern([], 0);

  pdf.y += h + m.gap;
}

function calloutHeight(pdf: Pdf, items: string[]): number {
  if (items.length === 0) return 0;
  const wrapped = items.map((item) => pdf.wrap(item, CONTENT_W - 22, 9.5));
  const bodyH = wrapped.reduce((sum, lines) => sum + lines.length * 4.8 + 1.6, 0);
  return bodyH + 18;
}

function calloutList(pdf: Pdf, label: string, items: string[], tone: CalloutTone) {
  const wrapped = items.map((item) => pdf.wrap(item, CONTENT_W - 22, 9.5));
  const h = calloutHeight(pdf, items);
  pdf.ensureSpace(h + 4);

  const icon =
    label.toLowerCase() === "remember"
      ? (cx: number, cy: number) => pdf.bookmarkIcon(cx, cy, C.white)
      : (cx: number, cy: number) => pdf.lightbulbIcon(cx, cy, C.white);

  pdf.card(h, { fill: tone.fill, border: tone.border });
  pdf.pill(label.toUpperCase(), MARGIN + 7, pdf.y + 9, {
    fill: tone.badge,
    color: C.white,
    size: 7.5,
    icon,
  });

  let ty = pdf.y + 16;
  wrapped.forEach((lines) => {
    pdf.doc.setFillColor(tone.badge);
    pdf.doc.circle(MARGIN + 9, ty - 1.3, 0.7, "F");
    pdf.text(lines, MARGIN + 12.5, ty, { size: 9.5, color: tone.text });
    ty += lines.length * 4.8 + 1.6;
  });

  pdf.y += h + 6;
}

/**
 * Renders one questionsPage's worth of questions + callout, scaling question
 * card fonts/spacing down (never below ~65%) so the whole set lands on a
 * single page rather than spilling a couple of cards onto a near-empty one.
 */
function questionsPage(
  pdf: Pdf,
  plan: LessonPlan,
  title: string,
  questions: WorksheetQuestion[],
  callout: { label: string; items: string[]; tone: CalloutTone }
) {
  pdf.doc.addPage();
  pdf.y = MARGIN;
  pageBanner(pdf, title, `${plan.request.topic} · Age ${plan.request.age}`);

  pdf.doc.setDrawColor(C.gray300);
  pdf.doc.setLineWidth(0.25);
  pdf.text("Name", MARGIN, pdf.y, { size: 9, bold: true, color: C.gray500 });
  pdf.doc.line(MARGIN + 12, pdf.y + 0.8, MARGIN + 78, pdf.y + 0.8);
  pdf.text("Class", MARGIN + 92, pdf.y, { size: 9, bold: true, color: C.gray500 });
  pdf.doc.line(MARGIN + 105, pdf.y + 0.8, PAGE_W - MARGIN, pdf.y + 0.8);
  pdf.y += 10;

  pdf.sectionHeading("Questions", `${questions.length} · difficulty out of 4`);

  const innerW = CONTENT_W - 18;
  const calloutH = calloutHeight(pdf, callout.items) + (callout.items.length > 0 ? 8 : 0);
  const available = BOTTOM_LIMIT - pdf.y - calloutH;

  const totalAt = (s: number) =>
    questions.reduce((sum, q) => {
      const qm = questionMetrics(s);
      return sum + questionCardHeight(pdf, q, innerW, qm) + qm.gap;
    }, 0);
  const naturalTotal = totalAt(1);
  const scale = solveScale(naturalTotal, available, 0.55, totalAt);
  const m = questionMetrics(scale);

  questions.forEach((q, i) => questionCard(pdf, q, i, m));

  pdf.y += Math.max(1, 2 * scale);
  if (callout.items.length > 0) {
    calloutList(pdf, callout.label, callout.items, callout.tone);
  }
}

function footer(pdf: Pdf, plan: LessonPlan) {
  const { doc } = pdf;
  const pages = doc.getNumberOfPages();
  const topic = pdf.wrap(plan.request.topic, CONTENT_W - 30, 7.5)[0];
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(C.gray200);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, PAGE_H - 15, PAGE_W - MARGIN, PAGE_H - 15);
    doc.setFillColor(C.brand500);
    doc.circle(MARGIN + 1.1, PAGE_H - 10.6, 1.1, "F");
    pdf.text(`Alice · ${topic}`, MARGIN + 4.5, PAGE_H - 10, {
      size: 7.5,
      color: C.gray400,
    });
    pdf.text(`${i} / ${pages}`, PAGE_W - MARGIN, PAGE_H - 10, {
      size: 7.5,
      bold: true,
      color: C.gray400,
      align: "right",
    });
  }
}

export async function buildBriefingPdf(plan: LessonPlan): Promise<jsPDF> {
  const pdf = new Pdf();
  const logoDataUrl = await loadLogoDataUrl();

  pdf.y = header(pdf, plan, logoDataUrl) + 12;
  if (plan.request.notes) noteCallout(pdf, plan.request.notes);
  objectivesSection(pdf, plan.objectives);
  vocabularySection(pdf, plan.vocabulary);
  scheduleSection(pdf, plan);

  questionsPage(pdf, plan, "Worksheet", plan.worksheet.questions, {
    label: "Remember",
    items: plan.worksheet.remember,
    tone: { fill: C.warning50, border: C.warning200, badge: C.warning500, text: C.warning700 },
  });

  questionsPage(pdf, plan, "Homework", plan.homework.questions, {
    label: "Hints",
    items: plan.homework.hints,
    tone: { fill: C.brand50, border: C.brand100, badge: C.brand500, text: C.brand700 },
  });

  footer(pdf, plan);

  pdf.doc.setProperties({
    title: `${plan.request.topic} - Lesson briefing`,
    subject: `Lesson plan for age ${plan.request.age}`,
    creator: "Alice - AI Teaching Copilot",
  });

  return pdf.doc;
}

function safeTopicName(plan: LessonPlan): string {
  return plan.request.topic.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "lesson";
}

export async function downloadBriefingPdf(plan: LessonPlan) {
  const doc = await buildBriefingPdf(plan);
  doc.save(`${safeTopicName(plan)}-briefing.pdf`);
}
