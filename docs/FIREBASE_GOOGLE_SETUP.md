# Login com Google (Firebase Auth)

O login social usa **Firebase Authentication** (`signInWithPopup`), não `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` do `.env`. O OAuth do Google é gerenciado no Firebase Console.

Para automatizar domínios autorizados e verificar o provedor:

```bash
node scripts/firebase-enable-google-auth.mjs
```

Se o popup do Google retornar `auth/internal-error`, `CONFIGURATION_NOT_FOUND` ou falhas ao carregar `gapi`, confira no [Firebase Console](https://console.firebase.google.com) do seu projeto:

## 1. Provedor Google

1. **Authentication** → **Sign-in method** → **Google** → ativar.
2. Definir email de suporte do projeto e salvar.

## 2. Domínios autorizados

1. **Authentication** → **Settings** → **Authorized domains**.
2. Inclua pelo menos: `localhost`, `elojovem.com.br` e `www.elojovem.com.br` (e o domínio de preview da Vercel, se usar).

## 3. APIs no Google Cloud

No projeto GCP vinculado ao Firebase:

- [Identity Toolkit API](https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com) — habilitada.
- [Cloud Firestore API](https://console.cloud.google.com/apis/library/firestore.googleapis.com) — se usar Firestore no servidor.

## 4. Variáveis de ambiente (app web)

No `.env` / painel de deploy, todas as `NEXT_PUBLIC_FIREBASE_*` do app Web devem estar corretas e **sem aspas duplicadas**.

Reinicie o servidor (`next dev` / redeploy) após alterar variáveis públicas.

## 5. Firestore (após o popup funcionar)

Se o login Google abrir mas falhar ao criar sessão com `PERMISSION_DENIED` no Firestore:

1. [Ativar Cloud Firestore API](https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=elojovem-481ca)
2. [Criar banco Firestore](https://console.firebase.google.com/project/elojovem-481ca/firestore) (região ex.: `southamerica-east1`)
3. Aguardar 1–2 minutos de propagação

## 6. Produção

- Use `NEXT_PUBLIC_APP_URL=https://elojovem.com.br` (ou `https://www.elojovem.com.br` conforme o domínio canônico) para redirects consistentes com o domínio do OAuth.
