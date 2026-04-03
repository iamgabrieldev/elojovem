import {
  FieldValue,
  Timestamp,
  type DocumentData,
} from "firebase-admin/firestore";
import { getAdminDb } from "../firebase-admin";
import type {
  ChatMessageRecord,
  DevotionalRecord,
  DevotionalSource,
  GoalType,
  HabitType,
  PrayerRecord,
  ReflectionRecord,
  Tradition,
  UserProfile,
} from "../types/domain";

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function devotionalDocId(tradition: Tradition, date: Date): string {
  return `${tradition}_${dateKey(date)}`;
}

export function tsToDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  if (typeof v === "string") return new Date(v);
  return new Date(0);
}

export function devotionalFromDoc(
  id: string,
  d: DocumentData
): DevotionalRecord {
  return {
    id,
    tradition: d.tradition as Tradition,
    summary: String(d.summary ?? ""),
    verse: String(d.verse ?? ""),
    verseReference: String(d.verseReference ?? ""),
    reflection: String(d.reflection ?? ""),
    prayer: String(d.prayer ?? ""),
    practicalSteps: String(d.practicalSteps ?? ""),
    promise: String(d.promise ?? ""),
    promiseReference: String(d.promiseReference ?? ""),
    date: tsToDate(d.date),
    source: d.source as DevotionalSource,
    structuredContent: d.structuredContent,
  };
}

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getAdminDb().collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  return {
    id: uid,
    email: String(d.email ?? ""),
    name: d.name ?? null,
    image: d.image ?? null,
    tradition: (d.tradition as Tradition) ?? null,
    dailyTime: typeof d.dailyTime === "number" ? d.dailyTime : 10,
    goals: Array.isArray(d.goals) ? (d.goals as GoalType[]) : [],
    onboardingCompleted: Boolean(d.onboardingCompleted),
    requiresPaymentCompletion: Boolean(d.requiresPaymentCompletion),
    paymentCompleted: Boolean(d.paymentCompleted),
    abacateBillingId: d.abacateBillingId ?? null,
    cellphone: d.cellphone ?? null,
    taxId: d.taxId ?? null,
    createdAt: tsToDate(d.createdAt),
    updatedAt: tsToDate(d.updatedAt),
  };
}

export async function updateUser(
  uid: string,
  data: Record<string, unknown>
): Promise<void> {
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function getDevotional(
  tradition: Tradition,
  date: Date
): Promise<DevotionalRecord | null> {
  const id = devotionalDocId(tradition, date);
  const snap = await getAdminDb().collection("devotionals").doc(id).get();
  if (!snap.exists) return null;
  return devotionalFromDoc(id, snap.data()!);
}

export async function upsertDevotionalRecord(
  record: DevotionalRecord
): Promise<void> {
  const ref = getAdminDb().collection("devotionals").doc(record.id);
  await ref.set({
    tradition: record.tradition,
    summary: record.summary,
    verse: record.verse,
    verseReference: record.verseReference,
    reflection: record.reflection,
    prayer: record.prayer,
    practicalSteps: record.practicalSteps,
    promise: record.promise,
    promiseReference: record.promiseReference,
    date: Timestamp.fromDate(record.date),
    source: record.source,
    structuredContent: record.structuredContent ?? null,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getHabitLogsForDate(
  uid: string,
  date: Date
): Promise<{ habitType: HabitType; dateKey: string; completed: boolean }[]> {
  const key = dateKey(date);
  const snap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("habitLogs")
    .where("dateKey", "==", key)
    .get();
  return snap.docs
    .map((doc) => {
      const h = doc.data();
      return {
        habitType: h.habitType as HabitType,
        dateKey: String(h.dateKey),
        completed: Boolean(h.completed),
      };
    })
    .filter((h) => h.completed);
}

export async function toggleHabitLog(
  uid: string,
  habitType: HabitType,
  date: Date
): Promise<void> {
  const key = dateKey(date);
  const docId = `${habitType}_${key}`;
  const ref = getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("habitLogs")
    .doc(docId);
  const snap = await ref.get();
  if (snap.exists) {
    await ref.delete();
  } else {
    await ref.set({
      habitType,
      dateKey: key,
      completed: true,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}

export async function getHabitLogsInRange(
  uid: string,
  startKey: string,
  endKey: string
): Promise<{ dateKey: string; completed: boolean }[]> {
  const snap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("habitLogs")
    .where("dateKey", ">=", startKey)
    .where("dateKey", "<=", endKey)
    .get();
  return snap.docs
    .map((d) => d.data())
    .filter((h) => h.completed)
    .map((h) => ({
      dateKey: String(h.dateKey),
      completed: Boolean(h.completed),
    }));
}

export async function upsertReflection(
  uid: string,
  date: Date,
  data: {
    rating: number;
    gratitude: string;
    improve: string;
    confession?: string;
    intention?: string;
  }
): Promise<void> {
  const key = dateKey(date);
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("reflections")
    .doc(key)
    .set(
      {
        ...data,
        dateKey: key,
        date: Timestamp.fromDate(date),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

export async function getRecentReflections(
  uid: string,
  limit: number
): Promise<ReflectionRecord[]> {
  const snap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("reflections")
    .orderBy("dateKey", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      userId: uid,
      date: tsToDate(d.date),
      rating: Number(d.rating),
      gratitude: String(d.gratitude),
      improve: String(d.improve),
      confession: d.confession ?? null,
      intention: d.intention ?? null,
      createdAt: tsToDate(d.updatedAt ?? d.date),
    };
  });
}

export async function createPrayer(
  uid: string,
  title: string,
  description: string | null
): Promise<void> {
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("prayers")
    .add({
      title,
      description,
      answered: false,
      answeredAt: null,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export async function listPrayers(uid: string): Promise<PrayerRecord[]> {
  const snap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("prayers")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      userId: uid,
      title: String(d.title),
      description: d.description ?? null,
      answered: Boolean(d.answered),
      answeredAt: d.answeredAt ? tsToDate(d.answeredAt) : null,
      createdAt: tsToDate(d.createdAt),
    };
  });
}

export async function updatePrayer(
  uid: string,
  prayerId: string,
  data: Record<string, unknown>
): Promise<void> {
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("prayers")
    .doc(prayerId)
    .update(data);
}

export async function deletePrayer(
  uid: string,
  prayerId: string
): Promise<void> {
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("prayers")
    .doc(prayerId)
    .delete();
}

export async function getUserDevotionalState(
  uid: string,
  devotionalId: string
): Promise<{ completed: boolean; saved: boolean } | null> {
  const snap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("userDevotionals")
    .doc(devotionalId)
    .get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  return {
    completed: Boolean(d.completed),
    saved: Boolean(d.saved),
  };
}

export async function markDevotionalCompletedFs(
  uid: string,
  devotionalId: string
): Promise<void> {
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("userDevotionals")
    .doc(devotionalId)
    .set(
      {
        completed: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

export async function toggleDevotionalSavedFs(
  uid: string,
  devotionalId: string
): Promise<void> {
  const ref = getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("userDevotionals")
    .doc(devotionalId);
  const snap = await ref.get();
  if (snap.exists) {
    const saved = !Boolean(snap.data()?.saved);
    await ref.set(
      {
        saved,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    await ref.set({
      saved: true,
      completed: false,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

export async function appendChatMessage(
  uid: string,
  role: string,
  content: string,
  context?: unknown
): Promise<void> {
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("chatMessages")
    .add({
      role,
      content,
      context: context ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export async function getChatMessages(
  uid: string,
  take = 50
): Promise<ChatMessageRecord[]> {
  const col = getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("chatMessages");
  const snap = await col.orderBy("createdAt", "desc").limit(take).get();
  const ordered = [...snap.docs].reverse();
  return ordered.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      userId: uid,
      role: String(d.role),
      content: String(d.content),
      context: d.context,
      createdAt: tsToDate(d.createdAt),
    };
  });
}

export async function findUsersByBillingId(
  billingId: string
): Promise<string[]> {
  const snap = await getAdminDb()
    .collection("users")
    .where("abacateBillingId", "==", billingId)
    .get();
  return snap.docs
    .filter((d) => Boolean(d.data()?.requiresPaymentCompletion))
    .map((d) => d.id);
}

export async function markPaymentCompleted(uid: string): Promise<void> {
  await updateUser(uid, { paymentCompleted: true });
}
