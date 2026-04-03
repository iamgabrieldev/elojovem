export type Mystery = {
  title: string;
  fruit: string;
  scripture: string;
};

export type MysterySet = {
  name: "Gozosos" | "Dolorosos" | "Gloriosos" | "Luminosos";
  mysteries: Mystery[];
};

export function getMysterySetForToday(date = new Date()): MysterySet {
  const day = date.getDay(); // 0=Dom ... 6=Sáb
  // Domingo: Gloriosos
  // Segunda/Sábado: Gozosos
  // Terça/Sexta: Dolorosos
  // Quarta: Gloriosos
  // Quinta: Luminosos
  if (day === 4) return luminous;
  if (day === 0 || day === 3) return glorious;
  if (day === 2 || day === 5) return sorrowful;
  return joyful;
}

export const prayers = {
  signOfCross: "Em nome do Pai, do Filho e do Espírito Santo. Amém.",
  apostlesCreed:
    "Creio em Deus Pai todo-poderoso, Criador do céu e da terra; e em Jesus Cristo, seu único Filho, nosso Senhor...",
  ourFather:
    "Pai nosso que estais nos céus, santificado seja o vosso nome; venha a nós o vosso Reino; seja feita a vossa vontade, assim na terra como no céu. " +
    "O pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido; " +
    "e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.",
  hailMary:
    "Ave Maria, cheia de graça, o Senhor é convosco. Bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. " +
    "Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora de nossa morte. Amém.",
  gloryBe:
    "Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.",
  fatima:
    "Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, levai as almas todas para o céu e socorrei principalmente as que mais precisarem.",
  hailHolyQueen:
    "Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! " +
    "A vós bradamos, os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas. " +
    "Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei; e, depois deste desterro, mostrai-nos Jesus, " +
    "bendito fruto do vosso ventre. Ó clemente, ó piedosa, ó doce sempre Virgem Maria. " +
    "Rogai por nós, Santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.",
};

const joyful: MysterySet = {
  name: "Gozosos",
  mysteries: [
    { title: "A Anunciação do Senhor", fruit: "Humildade", scripture: "Lc 1,26-38" },
    { title: "A Visitação de Nossa Senhora", fruit: "Caridade", scripture: "Lc 1,39-56" },
    { title: "O Nascimento de Jesus", fruit: "Pobreza de espírito", scripture: "Lc 2,1-20" },
    { title: "A Apresentação no Templo", fruit: "Obediência", scripture: "Lc 2,22-35" },
    { title: "O Encontro no Templo", fruit: "Zelo pelas coisas de Deus", scripture: "Lc 2,41-52" },
  ],
};

const sorrowful: MysterySet = {
  name: "Dolorosos",
  mysteries: [
    { title: "A Agonia no Horto", fruit: "Contrição", scripture: "Mt 26,36-46" },
    { title: "A Flagelação de Jesus", fruit: "Pureza", scripture: "Jo 19,1" },
    { title: "A Coroação de Espinhos", fruit: "Coragem", scripture: "Mt 27,27-31" },
    { title: "Jesus Carrega a Cruz", fruit: "Paciência", scripture: "Lc 23,26-32" },
    { title: "A Crucificação e Morte", fruit: "Perseverança", scripture: "Lc 23,33-49" },
  ],
};

const glorious: MysterySet = {
  name: "Gloriosos",
  mysteries: [
    { title: "A Ressurreição", fruit: "Fé", scripture: "Lc 24,1-12" },
    { title: "A Ascensão", fruit: "Esperança", scripture: "At 1,6-11" },
    { title: "Pentecostes", fruit: "Dom do Espírito Santo", scripture: "At 2,1-13" },
    { title: "A Assunção de Maria", fruit: "União com Deus", scripture: "Ap 12,1" },
    { title: "A Coroação de Maria", fruit: "Confiança", scripture: "Ap 12,1" },
  ],
};

const luminous: MysterySet = {
  name: "Luminosos",
  mysteries: [
    { title: "O Batismo de Jesus", fruit: "Disponibilidade", scripture: "Mt 3,13-17" },
    { title: "As Bodas de Caná", fruit: "Confiança", scripture: "Jo 2,1-11" },
    { title: "O Anúncio do Reino", fruit: "Conversão", scripture: "Mc 1,14-15" },
    { title: "A Transfiguração", fruit: "Escuta", scripture: "Lc 9,28-36" },
    { title: "A Eucaristia", fruit: "Adoração", scripture: "Lc 22,14-20" },
  ],
};

