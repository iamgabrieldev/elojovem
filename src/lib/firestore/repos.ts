import { cache } from "react";
import {
  FieldValue,
  Timestamp,
  type DocumentData,
} from "firebase-admin/firestore";
import { isAdminEmail } from "../admin";
import { getAdminDb } from "../firebase-admin";
import type {
  AppSettings,
  ChatMessageRecord,
  CommunityCommentRecord,
  CommunityPostRecord,
  DevotionalRecord,
  DevotionalSource,
  GoalType,
  HabitType,
  PrayerRecord,
  ReflectionRecord,
  SubscriptionPlanId,
  Tradition,
  UserProfile,
} from "../types/domain";

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function devotionalDocId(tradition: Tradition, date: Date): string {
  return `${tradition}_${dateKey(date)}`;
}

const DEFAULT_APP_SETTINGS: AppSettings = {
  registrationPaymentEnabled: true,
};

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

function communityPostFromDoc(id: string, d: DocumentData): CommunityPostRecord {
  return {
    id,
    userId: String(d.userId ?? ""),
    authorName: String(d.authorName ?? "Membro da comunidade"),
    authorImage: d.authorImage ?? null,
    content: String(d.content ?? ""),
    likeCount: Number(d.likeCount ?? 0),
    commentCount: Number(d.commentCount ?? 0),
    likedBy: Array.isArray(d.likedBy)
      ? d.likedBy.map((value: unknown) => String(value))
      : [],
    createdAt: tsToDate(d.createdAt),
  };
}

function communityCommentFromDoc(
  postId: string,
  id: string,
  d: DocumentData
): CommunityCommentRecord {
  return {
    id,
    postId,
    userId: String(d.userId ?? ""),
    authorName: String(d.authorName ?? "Membro da comunidade"),
    authorImage: d.authorImage ?? null,
    content: String(d.content ?? ""),
    createdAt: tsToDate(d.createdAt),
  };
}

export const getUserProfile = cache(async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getAdminDb().collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  const email = String(d.email ?? "");
  return {
    id: uid,
    email,
    name: d.name ?? null,
    image: d.image ?? null,
    isAdmin: Boolean(d.isAdmin) || isAdminEmail(email),
    tradition: d.tradition === "CATHOLIC" ? "CATHOLIC" : null,
    dailyTime: typeof d.dailyTime === "number" ? d.dailyTime : 10,
    goals: Array.isArray(d.goals) ? (d.goals as GoalType[]) : [],
    onboardingCompleted: Boolean(d.onboardingCompleted),
    requiresPaymentCompletion: Boolean(d.requiresPaymentCompletion),
    paymentCompleted: Boolean(d.paymentCompleted),
    subscriptionPlan:
      d.subscriptionPlan === "MONTHLY" || d.subscriptionPlan === "ANNUAL"
        ? (d.subscriptionPlan as SubscriptionPlanId)
        : null,
    abacateBillingId: d.abacateBillingId ?? null,
    cellphone: d.cellphone ?? null,
    taxId: d.taxId ?? null,
    createdAt: tsToDate(d.createdAt),
    updatedAt: tsToDate(d.updatedAt),
  };
});

export async function getAppSettings(): Promise<AppSettings> {
  const snap = await getAdminDb().collection("appSettings").doc("global").get();
  if (!snap.exists) {
    return DEFAULT_APP_SETTINGS;
  }

  const d = snap.data()!;
  return {
    registrationPaymentEnabled:
      typeof d.registrationPaymentEnabled === "boolean"
        ? d.registrationPaymentEnabled
        : DEFAULT_APP_SETTINGS.registrationPaymentEnabled,
  };
}

export async function updateAppSettings(
  data: Partial<AppSettings>
): Promise<void> {
  await getAdminDb()
    .collection("appSettings")
    .doc("global")
    .set(
      {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
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

export async function createCommunityPost(
  uid: string,
  authorName: string,
  authorImage: string | null,
  content: string
): Promise<void> {
  await getAdminDb().collection("communityPosts").add({
    userId: uid,
    authorName,
    authorImage,
    content,
    likeCount: 0,
    commentCount: 0,
    likedBy: [],
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function listCommunityPosts(
  limitCount = 20
): Promise<CommunityPostRecord[]> {
  const snap = await getAdminDb()
    .collection("communityPosts")
    .orderBy("createdAt", "desc")
    .limit(limitCount)
    .get();

  return snap.docs.map((doc) => communityPostFromDoc(doc.id, doc.data()));
}

export async function toggleCommunityPostLike(
  postId: string,
  uid: string
): Promise<void> {
  const ref = getAdminDb().collection("communityPosts").doc(postId);

  await getAdminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      throw new Error("Publicacao nao encontrada.");
    }

    const data = snap.data()!;
    const likedBy = Array.isArray(data.likedBy)
      ? data.likedBy.map((value: unknown) => String(value))
      : [];
    const alreadyLiked = likedBy.includes(uid);

    tx.update(ref, {
      likedBy: alreadyLiked
        ? FieldValue.arrayRemove(uid)
        : FieldValue.arrayUnion(uid),
      likeCount: Math.max(0, Number(data.likeCount ?? 0) + (alreadyLiked ? -1 : 1)),
    });
  });
}

export async function addCommunityComment(
  postId: string,
  uid: string,
  authorName: string,
  authorImage: string | null,
  content: string
): Promise<void> {
  const postRef = getAdminDb().collection("communityPosts").doc(postId);
  const commentRef = postRef.collection("comments").doc();

  await getAdminDb().runTransaction(async (tx) => {
    const postSnap = await tx.get(postRef);
    if (!postSnap.exists) {
      throw new Error("Publicacao nao encontrada.");
    }

    tx.set(commentRef, {
      userId: uid,
      authorName,
      authorImage,
      content,
      createdAt: FieldValue.serverTimestamp(),
    });

    tx.update(postRef, {
      commentCount: Number(postSnap.data()?.commentCount ?? 0) + 1,
    });
  });
}

export async function listCommunityComments(
  postId: string,
  limitCount = 20
): Promise<CommunityCommentRecord[]> {
  const snap = await getAdminDb()
    .collection("communityPosts")
    .doc(postId)
    .collection("comments")
    .orderBy("createdAt", "asc")
    .limit(limitCount)
    .get();

  return snap.docs.map((doc) =>
    communityCommentFromDoc(postId, doc.id, doc.data())
  );
}
