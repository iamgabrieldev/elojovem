import type { QuizQuestion, QuizRecord } from "@/lib/types/domain";
import { quizDocId } from "@/lib/firestore/quiz-repos";

const FALLBACK_QUESTION_BANK: QuizQuestion[] = [
  {
    question: "Quem construiu a arca obedecendo à ordem de Deus?",
    options: ["Abraão", "Noé", "Moisés", "Davi"],
    correctIndex: 1,
    explanation:
      "Noé construiu a arca pela fé, obedecendo ao aviso de Deus sobre o dilúvio e salvando sua família.",
    verseReference: "Gênesis 6,13-22",
  },
  {
    question: "Qual jovem derrotou Golias com uma funda e pedras?",
    options: ["Samuel", "Saul", "Davi", "Jônatas"],
    correctIndex: 2,
    explanation:
      "Davi enfrentou Golias confiando no Senhor, mostrando que a vitória vem de Deus e não da força humana.",
    verseReference: "1 Samuel 17,45-50",
  },
  {
    question: "Quem recebeu os Dez Mandamentos no monte Sinai?",
    options: ["Moisés", "Josué", "Elias", "Isaías"],
    correctIndex: 0,
    explanation:
      "Moisés subiu ao Sinai e recebeu de Deus as tábuas da Lei para orientar o povo da aliança.",
    verseReference: "Êxodo 31,18",
  },
  {
    question: "Qual discípulo andou sobre as águas em direção a Jesus?",
    options: ["João", "Pedro", "Tiago", "André"],
    correctIndex: 1,
    explanation:
      "Pedro saiu do barco e caminhou sobre as águas enquanto manteve os olhos em Jesus, mas começou a afundar quando duvidou.",
    verseReference: "Mateus 14,28-31",
  },
  {
    question: "Quem foi lançado na cova dos leões e foi protegido por Deus?",
    options: ["Daniel", "Jeremias", "José", "Neemias"],
    correctIndex: 0,
    explanation:
      "Daniel permaneceu fiel em oração, e Deus fechou a boca dos leões durante a noite.",
    verseReference: "Daniel 6,16-23",
  },
  {
    question: "Em qual cidade Jesus nasceu?",
    options: ["Nazaré", "Jerusalém", "Belém", "Cafarnaum"],
    correctIndex: 2,
    explanation:
      "Jesus nasceu em Belém, cumprindo as promessas proféticas a respeito do Messias.",
    verseReference: "Lucas 2,4-7",
  },
  {
    question: "Quem interpretou sonhos no Egito e se tornou governador depois de grande sofrimento?",
    options: ["José", "Rúben", "Arão", "Sansão"],
    correctIndex: 0,
    explanation:
      "José, filho de Jacó, interpretou os sonhos do faraó e foi usado por Deus para preservar muitas vidas.",
    verseReference: "Gênesis 41,37-41",
  },
  {
    question: "Qual milagre Jesus realizou antes de alimentar uma multidão com pães e peixes?",
    options: [
      "Multiplicou os alimentos",
      "Transformou água em vinho",
      "Curou o cego de Jericó",
      "Acalmou a tempestade",
    ],
    correctIndex: 0,
    explanation:
      "Jesus multiplicou cinco pães e dois peixes para alimentar a multidão, revelando sua compaixão e poder.",
    verseReference: "João 6,5-14",
  },
  {
    question: "Quem negou Jesus três vezes antes do canto do galo?",
    options: ["Judas", "Pedro", "Tomé", "Mateus"],
    correctIndex: 1,
    explanation:
      "Pedro negou Jesus por medo, mas depois se arrependeu e foi restaurado pelo próprio Cristo.",
    verseReference: "Lucas 22,54-62",
  },
  {
    question: "Qual apóstolo é conhecido por ter encontrado Jesus no caminho de Damasco?",
    options: ["Paulo", "Barnabé", "Timóteo", "Silas"],
    correctIndex: 0,
    explanation:
      "Saulo encontrou o Cristo ressuscitado no caminho de Damasco, converteu-se e passou a ser conhecido como Paulo.",
    verseReference: "Atos 9,3-6",
  },
  {
    question: "Quem disse: 'O Senhor é meu pastor; nada me faltará'?",
    options: ["Salomão", "Asafe", "Davi", "Isaías"],
    correctIndex: 2,
    explanation:
      "O Salmo 23 é atribuído a Davi e expressa confiança total no cuidado de Deus.",
    verseReference: "Salmo 23,1",
  },
  {
    question: "Qual mulher recebeu a visita do anjo Gabriel anunciando o nascimento de Jesus?",
    options: ["Isabel", "Marta", "Maria", "Ana"],
    correctIndex: 2,
    explanation:
      "Maria recebeu o anúncio do anjo Gabriel e respondeu com fé e disponibilidade à vontade de Deus.",
    verseReference: "Lucas 1,26-38",
  },
  {
    question: "Quem subiu numa árvore para ver Jesus passar?",
    options: ["Bartimeu", "Zaqueu", "Nicodemos", "Levi"],
    correctIndex: 1,
    explanation:
      "Zaqueu subiu num sicômoro para ver Jesus e teve sua vida transformada após ser chamado pelo Mestre.",
    verseReference: "Lucas 19,1-10",
  },
  {
    question: "Em qual dia Jesus ressuscitou, segundo os Evangelhos?",
    options: ["Na sexta-feira", "No sábado", "No primeiro dia da semana", "Após quarenta dias"],
    correctIndex: 2,
    explanation:
      "Os Evangelhos afirmam que Jesus ressuscitou no primeiro dia da semana, fundamento da esperança cristã.",
    verseReference: "Mateus 28,1-6",
  },
  {
    question: "Quem pediu sabedoria a Deus e ficou conhecido por isso?",
    options: ["Salomão", "Ezequias", "Samuel", "Elias"],
    correctIndex: 0,
    explanation:
      "Salomão pediu sabedoria para governar o povo, e Deus se agradou de sua oração.",
    verseReference: "1 Reis 3,9-12",
  },
];

function daySeed(date: Date) {
  const iso = date.toISOString().slice(0, 10);
  return Array.from(iso).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function pickQuestions(date: Date): QuizQuestion[] {
  const pool = [...FALLBACK_QUESTION_BANK];
  const seed = daySeed(date);
  const picked: QuizQuestion[] = [];

  for (let i = 0; i < 5; i += 1) {
    const index = (seed + i * 7) % pool.length;
    picked.push(pool.splice(index, 1)[0]!);
  }

  return picked;
}

export function buildFallbackQuiz(date: Date): QuizRecord {
  return {
    id: quizDocId(date),
    date,
    questions: pickQuestions(date),
    source: "SEED",
  };
}
