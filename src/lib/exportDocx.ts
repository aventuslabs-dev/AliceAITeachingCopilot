import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { LessonPlan, WorksheetQuestion } from "./types";

function starsLabel(stars: number): string {
  return "★".repeat(stars) + "☆".repeat(4 - stars);
}

const BASE_SIZE = 26; // 13pt
const TITLE_SIZE = 32; // 16pt
const SUBTITLE_SIZE = 28; // 14pt
const HEADING_SIZE = 28; // 14pt

function buildHeader(plan: LessonPlan, subtitle: string): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: plan.request.topic.toUpperCase(),
          bold: true,
          size: TITLE_SIZE,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: subtitle, size: SUBTITLE_SIZE })],
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({ text: "Name: ______________________        ", size: BASE_SIZE }),
        new TextRun({ text: "Class: ______________________", size: BASE_SIZE }),
      ],
    }),
  ];
}

function buildQuestionParagraphs(questions: WorksheetQuestion[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  questions.forEach((q, i) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 200 },
        children: [
          new TextRun({ text: `Question ${i + 1}  `, bold: true, size: HEADING_SIZE }),
          new TextRun({ text: starsLabel(q.stars), size: HEADING_SIZE }),
        ],
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: q.prompt, size: BASE_SIZE })],
      })
    );
    for (let line = 0; line < q.responseLines; line++) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 200 },
          border: { bottom: { color: "999999", space: 1, style: "single", size: 4 } },
          children: [new TextRun({ text: " ", size: BASE_SIZE })],
        })
      );
    }
  });
  return paragraphs;
}

function buildNoteParagraphs(heading: string, items: string[]): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 300 },
      children: [new TextRun({ text: heading, bold: true, size: HEADING_SIZE })],
    }),
    ...items.map(
      (item) =>
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: item, size: BASE_SIZE })],
        })
    ),
  ];
}

const docStyles = {
  default: {
    document: {
      run: { size: BASE_SIZE },
    },
  },
};

export function buildWorksheetDoc(plan: LessonPlan): Document {
  return new Document({
    styles: docStyles,
    sections: [
      {
        children: [
          ...buildHeader(plan, "Worksheet"),
          ...buildQuestionParagraphs(plan.worksheet.questions),
          ...buildNoteParagraphs("🧠 Remember", plan.worksheet.remember),
        ],
      },
    ],
  });
}

export function buildHomeworkDoc(plan: LessonPlan): Document {
  return new Document({
    styles: docStyles,
    sections: [
      {
        children: [
          ...buildHeader(plan, "Homework"),
          ...buildQuestionParagraphs(plan.homework.questions),
          ...buildNoteParagraphs("💡 Hints", plan.homework.hints),
        ],
      },
    ],
  });
}

async function downloadDoc(doc: Document, filename: string) {
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeTopicName(plan: LessonPlan): string {
  return plan.request.topic.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "lesson";
}

export async function downloadWorksheetDocx(plan: LessonPlan) {
  await downloadDoc(buildWorksheetDoc(plan), `${safeTopicName(plan)}-worksheet.docx`);
}

export async function downloadHomeworkDocx(plan: LessonPlan) {
  await downloadDoc(buildHomeworkDoc(plan), `${safeTopicName(plan)}-homework.docx`);
}
