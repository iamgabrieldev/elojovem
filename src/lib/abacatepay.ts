const ABACATE_API_V1 = "https://api.abacatepay.com/v1";

type AbacateResponse<T> = {
  data: T;
  error: string | null;
  success?: boolean;
};

export type AbacateBilling = {
  id: string;
  url: string;
  status: string;
  externalId?: string | null;
};

export type AbacatePaymentMethod = "PIX" | "CARD";

function getApiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY;
  if (!key?.trim()) {
    throw new Error("ABACATEPAY_API_KEY não configurada.");
  }
  return key.trim();
}

export async function abacatePostJson<T>(
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${ABACATE_API_V1}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as AbacateResponse<T> & { error?: unknown };

  if (!res.ok) {
    const msg =
      typeof json.error === "string"
        ? json.error
        : `AbacatePay HTTP ${res.status}`;
    throw new Error(msg);
  }

  if (json.error != null && json.error !== "") {
    throw new Error(
      typeof json.error === "string" ? json.error : "Erro AbacatePay"
    );
  }

  return json.data;
}

export async function abacateGetJson<T>(path: string): Promise<T> {
  const res = await fetch(`${ABACATE_API_V1}${path}`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  const json = (await res.json()) as AbacateResponse<T> & { error?: unknown };

  if (!res.ok) {
    const msg =
      typeof json.error === "string"
        ? json.error
        : `AbacatePay HTTP ${res.status}`;
    throw new Error(msg);
  }

  if (json.error != null && json.error !== "") {
    throw new Error(
      typeof json.error === "string" ? json.error : "Erro AbacatePay"
    );
  }

  return json.data;
}

export async function listBillings(): Promise<AbacateBilling[]> {
  const data = await abacateGetJson<AbacateBilling[]>("/billing/list");
  return Array.isArray(data) ? data : [];
}

export type CreateBillingInput = {
  frequency: "ONE_TIME" | "MULTIPLE_PAYMENTS";
  methods: AbacatePaymentMethod[];
  products: Array<{
    externalId: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
  }>;
  returnUrl: string;
  completionUrl: string;
  customer: {
    name: string;
    cellphone: string;
    email: string;
    taxId: string;
  };
  externalId?: string;
  metadata?: Record<string, unknown>;
};

export async function createBilling(
  input: CreateBillingInput
): Promise<AbacateBilling> {
  return abacatePostJson<AbacateBilling>("/billing/create", input);
}

export type AbacatePixQrCode = {
  id: string;
  status: "PENDING" | "EXPIRED" | "CANCELLED" | "PAID" | "REFUNDED";
  brCode: string;
  brCodeBase64?: string;
  expiresAt?: string;
  amount: number;
};

export async function createPixQrCode(input: {
  amount: number;
  expiresIn?: number;
  description?: string;
  customer?: {
    name: string;
    cellphone: string;
    email: string;
    taxId: string;
  };
  metadata?: Record<string, unknown>;
}): Promise<AbacatePixQrCode> {
  return abacatePostJson<AbacatePixQrCode>("/pixQrCode/create", input);
}

export async function checkPixQrCodeStatus(id: string): Promise<{
  status: "PENDING" | "EXPIRED" | "CANCELLED" | "PAID" | "REFUNDED";
  expiresAt?: string;
}> {
  return abacateGetJson<{
    status: "PENDING" | "EXPIRED" | "CANCELLED" | "PAID" | "REFUNDED";
    expiresAt?: string;
  }>(`/pixQrCode/check?id=${encodeURIComponent(id)}`);
}
