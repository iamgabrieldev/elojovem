export type Tradition = "CATHOLIC";

/** Plano de assinatura escolhido no checkout (persistido após iniciar pagamento). */
export type SubscriptionPlanId = "MONTHLY" | "ANNUAL";

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
  isAdmin: boolean;
  tradition: Tradition | null;
  dailyTime: number | null;
  goals: GoalType[];
  onboardingCompleted: boolean;
  requiresPaymentCompletion: boolean;
  paymentCompleted: boolean;
  /** Plano selecionado na etapa de pagamento (null se ainda não escolheu). */
  subscriptionPlan: SubscriptionPlanId | null;
  abacateBillingId: string | null;
  cellphone: string | null;
  taxId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AppSettings = {
  registrationPaymentEnabled: boolean;
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

/** Uma pergunta do quiz bíblico diário (compartilhado entre tradições). */
export type QuizQuestion = {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  verseReference: string;
};

/** Documento `quizzes/{QUIZ_YYYY-MM-DD}` */
export type QuizRecord = {
  id: string;
  date: Date;
  questions: QuizQuestion[];
  source: "AI_GENERATED" | "SEED";
};

/** Tentativa do usuário em `users/{uid}/quizAttempts/{dateKey}` */
export type QuizAttemptRecord = {
  id: string;
  userId: string;
  dateKey: string;
  answers: number[];
  score: number;
  completedAt: Date;
};

export type QuizAttemptSummary = {
  id: string;
  userId: string;
  dateKey: string;
  score: number;
  completedAt: Date;
};

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

export type LeaderboardEntry = {
  userId: string;
  name: string;
  image: string | null;
  estimatedPrayerMinutes: number;
  prayerDays: number;
  activeDays: number;
  currentStreak: number;
  lastActiveAt: Date | null;
};

export type CommunityPostRecord = {
  id: string;
  userId: string;
  authorName: string;
  authorImage: string | null;
  content: string;
  likeCount: number;
  commentCount: number;
  likedBy: string[];
  createdAt: Date;
};

export type CommunityCommentRecord = {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorImage: string | null;
  content: string;
  createdAt: Date;
};
