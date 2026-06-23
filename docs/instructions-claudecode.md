Act as a Principal Full-Stack Software Engineer with deep expertise in Next.js (TypeScript, React), Golang/Kotlin microservices, and high-performance, scalable systems. Apply maximum reasoning capabilities to refactor our codebase across the following four critical pillars. Ensure all changes adhere to SOLID principles and maintain robust test coverage.

1. Business Logic & Domain Model Restriction (Religion & Church Module):
- Completely remove the "Church" (Igreja) section, including its UI components, API routes, and database models.
- Update the User domain model and registration flow: remove the "Protestant" option and hardcode/restrict the religion enum strictly to "Roman Catholic Apostolic" (Católico Apostólico Romano).
- Clean up any dead code, unused states, or legacy database migrations related to the removed options.

2. UX & Generative AI Enhancements (Daily Comics/HQs):
- Refactor the dynamic rendering components and the prompt engineering pipeline for the daily comics (HQs).
- Elevate the visual aesthetics: make the UI presentation highly ludic, engaging, and visually pleasing.
- Implement modern UI patterns for the image containers (e.g., blur-up placeholders, proper aspect ratios, smooth transitions).

3. Extreme Performance Optimization (Target: < 100ms Latency):
- Current metrics (7s initial load, 5s page transitions) are unacceptable. Architect a solution to drop this below 100ms.
- Frontend (Next.js): Implement aggressive route pre-fetching, React Server Components (RSC), code-splitting, and memoization. Optimize the bundle size.
- Backend/Infra: Introduce aggressive caching layers (Redis/Memcached) for the daily comics and static data. 
- Ensure heavy or blocking operations are decoupled into asynchronous workers using Kafka, freeing up the main thread and HTTP handlers.

4. Design System & Dark Theme Accessibility:
- Debug and completely refactor the `ThemeProvider` logic for the Dark Theme.
- Fix the severe contrast issue: ensure that white fonts, white icons, and images are perfectly legible against the dark background.
- Apply standard WCAG AA/AAA contrast ratios to the CSS variables/Tailwind config to prevent elements from becoming invisible in dark mode.

Before modifying the files, briefly outline your execution plan. Start the implementation immediately after, generating the necessary code, tests, and architectural adjustments.