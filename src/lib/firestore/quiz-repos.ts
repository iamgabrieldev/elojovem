import {
  FieldValue,
  Timestamp,
  type DocumentData,
} from "firebase-admin/firestore";
import { getAdminDb } from "../firebase-admin";
import type {
  QuizAttemptRecord,
  QuizAttemptSummary,
  QuizQuestion,
  QuizRecord,
} from "../types/domain";
import { dateKey, tsToDate } from "./repos";

export function quizDocId(date: Date): string {
  return `QUIZ_${dateKey(date)}`;
}

function quizFromDoc(id: string, d: DocumentData): QuizRecord {
  const raw = d.questions as unknown[];
  const questions: QuizQuestion[] = (Array.isArray(raw) ? raw : []).map(
    (item) => {
      const q = item as DocumentData;
      return {
        question: String(q.question ?? ""),
        options: [
          String(q.options?.[0] ?? ""),
          String(q.options?.[1] ?? ""),
          String(q.options?.[2] ?? ""),
          String(q.options?.[3] ?? ""),
        ] as [string, string, string, string],
        correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex) || 0)),
        explanation: String(q.explanation ?? ""),
        verseReference: String(q.verseReference ?? ""),
      };
    }
  );

  return {
    id,
    date: tsToDate(d.date),
    questions,
    source: d.source === "SEED" ? "SEED" : "AI_GENERATED",
  };
}

export async function getQuiz(date: Date): Promise<QuizRecord | null> {
  return getQuizByDateKey(dateKey(date));
}

/** Busca por chave de calendário `YYYY-MM-DD` (mesmo formato de `dateKey()`). */
export async function getQuizByDateKey(
  dateKeyStr: string
): Promise<QuizRecord | null> {
  const id = `QUIZ_${dateKeyStr}`;
  const snap = await getAdminDb().collection("quizzes").doc(id).get();
  if (!snap.exists) return null;
  return quizFromDoc(id, snap.data()!);
}

export async function upsertQuizRecord(record: QuizRecord): Promise<void> {
  const ref = getAdminDb().collection("quizzes").doc(record.id);
  await ref.set({
    date: Timestamp.fromDate(record.date),
    questions: record.questions.map((q) => ({
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      verseReference: q.verseReference,
    })),
    source: record.source,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function attemptFromDoc(
  uid: string,
  docId: string,
  d: DocumentData
): QuizAttemptRecord {
  return {
    id: docId,
    userId: uid,
    dateKey: String(d.dateKey ?? docId),
    answers: Array.isArray(d.answers)
      ? d.answers.map((a: unknown) => Number(a))
      : [],
    score: Number(d.score ?? 0),
    completedAt: tsToDate(d.completedAt),
  };
}

export async function getQuizAttempt(
  uid: string,
  dateKeyParam: string
): Promise<QuizAttemptRecord | null> {
  const snap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("quizAttempts")
    .doc(dateKeyParam)
    .get();
  if (!snap.exists) return null;
  return attemptFromDoc(uid, snap.id, snap.data()!);
}

export async function saveQuizAttempt(
  uid: string,
  data: {
    dateKey: string;
    answers: number[];
    score: number;
  }
): Promise<void> {
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("quizAttempts")
    .doc(data.dateKey)
    .set({
      dateKey: data.dateKey,
      answers: data.answers,
      score: data.score,
      completedAt: FieldValue.serverTimestamp(),
    });
}

export async function listRecentQuizAttempts(
  uid: string,
  limitCount = 10
): Promise<QuizAttemptSummary[]> {
  const snap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("quizAttempts")
    .orderBy("completedAt", "desc")
    .limit(limitCount)
    .get();

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      userId: uid,
      dateKey: String(d.dateKey ?? doc.id),
      score: Number(d.score ?? 0),
      completedAt: tsToDate(d.completedAt),
    };
  });
}

/** Conta dias consecutivos com quiz completo até dateKey (inclusive). */
export async function getQuizStreak(uid: string, endDateKey: string): Promise<number> {
  const snap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("quizAttempts")
    .orderBy("dateKey", "desc")
    .limit(60)
    .get();

  const keys = new Set(snap.docs.map((d) => d.id));

  function prevDay(key: string): string {
    const [y, m, d] = key.split("-").map(Number);
    const dt = new Date(Date.UTC(y!, m! - 1, d!));
    dt.setUTCDate(dt.getUTCDate() - 1);
    return dt.toISOString().slice(0, 10);
  }

  let cursor = endDateKey;
  let streak = 0;
  while (keys.has(cursor)) {
    streak += 1;
    cursor = prevDay(cursor);
  }
  return streak;
}
