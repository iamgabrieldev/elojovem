# Login com Google (Firebase Auth)

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

## 5. Produção

- Use `NEXT_PUBLIC_APP_URL=https://elojovem.com.br` (ou `https://www.elojovem.com.br` conforme o domínio canônico) para redirects consistentes com o domínio do OAuth.
