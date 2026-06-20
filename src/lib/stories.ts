/**
 * Expanded comic stories library with diverse themes
 * Each story has a title, mood-based panels, and a closing message
 */

export type Panel = { 
  text: string; 
  mood: "joy" | "calm" | "hope" | "love" | "strength" | "peace" | "gratitude" | "grace";
};

export type Story = {
  title: string;
  theme: "faith" | "hope" | "community" | "resilience" | "love" | "growth" | "purpose" | "gratitude" | "grace";
  panels: Panel[];
  closing: string;
};

export const EXPANDED_STORIES: Story[] = [
  // Original stories
  {
    title: "O pão partido",
    theme: "community",
    panels: [
      {
        text: "Jesus olha para a multidão com fome…",
        mood: "calm",
      },
      {
        text: "Um menino oferece pouco — mas é com generosidade.",
        mood: "hope",
      },
      {
        text: "Deus multiplica o que entregamos com amor.",
        mood: "joy",
      },
    ],
    closing: "Fé também pode ser lúdica: pequenos gestos viram milagre.",
  },
  {
    title: "A tempestade acalma",
    theme: "faith",
    panels: [
      {
        text: "O barco balança. O medo cresce.",
        mood: "calm",
      },
      {
        text: 'Alguém lembra: "Não estamos sós nesta onda."',
        mood: "hope",
      },
      {
        text: "A paz não é ausência de vento — é presença de Deus.",
        mood: "joy",
      },
    ],
    closing: "Hoje, respire: a fé cabe em um minuto de silêncio honesto.",
  },
  {
    title: "Caminho de casa",
    theme: "purpose",
    panels: [
      {
        text: "Dois amigos conversam no fim do dia.",
        mood: "calm",
      },
      {
        text: 'Um pergunta: "Você ainda acredita em milagre?"',
        mood: "hope",
      },
      {
        text: 'O outro sorri: "Acredito em consolo, propósito e recomeço."',
        mood: "joy",
      },
    ],
    closing: "Religião pode ser acolhedora — como uma boa história bem contada.",
  },
  
  // New stories - Faith & Spirituality
  {
    title: "Mãos que rezam",
    theme: "faith",
    panels: [
      {
        text: "Mãos cansadas se unem em oração.",
        mood: "calm",
      },
      {
        text: "Cada dedo é uma intenção, cada palma um coração.",
        mood: "grace",
      },
      {
        text: "No silêncio, Deus ouve o que as palavras não conseguem dizer.",
        mood: "peace",
      },
    ],
    closing: "Sua oração, por mais simples, carrega o universo inteiro.",
  },
  
  // Hope & Resilience
  {
    title: "Depois da chuva",
    theme: "resilience",
    panels: [
      {
        text: "A tempestade passou, deixando poças no caminho.",
        mood: "calm",
      },
      {
        text: "Uma criança vê cores no céu que antes não existiam.",
        mood: "hope",
      },
      {
        text: "Toda dor tem pressa em virar arco-íris.",
        mood: "joy",
      },
    ],
    closing: "Você é mais forte que acredita. A prova está em estar aqui.",
  },
  
  {
    title: "Semeador de sonhos",
    theme: "hope",
    panels: [
      {
        text: "Um velho planta sementes num solo árido.",
        mood: "calm",
      },
      {
        text: "Vizinhos riem. Ele apenas sorri.",
        mood: "strength",
      },
      {
        text: "Anos depois, aquele deserto floresce — porque alguém acreditou.",
        mood: "joy",
      },
    ],
    closing: "Seus sonhos não são loucos. Eles estão apenas esperando o tempo certo.",
  },
  
  // Community & Connection
  {
    title: "Na mesa da família",
    theme: "community",
    panels: [
      {
        text: "Nem todos se entendem. Nem todos concordam.",
        mood: "calm",
      },
      {
        text: "Mas naquela mesa, todos são bem-vindos.",
        mood: "love",
      },
      {
        text: "O amor não é concordância — é escolher estar junto mesmo assim.",
        mood: "joy",
      },
    ],
    closing: "Sua famiglia é feita de abraços que você escolhe dar.",
  },
  
  {
    title: "A voz do outro",
    theme: "community",
    panels: [
      {
        text: "Você não entende tudo que o outro vive.",
        mood: "calm",
      },
      {
        text: "Mas pode ouvir. Pode parar. Pode ficar.",
        mood: "grace",
      },
      {
        text: "E de repente, duas almas reconhecem uma à outra.",
        mood: "peace",
      },
    ],
    closing: "Empatia é o ato mais revolucionário que você pode fazer hoje.",
  },
  
  // Growth & Purpose
  {
    title: "Flor entre pedras",
    theme: "growth",
    panels: [
      {
        text: "Nascida em solo difícil, entre pedras duras.",
        mood: "calm",
      },
      {
        text: "Suas raízes aprendem a achar água onde ninguém vê.",
        mood: "strength",
      },
      {
        text: "E quando finalmente floresce, sua beleza é indescritível.",
        mood: "joy",
      },
    ],
    closing: "Suas dificuldades estão plantando sementes de força que você ainda não vê.",
  },
  
  {
    title: "Mestre e aprendiz",
    theme: "purpose",
    panels: [
      {
        text: "Um mestre ensina: 'Falhei mil vezes.'",
        mood: "calm",
      },
      {
        text: "O aprendiz pergunta: 'Ainda assim continuou?'",
        mood: "hope",
      },
      {
        text: "'Claro. Porque fracasso não é o oposto de sucesso — é o caminho para ele.'",
        mood: "strength",
      },
    ],
    closing: "Seu maior maestria vem de seus maiores fracassos. Confie no processo.",
  },
  
  // Love & Gratitude
  {
    title: "Obrigado",
    theme: "gratitude",
    panels: [
      {
        text: "Raramente dizemos. Raramente paramos para sentir.",
        mood: "calm",
      },
      {
        text: "Mas toda vida é um presente embrulhado em momentos.",
        mood: "gratitude",
      },
      {
        text: "Suas mãos, sua chance, seu coração — tudo vale a pena.",
        mood: "joy",
      },
    ],
    closing: "Hoje, agradeça por estar vivo. Por estar aqui. Por ser você.",
  },
  
  {
    title: "Amor sem palavras",
    theme: "love",
    panels: [
      {
        text: "Não precisa de flores ou poemas.",
        mood: "calm",
      },
      {
        text: "Precisa de presença. De escuta. De escolher alguém dia após dia.",
        mood: "love",
      },
      {
        text: "O verdadeiro amor é um verbo — é ação, é escolha, é recomeço.",
        mood: "peace",
      },
    ],
    closing: "Amar é o ato mais sagrado que você pode fazer — com qualquer pessoa.",
  },
  
  // Grace & Acceptance
  {
    title: "Perdão para si",
    theme: "grace",
    panels: [
      {
        text: "Você não foi perfeito. E tudo bem.",
        mood: "calm",
      },
      {
        text: "Nem você, nem ninguém nesta terra carrega perfeição.",
        mood: "grace",
      },
      {
        text: "Mas você carrega possibilidade — de mudar, de crescer, de começar de novo.",
        mood: "peace",
      },
    ],
    closing: "Se Deus perdoou você, quem é você para não se perdoar?",
  },
];

// Emoji mapping for moods
export const MOOD_EMOJIS: Record<Panel["mood"], string[]> = {
  joy: ["✨", "🎉", "😊", "🌟", "💫", "🎊", "🌈", "😄"],
  calm: ["🕊️", "🌿", "☮️", "🧘", "🌊", "💙", "🕯️", "🍃"],
  hope: ["☀️", "🌅", "🦋", "🌱", "💪", "🌸", "🚀", "⭐"],
  love: ["💖", "💝", "🤝", "👨‍👩‍👧", "🌷", "💗", "🫂", "✝️"],
  strength: ["💪", "⛰️", "🔥", "🦁", "🌳", "🏔️", "💎", "⚡"],
  peace: ["🕊️", "☮️", "🌙", "✌️", "🧘", "🕯️", "💤", "🌌"],
  gratitude: ["🙏", "❤️", "💞", "🌻", "🎁", "👏", "🕊️", "✨"],
  grace: ["✝️", "💎", "👼", "🕊️", "💖", "🌟", "🦋", "🕯️"],
};
