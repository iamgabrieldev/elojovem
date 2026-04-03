/**
 * Migração manual Postgres → Firestore (one-off).
 *
 * Os UIDs do Firebase Auth não coincidem com os `cuid` do Prisma.
 * Opções: (1) exportar dados e recriar contas no Firebase com email/link;
 * (2) tabela de mapeamento cuid → uid após import;
 * (3) aceitar reset e re-onboarding.
 *
 * Este ficheiro é um marcador — implemente conforme o volume de dados em produção.
 */
export {};
