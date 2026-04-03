const WORLD_DAYS_BY_MM_DD: Record<string, string[]> = {
  "01-01": ["Dia Mundial da Paz"],
  "01-06": ["Dia de Reis"],
  "02-11": ["Dia Mundial do Enfermo"],
  "03-08": ["Dia Internacional da Mulher"],
  "03-21": ["Dia Internacional da Síndrome de Down"],
  "03-22": ["Dia Mundial da Água"],
  "03-25": ["Dia Nacional do Orgulho Gay (Brasil)"],
  "04-07": ["Dia Mundial da Saúde"],
  "04-22": ["Dia da Terra"],
  "05-01": ["Dia do Trabalhador"],
  "05-13": ["Dia de Nossa Senhora de Fátima"],
  "06-05": ["Dia Mundial do Meio Ambiente"],
  "06-12": ["Dia Mundial contra o Trabalho Infantil"],
  "06-14": ["Dia Mundial do Doador de Sangue"],
  "07-20": ["Dia do Amigo"],
  "08-11": ["Dia do Estudante"],
  "08-27": ["Dia do Psicólogo"],
  "09-01": ["Dia do Profissional de Educação Física"],
  "09-21": ["Dia Internacional da Paz"],
  "09-27": ["Dia Nacional de Doação de Órgãos"],
  "10-04": ["Dia de São Francisco de Assis"],
  "10-12": ["Nossa Senhora Aparecida", "Dia das Crianças"],
  "11-02": ["Finados"],
  "11-14": ["Dia Mundial do Diabetes"],
  "12-25": ["Natal"],
};

function mmDd(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}

export function getWorldDays(date = new Date()): string[] {
  return WORLD_DAYS_BY_MM_DD[mmDd(date)] ?? [];
}

