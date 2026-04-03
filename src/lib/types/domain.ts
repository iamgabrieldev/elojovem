export type Tradition = "CATHOLIC" | "PROTESTANT";
export type HabitType = "PRAYER" | "BIBLE_READING" | "GRATITUDE";
export type GoalType =
  | "ANXIETY"
  | "DISCIPLINE"
  | "PURPOSE"
  | "FAITH"
  | "RELATIONSHIPS";

export type DevotionalSource = "SEED" | "AI_GENERATED" | "LITURGICAL";

/** Documento `users/{uid}` no Firestore (espelho do antigo modelo Prisma). */
export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  tradition: Tradition | null;
  dailyTime: number | null;
  goals: GoalType[];
  onboardingCompleted: boolean;
  requiresPaymentCompletion: boolean;
  paymentCompleted: boolean;
  abacateBillingId: string | null;
  cellphone: string | null;
  taxId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Devocional global `devotionals/{id}` */
export type DevotionalRecord = {
  id: string;
  tradition: Tradition;
  summary: string;
  verse: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  practicalSteps: string;
  promise: string;
  promiseReference: string;
  date: Date;
  source: DevotionalSource;
  structuredContent?: unknown;
};

/** Alias para componentes que esperavam o nome `Devotional` do Prisma */
export type Devotional = DevotionalRecord;

export type PrayerRecord = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  answered: boolean;
  answeredAt: Date | null;
  createdAt: Date;
};

export type ChatMessageRecord = {
  id: string;
  userId: string;
  role: string;
  content: string;
  context?: unknown;
  createdAt: Date;
};

export type ReflectionRecord = {
  id: string;
  userId: string;
  date: Date;
  rating: number;
  gratitude: string;
  improve: string;
  confession: string | null;
  intention: string | null;
  createdAt: Date;
};
