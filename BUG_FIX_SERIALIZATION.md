# 🔧 Bug Fix: Serialização de Funções em Client Components

**Data:** 2026-06-20  
**Status:** ✅ CORRIGIDO  
**Problema:** ErrorBoundary recebia função `fallback` de Server Component

---

## ❌ Problema Original

```
⨯ Error: Functions cannot be passed directly to Client Components unless you explicitly expose it 
by marking it with "use server". Or maybe you meant to call this function rather than return it.
  <... fallback={function fallback} children=...>
            ^^^^^^^^^^^^^^^^^^^
```

### Causa
No [src/app/(app)/dashboard/page.tsx](src/app/\(app\)/dashboard/page.tsx) estava passando uma função `fallback` para um Client Component:

```tsx
// ❌ ERRADO - Server Component passando função para Client Component
<ErrorBoundary fallback={() => null}>
  <GreetingCard ... />
</ErrorBoundary>
```

O Next.js 13+ não permite passar funções de Server Components para Client Components a menos que estejam marcadas com `"use server"`.

---

## ✅ Solução Implementada

### 1. Simplificar ErrorBoundary
Remover prop `fallback` customizável e usar apenas um fallback UI padrão:

**Antes:**
```tsx
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;  // ❌ Função
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
```

**Depois:**
```tsx
interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
```

### 2. Fallback UI Fixa
```tsx
render() {
  if (this.state.hasError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          ⚠️ Erro ao carregar card
        </p>
      </div>
    );
  }
  return this.props.children;
}
```

### 3. Remover fallback nas Props
No dashboard, remover todos os `fallback={() => null}`:

```tsx
// ❌ Antes
<ErrorBoundary fallback={() => null}>
  <GreetingCard />
</ErrorBoundary>

// ✅ Depois
<ErrorBoundary>
  <GreetingCard />
</ErrorBoundary>
```

---

## 📊 Comparação

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Fallback UI** | Customizável via função | Padrão fixa |
| **Props** | `fallback?: (error) => ReactNode` | Nenhuma |
| **Serialização** | ❌ Erro de função | ✅ Sem erros |
| **Funcionabilidade** | ✅ Error isolation | ✅ Error isolation |

---

## ✅ Validação

### Build
```bash
npm run build  # ✅ Passou sem erros
```

### Dev Server
```bash
npm run dev    # ✅ Servidor rodando
GET /dashboard 200  # ✅ Sem erros de serialização
GET /devocional 200  # ✅ 
GET /biblia 200      # ✅
GET /login 200       # ✅
```

### Console
✅ Nenhum erro de "Functions cannot be passed directly to Client Components"

---

## 🎯 Impacto

- ✅ Dashboard renderiza sem erros
- ✅ Error isolation continua funcionando
- ✅ Cada card pode falhar independentemente
- ✅ Build continua production-ready

---

**Arquivos Alterados:**
1. `src/components/ui/error-boundary.tsx` - Simplificar interface
2. `src/app/(app)/dashboard/page.tsx` - Remover `fallback` props

**Total de Mudanças:** 2 arquivos | ~50 linhas

---

**Status:** ✅ Implementação completa de Performance Refactor (FASE 1-5) + Bug Fix
