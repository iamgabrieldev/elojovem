const MONTHLY_PRAYER: Array<{ title: string; prayer: string }> = [
  {
    title: "Oração do mês (Janeiro)",
    prayer:
      "Senhor, neste novo começo, dá-nos um coração simples e fiel. Ensina-nos a buscar primeiro o teu Reino e a viver cada dia com gratidão, coragem e esperança. Amém.",
  },
  {
    title: "Oração do mês (Fevereiro)",
    prayer:
      "Jesus, manso e humilde de coração, forma em nós a caridade no cotidiano. Ajuda-nos a amar com atitudes concretas e a perdoar com sinceridade. Amém.",
  },
  {
    title: "Oração do mês (Março)",
    prayer:
      "Senhor, no caminho de conversão, purifica nossas intenções e fortalece nossa oração. Que a tua Palavra nos conduza a escolhas mais santas. Amém.",
  },
  {
    title: "Oração do mês (Abril)",
    prayer:
      "Cristo Ressuscitado, renova a nossa esperança. Que a alegria pascal transforme nossas rotinas e nos faça testemunhas de paz e misericórdia. Amém.",
  },
  {
    title: "Oração do mês (Maio)",
    prayer:
      "Maria, Mãe de Jesus e nossa Mãe, ensina-nos a guardar a Palavra e a servir com alegria. Intercede por nós para que sejamos firmes na fé. Amém.",
  },
  {
    title: "Oração do mês (Junho)",
    prayer:
      "Espírito Santo, inflama-nos com teu amor. Concede-nos sabedoria e fortaleza para vivermos a fé com coerência, especialmente nas pequenas coisas. Amém.",
  },
  {
    title: "Oração do mês (Julho)",
    prayer:
      "Senhor, sustenta-nos no descanso e no trabalho. Dá-nos equilíbrio, pureza de coração e disposição para servir sem desanimar. Amém.",
  },
  {
    title: "Oração do mês (Agosto)",
    prayer:
      "Jesus, Bom Pastor, desperta em nós o desejo de seguir tua voz. Conduze nossa família e comunidade no caminho da vocação e do amor. Amém.",
  },
  {
    title: "Oração do mês (Setembro)",
    prayer:
      "Senhor, que a tua Palavra seja luz para nossos passos. Dá-nos fome do Evangelho e coragem para praticá-lo com humildade e constância. Amém.",
  },
  {
    title: "Oração do mês (Outubro)",
    prayer:
      "Deus de amor, renova em nós o ardor missionário. Que nossas palavras e obras anunciem a tua bondade e aproximem as pessoas de ti. Amém.",
  },
  {
    title: "Oração do mês (Novembro)",
    prayer:
      "Senhor, fortalece nossa esperança na vida eterna. Dá-nos serenidade diante das perdas e faz-nos viver com o coração voltado para o céu. Amém.",
  },
  {
    title: "Oração do mês (Dezembro)",
    prayer:
      "Deus conosco, prepara-nos para acolher Jesus. Que o Advento e o Natal despertem em nós a fé, a simplicidade e a alegria de servir. Amém.",
  },
];

export function getMonthlyPrayer(date = new Date()): { title: string; prayer: string } {
  return MONTHLY_PRAYER[date.getMonth()] ?? MONTHLY_PRAYER[0];
}

