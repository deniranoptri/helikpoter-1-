export type ChallengeType = 'IDENTIFY' | 'CALCULATE' | 'CLASSIFY' | 'SEQUENCE' | 'LOCATE' | 'PRIORITIZE' | 'MULTI_TARGET' | 'LEGACY';

export interface EducationalContent {
  id: string;
  
  // Legacy fields
  subject?: string;
  topic?: string;
  gradeBand?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  
  // Canonical Content Hierarchy fields
  jenjang?: string;
  kelasAtauFase?: string;
  mataPelajaran?: string;
  topik?: string;
  pertanyaan?: string;
  jawabanBenar?: string;
  jawabanBenarMulti?: string[]; // Multiple correct answers
  pengecoh?: string[];
  sequenceAnswers?: string[];
  
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  explanation: string;
  
  challengeType?: ChallengeType;
  
  // Optional metadata
  competency?: string;
  learningObjective?: string;
  cpId?: string;
  tpId?: string;
  mediaType?: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'NONE';
  mediaUrl?: string;
  tags?: string[];
}

export interface EducationalFilter {
  subject?: string;
  topic?: string;
  gradeBand?: string;
  jenjang?: string;
  kelasAtauFase?: string;
  mataPelajaran?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  challengeType?: ChallengeType;
}

export interface AnswerResult {
  correct: boolean;
  explanation: string;
}

export interface EducationalSessionState {
  questionsPresented: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export class EducationalEngine {
  static currentSumberSoal: 'BAWAAN' | 'GURU' = 'BAWAAN';
  static activeTeacherContent: EducationalContent[] = [];
  static activeFase?: string;
  private content: EducationalContent[] = [];
  private questionOrder: number[] = [];
  private sessionState: EducationalSessionState = {
    questionsPresented: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
  };

  // Gameplay integration contract
  public onEducationalChallengeRequired: (() => void) | null = null;

  registerContent(items: EducationalContent[]) {
    this.content.push(...items);
  }

  getContentById(id: string): EducationalContent | undefined {
    const sourceContent = EducationalEngine.currentSumberSoal === 'GURU' 
      ? EducationalEngine.activeTeacherContent 
      : this.content;
    return sourceContent.find(c => c.id === id);
  }

  getContent(filter: EducationalFilter): EducationalContent[] {
    const sourceContent = EducationalEngine.currentSumberSoal === 'GURU' 
      ? EducationalEngine.activeTeacherContent 
      : this.content;
    return sourceContent.filter(c => {
      if (EducationalEngine.activeFase && c.kelasAtauFase !== EducationalEngine.activeFase) return false;
      if (filter.subject && c.subject !== filter.subject && c.mataPelajaran !== filter.subject) return false;
      if (filter.mataPelajaran && c.mataPelajaran !== filter.mataPelajaran && c.subject !== filter.mataPelajaran) return false;
      if (filter.topic && c.topic !== filter.topic && c.topik !== filter.topic) return false;
      if (filter.gradeBand && c.gradeBand !== filter.gradeBand && c.jenjang !== filter.gradeBand) return false;
      if (filter.jenjang && c.jenjang !== filter.jenjang && c.gradeBand !== filter.jenjang) return false;
      if (filter.kelasAtauFase && c.kelasAtauFase !== filter.kelasAtauFase) return false;
      if (filter.difficulty && c.difficulty !== filter.difficulty) return false;
      if (filter.challengeType && c.challengeType !== filter.challengeType) return false;
      return true;
    });
  }

  getRandomQuestion(filter: EducationalFilter): EducationalContent | undefined {
    const questions = this.getContent(filter);
    if (questions.length === 0) return undefined;
    
    // Initialize or re-initialize shuffle order if pool size changes
    if (this.questionOrder.length !== questions.length) {
      this.questionOrder = Array.from({ length: questions.length }, (_, i) => i);
      for (let i = this.questionOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.questionOrder[i], this.questionOrder[j]] = [this.questionOrder[j], this.questionOrder[i]];
      }
    }
    
    const idx = this.questionOrder[this.sessionState.questionsPresented % questions.length];
    const q = questions[idx];
    this.sessionState.questionsPresented++;
    return q;
  }

  checkAnswer(questionId: string, answer: string): AnswerResult {
    const q = this.getContentById(questionId);
    this.sessionState.questionsAnswered++;
    if (!q) {
        this.sessionState.incorrectAnswers++;
        return { correct: false, explanation: "Question not found." };
    }
    const isCorrect = (q.correctAnswer === answer) || (q.jawabanBenar === answer);
    if (isCorrect) {
      this.sessionState.correctAnswers++;
    } else {
      this.sessionState.incorrectAnswers++;
    }
    return {
      correct: isCorrect,
      explanation: q.explanation
    };
  }

  getSessionState(): EducationalSessionState {
    return { ...this.sessionState };
  }

  resetSession() {
    this.sessionState = {
      questionsPresented: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
    };
    this.questionOrder = [];
  }
}

export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent[] = [
  {
    "id": "sd_ipas_1",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Kebutuhan",
    "pertanyaan": "Air sangat penting untuk apa?",
    "jawabanBenar": "Minum",
    "pengecoh": [
      "Bernapas",
      "Berlari",
      "Tidur"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Minum."
  },
  {
    "id": "sd_ipas_2",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Lingkungan",
    "pertanyaan": "Apa akibatnya jika hutan ditebang?",
    "jawabanBenar": "Banjir",
    "pengecoh": [
      "Panen",
      "Gempa",
      "Tsunami"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Banjir."
  },
  {
    "id": "sd_ipas_3",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Hewan",
    "pertanyaan": "Hewan pemakan tumbuhan disebut apa?",
    "jawabanBenar": "Herbivor",
    "pengecoh": [
      "Karnivor",
      "Omnivor",
      "Predator"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Herbivor."
  },
  {
    "id": "sd_ipas_4",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Tumbuhan",
    "pertanyaan": "Bagian tumbuhan untuk menyerap air adalah?",
    "jawabanBenar": "Akar",
    "pengecoh": [
      "Daun",
      "Bunga",
      "Batang"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Akar."
  },
  {
    "id": "sd_ipas_5",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Tumbuhan",
    "pertanyaan": "Bagian tumbuhan tempat fotosintesis adalah?",
    "jawabanBenar": "Daun",
    "pengecoh": [
      "Akar",
      "Buah",
      "Biji"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Daun."
  },
  {
    "id": "sd_ipas_6",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Benda",
    "pertanyaan": "Benda yang bentuknya selalu tetap adalah?",
    "jawabanBenar": "Padat",
    "pengecoh": [
      "Cair",
      "Gas",
      "Asap"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Padat."
  },
  {
    "id": "sd_ipas_7",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Benda",
    "pertanyaan": "Es batu mencair menjadi apa?",
    "jawabanBenar": "Cair",
    "pengecoh": [
      "Padat",
      "Gas",
      "Uap"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Cair."
  },
  {
    "id": "sd_ipas_8",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Energi",
    "pertanyaan": "Sumber panas utama di bumi adalah?",
    "jawabanBenar": "Matahari",
    "pengecoh": [
      "Api",
      "Bulan",
      "Bintang"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Matahari."
  },
  {
    "id": "sd_ipas_9",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Hewan",
    "pertanyaan": "Hewan yang bernapas dengan insang adalah?",
    "jawabanBenar": "Ikan",
    "pengecoh": [
      "Burung",
      "Kucing",
      "Katak"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Ikan."
  },
  {
    "id": "sd_ipas_10",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Tubuh",
    "pertanyaan": "Alat indra untuk melihat adalah?",
    "jawabanBenar": "Mata",
    "pengecoh": [
      "Telinga",
      "Hidung",
      "Kulit"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Mata."
  },
  {
    "id": "sd_ipas_11",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Gaya",
    "pertanyaan": "Buah jatuh dari pohon karena gaya apa?",
    "jawabanBenar": "Gravitasi",
    "pengecoh": [
      "Magnet",
      "Gesek",
      "Pegas"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Gravitasi."
  },
  {
    "id": "sd_ipas_12",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Gaya",
    "pertanyaan": "Gaya tarik pada magnet paling kuat di mana?",
    "jawabanBenar": "Kutub",
    "pengecoh": [
      "Tengah",
      "Samping",
      "Atas"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Kutub."
  },
  {
    "id": "sd_ipas_13",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Benda",
    "pertanyaan": "Air yang dipanaskan akan menjadi apa?",
    "jawabanBenar": "Uap",
    "pengecoh": [
      "Es",
      "Padat",
      "Batu"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Uap."
  },
  {
    "id": "sd_ipas_14",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Hewan",
    "pertanyaan": "Katak mengalami perubahan bentuk tubuh, disebut?",
    "jawabanBenar": "Metamorfosis",
    "pengecoh": [
      "Fotosintesis",
      "Adaptasi",
      "Mutasi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Metamorfosis."
  },
  {
    "id": "sd_ipas_15",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Ekosistem",
    "pertanyaan": "Tempat tinggal makhluk hidup disebut apa?",
    "jawabanBenar": "Habitat",
    "pengecoh": [
      "Populasi",
      "Komunitas",
      "Bioma"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Habitat."
  },
  {
    "id": "sd_ipas_16",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Lingkungan",
    "pertanyaan": "Membuang sampah di sungai dapat menyebabkan?",
    "jawabanBenar": "Banjir",
    "pengecoh": [
      "Longsor",
      "Tsunami",
      "Kemarau"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Banjir."
  },
  {
    "id": "sd_ipas_17",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Tata Surya",
    "pertanyaan": "Planet tempat kita tinggal adalah?",
    "jawabanBenar": "Bumi",
    "pengecoh": [
      "Mars",
      "Venus",
      "Jupiter"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Bumi."
  },
  {
    "id": "sd_ipas_18",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Tata Surya",
    "pertanyaan": "Pusat tata surya kita adalah?",
    "jawabanBenar": "Matahari",
    "pengecoh": [
      "Bulan",
      "Bumi",
      "Bintang"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Matahari."
  },
  {
    "id": "sd_ipas_19",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Cahaya",
    "pertanyaan": "Sifat cahaya yang mengenai cermin datar adalah?",
    "jawabanBenar": "Memantul",
    "pengecoh": [
      "Menembus",
      "Membias",
      "Menyerap"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Memantul."
  },
  {
    "id": "sd_ipas_20",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Bunyi",
    "pertanyaan": "Alat musik gitar dimainkan dengan cara?",
    "jawabanBenar": "Dipetik",
    "pengecoh": [
      "Ditiup",
      "Dipukul",
      "Digesek"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Dipetik."
  },
  {
    "id": "sd_ipas_21",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Sumber Daya",
    "pertanyaan": "Minyak bumi termasuk sumber daya yang?",
    "jawabanBenar": "Habis",
    "pengecoh": [
      "Kekal",
      "Terbarukan",
      "Melimpah"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Habis."
  },
  {
    "id": "sd_ipas_22",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Hewan",
    "pertanyaan": "Hewan yang aktif di malam hari disebut?",
    "jawabanBenar": "Nokturnal",
    "pengecoh": [
      "Diurnal",
      "Karnivor",
      "Mamalia"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Nokturnal."
  },
  {
    "id": "sd_ipas_23",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Tumbuhan",
    "pertanyaan": "Tumbuhan melindungi diri dengan duri contohnya?",
    "jawabanBenar": "Mawar",
    "pengecoh": [
      "Melati",
      "Pisang",
      "Mangga"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Mawar."
  },
  {
    "id": "sd_ipas_24",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Energi",
    "pertanyaan": "Alat yang mengubah energi listrik menjadi cahaya?",
    "jawabanBenar": "Lampu",
    "pengecoh": [
      "Kipas",
      "Setrika",
      "Radio"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Lampu."
  },
  {
    "id": "sd_ipas_25",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Energi",
    "pertanyaan": "Kincir angin bergerak menggunakan energi?",
    "jawabanBenar": "Angin",
    "pengecoh": [
      "Air",
      "Panas",
      "Listrik"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Angin."
  },
  {
    "id": "sd_ipas_26",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Tubuh",
    "pertanyaan": "Tulang penyusun rangka kepala disebut?",
    "jawabanBenar": "Tengkorak",
    "pengecoh": [
      "Rusuk",
      "Panggul",
      "Lengan"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Tengkorak."
  },
  {
    "id": "sd_ipas_27",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Pencernaan",
    "pertanyaan": "Pencernaan makanan pertama kali terjadi di mana?",
    "jawabanBenar": "Mulut",
    "pengecoh": [
      "Lambung",
      "Usus",
      "Kerongkongan"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Mulut."
  },
  {
    "id": "sd_ipas_28",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Cuaca",
    "pertanyaan": "Awan hitam yang membawa hujan disebut?",
    "jawabanBenar": "Mendung",
    "pengecoh": [
      "Cerah",
      "Kabut",
      "Pelangi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Mendung."
  },
  {
    "id": "sd_ipas_29",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Lingkungan",
    "pertanyaan": "Penanaman kembali hutan yang gundul disebut?",
    "jawabanBenar": "Reboisasi",
    "pengecoh": [
      "Erosi",
      "Irigasi",
      "Terasering"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Reboisasi."
  },
  {
    "id": "sd_ipas_30",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "IPAS",
    "topik": "Ekosistem",
    "pertanyaan": "Peran padi dalam rantai makanan adalah?",
    "jawabanBenar": "Produsen",
    "pengecoh": [
      "Konsumen",
      "Pengurai",
      "Predator"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Produsen."
  },
  {
    "id": "sd_mat_1",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Penjumlahan",
    "pertanyaan": "Berapa 5 ditambah 4?",
    "jawabanBenar": "9",
    "pengecoh": [
      "8",
      "10",
      "7"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 9."
  },
  {
    "id": "sd_mat_2",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pengurangan",
    "pertanyaan": "Berapa 10 dikurangi 3?",
    "jawabanBenar": "7",
    "pengecoh": [
      "6",
      "8",
      "5"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 7."
  },
  {
    "id": "sd_mat_3",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Penjumlahan",
    "pertanyaan": "Berapa 12 + 8?",
    "jawabanBenar": "20",
    "pengecoh": [
      "18",
      "22",
      "24"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 20."
  },
  {
    "id": "sd_mat_4",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pecahan",
    "pertanyaan": "Setengah dari 20 adalah?",
    "jawabanBenar": "10",
    "pengecoh": [
      "5",
      "15",
      "20"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 10."
  },
  {
    "id": "sd_mat_5",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Kontekstual",
    "pertanyaan": "Rina punya 8 apel. Ia memberi 3. Sisa apel?",
    "jawabanBenar": "5",
    "pengecoh": [
      "3",
      "4",
      "6"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 5."
  },
  {
    "id": "sd_mat_6",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Perkalian",
    "pertanyaan": "Berapa 4 dikali 3?",
    "jawabanBenar": "12",
    "pengecoh": [
      "7",
      "10",
      "15"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 12."
  },
  {
    "id": "sd_mat_7",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pembagian",
    "pertanyaan": "15 dibagi 3 sama dengan?",
    "jawabanBenar": "5",
    "pengecoh": [
      "3",
      "4",
      "6"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 5."
  },
  {
    "id": "sd_mat_8",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Bangun Datar",
    "pertanyaan": "Bangun ruang yang memiliki 3 sisi adalah?",
    "jawabanBenar": "Segitiga",
    "pengecoh": [
      "Persegi",
      "Lingkaran",
      "Balok"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah Segitiga."
  },
  {
    "id": "sd_mat_9",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pengukuran",
    "pertanyaan": "1 meter sama dengan berapa sentimeter?",
    "jawabanBenar": "100",
    "pengecoh": [
      "10",
      "1000",
      "1"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 100."
  },
  {
    "id": "sd_mat_10",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Waktu",
    "pertanyaan": "1 jam ada berapa menit?",
    "jawabanBenar": "60",
    "pengecoh": [
      "30",
      "12",
      "24"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 60."
  },
  {
    "id": "sd_mat_11",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Kontekstual",
    "pertanyaan": "Budi beli 2 buku. Tiap buku harganya 5. Total?",
    "jawabanBenar": "10",
    "pengecoh": [
      "7",
      "5",
      "15"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 10."
  },
  {
    "id": "sd_mat_12",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pola",
    "pertanyaan": "Lanjutkan urutan: 2, 4, 6, 8, ...",
    "jawabanBenar": "10",
    "pengecoh": [
      "9",
      "12",
      "14"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 10."
  },
  {
    "id": "sd_mat_13",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Bangun Ruang",
    "pertanyaan": "Dadu berbentuk bangun ruang apa?",
    "jawabanBenar": "Kubus",
    "pengecoh": [
      "Balok",
      "Tabung",
      "Bola"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah Kubus."
  },
  {
    "id": "sd_mat_14",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pecahan",
    "pertanyaan": "Satu dibagi dua ditulis sebagai?",
    "jawabanBenar": "1/2",
    "pengecoh": [
      "1/3",
      "2/1",
      "1/4"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 1/2."
  },
  {
    "id": "sd_mat_15",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pengurangan",
    "pertanyaan": "Berapa 25 - 10?",
    "jawabanBenar": "15",
    "pengecoh": [
      "5",
      "10",
      "20"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 15."
  },
  {
    "id": "sd_mat_16",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Perkalian",
    "pertanyaan": "Berapa 6 x 5?",
    "jawabanBenar": "30",
    "pengecoh": [
      "25",
      "35",
      "11"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 30."
  },
  {
    "id": "sd_mat_17",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pembagian",
    "pertanyaan": "20 dibagi 4 adalah?",
    "jawabanBenar": "5",
    "pengecoh": [
      "4",
      "6",
      "16"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 5."
  },
  {
    "id": "sd_mat_18",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pengukuran",
    "pertanyaan": "1 kilogram sama dengan berapa gram?",
    "jawabanBenar": "1000",
    "pengecoh": [
      "100",
      "10",
      "10000"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 1000."
  },
  {
    "id": "sd_mat_19",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Waktu",
    "pertanyaan": "1 minggu terdiri dari berapa hari?",
    "jawabanBenar": "7",
    "pengecoh": [
      "5",
      "6",
      "30"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 7."
  },
  {
    "id": "sd_mat_20",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Sudut",
    "pertanyaan": "Sudut siku-siku besarnya berapa derajat?",
    "jawabanBenar": "90",
    "pengecoh": [
      "45",
      "60",
      "180"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 90."
  },
  {
    "id": "sd_mat_21",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Kontekstual",
    "pertanyaan": "Ada 10 burung. 4 terbang. Berapa sisanya?",
    "jawabanBenar": "6",
    "pengecoh": [
      "4",
      "5",
      "14"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 6."
  },
  {
    "id": "sd_mat_22",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pola",
    "pertanyaan": "Lanjutkan: 5, 10, 15, 20, ...",
    "jawabanBenar": "25",
    "pengecoh": [
      "21",
      "30",
      "35"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 25."
  },
  {
    "id": "sd_mat_23",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Bangun Datar",
    "pertanyaan": "Bangun yang tidak memiliki sudut adalah?",
    "jawabanBenar": "Lingkaran",
    "pengecoh": [
      "Segitiga",
      "Persegi",
      "Layang"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah Lingkaran."
  },
  {
    "id": "sd_mat_24",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Penjumlahan",
    "pertanyaan": "Berapa 50 + 50?",
    "jawabanBenar": "100",
    "pengecoh": [
      "10",
      "500",
      "150"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 100."
  },
  {
    "id": "sd_mat_25",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Pengurangan",
    "pertanyaan": "Berapa 100 - 25?",
    "jawabanBenar": "75",
    "pengecoh": [
      "50",
      "25",
      "125"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 75."
  },
  {
    "id": "sd_mat_26",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Perkalian",
    "pertanyaan": "Berapa 7 x 7?",
    "jawabanBenar": "49",
    "pengecoh": [
      "42",
      "14",
      "56"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 49."
  },
  {
    "id": "sd_mat_27",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Uang",
    "pertanyaan": "Tiga koin 500 rupiah bernilai berapa?",
    "jawabanBenar": "1500",
    "pengecoh": [
      "500",
      "1000",
      "2000"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 1500."
  },
  {
    "id": "sd_mat_28",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Waktu",
    "pertanyaan": "Satu tahun ada berapa bulan?",
    "jawabanBenar": "12",
    "pengecoh": [
      "10",
      "6",
      "24"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 12."
  },
  {
    "id": "sd_mat_29",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Bangun Ruang",
    "pertanyaan": "Kaleng susu berbentuk bangun ruang apa?",
    "jawabanBenar": "Tabung",
    "pengecoh": [
      "Kubus",
      "Kerucut",
      "Bola"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah Tabung."
  },
  {
    "id": "sd_mat_30",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Matematika",
    "topik": "Kontekstual",
    "pertanyaan": "Doni punya 3 kantong, tiap kantong isi 5 kelereng. Total?",
    "jawabanBenar": "15",
    "pengecoh": [
      "8",
      "10",
      "20"
    ],
    "challengeType": "CALCULATE",
    "difficulty": "EASY",
    "explanation": "Hasil dari operasi matematika tersebut adalah 15."
  },
  {
    "id": "smp_ipa_1",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Fotosintesis",
    "pertanyaan": "Mengapa daun terlihat berwarna hijau?",
    "jawabanBenar": "Klorofil",
    "pengecoh": [
      "Air",
      "Sinar",
      "Tanah"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "MEDIUM",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Klorofil."
  },
  {
    "id": "smp_ipa_2",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tumbuhan",
    "pertanyaan": "Apa fungsi utama dari akar tanaman?",
    "jawabanBenar": "Serap air",
    "pengecoh": [
      "Cahaya",
      "Napas",
      "Buah"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Serap air."
  },
  {
    "id": "smp_ips_1",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Geografi",
    "pertanyaan": "Apa yang menyebabkan angin darat terjadi?",
    "jawabanBenar": "Suhu",
    "pengecoh": [
      "Gravitasi",
      "Hujan",
      "Awan"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Suhu."
  },
  {
    "id": "smp_ips_2",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta",
    "pertanyaan": "Apa nama letak berdasarkan garis lintang?",
    "jawabanBenar": "Astronomis",
    "pengecoh": [
      "Geografis",
      "Geologis",
      "Kultural"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Astronomis."
  },
  {
    "id": "sma_bio_1",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sel",
    "pertanyaan": "Organel mana yang menghasilkan energi seluler?",
    "jawabanBenar": "Mitokondria",
    "pengecoh": [
      "Ribosom",
      "Nukleus",
      "Vakuola"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Mitokondria."
  },
  {
    "id": "sma_bio_2",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Enzim amilase pada ludah memecah molekul apa?",
    "jawabanBenar": "Karbohidrat",
    "pengecoh": [
      "Protein",
      "Lemak",
      "Vitamin"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Karbohidrat."
  },
  {
    "id": "sma_fis_1",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Listrik",
    "pertanyaan": "Apa satuan besaran tegangan listrik internasional?",
    "jawabanBenar": "Volt",
    "pengecoh": [
      "Ampere",
      "Watt",
      "Ohm"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Volt."
  },
  {
    "id": "sma_fis_2",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Kinematika",
    "pertanyaan": "Perubahan kecepatan per satuan waktu disebut?",
    "jawabanBenar": "Percepatan",
    "pengecoh": [
      "Kecepatan",
      "Gaya",
      "Massa"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Secara ilmiah, jawaban yang paling tepat untuk fenomena ini adalah Percepatan."
  },
  {
    "id": "sd_pkn_1",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Simbol",
    "pertanyaan": "Sila pertama Pancasila dilambangkan dengan apa?",
    "jawabanBenar": "Bintang",
    "pengecoh": [
      "Rantai",
      "Pohon",
      "Banteng"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Bintang."
  },
  {
    "id": "sd_pkn_2",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Perilaku",
    "pertanyaan": "Sebelum makan, kita sebaiknya melakukan apa?",
    "jawabanBenar": "Berdoa",
    "pengecoh": [
      "Bermain",
      "Berlari",
      "Tidur"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Berdoa."
  },
  {
    "id": "sd_pkn_3",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Gotong Royong",
    "pertanyaan": "Membersihkan kelas bersama-sama disebut apa?",
    "jawabanBenar": "Gotong royong",
    "pengecoh": [
      "Bermain",
      "Persaingan",
      "Pertengkaran"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Gotong royong."
  },
  {
    "id": "sd_pkn_4",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Sikap",
    "pertanyaan": "Jika teman sakit, apa yang sebaiknya dilakukan?",
    "jawabanBenar": "Menjenguk",
    "pengecoh": [
      "Mengejek",
      "Menjauhi",
      "Memusuhi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Menjenguk."
  },
  {
    "id": "sd_pkn_5",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Aturan",
    "pertanyaan": "Lampu lalu lintas merah artinya apa?",
    "jawabanBenar": "Berhenti",
    "pengecoh": [
      "Jalan",
      "Lari",
      "Ngebut"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Berhenti."
  },
  {
    "id": "sd_pkn_6",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak & Kewajiban",
    "pertanyaan": "Belajar dengan rajin adalah tugas seorang apa?",
    "jawabanBenar": "Siswa",
    "pengecoh": [
      "Guru",
      "Dokter",
      "Polisi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Siswa."
  },
  {
    "id": "sd_pkn_7",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Toleransi",
    "pertanyaan": "Teman sedang beribadah, kita harus bersikap apa?",
    "jawabanBenar": "Tenang",
    "pengecoh": [
      "Ribut",
      "Mengganggu",
      "Berteriak"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Tenang."
  },
  {
    "id": "sd_pkn_8",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Musyawarah",
    "pertanyaan": "Menyelesaikan masalah bersama disebut apa?",
    "jawabanBenar": "Musyawarah",
    "pengecoh": [
      "Memaksa",
      "Bertengkar",
      "Menangis"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "MEDIUM",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Musyawarah."
  },
  {
    "id": "sd_pkn_9",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Persatuan",
    "pertanyaan": "Walaupun berbeda suku, kita harus tetap apa?",
    "jawabanBenar": "Rukun",
    "pengecoh": [
      "Bermusuhan",
      "Berdebat",
      "Egois"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Rukun."
  },
  {
    "id": "sd_pkn_10",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Simbol",
    "pertanyaan": "Simbol padi dan kapas ada pada sila ke?",
    "jawabanBenar": "Mendengarkan usulan orang lain dengan menghargai perbedaan",
    "pengecoh": [
      "Satu",
      "Dua",
      "Tiga"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Lima."
  },
  {
    "id": "sd_pkn_11",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Perilaku",
    "pertanyaan": "Bertemu guru di jalan sebaiknya kita apa?",
    "jawabanBenar": "Menyapa",
    "pengecoh": [
      "Diam",
      "Sembunyi",
      "Lari"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Menyapa."
  },
  {
    "id": "sd_pkn_12",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Kejujuran",
    "pertanyaan": "Menemukan uang di kelas, sebaiknya diberikan ke?",
    "jawabanBenar": "Guru",
    "pengecoh": [
      "Jajan",
      "Sembunyikan",
      "Dibuang"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Guru."
  },
  {
    "id": "sd_pkn_13",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak & Kewajiban",
    "pertanyaan": "Mendapat kasih sayang adalah contoh dari apa?",
    "jawabanBenar": "Hak",
    "pengecoh": [
      "Kewajiban",
      "Tugas",
      "Hukuman"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Hak."
  },
  {
    "id": "sd_pkn_14",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Sikap",
    "pertanyaan": "Saat meminjam barang teman, kita harus bilang?",
    "jawabanBenar": "Izin",
    "pengecoh": [
      "Diam",
      "Maksa",
      "Rebut"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Izin."
  },
  {
    "id": "sd_pkn_15",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Simbol",
    "pertanyaan": "Lambang negara Indonesia adalah burung apa?",
    "jawabanBenar": "Garuda",
    "pengecoh": [
      "Merpati",
      "Elang",
      "Gagak"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Garuda."
  },
  {
    "id": "sd_pkn_16",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Aturan",
    "pertanyaan": "Membuang sampah sebaiknya di mana?",
    "jawabanBenar": "Tempat sampah",
    "pengecoh": [
      "Sungai",
      "Jalan",
      "Kelas"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Tempat sampah."
  },
  {
    "id": "sd_pkn_17",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Toleransi",
    "pertanyaan": "Jika ada teman yang berbeda agama, kita?",
    "jawabanBenar": "Menghargai",
    "pengecoh": [
      "Mengejek",
      "Menghina",
      "Menjauhi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Menghargai."
  },
  {
    "id": "sd_pkn_18",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Musyawarah",
    "pertanyaan": "Pemilihan ketua kelas biasanya dengan cara?",
    "jawabanBenar": "Musyawarah",
    "pengecoh": [
      "Tebak",
      "Undian",
      "Paksaan"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Musyawarah."
  },
  {
    "id": "sd_pkn_19",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Gotong Royong",
    "pertanyaan": "Pekerjaan berat akan terasa ringan jika dikerjakan?",
    "jawabanBenar": "Bersama",
    "pengecoh": [
      "Sendiri",
      "Terpaksa",
      "Lama"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Bersama."
  },
  {
    "id": "sd_pkn_20",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Perilaku",
    "pertanyaan": "Sikap kita kepada orang tua haruslah?",
    "jawabanBenar": "Hormat",
    "pengecoh": [
      "Melawan",
      "Cuek",
      "Kasar"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Hormat."
  },
  {
    "id": "sd_pkn_21",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Simbol",
    "pertanyaan": "Rantai emas adalah lambang sila ke berapa?",
    "jawabanBenar": "Rela berkorban untuk kepentingan bangsa dan negara",
    "pengecoh": [
      "Mengutamakan kepentingan keluarga di atas kepentingan negara",
      "Menyerang budaya negara lain yang berbeda",
      "Hanya berteman dengan orang dari suku sama"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Dua."
  },
  {
    "id": "sd_pkn_22",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Persatuan",
    "pertanyaan": "Bersatu kita teguh, bercerai kita apa?",
    "jawabanBenar": "Runtuh",
    "pengecoh": [
      "Kuat",
      "Menang",
      "Hebat"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Runtuh."
  },
  {
    "id": "sd_pkn_23",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Aturan",
    "pertanyaan": "Jika berbuat salah, kita sebaiknya mengucapkan apa?",
    "jawabanBenar": "Maaf",
    "pengecoh": [
      "Terima",
      "Tolong",
      "Permisi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Maaf."
  },
  {
    "id": "sd_pkn_24",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Sikap",
    "pertanyaan": "Orang yang membantu orang lain disebut anak yang?",
    "jawabanBenar": "Baik",
    "pengecoh": [
      "Nakal",
      "Sombong",
      "Malas"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Baik."
  },
  {
    "id": "sd_pkn_25",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak & Kewajiban",
    "pertanyaan": "Menjaga kebersihan rumah adalah tugas dari siapa?",
    "jawabanBenar": "Semua",
    "pengecoh": [
      "Ibu",
      "Ayah",
      "Kakak"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Semua."
  },
  {
    "id": "sd_pkn_26",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Gotong Royong",
    "pertanyaan": "Siskamling adalah bentuk dari kegiatan apa?",
    "jawabanBenar": "Kerja bakti",
    "pengecoh": [
      "Bermain",
      "Pesta",
      "Belajar"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Kerja bakti."
  },
  {
    "id": "sd_pkn_27",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Toleransi",
    "pertanyaan": "Indonesia memiliki semboyan Bhinneka Tunggal apa?",
    "jawabanBenar": "Ika",
    "pengecoh": [
      "Eka",
      "Aka",
      "Ita"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Ika."
  },
  {
    "id": "sd_pkn_28",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Perilaku",
    "pertanyaan": "Saat menerima hadiah, kita harus mengucapkan apa?",
    "jawabanBenar": "Terima kasih",
    "pengecoh": [
      "Maaf",
      "Tolong",
      "Halo"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Terima kasih."
  },
  {
    "id": "sd_pkn_29",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Sikap",
    "pertanyaan": "Mencontek saat ujian adalah perbuatan yang?",
    "jawabanBenar": "Buruk",
    "pengecoh": [
      "Baik",
      "Hebat",
      "Boleh"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Buruk."
  },
  {
    "id": "sd_pkn_30",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Simbol",
    "pertanyaan": "Sila ketiga Pancasila dilambangkan dengan pohon?",
    "jawabanBenar": "Beringin",
    "pengecoh": [
      "Mangga",
      "Pisang",
      "Jati"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Tindakan atau simbol yang sesuai dengan nilai Pancasila adalah Beringin."
  },
  {
    "id": "sd_bind_1",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kosakata",
    "pertanyaan": "Antonim dari kata panjang adalah?",
    "jawabanBenar": "Pendek",
    "pengecoh": [
      "Besar",
      "Lebar",
      "Tinggi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Antonim (lawan kata) yang tepat adalah Pendek."
  },
  {
    "id": "sd_bind_2",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kosakata",
    "pertanyaan": "Sinonim dari kata pintar adalah?",
    "jawabanBenar": "Pandai",
    "pengecoh": [
      "Bodoh",
      "Malas",
      "Jahat"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Sinonim (persamaan kata) yang tepat adalah Pandai."
  },
  {
    "id": "sd_bind_3",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Membaca",
    "pertanyaan": "\"Budi rajin membaca\". Siapa yang rajin?",
    "jawabanBenar": "Budi",
    "pengecoh": [
      "Membaca",
      "Rajin",
      "Buku"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Budi."
  },
  {
    "id": "sd_bind_4",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Tanda Baca",
    "pertanyaan": "Kalimat tanya diakhiri dengan tanda apa?",
    "jawabanBenar": "Tanya (?)",
    "pengecoh": [
      "Titik (.)",
      "Seru (!)",
      "Koma (,)"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Tanya (?)."
  },
  {
    "id": "sd_bind_5",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Tanda Baca",
    "pertanyaan": "Kalimat perintah diakhiri dengan tanda apa?",
    "jawabanBenar": "Seru (!)",
    "pengecoh": [
      "Titik (.)",
      "Tanya (?)",
      "Kutip (\")"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Seru (!)."
  },
  {
    "id": "sd_bind_6",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Huruf Kapital",
    "pertanyaan": "Nama orang diawali dengan huruf apa?",
    "jawabanBenar": "Kapital",
    "pengecoh": [
      "Kecil",
      "Sambung",
      "Cetak"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Kapital."
  },
  {
    "id": "sd_bind_7",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Pantun",
    "pertanyaan": "Baris pertama dan kedua pantun disebut?",
    "jawabanBenar": "Sampiran",
    "pengecoh": [
      "Isi",
      "Sajak",
      "Bait"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Sampiran."
  },
  {
    "id": "sd_bind_8",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Pantun",
    "pertanyaan": "Baris ketiga dan keempat pantun disebut?",
    "jawabanBenar": "Isi",
    "pengecoh": [
      "Sampiran",
      "Bait",
      "Rima"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Isi."
  },
  {
    "id": "sd_bind_9",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kosakata",
    "pertanyaan": "Tempat untuk meminjam buku disebut?",
    "jawabanBenar": "Perpustakaan",
    "pengecoh": [
      "Kantin",
      "Kelas",
      "UKS"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Perpustakaan."
  },
  {
    "id": "sd_bind_10",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kosakata",
    "pertanyaan": "Orang yang mengemudikan kereta api disebut?",
    "jawabanBenar": "Masinis",
    "pengecoh": [
      "Pilot",
      "Nahkoda",
      "Sopir"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Masinis."
  },
  {
    "id": "sd_bind_11",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kalimat",
    "pertanyaan": "\"Rina menyapu lantai\". Apa kata kerjanya?",
    "jawabanBenar": "Menyapu",
    "pengecoh": [
      "Rina",
      "Lantai",
      "Sapu"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Menyapu."
  },
  {
    "id": "sd_bind_12",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Membaca",
    "pertanyaan": "\"Kucing mengeong\". Siapa yang bersuara?",
    "jawabanBenar": "Kucing",
    "pengecoh": [
      "Anjing",
      "Burung",
      "Tikus"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Kucing."
  },
  {
    "id": "sd_bind_13",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kosakata",
    "pertanyaan": "Lawan kata dari siang adalah?",
    "jawabanBenar": "Malam",
    "pengecoh": [
      "Sore",
      "Pagi",
      "Gelap"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Malam."
  },
  {
    "id": "sd_bind_14",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Ide Pokok",
    "pertanyaan": "Gagasan utama dalam sebuah paragraf disebut?",
    "jawabanBenar": "Ide Pokok",
    "pengecoh": [
      "Simpulan",
      "Judul",
      "Tema"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Ide Pokok."
  },
  {
    "id": "sd_bind_15",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Tanda Baca",
    "pertanyaan": "Tanda untuk memisahkan kata dalam rincian?",
    "jawabanBenar": "Koma (,)",
    "pengecoh": [
      "Titik (.)",
      "Tanya (?)",
      "Seru (!)"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Koma (,)."
  },
  {
    "id": "sd_bind_16",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kosakata",
    "pertanyaan": "Kata sapaan untuk orang tua laki-laki?",
    "jawabanBenar": "Bapak",
    "pengecoh": [
      "Ibu",
      "Kakak",
      "Adik"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Bapak."
  },
  {
    "id": "sd_bind_17",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kalimat",
    "pertanyaan": "\"Adik menangis karena jatuh\". Mengapa adik menangis?",
    "jawabanBenar": "Jatuh",
    "pengecoh": [
      "Sedih",
      "Takut",
      "Marah"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "MEDIUM",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Jatuh."
  },
  {
    "id": "sd_bind_18",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kosakata",
    "pertanyaan": "Orang yang memeriksa pasien sakit disebut?",
    "jawabanBenar": "Dokter",
    "pengecoh": [
      "Guru",
      "Polisi",
      "Pilot"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Dokter."
  },
  {
    "id": "sd_bind_19",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Huruf Kapital",
    "pertanyaan": "Nama hari dan bulan diawali huruf?",
    "jawabanBenar": "Kapital",
    "pengecoh": [
      "Kecil",
      "Cetak",
      "Sambung"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Kapital."
  },
  {
    "id": "sd_bind_20",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Membaca",
    "pertanyaan": "Buku berisi kumpulan peta disebut?",
    "jawabanBenar": "Atlas",
    "pengecoh": [
      "Kamus",
      "Majalah",
      "Koran"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Atlas."
  },
  {
    "id": "sd_bind_21",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks",
    "pertanyaan": "Cerita rakyat yang tidak benar terjadi disebut?",
    "jawabanBenar": "Dongeng",
    "pengecoh": [
      "Berita",
      "Laporan",
      "Jurnal"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Dongeng."
  },
  {
    "id": "sd_bind_22",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kosakata",
    "pertanyaan": "Tempat pemberhentian bus disebut?",
    "jawabanBenar": "Halte",
    "pengecoh": [
      "Stasiun",
      "Bandara",
      "Pelabuhan"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Halte."
  },
  {
    "id": "sd_bind_23",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kalimat",
    "pertanyaan": "Kata tanya untuk menanyakan tempat adalah?",
    "jawabanBenar": "Di mana",
    "pengecoh": [
      "Siapa",
      "Kapan",
      "Bagaimana"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Di mana."
  },
  {
    "id": "sd_bind_24",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kalimat",
    "pertanyaan": "Kata tanya untuk menanyakan waktu adalah?",
    "jawabanBenar": "Kapan",
    "pengecoh": [
      "Di mana",
      "Siapa",
      "Berapa"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Kapan."
  },
  {
    "id": "sd_bind_25",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kosakata",
    "pertanyaan": "Lawan kata dari bersih adalah?",
    "jawabanBenar": "Kotor",
    "pengecoh": [
      "Rapi",
      "Indah",
      "Wang"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Kotor."
  },
  {
    "id": "sd_bind_26",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kosakata",
    "pertanyaan": "Persamaan kata dari melihat adalah?",
    "jawabanBenar": "Menonton",
    "pengecoh": [
      "Mendengar",
      "Mencium",
      "Meraba"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Menonton."
  },
  {
    "id": "sd_bind_27",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks",
    "pertanyaan": "Pesan moral dalam cerita disebut?",
    "jawabanBenar": "Amanat",
    "pengecoh": [
      "Tema",
      "Tokoh",
      "Latar"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Amanat."
  },
  {
    "id": "sd_bind_28",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks",
    "pertanyaan": "Pelaku dalam sebuah cerita disebut?",
    "jawabanBenar": "Tokoh",
    "pengecoh": [
      "Latar",
      "Tema",
      "Amanat"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Tokoh."
  },
  {
    "id": "sd_bind_29",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kalimat",
    "pertanyaan": "\"Ibu memasak nasi\". Siapa yang memasak?",
    "jawabanBenar": "Ibu",
    "pengecoh": [
      "Nasi",
      "Memasak",
      "Dapur"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Ibu."
  },
  {
    "id": "sd_bind_30",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Tanda Baca",
    "pertanyaan": "Kalimat berita diakhiri dengan tanda apa?",
    "jawabanBenar": "Titik (.)",
    "pengecoh": [
      "Koma (,)",
      "Seru (!)",
      "Tanya (?)"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Jawaban yang paling tepat untuk pertanyaan tersebut adalah Titik (.)."
  },
  {
    "id": "sd_pjok_1",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Gerak Dasar",
    "pertanyaan": "Lari dan jalan termasuk gerak apa?",
    "jawabanBenar": "Lokomotor",
    "pengecoh": [
      "Nonlokomotor",
      "Manipulatif",
      "Diam"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Lokomotor."
  },
  {
    "id": "sd_pjok_2",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Gerak Dasar",
    "pertanyaan": "Gerak berpindah tempat disebut gerak apa?",
    "jawabanBenar": "Lokomotor",
    "pengecoh": [
      "Nonlokomotor",
      "Manipulatif",
      "Refleks"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Lokomotor."
  },
  {
    "id": "sd_pjok_3",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Gerak Dasar",
    "pertanyaan": "Melempar bola termasuk gerak dasar apa?",
    "jawabanBenar": "Manipulatif",
    "pengecoh": [
      "Lokomotor",
      "Nonlokomotor",
      "Pasif"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Manipulatif."
  },
  {
    "id": "sd_pjok_4",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Gerak Dasar",
    "pertanyaan": "Mengayunkan lengan tanpa berpindah disebut gerak?",
    "jawabanBenar": "Nonlokomotor",
    "pengecoh": [
      "Lokomotor",
      "Manipulatif",
      "Aktif"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Nonlokomotor."
  },
  {
    "id": "sd_pjok_5",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Olahraga",
    "pertanyaan": "Sebelum berolahraga, kita sebaiknya melakukan apa?",
    "jawabanBenar": "Pemanasan",
    "pengecoh": [
      "Tidur",
      "Makan",
      "Pendinginan"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Pemanasan."
  },
  {
    "id": "sd_pjok_6",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Olahraga",
    "pertanyaan": "Setelah berolahraga, kita sebaiknya melakukan apa?",
    "jawabanBenar": "Pendinginan",
    "pengecoh": [
      "Pemanasan",
      "Tidur",
      "Makan"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Pendinginan."
  },
  {
    "id": "sd_pjok_7",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan",
    "pertanyaan": "Pemanasan bertujuan untuk mencegah terjadinya apa?",
    "jawabanBenar": "Cedera",
    "pengecoh": [
      "Lapar",
      "Haus",
      "Kantuk"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Cedera."
  },
  {
    "id": "sd_pjok_8",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kesehatan",
    "pertanyaan": "Berolahraga rutin membuat tubuh kita menjadi?",
    "jawabanBenar": "Sehat",
    "pengecoh": [
      "Sakit",
      "Lemah",
      "Lesu"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Sehat."
  },
  {
    "id": "sd_pjok_9",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kesehatan",
    "pertanyaan": "Minum air putih mencegah tubuh mengalami?",
    "jawabanBenar": "Dehidrasi",
    "pengecoh": [
      "Cedera",
      "Patah tulang",
      "Kram"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Dehidrasi."
  },
  {
    "id": "sd_pjok_10",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kesehatan",
    "pertanyaan": "Sumber tenaga untuk berolahraga berasal dari?",
    "jawabanBenar": "Makanan",
    "pengecoh": [
      "Pakaian",
      "Sepatu",
      "Topi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Makanan."
  },
  {
    "id": "sd_pjok_11",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan",
    "pertanyaan": "Alas kaki yang aman untuk lari?",
    "jawabanBenar": "Sepatu",
    "pengecoh": [
      "Sandal",
      "Sepatu Hak",
      "Telanjang"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Sepatu."
  },
  {
    "id": "sd_pjok_12",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kesehatan",
    "pertanyaan": "Makanan bergizi membuat tubuh kita menjadi?",
    "jawabanBenar": "Kuat",
    "pengecoh": [
      "Lemah",
      "Sakit",
      "Ngantuk"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Kuat."
  },
  {
    "id": "sd_pjok_13",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan",
    "pertanyaan": "Bermain sepak bola sebaiknya dilakukan di?",
    "jawabanBenar": "Lapangan",
    "pengecoh": [
      "Kelas",
      "Jalan Raya",
      "Atap"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Lapangan."
  },
  {
    "id": "sd_pjok_14",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Permainan",
    "pertanyaan": "Menendang bola merupakan teknik dasar permainan?",
    "jawabanBenar": "Sepak Bola",
    "pengecoh": [
      "Basket",
      "Voli",
      "Tenis"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Sepak Bola."
  },
  {
    "id": "sd_pjok_15",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan",
    "pertanyaan": "Berenang memakai pelampung untuk menjaga apa?",
    "jawabanBenar": "Keselamatan",
    "pengecoh": [
      "Kecepatan",
      "Kerapian",
      "Gaya"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Keselamatan."
  },
  {
    "id": "sd_pjok_16",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Olahraga",
    "pertanyaan": "Sikap awal saat akan berlari lari cepat?",
    "jawabanBenar": "Bersedia",
    "pengecoh": [
      "Tidur",
      "Duduk",
      "Telentang"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Bersedia."
  },
  {
    "id": "sd_pjok_17",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kebersihan",
    "pertanyaan": "Mencuci tangan sebaiknya menggunakan air dan?",
    "jawabanBenar": "Sabun",
    "pengecoh": [
      "Minyak",
      "Pasir",
      "Debu"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Sabun."
  },
  {
    "id": "sd_pjok_18",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kebersihan",
    "pertanyaan": "Mandi secara teratur membersihkan tubuh dari?",
    "jawabanBenar": "Kuman",
    "pengecoh": [
      "Keringat bersih",
      "Otot",
      "Darah"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Kuman."
  },
  {
    "id": "sd_pjok_19",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kesehatan",
    "pertanyaan": "Istirahat yang paling baik untuk tubuh?",
    "jawabanBenar": "Tidur",
    "pengecoh": [
      "Main",
      "Nonton",
      "Lari"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Tidur."
  },
  {
    "id": "sd_pjok_20",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kebersihan",
    "pertanyaan": "Setelah bermain di luar, kita harus?",
    "jawabanBenar": "Cuci tangan",
    "pengecoh": [
      "Makan",
      "Tidur",
      "Main lagi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Cuci tangan."
  },
  {
    "id": "sd_pjok_21",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Olahraga",
    "pertanyaan": "Posisi badan saat lari cepat sebaiknya?",
    "jawabanBenar": "Condong",
    "pengecoh": [
      "Tegak",
      "Membungkuk",
      "Telentang"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Condong."
  },
  {
    "id": "sd_pjok_22",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Permainan",
    "pertanyaan": "Memantulkan bola ke lantai disebut gerak?",
    "jawabanBenar": "Dribbling",
    "pengecoh": [
      "Passing",
      "Shooting",
      "Smash"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Dribbling."
  },
  {
    "id": "sd_pjok_23",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Permainan",
    "pertanyaan": "Pukulan awal dalam permainan voli disebut?",
    "jawabanBenar": "Servis",
    "pengecoh": [
      "Smash",
      "Blok",
      "Passing"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Servis."
  },
  {
    "id": "sd_pjok_24",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Olahraga",
    "pertanyaan": "Olahraga renang gaya dada sering disebut?",
    "jawabanBenar": "Gaya katak",
    "pengecoh": [
      "Gaya bebas",
      "Gaya punggung",
      "Gaya lumba"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Gaya katak."
  },
  {
    "id": "sd_pjok_25",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Olahraga",
    "pertanyaan": "Senam yang diiringi oleh musik disebut?",
    "jawabanBenar": "Senam ritmik",
    "pengecoh": [
      "Senam lantai",
      "Senam alat",
      "Senam ketangkasan"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Senam ritmik."
  },
  {
    "id": "sd_pjok_26",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kebugaran",
    "pertanyaan": "Berdiri dengan satu kaki melatih apa?",
    "jawabanBenar": "Keseimbangan",
    "pengecoh": [
      "Kecepatan",
      "Kekuatan",
      "Kelenturan"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Keseimbangan."
  },
  {
    "id": "sd_pjok_27",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kebugaran",
    "pertanyaan": "Lari lari kecil atau pelan disebut?",
    "jawabanBenar": "Joging",
    "pengecoh": [
      "Sprint",
      "Maraton",
      "Estafet"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Joging."
  },
  {
    "id": "sd_pjok_28",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kebersihan",
    "pertanyaan": "Membuang sampah sembarangan membuat lingkungan menjadi?",
    "jawabanBenar": "Kotor",
    "pengecoh": [
      "Bersih",
      "Sehat",
      "Wangi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Kotor."
  },
  {
    "id": "sd_pjok_29",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan",
    "pertanyaan": "Tempat bermain yang basah dapat menyebabkan?",
    "jawabanBenar": "Terpeleset",
    "pengecoh": [
      "Menang",
      "Cepat",
      "Kuat"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Terpeleset."
  },
  {
    "id": "sd_pjok_30",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "PJOK",
    "topik": "Kebersihan",
    "pertanyaan": "Menggosok gigi sebaiknya dilakukan sebelum apa?",
    "jawabanBenar": "Tidur",
    "pengecoh": [
      "Bermain",
      "Mandi",
      "Lari"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam pendidikan jasmani dan olahraga, istilah atau tindakan yang benar adalah Tidur."
  },
  {
    "id": "sd_seni_1",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Rupa",
    "pertanyaan": "Warna merah dan kuning dicampur menjadi warna apa?",
    "jawabanBenar": "Oranye",
    "pengecoh": [
      "Hijau",
      "Ungu",
      "Biru"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Oranye."
  },
  {
    "id": "sd_seni_2",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Rupa",
    "pertanyaan": "Kolase dibuat dengan cara apa pada bahan?",
    "jawabanBenar": "Menempel",
    "pengecoh": [
      "Menggunting",
      "Melukis",
      "Menggambar"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Menempel."
  },
  {
    "id": "sd_seni_3",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Rupa",
    "pertanyaan": "Alat bantu untuk menggambar lingkaran yang rapi?",
    "jawabanBenar": "Jangka",
    "pengecoh": [
      "Penggaris",
      "Pensil",
      "Penghapus"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Jangka."
  },
  {
    "id": "sd_seni_4",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Rupa",
    "pertanyaan": "Patung merupakan contoh karya seni berapa dimensi?",
    "jawabanBenar": "Tiga",
    "pengecoh": [
      "Dua",
      "Satu",
      "Empat"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Tiga."
  },
  {
    "id": "sd_seni_5",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Rupa",
    "pertanyaan": "Tanah liat adalah bahan yang sifatnya?",
    "jawabanBenar": "Lunak",
    "pengecoh": [
      "Keras",
      "Cair",
      "Tajam"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Lunak."
  },
  {
    "id": "sd_seni_6",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Rupa",
    "pertanyaan": "Lukisan di atas kertas adalah karya seni?",
    "jawabanBenar": "Dua dimensi",
    "pengecoh": [
      "Tiga dimensi",
      "Empat dimensi",
      "Satu dimensi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Dua dimensi."
  },
  {
    "id": "sd_seni_7",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Rupa",
    "pertanyaan": "Garis yang melengkung memberikan kesan apa?",
    "jawabanBenar": "Luwes",
    "pengecoh": [
      "Kaku",
      "Keras",
      "Tajam"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Luwes."
  },
  {
    "id": "sd_seni_8",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Rupa",
    "pertanyaan": "Unsur seni rupa yang terkecil adalah?",
    "jawabanBenar": "Titik",
    "pengecoh": [
      "Garis",
      "Bidang",
      "Warna"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Titik."
  },
  {
    "id": "sd_seni_9",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Musik",
    "pertanyaan": "Alat musik gitar dimainkan dengan cara apa?",
    "jawabanBenar": "Dipetik",
    "pengecoh": [
      "Ditiup",
      "Dipukul",
      "Digesek"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Dipetik."
  },
  {
    "id": "sd_seni_10",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Musik",
    "pertanyaan": "Lagu bertempo cepat dinyanyikan dengan perasaan?",
    "jawabanBenar": "Gembira",
    "pengecoh": [
      "Sedih",
      "Malas",
      "Marah"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Gembira."
  },
  {
    "id": "sd_seni_11",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Musik",
    "pertanyaan": "Alat musik angklung berasal dari daerah mana?",
    "jawabanBenar": "Jawa Barat",
    "pengecoh": [
      "Bali",
      "Papua",
      "Sumatra"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Jawa Barat."
  },
  {
    "id": "sd_seni_12",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Musik",
    "pertanyaan": "Tinggi rendahnya bunyi dalam musik disebut?",
    "jawabanBenar": "Nada",
    "pengecoh": [
      "Tempo",
      "Dinamika",
      "Ritme"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Nada."
  },
  {
    "id": "sd_seni_13",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Musik",
    "pertanyaan": "Alat musik drum dimainkan dengan cara apa?",
    "jawabanBenar": "Dipukul",
    "pengecoh": [
      "Ditiup",
      "Dipetik",
      "Digesek"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Dipukul."
  },
  {
    "id": "sd_seni_14",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Musik",
    "pertanyaan": "Orang yang memimpin kelompok paduan suara disebut?",
    "jawabanBenar": "Dirigen",
    "pengecoh": [
      "Pianis",
      "Gitaris",
      "Vokalis"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Dirigen."
  },
  {
    "id": "sd_seni_15",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Musik",
    "pertanyaan": "Lagu \"Indonesia Raya\" diciptakan oleh siapa?",
    "jawabanBenar": "W.R. Supratman",
    "pengecoh": [
      "Ibu Sud",
      "C. Simanjuntak",
      "Ismail Marzuki"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah W.R. Supratman."
  },
  {
    "id": "sd_seni_16",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Musik",
    "pertanyaan": "Cepat atau lambatnya sebuah lagu disebut?",
    "jawabanBenar": "Tempo",
    "pengecoh": [
      "Nada",
      "Birama",
      "Melodi"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Tempo."
  },
  {
    "id": "sd_seni_17",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Tari",
    "pertanyaan": "Gerak tubuh yang indah dan berirama disebut?",
    "jawabanBenar": "Tari",
    "pengecoh": [
      "Nyanyi",
      "Lukis",
      "Teater"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Tari."
  },
  {
    "id": "sd_seni_18",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Tari",
    "pertanyaan": "Tari Kecak berasal dari daerah mana?",
    "jawabanBenar": "Bali",
    "pengecoh": [
      "Jawa",
      "Sumatra",
      "Papua"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Bali."
  },
  {
    "id": "sd_seni_19",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Tari",
    "pertanyaan": "Garis yang dilalui penari di panggung disebut?",
    "jawabanBenar": "Pola lantai",
    "pengecoh": [
      "Garis lurus",
      "Garis lengkung",
      "Batas panggung"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Pola lantai."
  },
  {
    "id": "sd_seni_20",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Tari",
    "pertanyaan": "Gerakan tarian harus sesuai dengan iringan apa?",
    "jawabanBenar": "Musik",
    "pengecoh": [
      "Penonton",
      "Angin",
      "Panggung"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Musik."
  },
  {
    "id": "sd_seni_21",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Tari",
    "pertanyaan": "Tari Saman dari Aceh biasanya dilakukan secara?",
    "jawabanBenar": "Berkelompok",
    "pengecoh": [
      "Sendiri",
      "Berpasangan",
      "Acak"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Berkelompok."
  },
  {
    "id": "sd_seni_22",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Tari",
    "pertanyaan": "Perlengkapan yang digunakan penari saat menari disebut?",
    "jawabanBenar": "Properti",
    "pengecoh": [
      "Pakaian",
      "Hiasan",
      "Mainan"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Properti."
  },
  {
    "id": "sd_seni_23",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Tari",
    "pertanyaan": "Mimik wajah penari saat menari menunjukkan?",
    "jawabanBenar": "Ekspresi",
    "pengecoh": [
      "Pola lantai",
      "Arah gerak",
      "Waktu"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Ekspresi."
  },
  {
    "id": "sd_seni_24",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Teater",
    "pertanyaan": "Orang yang memainkan peran dalam drama disebut?",
    "jawabanBenar": "Aktor",
    "pengecoh": [
      "Sutradara",
      "Penulis",
      "Penonton"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Aktor."
  },
  {
    "id": "sd_seni_25",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Teater",
    "pertanyaan": "Percakapan antara dua tokoh atau lebih disebut?",
    "jawabanBenar": "Dialog",
    "pengecoh": [
      "Monolog",
      "Prolog",
      "Epilog"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Dialog."
  },
  {
    "id": "sd_seni_26",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Teater",
    "pertanyaan": "Orang yang memimpin pementasan teater disebut?",
    "jawabanBenar": "Sutradara",
    "pengecoh": [
      "Aktor",
      "Penari",
      "Pemusik"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Sutradara."
  },
  {
    "id": "sd_seni_27",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Teater",
    "pertanyaan": "Pakaian yang dipakai aktor saat pentas disebut?",
    "jawabanBenar": "Kostum",
    "pengecoh": [
      "Properti",
      "Latar",
      "Topeng"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Kostum."
  },
  {
    "id": "sd_seni_28",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Teater",
    "pertanyaan": "Cerita rakyat \"Sangkuriang\" berasal dari mana?",
    "jawabanBenar": "Jawa Barat",
    "pengecoh": [
      "Jawa Tengah",
      "Bali",
      "Papua"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Jawa Barat."
  },
  {
    "id": "sd_seni_29",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Teater",
    "pertanyaan": "Tempat para aktor memainkan drama disebut?",
    "jawabanBenar": "Panggung",
    "pengecoh": [
      "Lapangan",
      "Kelas",
      "Taman"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Panggung."
  },
  {
    "id": "sd_seni_30",
    "jenjang": "SD",
    "kelasAtauFase": "Fase B",
    "mataPelajaran": "Seni dan Budaya",
    "topik": "Seni Teater",
    "pertanyaan": "Gerak dan mimik wajah aktor berfungsi menyampaikan?",
    "jawabanBenar": "Perasaan",
    "pengecoh": [
      "Properti",
      "Latar",
      "Tata rias"
    ],
    "challengeType": "IDENTIFY",
    "difficulty": "EASY",
    "explanation": "Dalam konteks seni dan budaya, konsep yang tepat adalah Perasaan."
  },
  {
    "id": "smp_ipa_3",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Fotosintesis",
    "pertanyaan": "Gas apa yang diserap tumbuhan saat fotosintesis?",
    "jawabanBenar": "Karbon dioksida",
    "pengecoh": [
      "Oksigen",
      "Nitrogen",
      "Hidrogen"
    ],
    "difficulty": "EASY",
    "explanation": "Tumbuhan menyerap karbon dioksida dari udara sebagai bahan baku fotosintesis.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_4",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Fotosintesis",
    "pertanyaan": "Gas apa yang dihasilkan dari proses fotosintesis?",
    "jawabanBenar": "Oksigen",
    "pengecoh": [
      "Karbon dioksida",
      "Nitrogen",
      "Helium"
    ],
    "difficulty": "EASY",
    "explanation": "Fotosintesis menghasilkan oksigen yang sangat penting bagi pernapasan makhluk hidup.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_5",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Fotosintesis",
    "pertanyaan": "Dimanakah fotosintesis umumnya terjadi pada tumbuhan?",
    "jawabanBenar": "Daun",
    "pengecoh": [
      "Akar",
      "Batang",
      "Bunga"
    ],
    "difficulty": "EASY",
    "explanation": "Daun adalah tempat utama fotosintesis karena mengandung paling banyak klorofil.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_6",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Fotosintesis",
    "pertanyaan": "Energi apa yang dibutuhkan untuk fotosintesis?",
    "jawabanBenar": "Cahaya matahari",
    "pengecoh": [
      "Panas bumi",
      "Listrik",
      "Gerak"
    ],
    "difficulty": "EASY",
    "explanation": "Cahaya matahari memberikan energi yang dibutuhkan untuk mengubah bahan baku menjadi makanan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_7",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Fotosintesis",
    "pertanyaan": "Apa karbohidrat hasil dari fotosintesis?",
    "jawabanBenar": "Glukosa",
    "pengecoh": [
      "Protein",
      "Lemak",
      "Vitamin"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Fotosintesis menghasilkan gula sederhana berupa glukosa sebagai sumber energi tumbuhan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_8",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tumbuhan",
    "pertanyaan": "Jaringan apa yang mengangkut air dari akar ke daun?",
    "jawabanBenar": "Xilem",
    "pengecoh": [
      "Floem",
      "Epidermis",
      "Kambium"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Xilem berfungsi seperti pipa yang mengangkut air dan mineral dari dalam tanah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_9",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tumbuhan",
    "pertanyaan": "Jaringan apa yang mengedarkan hasil fotosintesis?",
    "jawabanBenar": "Floem",
    "pengecoh": [
      "Xilem",
      "Korteks",
      "Meristem"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Floem bertugas mendistribusikan zat makanan hasil fotosintesis ke seluruh bagian tumbuhan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_10",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tumbuhan",
    "pertanyaan": "Apa fungsi utama dari putik pada bunga?",
    "jawabanBenar": "Alat kelamin betina",
    "pengecoh": [
      "Alat kelamin jantan",
      "Perhiasan bunga",
      "Pelindung bunga"
    ],
    "difficulty": "EASY",
    "explanation": "Putik adalah bagian betina pada bunga yang berperan dalam perkembangbiakan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_11",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tumbuhan",
    "pertanyaan": "Apa fungsi utama benang sari pada bunga?",
    "jawabanBenar": "Alat kelamin jantan",
    "pengecoh": [
      "Alat kelamin betina",
      "Penarik serangga",
      "Penyimpan nektar"
    ],
    "difficulty": "EASY",
    "explanation": "Benang sari menghasilkan serbuk sari yang berfungsi sebagai alat kelamin jantan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_12",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tumbuhan",
    "pertanyaan": "Proses melekatnya serbuk sari pada kepala putik?",
    "jawabanBenar": "Penyerbukan",
    "pengecoh": [
      "Pembuahan",
      "Fotosintesis",
      "Respirasi"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Penyerbukan atau polinasi adalah peristiwa jatuhnya serbuk sari ke kepala putik.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_13",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Di organ mana pencernaan makanan pertama kali terjadi?",
    "jawabanBenar": "Mulut",
    "pengecoh": [
      "Lambung",
      "Kerongkongan",
      "Usus"
    ],
    "difficulty": "EASY",
    "explanation": "Pencernaan mekanis dan kimiawi dimulai di mulut dengan bantuan gigi dan air liur.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_14",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Saluran yang menghubungkan mulut dengan lambung?",
    "jawabanBenar": "Kerongkongan",
    "pengecoh": [
      "Tenggorokan",
      "Usus halus",
      "Usus besar"
    ],
    "difficulty": "EASY",
    "explanation": "Kerongkongan atau esofagus adalah saluran yang mendorong makanan ke lambung.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_15",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Gerakan meremas pada kerongkongan disebut apa?",
    "jawabanBenar": "Peristaltik",
    "pengecoh": [
      "Mekanik",
      "Kimiawi",
      "Absorpsi"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Gerak peristaltik memungkinkan makanan terdorong masuk ke dalam lambung.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_16",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Di mana penyerapan sari-sari makanan terjadi?",
    "jawabanBenar": "Usus halus",
    "pengecoh": [
      "Lambung",
      "Usus besar",
      "Hati"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Usus halus memiliki jonjot-jonjot yang menyerap nutrisi makanan ke dalam darah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_17",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Organ pencernaan apa yang menyerap air dari sisa makanan?",
    "jawabanBenar": "Usus besar",
    "pengecoh": [
      "Usus halus",
      "Lambung",
      "Pankreas"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Usus besar bertugas menyerap air agar sisa makanan menjadi padat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_18",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Asam apa yang dihasilkan oleh lambung?",
    "jawabanBenar": "Asam klorida",
    "pengecoh": [
      "Asam sulfat",
      "Asam sitrat",
      "Asam cuka"
    ],
    "difficulty": "HARD",
    "explanation": "Lambung menghasilkan asam klorida (HCl) untuk membunuh kuman pada makanan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_19",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tata Surya",
    "pertanyaan": "Pusat tata surya kita adalah?",
    "jawabanBenar": "Matahari",
    "pengecoh": [
      "Bumi",
      "Bulan",
      "Jupiter"
    ],
    "difficulty": "EASY",
    "explanation": "Matahari adalah bintang yang menjadi pusat gravitasi sistem tata surya kita.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_20",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tata Surya",
    "pertanyaan": "Planet manakah yang paling dekat dengan Matahari?",
    "jawabanBenar": "Merkurius",
    "pengecoh": [
      "Venus",
      "Bumi",
      "Mars"
    ],
    "difficulty": "EASY",
    "explanation": "Merkurius berada di urutan pertama dan terdekat dari Matahari.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_21",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tata Surya",
    "pertanyaan": "Planet terbesar di tata surya kita adalah?",
    "jawabanBenar": "Jupiter",
    "pengecoh": [
      "Saturnus",
      "Uranus",
      "Neptunus"
    ],
    "difficulty": "EASY",
    "explanation": "Jupiter adalah planet raksasa gas yang paling besar dalam tata surya kita.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_22",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tata Surya",
    "pertanyaan": "Garis edar planet mengelilingi matahari disebut?",
    "jawabanBenar": "Orbit",
    "pengecoh": [
      "Rotasi",
      "Satelit",
      "Gravitasi"
    ],
    "difficulty": "EASY",
    "explanation": "Setiap planet memiliki lintasan atau orbit tertentu dalam mengelilingi matahari.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_23",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tata Surya",
    "pertanyaan": "Perputaran bumi pada porosnya disebut apa?",
    "jawabanBenar": "Rotasi",
    "pengecoh": [
      "Revolusi",
      "Orbit",
      "Evolusi"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Rotasi bumi mengakibatkan terjadinya siang dan malam.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_24",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tata Surya",
    "pertanyaan": "Satelit alami yang dimiliki oleh bumi adalah?",
    "jawabanBenar": "Bulan",
    "pengecoh": [
      "Phobos",
      "Titan",
      "Europa"
    ],
    "difficulty": "EASY",
    "explanation": "Bulan adalah satu-satunya benda langit yang mengitari bumi secara alami.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_25",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Zat dan Wujudnya",
    "pertanyaan": "Perubahan wujud dari padat menjadi cair disebut?",
    "jawabanBenar": "Mencair",
    "pengecoh": [
      "Membeku",
      "Menguap",
      "Menyublim"
    ],
    "difficulty": "EASY",
    "explanation": "Mencair terjadi karena benda padat menerima kalor (panas).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_26",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Zat dan Wujudnya",
    "pertanyaan": "Perubahan wujud dari cair menjadi gas disebut?",
    "jawabanBenar": "Menguap",
    "pengecoh": [
      "Membeku",
      "Mencair",
      "Mengembun"
    ],
    "difficulty": "EASY",
    "explanation": "Proses menguap terjadi misalnya saat air dipanaskan hingga mendidih.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_27",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Zat dan Wujudnya",
    "pertanyaan": "Peristiwa kamper (kapur barus) mengecil merupakan contoh?",
    "jawabanBenar": "Menyublim",
    "pengecoh": [
      "Menguap",
      "Mencair",
      "Mengkristal"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Menyublim adalah perubahan langsung dari zat padat menjadi gas.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_28",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Zat dan Wujudnya",
    "pertanyaan": "Embun di pagi hari terjadi akibat proses apa?",
    "jawabanBenar": "Mengembun",
    "pengecoh": [
      "Mencair",
      "Menguap",
      "Menyublim"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Gas atau uap air di udara berubah menjadi titik-titik air karena suhu dingin.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_29",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Zat dan Wujudnya",
    "pertanyaan": "Zat yang bentuk dan volumenya selalu berubah?",
    "jawabanBenar": "Gas",
    "pengecoh": [
      "Padat",
      "Cair",
      "Plasma"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Gas akan selalu mengisi seluruh ruang yang diempatinya karena susunan partikel bebas.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ipa_30",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Zat dan Wujudnya",
    "pertanyaan": "Sifat benda padat yaitu bentuk dan volumenya?",
    "jawabanBenar": "Tetap",
    "pengecoh": [
      "Berubah",
      "Mengikuti wadah",
      "Bebas"
    ],
    "difficulty": "EASY",
    "explanation": "Susunan partikel zat padat sangat rapat sehingga bentuk dan volumenya tidak mudah berubah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_3",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Geografi",
    "pertanyaan": "Gunung, lembah, dan sungai merupakan kenampakan?",
    "jawabanBenar": "Alam",
    "pengecoh": [
      "Buatan",
      "Sosial",
      "Budaya"
    ],
    "difficulty": "EASY",
    "explanation": "Kenampakan alam adalah segala sesuatu di alam yang terbentuk oleh peristiwa alam.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_4",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Geografi",
    "pertanyaan": "Angin laut terjadi pada waktu?",
    "jawabanBenar": "Siang hari",
    "pengecoh": [
      "Malam hari",
      "Subuh",
      "Sore hari"
    ],
    "difficulty": "EASY",
    "explanation": "Angin laut bertiup dari laut ke darat yang umumnya terjadi pada siang hari saat suhu daratan lebih panas.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_5",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Geografi",
    "pertanyaan": "Garis khayal yang membagi bumi menjadi dua belahan utara-selatan?",
    "jawabanBenar": "Khatulistiwa",
    "pengecoh": [
      "Bujur",
      "Greenwich",
      "Meridian"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Garis khatulistiwa atau ekuator adalah garis lintang nol derajat yang membagi bumi utara dan selatan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_6",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Geografi",
    "pertanyaan": "Hutan bakau atau mangrove banyak ditemukan di wilayah?",
    "jawabanBenar": "Pesisir",
    "pengecoh": [
      "Pegunungan",
      "Gurun",
      "Perkotaan"
    ],
    "difficulty": "EASY",
    "explanation": "Hutan mangrove tumbuh di daerah pesisir yang dipengaruhi pasang surut air laut.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_7",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Geografi",
    "pertanyaan": "Indonesia memiliki dua musim utama karena pengaruh angin?",
    "jawabanBenar": "Muson",
    "pengecoh": [
      "Topan",
      "Puyuh",
      "Tornado"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Angin muson barat dan timur menyebabkan terjadinya musim hujan dan kemarau di Indonesia.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_8",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Geografi",
    "pertanyaan": "Daratan yang menjorok ke laut disebut?",
    "jawabanBenar": "Tanjung",
    "pengecoh": [
      "Teluk",
      "Selat",
      "Delta"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Tanjung atau semenanjung adalah wilayah daratan yang menjorok ke arah laut.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_9",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Geografi",
    "pertanyaan": "Wilayah lautan yang menjorok ke daratan disebut?",
    "jawabanBenar": "Teluk",
    "pengecoh": [
      "Tanjung",
      "Selat",
      "Semenanjung"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Teluk adalah kebalikan dari tanjung, yaitu lautan yang menjorok ke darat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_10",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Geografi",
    "pertanyaan": "Laut sempit yang menghubungkan dua pulau disebut?",
    "jawabanBenar": "Selat",
    "pengecoh": [
      "Teluk",
      "Tanjung",
      "Samudra"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Selat adalah perairan sempit yang berada di antara dua buah pulau.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_11",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Geografi",
    "pertanyaan": "Cuaca diamati dalam waktu yang?",
    "jawabanBenar": "Singkat",
    "pengecoh": [
      "Lama",
      "Tahunan",
      "Abad"
    ],
    "difficulty": "EASY",
    "explanation": "Cuaca adalah keadaan udara dalam waktu singkat dan wilayah terbatas, berbeda dengan iklim.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_12",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta",
    "pertanyaan": "Perbandingan jarak di peta dengan jarak sebenarnya disebut?",
    "jawabanBenar": "Skala",
    "pengecoh": [
      "Legenda",
      "Indeks",
      "Orientasi"
    ],
    "difficulty": "EASY",
    "explanation": "Skala peta menunjukkan perbandingan matematis antara jarak di peta dengan jarak asli di lapangan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_13",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta",
    "pertanyaan": "Keterangan dari simbol-simbol pada peta disebut?",
    "jawabanBenar": "Legenda",
    "pengecoh": [
      "Skala",
      "Inset",
      "Garis tepi"
    ],
    "difficulty": "EASY",
    "explanation": "Legenda berfungsi untuk memperjelas arti dari setiap simbol yang digunakan pada peta.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_14",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta",
    "pertanyaan": "Arah utara pada peta umumnya menunjuk ke bagian?",
    "jawabanBenar": "Atas",
    "pengecoh": [
      "Bawah",
      "Kanan",
      "Kiri"
    ],
    "difficulty": "EASY",
    "explanation": "Secara konvensi kartografi standar, arah atas pada peta menunjukkan arah Utara.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_15",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta",
    "pertanyaan": "Warna biru pada peta umum biasanya digunakan untuk?",
    "jawabanBenar": "Perairan",
    "pengecoh": [
      "Daratan",
      "Pegunungan",
      "Jalan raya"
    ],
    "difficulty": "EASY",
    "explanation": "Warna biru merupakan simbol warna standar untuk danau, sungai, dan laut (perairan).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_16",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta",
    "pertanyaan": "Peta kecil di dalam peta utama disebut?",
    "jawabanBenar": "Inset",
    "pengecoh": [
      "Legenda",
      "Indeks",
      "Skala"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Inset adalah peta kecil yang menunjukkan lokasi daerah yang dipetakan dalam lingkup yang lebih luas.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_17",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta",
    "pertanyaan": "Warna coklat pada peta digunakan untuk simbol?",
    "jawabanBenar": "Pegunungan",
    "pengecoh": [
      "Dataran rendah",
      "Laut dalam",
      "Hutan"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Warna coklat menandakan wilayah dataran tinggi atau wilayah pegunungan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_18",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta",
    "pertanyaan": "Simbol segitiga merah pada peta melambangkan apa?",
    "jawabanBenar": "Gunung berapi",
    "pengecoh": [
      "Danau",
      "Ibu kota",
      "Bandara"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Secara universal, segitiga merah digunakan sebagai simbol gunung berapi aktif.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_19",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta",
    "pertanyaan": "Bentuk bumi yang bulat ditiru dalam bentuk bola disebut?",
    "jawabanBenar": "Globe",
    "pengecoh": [
      "Atlas",
      "Peta",
      "Denah"
    ],
    "difficulty": "EASY",
    "explanation": "Globe adalah model atau tiruan bola bumi yang paling mendekati bentuk aslinya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_20",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta",
    "pertanyaan": "Buku yang berisi kumpulan peta disebut?",
    "jawabanBenar": "Atlas",
    "pengecoh": [
      "Globe",
      "Katalog",
      "Kamus"
    ],
    "difficulty": "EASY",
    "explanation": "Atlas adalah kumpulan peta-peta yang dibukukan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_21",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Indonesia",
    "pertanyaan": "Kerajaan bercorak Hindu tertua di Indonesia adalah?",
    "jawabanBenar": "Kutai",
    "pengecoh": [
      "Tarumanegara",
      "Majapahit",
      "Sriwijaya"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kerajaan Kutai di Kalimantan Timur adalah kerajaan Hindu tertua (berdiri abad ke-4).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_22",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Indonesia",
    "pertanyaan": "Kerajaan bercorak Buddha terbesar di Nusantara adalah?",
    "jawabanBenar": "Sriwijaya",
    "pengecoh": [
      "Majapahit",
      "Mataram",
      "Demak"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sriwijaya merupakan pusat pendidikan agama Buddha dan kerajaan maritim terbesar di Sumatra.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_23",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Indonesia",
    "pertanyaan": "Sumpah Palapa diucapkan oleh mahapatih dari Majapahit bernama?",
    "jawabanBenar": "Gajah Mada",
    "pengecoh": [
      "Hayam Wuruk",
      "Ken Arok",
      "Raden Wijaya"
    ],
    "difficulty": "EASY",
    "explanation": "Sumpah Palapa merupakan janji Patih Gajah Mada untuk menyatukan Nusantara.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_24",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Indonesia",
    "pertanyaan": "Siapakah yang membacakan Teks Proklamasi Kemerdekaan RI?",
    "jawabanBenar": "Soekarno",
    "pengecoh": [
      "Moh. Hatta",
      "Sudirman",
      "Sjahrir"
    ],
    "difficulty": "EASY",
    "explanation": "Soekarno membacakan proklamasi didampingi oleh Mohammad Hatta pada 17 Agustus 1945.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_25",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Indonesia",
    "pertanyaan": "Organisasi pergerakan nasional pertama di Indonesia adalah?",
    "jawabanBenar": "Budi Utomo",
    "pengecoh": [
      "Sarekat Islam",
      "Indische Partij",
      "PNI"
    ],
    "difficulty": "HARD",
    "explanation": "Budi Utomo didirikan pada 20 Mei 1908, kini diperingati sebagai Hari Kebangkitan Nasional.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_26",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Indonesia",
    "pertanyaan": "Kerajaan Islam pertama di Pulau Jawa adalah?",
    "jawabanBenar": "Demak",
    "pengecoh": [
      "Mataram",
      "Banten",
      "Cirebon"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kerajaan Demak merupakan kesultanan Islam pertama di pantai utara Jawa, dipimpin Raden Patah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_27",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Indonesia",
    "pertanyaan": "Bapak Pendidikan Nasional Indonesia adalah?",
    "jawabanBenar": "Ki Hajar",
    "pengecoh": [
      "Soetomo",
      "Tjipto",
      "Douwes Dekker"
    ],
    "difficulty": "EASY",
    "explanation": "Ki Hajar Dewantara mendirikan Taman Siswa dan menjadi Bapak Pendidikan Nasional.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_28",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Indonesia",
    "pertanyaan": "Sistem kerja paksa pada zaman penjajahan Belanda disebut?",
    "jawabanBenar": "Kerja Rodi",
    "pengecoh": [
      "Romusha",
      "Cultuurstelsel",
      "Devide"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kerja Rodi diterapkan Belanda, sementara Romusha adalah pada zaman Jepang.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_29",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Indonesia",
    "pertanyaan": "Sistem tanam paksa dicetuskan oleh gubernur jenderal?",
    "jawabanBenar": "Van den Bosch",
    "pengecoh": [
      "Daendels",
      "Raffles",
      "J.P. Coen"
    ],
    "difficulty": "HARD",
    "explanation": "Johannes van den Bosch memberlakukan Cultuurstelsel pada 1830.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "smp_ips_30",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Indonesia",
    "pertanyaan": "Bangsa Eropa pertama yang mendarat mencari rempah di Maluku?",
    "jawabanBenar": "Portugis",
    "pengecoh": [
      "Spanyol",
      "Belanda",
      "Inggris"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Portugis merupakan bangsa Eropa pertama yang mendarat di Maluku pada abad ke-16.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_3",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sel",
    "pertanyaan": "Organel yang mengatur seluruh kegiatan sel adalah?",
    "jawabanBenar": "Nukleus",
    "pengecoh": [
      "Ribosom",
      "Lisosom",
      "Badan Golgi"
    ],
    "difficulty": "EASY",
    "explanation": "Nukleus (inti sel) berfungsi sebagai pusat kendali karena mengandung DNA.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_4",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sel",
    "pertanyaan": "Tempat utama sintesis protein di dalam sel adalah?",
    "jawabanBenar": "Ribosom",
    "pengecoh": [
      "Vakuola",
      "Mitokondria",
      "Sentriol"
    ],
    "difficulty": "EASY",
    "explanation": "Ribosom adalah organel tak bermembran yang merakit asam amino menjadi protein.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_5",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sel",
    "pertanyaan": "Organel pencernaan intraseluler yang mengandung enzim hidrolitik?",
    "jawabanBenar": "Lisosom",
    "pengecoh": [
      "Badan Golgi",
      "Retikulum Endoplasma",
      "Peroksisom"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Lisosom berfungsi mencerna zat asing atau organel yang sudah rusak di dalam sel.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_6",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sel",
    "pertanyaan": "Bagian sel tumbuhan yang menjaga tekanan turgor?",
    "jawabanBenar": "Vakuola sentral",
    "pengecoh": [
      "Dinding sel",
      "Kloroplas",
      "Nukleolus"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Vakuola sentral yang besar menyimpan air dan menjaga kekakuan (turgiditas) sel tumbuhan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_7",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sel",
    "pertanyaan": "Struktur utama penyusun membran sel adalah?",
    "jawabanBenar": "Fosfolipid bilayer",
    "pengecoh": [
      "Peptidoglikan",
      "Selulosa",
      "Kolin"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Membran sel utamanya tersusun dari dua lapis fosfolipid (fosfolipid bilayer).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_8",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sel",
    "pertanyaan": "Organel untuk sekresi dan pengemasan zat adalah?",
    "jawabanBenar": "Badan Golgi",
    "pengecoh": [
      "Nukleus",
      "Lisosom",
      "Retikulum"
    ],
    "difficulty": "EASY",
    "explanation": "Badan Golgi (Aparatus Golgi) memodifikasi, mengemas, dan menyekresikan molekul.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_9",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sel",
    "pertanyaan": "Transportasi molekul melawan gradien konsentrasi disebut?",
    "jawabanBenar": "Transpor aktif",
    "pengecoh": [
      "Difusi",
      "Osmosis",
      "Fasilitasi"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Transpor aktif memerlukan energi (ATP) karena bergerak dari konsentrasi rendah ke tinggi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_10",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sel",
    "pertanyaan": "Perpindahan pelarut melalui membran semipermeabel disebut?",
    "jawabanBenar": "Osmosis",
    "pengecoh": [
      "Difusi",
      "Endositosis",
      "Eksositosis"
    ],
    "difficulty": "EASY",
    "explanation": "Osmosis khusus merujuk pada difusi molekul pelarut (seperti air) melintasi membran.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_11",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sel",
    "pertanyaan": "Apa yang membuat sel tumbuhan kaku dibanding sel hewan?",
    "jawabanBenar": "Dinding sel",
    "pengecoh": [
      "Membran sel",
      "Kloroplas",
      "Sitoskeleton"
    ],
    "difficulty": "EASY",
    "explanation": "Dinding sel yang terbuat dari selulosa memberikan bentuk tetap dan perlindungan pada sel tumbuhan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_12",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Enzim pepsin di lambung memecah makromolekul apa?",
    "jawabanBenar": "Protein",
    "pengecoh": [
      "Lemak",
      "Karbohidrat",
      "Asam nukleat"
    ],
    "difficulty": "EASY",
    "explanation": "Pepsin merupakan enzim protease yang bekerja memecah protein menjadi pepton.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_13",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Cairan empedu berfungsi untuk mengemulsi zat apa?",
    "jawabanBenar": "Lemak",
    "pengecoh": [
      "Protein",
      "Glukosa",
      "Vitamin"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Empedu memecah lemak menjadi butiran kecil (emulsi) agar mudah dicerna enzim lipase.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_14",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Organ yang memproduksi cairan empedu adalah?",
    "jawabanBenar": "Hati",
    "pengecoh": [
      "Pankreas",
      "Lambung",
      "Kantung empedu"
    ],
    "difficulty": "EASY",
    "explanation": "Hati memproduksi empedu, yang kemudian ditampung di kantung empedu.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_15",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Enzim lipase yang mencerna lemak disekresikan oleh?",
    "jawabanBenar": "Pankreas",
    "pengecoh": [
      "Hati",
      "Lambung",
      "Kerongkongan"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Pankreas menghasilkan lipase ke usus halus untuk mengubah lemak menjadi asam lemak dan gliserol.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_16",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Lipatan kecil di dinding usus halus untuk absorpsi?",
    "jawabanBenar": "Vili",
    "pengecoh": [
      "Alveolus",
      "Papila",
      "Silia"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Vili (jonjot usus) berfungsi memperluas permukaan penyerapan nutrisi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_17",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Bagian usus besar yang menampung feses sebelum dibuang?",
    "jawabanBenar": "Rektum",
    "pengecoh": [
      "Sekum",
      "Kolon",
      "Duodenum"
    ],
    "difficulty": "EASY",
    "explanation": "Rektum adalah bagian akhir usus besar sebagai tempat penyimpanan sementara feses.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_18",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Bakteri usus besar yang mensintesis vitamin K?",
    "jawabanBenar": "Escherichia coli",
    "pengecoh": [
      "Salmonella typhi",
      "Lactobacillus",
      "Bacillus subtilis"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Bakteri E. coli di kolon bersimbiosis mutualisme dengan manusia membantu pembusukan dan sintesis vitamin K.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_19",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Karbohidrat diserap usus halus dalam bentuk paling sederhana yaitu?",
    "jawabanBenar": "Monosakarida",
    "pengecoh": [
      "Disakarida",
      "Polisakarida",
      "Amilum"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Karbohidrat kompleks harus dipecah menjadi monosakarida (seperti glukosa) agar bisa diserap usus.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_20",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Sistem Pencernaan",
    "pertanyaan": "Gerak menelan makanan yang didorong secara otot involunter?",
    "jawabanBenar": "Peristaltik",
    "pengecoh": [
      "Mastikasi",
      "Deglutisi",
      "Defekasi"
    ],
    "difficulty": "EASY",
    "explanation": "Gerak peristaltik di kerongkongan merupakan kontraksi otot involunter yang mendorong bolus makanan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_21",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Genetika",
    "pertanyaan": "Sifat fisik yang tampak dan dapat diamati disebut?",
    "jawabanBenar": "Fenotipe",
    "pengecoh": [
      "Genotipe",
      "Kromosom",
      "Alel"
    ],
    "difficulty": "EASY",
    "explanation": "Fenotipe adalah ekspresi dari sifat genetik yang bisa dilihat, seperti warna bunga atau bentuk rambut.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_22",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Genetika",
    "pertanyaan": "Susunan genetik suatu individu yang tidak selalu tampak disebut?",
    "jawabanBenar": "Genotipe",
    "pengecoh": [
      "Fenotipe",
      "Kromatin",
      "Alel ganda"
    ],
    "difficulty": "EASY",
    "explanation": "Genotipe merujuk pada komposisi gen spesifik, biasanya dilambangkan dengan huruf (contoh: Aa, BB).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_23",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Genetika",
    "pertanyaan": "Pasangan gen yang terletak pada lokus yang sama disebut?",
    "jawabanBenar": "Alel",
    "pengecoh": [
      "Kromatid",
      "Sentromer",
      "Kiasma"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Alel adalah bentuk-bentuk alternatif dari suatu gen pada posisi (lokus) tertentu.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_24",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Genetika",
    "pertanyaan": "Sifat gen yang menutupi ekspresi gen pasangannya?",
    "jawabanBenar": "Dominan",
    "pengecoh": [
      "Resesif",
      "Intermediet",
      "Kodominan"
    ],
    "difficulty": "EASY",
    "explanation": "Sifat dominan adalah sifat yang menutupi sifat resesif ketika berpasangan heterozigot.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_25",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Genetika",
    "pertanyaan": "Sifat gen yang tertutupi ekspresi gen pasangannya?",
    "jawabanBenar": "Resesif",
    "pengecoh": [
      "Dominan",
      "Homozigot",
      "Heterozigot"
    ],
    "difficulty": "EASY",
    "explanation": "Sifat resesif hanya akan terekspresikan jika pasangannya sesama resesif (homozigot resesif).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_26",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Genetika",
    "pertanyaan": "Individu dengan dua alel yang sama (contoh: AA atau aa)?",
    "jawabanBenar": "Homozigot",
    "pengecoh": [
      "Heterozigot",
      "Monohibrid",
      "Polihibrid"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Individu homozigot memiliki sepasang alel yang identik untuk suatu gen tertentu.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_27",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Genetika",
    "pertanyaan": "Individu dengan alel yang berbeda (contoh: Aa)?",
    "jawabanBenar": "Heterozigot",
    "pengecoh": [
      "Homozigot",
      "Galur murni",
      "Homolog"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Heterozigot adalah keadaan individu memiliki alel dominan dan alel resesif untuk suatu sifat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_28",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Genetika",
    "pertanyaan": "Basa nitrogen RNA yang menggantikan timin pada DNA?",
    "jawabanBenar": "Urasil",
    "pengecoh": [
      "Sitosin",
      "Guanin",
      "Adenin"
    ],
    "difficulty": "HARD",
    "explanation": "Dalam struktur RNA, basa Urasil (U) berikatan dengan Adenin (A), menggantikan peran Timin (T).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_29",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Genetika",
    "pertanyaan": "Gula pentosa penyusun struktur DNA adalah?",
    "jawabanBenar": "Deoksiribosa",
    "pengecoh": [
      "Ribosa",
      "Glukosa",
      "Fruktosa"
    ],
    "difficulty": "MEDIUM",
    "explanation": "DNA (Deoxyribonucleic acid) tersusun dari gula deoksiribosa, sedangkan RNA menggunakan gula ribosa.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_bio_30",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase E",
    "mataPelajaran": "Biologi",
    "topik": "Genetika",
    "pertanyaan": "Bapak Genetika yang merumuskan hukum pewarisan sifat?",
    "jawabanBenar": "Mendel",
    "pengecoh": [
      "Darwin",
      "Lamarck",
      "Pasteur"
    ],
    "difficulty": "EASY",
    "explanation": "Gregor Mendel dijuluki Bapak Genetika karena penelitian klasiknya dengan kacang ercis.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_3",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Listrik",
    "pertanyaan": "Hambatan listrik 5 ohm dialiri arus 2 A. Berapa tegangannya?",
    "jawabanBenar": "10 V",
    "pengecoh": [
      "7 V",
      "2.5 V",
      "0.4 V"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Hukum Ohm (V = I.R): 2 Ampere dikali 5 Ohm menghasilkan 10 Volt.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_4",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Listrik",
    "pertanyaan": "Alat pengukur kuat arus listrik dinamakan?",
    "jawabanBenar": "Amperemeter",
    "pengecoh": [
      "Voltmeter",
      "Ohmmeter",
      "Wattmeter"
    ],
    "difficulty": "EASY",
    "explanation": "Amperemeter dipasang seri untuk mengukur kuat arus listrik (Ampere).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_5",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Listrik",
    "pertanyaan": "Rangkaian di mana arus memiliki satu jalur tunggal disebut?",
    "jawabanBenar": "Seri",
    "pengecoh": [
      "Paralel",
      "Campuran",
      "Terbuka"
    ],
    "difficulty": "EASY",
    "explanation": "Pada rangkaian seri, komponen disusun berderet sehingga hanya ada satu lintasan arus.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_6",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Listrik",
    "pertanyaan": "Jika dua resistor 4 ohm dirangkai seri, berapa hambatan total?",
    "jawabanBenar": "8 ohm",
    "pengecoh": [
      "2 ohm",
      "4 ohm",
      "16 ohm"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Hambatan pengganti seri adalah penjumlahan (R_total = R1 + R2).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_7",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Listrik",
    "pertanyaan": "Daya listrik 100 watt dinyalakan 2 jam. Berapa energi (Wh)?",
    "jawabanBenar": "200 Wh",
    "pengecoh": [
      "50 Wh",
      "100 Wh",
      "102 Wh"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Energi (E = P.t) = 100 Watt dikali 2 jam menghasilkan 200 Watt-hour (Wh).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_8",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Listrik",
    "pertanyaan": "Dua muatan sejenis jika didekatkan akan mengalami gaya?",
    "jawabanBenar": "Tolak-menolak",
    "pengecoh": [
      "Tarik-menarik",
      "Diam",
      "Berputar"
    ],
    "difficulty": "EASY",
    "explanation": "Muatan listrik sejenis (misal positif dan positif) akan saling tolak-menolak.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_9",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Listrik",
    "pertanyaan": "Satuan untuk daya listrik adalah?",
    "jawabanBenar": "Watt",
    "pengecoh": [
      "Joule",
      "Ampere",
      "Coulomb"
    ],
    "difficulty": "EASY",
    "explanation": "Watt (W) adalah satuan SI untuk daya, atau laju perpindahan energi per satuan waktu.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_10",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Listrik",
    "pertanyaan": "Jumlah arus masuk titik cabang sama dengan arus keluar?",
    "jawabanBenar": "Hukum I Kirchhoff",
    "pengecoh": [
      "Hukum Ohm",
      "Hukum II Kirchhoff",
      "Hukum Faraday"
    ],
    "difficulty": "EASY",
    "explanation": "Hukum I Kirchhoff menyatakan kekekalan muatan pada suatu titik percabangan rangkaian.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_11",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Listrik",
    "pertanyaan": "Sebuah baterai 12 V dihubungkan ke lampu 3 ohm. Arusnya?",
    "jawabanBenar": "4 A",
    "pengecoh": [
      "36 A",
      "9 A",
      "15 A"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kuat arus (I = V/R) = 12 Volt dibagi 3 Ohm menghasilkan 4 Ampere.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_12",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Kinematika",
    "pertanyaan": "Besaran skalar yang menyatakan panjang lintasan benda adalah?",
    "jawabanBenar": "Jarak",
    "pengecoh": [
      "Perpindahan",
      "Kecepatan",
      "Percepatan"
    ],
    "difficulty": "EASY",
    "explanation": "Jarak adalah besaran skalar yang mengukur total panjang lintasan yang ditempuh.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_13",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Kinematika",
    "pertanyaan": "Besaran vektor dari posisi awal ke posisi akhir disebut?",
    "jawabanBenar": "Perpindahan",
    "pengecoh": [
      "Jarak",
      "Laju",
      "Kelajuan"
    ],
    "difficulty": "EASY",
    "explanation": "Perpindahan bergantung pada arah, mengukur beda posisi dari awal hingga akhir.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_14",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Kinematika",
    "pertanyaan": "Gerak dengan kecepatan konstan (tetap) dinamakan?",
    "jawabanBenar": "GLB",
    "pengecoh": [
      "GLBB",
      "Gerak Parabola",
      "Gerak Jatuh Bebas"
    ],
    "difficulty": "EASY",
    "explanation": "Gerak Lurus Beraturan (GLB) memiliki kecepatan yang konstan atau percepatan nol.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_15",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Kinematika",
    "pertanyaan": "Mobil bergerak 20 m/s selama 5 sekon. Berapa jaraknya?",
    "jawabanBenar": "100 m",
    "pengecoh": [
      "25 m",
      "4 m",
      "10 m"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Untuk GLB, jarak (s = v.t) = 20 m/s dikali 5 sekon menghasilkan 100 meter.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_16",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Kinematika",
    "pertanyaan": "Benda jatuh bebas dari ketinggian tertentu memiliki v awal?",
    "jawabanBenar": "0 m/s",
    "pengecoh": [
      "9.8 m/s",
      "10 m/s",
      "Tidak tentu"
    ],
    "difficulty": "EASY",
    "explanation": "Gerak Jatuh Bebas (GJB) diasumsikan dimulai tanpa kecepatan awal (v0 = 0).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_17",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Kinematika",
    "pertanyaan": "Dari diam, mobil dipercepat 2 m/s² selama 3 s. Kecepatannya?",
    "jawabanBenar": "6 m/s",
    "pengecoh": [
      "1.5 m/s",
      "5 m/s",
      "9 m/s"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Untuk GLBB (v = v0 + a.t) = 0 + (2)(3) = 6 m/s.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_18",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Kinematika",
    "pertanyaan": "Kurva kecepatan-waktu pada GLB berbentuk garis?",
    "jawabanBenar": "Mendatar",
    "pengecoh": [
      "Miring atas",
      "Miring bawah",
      "Parabola"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Karena kecepatan konstan (tidak berubah), grafik v terhadap t membentuk garis horizontal.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_19",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Kinematika",
    "pertanyaan": "Besaran skalar dari kecepatan dinamakan?",
    "jawabanBenar": "Kelajuan",
    "pengecoh": [
      "Percepatan",
      "Perpindahan",
      "Gaya"
    ],
    "difficulty": "EASY",
    "explanation": "Kelajuan adalah besar (magnitudo) tanpa memperhitungkan arah pergerakan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_20",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Kinematika",
    "pertanyaan": "Lintasan peluru yang ditembakkan miring ke atas berbentuk?",
    "jawabanBenar": "Parabola",
    "pengecoh": [
      "Lurus",
      "Lingkaran",
      "Hiperbola"
    ],
    "difficulty": "EASY",
    "explanation": "Kombinasi gerak lurus seragam mendatar dan GLBB vertikal membentuk lintasan parabola.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_21",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Dinamika Gaya",
    "pertanyaan": "Hukum yang menyatakan F = m.a adalah Hukum Newton?",
    "jawabanBenar": "Kedua",
    "pengecoh": [
      "Pertama",
      "Ketiga",
      "Gravitasi"
    ],
    "difficulty": "EASY",
    "explanation": "Hukum II Newton menyatakan percepatan sebanding dengan gaya netto dan berbanding terbalik dengan massa.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_22",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Dinamika Gaya",
    "pertanyaan": "Gaya tarik gravitasi bumi pada suatu massa disebut?",
    "jawabanBenar": "Berat",
    "pengecoh": [
      "Massa",
      "Gaya normal",
      "Gesekan"
    ],
    "difficulty": "EASY",
    "explanation": "Berat (w = m.g) adalah gaya akibat percepatan gravitasi planet.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_23",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Dinamika Gaya",
    "pertanyaan": "Benda bermassa 2 kg didorong 10 N. Berapa percepatannya?",
    "jawabanBenar": "5 m/s²",
    "pengecoh": [
      "20 m/s²",
      "12 m/s²",
      "8 m/s²"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Percepatan (a = F/m) = 10 N dibagi 2 kg menghasilkan 5 m/s².",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_24",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Dinamika Gaya",
    "pertanyaan": "Gaya tegak lurus bidang sentuh suatu permukaan disebut?",
    "jawabanBenar": "Gaya normal",
    "pengecoh": [
      "Gaya berat",
      "Gaya gesek",
      "Gaya sentripetal"
    ],
    "difficulty": "EASY",
    "explanation": "Gaya normal adalah gaya reaksi dari suatu permukaan bidang terhadap benda yang menekan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_25",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Dinamika Gaya",
    "pertanyaan": "Hukum Newton tentang Aksi = Reaksi adalah Hukum Newton?",
    "jawabanBenar": "Ketiga",
    "pengecoh": [
      "Pertama",
      "Kedua",
      "Gravitasi"
    ],
    "difficulty": "EASY",
    "explanation": "Hukum III Newton menyatakan bahwa setiap aksi menimbulkan gaya reaksi yang sama besar berlawanan arah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_26",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Dinamika Gaya",
    "pertanyaan": "Sifat benda yang mempertahankan keadaan diam atau gerak lurus?",
    "jawabanBenar": "Inersia",
    "pengecoh": [
      "Percepatan",
      "Gesekan",
      "Momentum"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Inersia (kelembaman) didefinisikan dalam Hukum I Newton tentang kecenderungan benda.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_27",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Dinamika Gaya",
    "pertanyaan": "Gaya gesek pada benda yang sudah bergerak disebut gaya gesek?",
    "jawabanBenar": "Kinetis",
    "pengecoh": [
      "Statis",
      "Maksimum",
      "Udara"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Gaya gesek kinetis bekerja melawan arah gerak benda yang sedang bergeser.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_28",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Dinamika Gaya",
    "pertanyaan": "Massa astronot 60 kg, beratnya di bumi (g=10 m/s²) adalah?",
    "jawabanBenar": "600 N",
    "pengecoh": [
      "60 N",
      "6 N",
      "10 N"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Berat (w = m.g) = 60 kg dikali 10 m/s² sama dengan 600 Newton.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_29",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Dinamika Gaya",
    "pertanyaan": "Gaya pengikat sentripetal pada mobil membelok umumnya gaya?",
    "jawabanBenar": "Gesekan",
    "pengecoh": [
      "Normal",
      "Berat",
      "Tegangan tali"
    ],
    "difficulty": "HARD",
    "explanation": "Saat mobil menikung datar, gaya gesekan statis ban ke aspal yang menahan agar tidak selip (sentripetal).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "sma_fis_30",
    "jenjang": "SMA",
    "kelasAtauFase": "Fase F",
    "mataPelajaran": "Fisika",
    "topik": "Dinamika Gaya",
    "pertanyaan": "Sistem katrol licin dengan beban diam, gaya tarik tali sama?",
    "jawabanBenar": "Berat benda",
    "pengecoh": [
      "Nol",
      "Dua kali berat",
      "Setengah berat"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Pada keseimbangan (a=0) dalam katrol tunggal, tegangan tali sama dengan gaya berat beban yang digantung.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FA-C-BIND-001",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Ide Pokok Paragraf",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Sampah plastik menjadi persoalan lingkungan yang sangat serius. Plastik sangat sulit terurai secara alami oleh mikroorganisme di dalam tanah. Membutuhkan waktu hingga ratusan tahun agar plastik bisa hancur sepenuhnya. Oleh karena itu, kita harus mulai mengurangi penggunaan plastik sekali pakai dari sekarang.\n\nIde pokok dari paragraf tersebut adalah...",
    "jawabanBenar": "Sampah plastik sulit terurai, menjadi persoalan serius.",
    "pengecoh": [
      "Mikroorganisme tanah butuh ratusan tahun untuk hidup.",
      "Kita harus mengurangi barang di sekitar kita.",
      "Plastik sekali pakai mudah digunakan dan dibuang."
    ],
    "explanation": "Ide pokok adalah gagasan utama yang menjadi inti pembahasan. Paragraf ini utamanya membahas tentang masalah sampah plastik yang berbahaya karena sangat sulit terurai."
  },
  {
    "id": "FA-C-BIND-002",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Informasi Tersurat",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Pusat rehabilitasi dan konservasi orang utan terbesar di dunia terdapat di Taman Nasional Tanjung Puting, Kalimantan Tengah. Tempat ini didirikan dengan tujuan utama untuk merawat dan melindungi orang utan dari ancaman kepunahan akibat kerusakan hutan.\n\nBerdasarkan teks tersebut, di manakah letak pusat konservasi orang utan?",
    "jawabanBenar": "Taman Nasional Tanjung Puting, Kalimantan Tengah.",
    "pengecoh": [
      "Taman Nasional Komodo, Nusa Tenggara Timur.",
      "Taman Nasional Ujung Kulon, Banten.",
      "Taman Nasional Way Kambas, Lampung."
    ],
    "explanation": "Informasi tersurat adalah informasi yang tertulis jelas di dalam teks. Teks dengan jelas menyebutkan bahwa pusat konservasi berada di Taman Nasional Tanjung Puting, Kalimantan Tengah."
  },
  {
    "id": "FA-C-BIND-003",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Informasi Tersirat (Simpulan)",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Lani terlihat terus-menerus menguap saat Pak Guru sedang menjelaskan pelajaran matematika di kelas. Sesekali ia menopang dagunya agar matanya tidak terpejam. Semalam, Lani baru selesai mengerjakan proyek sainsnya hingga pukul dua belas malam.\n\nKesimpulan yang tepat berdasarkan teks tersebut adalah...",
    "jawabanBenar": "Lani mengantuk di kelas karena kurang tidur.",
    "pengecoh": [
      "Lani sangat menyukai pelajaran matematika Pak Guru.",
      "Lani sakit gigi sehingga tidak mendengarkan penjelasan.",
      "Lani merasa segar karena menyelesaikan proyek sainsnya."
    ],
    "explanation": "Kesimpulan ditarik dari informasi di teks. Lani menguap dan menahan mata agar tidak terpejam karena tidur larut malam, yang menunjukkan bahwa ia sedang sangat mengantuk."
  },
  {
    "id": "FA-C-BIND-004",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Makna Kata",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Pemerintah daerah sedang menggalakkan program reboisasi di wilayah perbukitan untuk mencegah terjadinya bencana tanah longsor saat musim hujan tiba.\n\nMakna kata 'reboisasi' pada kalimat tersebut adalah...",
    "jawabanBenar": "penanaman kembali hutan yang gundul",
    "pengecoh": [
      "pembuatan terasering di tanah yang miring",
      "penebangan pohon-pohon besar yang sudah tua",
      "pembuangan sampah pada tempat yang disediakan"
    ],
    "explanation": "Dalam Kamus Besar Bahasa Indonesia (KBBI), reboisasi berarti penanaman kembali hutan yang telah ditebang (tandus, gundul) untuk mencegah erosi dan longsor."
  },
  {
    "id": "FA-C-BIND-005",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Antonim",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Udara di daerah pegunungan sangat sejuk, berbeda dengan di wilayah perkotaan padat yang terasa panas dan gerah.\n\nAntonim (lawan kata) dari kata 'sejuk' pada kalimat tersebut adalah...",
    "jawabanBenar": "panas",
    "pengecoh": [
      "dingin",
      "segar",
      "cerah"
    ],
    "explanation": "Antonim adalah lawan kata. Lawan dari kata sejuk (terasa agak dingin/nyaman) adalah panas."
  },
  {
    "id": "FA-C-BIND-006",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kata Baku",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Bacalah paragraf berikut!\n(1) Hari ini Andi pergi ke apotek untuk membeli obat penurun demam.\n(2) Ia berjalan kaki karena jaraknya cukup dekat dari rumah.\n(3) Di tengah jalan, ia melihat sebuah bis berhenti di halte.\n(4) Andi juga membeli coklat kesukaannya di minimarket.\n\nKalimat yang menggunakan kata baku secara tepat ditunjukkan oleh nomor...",
    "jawabanBenar": "(1) dan (2)",
    "pengecoh": [
      "(2) dan (3)",
      "(3) dan (4)",
      "(1) dan (4)"
    ],
    "explanation": "Kalimat (1) dan (2) menggunakan kata baku ('apotek', 'berjalan'). Kalimat (3) tidak baku karena menggunakan kata 'bis' (seharusnya 'bus'). Kalimat (4) tidak baku karena menggunakan kata 'coklat' (seharusnya 'cokelat')."
  },
  {
    "id": "FA-C-BIND-007",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Tanda Baca",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Bacalah paragraf berikut!\n(1) Pada hari Minggu, Rina pergi ke toko alat tulis. (2) Ia membeli buku tulis pensil penghapus dan penggaris. (3) Rina membayar barang belanjaannya di kasir. (4) \"Terima kasih, Kak,\" ucap Rina sambil menerima uang kembalian.\n\nKalimat yang belum menggunakan tanda baca (koma) dengan tepat adalah nomor...",
    "jawabanBenar": "(2)",
    "pengecoh": [
      "(1)",
      "(3)",
      "(4)"
    ],
    "explanation": "Kalimat (2) berisi pemerincian lebih dari dua barang sehingga wajib menggunakan tanda koma. Seharusnya: 'Ia membeli buku tulis, pensil, penghapus, dan penggaris.'"
  },
  {
    "id": "FA-C-BIND-008",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Fakta dan Opini",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Pernyataan di bawah ini yang merupakan kalimat fakta (sesuatu yang benar-benar terjadi dan terbukti kebenarannya) adalah...",
    "jawabanBenar": "Matahari terbit di timur, tenggelam di barat.",
    "pengecoh": [
      "Nasi goreng warung itu paling enak sedunia.",
      "Mungkin sore nanti turun hujan deras.",
      "Sebaiknya kamu pulang sebelum hari menjadi gelap."
    ],
    "explanation": "Fakta adalah hal, keadaan, atau peristiwa yang merupakan kenyataan atau benar-benar ada/terjadi dan tidak bisa dibantah. Terbitnya matahari di timur adalah fakta ilmiah."
  },
  {
    "id": "FA-C-BIND-009",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Fakta dan Opini",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Kalimat opini berisi pendapat, perkiraan, atau pandangan seseorang. Kalimat berikut ini yang termasuk opini adalah...",
    "jawabanBenar": "Pemandangan pantai sore hari sangat indah memukau.",
    "pengecoh": [
      "Sapi termasuk hewan pemakan rumput (herbivora).",
      "Air membeku pada suhu 0 derajat Celcius.",
      "Kucing termasuk dalam golongan hewan mamalia."
    ],
    "explanation": "Kata 'indah' dan 'memukau' bersifat subjektif, bergantung pada pendapat dan pandangan pribadi orang yang melihatnya, sehingga disebut kalimat opini."
  },
  {
    "id": "FA-C-BIND-010",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks Prosedur",
    "difficulty": "MEDIUM",
    "challengeType": "SEQUENCE",
    "pertanyaan": "Petunjuk membuat teh manis hangat:\n(1) Tuangkan air panas ke dalam gelas secukupnya.\n(2) Siapkan teh celup, gula pasir, air panas, dan sebuah gelas.\n(3) Aduk perlahan dengan sendok hingga teh dan gula larut sempurna.\n(4) Masukkan kantong teh celup dan satu sendok makan gula pasir ke dalam gelas.\n\nUrutan petunjuk membuat teh manis yang benar adalah...",
    "jawabanBenar": "(2) - (4) - (1) - (3)",
    "pengecoh": [
      "(1) - (3) - (2) - (4)",
      "(2) - (1) - (4) - (3)",
      "(4) - (1) - (3) - (2)"
    ],
    "explanation": "Urutan teks prosedur yang logis: siapkan alat bahan (2), masukkan teh dan gula (4), tuang air panas (1), lalu aduk hingga larut (3)."
  },
  {
    "id": "FA-C-BIND-011",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Huruf Kapital",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Bacalah teks berikut!\n(1) liburan sekolah tahun ini sangat menyenangkan bagi Edo. (2) Ia berkunjung ke rumah kakeknya di desa suka makmur. (3) Di sana, Edo memancing ikan di Sungai Brantas. (4) Edo berencana pulang ke jakarta pada hari minggu.\n\nKalimat yang menggunakan huruf kapital dengan tepat ditunjukkan oleh nomor...",
    "jawabanBenar": "(3)",
    "pengecoh": [
      "(1)",
      "(2)",
      "(4)"
    ],
    "explanation": "Kalimat (3) benar menggunakan kapital pada awal kalimat dan nama geografis (Sungai Brantas). Kalimat (1) salah di awal kalimat (liburan). Kalimat (2) salah di nama tempat (suka makmur). Kalimat (4) salah di nama kota dan hari (jakarta, minggu)."
  },
  {
    "id": "FA-C-BIND-012",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kalimat Efektif",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Perhatikan kalimat berikut: 'Banyak siswa-siswa yang sedang bermain bola di lapangan sekolah.'\n\nKalimat tersebut merupakan kalimat tidak efektif. Alasan yang paling tepat adalah...",
    "jawabanBenar": "pemborosan kata: 'banyak' dan 'siswa-siswa' bermakna jamak.",
    "pengecoh": [
      "kalimat tersebut tidak memiliki unsur predikat dan objek.",
      "menggunakan huruf kapital yang salah di tengah kalimat.",
      "kata 'bermain' seharusnya ditambah akhiran '-kan'."
    ],
    "explanation": "Pemborosan kata (pleonasme) terjadi jika ada dua penanda jamak yang digunakan bersamaan. 'Banyak' bermakna jamak, dan 'siswa-siswa' juga jamak. Seharusnya: 'Banyak siswa...' atau 'Siswa-siswa...'."
  },
  {
    "id": "FA-C-BIND-013",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Sinonim",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Pemerintah desa *mengimbau* masyarakat untuk menghemat penggunaan air bersih selama musim kemarau panjang.\n\nPersamaan kata (sinonim) dari kata yang dicetak miring pada kalimat tersebut adalah...",
    "jawabanBenar": "mengajak atau meminta",
    "pengecoh": [
      "memaksa atau menekan",
      "menghukum atau mendenda",
      "membiarkan atau mengabaikan"
    ],
    "explanation": "Mengimbau (bentuk baku) berarti meminta, menyerukan, atau memberi ajakan kepada masyarakat untuk melakukan sesuatu."
  },
  {
    "id": "FA-C-BIND-014",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Jenis Teks",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Pelangi terjadi karena peristiwa pembiasan cahaya matahari oleh rintik-rintik air hujan di udara. Cahaya matahari yang melewati tetesan air akan dibelokkan dan diuraikan menjadi warna-warni yang indah di langit.\n\nBerdasarkan isinya, paragraf di atas termasuk dalam jenis teks...",
    "jawabanBenar": "Teks eksplanasi",
    "pengecoh": [
      "Teks narasi",
      "Teks prosedur",
      "Teks fiksi"
    ],
    "explanation": "Teks eksplanasi adalah teks yang menjelaskan proses terjadinya suatu fenomena alam, sosial, atau budaya, beserta sebab-akibatnya secara ilmiah."
  },
  {
    "id": "FA-C-BIND-015",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Unsur Cerita (Latar)",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Sore itu, Andi duduk termenung di tepi sungai. Ia melihat aliran air sungai yang mulai surut dan mengering karena kemarau panjang. Angin meniup dedaunan kering yang jatuh di pangkuannya.\n\nLatar waktu pada kutipan cerita fiksi di atas adalah...",
    "jawabanBenar": "sore hari",
    "pengecoh": [
      "tepi sungai",
      "aliran sungai",
      "pagi hari"
    ],
    "explanation": "Latar waktu merujuk pada kapan peristiwa dalam cerita tersebut terjadi. Teks secara jelas menyebutkan frasa 'Sore itu'."
  },
  {
    "id": "FA-C-BIND-016",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Peribahasa",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Pak Darman tidak pernah menghamburkan uangnya untuk membeli barang-barang yang tidak penting. Ia selalu menyisihkan sebagian pendapatannya untuk ditabung sebagai persiapan masa depan.\n\nPeribahasa yang paling tepat untuk menggambarkan sikap Pak Darman adalah...",
    "jawabanBenar": "Hemat pangkal kaya.",
    "pengecoh": [
      "Besar pasak daripada tiang.",
      "Air susu dibalas dengan air tuba.",
      "Rajin pangkal pandai."
    ],
    "explanation": "Peribahasa 'Hemat pangkal kaya' berarti jika kita suka menabung dan hidup berhemat, kelak kita akan memiliki kecukupan (kaya) di masa depan."
  },
  {
    "id": "FA-C-BIND-017",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Ungkapan (Makna Kiasan)",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Dika selalu menjadi *bintang kelas* sejak ia duduk di kelas satu. Ia sangat tekun belajar dan suka membaca berbagai macam buku di perpustakaan.\n\nMakna ungkapan kata yang dicetak miring pada kalimat tersebut adalah...",
    "jawabanBenar": "murid yang paling pintar atau berprestasi di kelas",
    "pengecoh": [
      "murid yang sering mendapat hukuman dari guru",
      "anak yang bercita-cita menjadi astronom ruang angkasa",
      "anak yang paling nakal dan suka mengganggu teman"
    ],
    "explanation": "Ungkapan 'bintang kelas' merupakan kiasan (idiom) untuk menyebut seorang murid yang paling berprestasi atau paling menonjol kepintarannya di dalam kelas."
  },
  {
    "id": "FA-C-BIND-018",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kata Hubung (Konjungsi)",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Bacalah paragraf rumpang berikut!\nBeni sangat ingin bermain sepak bola di lapangan bersama teman-temannya. [...], hujan turun sangat deras sejak siang tadi. Beni terpaksa berdiam di rumah dan membaca buku cerita.\n\nKata hubung (konjungsi) antarkalimat yang paling tepat untuk melengkapi bagian rumpang tersebut adalah...",
    "jawabanBenar": "Namun",
    "pengecoh": [
      "Oleh karena itu",
      "Selanjutnya",
      "Meskipun"
    ],
    "explanation": "Kalimat pertama (keinginan bermain) berlawanan dengan kalimat kedua (hujan deras). Konjungsi antarkalimat yang tepat untuk menyatakan pertentangan adalah 'Namun'."
  },
  {
    "id": "FA-C-BIND-019",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Informasi Teks",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Buku fiksi adalah karya yang berisi cerita rekaan atau khayalan penulis, contohnya seperti dongeng, cerpen, dan novel. Sementara itu, buku nonfiksi adalah karya yang berisi fakta dan ilmu pengetahuan yang benar-benar nyata, contohnya buku pelajaran sejarah dan biografi tokoh.\n\nBerdasarkan teks tersebut, perbedaan utama dari buku fiksi dan nonfiksi adalah...",
    "jawabanBenar": "Fiksi berisi rekaan, nonfiksi berisi informasi fakta.",
    "pengecoh": [
      "Fiksi menceritakan kehidupan nyata, nonfiksi menceritakan khayalan.",
      "Fiksi dibaca anak-anak, nonfiksi dibaca orang dewasa.",
      "Halaman buku fiksi tebal, buku nonfiksi tipis."
    ],
    "explanation": "Teks secara eksplisit membedakan keduanya berdasarkan sifat isinya: fiksi bersumber dari khayalan penulis, sedangkan nonfiksi bersumber dari fakta dan hal nyata."
  },
  {
    "id": "FA-C-BIND-020",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kalimat Tanya",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Rina ditugaskan untuk mewawancarai seorang petugas kebersihan di sekolahnya. Ia ingin mengetahui tahapan atau proses pengelolaan sampah daun kering menjadi pupuk kompos.\n\nKalimat tanya yang paling tepat digunakan Rina untuk menggali informasi tersebut adalah...",
    "jawabanBenar": "\"Bagaimana cara Bapak mengolah sampah menjadi kompos?\"",
    "pengecoh": [
      "\"Kapan Bapak mulai membuat pupuk kompos ini?\"",
      "\"Di mana Bapak menyimpan kompos yang jadi?\"",
      "\"Siapa yang menyuruh Bapak membuat pupuk kompos ini?\""
    ],
    "explanation": "Untuk menanyakan sebuah tahapan, proses, atau cara melakukan sesuatu, kata tanya yang tepat digunakan adalah 'bagaimana'."
  },
  {
    "id": "FA-C-BIND-021",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Tanggapan Logis",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Andi sering datang terlambat ke sekolah hingga dihukum oleh guru piket. Hal ini terjadi karena ia selalu tidur sangat larut malam untuk bermain game di ponselnya.\n\nTanggapan atau saran yang paling tepat dan logis untuk Andi adalah...",
    "jawabanBenar": "Andi sebaiknya kurangi bermain game agar cukup tidur.",
    "pengecoh": [
      "Andi berhenti sekolah agar bebas bermain game.",
      "Guru piket tidak boleh menghukum Andi.",
      "Andi harus pindah sekolah yang masuknya siang."
    ],
    "explanation": "Tanggapan yang baik harus bersifat membangun, masuk akal (logis), dan memberikan solusi yang tepat atas masalah utamanya (tidur larut malam karena game)."
  },
  {
    "id": "FA-C-BIND-022",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Jenis Teks (Iklan)",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "\"Ayo, biasakan hidup sehat! Cucilah tanganmu menggunakan sabun dengan air mengalir agar terhindar dari kuman penyebab berbagai penyakit berbahaya.\"\n\nBerdasarkan isi dan tujuannya, teks di atas termasuk ke dalam jenis iklan...",
    "jawabanBenar": "layanan masyarakat",
    "pengecoh": [
      "penawaran barang",
      "pengumuman orang hilang",
      "lowongan pekerjaan"
    ],
    "explanation": "Iklan layanan masyarakat adalah iklan yang menyajikan pesan-pesan sosial untuk membangkitkan kepedulian masyarakat terhadap masalah tertentu, seperti kesehatan dan kebersihan."
  },
  {
    "id": "FA-C-BIND-023",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Imbuhan",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Pak Edo mendapat tugas untuk [...] dinding ruang perpustakaan agar terlihat lebih cerah menyambut tahun ajaran baru.\n\nKata berimbuhan yang tepat untuk melengkapi bagian rumpang pada kalimat tersebut adalah...",
    "jawabanBenar": "mengecat",
    "pengecoh": [
      "mencecat",
      "mengcat",
      "menyecat"
    ],
    "explanation": "Kata dasar yang hanya memiliki satu suku kata (seperti 'cat', 'bom', 'lap') jika diberi awalan 'me-' akan berubah bentuk menjadi 'menge-'. Jadi bentuk yang benar adalah mengecat."
  },
  {
    "id": "FA-C-BIND-024",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Wawancara",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Siswa kelas 5 mendapat tugas kelompok untuk mencari informasi tentang cara fermentasi kedelai menjadi tempe yang benar. Narasumber yang paling tepat untuk diwawancarai oleh kelompok tersebut adalah...",
    "jawabanBenar": "perajin tempe",
    "pengecoh": [
      "peternak sapi",
      "pedagang buah",
      "dokter gigi"
    ],
    "explanation": "Narasumber adalah orang yang memberikan informasi yang valid. Untuk topik pembuatan tempe, orang yang paling ahli dan relevan adalah perajin pembuat tempe."
  },
  {
    "id": "FA-C-BIND-025",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Ringkasan Teks",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Bersepeda memiliki banyak manfaat bagi tubuh kita. Selain dapat memperkuat otot-otot kaki, bersepeda secara rutin juga berguna untuk menjaga kesehatan jantung. Kegiatan ini juga dinilai ramah lingkungan karena sepeda tidak mengeluarkan asap hasil pembakaran bahan bakar.\n\nRingkasan yang paling tepat dari keseluruhan teks di atas adalah...",
    "jawabanBenar": "Bersepeda menyehatkan tubuh dan menjadi transportasi ramah.",
    "pengecoh": [
      "Asap motor dapat menyebabkan penyakit jantung.",
      "Sepeda dikayuh kekuatan otot agar berjalan cepat.",
      "Semua orang bekerja naik sepeda tanpa bahan bakar."
    ],
    "explanation": "Ringkasan adalah intisari teks yang merangkum seluruh ide pokoknya. Ringkasan yang benar mencakup poin manfaat kesehatan (otot, jantung) dan aspek ramah lingkungan."
  },
  {
    "id": "FA-C-BIND-026",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kalimat Persuasif",
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Bacalah teks poster berikut!\n(1) Hutan adalah paru-paru dunia yang menghasilkan oksigen. (2) Banyak hewan dan tumbuhan langka hidup di dalamnya. (3) Mari kita lindungi hutan dari penebangan liar! (4) Menjaga kelestarian hutan adalah tanggung jawab kita bersama.\n\nKalimat persuasif pada teks poster tersebut ditunjukkan oleh nomor...",
    "jawabanBenar": "(3)",
    "pengecoh": [
      "(1)",
      "(2)",
      "(4)"
    ],
    "explanation": "Kalimat persuasif bertujuan untuk membujuk atau mengajak, yang sering kali ditandai dengan kata seruan ajakan seperti 'mari' atau 'ayo'. Hal ini terdapat pada kalimat (3)."
  },
  {
    "id": "FA-C-BIND-027",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks Pidato",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Bacalah kutipan teks pidato berikut!\n\"Teman-teman yang saya cintai, menjaga kebersihan kelas adalah tanggung jawab kita bersama. Kelas yang bersih akan membuat kita belajar dengan nyaman. Oleh karena itu, saya mengajak teman-teman semua untuk selalu membuang sampah pada tempatnya dan melaksanakan piket dengan rajin.\"\n\nIsi atau tujuan utama dari kutipan pidato tersebut adalah...",
    "jawabanBenar": "mengajak bekerja sama menjaga kebersihan kelas",
    "pengecoh": [
      "meminta maaf jika ada kesalahan tugas piket",
      "menceritakan pengalaman pribadi membersihkan ruang kelas sendirian",
      "mengucapkan syukur karena bisa berkumpul di kelas"
    ],
    "explanation": "Berdasarkan isinya, pembicara dengan jelas mengutarakan ajakan (persuasi) agar teman-temannya mau bersama-sama membuang sampah dan menjalankan piket kelas."
  },
  {
    "id": "FA-C-BIND-028",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Surat Pribadi",
    "difficulty": "MEDIUM",
    "challengeType": "SEQUENCE",
    "pertanyaan": "Perhatikan kerangka bagian-bagian surat pribadi berikut:\n(1) Tempat dan tanggal pembuatan surat\n(2) Alamat tujuan surat\n(3) Salam pembuka\n(4) Isi surat\n(5) Salam penutup dan tanda tangan pengirim\n\nSusunan kerangka surat pribadi yang tepat dari awal hingga akhir adalah...",
    "jawabanBenar": "(1)-(2)-(3)-(4)-(5)",
    "pengecoh": [
      "(3)-(1)-(2)-(4)-(5)",
      "(1)-(3)-(2)-(5)-(4)",
      "(2)-(1)-(4)-(3)-(5)"
    ],
    "explanation": "Secara standar, format surat pribadi dimulai dengan (1) tempat/tanggal di sudut atas, (2) alamat tujuan, (3) salam pembuka, (4) isi pesan, dan diakhiri dengan (5) salam penutup beserta tanda tangan."
  },
  {
    "id": "FA-C-BIND-029",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Jenis Teks Fiksi",
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "pertanyaan": "Cerita fiksi tentang asal-usul terjadinya Gunung Tangkuban Perahu atau mitos tentang Si Malin Kundang yang berubah menjadi batu karena durhaka, termasuk ke dalam jenis cerita...",
    "jawabanBenar": "legenda",
    "pengecoh": [
      "fabel",
      "biografi",
      "berita"
    ],
    "explanation": "Legenda adalah cerita rakyat pada zaman dahulu yang ada hubungannya dengan kejadian magis, mitos, tokoh sejarah, atau asal-usul terjadinya suatu tempat (seperti Tangkuban Perahu)."
  },
  {
    "id": "FA-C-BIND-030",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks Laporan Pengamatan",
    "difficulty": "MEDIUM",
    "challengeType": "MULTI_TARGET",
    "pertanyaan": "Perhatikan ciri-ciri penulisan teks berikut:\n(1) Menggunakan kalimat berupa perintah atau larangan.\n(2) Berisi data dan fakta yang objektif (nyata).\n(3) Berisi cerita khayalan penulis yang didramatisir.\n(4) Ditulis berdasarkan hasil observasi secara langsung di lapangan.\n\nCiri-ciri utama dari penulisan sebuah teks laporan hasil pengamatan ditunjukkan oleh nomor...",
    "jawabanBenar": "(2) dan (4)",
    "pengecoh": [
      "(1) dan (3)",
      "(2) dan (3)",
      "(1) dan (4)"
    ],
    "explanation": "Teks laporan hasil pengamatan (observasi) adalah teks yang disusun untuk melaporkan sebuah kejadian, benda, atau tempat secara objektif dan faktual setelah diamati secara langsung."
  },
  {
    "id": "FD-MAT-001",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Bilangan",
    "pertanyaan": "Suhu di kota A pada pagi hari adalah -5°C. Pada siang hari suhunya naik 12°C, dan pada malam hari turun 9°C. Berapa suhu kota A pada malam hari?",
    "jawabanBenar": "-2°C",
    "pengecoh": [
      "2°C",
      "-16°C",
      "8°C"
    ],
    "difficulty": "EASY",
    "explanation": "Suhu siang = -5 + 12 = 7°C. Suhu malam = 7 - 9 = -2°C.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-002",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Bilangan",
    "pertanyaan": "Ibu membagikan 2 1/4 kg gula kepada 3 tetangganya sama rata. Jika setiap tetangga sebelumnya sudah memiliki 1/2 kg gula, berapa total gula yang dimiliki masing-masing tetangga sekarang?",
    "jawabanBenar": "1 1/4 kg",
    "pengecoh": [
      "1 kg",
      "3/4 kg",
      "1 1/2 kg"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Gula yang dibagikan = 2 1/4 : 3 = 9/4 x 1/3 = 3/4 kg. Total gula = 3/4 + 1/2 = 3/4 + 2/4 = 5/4 = 1 1/4 kg.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-003",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Bilangan",
    "pertanyaan": "Lampu A menyala setiap 15 menit, lampu B setiap 20 menit, dan lampu C setiap 25 menit. Jika ketiga lampu menyala bersamaan pada pukul 08:00, pada pukul berapa ketiganya menyala bersamaan lagi untuk kedua kalinya?",
    "jawabanBenar": "13:00",
    "pengecoh": [
      "11:00",
      "12:00",
      "10:00"
    ],
    "difficulty": "HARD",
    "explanation": "KPK dari 15, 20, dan 25 adalah 300 menit (5 jam). 08:00 + 5 jam = 13:00.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-004",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Aljabar",
    "pertanyaan": "Bentuk sederhana dari 3x + 5y - 2x + y adalah...",
    "jawabanBenar": "x + 6y",
    "pengecoh": [
      "x + 4y",
      "5x + 6y",
      "x - 6y"
    ],
    "difficulty": "EASY",
    "explanation": "Menggabungkan suku sejenis: (3x - 2x) + (5y + y) = x + 6y.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-005",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Aljabar",
    "pertanyaan": "Hasil perkalian dari (2x - 3)(x + 4) adalah...",
    "jawabanBenar": "2x² + 5x - 12",
    "pengecoh": [
      "2x² - 5x - 12",
      "2x² + x - 12",
      "2x² + 5x + 12"
    ],
    "difficulty": "MEDIUM",
    "explanation": "(2x)(x) + (2x)(4) + (-3)(x) + (-3)(4) = 2x² + 8x - 3x - 12 = 2x² + 5x - 12.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-006",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Aljabar",
    "pertanyaan": "Sebuah persegi panjang memiliki ukuran panjang (3x + 2) cm dan lebar (2x - 1) cm. Jika kelilingnya 42 cm, maka luas persegi panjang tersebut adalah...",
    "jawabanBenar": "98 cm²",
    "pengecoh": [
      "104 cm²",
      "112 cm²",
      "96 cm²"
    ],
    "difficulty": "HARD",
    "explanation": "Keliling = 2(p+l) = 2(3x+2 + 2x-1) = 2(5x+1) = 10x+2. 10x+2 = 42 -> 10x = 40 -> x=4. Panjang = 14, lebar = 7. Luas = 14*7 = 98 cm².",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-007",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Persamaan Linear",
    "pertanyaan": "Nilai x yang memenuhi persamaan 4x - 5 = 11 adalah...",
    "jawabanBenar": "4",
    "pengecoh": [
      "3",
      "5",
      "6"
    ],
    "difficulty": "EASY",
    "explanation": "4x = 11 + 5 = 16. Maka x = 16 / 4 = 4.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-008",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Persamaan Linear",
    "pertanyaan": "Umur ayah 3 kali umur Budi. Selisih umur mereka adalah 26 tahun. Umur Budi sekarang adalah...",
    "jawabanBenar": "13 tahun",
    "pengecoh": [
      "12 tahun",
      "14 tahun",
      "15 tahun"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Misal umur Budi = x, umur ayah = 3x. 3x - x = 26 -> 2x = 26 -> x = 13.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-009",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Pertidaksamaan Linear",
    "pertanyaan": "Himpunan penyelesaian dari 2x + 7 < 5x - 8, untuk x anggota bilangan bulat adalah...",
    "jawabanBenar": "x > 5",
    "pengecoh": [
      "x < 5",
      "x > 3",
      "x < 3"
    ],
    "difficulty": "MEDIUM",
    "explanation": "7 + 8 < 5x - 2x -> 15 < 3x -> x > 5.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-010",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Relasi dan Fungsi",
    "pertanyaan": "Diketahui f(x) = 3x - 2. Nilai dari f(4) adalah...",
    "jawabanBenar": "10",
    "pengecoh": [
      "12",
      "14",
      "8"
    ],
    "difficulty": "EASY",
    "explanation": "Substitusi x = 4 ke dalam fungsi: 3(4) - 2 = 12 - 2 = 10.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-011",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Relasi dan Fungsi",
    "pertanyaan": "Suatu fungsi dirumuskan dengan f(x) = ax + b. Jika f(2) = 7 dan f(5) = 16, maka nilai f(3) adalah...",
    "jawabanBenar": "10",
    "pengecoh": [
      "9",
      "11",
      "12"
    ],
    "difficulty": "MEDIUM",
    "explanation": "f(5)-f(2) = 3a = 9 -> a = 3. 2(3)+b=7 -> b=1. f(x) = 3x + 1. f(3) = 3(3)+1 = 10.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-012",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Relasi dan Fungsi",
    "pertanyaan": "Himpunan pasangan berurutan berikut yang merupakan fungsi (pemetaan) adalah...",
    "jawabanBenar": "{(1,a), (2,b), (3,c)}",
    "pengecoh": [
      "{(1,a), (1,b), (2,c)}",
      "{(1,a), (2,a), (2,b)}",
      "{(1,b), (3,a), (3,c)}"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Fungsi mengharuskan setiap anggota domain dipasangkan tepat satu kali dengan anggota kodomain. Hanya himpunan pertama yang tidak mengulang elemen domain.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-013",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Perbandingan",
    "pertanyaan": "Harga 4 buah buku adalah Rp12.000,00. Harga 7 buah buku yang sama adalah...",
    "jawabanBenar": "Rp21.000,00",
    "pengecoh": [
      "Rp24.000,00",
      "Rp18.000,00",
      "Rp28.000,00"
    ],
    "difficulty": "EASY",
    "explanation": "Harga per buku = 12.000 / 4 = Rp3.000. Harga 7 buku = 7 x 3.000 = Rp21.000.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-014",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Perbandingan",
    "pertanyaan": "Jarak dua kota pada peta dengan skala 1 : 1.500.000 adalah 4 cm. Jarak sebenarnya kedua kota tersebut adalah...",
    "jawabanBenar": "60 km",
    "pengecoh": [
      "6 km",
      "600 km",
      "40 km"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Jarak sebenarnya = 4 cm x 1.500.000 = 6.000.000 cm = 60 km.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-015",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Perbandingan",
    "pertanyaan": "Suatu pekerjaan dapat diselesaikan oleh 12 orang dalam 20 hari. Jika pekerjaan ingin diselesaikan dalam 15 hari, tambahan pekerja yang dibutuhkan adalah...",
    "jawabanBenar": "4 orang",
    "pengecoh": [
      "16 orang",
      "3 orang",
      "5 orang"
    ],
    "difficulty": "MEDIUM",
    "explanation": "12 x 20 = x * 15 -> x = 240 / 15 = 16 orang total. Tambahan = 16 - 12 = 4 orang.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-016",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Perbandingan",
    "pertanyaan": "Seekor kuda dapat menghabiskan rumput dalam 6 hari, sedangkan seekor kambing menghabiskan rumput yang sama dalam 12 hari. Jika mereka makan bersama-sama, rumput tersebut akan habis dalam...",
    "jawabanBenar": "4 hari",
    "pengecoh": [
      "9 hari",
      "3 hari",
      "5 hari"
    ],
    "difficulty": "HARD",
    "explanation": "Kecepatan kuda = 1/6 per hari, kambing = 1/12 per hari. Kecepatan bersama = 1/6 + 1/12 = 3/12 = 1/4 per hari. Waktu = 4 hari.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-017",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Geometri",
    "pertanyaan": "Besar pelurus dari suatu sudut yang besarnya 40° adalah...",
    "jawabanBenar": "140°",
    "pengecoh": [
      "50°",
      "130°",
      "60°"
    ],
    "difficulty": "EASY",
    "explanation": "Sudut pelurus (suplemen) berjumlah 180°. Maka pelurusnya = 180° - 40° = 140°.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-018",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Geometri",
    "pertanyaan": "Sebuah segitiga siku-siku memiliki panjang sisi siku-siku 8 cm dan 15 cm. Panjang sisi miringnya adalah...",
    "jawabanBenar": "17 cm",
    "pengecoh": [
      "19 cm",
      "23 cm",
      "25 cm"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Tripel Pythagoras: c = akar(8² + 15²) = akar(64 + 225) = akar(289) = 17 cm.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-019",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Geometri",
    "pertanyaan": "Sebuah balok memiliki ukuran panjang 10 cm, lebar 6 cm, dan tinggi 5 cm. Luas permukaan balok tersebut adalah...",
    "jawabanBenar": "280 cm²",
    "pengecoh": [
      "300 cm²",
      "260 cm²",
      "320 cm²"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Luas = 2(pl + pt + lt) = 2(60 + 50 + 30) = 2(140) = 280 cm².",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-020",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Geometri",
    "pertanyaan": "Sebuah taman berbentuk lingkaran dengan jari-jari 14 m. Di sekeliling taman ditanami pohon dengan jarak antar pohon 4 m. Banyak pohon yang dibutuhkan adalah... (π = 22/7)",
    "jawabanBenar": "22 pohon",
    "pengecoh": [
      "44 pohon",
      "20 pohon",
      "24 pohon"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Keliling = 2 x 22/7 x 14 = 88 m. Banyak pohon = 88 / 4 = 22 pohon.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-021",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Geometri",
    "pertanyaan": "Volume limas persegi dengan keliling alas 40 cm dan tinggi sisi tegak 13 cm adalah...",
    "jawabanBenar": "400 cm³",
    "pengecoh": [
      "1200 cm³",
      "480 cm³",
      "360 cm³"
    ],
    "difficulty": "HARD",
    "explanation": "Sisi alas = 40/4 = 10 cm. Tinggi limas: t = akar(13² - 5²) = akar(169 - 25) = 12 cm. Volume = 1/3 x luas alas x t = 1/3 x (10x10) x 12 = 400 cm³.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-022",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Pengukuran",
    "pertanyaan": "Kecepatan sebuah mobil adalah 72 km/jam. Jika dinyatakan dalam m/s, kecepatan tersebut setara dengan...",
    "jawabanBenar": "20 m/s",
    "pengecoh": [
      "15 m/s",
      "25 m/s",
      "12 m/s"
    ],
    "difficulty": "EASY",
    "explanation": "72 km/jam = 72.000 m / 3600 s = 20 m/s.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-023",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Pengukuran",
    "pertanyaan": "Jarak kota A dan B adalah 150 km. Andi berangkat dari kota A pukul 07:00 dengan kecepatan 40 km/jam, dan Budi dari B pukul 07:00 dengan kecepatan 60 km/jam. Pada pukul berapa mereka berpapasan?",
    "jawabanBenar": "08:30",
    "pengecoh": [
      "08:00",
      "09:00",
      "09:30"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Waktu berpapasan = Jarak / (V1+V2) = 150 / (40+60) = 150/100 = 1,5 jam = 1 jam 30 menit. 07:00 + 1:30 = 08:30.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-024",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Statistika",
    "pertanyaan": "Median dari data: 7, 5, 8, 6, 9, 7, 6, 8, 9, 7 adalah...",
    "jawabanBenar": "7",
    "pengecoh": [
      "6",
      "7,5",
      "8"
    ],
    "difficulty": "EASY",
    "explanation": "Data diurutkan: 5, 6, 6, 7, 7, 7, 8, 8, 9, 9 (10 data). Median = (7+7)/2 = 7.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-025",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Statistika",
    "pertanyaan": "Rata-rata nilai ulangan 15 siswa adalah 75. Setelah nilai 5 siswa susulan digabungkan, rata-ratanya menjadi 78. Rata-rata nilai 5 siswa susulan tersebut adalah...",
    "jawabanBenar": "87",
    "pengecoh": [
      "82",
      "85",
      "90"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Total awal = 15 x 75 = 1125. Total gabungan = 20 x 78 = 1560. Total 5 siswa = 1560 - 1125 = 435. Rata-rata = 435 / 5 = 87.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-026",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Peluang",
    "pertanyaan": "Pada pelemparan dua keping uang logam, peluang muncul keduanya angka adalah...",
    "jawabanBenar": "1/4",
    "pengecoh": [
      "1/2",
      "3/4",
      "1/3"
    ],
    "difficulty": "EASY",
    "explanation": "Ruang sampel = {(A,A), (A,G), (G,A), (G,G)}. Kejadian (A,A) = 1. Peluang = 1/4.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-027",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Peluang",
    "pertanyaan": "Sebuah dadu dilempar sekali. Peluang munculnya mata dadu faktor dari 6 adalah...",
    "jawabanBenar": "2/3",
    "pengecoh": [
      "1/2",
      "1/3",
      "5/6"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Ruang sampel = {1,2,3,4,5,6}. Faktor dari 6 = {1, 2, 3, 6}, ada 4. Peluang = 4/6 = 2/3.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-028",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Peluang",
    "pertanyaan": "Dalam sebuah kantong terdapat 5 kelereng merah dan 3 kelereng biru. Diambil dua kelereng sekaligus secara acak. Peluang terambil keduanya kelereng merah adalah...",
    "jawabanBenar": "5/14",
    "pengecoh": [
      "5/8",
      "25/64",
      "5/16"
    ],
    "difficulty": "HARD",
    "explanation": "Total kombinasi = 8C2 = 28. Kombinasi 2 merah = 5C2 = 10. Peluang = 10/28 = 5/14.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-029",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Aritmetika Sosial",
    "pertanyaan": "Seorang pedagang membeli barang seharga Rp200.000,00 lalu menjualnya dengan keuntungan 15%. Harga jual barang tersebut adalah...",
    "jawabanBenar": "Rp230.000,00",
    "pengecoh": [
      "Rp215.000,00",
      "Rp240.000,00",
      "Rp220.000,00"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Untung = 15% x 200.000 = Rp30.000. Harga jual = 200.000 + 30.000 = Rp230.000.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-MAT-030",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Matematika",
    "topik": "Aritmetika Sosial",
    "pertanyaan": "Harga sepasang sepatu setelah diskon 20% adalah Rp160.000,00. Harga awal sepatu sebelum diskon adalah...",
    "jawabanBenar": "Rp200.000,00",
    "pengecoh": [
      "Rp192.000,00",
      "Rp180.000,00",
      "Rp220.000,00"
    ],
    "difficulty": "MEDIUM",
    "explanation": "80% dari Harga Awal = Rp160.000. Harga Awal = 160.000 / 0.8 = Rp200.000.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-001",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Makna Kata",
    "pertanyaan": "Bacalah kalimat berikut: 'Tim penyelamat segera melakukan **evakuasi** warga yang terjebak banjir.' Makna kata evakuasi pada kalimat tersebut adalah...",
    "jawabanBenar": "pemindahan penduduk dari daerah bahaya ke tempat aman",
    "pengecoh": [
      "penyelamatan harta benda dari daerah bencana",
      "pemberian bantuan makanan dan obat-obatan",
      "peninjauan lokasi yang terkena musibah"
    ],
    "difficulty": "EASY",
    "explanation": "Dalam KBBI, evakuasi berarti pemindahan atau penyingkiran (penduduk, dsb.) dari daerah yang dianggap berbahaya ke tempat yang aman.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-002",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Ide Pokok",
    "pertanyaan": "Hutan mangrove memiliki peran penting bagi lingkungan pesisir. Akar-akarnya yang kuat mampu menahan ombak sehingga mencegah abrasi. Selain itu, hutan mangrove juga menjadi tempat berkembang biak berbagai jenis biota laut seperti udang dan ikan kecil. Oleh karena itu, kelestarian hutan mangrove harus terus dijaga.\n\nIde pokok paragraf tersebut adalah...",
    "jawabanBenar": "Peran penting hutan mangrove bagi lingkungan pesisir",
    "pengecoh": [
      "Cara mencegah abrasi dengan hutan mangrove",
      "Hutan mangrove sebagai tempat berkembang biak",
      "Himbauan untuk menjaga kelestarian hutan mangrove"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Ide pokok adalah gagasan utama yang menjiwai seluruh paragraf. Kalimat pertama 'Hutan mangrove memiliki peran penting bagi lingkungan pesisir' merangkum seluruh isi paragraf.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-003",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Simpulan",
    "pertanyaan": "Banyak remaja saat ini lebih suka menghabiskan waktu bermain gawai daripada berolahraga. Akibatnya, angka kebugaran jasmani pada remaja menurun. Padahal, masa remaja adalah masa pertumbuhan fisik yang membutuhkan aktivitas gerak yang cukup. Jika dibiarkan, hal ini dapat meningkatkan risiko penyakit metabolik di masa depan.\n\nSimpulan yang paling tepat dari teks tersebut adalah...",
    "jawabanBenar": "Gaya hidup kurang gerak remaja mengancam kesehatan",
    "pengecoh": [
      "Bermain gawai satu-satunya penyebab menurunnya kebugaran",
      "Remaja dilarang menggunakan gawai agar sehat",
      "Penyakit metabolik hanya menyerang remaja malas berolahraga"
    ],
    "difficulty": "HARD",
    "explanation": "Simpulan merangkum ide pokok dan akibat logis dalam teks tanpa menambahkan opini di luar teks (ancaman kesehatan masa depan akibat kurang gerak/gawai).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-004",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks Deskripsi",
    "pertanyaan": "Pantai Parangtritis memiliki hamparan pasir hitam yang eksotis. Deburan ombak yang besar menjadi ciri khas pantai di pesisir selatan ini. Saat senja, langit di ufuk barat merona jingga, menciptakan siluet tebing karang yang memukau.\n\nTujuan penulisan teks tersebut adalah...",
    "jawabanBenar": "Menggambarkan suasana dan keindahan Pantai Parangtritis",
    "pengecoh": [
      "Menceritakan sejarah Pantai Parangtritis",
      "Menjelaskan proses terjadinya ombak besar",
      "Mengajak pembaca berwisata ke Pantai Parangtritis"
    ],
    "difficulty": "EASY",
    "explanation": "Teks deskripsi bertujuan merinci atau menggambarkan objek secara nyata agar pembaca seolah-olah melihat atau merasakannya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-005",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kohesi dan Koherensi",
    "pertanyaan": "(1) Sampah plastik menjadi masalah serius di perkotaan. (2) Sulitnya sampah plastik terurai membuat volume sampah di TPA terus menumpuk. (3) [...] (4) Salah satunya adalah dengan membawa kantong belanja kain saat ke pasar.\n\nKalimat yang tepat untuk melengkapi bagian rumpang agar paragraf menjadi padu adalah...",
    "jawabanBenar": "Oleh karena itu, diperlukan upaya mengurangi plastik.",
    "pengecoh": [
      "Banyak orang masih membuang sampah di sungai.",
      "Pemerintah harus membangun lebih banyak TPA baru.",
      "Sampah plastik dapat didaur ulang menjadi kerajinan."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kalimat sebelum rumpang membahas masalah penumpukan, kalimat setelah rumpang memberi contoh solusi tindakan. Kalimat penghubung yang logis adalah perlunya upaya mengurangi plastik.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-006",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kalimat Efektif",
    "pertanyaan": "Kalimat berikut ini yang merupakan kalimat efektif adalah...",
    "jawabanBenar": "Semua peserta rapat harus mematuhi tata tertib.",
    "pengecoh": [
      "Bagi semua peserta rapat harus mematuhi aturan.",
      "Semua peserta rapat-rapat harus mematuhi tata tertib.",
      "Peserta rapat sekalian harus mematuhi tata tertib."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kalimat 'Semua peserta rapat harus mematuhi tata tertib' memiliki struktur S-P-O yang jelas tanpa pemborosan kata atau kata depan di awal kalimat yang menghilangkan subjek.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-007",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Ejaan dan Tanda Baca",
    "pertanyaan": "Penulisan huruf kapital yang benar terdapat pada kalimat...",
    "jawabanBenar": "Bapak Presiden Joko Widodo meresmikan jembatan Papua.",
    "pengecoh": [
      "Ibu membeli pisang Ambon di pasar tradisional.",
      "sungai Kapuas adalah sungai terpanjang di Indonesia.",
      "Paman baru saja pulang dari Surabaya kemarin."
    ],
    "difficulty": "EASY",
    "explanation": "Huruf kapital digunakan pada awal kalimat, nama gelar yang diikuti nama orang, dan nama geografi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-008",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks Prosedur",
    "pertanyaan": "Perhatikan petunjuk acak membuat nasi goreng berikut!\n1. Masukkan nasi dan aduk hingga rata.\n2. Haluskan bawang merah, bawang putih, dan cabai.\n3. Tambahkan garam dan kecap secukupnya.\n4. Panaskan minyak goreng di wajan.\n5. Tumis bumbu halus hingga harum.\n\nUrutan yang tepat agar menjadi teks prosedur yang padu adalah...",
    "jawabanBenar": "2-4-5-1-3",
    "pengecoh": [
      "4-2-5-3-1",
      "2-5-4-1-3",
      "4-5-2-1-3"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Langkah logis: menghaluskan bumbu (2), memanaskan minyak (4), menumis (5), memasukkan nasi (1), lalu membumbui (3).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-009",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Fakta dan Opini",
    "pertanyaan": "Kalimat manakah yang merupakan opini dari teks berita tentang kekeringan?",
    "jawabanBenar": "Kondisi ini mungkin yang terparah dalam dekade.",
    "pengecoh": [
      "BPBD mencatat 15 desa mengalami krisis air.",
      "Bantuan air bersih 10 truk tangki dikirim.",
      "Suhu udara pada siang hari 34 derajat."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Opini ditandai dengan kata-kata dugaan atau penilaian pribadi seperti 'mungkin akan menjadi...'. Kalimat lainnya mengandung angka atau kejadian spesifik yang bisa diverifikasi (fakta).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-010",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks Persuasi",
    "pertanyaan": "Mari kita biasakan memilah sampah dari rumah tangga. Dengan memisahkan sampah organik dan anorganik, kita mempermudah proses daur ulang. Tindakan kecil kita ini sangat berarti bagi kelestarian bumi.\n\nTujuan utama dari penggalan teks tersebut adalah...",
    "jawabanBenar": "Mengajak pembaca memilah sampah organik dan anorganik.",
    "pengecoh": [
      "Menjelaskan perbedaan sampah organik dan anorganik.",
      "Menceritakan cara mengolah sampah menjadi pupuk.",
      "Menyajikan data penumpukan sampah di bumi."
    ],
    "difficulty": "EASY",
    "explanation": "Kata 'Mari' dan penjelasan manfaatnya menunjukkan bahwa teks bertujuan membujuk atau mengajak pembaca melakukan suatu tindakan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-011",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks Eksplanasi",
    "pertanyaan": "Teks eksplanasi disusun dengan struktur yang baku. Bagian teks eksplanasi yang berisi penjelasan terperinci tentang proses terjadinya suatu fenomena disebut...",
    "jawabanBenar": "Deretan penjelas",
    "pengecoh": [
      "Identifikasi fenomena",
      "Interpretasi",
      "Pernyataan umum"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Struktur teks eksplanasi: Pernyataan Umum, Deretan Penjelas (urutan sebab-akibat), dan Interpretasi (opsional). Deretan penjelas berisi detail proses terjadinya fenomena.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-012",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Ejaan dan Tanda Baca",
    "pertanyaan": "Penggunaan tanda baca koma (,) yang tepat terdapat pada kalimat...",
    "jawabanBenar": "Oleh karena itu, kita harus menjaga kebersihan.",
    "pengecoh": [
      "Ibu membeli, sayur ayam dan buah di pasar.",
      "Dia tidak datang, karena hari hujan deras.",
      "Budi membaca buku dan, Andi bermain komputer."
    ],
    "difficulty": "EASY",
    "explanation": "Tanda koma wajib digunakan di belakang kata atau ungkapan penghubung antarkalimat, seperti 'Oleh karena itu,'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-013",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Makna Tersirat",
    "pertanyaan": "Dalam cerita, diceritakan bahwa Andi 'selalu ringan tangan' saat teman-temannya mengalami kesulitan. Makna ungkapan 'ringan tangan' adalah...",
    "jawabanBenar": "Suka menolong",
    "pengecoh": [
      "Suka memukul",
      "Cepat marah",
      "Bekerja dengan cepat"
    ],
    "difficulty": "EASY",
    "explanation": "Dalam konteks membantu teman yang kesulitan, 'ringan tangan' bermakna kiasan untuk orang yang suka menolong. (Terkadang juga berarti suka memukul, tetapi konteks kalimat ini adalah hal positif).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-014",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Evaluasi Teks",
    "pertanyaan": "Sebuah artikel mengklaim bahwa makan cokelat setiap hari dapat menyembuhkan penyakit mata minus, dengan mengutip testimoni seorang selebritas tanpa referensi medis. Evaluasi logis yang tepat terhadap klaim teks tersebut adalah...",
    "jawabanBenar": "Klaim kurang kredibel karena tidak didukung riset.",
    "pengecoh": [
      "Klaim benar karena selebritas memiliki informasi akurat.",
      "Klaim salah karena cokelat hanya menaikkan berat.",
      "Klaim benar asalkan mengonsumsi cokelat hitam saja."
    ],
    "difficulty": "HARD",
    "explanation": "Kredibilitas teks informasi diukur dari validitas sumber pendukungnya. Testimoni tokoh tanpa basis medis bukanlah bukti yang kuat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-015",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Sintesis Informasi",
    "pertanyaan": "Teks 1: Vitamin C dosis tinggi terbukti mempercepat pemulihan sariawan dan radang gusi.\nTeks 2: Konsumsi vitamin C yang berlebihan tanpa asupan air yang cukup dapat membebani kerja ginjal.\n\nSintesis (paduan) yang paling tepat dari kedua teks tersebut adalah...",
    "jawabanBenar": "Vitamin C menyembuhkan radang, tapi butuh air.",
    "pengecoh": [
      "Vitamin C dosis tinggi merusak ginjal tanpa air.",
      "Sariawan hanya sembuh dengan vitamin C dan air.",
      "Konsumsi vitamin C berlebihan dilarang karena ginjal."
    ],
    "difficulty": "HARD",
    "explanation": "Sintesis menggabungkan esensi Teks 1 (manfaat vitamin C) dan Teks 2 (risiko pada ginjal dan syarat pencegahannya) tanpa melebih-lebihkan fakta.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-016",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Penyuntingan",
    "pertanyaan": "(1) Bunga melati memiliki aroma yang khas. (2) Warna putihnya melambangkan kesucian. (3) Bunga bangkai merupakan bunga terbesar di dunia. (4) Bunga melati sering digunakan dalam upacara adat.\n\nKalimat sumbang (tidak padu) pada paragraf tersebut ditunjukkan oleh nomor...",
    "jawabanBenar": "(3)",
    "pengecoh": [
      "(1)",
      "(2)",
      "(4)"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Paragraf tersebut membahas ciri dan kegunaan bunga melati. Kalimat (3) tiba-tiba membahas bunga bangkai sehingga tidak nyambung dengan kalimat lainnya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-017",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks Narasi",
    "pertanyaan": "Walau tubuhnya kecil, Kancil tak pernah ragu melangkah masuk ke hutan yang gelap. Ia yakin kecerdasannya mampu mengalahkan hewan-hewan buas yang mencoba memangsanya.\nWatak tokoh Kancil berdasarkan kutipan tersebut adalah...",
    "jawabanBenar": "Pemberani dan percaya diri",
    "pengecoh": [
      "Sombong dan angkuh",
      "Licik dan penipu",
      "Penakut dan ragu-ragu"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kutipan menyebutkan Kancil 'tak pernah ragu' (pemberani) dan 'yakin kecerdasannya mampu mengalahkan' (percaya diri).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-018",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks Narasi",
    "pertanyaan": "Matahari mulai condong ke barat. Suara jangkrik bersahutan dari sela-sela ilalang. Petani itu menghapus keringat di dahinya sebelum melangkah pulang menyusuri pematang.\n\nLatar waktu dan tempat pada kutipan cerita tersebut adalah...",
    "jawabanBenar": "Sore hari, di sawah",
    "pengecoh": [
      "Pagi hari, di desa",
      "Siang hari, di ladang",
      "Malam hari, di hutan"
    ],
    "difficulty": "EASY",
    "explanation": "'Matahari condong ke barat' menunjukkan waktu sore. 'Pematang' dan keberadaan petani erat kaitannya dengan latar tempat sawah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-019",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kata Hubung (Konjungsi)",
    "pertanyaan": "Gempa bumi terjadi [...] lempeng tektonik bumi mengalami pergeseran secara tiba-tiba.\n\nKonjungsi yang tepat untuk melengkapi kalimat tersebut adalah...",
    "jawabanBenar": "karena",
    "pengecoh": [
      "tetapi",
      "kemudian",
      "sehingga"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kalimat tersebut menunjukkan hubungan sebab-akibat. Anak kalimat menjelaskan alasan/sebab terjadinya gempa, sehingga konjungsi yang tepat adalah 'karena'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-020",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Sinonim",
    "pertanyaan": "Pemerintah sedang menggalakkan program **reboisasi** di lahan-lahan yang gundul akibat penebangan liar.\n\nSinonim dari kata yang dicetak tebal adalah...",
    "jawabanBenar": "penghijauan kembali",
    "pengecoh": [
      "pembukaan lahan",
      "pemupukan tanah",
      "pembalakan liar"
    ],
    "difficulty": "EASY",
    "explanation": "Reboisasi bersinonim dengan penanaman kembali hutan yang telah ditebang atau gundul (penghijauan kembali).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-021",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Teks Laporan Hasil Observasi",
    "pertanyaan": "Pernyataan berikut ini yang merupakan ciri khas dari teks laporan hasil observasi adalah...",
    "jawabanBenar": "Objektif dan ditulis berdasarkan fakta pengamatan langsung.",
    "pengecoh": [
      "Banyak mengandung opini pribadi penulis.",
      "Ditulis menggunakan gaya bahasa kiasan dan imajinatif.",
      "Berisi alur cerita fiktif dan tokoh buatan."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Teks laporan hasil observasi (LHO) berfungsi menyajikan informasi yang objektif, faktual, dan hasil dari pengamatan nyata.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-022",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Menyimpulkan Sebab-Akibat",
    "pertanyaan": "Tingkat polusi udara di kota X mencapai angka berbahaya. Pemerintah menerapkan kebijakan uji emisi ketat dan mendorong penggunaan transportasi umum. Namun, karena armada bus sangat sedikit dan tidak nyaman, warga tetap menggunakan kendaraan pribadi.\n\nBerdasarkan teks, mengapa kebijakan pemerintah untuk menekan polusi sulit berhasil?",
    "jawabanBenar": "Fasilitas transportasi umum belum memadai menarik minat.",
    "pengecoh": [
      "Warga tidak peduli polusi udara di kotanya.",
      "Kebijakan uji emisi yang diterapkan terlalu ketat.",
      "Pemerintah tidak memberikan sosialisasi kepada masyarakat."
    ],
    "difficulty": "HARD",
    "explanation": "Jawaban disimpulkan dari kalimat 'karena armada bus sangat sedikit dan tidak nyaman, warga tetap menggunakan kendaraan pribadi'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-023",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kata Baku",
    "pertanyaan": "Di antara deretan kata berikut, manakah kelompok kata yang seluruhnya baku?",
    "jawabanBenar": "Apotek, nasihat, kualitas",
    "pengecoh": [
      "Apotik, nasehat, kwalitas",
      "Apotek, nasehat, kualitas",
      "Apotik, nasihat, kwalitas"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kata baku menurut KBBI adalah apotek (bukan apotik), nasihat (bukan nasehat), dan kualitas (bukan kwalitas).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-024",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Kalimat Imperatif",
    "pertanyaan": "Kalimat yang menggunakan verba (kata kerja) imperatif dalam teks prosedur adalah...",
    "jawabanBenar": "Panaskan wajan di atas kompor api sedang!",
    "pengecoh": [
      "Minyak goreng akan mendidih dalam tiga menit.",
      "Bumbu-bumbu yang dibutuhkan mudah ditemukan di pasar.",
      "Bawang putih memiliki aroma yang sangat tajam."
    ],
    "difficulty": "EASY",
    "explanation": "Kalimat imperatif adalah kalimat perintah. Kata 'Panaskan' merupakan verba imperatif yang memberi instruksi langsung.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-025",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Menyusun Paragraf",
    "pertanyaan": "(1) Akhirnya, mereka berhasil menemukan mata air yang dicari. (2) Perjalanan menembus hutan rimba itu sangat melelahkan. (3) Mereka berangkat sejak fajar menyingsing. (4) Namun, semangat pantang menyerah mengalahkan lelah mereka.\n\nSusunan kalimat yang tepat agar menjadi paragraf yang padu adalah...",
    "jawabanBenar": "3 - 2 - 4 - 1",
    "pengecoh": [
      "2 - 3 - 1 - 4",
      "3 - 1 - 2 - 4",
      "2 - 4 - 3 - 1"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Susunan yang runut bermula dari waktu keberangkatan (3), kondisi perjalanan (2), sikap terhadap lelah (4), dan hasil akhir (1).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-026",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Gagasan Pendukung",
    "pertanyaan": "Ide pokok: Membaca buku fiksi memberikan banyak manfaat bagi perkembangan otak anak.\n\nBerikut ini yang **tidak** sesuai menjadi gagasan pendukung untuk ide pokok di atas adalah...",
    "jawabanBenar": "Buku referensi pelajaran membosankan bagi siswa.",
    "pengecoh": [
      "Membaca fiksi dapat meningkatkan empati anak.",
      "Imajinasi anak akan terstimulasi oleh cerita fiksi.",
      "Kosakata baru mudah diserap melalui narasi fiksi."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Gagasan pendukung harus selaras menjelaskan manfaat fiksi. Membahas buku pelajaran yang membosankan melenceng dari topik manfaat membaca fiksi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-027",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Membandingkan Teks",
    "pertanyaan": "Teks 1: Tanah longsor kembali melanda kawasan pegunungan akibat curah hujan tinggi semalaman. Akses jalan terputus total.\nTeks 2: Curah hujan yang tinggi akhir-akhir ini tidak hanya menyebabkan banjir di hilir, tetapi juga memicu pergerakan tanah di dataran tinggi.\n\nPersamaan isi kedua teks tersebut adalah...",
    "jawabanBenar": "Membahas dampak curah hujan tinggi terhadap longsor.",
    "pengecoh": [
      "Membahas terputusnya akses jalan raya utama.",
      "Membahas kerugian material akibat bencana longsor.",
      "Membahas banjir yang melanda daerah hilir sungai."
    ],
    "difficulty": "HARD",
    "explanation": "Teks 1 spesifik longsor, Teks 2 menyebutkan banjir dan pergerakan tanah (longsor). Keduanya sama-sama membahas curah hujan tinggi yang berdampak pada tanah longsor.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-028",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Struktur Teks",
    "pertanyaan": "Struktur pada teks berita yang berisi pokok informasi paling penting (5W+1H) ditempatkan pada bagian awal yang disebut...",
    "jawabanBenar": "Kepala berita (Lead)",
    "pengecoh": [
      "Tubuh berita (Body)",
      "Ekor berita (Tail)",
      "Latar belakang"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Dalam piramida terbalik teks berita, kepala berita (lead) berada di paragraf pertama dan memuat intisari peristiwa (5W+1H).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-029",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Pesan Moral",
    "pertanyaan": "Dalam cerita, seekor bangau tua menipu ikan-ikan dengan mengatakan kolam akan mengering agar ia bisa memakan mereka. Pada akhirnya, bangau itu mati dicekik oleh kepiting yang menyadari kebohongannya.\n\nPesan moral yang dapat dipetik dari fabel tersebut adalah...",
    "jawabanBenar": "Kelicikan dan kebohongan membawa malapetaka bagi pelakunya.",
    "pengecoh": [
      "Kita harus selalu membantu teman yang kesulitan.",
      "Jangan mudah percaya pada kepiting yang kuat.",
      "Menyimpan makanan untuk hari esok sangat penting."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kematian bangau merupakan akibat langsung dari penipuan dan kebohongannya. Ini mengajarkan bahwa sifat buruk akan menghukum pelakunya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-BIND-030",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Indonesia",
    "topik": "Unsur Puisi",
    "pertanyaan": "Perhatikan larik puisi berikut:\n'Mentari pagi tersenyum menyapa bumi'\n\nMajas yang digunakan pada larik puisi tersebut adalah...",
    "jawabanBenar": "Personifikasi",
    "pengecoh": [
      "Hiperbola",
      "Metafora",
      "Simile"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Personifikasi adalah majas yang melekatkan sifat/perilaku manusia (tersenyum menyapa) pada benda mati/alam (mentari pagi).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-001",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sel",
    "pertanyaan": "Organel sel yang berfungsi sebagai tempat berlangsungnya respirasi selular untuk menghasilkan energi adalah...",
    "jawabanBenar": "Mitokondria",
    "pengecoh": [
      "Nukleus",
      "Kloroplas",
      "Ribosom"
    ],
    "difficulty": "EASY",
    "explanation": "Mitokondria sering disebut sebagai 'pabrik energi' sel karena berfungsi menghasilkan energi (ATP) melalui proses respirasi selular.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-002",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sel",
    "pertanyaan": "Perbedaan utama antara sel hewan dan sel tumbuhan adalah...",
    "jawabanBenar": "Sel tumbuhan memiliki dinding sel dan kloroplas.",
    "pengecoh": [
      "Sel hewan memiliki vakuola besar, tumbuhan tidak.",
      "Sel tumbuhan tidak memiliki membran sel.",
      "Sel tumbuhan tidak memiliki inti sel."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sel tumbuhan dilindungi oleh dinding sel yang kaku dan memiliki kloroplas untuk fotosintesis, organel-organel ini tidak ditemukan pada sel hewan biasa.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-003",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Organisasi Kehidupan",
    "pertanyaan": "Urutan tingkat organisasi kehidupan dari yang paling sederhana hingga yang paling kompleks adalah...",
    "jawabanBenar": "Sel->Jaringan->Organ->Sistem Organ->Organisme",
    "pengecoh": [
      "Sel->Organ->Jaringan->Sistem Organ->Organisme",
      "Jaringan->Sel->Organ->Sistem Organ->Organisme",
      "Organisme->Sistem Organ->Organ->Jaringan->Sel"
    ],
    "difficulty": "EASY",
    "explanation": "Tingkatan organisasi kehidupan diawali dari unit terkecil (sel), kumpulan sel membentuk jaringan, kumpulan jaringan membentuk organ, kumpulan organ membentuk sistem organ, dan akhirnya menjadi organisme.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-004",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sistem Organ Manusia",
    "pertanyaan": "Fungsi utama asam klorida (HCl) di dalam lambung adalah...",
    "jawabanBenar": "Membunuh kuman pada makanan dan mengaktifkan pepsinogen",
    "pengecoh": [
      "Mengubah amilum menjadi zat gula",
      "Menyerap sari-sari makanan ke dalam darah",
      "Mengemulsikan lemak agar mudah dicerna"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Asam lambung (HCl) berfungsi menciptakan lingkungan asam yang mematikan bakteri patogen dan mengaktifkan enzim pepsinogen menjadi pepsin untuk mencerna protein.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-005",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sistem Organ Manusia",
    "pertanyaan": "Proses pertukaran gas oksigen dan karbon dioksida di dalam paru-paru terjadi pada bagian...",
    "jawabanBenar": "Alveolus",
    "pengecoh": [
      "Bronkus",
      "Trakea",
      "Bronkiolus"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Alveolus adalah kantung udara kecil di paru-paru tempat terjadinya difusi (pertukaran) oksigen ke dalam darah dan karbon dioksida keluar dari darah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-006",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Sistem Organ Manusia",
    "pertanyaan": "Manakah urutan aliran darah pada sistem peredaran darah besar yang paling tepat?",
    "jawabanBenar": "Bilik kiri->Aorta->Seluruh tubuh->Vena Cava->Serambi kanan",
    "pengecoh": [
      "Bilik kanan->Arteri pulmonalis->Paru-paru->Vena pulmonalis->Serambi kiri",
      "Serambi kiri->Bilik kiri->Aorta->Paru-paru->Serambi kanan",
      "Bilik kiri->Vena Cava->Seluruh tubuh->Aorta->Serambi kanan"
    ],
    "difficulty": "HARD",
    "explanation": "Peredaran darah besar (sistemik) memompa darah kaya oksigen dari bilik kiri jantung melalui aorta ke seluruh tubuh, lalu kembali membawa karbon dioksida melalui vena cava ke serambi kanan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-007",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Zat dan Perubahannya",
    "pertanyaan": "Sifat benda gas yang membedakannya dengan benda padat dan cair adalah...",
    "jawabanBenar": "Bentuk dan volumenya selalu berubah mengikuti wadahnya",
    "pengecoh": [
      "Volumenya tetap tetapi bentuknya selalu berubah",
      "Bentuk dan volumenya selalu tetap",
      "Bentuknya tetap tetapi volumenya bisa diubah"
    ],
    "difficulty": "EASY",
    "explanation": "Partikel zat gas sangat renggang dan bebas bergerak sehingga gas selalu mengisi seluruh ruang (volume berubah) dan mengikuti bentuk wadahnya (bentuk berubah).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-008",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Zat dan Perubahannya",
    "pertanyaan": "Kapur barus (kamper) yang dibiarkan di dalam lemari pakaian lama-kelamaan akan mengecil dan habis. Proses perubahan wujud yang terjadi adalah...",
    "jawabanBenar": "Menyublim",
    "pengecoh": [
      "Mencair",
      "Menguap",
      "Mengkristal"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Menyublim adalah peristiwa perubahan wujud dari zat padat (kapur barus) menjadi gas tanpa melalui fase cair terlebih dahulu.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-009",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Materi dan Sifatnya",
    "pertanyaan": "Suatu benda akan mengapung jika dimasukkan ke dalam air apabila...",
    "jawabanBenar": "Massa jenis benda lebih kecil dari air",
    "pengecoh": [
      "Massa jenis benda lebih besar dari air",
      "Massa benda lebih besar dari massa air",
      "Volume benda lebih besar dari volume air"
    ],
    "difficulty": "EASY",
    "explanation": "Hukum Archimedes menyatakan benda akan mengapung jika massa jenisnya lebih kecil daripada massa jenis fluida di sekitarnya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-010",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Suhu dan Kalor",
    "pertanyaan": "Suhu suatu ruangan diukur dengan termometer Celcius menunjukkan skala 40°C. Jika diukur dengan termometer Reamur, suhu tersebut adalah...",
    "jawabanBenar": "32°R",
    "pengecoh": [
      "30°R",
      "45°R",
      "50°R"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Perbandingan Celcius : Reamur adalah 5 : 4. Maka suhunya dalam Reamur = (4/5) x 40°C = 32°R.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-011",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Suhu dan Kalor",
    "pertanyaan": "Sebanyak 200 gram air bersuhu 20°C dicampur dengan 100 gram air bersuhu 80°C. Jika kalor jenis air diabaikan dalam perbandingan karena zatnya sama, suhu campuran (keseimbangan termal) yang terjadi adalah...",
    "jawabanBenar": "40°C",
    "pengecoh": [
      "50°C",
      "60°C",
      "45°C"
    ],
    "difficulty": "HARD",
    "explanation": "Asas Black: Q_lepas = Q_terima. m1 x c x (T_akhir - T1) = m2 x c x (T2 - T_akhir). 200 x (T - 20) = 100 x (80 - T). Dibagi 100: 2(T - 20) = 80 - T. 2T - 40 = 80 - T. 3T = 120, T = 40°C.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-012",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Gerak dan Gaya",
    "pertanyaan": "Sebuah buah kelapa jatuh bebas dari pohonnya ke tanah. Jenis gerak yang dialami buah kelapa tersebut adalah...",
    "jawabanBenar": "Gerak lurus berubah beraturan (GLBB) dipercepat",
    "pengecoh": [
      "Gerak lurus beraturan (GLB)",
      "Gerak lurus berubah beraturan (GLBB) diperlambat",
      "Gerak melingkar beraturan"
    ],
    "difficulty": "EASY",
    "explanation": "Benda yang jatuh bebas mengalami percepatan akibat gravitasi bumi, sehingga kecepatannya terus bertambah (GLBB dipercepat).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-013",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Gerak dan Gaya",
    "pertanyaan": "Sebuah balok bermassa 5 kg didorong dengan gaya mendatar sebesar 20 Newton di atas lantai licin (tanpa gesekan). Percepatan balok tersebut adalah...",
    "jawabanBenar": "4 m/s²",
    "pengecoh": [
      "15 m/s²",
      "25 m/s²",
      "100 m/s²"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sesuai Hukum II Newton, a = F/m. Maka a = 20 N / 5 kg = 4 m/s².",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-014",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Energi",
    "pertanyaan": "Sebuah benda bermassa 2 kg berada pada ketinggian 5 meter dari permukaan tanah. Jika percepatan gravitasi bumi 10 m/s², besar energi potensial gravitasi benda tersebut adalah...",
    "jawabanBenar": "100 Joule",
    "pengecoh": [
      "50 Joule",
      "20 Joule",
      "250 Joule"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Energi Potensial (Ep) = m x g x h. Ep = 2 kg x 10 m/s² x 5 m = 100 Joule.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-015",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Energi",
    "pertanyaan": "Budi mendorong meja dengan gaya 50 Newton sehingga meja berpindah sejauh 4 meter searah gaya dorongnya. Usaha yang dilakukan Budi adalah...",
    "jawabanBenar": "200 Joule",
    "pengecoh": [
      "12,5 Joule",
      "54 Joule",
      "46 Joule"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Usaha (W) = Gaya (F) x Perpindahan (s). W = 50 N x 4 m = 200 Joule.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-016",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tekanan",
    "pertanyaan": "Sebuah pisau yang tajam lebih mudah digunakan untuk memotong daging daripada pisau tumpul karena...",
    "jawabanBenar": "Luas penampang kecil menghasilkan tekanan yang besar",
    "pengecoh": [
      "Luas penampang besar menghasilkan gaya yang besar",
      "Massa pisau tajam lebih ringan, mudah diayunkan",
      "Gaya gesek pisau tajam lebih besar"
    ],
    "difficulty": "EASY",
    "explanation": "Tekanan (P) berbanding terbalik dengan luas permukaan (A). Semakin kecil luas permukaan mata pisau, semakin besar tekanan yang dihasilkan (P = F/A).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-017",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Tekanan",
    "pertanyaan": "Seekor ikan berenang pada kedalaman 2 meter di bawah permukaan air. Jika massa jenis air 1000 kg/m³ dan gravitasi bumi 10 m/s², tekanan hidrostatis yang dialami ikan tersebut adalah...",
    "jawabanBenar": "20.000 Pascal",
    "pengecoh": [
      "2.000 Pascal",
      "500 Pascal",
      "10.000 Pascal"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Tekanan Hidrostatis (Ph) = rho x g x h. Ph = 1000 kg/m³ x 10 m/s² x 2 m = 20.000 Pascal (Pa).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-018",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Pesawat Sederhana",
    "pertanyaan": "Sebuah tuas memiliki lengan beban 20 cm. Jika berat beban yang diangkat adalah 600 Newton dan gaya kuasa yang diberikan sebesar 200 Newton, maka panjang lengan kuasa yang dibutuhkan adalah...",
    "jawabanBenar": "60 cm",
    "pengecoh": [
      "120 cm",
      "40 cm",
      "30 cm"
    ],
    "difficulty": "HARD",
    "explanation": "Prinsip tuas: W x Lb = F x Lk. 600 N x 20 cm = 200 N x Lk. 12000 = 200 x Lk. Lk = 12000 / 200 = 60 cm.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-019",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Getaran dan Gelombang",
    "pertanyaan": "Banyaknya getaran yang terjadi dalam waktu satu sekon disebut...",
    "jawabanBenar": "Frekuensi",
    "pengecoh": [
      "Periode",
      "Amplitudo",
      "Panjang gelombang"
    ],
    "difficulty": "EASY",
    "explanation": "Frekuensi adalah jumlah getaran atau gelombang yang terjadi dalam satu satuan waktu (detik), dengan satuan Hertz (Hz).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-020",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Getaran dan Gelombang",
    "pertanyaan": "Sebuah kapal memancarkan bunyi sonar ke dasar laut. Bunyi pantul diterima kembali oleh kapal setelah 2 detik. Jika cepat rambat bunyi di air laut 1400 m/s, kedalaman laut tersebut adalah...",
    "jawabanBenar": "1400 meter",
    "pengecoh": [
      "2800 meter",
      "700 meter",
      "5600 meter"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kedalaman (s) = (v x t) / 2. s = (1400 m/s x 2 s) / 2 = 2800 / 2 = 1400 meter. Dibagi 2 karena gelombang menempuh perjalanan bolak-balik.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-021",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Cahaya dan Alat Optik",
    "pertanyaan": "Sebuah sedotan yang dimasukkan sebagian ke dalam gelas berisi air akan tampak patah. Peristiwa ini merupakan bukti dari sifat cahaya yaitu...",
    "jawabanBenar": "Dapat dibiaskan (Refraksi)",
    "pengecoh": [
      "Dapat dipantulkan (Refleksi)",
      "Dapat diuraikan (Dispersi)",
      "Merambat lurus"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Pembelokan cahaya terjadi karena cahaya melewati dua medium dengan kerapatan berbeda (udara ke air), sifat ini disebut pembiasan (refraksi).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-022",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Cahaya dan Alat Optik",
    "pertanyaan": "Bagian mata yang berfungsi menangkap bayangan benda dan memiliki sel reseptor cahaya adalah...",
    "jawabanBenar": "Retina",
    "pengecoh": [
      "Kornea",
      "Pupil",
      "Lensa"
    ],
    "difficulty": "EASY",
    "explanation": "Retina adalah selaput jala di bagian belakang mata yang sangat peka terhadap cahaya dan berfungsi menangkap bayangan dari lensa.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-023",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Listrik dan Kemagnetan",
    "pertanyaan": "Kaca yang digosok dengan kain sutra akan bermuatan listrik positif. Hal ini terjadi karena...",
    "jawabanBenar": "Elektron dari kaca berpindah ke kain sutra",
    "pengecoh": [
      "Elektron dari kain sutra berpindah ke kaca",
      "Proton dari kaca berpindah ke kain sutra",
      "Proton dari kain sutra berpindah ke kaca"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Muatan positif terjadi bila sebuah benda kekurangan elektron. Kaca kehilangan elektron karena elektronnya berpindah ke sutra saat digosok, sedangkan proton tidak berpindah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-024",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Listrik dan Kemagnetan",
    "pertanyaan": "Dua buah hambatan masing-masing bernilai 2 ohm dan 4 ohm dirangkai secara seri dan dihubungkan pada baterai bertegangan 12 Volt. Kuat arus yang mengalir pada rangkaian tersebut adalah...",
    "jawabanBenar": "2 Ampere",
    "pengecoh": [
      "6 Ampere",
      "18 Ampere",
      "3 Ampere"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Hambatan total seri (R) = 2 + 4 = 6 ohm. Berdasarkan Hukum Ohm, I = V / R = 12 V / 6 ohm = 2 Ampere.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-025",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Listrik dan Kemagnetan",
    "pertanyaan": "Sebuah trafo step-down (penurun tegangan) dihubungkan dengan tegangan primer 220 Volt. Jika jumlah lilitan primernya 1000 lilitan dan lilitan sekundernya 200 lilitan, tegangan sekunder yang dihasilkan adalah...",
    "jawabanBenar": "44 Volt",
    "pengecoh": [
      "1100 Volt",
      "110 Volt",
      "440 Volt"
    ],
    "difficulty": "HARD",
    "explanation": "Persamaan trafo ideal: Vp / Vs = Np / Ns. 220 / Vs = 1000 / 200. 220 / Vs = 5. Vs = 220 / 5 = 44 Volt.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-026",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Ekosistem",
    "pertanyaan": "Dalam suatu ekosistem padang rumput, rumput bertindak sebagai organisme fotosintetik. Peran rumput dalam rantai makanan tersebut adalah sebagai...",
    "jawabanBenar": "Produsen",
    "pengecoh": [
      "Konsumen tingkat I",
      "Dekomposer",
      "Konsumen puncak"
    ],
    "difficulty": "EASY",
    "explanation": "Organisme yang mampu menghasilkan makanannya sendiri melalui fotosintesis disebut produsen (autotrof).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-027",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Ekosistem",
    "pertanyaan": "Perhatikan rantai makanan berikut: Padi -> Belalang -> Katak -> Ular -> Elang. Jika populasi katak banyak diburu oleh manusia, dampak langsung yang akan terjadi pada ekosistem tersebut adalah...",
    "jawabanBenar": "Populasi belalang meningkat, populasi ular menurun",
    "pengecoh": [
      "Populasi padi akan meningkat tajam",
      "Populasi elang akan meningkat",
      "Populasi belalang akan menurun dan ular meningkat"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Jika katak menurun, predator belalang berkurang sehingga belalang meningkat. Di sisi lain, ular kehilangan sumber makanannya sehingga populasinya menurun.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-028",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Lingkungan",
    "pertanyaan": "Pembuangan limbah deterjen dan pupuk pertanian ke aliran sungai secara berlebihan dapat menyebabkan ledakan populasi ganggang (alga) di permukaan sungai. Fenomena pencemaran air ini disebut...",
    "jawabanBenar": "Eutrofikasi",
    "pengecoh": [
      "Efek rumah kaca",
      "Bioremediasi",
      "Biomagnifikasi"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Eutrofikasi adalah pengayaan nutrien di lingkungan perairan (seperti fosfat dari pupuk/deterjen) yang memicu pertumbuhan tak terkendali alga/tumbuhan air.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-029",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Lingkungan",
    "pertanyaan": "Mekanisme terjadinya efek rumah kaca yang memicu pemanasan global secara alami berawal dari radiasi matahari. Faktor utama yang menyebabkan suhu bumi semakin panas akibat efek ini adalah...",
    "jawabanBenar": "Gas rumah kaca memerangkap radiasi panas bumi",
    "pengecoh": [
      "Lapisan ozon berlubang, sinar ultraviolet banyak masuk",
      "Atmosfer memfokuskan panas matahari seperti lensa cembung",
      "Aktivitas inti bumi merambat ke kerak bumi"
    ],
    "difficulty": "HARD",
    "explanation": "Efek rumah kaca disebabkan oleh gas-gas (CO2, metana) yang menyerap dan memantulkan kembali radiasi inframerah (panas) dari permukaan bumi, memerangkapnya di dalam atmosfer. Ini berbeda dari masalah lubang ozon (UV).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPA-030",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPA",
    "topik": "Bumi dan Fenomena Alam",
    "pertanyaan": "Peristiwa alam berikut ini yang merupakan akibat dari revolusi bumi (bumi mengelilingi matahari) adalah...",
    "jawabanBenar": "Perbedaan musim di bumi utara dan selatan",
    "pengecoh": [
      "Terjadinya siang dan malam",
      "Gerak semu harian dari timur ke barat",
      "Perbedaan waktu di berbagai wilayah bumi"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Revolusi bumi dikombinasikan dengan kemiringan sumbu bumi menyebabkan pergantian musim, perbedaan lama siang dan malam, serta gerak semu tahunan matahari. Siang malam dan gerak harian adalah akibat rotasi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-001",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Letak Geografis",
    "pertanyaan": "Secara geografis, Indonesia terletak di antara dua benua dan dua samudra. Dampak positif dari letak geografis ini bagi perekonomian Indonesia adalah...",
    "jawabanBenar": "Menjadi jalur pelayaran dan perdagangan internasional",
    "pengecoh": [
      "Memiliki banyak gunung berapi yang menyuburkan tanah",
      "Mengalami pergantian dua musim yaitu kemarau dan penghujan",
      "Memiliki keanekaragaman flora dan fauna yang sangat tinggi"
    ],
    "difficulty": "EASY",
    "explanation": "Letak geografis (posisi terhadap wilayah lain) di posisi silang menjadikan Indonesia sangat strategis sebagai jalur transit perdagangan dunia.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-002",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Peta dan Ruang",
    "pertanyaan": "Skala pada peta adalah 1 : 500.000. Jika jarak dua kota di peta adalah 4 cm, maka jarak sebenarnya di permukaan bumi adalah...",
    "jawabanBenar": "20 km",
    "pengecoh": [
      "2 km",
      "200 km",
      "50 km"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Jarak sebenarnya = Jarak peta x Skala = 4 cm x 500.000 = 2.000.000 cm = 20 km.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-003",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Interaksi Antarruang",
    "pertanyaan": "Penduduk daerah pegunungan menghasilkan sayuran, sedangkan penduduk pesisir pantai menghasilkan ikan. Keduanya saling berinteraksi melalui perdagangan karena perbedaan sumber daya alam. Kondisi yang mendorong interaksi tersebut disebut...",
    "jawabanBenar": "Saling melengkapi (Complementarity)",
    "pengecoh": [
      "Kesempatan antara (Intervening opportunity)",
      "Kemudahan transfer (Transferability)",
      "Ketergantungan ekonomi (Economic dependency)"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Regional Complementarity atau saling melengkapi terjadi saat dua wilayah memiliki komoditas yang berbeda dan saling membutuhkan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-004",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Iklim dan Cuaca",
    "pertanyaan": "Indonesia memiliki iklim tropis karena dilalui oleh garis khatulistiwa. Salah satu ciri iklim tropis di Indonesia adalah...",
    "jawabanBenar": "Suhu udara cenderung tinggi sepanjang tahun",
    "pengecoh": [
      "Memiliki empat musim yang berganti setiap tiga bulan",
      "Curah hujan sangat rendah sehingga banyak wilayah gurun",
      "Mengalami siang yang sangat panjang pada bulan Desember"
    ],
    "difficulty": "EASY",
    "explanation": "Iklim tropis ditandai dengan paparan sinar matahari sepanjang tahun sehingga suhu udara cenderung tinggi (hangat/panas) rata-rata di atas 18 derajat celcius.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-005",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sumber Daya Alam",
    "pertanyaan": "Hutan hujan tropis di Indonesia memiliki peran penting sebagai 'paru-paru dunia'. Upaya pemanfaatan hutan yang sesuai dengan prinsip pembangunan berkelanjutan adalah...",
    "jawabanBenar": "Melakukan tebang pilih dan reboisasi secara rutin",
    "pengecoh": [
      "Mengubah seluruh kawasan hutan menjadi lahan pertanian",
      "Mengekspor kayu gelondongan sebanyak-banyaknya untuk devisa",
      "Melarang sama sekali penduduk masuk ke hutan"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Pembangunan berkelanjutan memanfaatkan SDA namun tetap menjaga kelestariannya. Tebang pilih dan reboisasi memastikan ketersediaan kayu masa depan tanpa merusak ekosistem.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-006",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Kependudukan",
    "pertanyaan": "Perpindahan penduduk dari desa ke kota dengan tujuan menetap disebut...",
    "jawabanBenar": "Urbanisasi",
    "pengecoh": [
      "Transmigrasi",
      "Imigrasi",
      "Sirkulasi"
    ],
    "difficulty": "EASY",
    "explanation": "Urbanisasi adalah proses perpindahan penduduk dari daerah pedesaan ke perkotaan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-007",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Kependudukan",
    "pertanyaan": "Piramida penduduk Indonesia sebagian besar berbentuk limas (ekspansif), di mana bagian bawahnya melebar. Kesimpulan yang tepat mengenai kondisi demografi tersebut adalah...",
    "jawabanBenar": "Angka kelahiran tinggi didominasi penduduk usia muda",
    "pengecoh": [
      "Angka harapan hidup tinggi, didominasi oleh lansia",
      "Angka kematian bayi sangat rendah dan kelahiran lambat",
      "Tingkat migrasi penduduk dari luar negeri sangat besar"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Piramida ekspansif (melebar di bawah) menunjukkan struktur penduduk muda yang besar karena tingkat kelahiran (fertilitas) yang tinggi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-008",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Mobilitas Sosial",
    "pertanyaan": "Seorang guru biasa di sebuah desa kemudian dipromosikan menjadi kepala sekolah berprestasi di tingkat provinsi. Perubahan status yang dialami orang tersebut merupakan contoh dari...",
    "jawabanBenar": "Mobilitas sosial vertikal naik",
    "pengecoh": [
      "Mobilitas sosial horizontal",
      "Mobilitas sosial antargenerasi",
      "Mobilitas sosial vertikal turun"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Perpindahan dari posisi guru ke posisi kepala sekolah menunjukkan peningkatan derajat atau status sosial ke tingkat yang lebih tinggi (vertikal naik).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-009",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Interaksi Sosial",
    "pertanyaan": "Proses pencampuran dua kebudayaan atau lebih yang saling bertemu dan berlangsung dalam waktu lama, sehingga menghasilkan kebudayaan baru namun tidak menghilangkan unsur kebudayaan aslinya disebut...",
    "jawabanBenar": "Akulturasi",
    "pengecoh": [
      "Asimilasi",
      "Akomodasi",
      "Difusi"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Akulturasi memadukan kebudayaan tanpa menghilangkan identitas asli. Asimilasi menghilangkan budaya asli dan membentuk budaya yang sama sekali baru.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-010",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Interaksi Sosial",
    "pertanyaan": "Konflik sosial di masyarakat sering kali dipicu oleh adanya prasangka dan diskriminasi. Upaya yang paling tepat untuk mencegah konflik bernuansa suku, agama, ras, dan antargolongan (SARA) adalah...",
    "jawabanBenar": "Mengembangkan sikap toleransi dan empati antarwarga masyarakat",
    "pengecoh": [
      "Membatasi komunikasi dengan kelompok yang berbeda budaya",
      "Memaksakan satu kebudayaan agar semua warga menjadi seragam",
      "Memisahkan permukiman penduduk berdasarkan suku bangsanya"
    ],
    "difficulty": "EASY",
    "explanation": "Toleransi (saling menghargai) dan empati adalah pilar utama masyarakat multikultural untuk hidup berdampingan secara damai tanpa konflik.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-011",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Aktivitas Ekonomi",
    "pertanyaan": "Kegiatan ekonomi yang bertujuan untuk menyalurkan barang atau jasa dari produsen kepada konsumen disebut...",
    "jawabanBenar": "Distribusi",
    "pengecoh": [
      "Produksi",
      "Konsumsi",
      "Investasi"
    ],
    "difficulty": "EASY",
    "explanation": "Distribusi adalah mata rantai penghubung dalam kegiatan ekonomi. Produksi menghasilkan, distribusi menyalurkan, dan konsumsi menggunakan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-012",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Aktivitas Ekonomi",
    "pertanyaan": "Pada saat harga daging ayam melonjak tinggi, masyarakat beralih membeli tempe dan tahu sebagai sumber protein. Dalam ilmu ekonomi, hubungan antara daging ayam dengan tempe dan tahu merupakan contoh barang...",
    "jawabanBenar": "Substitusi",
    "pengecoh": [
      "Komplementer",
      "Bebas",
      "Illith"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Barang substitusi adalah barang pengganti. Ketika harga satu barang naik, permintaan barang penggantinya akan meningkat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-013",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Hukum Ekonomi",
    "pertanyaan": "Berdasarkan hukum permintaan, jika harga sebuah barang mengalami penurunan (ceteris paribus), maka...",
    "jawabanBenar": "Jumlah barang yang diminta oleh konsumen akan meningkat",
    "pengecoh": [
      "Jumlah barang yang ditawarkan oleh produsen akan meningkat",
      "Jumlah barang yang diminta oleh konsumen akan menurun",
      "Daya beli masyarakat akan menurun drastis"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Hukum permintaan menyatakan bahwa ada hubungan terbalik antara harga dan kuantitas yang diminta: harga turun -> permintaan naik.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-014",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Perdagangan Internasional",
    "pertanyaan": "Sebuah negara A memiliki iklim tropis dan sangat efisien dalam memproduksi kopi, sementara negara B beriklim subtropis dan unggul dalam memproduksi gandum. Kedua negara memutuskan untuk berdagang kopi dan gandum. Faktor utama pendorong perdagangan internasional ini adalah...",
    "jawabanBenar": "Perbedaan keunggulan komparatif akibat sumber daya alam",
    "pengecoh": [
      "Persamaan selera konsumen di kedua negara",
      "Kebutuhan untuk mencari tenaga kerja murah",
      "Keinginan untuk memonopoli pasar dunia"
    ],
    "difficulty": "HARD",
    "explanation": "Perdagangan antarnegara sering terjadi karena perbedaan iklim dan letak geografis yang menciptakan spesialisasi dan keunggulan komparatif pada produk tertentu.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-015",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Hindu-Buddha",
    "pertanyaan": "Kerajaan Sriwijaya berkembang menjadi salah satu pusat perdagangan dan pembelajaran agama Buddha terbesar di Asia Tenggara pada masa kejayaannya. Faktor geografis yang paling mendukung kemajuan Sriwijaya adalah...",
    "jawabanBenar": "Letaknya strategis di Selat Malaka jalur perdagangan",
    "pengecoh": [
      "Memiliki tanah vulkanik sangat subur untuk pertanian",
      "Dikelilingi oleh benteng pegunungan yang sulit ditembus musuh",
      "Merupakan satu-satunya penghasil rempah-rempah di nusantara"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sriwijaya adalah kerajaan maritim (bukan agraris) yang menguasai Selat Malaka, jalur urat nadi pelayaran India ke Tiongkok.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-016",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Islam",
    "pertanyaan": "Proses masuk dan berkembangnya agama Islam di Indonesia lebih banyak dilakukan secara damai. Salah satu media penyebaran Islam yang menggunakan pendekatan budaya dan kesenian tradisional di pulau Jawa adalah...",
    "jawabanBenar": "Pertunjukan wayang kulit oleh Wali Songo",
    "pengecoh": [
      "Pendirian sekolah-sekolah modern oleh pemerintah kolonial",
      "Peperangan militer untuk menaklukkan kerajaan-kerajaan kecil",
      "Pemaksaan melalui undang-undang kerajaan setempat"
    ],
    "difficulty": "EASY",
    "explanation": "Wali Songo, khususnya Sunan Kalijaga, dikenal mahir menggunakan wayang kulit yang diadaptasi dengan nilai-nilai Islam sebagai media dakwah yang damai.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-017",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Kolonialisme",
    "pertanyaan": "Sistem Tanam Paksa (Cultuurstelsel) yang diterapkan oleh Gubernur Jenderal Johannes van den Bosch sangat menyengsarakan rakyat Indonesia. Tujuan utama Belanda menerapkan kebijakan ini adalah...",
    "jawabanBenar": "Mengisi kas Belanda yang kosong akibat peperangan",
    "pengecoh": [
      "Memperkenalkan jenis tanaman baru kepada petani Indonesia",
      "Meningkatkan kesejahteraan penduduk pribumi Hindia Belanda",
      "Membangun infrastruktur jalan dan rel kereta Jawa"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Belanda nyaris bangkrut akibat Perang Jawa (Perang Diponegoro) dan Perang Belgia. Cultuurstelsel bertujuan memaksimalkan eksploitasi hasil bumi laku ekspor demi memulihkan ekonomi Belanda.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-018",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Pergerakan Nasional",
    "pertanyaan": "Organisasi pergerakan nasional pertama di Indonesia yang bersifat modern dan dipelopori oleh para pelajar STOVIA pada tahun 1908 adalah...",
    "jawabanBenar": "Budi Utomo",
    "pengecoh": [
      "Sarekat Islam",
      "Indische Partij",
      "Perhimpunan Indonesia"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Budi Utomo didirikan pada 20 Mei 1908 oleh Dr. Sutomo dan pelajar STOVIA, yang kini diperingati sebagai Hari Kebangkitan Nasional.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-019",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Pergerakan Nasional",
    "pertanyaan": "Peristiwa Sumpah Pemuda pada tahun 1928 memiliki makna yang sangat penting bagi sejarah pergerakan kemerdekaan Indonesia. Dampak terbesar dari peristiwa tersebut adalah...",
    "jawabanBenar": "Memperkuat persatuan bangsa mengatasi perbedaan kedaerahan",
    "pengecoh": [
      "Membentuk angkatan perang nasional untuk melawan Belanda",
      "Menyusun konstitusi dan dasar negara Indonesia merdeka",
      "Memaksa pemerintah kolonial memberikan kemerdekaan saat itu juga"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sumpah Pemuda (Satu Nusa, Satu Bangsa, Satu Bahasa) berhasil menyatukan berbagai organisasi pemuda kedaerahan menjadi satu kesatuan identitas kebangsaan Indonesia.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-020",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Proklamasi Kemerdekaan",
    "pertanyaan": "Peristiwa Rengasdengklok yang terjadi sebelum Proklamasi Kemerdekaan dilatarbelakangi oleh...",
    "jawabanBenar": "Perbedaan pendapat golongan tua dan muda mengenai proklamasi",
    "pengecoh": [
      "Penculikan Soekarno-Hatta oleh Jepang untuk mencegah proklamasi",
      "Persiapan penyerangan militer oleh sekutu ke kota Jakarta",
      "Penyusunan naskah proklamasi rahasia di luar Jakarta"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Golongan muda menginginkan proklamasi secepatnya tanpa campur tangan PPKI (bentukan Jepang), sedangkan golongan tua (Soekarno-Hatta) ingin melalui rapat PPKI agar tidak memicu bentrok dengan tentara Jepang.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-021",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Manusia dan Lingkungan",
    "pertanyaan": "Pembukaan lahan kelapa sawit secara masif dengan cara pembakaran hutan dapat memicu berbagai masalah lingkungan. Salah satu dampak berskala global yang terjadi akibat aktivitas tersebut adalah...",
    "jawabanBenar": "Peningkatan gas rumah kaca memicu pemanasan global",
    "pengecoh": [
      "Penurunan suhu udara rata-rata di wilayah Asia Tenggara",
      "Meningkatnya kesuburan tanah untuk pertanian palawija",
      "Berkurangnya curah hujan harian di seluruh kepulauan Indonesia"
    ],
    "difficulty": "HARD",
    "explanation": "Pembakaran hutan melepaskan karbon dalam jumlah masif ke atmosfer, yang merupakan penyebab utama efek rumah kaca dan perubahan iklim global.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-022",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Aktivitas Ekonomi",
    "pertanyaan": "Perusahaan rintisan (startup) teknologi yang menciptakan aplikasi pemesanan transportasi online merupakan contoh inovasi di bidang ekonomi. Manfaat utama dari inovasi ini bagi masyarakat umum adalah...",
    "jawabanBenar": "Mempermudah mobilitas masyarakat dan menciptakan lapangan kerja baru",
    "pengecoh": [
      "Mengurangi kemacetan lalu lintas di kota besar",
      "Membuat harga kendaraan pribadi menjadi sangat mahal",
      "Menghilangkan profesi sopir angkutan kota sepenuhnya"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Ojek/taksi online mempertemukan mitra pengemudi dan konsumen secara efisien, yang mempermudah mobilitas sekaligus membuka lapangan pekerjaan sektor informal.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-023",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Kemerdekaan",
    "pertanyaan": "Pada masa awal kemerdekaan, Indonesia menghadapi hiperinflasi karena kekosongan kas negara dan peredaran mata uang Jepang yang tak terkendali. Kebijakan ekonomi penting yang diambil pemerintah Republik Indonesia pada tahun 1946 untuk mengatasi kekacauan moneter tersebut adalah...",
    "jawabanBenar": "Menerbitkan uang republik sendiri (ORI)",
    "pengecoh": [
      "Meminjam uang dalam jumlah besar dari pemerintah Belanda",
      "Menjual perusahaan-perusahaan negara kepada pihak swasta",
      "Melarang sama sekali penggunaan uang tunai di masyarakat"
    ],
    "difficulty": "HARD",
    "explanation": "Pemerintah menerbitkan Oeang Repoeblik Indonesia (ORI) pada Oktober 1946 untuk menyatakan kemandirian ekonomi dan menarik peredaran uang Jepang dan uang NICA.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-024",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Pemberdayaan Masyarakat",
    "pertanyaan": "Koperasi merupakan soko guru perekonomian Indonesia. Prinsip utama koperasi yang membedakannya dengan badan usaha milik swasta (PT) adalah...",
    "jawabanBenar": "Koperasi mengutamakan kesejahteraan anggota berdasarkan asas kekeluargaan",
    "pengecoh": [
      "Koperasi mencari keuntungan sebesar-besarnya bagi pemilik modal",
      "Keputusan tertinggi ditentukan oleh besar saham dimiliki",
      "Koperasi hanya dikelola aparatur negara dan pemda"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Prinsip utama koperasi Indonesia menurut Pasal 33 UUD 1945 didasarkan atas asas kekeluargaan dan musyawarah mufakat (satu anggota satu suara), bukan kapital modal.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-025",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sosial Budaya",
    "pertanyaan": "Masuknya budaya K-Pop dan drama Korea (Hallyu Wave) memberikan pengaruh signifikan bagi remaja Indonesia. Dalam ilmu sosiologi, masuknya pengaruh budaya asing melalui media massa massa tanpa adanya paksaan disebut...",
    "jawabanBenar": "Penetrasi kebudayaan secara damai (Penetration pacifique)",
    "pengecoh": [
      "Penetrasi kebudayaan dengan kekerasan (Penetration violante)",
      "Kolonialisme budaya tradisional",
      "Etnosentrisme budaya populer"
    ],
    "difficulty": "HARD",
    "explanation": "Penetration pacifique adalah meresapnya unsur-unsur kebudayaan asing dengan damai (seperti lewat musik/film) sehingga masyarakat menerimanya tanpa konflik.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-026",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Letak Geografis",
    "pertanyaan": "Wilayah Indonesia dilalui oleh jalur pegunungan Sirkum Pasifik dan Sirkum Mediterania. Keuntungan dari kondisi geologis ini adalah...",
    "jawabanBenar": "Tanah vulkanik subur dan kaya bahan tambang",
    "pengecoh": [
      "Bebas dari ancaman gempa bumi dan tsunami",
      "Memiliki batas laut teritorial yang sangat luas",
      "Memiliki iklim gurun yang cocok untuk peternakan unta"
    ],
    "difficulty": "EASY",
    "explanation": "Pertemuan sirkum pegunungan ini menyebabkan banyaknya gunung berapi. Abu vulkaniknya menyuburkan tanah dan aktivitas magmatisnya membentuk deposit mineral.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-027",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Perdagangan",
    "pertanyaan": "Dalam perdagangan, kegiatan membeli barang dari luar negeri untuk memenuhi kebutuhan dalam negeri disebut...",
    "jawabanBenar": "Impor",
    "pengecoh": [
      "Ekspor",
      "Barter",
      "Proteksi"
    ],
    "difficulty": "EASY",
    "explanation": "Impor adalah kegiatan memasukkan barang dari luar negara (luar negeri) ke dalam negeri.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-028",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Keberagaman",
    "pertanyaan": "Semboyan 'Bhinneka Tunggal Ika' berasal dari kitab Sutasoma karangan Mpu Tantular peninggalan Kerajaan Majapahit. Makna filosofis semboyan ini bagi bangsa Indonesia adalah...",
    "jawabanBenar": "Berbeda suku, agama, dan budaya, tetap satu",
    "pengecoh": [
      "Bangsa Indonesia menggunakan satu bahasa agar bersatu",
      "Setiap perbedaan pendapat harus diselesaikan melalui pengadilan hukum",
      "Seluruh suku bangsa dilebur menjadi satu identitas"
    ],
    "difficulty": "EASY",
    "explanation": "Bhinneka Tunggal Ika berarti 'berbeda-beda tetapi tetap satu jua', mengakui pluralitas tanpa memaksakan keseragaman total.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-029",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Sejarah Masa Pendudukan Jepang",
    "pertanyaan": "Kedatangan Jepang ke Indonesia pada tahun 1942 awalnya disambut gembira karena Jepang mempropagandakan diri sebagai 'Saudara Tua'. Namun, penderitaan rakyat sangat berat akibat romusha. Tujuan utama Jepang memberlakukan romusha adalah...",
    "jawabanBenar": "Mengerahkan tenaga kerja gratis membangun infrastruktur perang",
    "pengecoh": [
      "Melatih pemuda Indonesia agar memiliki keterampilan teknis",
      "Membuka lahan pertanian baru untuk meningkatkan ekspor beras",
      "Mendidik masyarakat agar disiplin dalam bekerja"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Romusha adalah kerja paksa untuk mendukung mesin perang Jepang, di mana rakyat dipaksa membangun rel kereta, jalan, bunker, dan lapangan terbang dengan kondisi tragis.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-IPS-030",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "IPS",
    "topik": "Institusi Sosial",
    "pertanyaan": "Keluarga memiliki fungsi afeksi bagi anggotanya. Pernyataan yang menunjukkan pelaksanaan fungsi afeksi dalam keluarga adalah...",
    "jawabanBenar": "Orang tua memberikan kasih sayang, perhatian, keamanan",
    "pengecoh": [
      "Orang tua membiayai seluruh kebutuhan sekolah anak-anaknya",
      "Keluarga mengajarkan nilai-nilai agama dan sopan santun",
      "Keluarga menentukan status sosial seseorang di tengah masyarakat"
    ],
    "difficulty": "HARD",
    "explanation": "Afeksi berarti kasih sayang dan kehangatan emosional. Membiayai sekolah adalah fungsi ekonomi, mengajarkan nilai adalah fungsi sosialisasi/edukasi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-001",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Nilai-nilai Pancasila",
    "pertanyaan": "Ketika ada teman yang sedang melaksanakan ibadah sesuai dengan agamanya, sikap kita sebaiknya tidak mengganggu dan menjaga ketenangan. Sikap ini merupakan penerapan Pancasila khususnya sila ke-...",
    "jawabanBenar": "Hak perlindungan dan kewajiban menaati tata tertib",
    "pengecoh": [
      "Hak mendapat pujian dan kewajiban membelikan makanan",
      "Kewajiban menghukum teman dan hak dijauhi guru",
      "Hak mengabaikan aturan dan kewajiban menghentikan guru"
    ],
    "difficulty": "EASY",
    "explanation": "Sila pertama 'Ketuhanan Yang Maha Esa' menjamin kemerdekaan beragama dan mewajibkan kita untuk bertoleransi serta menghormati ibadah orang lain.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-002",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Nilai-nilai Pancasila",
    "pertanyaan": "Menggalang dana untuk membantu korban bencana alam atau menjenguk teman yang sedang sakit merupakan wujud pengamalan Pancasila sila ke-...",
    "jawabanBenar": "Dua",
    "pengecoh": [
      "Satu",
      "Tiga",
      "Empat"
    ],
    "difficulty": "EASY",
    "explanation": "Sila kedua 'Kemanusiaan yang Adil dan Beradab' mengajarkan kita untuk saling mencintai sesama manusia dan melakukan kegiatan kemanusiaan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-003",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Nilai-nilai Pancasila",
    "pertanyaan": "Membeli dan menggunakan produk-produk buatan dalam negeri seperti sepatu atau pakaian karya pengrajin lokal merupakan wujud dari sikap...",
    "jawabanBenar": "Kebebasan untuk menganut agama dan beribadah",
    "pengecoh": [
      "Kewajiban untuk tunduk pada perintah atasan",
      "Mendapatkan pendidikan gratis dari pemerintah",
      "Hak memilih pemimpin negara dalam pemilihan"
    ],
    "difficulty": "EASY",
    "explanation": "Menggunakan produk dalam negeri adalah bentuk kebanggaan dan cinta tanah air yang merupakan pengamalan Sila Ketiga Pancasila.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-004",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Nilai-nilai Pancasila",
    "pertanyaan": "Dalam menentukan tujuan wisata akhir tahun kelas, ketua kelas mengajak seluruh siswa untuk berdiskusi dan mengambil keputusan bersama. Tindakan ini mencerminkan Sila ke-...",
    "jawabanBenar": "Melaporkannya kepada guru atau pihak berwenang",
    "pengecoh": [
      "Ikut menertawakan teman agar tidak ikut dibully",
      "Merekam kejadian dan menyebarkannya di media sosial",
      "Membalas dengan kekerasan secara diam-diam"
    ],
    "difficulty": "EASY",
    "explanation": "Sila keempat menekankan penyelesaian masalah atau pengambilan keputusan bersama melalui musyawarah untuk mencapai mufakat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-005",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Nilai-nilai Pancasila",
    "pertanyaan": "Membagi jadwal piket kebersihan kelas secara merata tanpa membeda-bedakan teman merupakan contoh penerapan Pancasila Sila ke-...",
    "jawabanBenar": "Lima",
    "pengecoh": [
      "Memaksakan kehendak agar keputusannya cepat disetujui",
      "Meninggalkan ruang musyawarah saat terjadi perbedaan",
      "Menyela pembicaraan karena merasa idenya paling benar"
    ],
    "difficulty": "EASY",
    "explanation": "Sila kelima 'Keadilan Sosial bagi Seluruh Rakyat Indonesia' bermakna bersikap adil, menjaga keseimbangan hak dan kewajiban, serta tidak membeda-bedakan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-006",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Semboyan 'Bhinneka Tunggal Ika' yang tertulis pada lambang negara burung Garuda memiliki makna...",
    "jawabanBenar": "Berbeda-beda tetapi tetap satu jua",
    "pengecoh": [
      "Bersatu kita teguh bercerai kita runtuh",
      "Keberagaman adalah sumber konflik yang harus diseragamkan",
      "Satu bangsa dengan satu bahasa ibu sama"
    ],
    "difficulty": "EASY",
    "explanation": "Bhinneka Tunggal Ika mengakui keberagaman suku, agama, dan ras di Indonesia, namun tetap disatukan dalam satu identitas bangsa.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-007",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Gotong Royong",
    "pertanyaan": "Contoh pelaksanaan gotong royong di lingkungan sekolah adalah...",
    "jawabanBenar": "Bekerja sama membersihkan kelas dan halaman sekolah",
    "pengecoh": [
      "Bekerja sama saat ujian agar nilai bagus",
      "Mengumpulkan uang saku untuk membeli jajan bersama",
      "Berkumpul di kantin saat jam pelajaran kosong"
    ],
    "difficulty": "EASY",
    "explanation": "Gotong royong adalah bekerja bersama-sama untuk mencapai hasil yang didambakan bersama, seperti kebersihan sekolah. Bekerja sama saat ujian adalah kecurangan, bukan gotong royong.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-008",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak dan Kewajiban",
    "pertanyaan": "Siswa berhak mendapatkan pengajaran yang baik dari guru. Di sisi lain, siswa harus mematuhi tata tertib sekolah. Mematuhi tata tertib tersebut merupakan bentuk...",
    "jawabanBenar": "Kewajiban",
    "pengecoh": [
      "Hak",
      "Penghargaan",
      "Keadilan"
    ],
    "difficulty": "EASY",
    "explanation": "Kewajiban adalah sesuatu yang harus dilaksanakan atau dilakukan. Mematuhi tata tertib adalah tanggung jawab mutlak seorang siswa.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-009",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Kedudukan Pancasila",
    "pertanyaan": "Pancasila dijadikan sebagai sumber dari segala sumber hukum dan pedoman dalam menyelenggarakan ketatanegaraan. Hal ini menunjukkan kedudukan Pancasila sebagai...",
    "jawabanBenar": "Dasar Negara",
    "pengecoh": [
      "Pandangan Hidup",
      "Kepribadian Bangsa",
      "Ideologi Tertutup"
    ],
    "difficulty": "EASY",
    "explanation": "Sebagai Dasar Negara, Pancasila berfungsi sebagai fondasi yuridis dan pedoman dalam mengatur pemerintahan dan penyelenggaraan negara.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-010",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Kedudukan Pancasila",
    "pertanyaan": "Ketika masyarakat Indonesia menjadikan nilai-nilai ketuhanan, kemanusiaan, persatuan, kerakyatan, dan keadilan sebagai petunjuk arah dalam kehidupan sehari-hari, maka Pancasila berfungsi sebagai...",
    "jawabanBenar": "Pandangan hidup bangsa",
    "pengecoh": [
      "Perjanjian luhur bangsa",
      "Dasar hukum negara",
      "Identitas pemerintahan"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Pandangan hidup (way of life) berarti nilai-nilai Pancasila digunakan sebagai pedoman tingkah laku dalam interaksi sosial sehari-hari masyarakat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-011",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Konstitusi dan Norma",
    "pertanyaan": "UUD NRI Tahun 1945 menempati tata urutan peraturan perundang-undangan tertinggi di Indonesia. Konsekuensi logis dari kedudukan tersebut adalah...",
    "jawabanBenar": "Peraturan di bawahnya tidak boleh bertentangan UUD",
    "pengecoh": [
      "Peraturan daerah dapat mengabaikan UUD 1945",
      "UUD hanya berlaku bagi pejabat negara",
      "UUD dapat digantikan oleh Peraturan Pemerintah"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sebagai hukum dasar tertinggi (Lex Superior), setiap produk hukum di bawahnya harus bersumber dan tidak boleh bertentangan dengan UUD 1945.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-012",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Konstitusi dan Norma",
    "pertanyaan": "Seorang siswa berbicara dengan nada tinggi dan menggunakan kata-kata kasar kepada gurunya saat ditegur. Perbuatan siswa tersebut merupakan pelanggaran terhadap norma...",
    "jawabanBenar": "Kesopanan",
    "pengecoh": [
      "Hukum",
      "Kesusilaan",
      "Agama"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Norma kesopanan bersumber dari kebiasaan, tata krama, dan etika pergaulan dalam masyarakat. Berbicara kasar kepada orang yang lebih tua/guru melanggar etika ini.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-013",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Tantangan Kebangsaan",
    "pertanyaan": "Menyebarkan berita bohong (hoaks) di media sosial yang berisi hinaan terhadap suku tertentu dapat memicu permusuhan. Tindakan ini sangat bertentangan dengan nilai Pancasila, khususnya Sila ke-...",
    "jawabanBenar": "Tiga",
    "pengecoh": [
      "Satu",
      "Dua",
      "Lima"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Menyebarkan kebencian antarsuku merusak persatuan dan kesatuan bangsa, yang secara langsung mencederai Sila Ketiga, Persatuan Indonesia.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-014",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Demokrasi",
    "pertanyaan": "Dalam pemilihan ketua OSIS, calon yang kamu dukung ternyata kalah suara. Sikap demokratis yang paling tepat untuk kamu tunjukkan adalah...",
    "jawabanBenar": "Menerima kekalahan dan mendukung program ketua terpilih",
    "pengecoh": [
      "Menolak hasil karena menganggap ada kecurangan",
      "Tidak mau lagi ikut kegiatan OSIS",
      "Membujuk teman agar tidak mematuhi ketua baru"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sikap demokratis sejati bukan hanya tentang memberikan hak suara, tetapi juga menghormati keputusan mayoritas dan mendukung kebaikan bersama.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-015",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Kedaulatan Rakyat",
    "pertanyaan": "Pasal 1 Ayat (2) UUD NRI Tahun 1945 berbunyi 'Kedaulatan berada di tangan rakyat dan dilaksanakan menurut Undang-Undang Dasar.' Makna kedaulatan di tangan rakyat adalah...",
    "jawabanBenar": "Rakyat pemegang kekuasaan tertinggi diwakilkan melalui pemilu",
    "pengecoh": [
      "Rakyat bebas bertindak tanpa perlu mematuhi hukum",
      "Presiden memegang kekuasaan mutlak mengatur rakyat",
      "Kekuasaan negara dipegang tentara dan kepolisian"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kedaulatan rakyat (demokrasi) berarti kekuasaan tertinggi ada pada rakyat, yang disalurkan secara konstitusional melalui sistem perwakilan dan pemilu.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-016",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bela Negara",
    "pertanyaan": "Upaya bela negara bukan hanya tugas aparat militer (TNI/Polri). Sebagai pelajar SMP, wujud bela negara yang paling tepat dan relevan adalah...",
    "jawabanBenar": "Belajar rajin untuk berprestasi dan memajukan bangsa",
    "pengecoh": [
      "Membeli senjata tajam untuk menjaga keamanan lingkungan",
      "Ikut berperang di daerah perbatasan negara",
      "Melakukan unjuk rasa setiap hari mengkritik pemerintah"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Bela negara non-fisik bagi pelajar adalah dengan mempersiapkan diri melalui pendidikan agar kelak dapat berkontribusi positif bagi kemajuan bangsa.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-017",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Keberagaman Masyarakat",
    "pertanyaan": "Dalam sebuah kelompok belajar, terdapat siswa dari suku Jawa, Batak, dan Minang. Agar tugas kelompok dapat selesai dengan baik, sikap yang harus diutamakan adalah...",
    "jawabanBenar": "Bekerja sama dan menghargai tanpa mempermasalahkan suku",
    "pengecoh": [
      "Menyerahkan tugas kepada siswa paling pintar sukunya",
      "Hanya mau berdiskusi menggunakan bahasa daerah",
      "Memisahkan tugas berdasarkan latar belakang budaya"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kerja sama dan sikap saling menghargai (toleransi) adalah kunci keberhasilan dalam masyarakat/kelompok yang majemuk.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-018",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Toleransi",
    "pertanyaan": "Sikap toleransi umat beragama dalam kehidupan sehari-hari bukan berarti kita mengikuti ajaran agama lain, melainkan...",
    "jawabanBenar": "Menghormati pemeluk agama lain dalam menjalankan ibadah",
    "pengecoh": [
      "Mencampuradukkan ajaran berbagai agama menjadi agama baru",
      "Ikut merayakan semua ritual keagamaan umat lain",
      "Membatasi waktu ibadah agama lain"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Toleransi beragama adalah sikap pasif menghargai dan tidak mengganggu, bukan sinkretisme (mencampuradukkan) atau kompromi akidah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-019",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Musyawarah",
    "pertanyaan": "Dalam rapat pembentukan panitia pentas seni sekolah, musyawarah untuk mufakat ternyata mengalami jalan buntu karena ada dua pendapat yang sama kuat. Langkah demokratis selanjutnya yang sesuai dengan nilai Pancasila adalah...",
    "jawabanBenar": "Melakukan pemungutan suara (voting) menjaga persatuan",
    "pengecoh": [
      "Membatalkan seluruh rencana pentas seni",
      "Menyerahkan keputusan sepihak kepada kepala sekolah",
      "Memaksa satu pihak mengalah dengan intimidasi"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Jika musyawarah mufakat tidak tercapai setelah upaya maksimal, pengambilan keputusan dapat dilakukan melalui pemungutan suara terbanyak (voting) yang disepakati bersama.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-020",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak dan Kewajiban",
    "pertanyaan": "Mengapa dalam kehidupan berbangsa dan bernegara, pemenuhan kewajiban harus dilaksanakan terlebih dahulu atau seimbang dengan tuntutan hak?",
    "jawabanBenar": "Hak diperoleh setelah melaksanakan kewajiban dan tanggung jawab",
    "pengecoh": [
      "Pemerintah hanya mendengarkan yang rajin membayar pajak",
      "Hak asasi tidak berlaku di negara berkembang",
      "Kewajiban lebih mudah dilakukan daripada menuntut hak"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Hak dan kewajiban ibarat dua sisi mata uang. Seseorang berhak mendapatkan sesuatu (misal gaji atau fasilitas negara) jika ia telah menunaikan kewajibannya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-021",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak dan Kewajiban",
    "pertanyaan": "Setiap manusia memiliki hak yang melekat sejak lahir sebagai anugerah Tuhan, yang disebut Hak Asasi Manusia (HAM). Perbedaan utama antara HAM dan Hak Warga Negara adalah...",
    "jawabanBenar": "HAM universal, sedangkan Hak Warga Negara dibatasi kewarganegaraan",
    "pengecoh": [
      "HAM diberikan pemerintah, Hak Warga Negara dari Tuhan",
      "HAM bagi dewasa, Hak Warga Negara sejak lahir",
      "HAM bisa dicabut, Hak Warga Negara mutlak selamanya"
    ],
    "difficulty": "MEDIUM",
    "explanation": "HAM melekat pada kodrat manusia (universal), sedangkan hak warga negara (seperti hak memilih dalam pemilu) hanya dimiliki oleh warga negara resmi dari suatu negara.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-022",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Identitas Nasional",
    "pertanyaan": "Di tengah gempuran budaya asing melalui internet, sekelompok remaja di desa tetap rutin berlatih tari tradisional dan memainkan alat musik daerah. Upaya para remaja tersebut merupakan bentuk pelestarian...",
    "jawabanBenar": "Identitas nasional bangsa",
    "pengecoh": [
      "Ideologi liberalisme",
      "Nasionalisme chauvinisme",
      "Globalisasi budaya"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Budaya daerah merupakan akar budaya nasional yang membentuk identitas bangsa. Melestarikannya berarti menjaga jati diri bangsa dari ancaman homogenisasi global.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-023",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Keberagaman Masyarakat",
    "pertanyaan": "Indonesia memiliki ratusan suku, bahasa, dan budaya. Cara pandang yang paling tepat terhadap fakta keberagaman tersebut dalam bingkai NKRI adalah...",
    "jawabanBenar": "Keberagaman adalah kekayaan bangsa yang harus ditoleransi",
    "pengecoh": [
      "Keberagaman adalah ancaman laten yang memecah belah",
      "Keberagaman harus dihilangkan perlahan agar negara seragam",
      "Keberagaman membuktikan Indonesia tidak siap menjadi modern"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Keberagaman bukan kelemahan, melainkan aset dan kekayaan kultural yang memperkuat identitas bangsa jika dirawat dengan semboyan Bhinneka Tunggal Ika.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-024",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Konstitusi dan Norma",
    "pertanyaan": "Fungsi pokok sebuah konstitusi (seperti UUD 1945) bagi sebuah negara hukum yang demokratis adalah...",
    "jawabanBenar": "Membatasi kekuasaan pemerintah agar tidak bertindak sewenang-wenang",
    "pengecoh": [
      "Memberi kekuasaan mutlak presiden keadaan darurat",
      "Menentukan agama resmi seluruh warga negara",
      "Meniadakan hak asasi demi kepentingan keamanan militer"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Dalam negara demokrasi/hukum, konstitusi berfungsi membatasi kekuasaan penyelenggara negara (konstitusionalisme) serta menjamin hak-hak asasi warga negaranya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-025",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Kehidupan Bermasyarakat",
    "pertanyaan": "Masyarakat di suatu kampung rutin melakukan ronda malam (siskamling) secara bergiliran. Partisipasi warga dalam siskamling mencerminkan kesadaran akan...",
    "jawabanBenar": "Tanggung jawab menjaga ketertiban lingkungan bersama",
    "pengecoh": [
      "Hak untuk mendapatkan bayaran dari ketua RT",
      "Kewajiban menakut-nakuti pendatang baru di kampung",
      "Keinginan untuk mencampuri urusan pribadi tetangga"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Ronda malam adalah wujud gotong royong dan kesadaran akan tanggung jawab kewarganegaraan di tingkat lingkungan (Sila ke-3 dan ke-5).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-026",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Penerapan Pancasila",
    "pertanyaan": "Seorang bupati merumuskan peraturan daerah baru yang disusun berdasarkan nilai-nilai agama, persatuan, dan keadilan sosial yang tercantum dalam Pancasila. Namun dalam kehidupan sehari-hari, sang bupati sering bersikap angkuh dan tidak mau bertegur sapa dengan tetangganya. Analisis yang tepat dari situasi tersebut adalah...",
    "jawabanBenar": "Berhasil menerapkan sebagai Dasar Negara, gagal Pandangan Hidup",
    "pengecoh": [
      "Melanggar hukum tata negara mencampurkan nilai agama",
      "Sikap angkuh dibenarkan karena jabatannya lebih tinggi",
      "Pancasila tidak berlaku untuk kehidupan pribadi bupati"
    ],
    "difficulty": "HARD",
    "explanation": "Dasar Negara berkaitan dengan pembuatan regulasi/kebijakan formal (yang dilakukan dengan benar). Pandangan Hidup berkaitan dengan etika/tingkah laku moral individu sehari-hari (yang gagal dilakukan bupati).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-027",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Analisis Hak dan Kewajiban",
    "pertanyaan": "Budi memutar musik rock dengan volume maksimal di kamarnya pada tengah malam dengan alasan 'Ini adalah hak asasi saya untuk berekspresi dan mencari hiburan'. Akibatnya, tetangga Budi yang sedang sakit tidak bisa beristirahat. Evaluasi yang tepat berdasarkan prinsip HAM di Indonesia adalah...",
    "jawabanBenar": "Hak asasi seseorang dibatasi oleh hak orang lain",
    "pengecoh": [
      "Budi benar karena kebebasan berekspresi dijamin UUD",
      "Tetangga salah karena tidak memiliki ruang kedap suara",
      "Budi boleh memutar musik jika membayar kompensasi"
    ],
    "difficulty": "HARD",
    "explanation": "Di Indonesia, pelaksanaan HAM tunduk pada pembatasan yang ditetapkan undang-undang (Pasal 28J UUD 1945) untuk menjamin pengakuan serta penghormatan atas hak dan kebebasan orang lain.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-028",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Resolusi Konflik (Sila ke-4)",
    "pertanyaan": "Terjadi perselisihan antara dua kelompok pemuda desa karena kesalahpahaman saat pertandingan sepak bola. Perselisihan memanas dan hampir terjadi bentrokan fisik. Solusi penyelesaian konflik yang paling mencerminkan pengamalan Sila Keempat adalah...",
    "jawabanBenar": "Berdialog mencari akar masalah dan bermusyawarah mufakat",
    "pengecoh": [
      "Menjatuhkan denda besar agar mereka jera",
      "Kelompok yang anggotanya banyak dinyatakan sebagai pemenang",
      "Menangkap seluruh pemuda tanpa memintai keterangan"
    ],
    "difficulty": "HARD",
    "explanation": "Sila keempat mengedepankan kebijaksanaan dan musyawarah. Dialog dan mediasi oleh tokoh masyarakat adalah cara demokratis (musyawarah) untuk mencegah kekerasan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-029",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Amandemen UUD 1945",
    "pertanyaan": "Batang Tubuh (Pasal-pasal) UUD NRI Tahun 1945 telah diamandemen sebanyak empat kali untuk menyesuaikan dengan perkembangan zaman. Namun, Pembukaan UUD 1945 sama sekali tidak pernah diubah. Alasan fundamental mengapa Pembukaan UUD 1945 tidak boleh diubah adalah...",
    "jawabanBenar": "Mengubahnya berarti membubarkan Negara Kesatuan Republik Indonesia",
    "pengecoh": [
      "Pembukaan UUD ditulis dengan bahasa kuno",
      "Aturan internasional melarang mengubah teks kemerdekaan",
      "Proses mengubah butuh persetujuan Perserikatan Bangsa-Bangsa"
    ],
    "difficulty": "HARD",
    "explanation": "Pembukaan UUD 1945 memuat statuta fundamental (Staatsfundamentalnorm), yakni Pancasila dan proklamasi. Mengubahnya identik dengan membongkar fondasi berdirinya negara RI.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PAN-030",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Tantangan Globalisasi",
    "pertanyaan": "Era digital membuat budaya asing sangat mudah masuk ke Indonesia dan memengaruhi gaya hidup remaja. Cara bersikap yang paling kritis dan berlandaskan Pancasila dalam menghadapi fenomena ini adalah...",
    "jawabanBenar": "Menyaring informasi menggunakan nilai Pancasila dan mengambil positif",
    "pengecoh": [
      "Menutup akses internet agar tidak terkontaminasi budaya luar",
      "Menerima seluruh tren asing agar bangsa dianggap modern",
      "Hanya berteman dengan orang luar negeri agar keren"
    ],
    "difficulty": "HARD",
    "explanation": "Pancasila berfungsi sebagai filter (penyaring). Bangsa yang kuat tidak menutup diri (isolasi), tetapi juga tidak menerima mentah-mentah (westernisasi/asimilasi buta). Kita harus selektif.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-001",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Greetings and Introductions",
    "pertanyaan": "Andi: Good morning, Mr. Budi. How are you today?\nMr. Budi: ..., Andi. I am very well, thank you.",
    "jawabanBenar": "Good morning",
    "pengecoh": [
      "Good night",
      "Goodbye",
      "See you later"
    ],
    "difficulty": "EASY",
    "explanation": "Ungkapan sapaan 'Good morning' (Selamat pagi) direspons kembali dengan 'Good morning'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-002",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Personal Information",
    "pertanyaan": "Hello, my name is Sarah. I ... thirteen years old and I live in Bandung.",
    "jawabanBenar": "am",
    "pengecoh": [
      "is",
      "are",
      "was"
    ],
    "difficulty": "EASY",
    "explanation": "To be yang tepat untuk subjek 'I' pada waktu sekarang (present tense) adalah 'am'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-003",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Daily Activities",
    "pertanyaan": "My father is a farmer. He always ... to the rice field every morning.",
    "jawabanBenar": "goes",
    "pengecoh": [
      "go",
      "going",
      "went"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kalimat ini menggunakan Simple Present Tense (rutinitas: every morning). Untuk subjek tunggal orang ketiga 'He', kata kerja ditambahkan -s/-es menjadi 'goes'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-004",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Family and Relationships",
    "pertanyaan": "This is my sister. ... name is Nisa. She likes reading books.",
    "jawabanBenar": "Her",
    "pengecoh": [
      "His",
      "My",
      "Your"
    ],
    "difficulty": "EASY",
    "explanation": "Kata ganti kepemilikan (possessive adjective) untuk subjek perempuan tunggal (sister/she) adalah 'Her'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-005",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Describing Objects",
    "pertanyaan": "Where is the cat? It is raining outside, so it is hiding ... the bed.",
    "jawabanBenar": "under",
    "pengecoh": [
      "on",
      "above",
      "in front of"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Konteks kalimat menunjukkan kucing sedang bersembunyi dari hujan. Tempat bersembunyi yang logis dari pilihan yang ada adalah 'di bawah' (under) kasur.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-006",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Descriptive Texts",
    "pertanyaan": "Read the text below!\nI have a pet rabbit named Boni. Boni has soft white fur and long ears. He loves eating carrots and fresh vegetables. Every afternoon, I play with him in the backyard. Boni is very active and likes to hop around.\n\nWhat is the text mostly about?",
    "jawabanBenar": "The writer's pet rabbit",
    "pengecoh": [
      "How to feed a rabbit",
      "The physical appearance of a rabbit",
      "Playing in the backyard"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Teks tersebut secara keseluruhan mendeskripsikan kelinci peliharaan penulis (fisik, kebiasaan makan, aktivitas).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-007",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Descriptive Texts",
    "pertanyaan": "Based on the text about Boni the rabbit, what does Boni like to eat?",
    "jawabanBenar": "Carrots and fresh vegetables",
    "pengecoh": [
      "Fruits and meat",
      "Carrots and fish",
      "Fresh vegetables and grass"
    ],
    "difficulty": "EASY",
    "explanation": "Informasi ini tertulis jelas (eksplisit) pada teks: 'He loves eating carrots and fresh vegetables.'",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-008",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Descriptive Texts",
    "pertanyaan": "Read the text below!\nMr. Johan is our new English teacher. He is tall and wears glasses. He always explains the lessons clearly and gives us fun games to play in class. When a student makes a mistake, he never gets angry but helps them correct it patiently.\n\nFrom the text, we can conclude that Mr. Johan is a ... teacher.",
    "jawabanBenar": "patient and creative",
    "pengecoh": [
      "strict and discipline",
      "lazy and boring",
      "quiet and angry"
    ],
    "difficulty": "HARD",
    "explanation": "Simpulan (inference) diambil dari deskripsi perilakunya: 'never gets angry' (sabar/patient) dan 'gives us fun games' (kreatif/creative).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-009",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Notices and Signs",
    "pertanyaan": "You see a sign in the library that says: 'PLEASE KEEP SILENT'. What does it mean?",
    "jawabanBenar": "We must not make noise in the library.",
    "pengecoh": [
      "We are allowed to talk loudly.",
      "We must speak softly to the librarian only.",
      "We must not read books loudly outside."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Tanda 'PLEASE KEEP SILENT' berarti pengunjung dilarang membuat keributan atau bersuara keras (must not make any noise).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-010",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Daily Routines",
    "pertanyaan": "Doni: What time do you usually go to school?\nSiti: I usually go to school at 06:15.\nSiti goes to school at...",
    "jawabanBenar": "a quarter past six",
    "pengecoh": [
      "a quarter to six",
      "half past six",
      "six o'clock"
    ],
    "difficulty": "EASY",
    "explanation": "Pukul 06:15 dalam bahasa Inggris dibaca 'a quarter past six' (seperempat jam lewat dari pukul enam).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-011",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Expressions of Opinion",
    "pertanyaan": "Santi: ... about the new superhero movie?\nBudi: I think it is amazing! The action scenes are very cool.",
    "jawabanBenar": "What do you think",
    "pengecoh": [
      "Do you agree",
      "Are you sure",
      "How are you"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Budi menjawab dengan memberikan opini ('I think...'). Maka, pertanyaan Santi yang tepat adalah menanyakan pendapat ('What do you think...').",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-012",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Agreement and Disagreement",
    "pertanyaan": "Fajar: I think we should clean the classroom before going home.\nRina: ... The classroom is very dirty.",
    "jawabanBenar": "I completely agree with you.",
    "pengecoh": [
      "I don't think so.",
      "I disagree with you.",
      "I am not sure about that."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Rina memberikan alasan 'The classroom is very dirty' (Kelasnya sangat kotor), yang mendukung pernyataan Fajar. Maka ungkapan yang tepat adalah persetujuan (agree).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-013",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Family and Relationships",
    "pertanyaan": "My mother's brother is my...",
    "jawabanBenar": "uncle",
    "pengecoh": [
      "aunt",
      "grandfather",
      "nephew"
    ],
    "difficulty": "EASY",
    "explanation": "Saudara laki-laki dari ibu (atau ayah) disebut 'uncle' (paman).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-014",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Grammar in Context",
    "pertanyaan": "Please be quiet! The baby ... in the bedroom right now.",
    "jawabanBenar": "is sleeping",
    "pengecoh": [
      "sleeps",
      "slept",
      "was sleeping"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kehadiran kata 'right now' dan 'Please be quiet!' menunjukkan aktivitas yang sedang berlangsung saat ini (Present Continuous Tense: is/am/are + V-ing).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-015",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Grammar in Context",
    "pertanyaan": "Dina: Where ... you go last weekend?\nNisa: I went to the beach with my family.",
    "jawabanBenar": "did",
    "pengecoh": [
      "do",
      "does",
      "were"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Waktu kejadian adalah masa lampau ('last weekend'). Kata bantu (auxiliary verb) untuk kalimat tanya Simple Past Tense verbal adalah 'did'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-016",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Recount Texts",
    "pertanyaan": "Last holiday, my family and I went to the zoo. We saw many animals like elephants, tigers, and monkeys. In the afternoon, it suddenly rained heavily. We had to run and take shelter under a big tree. We were wet and cold, but we still felt happy because we spent time together.\n\nWhat is the main idea of the paragraph?",
    "jawabanBenar": "Holiday experience at the zoo despite rain.",
    "pengecoh": [
      "The animals seen at the zoo.",
      "How to take shelter from heavy rain.",
      "The writer's sadness because of rain."
    ],
    "difficulty": "HARD",
    "explanation": "Gagasan utama (main idea) teks recount menceritakan keseluruhan pengalaman liburan penulis yang berkesan meskipun turun hujan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-017",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Recount Texts",
    "pertanyaan": "Based on the recount text about the zoo holiday, why did the writer and their family run and take shelter?",
    "jawabanBenar": "Because it rained heavily.",
    "pengecoh": [
      "Because they wanted to see monkeys.",
      "Because the animals chased them.",
      "Because they felt very tired."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sebab akibat tertulis eksplisit di dalam teks: 'it suddenly rained heavily. We had to run and take shelter...'",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-018",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Vocabulary in Context",
    "pertanyaan": "After running around the park for two hours, the children were completely **exhausted**. They drank a lot of water and fell asleep immediately.\nThe word 'exhausted' has the closest meaning to...",
    "jawabanBenar": "very tired",
    "pengecoh": [
      "very happy",
      "very hungry",
      "very thirsty"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Konteks kalimat (berlari 2 jam lalu langsung tertidur) menunjukkan bahwa 'exhausted' berarti sangat lelah (very tired).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-019",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Grammar in Context",
    "pertanyaan": "I want to buy some fruits. I need three ... and two apples.",
    "jawabanBenar": "mangoes",
    "pengecoh": [
      "mango",
      "mangos",
      "mango's"
    ],
    "difficulty": "EASY",
    "explanation": "Kata benda jamak (plural) untuk mango yang berakhiran -o umumnya ditambahkan -es menjadi 'mangoes'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-020",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Grammar in Context",
    "pertanyaan": "An elephant weighs about 4000 kg. A cow weighs about 600 kg. We can say that an elephant is ... than a cow.",
    "jawabanBenar": "heavier",
    "pengecoh": [
      "lighter",
      "more heavy",
      "most heavy"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Gajah lebih berat dari sapi. Bentuk perbandingan lebih (comparative) dari kata sifat 'heavy' adalah 'heavier'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-021",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Grammar in Context",
    "pertanyaan": "Rina got 95 in English. Siti got 80, and Ayu got 75. Rina got the ... score in the class.",
    "jawabanBenar": "highest",
    "pengecoh": [
      "higher",
      "most high",
      "more high"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Nilai 95 adalah yang paling tinggi di antara semuanya. Bentuk superlatif (paling) dari 'high' adalah 'highest'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-022",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Narrative Texts",
    "pertanyaan": "One hot summer day, a grasshopper was singing and playing. He saw an ant carrying food to its nest. The grasshopper laughed and said, 'Why are you working so hard? Come and play with me!' The ant replied, 'I am saving food for the winter.' When winter came, the grasshopper had no food and was starving, while the ant was safe and warm with plenty of food.\n\nWhat can we learn from the story?",
    "jawabanBenar": "We must prepare for the future, not lazy.",
    "pengecoh": [
      "We must play every day during summer.",
      "We should laugh at friends who work hard.",
      "Winter is the best time for food."
    ],
    "difficulty": "HARD",
    "explanation": "Pesan moral cerita (The Ant and the Grasshopper) adalah pentingnya bekerja keras dan mempersiapkan masa depan ketimbang bersikap malas.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-023",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Procedure Texts",
    "pertanyaan": "How to Make a Cup of Tea\n1. Boil some water.\n2. Put a teabag into a cup.\n3. Pour the boiling water into the cup.\n4. Wait for 3 minutes.\n5. Add some sugar and stir well.\n\nWhat should you do after pouring the boiling water into the cup?",
    "jawabanBenar": "Wait for 3 minutes.",
    "pengecoh": [
      "Put a teabag into the cup.",
      "Add some sugar and stir well.",
      "Boil some water."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Membaca instruksi secara berurutan. Langkah setelah 'Pour the boiling water' (langkah 3) adalah 'Wait for 3 minutes' (langkah 4).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-024",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Invitations and Responses",
    "pertanyaan": "Rudi: Would you like to come to my birthday party on Saturday night?\nLina: ... I will be there.",
    "jawabanBenar": "I'd love to.",
    "pengecoh": [
      "I am sorry, I can't.",
      "I don't think so.",
      "No, thank you."
    ],
    "difficulty": "EASY",
    "explanation": "Kalimat 'I will be there' (Saya akan datang) menunjukkan bahwa Lina menerima undangan. Respons penerimaan yang tepat adalah 'I'd love to' (Saya sangat bersedia).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-025",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Simple Instructions and Requests",
    "pertanyaan": "Student: ..., Sir. May I wash my hands?\nTeacher: Yes, please. Don't be long.",
    "jawabanBenar": "Excuse me",
    "pengecoh": [
      "I am sorry",
      "Thank you",
      "Good morning"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sebelum meminta izin atau menginterupsi secara sopan dalam bahasa Inggris, ungkapan yang tepat digunakan adalah 'Excuse me' (Permisi).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-026",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Messages and Announcements",
    "pertanyaan": "ANNOUNCEMENT\nTo all members of the English Club,\nWe will hold a storytelling competition next week to celebrate our school anniversary. Please register yourself to the committee before Friday. For more information, contact Maya (0812345678).\n\nWho is the target audience of this announcement?",
    "jawabanBenar": "Students joining the English Club.",
    "pengecoh": [
      "All students in the school.",
      "The teachers of the English Club.",
      "The committee of the school anniversary."
    ],
    "difficulty": "HARD",
    "explanation": "Target audiens/sasaran pembaca disebutkan secara spesifik pada baris pertama pengumuman: 'To all members of the English Club'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-027",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Messages and Announcements",
    "pertanyaan": "Based on the announcement about the storytelling competition, what is the deadline for registration?",
    "jawabanBenar": "Before Friday.",
    "pengecoh": [
      "Next week.",
      "On Friday.",
      "During the school anniversary."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Batas waktu (deadline) tertera pada kalimat 'Please register yourself... before Friday.'",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-028",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Describing People",
    "pertanyaan": "My uncle works in a hospital. He examines patients, gives them medicine, and helps them get well. He is a...",
    "jawabanBenar": "doctor",
    "pengecoh": [
      "teacher",
      "farmer",
      "mechanic"
    ],
    "difficulty": "EASY",
    "explanation": "Pekerjaan yang memeriksa pasien dan memberikan obat di rumah sakit adalah dokter (doctor).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-029",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Greetings and Social Expressions",
    "pertanyaan": "Anton: I am really sorry, I broke your favorite glass by accident.\nBudi: ... Just be careful next time.",
    "jawabanBenar": "That's alright.",
    "pengecoh": [
      "Thank you very much.",
      "You are welcome.",
      "I agree with you."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Respons untuk memaafkan permintaan maaf (I am sorry) adalah 'That's alright' (Tidak apa-apa).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-ENG-030",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Bahasa Inggris",
    "topik": "Reading Comprehension",
    "pertanyaan": "Sita: It's going to be a long weekend. Do you have any plans?\nDewi: My mother and I are going to make a chocolate cake on Saturday. On Sunday, if the weather is clear, my father promised to take us swimming.\nSita: That sounds great! I hope it doesn't rain.\n\nWhat will Dewi most likely do if it rains heavily on Sunday?",
    "jawabanBenar": "She will cancel swimming.",
    "pengecoh": [
      "She will swim in the rain.",
      "She will make a chocolate cake.",
      "She will ask Sita to go swimming."
    ],
    "difficulty": "HARD",
    "explanation": "Syarat pergi berenang dari ayah Dewi adalah 'if the weather is clear' (jika cuaca cerah). Jika hujan deras, secara logis rencana berenang akan dibatalkan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-001",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Perangkat Keras",
    "pertanyaan": "Perangkat komputer yang berfungsi sebagai otak utama untuk memproses data dan mengeksekusi instruksi program adalah...",
    "jawabanBenar": "CPU (Central Processing Unit)",
    "pengecoh": [
      "RAM",
      "Harddisk",
      "Monitor"
    ],
    "difficulty": "EASY",
    "explanation": "CPU adalah unit pemroses sentral yang mengontrol seluruh jalannya sistem komputer dan melakukan operasi aritmetika serta logika.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-002",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Abstraksi",
    "pertanyaan": "Saat menggambar peta rute angkutan umum, pembuat peta hanya menampilkan garis warna-warni dan nama stasiun, tanpa menggambar pohon, gedung, atau jalan kecil. Proses mengabaikan detail yang tidak penting dan hanya fokus pada informasi utama ini disebut...",
    "jawabanBenar": "Abstraksi",
    "pengecoh": [
      "Dekomposisi",
      "Algoritma",
      "Pengenalan Pola"
    ],
    "difficulty": "EASY",
    "explanation": "Abstraksi dalam berpikir komputasional adalah proses menyembunyikan detail yang rumit atau tidak relevan dan hanya menonjolkan fitur yang paling penting untuk memecahkan masalah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-003",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Jejak Digital",
    "pertanyaan": "Segala aktivitas yang kita lakukan di internet, seperti mengunggah foto, memberikan komentar, atau riwayat pencarian, akan meninggalkan catatan yang sulit dihapus. Hal ini dikenal dengan istilah...",
    "jawabanBenar": "Jejak digital (Digital footprint)",
    "pengecoh": [
      "Virus komputer",
      "Spam email",
      "Cookie web"
    ],
    "difficulty": "EASY",
    "explanation": "Jejak digital adalah rekam jejak data yang tertinggal saat seseorang menggunakan internet, yang dapat berdampak pada reputasi online seseorang di masa depan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-004",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Perlindungan Data",
    "pertanyaan": "Untuk melindungi akun media sosial agar tidak mudah diretas, kriteria pembuatan kata sandi (password) yang paling kuat dan aman adalah...",
    "jawabanBenar": "Kombinasi huruf besar, kecil, angka, dan simbol",
    "pengecoh": [
      "Menggunakan tanggal lahir sendiri",
      "Menggunakan nama hewan peliharaan",
      "Menggunakan deretan angka berurutan"
    ],
    "difficulty": "EASY",
    "explanation": "Kata sandi yang kuat (strong password) menggabungkan berbagai karakter acak sehingga sulit ditebak oleh peretas maupun program pembobol sandi (brute-force).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-005",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Etika Komunikasi Digital",
    "pertanyaan": "Saat berkomunikasi melalui grup obrolan (chat), Andi mengetik seluruh pesannya menggunakan HURUF KAPITAL. Dalam etika komunikasi digital (netiquette), penggunaan huruf kapital untuk seluruh kalimat biasanya diartikan sebagai...",
    "jawabanBenar": "Mengekspresikan kemarahan atau berteriak",
    "pengecoh": [
      "Menunjukkan rasa hormat",
      "Menandakan berita yang sangat menggembirakan",
      "Memperjelas tulisan agar mudah dibaca"
    ],
    "difficulty": "EASY",
    "explanation": "Dalam dunia digital, menulis dengan huruf kapital seluruhnya (ALL CAPS) dianggap sebagai bentuk teriakan atau ekspresi kemarahan dan dianggap tidak sopan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-006",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Internet",
    "pertanyaan": "Kumpulan komputer dan perangkat jaringan di seluruh dunia yang saling terhubung membentuk suatu jaringan global yang sangat besar untuk berbagi informasi disebut...",
    "jawabanBenar": "Internet",
    "pengecoh": [
      "Intranet",
      "Local Area Network (LAN)",
      "Bluetooth"
    ],
    "difficulty": "EASY",
    "explanation": "Internet (Interconnected Network) adalah sistem jaringan komputer global yang menghubungkan miliaran perangkat di seluruh dunia menggunakan protokol standar (TCP/IP).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-007",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Algoritma",
    "pertanyaan": "Urutan langkah-langkah logis dan sistematis yang disusun secara terstruktur untuk memecahkan suatu masalah atau menyelesaikan suatu tugas disebut...",
    "jawabanBenar": "Algoritma",
    "pengecoh": [
      "Dekomposisi",
      "Pseudocode",
      "Flowchart"
    ],
    "difficulty": "EASY",
    "explanation": "Algoritma adalah serangkaian instruksi atau prosedur langkah demi langkah yang pasti dan terdefinisi dengan baik untuk menyelesaikan suatu tugas komputasi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-008",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Perangkat Keluaran",
    "pertanyaan": "Perangkat keras (hardware) berikut ini yang berfungsi untuk menampilkan hasil pengolahan data komputer ke dalam bentuk cetakan (hardcopy) pada kertas adalah...",
    "jawabanBenar": "Printer",
    "pengecoh": [
      "Scanner",
      "Monitor",
      "Proyektor"
    ],
    "difficulty": "EASY",
    "explanation": "Printer adalah perangkat output yang mencetak dokumen digital (teks atau gambar) ke media fisik seperti kertas.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-009",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Sistem Operasi",
    "pertanyaan": "Perangkat lunak dasar yang berfungsi mengelola perangkat keras dan menyediakan layanan untuk aplikasi komputer berjalan (seperti Windows, macOS, Android, atau Linux) disebut...",
    "jawabanBenar": "Sistem Operasi (Operating System)",
    "pengecoh": [
      "Program Antivirus",
      "Perangkat Lunak Pengolah Kata",
      "Browser Internet"
    ],
    "difficulty": "EASY",
    "explanation": "Sistem Operasi bertindak sebagai jembatan atau manajer antara perangkat keras (hardware) dan program aplikasi (software) agar komputer dapat digunakan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-010",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Algoritma Sekuensial",
    "pertanyaan": "Susunlah algoritma sederhana membuat secangkir kopi berikut ini agar menjadi urutan langkah yang logis!\n1. Tuangkan air panas ke dalam cangkir.\n2. Siapkan cangkir, kopi bubuk, dan gula.\n3. Aduk hingga merata dan kopi siap diminum.\n4. Masukkan kopi bubuk dan gula ke dalam cangkir.",
    "jawabanBenar": "2 - 4 - 1 - 3",
    "pengecoh": [
      "1 - 2 - 3 - 4",
      "4 - 1 - 2 - 3",
      "2 - 1 - 4 - 3"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Urutan algoritmik yang logis: menyiapkan bahan (2), memasukkan bahan kering (4), menuangkan air panas (1), lalu mengaduknya (3).",
    "challengeType": "SEQUENCE"
  },
  {
    "id": "FD-INF-011",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Percabangan",
    "pertanyaan": "Perhatikan algoritma berikut:\n1. Baca nilai ujian siswa.\n2. Jika nilai >= 75, maka cetak 'Lulus'.\n3. Jika nilai < 75, maka cetak 'Remedial'.\nJika seorang siswa mendapatkan nilai 75, apa output yang akan dicetak oleh algoritma tersebut?",
    "jawabanBenar": "Lulus",
    "pengecoh": [
      "Remedial",
      "Lulus dan Remedial",
      "Tidak mencetak apa-apa"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kondisi 'Jika nilai >= 75' berarti nilai 75 sudah termasuk dalam kondisi pertama karena ada tanda sama dengan (>=). Jadi, outputnya adalah 'Lulus'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-012",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Dekomposisi",
    "pertanyaan": "Tim robotik sekolah ingin merancang robot pemungut sampah. Karena terlalu rumit, mereka membagi proyek tersebut menjadi bagian-bagian yang lebih kecil: merancang rangka, memprogram sensor, dan merakit roda penggerak. Teknik berpikir komputasional yang sedang mereka terapkan adalah...",
    "jawabanBenar": "Dekomposisi",
    "pengecoh": [
      "Pengenalan Pola",
      "Abstraksi",
      "Desain Algoritma"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Dekomposisi adalah proses memecah masalah atau sistem yang kompleks menjadi bagian-bagian yang lebih kecil, lebih mudah dikelola, dan lebih mudah dipahami.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-013",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Pengenalan Pola",
    "pertanyaan": "Sebuah barisan angka memiliki pola: 2, 5, 10, 17, 26. Angka berapakah yang akan muncul pada urutan selanjutnya jika pola tersebut diteruskan?",
    "jawabanBenar": "37",
    "pengecoh": [
      "35",
      "39",
      "41"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Selisih antar angka bertambah secara konstan dengan bilangan ganjil: +3 (2 ke 5), +5 (5 ke 10), +7 (10 ke 17), +9 (17 ke 26). Maka penambahan selanjutnya adalah +11. 26 + 11 = 37.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-014",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Ancaman Keamanan",
    "pertanyaan": "Budi menerima email yang seolah-olah dari banknya, meminta Budi mengklik sebuah tautan dan memasukkan PIN karena 'akunnya akan diblokir'. Tindakan penipuan yang memancing korban untuk memberikan data sensitif ini disebut...",
    "jawabanBenar": "Phishing",
    "pengecoh": [
      "Hacking",
      "Cyberbullying",
      "Defacing"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Phishing adalah teknik rekayasa sosial di mana penyerang menyamar sebagai entitas tepercaya (seperti bank) untuk mengelabui korban agar memberikan informasi sensitif.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-015",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Aplikasi Pengolah Angka",
    "pertanyaan": "Dalam aplikasi spreadsheet (seperti Microsoft Excel atau Google Sheets), fungsi yang digunakan untuk menghitung nilai rata-rata dari sekumpulan data angka pada sel tertentu adalah...",
    "jawabanBenar": "AVERAGE",
    "pengecoh": [
      "SUM",
      "COUNT",
      "MAX"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Fungsi AVERAGE digunakan untuk mencari nilai rata-rata, sedangkan SUM untuk total penjumlahan, COUNT untuk menghitung jumlah sel, dan MAX untuk nilai tertinggi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-016",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Representasi Data",
    "pertanyaan": "Komputer hanya memahami data dalam bentuk bilangan biner (basis 2), yaitu 0 dan 1. Nilai desimal (basis 10) dari bilangan biner 1010 adalah...",
    "jawabanBenar": "10",
    "pengecoh": [
      "8",
      "12",
      "14"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Konversi biner ke desimal: (1 x 2^3) + (0 x 2^2) + (1 x 2^1) + (0 x 2^0) = 8 + 0 + 2 + 0 = 10.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-017",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Konektivitas Jaringan",
    "pertanyaan": "Saat membagikan koneksi internet dari smartphone ke laptop tanpa menggunakan kabel fisik, teknologi nirkabel yang paling umum digunakan disebut tethering menggunakan...",
    "jawabanBenar": "Wi-Fi (Hotspot)",
    "pengecoh": [
      "Fiber Optic",
      "LAN Ethernet",
      "NFC"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Tethering menggunakan fitur Mobile Hotspot memancarkan sinyal Wi-Fi dari smartphone yang kemudian ditangkap oleh laptop untuk mengakses internet tanpa kabel.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-018",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Literasi Digital",
    "pertanyaan": "Anda membaca sebuah artikel provokatif di media sosial yang memicu amarah banyak orang tentang kejadian di kota Anda. Langkah paling etis dan tepat untuk mencegah penyebaran hoaks adalah...",
    "jawabanBenar": "Memeriksa silang dengan portal berita resmi",
    "pengecoh": [
      "Langsung membagikan artikel tersebut",
      "Menulis komentar kemarahan tanpa membaca isi",
      "Menghapus akun media sosial secara permanen"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Literasi informasi menuntut kita untuk selalu bersikap kritis, melakukan verifikasi fakta (fact-checking), dan tidak membagikan informasi provokatif yang belum terbukti kebenarannya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-019",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Pengelolaan File",
    "pertanyaan": "Ekstensi (akhiran) nama file membantu sistem operasi mengenali format data dan aplikasi apa yang harus digunakan untuk membukanya. Ekstensi file standar untuk dokumen gambar atau foto digital adalah...",
    "jawabanBenar": ".jpg atau .png",
    "pengecoh": [
      ".docx atau .pdf",
      ".mp3 atau .wav",
      ".exe atau .bat"
    ],
    "difficulty": "MEDIUM",
    "explanation": ".jpg (JPEG) dan .png adalah format kompresi untuk gambar/foto digital. (.docx untuk dokumen kata, .mp3 untuk audio, .exe untuk program executable).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-020",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Kolaborasi Digital",
    "pertanyaan": "Keuntungan utama menggunakan aplikasi dokumen berbasis cloud (seperti Google Docs) untuk mengerjakan tugas kelompok dibandingkan aplikasi pengolah kata konvensional yang diinstal di komputer adalah...",
    "jawabanBenar": "Bisa berkolaborasi di dokumen sama secara real-time",
    "pengecoh": [
      "Sama sekali tidak membutuhkan koneksi internet",
      "Teks yang diketik tidak bisa dihapus",
      "Tidak memerlukan perangkat elektronik apa pun"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Cloud computing memfasilitasi kolaborasi real-time tanpa perlu repot mengirim file bolak-balik via email atau flashdisk.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-021",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Logika Komputer",
    "pertanyaan": "Dalam logika operasi komputer, ekspresi logika (A AND B) hanya akan menghasilkan nilai keluaran BENAR (True) apabila...",
    "jawabanBenar": "Kondisi A dan kondisi B keduanya BENAR",
    "pengecoh": [
      "Hanya kondisi A yang bernilai BENAR",
      "Salah satu kondisi bernilai BENAR",
      "Kondisi A dan kondisi B keduanya SALAH"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Operator logika AND menuntut seluruh kondisi atau premis yang dievaluasi bernilai True agar hasil akhirnya True. Jika salah satu False, hasilnya False.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-022",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Privasi Digital",
    "pertanyaan": "Mengatur profil media sosial menjadi 'Private' (pribadi/terkunci) merupakan langkah keamanan yang sangat penting bagi remaja, yang fungsi utamanya adalah untuk mencegah...",
    "jawabanBenar": "Orang asing dapat menyalahgunakan informasi pribadi kita",
    "pengecoh": [
      "Akun dihapus otomatis oleh pengembang",
      "Virus menginfeksi perangkat keras smartphone",
      "Penurunan jumlah teman dunia nyata drastis"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Akun private membatasi siapa saja yang bisa melihat aktivitas dan data kita, sehingga mencegah kejahatan seperti pencurian identitas, doxing, atau penguntitan (stalking) oleh orang tak dikenal.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-023",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Etika Digital",
    "pertanyaan": "Saat membuat makalah tugas sekolah, Dina menyalin seluruh teks dari sebuah blog di internet dan memindahkannya (copy-paste) ke dokumennya tanpa menyebutkan nama penulis asli, seolah-olah itu adalah hasil pemikirannya sendiri. Tindakan melanggar etika akademis yang dilakukan Dina disebut...",
    "jawabanBenar": "Plagiarisme (Penjiplakan)",
    "pengecoh": [
      "Paraphrasing (Parafrasa)",
      "Cyberstalking (Penguntitan siber)",
      "Open Source (Sumber Terbuka)"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Plagiarisme adalah tindakan pencurian intelektual dengan mengklaim karya atau pemikiran orang lain sebagai karya diri sendiri tanpa memberikan kredit/kutipan yang semestinya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-024",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Teknik Pencarian",
    "pertanyaan": "Saat mencari informasi di mesin pencari (search engine), jika kita menggunakan tanda kutip untuk mengapit kata kunci (misal: \"pemanasan global\"), tujuan perintah tersebut adalah untuk...",
    "jawabanBenar": "Mencari halaman dengan susunan kata persis utuh",
    "pengecoh": [
      "Mencari gambar dan video berkaitan kata tersebut",
      "Mengecualikan kata tersebut dari hasil pencarian",
      "Mencari arti masing-masing kata di kamus"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Operator tanda kutip ganda (\"\") pada mesin pencari menginstruksikan sistem untuk melakukan pencarian frasa eksak (exact match) dengan urutan kata yang sama persis.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-025",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Dampak Sosial Teknologi",
    "pertanyaan": "Berkembangnya e-commerce memberikan banyak kemudahan berbelanja dari rumah dan memperluas pasar bagi UMKM. Namun, di sisi lain hal ini juga menimbulkan dampak sosial negatif bagi sektor ekonomi tradisional, yaitu...",
    "jawabanBenar": "Toko fisik yang tidak beradaptasi kehilangan pembeli",
    "pengecoh": [
      "Bertambahnya pabrik manufaktur di setiap desa",
      "Meningkatnya lowongan kasir supermarket besar",
      "Kualitas barang di pasar menjadi palsu"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Disrupsi teknologi (seperti e-commerce) mengubah perilaku konsumen, menyebabkan sektor konvensional yang gagal melakukan transformasi digital (seperti mal atau toko fisik) kehilangan omzet.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-026",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Algoritma Perulangan",
    "pertanyaan": "Perhatikan algoritma berikut ini:\n1. Tetapkan nilai X = 1\n2. Ulangi proses berikut selama X kurang dari 5:\n   a. Cetak nilai X\n   b. Tambah nilai X dengan 2\nApa output yang akan dicetak oleh algoritma tersebut ke layar dari awal hingga selesai?",
    "jawabanBenar": "1, 3",
    "pengecoh": [
      "1, 2, 3, 4",
      "1, 3, 5",
      "3, 5"
    ],
    "difficulty": "HARD",
    "explanation": "Langkah pertama: X=1. Karena 1<5, ia mencetak '1'. Kemudian X+2 menjadikan X=3. Loop kedua: Karena 3<5, ia mencetak '3'. X+2 menjadikan X=5. Loop ketiga: kondisi X<5 (5<5) menjadi SALAH, sehingga iterasi berhenti. Output akhir: 1 dan 3.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-027",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Pemecahan Masalah Komputasional",
    "pertanyaan": "Sebuah robot pembersih dirancang untuk bergerak di atas kotak-kotak grid. Perintah yang diketahuinya hanya: MAJU (1 kotak), KIRI (berputar 90 derajat ke kiri di tempat), KANAN (berputar 90 derajat ke kanan di tempat). Saat ini robot menghadap ke arah Utara. Untuk mencapai tempat sampah yang posisinya berada 2 kotak di Utara dan 1 kotak di Timur dari posisinya sekarang, urutan perintah algoritma yang paling efisien adalah...",
    "jawabanBenar": "MAJU, MAJU, KANAN, MAJU",
    "pengecoh": [
      "MAJU, KIRI, MAJU, KANAN",
      "KANAN, MAJU, KIRI, MAJU, MAJU",
      "MAJU, MAJU, KIRI, MAJU"
    ],
    "difficulty": "HARD",
    "explanation": "Robot sudah menghadap Utara. MAJU, MAJU akan membawanya 2 kotak ke Utara. Lalu untuk menuju ke Timur, robot berputar 90 derajat ke KANAN. Terakhir MAJU 1 kotak untuk mencapai posisi akhir (1 Timur, 2 Utara).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-028",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Analisis Data (Kondisi)",
    "pertanyaan": "Sebuah sistem pendaftaran menyeleksi siswa dengan aturan logika komputer menggunakan operator boolean. Syarat lolos adalah: (Nilai Matematika > 80) OR (Nilai Bahasa Inggris > 80). Siapa di antara siswa berikut yang datanya akan ditolak atau TIDAK lolos?",
    "jawabanBenar": "Siswa B: Matematika 75, Bahasa Inggris 80",
    "pengecoh": [
      "Siswa A: Matematika 85, Bahasa Inggris 70",
      "Siswa C: Matematika 90, Bahasa Inggris 90",
      "Siswa D: Matematika 80, Bahasa Inggris 85"
    ],
    "difficulty": "HARD",
    "explanation": "Operator OR (Atau) mewajibkan setidaknya salah satu kondisi bernilai Benar agar hasilnya Lolos. Pada Siswa B, Math (75>80) adalah Salah, dan Ing (80>80) adalah Salah (karena 80 tidak lebih besar dari 80). Karena Salah OR Salah, ia tidak lolos.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-029",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Kriptografi",
    "pertanyaan": "Metode enkripsi Caesar Cipher (Sandi Caesar) membedakan dan menyandikan setiap huruf dengan menggesernya sejumlah posisi tertentu secara alfabetis. Jika kata 'BUKU' dienkripsi menggunakan pergeseran 1 huruf ke kanan (A menjadi B, B menjadi C, dan seterusnya), maka hasil enkripsinya (ciphertext) adalah...",
    "jawabanBenar": "CVLV",
    "pengecoh": [
      "ATJT",
      "CUKV",
      "DWMW"
    ],
    "difficulty": "HARD",
    "explanation": "Menggeser huruf sebanyak 1 posisi maju di alfabet: B maju 1 -> C. U maju 1 -> V. K maju 1 -> L. U maju 1 -> V. Maka kata sandinya adalah CVLV.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-INF-030",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Informatika",
    "topik": "Sequencing Logika",
    "pertanyaan": "Anda diminta merancang algoritma untuk mengecek apakah sebuah bilangan bulat positif bersifat genap atau ganjil. Susunlah urutan langkah yang paling tepat!\n1. Jika sisa bagi adalah 0, maka cetak 'Genap'.\n2. Minta program membaca sebuah bilangan dari masukan pengguna.\n3. Jika sisa bagi bukan 0, maka cetak 'Ganjil'.\n4. Bagi bilangan tersebut dengan angka 2 dan hitung sisa baginya (operasi modulo).",
    "jawabanBenar": "2 - 4 - 1 - 3",
    "pengecoh": [
      "1 - 3 - 2 - 4",
      "2 - 1 - 3 - 4",
      "4 - 2 - 1 - 3"
    ],
    "difficulty": "HARD",
    "explanation": "Urutan algoritmik: Program harus menerima input (2), kemudian memproses perhitungan matematisnya (4), mengevaluasi hasil kondisional pertama (1), lalu mengevaluasi kondisional lainnya (3).",
    "challengeType": "SEQUENCE"
  },
  {
    "id": "FD-PJOK-001",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Pemanasan dan Pendinginan",
    "pertanyaan": "Sebelum memulai aktivitas olahraga inti, kita wajib melakukan pemanasan (warm-up). Tujuan utama dari pemanasan adalah...",
    "jawabanBenar": "Meningkatkan suhu tubuh dan menyiapkan otot",
    "pengecoh": [
      "Mengurangi cairan tubuh agar cepat berkeringat",
      "Membuat tubuh lelah sebelum pertandingan dimulai",
      "Meningkatkan massa otot secara instan"
    ],
    "difficulty": "EASY",
    "explanation": "Pemanasan bertujuan meningkatkan aliran darah, suhu tubuh, dan elastisitas otot sehingga mengurangi risiko cedera saat melakukan gerakan inti yang lebih berat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-002",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Pemanasan dan Pendinginan",
    "pertanyaan": "Setelah selesai berolahraga, sangat disarankan untuk melakukan pendinginan (cool-down). Manfaat utama pendinginan adalah...",
    "jawabanBenar": "Mengembalikan detak jantung ke kondisi normal",
    "pengecoh": [
      "Menghentikan produksi keringat secara drastis",
      "Menambah kecepatan lari pada sesi berikutnya",
      "Menghilangkan rasa haus tanpa minum air"
    ],
    "difficulty": "EASY",
    "explanation": "Pendinginan membantu tubuh transisi dari aktivitas fisik berat kembali ke kondisi istirahat dengan menormalkan detak jantung dan mencegah darah berkumpul di otot bawah (blood pooling).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-003",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Permainan Bola Besar",
    "pertanyaan": "Dalam permainan bola basket, teknik memantulkan bola ke lantai sambil berjalan atau berlari disebut...",
    "jawabanBenar": "Dribbling",
    "pengecoh": [
      "Passing",
      "Shooting",
      "Rebound"
    ],
    "difficulty": "EASY",
    "explanation": "Dribbling adalah teknik dasar membawa bola basket dengan cara memantulkannya ke lantai.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-004",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Permainan Bola Besar",
    "pertanyaan": "Dalam permainan sepak bola, untuk memberikan umpan jarak dekat yang akurat kepada teman satu tim, bagian kaki yang paling efektif digunakan adalah...",
    "jawabanBenar": "Kaki bagian dalam",
    "pengecoh": [
      "Ujung jari kaki (sepatu)",
      "Kaki bagian luar",
      "Tumit kaki"
    ],
    "difficulty": "EASY",
    "explanation": "Menendang (passing) menggunakan kaki bagian dalam memberikan kontrol dan akurasi yang paling baik untuk operan jarak dekat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-005",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Permainan Bola Besar",
    "pertanyaan": "Saat melakukan servis bawah dalam permainan bola voli, posisi awal salah satu kaki yang benar adalah...",
    "jawabanBenar": "Satu kaki melangkah ke depan (kuda-kuda)",
    "pengecoh": [
      "Kedua kaki dirapatkan sejajar",
      "Satu kaki diangkat tinggi-tinggi",
      "Kedua kaki disilangkan di belakang"
    ],
    "difficulty": "EASY",
    "explanation": "Sikap kuda-kuda dengan satu kaki di depan memberikan keseimbangan dan daya dorong (transfer berat badan) saat tangan memukul bola voli dari bawah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-006",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Permainan Bola Kecil",
    "pertanyaan": "Dalam permainan bulu tangkis, pukulan yang dilakukan dengan keras, tajam, dan menukik ke arah lapangan lawan dengan tujuan mematikan langkah lawan disebut...",
    "jawabanBenar": "Smash",
    "pengecoh": [
      "Lob",
      "Dropshot",
      "Drive"
    ],
    "difficulty": "EASY",
    "explanation": "Smash adalah pukulan serangan utama dalam bulu tangkis yang lintasannya menukik tajam dan cepat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-007",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Atletik",
    "pertanyaan": "Pada lomba lari jarak pendek (sprint), jenis start yang digunakan oleh para pelari adalah...",
    "jawabanBenar": "Start jongkok",
    "pengecoh": [
      "Start berdiri",
      "Start melayang",
      "Start melompat"
    ],
    "difficulty": "EASY",
    "explanation": "Start jongkok (crouch start) menggunakan balok start (starting block) untuk memberikan daya tolak maksimal di awal lari jarak pendek.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-008",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Pencegahan Cedera",
    "pertanyaan": "Jika temanmu mengalami cedera pergelangan kaki (keseleo/sprain) saat bermain basket, langkah pertolongan pertama yang paling aman (prinsip RICE) adalah...",
    "jawabanBenar": "Mengistirahatkan kaki dan mengompresnya dengan es",
    "pengecoh": [
      "Mengoleskan balsem panas dan memijatnya keras",
      "Memaksanya terus berjalan agar tidak kaku",
      "Merendam kaki ke dalam air mendidih"
    ],
    "difficulty": "EASY",
    "explanation": "Prinsip RICE (Rest, Ice, Compression, Elevation) adalah standar emas cedera akut. Kompres es mengurangi peradangan/pembengkakan; sebaliknya, memijat/kompres panas pada luka baru akan memperparah bengkak.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-009",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Kebugaran Jasmani",
    "pertanyaan": "Latihan push-up secara rutin sangat baik untuk meningkatkan komponen kebugaran jasmani, khususnya...",
    "jawabanBenar": "Kekuatan otot lengan dan dada",
    "pengecoh": [
      "Kelenturan otot punggung",
      "Kecepatan lari kaki",
      "Daya tahan paru-paru (kardiovaskular)"
    ],
    "difficulty": "EASY",
    "explanation": "Push-up adalah latihan beban tubuh (bodyweight) yang berfokus pada kekuatan dan daya tahan otot bagian atas, terutama dada (pektoralis), bahu, dan lengan (trisep).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-010",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Gizi dan Hidrasi",
    "pertanyaan": "Siswa SMP disarankan minum air putih yang cukup sebelum, selama, dan sesudah berolahraga. Fungsi utama minum air saat berolahraga adalah untuk...",
    "jawabanBenar": "Mencegah dehidrasi dan mengganti cairan tubuh",
    "pengecoh": [
      "Meningkatkan berat badan agar tenaga besar",
      "Mencegah perut terasa lapar",
      "Menurunkan kadar oksigen dalam darah"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Aktivitas fisik mengeluarkan cairan dan elektrolit lewat keringat. Rehidrasi mencegah penurunan performa akibat dehidrasi dan menjaga regulasi suhu tubuh.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-011",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Latihan Kelenturan",
    "pertanyaan": "Latihan peregangan statis (menahan regangan selama 10-15 detik) sebaiknya dilakukan saat...",
    "jawabanBenar": "Fase pendinginan setelah olahraga inti",
    "pengecoh": [
      "Tengah malam sebelum tidur",
      "Fase inti pertandingan bola basket",
      "Saat sedang berlari sprint"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Peregangan statis sangat aman dan efektif pada fase pendinginan karena otot sudah hangat, membantu memanjangkan kembali serat otot yang berkontraksi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-012",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Kebugaran Jasmani",
    "pertanyaan": "Lari lintas alam (jogging di lingkungan sekitar) atau lari 12 menit merupakan bentuk latihan yang difokuskan untuk melatih...",
    "jawabanBenar": "Daya tahan jantung dan paru-paru",
    "pengecoh": [
      "Kekuatan otot jari tangan",
      "Kelenturan persendian panggul",
      "Kecepatan reaksi mata"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Lari dengan durasi lama (aerobik) melatih sistem pernapasan dan sirkulasi darah agar jantung dan paru-paru bekerja lebih efisien (kardiovaskular/daya tahan).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-013",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Permainan Bola Besar",
    "pertanyaan": "Saat menerima bola keras (smash) dari lawan dalam bola voli, teknik pertahanan yang paling tepat dan aman digunakan adalah...",
    "jawabanBenar": "Passing bawah (dig) merapatkan kedua lengan",
    "pengecoh": [
      "Passing atas menggunakan ujung-ujung jari",
      "Menendang bola menggunakan kaki",
      "Menghindari bola dan membiarkannya jatuh"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Passing bawah dengan kedua lengan (forearm pass/dig) adalah teknik paling stabil dan tidak berisiko cedera jari saat menerima bola yang melaju sangat cepat/keras.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-014",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Permainan Bola Kecil",
    "pertanyaan": "Cara memegang raket bulu tangkis yang benar seperti posisi bersalaman (berjabat tangan) disebut pegangan...",
    "jawabanBenar": "Forehand grip",
    "pengecoh": [
      "Backhand grip",
      "Penhold grip",
      "American grip"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Forehand grip atau shakehand grip adalah cara memegang dasar di mana telapak tangan berada pada bagian lebar gagang raket seperti orang berjabat tangan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-015",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Atletik",
    "pertanyaan": "Dalam olahraga lompat jauh, gerakan menolakkan salah satu kaki terkuat pada papan tolak untuk mendapatkan dorongan ke atas dan ke depan disebut fase...",
    "jawabanBenar": "Tumpuan (Take-off)",
    "pengecoh": [
      "Awalan (Run-up)",
      "Melayang (Flight)",
      "Mendarat (Landing)"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Fase tumpuan/tolakan adalah titik krusial di mana energi lari (kinetik horisontal) diubah menjadi lompatan (vertikal-horisontal) dengan menggunakan satu kaki terkuat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-016",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Aktivitas Senam",
    "pertanyaan": "Sikap dasar yang benar saat melakukan gerakan roll depan (guling ke depan) pada senam lantai adalah...",
    "jawabanBenar": "Dagu merapat ke dada, tengkuk menyentuh matras",
    "pengecoh": [
      "Kepala mendongak, dahi menyentuh matras",
      "Kaki diluruskan kaku sejak awal",
      "Mata terpejam, tubuh dijatuhkan ke samping"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Menempelkan dagu ke dada (tuck) melindungi tulang leher dari cedera, memastikan bagian tengkuk/pundak belakang yang menjadi titik tumpu putaran, bukan puncak kepala.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-017",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Renang",
    "pertanyaan": "Gaya renang yang gerakannya paling mirip dengan cara katak berenang (kedua lengan ditarik bersamaan, kedua kaki menendang ke samping-belakang) adalah...",
    "jawabanBenar": "Gaya dada",
    "pengecoh": [
      "Gaya bebas",
      "Gaya punggung",
      "Gaya kupu-kupu"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Gaya dada (breaststroke) populer disebut gaya katak karena mekanisme gerak tendangan tungkai dan tarikan lengan yang sinkron menyerupai katak.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-018",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Pola Hidup Aktif",
    "pertanyaan": "Untuk menjaga kesehatan dan kebugaran pada remaja (usia SMP), Organisasi Kesehatan Dunia (WHO) merekomendasikan aktivitas fisik sedang hingga berat minimal selama...",
    "jawabanBenar": "60 menit (1 jam) setiap hari",
    "pengecoh": [
      "10 menit setiap minggu",
      "3 jam tanpa henti setiap hari",
      "Hanya saat pelajaran PJOK saja"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Rekomendasi global untuk remaja (5-17 tahun) adalah setidaknya 60 menit per hari aktivitas fisik moderate-to-vigorous, mencakup bermain, olahraga, atau transportasi aktif.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-019",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Kesehatan Diri",
    "pertanyaan": "Setelah berolahraga dan berkeringat banyak, pakaian olahraga yang basah sebaiknya segera diganti. Alasan utamanya dari segi kesehatan adalah...",
    "jawabanBenar": "Mencegah pertumbuhan jamur dan bakteri",
    "pengecoh": [
      "Agar pakaian olahraga tidak cepat pudar",
      "Supaya tubuh merasa kepanasan lebih lama",
      "Hanya untuk mematuhi peraturan sekolah"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Keringat menciptakan lingkungan lembap dan hangat yang merupakan tempat ideal bagi jamur (seperti panu/kurap) dan bakteri penyebab bau badan untuk berkembang biak.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-020",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan Olahraga",
    "pertanyaan": "Saat melakukan olahraga di luar ruangan (outdoor) pada siang hari yang terik, siswa mulai merasa pusing, mual, dan sangat haus. Hal ini merupakan gejala awal dari...",
    "jawabanBenar": "Kelelahan panas (Heat exhaustion) atau dehidrasi",
    "pengecoh": [
      "Peningkatan massa otot lengan",
      "Cedera otot robek (strain)",
      "Patah tulang ringan"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Paparan panas dan kurang cairan menyebabkan heat exhaustion. Tindakan yang harus diambil adalah berhenti, berteduh, dan rehidrasi perlahan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-021",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Aktivitas Ritmik",
    "pertanyaan": "Dalam senam irama (ritmik), penyelarasan (sinkronisasi) antara gerakan tubuh dengan hitungan/ketukan musik berfungsi untuk...",
    "jawabanBenar": "Meningkatkan estetika, keteraturan, dan keseimbangan gerakan",
    "pengecoh": [
      "Mengurangi jumlah kalori yang terbakar",
      "Membuat tubuh cepat merasa lelah",
      "Menghilangkan kebutuhan akan pemanasan"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Inti dari senam ritmik adalah harmonisasi gerakan biomekanik dengan irama, yang melatih koordinasi motorik sekaligus menonjolkan nilai keindahan/estetika senam.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-022",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Bela Diri (Pencak Silat)",
    "pertanyaan": "Fungsi utama sikap pasang dalam olahraga bela diri pencak silat adalah...",
    "jawabanBenar": "Sikap siaga untuk pembelaan maupun serangan",
    "pengecoh": [
      "Cara memberikan penghormatan kepada wasit",
      "Sikap beristirahat di tengah pertandingan",
      "Gerakan pemanasan pergelangan tangan saja"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sikap pasang adalah sikap kesiagaan taktis dan teknis dengan penempatan posisi kaki dan tangan yang optimal, siap bereaksi (menyerang atau bertahan).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-023",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Kebugaran Jasmani (Kelincahan)",
    "pertanyaan": "Latihan lari zig-zag atau lari bolak-balik (shuttle run) sangat efektif untuk meningkatkan kelincahan (agility). Kelincahan dalam olahraga dapat diartikan sebagai...",
    "jawabanBenar": "Mengubah arah tubuh cepat tanpa hilang keseimbangan",
    "pengecoh": [
      "Berlari lintasan lurus dengan kecepatan konstan",
      "Mengangkat beban maksimal di tempat",
      "Meregangkan otot punggung sejauh mungkin"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kelincahan (agility) berbeda dengan kecepatan (speed). Kelincahan menitikberatkan pada akselerasi, deselerasi, dan perubahan arah yang cepat sambil tetap terkontrol keseimbangannya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-024",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Kesehatan Mental",
    "pertanyaan": "Selain bermanfaat bagi fisik, olahraga yang dilakukan secara rutin juga sangat baik untuk kesehatan mental remaja, karena saat berolahraga tubuh memproduksi hormon endorfin yang berfungsi untuk...",
    "jawabanBenar": "Mengurangi stres dan menciptakan perasaan bahagia",
    "pengecoh": [
      "Meningkatkan rasa kantuk berlebih di pagi hari",
      "Membuat seseorang mudah marah pada teman",
      "Menghentikan kerja otak saat berkonsentrasi belajar"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Aktivitas fisik memicu pelepasan endorfin di otak, yaitu zat kimia alami penghilang rasa sakit dan pembangkit suasana hati (mood), yang efektif mencegah stres dan depresi ringan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-025",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Biomekanika Olahraga Dasar",
    "pertanyaan": "Saat melakukan awalan lompat jauh, pelari secara bertahap meningkatkan kecepatannya dari garis start hingga papan tolak. Prinsip fisika (biomekanika) yang menjelaskan hal ini adalah...",
    "jawabanBenar": "Memaksimalkan momentum yang diubah menjadi jarak lompatan",
    "pengecoh": [
      "Menghemat tenaga saat mendarat di pasir",
      "Menghindari gesekan udara agar tubuh ringan",
      "Membiasakan kaki tidak menyentuh papan tolak"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Semakin besar kecepatan horisontal (momentum) saat lari, semakin besar pula resultan gaya tolak yang bisa dihasilkan untuk melayang jauh ke depan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-026",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Analisis Pengambilan Keputusan",
    "pertanyaan": "Dalam pertandingan sepak bola, tim Anda sedang tertinggal 1-0 dan waktu tersisa 3 menit. Teman Anda terkena kram otot yang parah di tengah lapangan. Sebagai pemain yang memahami nilai keselamatan dan sportivitas (fair play), tindakan prioritas Anda adalah...",
    "jawabanBenar": "Membuang bola keluar agar medis dapat menolong",
    "pengecoh": [
      "Meninggalkan teman untuk menyamakan kedudukan",
      "Memarahi teman karena merusak strategi tim",
      "Meminta waktu dihentikan lalu pulang ke rumah"
    ],
    "difficulty": "HARD",
    "explanation": "Keselamatan fisik pemain dan nilai-nilai kemanusiaan (fair play) selalu menjadi prioritas tertinggi melebihi hasil akhir pertandingan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-027",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Kebugaran Jasmani (Latihan Kekuatan)",
    "pertanyaan": "Budi ingin memperkuat otot inti (core) bagian perut dan punggung bawahnya agar postur tubuhnya lebih tegak. Susunlah urutan prosedur melakukan gerakan 'Plank' dasar yang benar dan aman!\n1. Tahan posisi tubuh tetap lurus seperti papan selama 30 detik.\n2. Posisikan siku di lantai sejajar di bawah bahu.\n3. Angkat pinggul hingga tubuh membentuk garis lurus dari kepala hingga tumit.\n4. Mulai dengan posisi tengkurap di atas matras.",
    "jawabanBenar": "4 - 2 - 3 - 1",
    "pengecoh": [
      "1 - 4 - 2 - 3",
      "2 - 4 - 3 - 1",
      "4 - 3 - 2 - 1"
    ],
    "difficulty": "HARD",
    "explanation": "Prosedur plank: persiapan (4), menempatkan titik tumpu bahu (2), mengangkat badan meluruskan tubuh (3), dan menahannya (1).",
    "challengeType": "SEQUENCE"
  },
  {
    "id": "FD-PJOK-028",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Pencegahan Cedera & Latihan",
    "pertanyaan": "Seorang siswa mengeluh sering mengalami nyeri pada punggung bawah setelah berlatih angkat beban (dumbell). Analisis penyebab paling logis dari keluhan tersebut yang berkaitan dengan teknik latihan adalah...",
    "jawabanBenar": "Mengangkat beban dengan postur tulang belakang melengkung",
    "pengecoh": [
      "Siswa terlalu banyak minum sebelum mengangkat beban",
      "Beban yang diangkat terbuat dari bahan plastik",
      "Siswa bernapas melalui hidung saat mengangkat beban"
    ],
    "difficulty": "HARD",
    "explanation": "Postur melengkung (round back) saat mengangkat benda memberikan tekanan berlebih pada diskus tulang belakang (L4-L5). Otot inti harus dikunci (bracing) dan punggung tetap lurus netral untuk keamanan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-029",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Analisis Permainan Bola Basket",
    "pertanyaan": "Dalam bola basket, saat tim lawan melakukan penjagaan ketat perorangan (man-to-man defense) satu lawan satu, strategi pergerakan tanpa bola (off-the-ball movement) yang paling efektif untuk memecah pertahanan tersebut adalah...",
    "jawabanBenar": "Melakukan gerakan memotong (cutting) membebaskan teman",
    "pengecoh": [
      "Semua pemain berdiri diam menunggu bola",
      "Semua pemain berkumpul berdesakan di bawah ring",
      "Berlari lambat dalam formasi satu baris"
    ],
    "difficulty": "HARD",
    "explanation": "Pertahanan man-to-man sangat rentan terhadap screen/pick-and-roll dan backdoor cut cepat, karena hal ini memaksa bek untuk berpindah penjagaan (switch) yang sering memicu celah keterlambatan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-PJOK-030",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "PJOK",
    "topik": "Hidrasi dan Fisiologi Tubuh",
    "pertanyaan": "Setelah berlari mengelilingi lapangan selama 15 menit, wajah Budi memerah dan keringatnya mengucur deras. Mekanisme pengeluaran keringat tersebut secara biologis berfungsi untuk...",
    "jawabanBenar": "Menurunkan suhu inti tubuh melalui penguapan",
    "pengecoh": [
      "Membuang cadangan lemak melalui pori-pori",
      "Meningkatkan suhu tubuh agar tahan dingin",
      "Menambah volume sel darah di otot lengan"
    ],
    "difficulty": "HARD",
    "explanation": "Keringat adalah mekanisme termoregulasi. Saat air keringat menguap dari permukaan kulit, panas dari tubuh dibawa ke udara bebas, sehingga suhu inti tubuh tetap stabil.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-001",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Unsur Seni Rupa",
    "pertanyaan": "Unsur dasar seni rupa yang terbentuk dari gabungan titik-titik yang bersambung dan memiliki dimensi memanjang adalah...",
    "jawabanBenar": "Garis",
    "pengecoh": [
      "Bidang",
      "Bentuk",
      "Ruang"
    ],
    "difficulty": "EASY",
    "explanation": "Garis adalah unsur seni rupa yang paling mendasar, terbentuk dari rangkaian titik yang memanjang dan memiliki arah serta sifat tertentu.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-002",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Warna (Seni Rupa)",
    "pertanyaan": "Pencampuran warna primer merah dan kuning dengan perbandingan yang sama akan menghasilkan warna sekunder, yaitu...",
    "jawabanBenar": "Jingga (Oranye)",
    "pengecoh": [
      "Hijau",
      "Ungu",
      "Cokelat"
    ],
    "difficulty": "EASY",
    "explanation": "Dalam teori warna pigmen, merah + kuning = jingga/oranye; biru + kuning = hijau; merah + biru = ungu.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-003",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Seni Rupa Terapan",
    "pertanyaan": "Karya seni rupa yang dibuat dengan tujuan utama untuk memenuhi fungsi praktis (kegunaan sehari-hari) selain juga memiliki nilai estetis disebut...",
    "jawabanBenar": "Seni Rupa Terapan (Applied Art)",
    "pengecoh": [
      "Seni Rupa Murni (Fine Art)",
      "Seni Instalasi",
      "Seni Lukis Abstrak"
    ],
    "difficulty": "EASY",
    "explanation": "Seni terapan (applied art) mengutamakan fungsi pakai (contoh: kursi, pakaian, cangkir kriya) dibandingkan hanya fungsi keindahan semata.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-004",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Unsur Musik (Tempo)",
    "pertanyaan": "Istilah dalam musik yang digunakan untuk menunjukkan cepat atau lambatnya sebuah lagu dinyanyikan adalah...",
    "jawabanBenar": "Tempo",
    "pengecoh": [
      "Dinamika",
      "Nada",
      "Irama"
    ],
    "difficulty": "EASY",
    "explanation": "Tempo adalah ukuran kecepatan birama lagu. Dinamika adalah keras-lembutnya nada, sedangkan irama adalah ketukan/ritme.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-005",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Unsur Musik (Dinamika)",
    "pertanyaan": "Tanda dinamika 'Forte' (simbol 'f') pada partitur musik memberikan instruksi kepada pemain musik atau penyanyi agar membunyikan nada secara...",
    "jawabanBenar": "Keras",
    "pengecoh": [
      "Lembut",
      "Cepat",
      "Lambat"
    ],
    "difficulty": "EASY",
    "explanation": "Forte berasal dari bahasa Italia yang berarti kuat atau keras. (Piano = lembut).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-006",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Ansambel Musik",
    "pertanyaan": "Sajian musik yang dimainkan oleh sekelompok orang secara bersama-sama menggunakan berbagai jenis alat musik (seperti gitar, pianika, dan rekorder) disebut...",
    "jawabanBenar": "Musik Ansambel Campuran",
    "pengecoh": [
      "Musik Ansambel Sejenis",
      "Paduan Suara (Koor)",
      "Vokal Grup"
    ],
    "difficulty": "EASY",
    "explanation": "Ansambel campuran menggunakan beberapa jenis alat musik yang berbeda. Ansambel sejenis menggunakan satu jenis alat musik yang sama (misal: ansambel rekorder semua).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-007",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Pola Lantai (Seni Tari)",
    "pertanyaan": "Garis imajiner yang dilalui oleh penari saat melakukan gerak tari di atas panggung disebut...",
    "jawabanBenar": "Pola Lantai",
    "pengecoh": [
      "Level Gerak",
      "Ruang Tari",
      "Desain Atas"
    ],
    "difficulty": "EASY",
    "explanation": "Pola lantai adalah formasi atau garis lintasan yang dilalui penari (misalnya lurus, melengkung, zig-zag) untuk memperindah pertunjukan tari.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-008",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Tari Tradisional",
    "pertanyaan": "Dalam seni tari tradisional Indonesia, properti tari memiliki peran penting. Properti yang biasa digunakan pada Tari Piring dari Sumatra Barat adalah...",
    "jawabanBenar": "Piring",
    "pengecoh": [
      "Selendang",
      "Kipas",
      "Payung"
    ],
    "difficulty": "EASY",
    "explanation": "Sesuai namanya, Tari Piring menggunakan piring sebagai properti utama yang digenggam dan diayunkan penari tanpa terjatuh.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-009",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Ekspresi Teater",
    "pertanyaan": "Kemampuan seorang aktor untuk mengubah raut wajah agar sesuai dengan perasaan atau emosi tokoh yang diperankannya disebut...",
    "jawabanBenar": "Mimik muka (Ekspresi wajah)",
    "pengecoh": [
      "Pantomim",
      "Bloking",
      "Artikulasi"
    ],
    "difficulty": "EASY",
    "explanation": "Mimik adalah perubahan raut muka. Pantomim adalah seni tanpa kata, bloking adalah pengaturan posisi panggung, dan artikulasi adalah kejelasan pengucapan kata.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-010",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Prinsip Seni Rupa (Proporsi)",
    "pertanyaan": "Saat menggambar bentuk tubuh manusia, Budi membuat ukuran kepala yang terlalu besar sehingga tidak seimbang dengan ukuran badannya. Kesalahan Budi melanggar prinsip seni rupa, yaitu...",
    "jawabanBenar": "Proporsi (Kesebandingan)",
    "pengecoh": [
      "Irama (Ritme)",
      "Kesatuan (Unity)",
      "Pusat Perhatian (Center of Interest)"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Proporsi adalah prinsip yang mengatur perbandingan ukuran yang ideal dan harmonis antar bagian dalam satu kesatuan karya (misalnya ukuran kepala dibanding badan).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-011",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Seni Lukis (Teknik)",
    "pertanyaan": "Teknik melukis menggunakan cat air dengan sapuan warna yang tipis sehingga menghasilkan warna yang transparan atau tembus pandang disebut teknik...",
    "jawabanBenar": "Aquarel",
    "pengecoh": [
      "Plakat",
      "Pointilis",
      "Impasto"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Teknik aquarel menggunakan cat air dengan sapuan tipis (transparan). Teknik plakat menggunakan cat kental yang menutup/pekat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-012",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Seni Patung",
    "pertanyaan": "Membuat patung dengan cara mengurangi bahan sedikit demi sedikit menggunakan alat pahat (misalnya pada bahan kayu atau batu) disebut teknik...",
    "jawabanBenar": "Pahat / Ukir",
    "pengecoh": [
      "Butsir",
      "Cor (Casting)",
      "Cetak (Molding)"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Teknik pahat bersifat subtraktif (mengurangi bahan keras). Butsir dilakukan pada bahan lunak (tanah liat) dengan mengurangi dan menambah.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-013",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Unsur Tari (Waktu/Tempo)",
    "pertanyaan": "Seorang penari melakukan gerakan melompat dengan cepat, kemudian tiba-tiba berhenti dan bergerak sangat lambat. Elemen dasar tari yang sedang diolah oleh penari tersebut adalah unsur...",
    "jawabanBenar": "Waktu (Tempo/Irama gerak)",
    "pengecoh": [
      "Ruang",
      "Tenaga",
      "Properti"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Cepat-lambatnya (ritme/tempo) gerakan berkaitan dengan unsur Waktu. Ruang berkaitan dengan volume/besaran gerak, sedangkan Tenaga berkaitan dengan kuat-lemahnya gerak.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-014",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Seni Tari (Level)",
    "pertanyaan": "Gerakan tari Kecak dari Bali yang didominasi oleh para penari laki-laki yang duduk bersila melingkar sambil mengangkat tangan, merupakan contoh eksplorasi gerak tari pada level...",
    "jawabanBenar": "Level Rendah",
    "pengecoh": [
      "Level Sedang",
      "Level Tinggi",
      "Level Vertikal"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Level rendah pada tari dilakukan menyentuh lantai (duduk, rebah). Level sedang dilakukan sambil berdiri merendah/menekuk. Level tinggi melompat/jinjit.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-015",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Musik Tradisional",
    "pertanyaan": "Alat musik angklung dari Jawa Barat membedakan tinggi rendah nada berdasarkan...",
    "jawabanBenar": "Ukuran tabung bambu yang digoyangkan",
    "pengecoh": [
      "Ketebalan senar yang dipetik",
      "Kekerasan pukulan selaput kulit membran",
      "Panjang pendek lubang tiup ditutup"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Angklung adalah alat musik idiofon (sumber bunyi dari badannya sendiri). Tabung bambu yang lebih besar menghasilkan nada lebih rendah, dan tabung kecil menghasilkan nada tinggi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-016",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Bentuk Musik",
    "pertanyaan": "Dalam paduan suara (koor), pengelompokan suara wanita dewasa yang memiliki wilayah nada paling tinggi disebut...",
    "jawabanBenar": "Sopran",
    "pengecoh": [
      "Alto",
      "Tenor",
      "Bass"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sopran (wanita tinggi), Alto (wanita rendah), Tenor (pria tinggi), dan Bass (pria rendah).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-017",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Teater (Tata Panggung)",
    "pertanyaan": "Penataan benda-benda di atas panggung pementasan teater, seperti kursi pajangan, meja usang, dan lampu gantung untuk menciptakan suasana ruang tamu kuno, menjadi tanggung jawab seorang penata...",
    "jawabanBenar": "Panggung (Setting/Scenery)",
    "pengecoh": [
      "Rias dan Busana",
      "Cahaya (Lighting)",
      "Suara (Sound)"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Penata panggung (scenographer) bertugas menata ruang, properti dekoratif, dan latar panggung (setting) untuk membangun latar tempat/waktu pertunjukan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-018",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Teater (Karakterisasi)",
    "pertanyaan": "Dalam sebuah naskah drama, tokoh yang menjadi lawan dari tokoh utama (protagonis) dan selalu menimbulkan konflik atau halangan disebut tokoh...",
    "jawabanBenar": "Antagonis",
    "pengecoh": [
      "Tritagonis",
      "Figuran",
      "Sutradara"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Antagonis adalah karakter penentang utama. Protagonis adalah tokoh utama. Tritagonis adalah penengah/pendukung.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-019",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Apresiasi Seni Rupa",
    "pertanyaan": "Kritik seni rupa yang dilakukan dengan cara mendeskripsikan apa adanya tentang sebuah karya tanpa memberikan penilaian baik atau buruk disebut tahap...",
    "jawabanBenar": "Deskripsi",
    "pengecoh": [
      "Analisis Formal",
      "Interpretasi",
      "Evaluasi"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Tahapan kritik seni menurut Feldman: Deskripsi (mengamati apa adanya), Analisis (mengkaji komposisi unsur), Interpretasi (menafsirkan makna), dan Evaluasi (menilai kualitas).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-020",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Musik Tradisional",
    "pertanyaan": "Alat musik Sasando yang berasal dari Pulau Rote, Nusa Tenggara Timur, dimainkan dengan cara...",
    "jawabanBenar": "Dipetik",
    "pengecoh": [
      "Ditiup",
      "Dipukul",
      "Digesek"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Sasando adalah instrumen dawai berdawai tradisional (kordofon) dari NTT yang dimainkan dengan cara dipetik (plucked).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-021",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Harmoni (Seni Rupa)",
    "pertanyaan": "Penerapan prinsip kesatuan (unity) dalam sebuah lukisan pemandangan bertujuan untuk...",
    "jawabanBenar": "Menciptakan hubungan padu dan saling mendukung antar unsur",
    "pengecoh": [
      "Membuat bagian tengah lukisan terlihat lebih mencolok",
      "Memberikan kesan gelap terang tiba-tiba tanpa gradasi",
      "Memastikan semua objek lukisan memiliki ukuran persis"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Unity (Kesatuan) membuat elemen-elemen yang berbeda (garis, warna, bentuk) terikat harmonis dan menyatu menjadi satu karya yang kohesif.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-022",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Pameran (Seni Rupa)",
    "pertanyaan": "Susunlah tahapan perencanaan pameran seni rupa kelas di sekolah secara logis!\n1. Menentukan tema pameran.\n2. Mengumpulkan dan menyeleksi karya seni siswa.\n3. Membentuk panitia pameran.\n4. Menata ruang dan memajang karya pameran.",
    "jawabanBenar": "3 - 1 - 2 - 4",
    "pengecoh": [
      "1 - 2 - 3 - 4",
      "2 - 3 - 1 - 4",
      "3 - 2 - 1 - 4"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Prosedur event: Bentuk panitia (3), tentukan tema/konsep bersama panitia (1), kumpulkan karya (2), lalu display di lokasi pameran (4).",
    "challengeType": "SEQUENCE"
  },
  {
    "id": "FD-SENI-023",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Seni Teater (Improvisasi)",
    "pertanyaan": "Di tengah pertunjukan drama, seorang aktor tiba-tiba lupa dialognya. Lawan mainnya dengan cepat merespons dengan dialog baru yang spontan namun tetap masuk akal dan menyelamatkan alur cerita. Teknik spontanitas ini dalam teater disebut...",
    "jawabanBenar": "Improvisasi",
    "pengecoh": [
      "Gladi bersih",
      "Observasi",
      "Pantomim"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Improvisasi adalah akting atau dialog spontan yang dilakukan tanpa naskah atau persiapan sebelumnya, sering digunakan untuk menutupi kesalahan saat pementasan langsung.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-024",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Seni Tari (Tari Kreasi)",
    "pertanyaan": "Tari kreasi baru merupakan pengembangan dari tari tradisional. Karakteristik utama dari tari kreasi baru adalah...",
    "jawabanBenar": "Tidak terikat ketat pada aturan baku tari tradisional",
    "pengecoh": [
      "Hanya boleh menggunakan iringan musik pop mancanegara",
      "Tidak memperbolehkan penggunaan pola lantai sama sekali",
      "Pakaian penari harus meniru budaya Eropa masa lalu"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Tari kreasi membebaskan koreografer dari aturan adat (pakem) yang kaku pada tari klasik/tradisional, memberikan ruang inovasi pada gerak, musik, dan kostum.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-025",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Analisis Desain (Seni Rupa)",
    "pertanyaan": "Sebuah poster layanan masyarakat ditata dengan teks yang sangat kecil, warna teks kuning terang di atas latar belakang putih, dan ilustrasi yang bertumpuk-tumpuk. Analisis desain yang paling tepat untuk mengkritik poster tersebut adalah...",
    "jawabanBenar": "Gagal secara fungsi karena kontras warna yang rendah",
    "pengecoh": [
      "Sangat berhasil karena warna kuning dan putih bersih",
      "Melanggar aturan hak cipta karena menggunakan ilustrasi",
      "Terlalu tradisional untuk diterapkan di zaman modern"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kritik desain (seni terapan) berfokus pada fungsi. Teks kecil dengan kontras buruk (kuning di atas putih) melanggar prinsip kejelasan (legibility).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-026",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Analisis Pertunjukan (Teater)",
    "pertanyaan": "Seorang sutradara mementaskan drama tentang kemiskinan di sebuah desa kecil. Untuk memperkuat ironi dan pesan emosionalnya, sang sutradara menggunakan tata lampu (lighting) redup kebiruan dengan iringan musik instrumental bertempo sangat lambat dan sunyi. Interpretasi paling logis dari keputusan artistik tersebut adalah untuk menciptakan atmosfer yang...",
    "jawabanBenar": "Muram, sepi, dan penuh penderitaan",
    "pengecoh": [
      "Gembira, meriah, dan penuh harapan",
      "Mencekam, horor, dan mengancam jiwa",
      "Mewah, elegan, dan penuh kekayaan"
    ],
    "difficulty": "HARD",
    "explanation": "Lampu redup kebiruan (cool tone) dipadu musik lambat/sunyi adalah bahasa panggung universal untuk kesedihan, kemuraman, dan kesepian (melankolis).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-027",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Apresiasi Musik (Harmoni)",
    "pertanyaan": "Dalam aransemen paduan suara SATB (Sopran, Alto, Tenor, Bass), apabila kelompok Sopran dan Tenor bernyanyi sangat keras (Forte) sementara melodi utamanya sebenarnya berada di kelompok Alto yang bernyanyi pelan, maka yang akan terjadi pada karya musik tersebut adalah...",
    "jawabanBenar": "Kehilangan keseimbangan musikal, melodi utama tertutup suara pengiring",
    "pengecoh": [
      "Harmoni terdengar jauh lebih indah dan dramatis",
      "Suara Bass otomatis berubah menjadi melodi utama",
      "Lagu akan secara otomatis bertambah temponya cepat"
    ],
    "difficulty": "HARD",
    "explanation": "Keseimbangan (balance) dalam ansambel/koor sangat penting. Jika suara pengiring (Sopran/Tenor dalam kasus ini) terlalu dominan (Forte), melodi utama di Alto akan tenggelam (overpowered).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-028",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Analisis Karya Tari",
    "pertanyaan": "Tari Saman dari Aceh dilakukan dengan posisi duduk bersimpuh, bahu-membahu, dan gerakan tangan yang menepuk dada atau paha secara cepat dan sinkron tanpa iringan instrumen musik eksternal (mengandalkan nyanyian dan tepukan penari). Kesimpulan koreografis yang tepat mengenai karakteristik tari ini adalah...",
    "jawabanBenar": "Mengutamakan kekompakan ritmis internal dan formasi baris rapat",
    "pengecoh": [
      "Mengandalkan eksplorasi ruang luas dengan lompatan tinggi",
      "Sangat bergantung pada melodi gamelan jawa kompleks",
      "Memiliki desain gerak asimetris dan individualistik"
    ],
    "difficulty": "HARD",
    "explanation": "Analisis gerak Saman: tidak ada instrumen luar (musik internal), tidak ada lompatan/ruang luas (karena duduk bersimpuh dalam barisan lurus), sangat bergantung pada kekompakan ritme.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-029",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Perspektif dan Ruang (Seni Rupa)",
    "pertanyaan": "Dalam menggambar bentuk pemandangan jalan raya yang lurus ke depan dengan tiang listrik di pinggir jalan, hukum perspektif optik satu titik hilang mensyaratkan bahwa...",
    "jawabanBenar": "Semakin jauh tiang listrik, digambar semakin kecil menyempit",
    "pengecoh": [
      "Semua tiang listrik harus digambar sama persis ukurannya",
      "Tiang listrik kejauhan digambar lebih besar karena pembiasan",
      "Jalan raya digambar semakin melebar mendekati garis cakrawala"
    ],
    "difficulty": "HARD",
    "explanation": "Prinsip perspektif linear: benda yang ukurannya sama di dunia nyata, akan tampak semakin kecil (diminishing scale) dan menyatu di titik hilang (vanishing point) saat jaraknya semakin jauh dari pengamat.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-SENI-030",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Seni Budaya",
    "topik": "Apresiasi Seni Kriya",
    "pertanyaan": "Batik motif Megamendung dari Cirebon memiliki bentuk awan berarak dengan gradasi warna tegas. Secara filosofis dan historis, pola awan pada batik ini merupakan bukti nyata adanya pengaruh akulturasi dengan kebudayaan...",
    "jawabanBenar": "Tiongkok (China)",
    "pengecoh": [
      "India (Hindu-Buddha)",
      "Timur Tengah (Arab)",
      "Eropa (Belanda)"
    ],
    "difficulty": "HARD",
    "explanation": "Motif awan (Megamendung) di Cirebon dipengaruhi kuat oleh motif awan pada seni rupa dan keramik Tiongkok (akulturasi budaya karena posisi Cirebon sebagai bandar perdagangan pesisir).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-001",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "OSIS mendata keikutsertaan eskul 100 siswa menggunakan tabel berisi Nama, Kelas, dan Eskul Pilihan. Untuk memudahkan mencari daftar siswa yang khusus mengikuti eskul Basket, tindakan komputasional pengolahan data yang paling efisien adalah...",
    "jawabanBenar": "Menyaring atau mengurutkan data pada kolom Eskul",
    "pengecoh": [
      "Membaca daftar nama siswa secara berulang",
      "Menghapus semua data siswa dari memori",
      "Membuat tabel baru untuk setiap siswa"
    ],
    "difficulty": "EASY",
    "explanation": "Pengelolaan data dalam berpikir komputasional menekankan efisiensi; fungsi filter atau sort adalah cara sistematis dan cepat untuk mengelompokkan data spesifik.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-002",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Algoritma pada dasarnya adalah urutan langkah logis dan sistematis untuk memecahkan masalah. Dalam kehidupan sehari-hari, contoh penerapan algoritma yang paling tepat adalah...",
    "jawabanBenar": "Mengikuti langkah resep memasak dari awal",
    "pengecoh": [
      "Menggambar bebas di kertas tanpa tujuan",
      "Berbicara spontan saat menceritakan dongeng",
      "Memilih baju secara acak dari lemari"
    ],
    "difficulty": "EASY",
    "explanation": "Resep masakan merupakan contoh algoritma dunia nyata karena berisi serangkaian instruksi yang berurutan, sistematis, dan terstruktur untuk mencapai hasil akhir.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-003",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Saat merencanakan acara Pentas Seni sekolah yang sangat kompleks, ketua panitia memecah pekerjaan besar tersebut menjadi beberapa divisi kecil: divisi acara, divisi publikasi, divisi perlengkapan, dan divisi konsumsi. Dalam berpikir komputasional, teknik memecahkan masalah ini disebut...",
    "jawabanBenar": "Dekomposisi",
    "pengecoh": [
      "Pengenalan Pola",
      "Abstraksi",
      "Desain Algoritma"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Dekomposisi adalah proses memecah suatu masalah yang besar dan kompleks menjadi sub-masalah yang lebih kecil agar lebih mudah dikelola dan diselesaikan secara paralel.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-004",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Dalam sebuah program kasir kantin, terdapat instruksi logika (percabangan): 'JIKA total belanja lebih dari Rp50.000, MAKA berikan diskon 10%, JIKA TIDAK, MAKA diskon 0%'. Apabila Budi berbelanja sebesar Rp45.000, apa yang akan dieksekusi oleh sistem?",
    "jawabanBenar": "Sistem menolak diskon karena syarat tidak terpenuhi",
    "pengecoh": [
      "Sistem memberi diskon karena harganya mendekati",
      "Sistem membatalkan transaksi karena uang kurang",
      "Sistem memberikan diskon secara acak"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Pada algoritma kondisional dasar (If-Else), komputer secara kaku mengevaluasi syarat batas. Rp45.000 tidak lebih dari Rp50.000, sehingga masuk ke blok JIKA TIDAK (Else).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-005",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Susunlah instruksi logika (sequence) peminjaman buku perpustakaan digital ini agar menjadi urutan sistematis yang berjalan dengan benar!\n1. Sistem mencatat buku tersebut sedang dipinjam dan mengurangi stok digital.\n2. Siswa berhasil login masuk ke aplikasi perpustakaan.\n3. Siswa mencari dan memilih judul buku yang diinginkan.\n4. Siswa mengklik tombol perintah 'Pinjam Buku'.",
    "jawabanBenar": "2 - 3 - 4 - 1",
    "pengecoh": [
      "3 - 2 - 4 - 1",
      "2 - 4 - 3 - 1",
      "1 - 2 - 3 - 4"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Urutan algoritmik dari sudut pandang alur proses: Autentikasi dulu (2), pencarian objek (3), eksekusi aksi (4), dan terakhir sistem merespons dengan memproses pembaruan database (1).",
    "challengeType": "SEQUENCE"
  },
  {
    "id": "FD-KKA-006",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Saat mendata tabel jadwal piket kelas yang berisi Hari dan Nama Siswa, sekretaris kelas tidak mencantumkan informasi golongan darah, hobi, atau alamat rumah siswa. Proses membuang atau mengabaikan detail informasi yang tidak relevan dengan tujuan penyelesaian masalah ini disebut...",
    "jawabanBenar": "Abstraksi",
    "pengecoh": [
      "Dekomposisi",
      "Evaluasi Data",
      "Debug Algoritma"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Abstraksi adalah teknik memilah dan hanya berfokus pada informasi utama yang penting (nama & hari) serta menyembunyikan atau membuang detail yang tidak relevan untuk jadwal piket.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-007",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Seorang siswa mengamati bahwa setiap kali cuaca mendung dan angin kencang di pagi hari, bus sekolah selalu datang terlambat sekitar 15 menit dari jadwal biasanya. Kemampuan komputasional siswa dalam menghubungkan kesamaan kejadian-kejadian ini disebut...",
    "jawabanBenar": "Pengenalan Pola",
    "pengecoh": [
      "Pengulangan Logika",
      "Penyandian Data",
      "Pembuatan Pseudocode"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Pengenalan pola adalah kemampuan mengenali kesamaan, tren, atau keteraturan dalam data maupun situasi (seperti hubungan cuaca dan keterlambatan) untuk membuat prediksi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-008",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Perhatikan aturan algoritma lampu penyeberangan (pelican crossing) berikut:\n1. Jika lampu jalan hijau menyala, mobil berjalan, pejalan kaki dilarang menyeberang.\n2. Jika lampu jalan kuning menyala, mobil bersiap berhenti, pejalan kaki dilarang menyeberang.\n3. Jika lampu jalan merah menyala, mobil berhenti, pejalan kaki dilarang menyeberang.\n\nJika diterapkan secara nyata, apa kesalahan logika (bug) fatal pada algoritma tersebut?",
    "jawabanBenar": "Langkah 3 menahan pejalan kaki menyeberang",
    "pengecoh": [
      "Langkah 1 salah, mobil harusnya berhenti",
      "Lampu kuning seharusnya dilewati dari algoritma",
      "Algoritma sudah benar dan aman"
    ],
    "difficulty": "HARD",
    "explanation": "Mengevaluasi (debugging) algoritma logika mensyaratkan pencarian instruksi yang tidak logis/tidak memenuhi tujuan. Aturan 3 gagal memberikan kondisi yang memperbolehkan pejalan kaki menyeberang, sehingga sistem tersebut gagal berfungsi secara total.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-009",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Dalam mengevaluasi informasi digital di internet, kita harus mampu membedakan antara fakta dan opini. Manakah dari pernyataan berikut yang merupakan sebuah FAkta?",
    "jawabanBenar": "Gempa magnitudo 5.0 terjadi hari Senin",
    "pengecoh": [
      "Cuaca pantai selatan indah setiap Senin",
      "Gempa bumi adalah bencana paling menakutkan",
      "Semua orang harus pindah dari pesisir"
    ],
    "difficulty": "EASY",
    "explanation": "Fakta adalah informasi yang objektif, memiliki bukti, dan dapat diukur/diuji kebenarannya (magnitudo, waktu, lokasi). Opini bersifat subjektif dan memuat pandangan pribadi.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-010",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Ketika mencari data kependudukan atau referensi sejarah menggunakan mesin pencari, kita dapat lebih memercayai informasi jika situs web tersebut berafiliasi dengan lembaga resmi yang ditandai dengan akhiran domain (URL)...",
    "jawabanBenar": ".edu, .ac.id, atau .go.id",
    "pengecoh": [
      ".com, .net, atau .biz",
      ".blogspot.com atau .wordpress.com",
      ".tv, .shop, atau .info"
    ],
    "difficulty": "EASY",
    "explanation": "Domain resmi pemerintah (.go.id/gov) atau institusi pendidikan (.edu/ac.id) memiliki kredibilitas dan kontrol kualitas (peer-review) informasi yang jauh lebih baik dibandingkan blog pribadi atau komersial.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-011",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Budi mengambil sebuah gambar ilustrasi yang bagus dari sebuah blog di internet, lalu menempelkannya di tugas presentasi sekolahnya. Agar tindakannya sesuai dengan etika digital, Budi wajib melakukan...",
    "jawabanBenar": "Atribusi (mencantumkan sumber atau nama pencipta)",
    "pengecoh": [
      "Mengubah warna agar terlihat buatan sendiri",
      "Mengaku menggambar ilustrasi tersebut semalaman",
      "Membayar uang sebagai biaya izin presentasi"
    ],
    "difficulty": "EASY",
    "explanation": "Etika digital mengharuskan kita menghargai Hak Kekayaan Intelektual (HAKI) karya orang lain dengan selalu memberikan kredit atau atribusi sumber secara jelas.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-012",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Sering membagikan foto kartu pelajar, nama lengkap ibu kandung, tiket pesawat (boarding pass), dan lokasi presisi rumah secara publik (oversharing) di media sosial sangat tidak dianjurkan. Risiko keamanan digital paling fatal dari hal ini adalah...",
    "jawabanBenar": "Pencurian identitas dan penipuan finansial",
    "pengecoh": [
      "Memori server penuh dan akun terhapus",
      "Akun otomatis berubah menjadi premium",
      "Perangkat smartphone rusak atau korsleting"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Oversharing data PII (Personally Identifiable Information) adalah gerbang utama bagi kejahatan siber berbasis social engineering dan pencurian identitas.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-013",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Pengurus OSIS ingin mengumumkan ringkasan laporan keuangan kegiatan yang panjang agar terlihat menarik, estetik, dan mudah dipahami siswa dalam satu kali usapan (swipe) layar di Instagram. Format konten digital apa yang paling efektif untuk memproduksi informasi ini?",
    "jawabanBenar": "Infografis",
    "pengecoh": [
      "Audio Podcast berdurasi satu jam",
      "Dokumen PDF sebanyak sepuluh halaman",
      "Video resolusi 4K berisi layar kosong"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Memilih perkakas produksi yang tepat (tool selection) adalah bagian literasi digital. Infografis menggabungkan data teks ringkas dengan visualisasi grafis untuk pemahaman data secara cepat di media sosial.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-014",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Sebuah pesan berantai (forward) di aplikasi chat mengklaim bahwa sebuah buah eksotis dapat menyembuhkan segala penyakit kritis dalam sehari. Ciri utama dari berita bohong (hoaks) pada pesan semacam ini biasanya ditandai dengan...",
    "jawabanBenar": "Judul sensasional tanpa sumber ahli medis",
    "pengecoh": [
      "Menyertakan kutipan resmi jurnal kedokteran",
      "Ditulis baku, tenang, dan tertata rapi",
      "Pengumuman resmi dari kepala sekolah"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Literasi informasi menuntut sikap kritis. Hoaks kesehatan biasanya bergantung pada manipulasi emosional (huruf kapital, ancaman, harapan palsu, dan desakan menyebarkan) tanpa verifikasi data.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-015",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Rina tidak sengaja merekam video temannya yang sedang terjatuh tersungkur di kantin. Meskipun video itu dianggap lucu, temannya terlihat sangat malu dan meminta Rina menghapusnya. Jika Rina tetap mengunggahnya ke TikTok demi mendapatkan 'likes', evaluasi dampak etika digital yang paling tepat dari tindakan tersebut adalah...",
    "jawabanBenar": "Pelanggaran etika berujung pada cyberbullying",
    "pengecoh": [
      "Konten komedi selalu kebal aturan etika",
      "Aman selama tidak menulis nama asli",
      "Dihargai sebagai karya jurnalistik dokumenter"
    ],
    "difficulty": "HARD",
    "explanation": "Tanggung jawab diseminasi konten meliputi perlindungan martabat (digital citizenship). Mengunggah konten yang merendahkan subjek meski tanpa niat jahat adalah bentuk pelanggaran privasi dan etika siber.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-016",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Sistem Kecerdasan Artifisial (AI) generatif mampu membalas pertanyaan kita seolah-olah seperti manusia karena sistem tersebut...",
    "jawabanBenar": "Dilatih membaca pola teks data besar",
    "pengecoh": [
      "Memiliki otak biologis di dalam komputer",
      "Langsung mengetahui segalanya sejak dihidupkan",
      "Memiliki ruh dan perasaan empati manusia"
    ],
    "difficulty": "EASY",
    "explanation": "Konsep dasar AI generatif (seperti LLM/chatbot) adalah pengenalan pola statistik matematis dari Big Data, bukan pemikiran atau kesadaran (consciousness).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-017",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Terkadang, sebuah aplikasi Kecerdasan Artifisial memberikan jawaban yang diketik dengan gaya bahasa sangat meyakinkan, namun secara faktual isinya fiktif atau sepenuhnya salah. Dalam dunia AI, fenomena ini disebut...",
    "jawabanBenar": "Halusinasi (Hallucination)",
    "pengecoh": [
      "Kloning suara (Voice Cloning)",
      "Verifikasi dua langkah (2FA)",
      "Virus Ransomware"
    ],
    "difficulty": "EASY",
    "explanation": "AI hallucination adalah keadaan ketika model menghasilkan informasi palsu namun menyajikannya dengan tingkat kepercayaan diri tekstual yang tinggi, sering menipu pengguna yang kurang kritis.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-018",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Meskipun sebuah sistem Kecerdasan Artifisial mampu memecahkan kode pemrograman atau meringkas 100 halaman buku dalam hitungan detik, ia tetap memiliki keterbatasan fundamental dibandingkan kecerdasan alami manusia, yaitu...",
    "jawabanBenar": "AI tidak memiliki empati dan moral",
    "pengecoh": [
      "AI tidak mampu menjumlahkan angka",
      "AI butuh bertahun-tahun untuk membalas",
      "AI tidak bisa disambungkan listrik"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Perbedaan utama (human vs AI) adalah bahwa AI tidak memiliki pemahaman moral (moral reasoning) dan kesadaran. AI hanya mengkalkulasi statistik data tanpa memahami dampak emosional atau etis di dunia nyata.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-019",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Andi menggunakan AI untuk menyusun kerangka makalah sejarah tanpa mengeceknya lagi. Saat dipresentasikan, makalahnya ternyata berisi sejarah tokoh fiktif yang tidak pernah ada (halusinasi AI). Siapa yang paling bertanggung jawab secara etis atas penyebaran informasi salah tersebut?",
    "jawabanBenar": "Andi wajib memverifikasi hasil kerja AI",
    "pengecoh": [
      "Program AI selalu disalahkan atas kesalahan",
      "Perusahaan AI tidak pernah memberi peringatan",
      "Guru sejarah memberi tugas terlalu sulit"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Prinsip etika 'Human-in-the-loop' menekankan bahwa manusia pemakai (user) menanggung tanggung jawab akhir dan otoritas (accountability) atas segala output buatan mesin yang ia sebarkan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-020",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Sebuah video yang beredar di media sosial menampilkan seorang tokoh masyarakat sedang mengucapkan ujaran kebencian, padahal tokoh tersebut tidak pernah mengatakannya. Video manipulatif tingkat tinggi yang dihasilkan oleh Kecerdasan Artifisial ini dikenal dengan istilah...",
    "jawabanBenar": "Deepfake",
    "pengecoh": [
      "Augmented Reality (AR)",
      "Virtual Reality (VR)",
      "Stop Motion Animation"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Deepfake adalah penggunaan AI (khususnya deep learning) untuk memanipulasi atau mengganti wajah dan suara seseorang dalam video sehingga tampak sangat realistis dan menipu.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-021",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Sebuah sistem AI penyeleksi beasiswa ternyata secara tidak adil selalu menolak siswa dari daerah tertentu. Setelah diteliti, sistem AI itu dilatih dengan data dari 10 tahun lalu di mana siswa daerah tersebut memang jarang mendaftar. Masalah kegagalan objektivitas AI ini disebut sebagai...",
    "jawabanBenar": "Bias Algoritma (AI Bias)",
    "pengecoh": [
      "Bug Visualisasi Data",
      "Halusinasi Geografis",
      "Kecerdasan Super (Superintelligence)"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Algorithmic Bias terjadi ketika AI menghasilkan keputusan diskriminatif, biasanya akibat data pelatihannya (training data) merefleksikan ketidaksetaraan historis atau dataset yang tidak seimbang.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-022",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Ketika kita membaca jawaban chatbot AI yang menjelaskan tentang rumus fisika, langkah berpikir komputasional tingkat lanjut apa yang harus kita lakukan sebagai evaluasi keamanan (safety) sebelum menggunakan rumus tersebut untuk ujian?",
    "jawabanBenar": "Lakukan verifikasi silang dengan buku resmi",
    "pengecoh": [
      "Menghafalnya karena AI tidak pernah salah",
      "Menyalin dan membagikan jawaban tanpa membacanya",
      "Mematikan komputer karena AI dilarang"
    ],
    "difficulty": "HARD",
    "explanation": "Karena risiko halusinasi, pengguna harus dilatih untuk mengevaluasi secara kritis output AI dan menjadikannya titik awal riset, bukan kebenaran absolut tanpa verifikasi silang (cross-check).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-023",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Dina merasa cemas dan menceritakan seluruh rahasia pribadinya (termasuk keluhan medis, foto kartu identitas, dan masalah keluarga) kepada aplikasi chatbot AI publik gratis agar mendapat saran. Mengapa hal ini sangat rentan secara keamanan dan privasi data?",
    "jawabanBenar": "Data sensitif berisiko terekspos di server",
    "pengecoh": [
      "AI otomatis menelepon orang tua Dina",
      "AI langsung mogok karena keluhan pribadi",
      "Diawasi langsung oleh dokter sungguhan"
    ],
    "difficulty": "HARD",
    "explanation": "Sistem AI komersial yang digunakan publik sering kali merekam log interaksi untuk peningkatan layanan. Memasukkan data PII atau sensitif ke dalam prompt adalah risiko privasi masif (data leakage).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-024",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Berdasarkan prinsip pengembangan KA dasar, jika kita ingin meminta aplikasi pembuat gambar (AI Image Generator) menghasilkan karya yang sangat sesuai dengan imajinasi kita, yang harus kita fokuskan adalah...",
    "jawabanBenar": "Menyusun prompt yang jelas dan spesifik",
    "pengecoh": [
      "Menulis satu kata pendek saja",
      "Memasukkan gambar kode biner pencarian",
      "Mematikan internet sebelum menekan tombol"
    ],
    "difficulty": "EASY",
    "explanation": "Kunci dari pemanfaatan AI generatif adalah rekayasa prompt (prompt engineering). Semakin spesifik detail yang diberikan pada input, semakin terarah output yang dihasilkan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-025",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Pemanfaatan model bahasa (Large Language Model) sangat bermanfaat dalam pendidikan SMP, asalkan digunakan untuk tujuan yang tepat. Manakah contoh pemanfaatan AI yang paling etis dan konstruktif bagi pelajar?",
    "jawabanBenar": "Meminta penjelasan sains dengan perumpamaan sederhana",
    "pengecoh": [
      "Menyuruh AI membuat seluruh karangan esai",
      "Menjawab soal ujian saat guru lengah",
      "Meretas sistem keamanan WiFi sekolah"
    ],
    "difficulty": "EASY",
    "explanation": "Pemanfaatan KA sebagai tutor atau asisten konsep abstrak meningkatkan pembelajaran (AI as a learning tool). Menyontek/plagiat mematikan proses berpikir kritis pelajar.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-026",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Siti ingin menggunakan AI untuk membantunya mendapatkan ide kampanye kebersihan sekolah. Manakah desain input (prompt) berikut yang secara struktural akan menghasilkan output paling relevan dan terarah?",
    "jawabanBenar": "Berikan 3 ide unik dan slogan",
    "pengecoh": [
      "Bagaimana cara membersihkan lingkungan sekolah?",
      "Buat kampanye menjaga kebersihan.",
      "Tuliskan semua hal tentang sampah."
    ],
    "difficulty": "MEDIUM",
    "explanation": "Prompting yang efektif memuat konteks (lingkungan sekolah, siswa SMP), kuantitas (3 ide), dan batasan format (sertakan slogan).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-027",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Dalam dunia pemrograman dan pemanfaatan sistem informasi, kita mengenal prinsip 'Garbage In, Garbage Out' (GIGO). Dalam konteks interaksi dengan AI (chatbot), prinsip ini berarti...",
    "jawabanBenar": "Input membingungkan menghasilkan output tidak bermutu",
    "pengecoh": [
      "AI otomatis membuang file memori sampah",
      "Gunakan huruf kapital untuk menghindari sampah",
      "Kata rumit menyebabkan perangkat keras terbakar"
    ],
    "difficulty": "MEDIUM",
    "explanation": "GIGO adalah konsep ilmu komputer fundamental yang berlaku kuat di ranah GenAI: kualitas output AI berbanding lurus dengan kejelasan dan kualitas prompt (input) pengguna.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-028",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Guru menugaskan siswa membuat cerita pendek dengan tema pelestarian hutan. Anton menggunakan bantuan AI teks untuk membangun ide. Agar tetap mengasah kreativitas dan orisinalitasnya, langkah paling kritis yang harus dilakukan Anton setelah menerima teks dari AI adalah...",
    "jawabanBenar": "Gunakan sebagai inspirasi lalu tulis ulang",
    "pengecoh": [
      "Langsung mencetak teks tanpa membacanya",
      "Mengklaim karya tersebut ciptaan dari nol",
      "Menyalin tanpa mengubah satu huruf pun"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Penggunaan alat berbasis AI yang bermakna adalah sebagai 'co-pilot' atau sarana brainstorming, namun pemrosesan kognitif akhir dan identitas karya (authorship) harus tetap milik manusia.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FD-KKA-029",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Susunlah tahapan alur (sequence) yang beretika dalam memanfaatkan AI generatif teks untuk membantu penyusunan draf awal pidato sekolah!\n1. Membaca dengan saksama seluruh teks draf yang dihasilkan oleh sistem AI.\n2. Menyusun pertanyaan atau instruksi (prompt) yang jelas dan memiliki konteks spesifik.\n3. Melakukan finalisasi, merevisi gaya bahasa, dan memverifikasi kebenaran klaim faktualnya.\n4. Memasukkan instruksi tersebut ke antarmuka AI dan menunggu sistem memproses output.",
    "jawabanBenar": "2 - 4 - 1 - 3",
    "pengecoh": [
      "1 - 2 - 4 - 3",
      "4 - 2 - 3 - 1",
      "2 - 1 - 4 - 3"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Tahapan menggunakan GenAI: Merancang prompt (2), Mengeksekusi (4), Menganalisis output kasar (1), dan Pengeditan/Verifikasi (human oversight) (3).",
    "challengeType": "SEQUENCE"
  },
  {
    "id": "FD-KKA-030",
    "jenjang": "SMP",
    "kelasAtauFase": "Fase D",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Sinta meminta AI membuatkan jadwal belajar persiapan ujian selama seminggu. Output yang dihasilkan ternyata mengharuskan Sinta belajar nonstop tanpa istirahat siang. Untuk merevisi (refine) perilaku AI agar solusinya lebih manusiawi, prompt lanjutan mana yang memiliki desain instruksi komputasional paling efektif?",
    "jawabanBenar": "Tolong revisi jadwal dengan menambah istirahat",
    "pengecoh": [
      "Jadwalmu membuatku pusing, perbaiki sedikit.",
      "Manusia butuh tidur dan makan.",
      "Hapus jadwal matematika tanpa terkecuali."
    ],
    "difficulty": "HARD",
    "explanation": "Refining (iterasi) prompt membutuhkan penyelesaian masalah secara dekomposisi: memberi batasan spesifik (constraints) berupa parameter kuantitatif (jeda 15 menit per 60 menit, kosongkan Minggu pagi) agar model AI menyesuaikan struktur data secara matematis dan logis.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-001",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Susunlah urutan langkah-langkah (algoritma) yang logis untuk membuat teh manis hangat!\n1. Siapkan gelas kosong yang bersih.\n2. Masukkan kantong teh celup dan gula ke dalam gelas.\n3. Tuangkan air panas secukupnya ke dalam gelas.\n4. Aduk menggunakan sendok perlahan hingga gula larut.",
    "jawabanBenar": "1 - 2 - 3 - 4",
    "pengecoh": [
      "2 - 1 - 4 - 3",
      "3 - 1 - 2 - 4",
      "4 - 3 - 2 - 1"
    ],
    "difficulty": "EASY",
    "explanation": "Berpikir komputasional mensyaratkan urutan yang sistematis (sequence). Kita harus menyiapkan wadah (gelas) terlebih dahulu, memasukkan bahan, menambahkan air, lalu mengaduknya agar menjadi teh manis.",
    "challengeType": "SEQUENCE"
  },
  {
    "id": "FC-KKA-002",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Budi melihat pola warna lampu hias yang berkedip secara berurutan: Merah, Kuning, Hijau, Merah, Kuning, Hijau, Merah, Kuning... Warna lampu apa yang akan menyala selanjutnya?",
    "jawabanBenar": "Hijau",
    "pengecoh": [
      "Merah",
      "Kuning",
      "Biru"
    ],
    "difficulty": "EASY",
    "explanation": "Pengenalan pola (pattern recognition) adalah bagian dari berpikir komputasional. Polanya adalah Merah-Kuning-Hijau yang berulang. Setelah Kuning, lampu yang menyala adalah Hijau.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-003",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Saat membereskan kamar, Siti memasukkan semua boneka ke dalam keranjang A dan semua buku cerita ke dalam rak B. Proses penyelesaian masalah yang dilakukan Siti disebut...",
    "jawabanBenar": "Mengelompokkan benda berdasarkan jenis (klasifikasi)",
    "pengecoh": [
      "Menghancurkan benda agar muat",
      "Mencampur semua benda tanpa aturan",
      "Menyembunyikan benda dari pandangan"
    ],
    "difficulty": "EASY",
    "explanation": "Mengelompokkan data atau benda dengan karakteristik yang sama (boneka dengan boneka, buku dengan buku) adalah cara logis dan terstruktur untuk merapikan ruangan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-004",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Kamu sedang bermain robot mobil. Kamu ingin mobil itu bergerak lurus dua kotak, lalu berbelok ke kanan satu kali. Instruksi (kode) sederhana yang paling tepat kamu berikan adalah...",
    "jawabanBenar": "Maju, Maju, Belok Kanan",
    "pengecoh": [
      "Maju, Belok Kanan, Maju",
      "Belok Kanan, Maju, Maju",
      "Maju, Belok Kiri, Maju"
    ],
    "difficulty": "EASY",
    "explanation": "Instruksi harus jelas dan berurutan. Untuk bergerak lurus dua kotak lalu berbelok, urutannya harus Maju (langkah 1), Maju (langkah 2), lalu Belok Kanan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-005",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Rina ingin merayakan ulang tahun. Karena pekerjaannya sangat banyak, ia membaginya: Kakak memesan kue, Ibu mendekorasi ruangan, dan Rina membagikan undangan. Dalam berpikir komputasional, memecah tugas besar menjadi bagian kecil-kecil ini disebut...",
    "jawabanBenar": "Menguraikan masalah (Dekomposisi)",
    "pengecoh": [
      "Menemukan pola gambar",
      "Membuat prediksi cuaca",
      "Menulis huruf abjad"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Dekomposisi adalah teknik memecah masalah yang kompleks (pesta ulang tahun) menjadi bagian-bagian atau tugas yang lebih kecil agar lebih mudah diselesaikan.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-006",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Sebuah permainan komputer memiliki aturan logika: 'Jika pemain mengumpulkan 10 koin bintang, maka pemain akan naik level. Jika kurang dari 10, permainan berlanjut.' Jika kamu baru mengumpulkan 8 koin bintang, apa yang akan terjadi menurut aturan tersebut?",
    "jawabanBenar": "Permainan berlanjut di level yang sama",
    "pengecoh": [
      "Pemain langsung naik level",
      "Permainan tamat seketika (Game Over)",
      "Koin bintang direset menjadi nol"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Komputer bekerja sesuai kondisi (If-Else). Karena 8 koin kurang dari 10 koin, maka syarat pertama tidak terpenuhi, sehingga program menjalankan instruksi 'permainan berlanjut'.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-007",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Dito menulis instruksi cara mencuci tangan: (1) Nyalakan keran air, (2) Pakai sabun, (3) Keringkan tangan pakai handuk, (4) Bilas dengan air sampai bersih. Ada urutan yang keliru (bug) dalam instruksi tersebut, perbaikan yang tepat adalah...",
    "jawabanBenar": "Mengeringkan tangan (3) seharusnya setelah membilas (4)",
    "pengecoh": [
      "Nyalakan keran air (1) dilakukan paling akhir",
      "Pakai sabun (2) sebelum menyalakan keran air",
      "Bilas air (4) seharusnya dihapus dari daftar"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Debugging atau memperbaiki instruksi adalah bagian penting dari berpikir komputasional. Logikanya, kita tidak bisa mengeringkan tangan jika masih banyak sabun yang belum dibilas.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-008",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Berpikir Komputasional",
    "pertanyaan": "Di perpustakaan kelas, kamu diminta memisahkan majalah dari buku pelajaran, lalu menyusun buku pelajaran dari yang paling tipis ke paling tebal. Jika ada Majalah Anak, Buku Matematika (tebal), dan Buku Bahasa (tipis), bagaimana hasil akhir susunannya?",
    "jawabanBenar": "Majalah dipisah, lalu Buku Bahasa, kemudian Matematika",
    "pengecoh": [
      "Buku Matematika, Buku Bahasa, lalu Majalah",
      "Semuanya dicampur karena sama-sama bahan bacaan",
      "Majalah di antara Buku Bahasa dan Matematika"
    ],
    "difficulty": "HARD",
    "explanation": "Penyelesaian masalah ini membutuhkan dua tahap (multi-step): pertama mengelompokkan jenis (pisahkan majalah), kedua mengurutkan ketebalan (sorting tipis ke tebal pada buku pelajaran).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-009",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Data pribadi adalah informasi penting tentang diri kita yang tidak boleh disebarkan sembarangan di internet. Contoh data pribadi yang harus sangat dijaga rahasianya adalah...",
    "jawabanBenar": "Alamat rumah dan kata sandi akun kita",
    "pengecoh": [
      "Warna kesukaan dan nama kartun favorit",
      "Judul lagu yang sering kita dengarkan",
      "Negara dan benua tempat kita tinggal"
    ],
    "difficulty": "EASY",
    "explanation": "Alamat lengkap dan kata sandi adalah data privasi tingkat tinggi yang jika disebar dapat membahayakan keamanan fisik maupun akun digital kita.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-010",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Teknologi digital dan internet memiliki banyak manfaat jika digunakan dengan baik. Manfaat paling positif menggunakan internet bagi siswa kelas 6 SD adalah...",
    "jawabanBenar": "Mencari informasi edukasi untuk membantu tugas sekolah",
    "pengecoh": [
      "Bermain game online seharian tanpa henti",
      "Mengejek foto teman di media sosial",
      "Mengunduh aplikasi berbayar diam-diam dengan uang"
    ],
    "difficulty": "EASY",
    "explanation": "Literasi digital menekankan pemanfaatan teknologi untuk hal-hal yang edukatif, konstruktif, dan membantu proses belajar.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-011",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Saat menggunakan internet, tablet, atau komputer di rumah, aturan paling aman yang sebaiknya diterapkan oleh siswa SD adalah...",
    "jawabanBenar": "Didampingi dan diawasi orang tua saat berinternet",
    "pengecoh": [
      "Mengunci kamar agar tidak ketahuan",
      "Mengobrol dengan orang asing yang menjanjikan hadiah",
      "Mengeklik semua iklan berkedip di layar komputer"
    ],
    "difficulty": "EASY",
    "explanation": "Siswa usia SD masih rentan terhadap konten negatif atau penipuan di internet, sehingga pendampingan (parental guidance) sangat diwajibkan untuk keamanan digital.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-012",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Sebelum mengetik dan mengirim pesan ke grup kelas sekolah, hal pertama yang selalu harus kamu pikirkan adalah...",
    "jawabanBenar": "Apakah pesanku sopan dan tidak menyakiti teman?",
    "pengecoh": [
      "Apakah pesan ini menghabiskan kuota internet temanku?",
      "Berapa banyak stiker lucu yang bisa dikirim?",
      "Bagaimana caranya pamer dan terlihat paling hebat?"
    ],
    "difficulty": "EASY",
    "explanation": "Berpikir sebelum mengirim (Think before you post) adalah prinsip dasar etika komunikasi digital untuk mencegah cyberbullying dan kesalahpahaman.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-013",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Tiba-tiba kamu menerima pesan WhatsApp dari nomor tidak dikenal yang mengatakan kamu menang hadiah sepeda mahal. Tindakan paling aman dan cerdas adalah...",
    "jawabanBenar": "Abaikan pesan, jangan klik tautan, dan laporkan",
    "pengecoh": [
      "Langsung memberikan nomor rekening dan alamat rumah",
      "Mengirimkan pesan tersebut ke seluruh anggota keluarga",
      "Menelepon nomor tersebut agar hadiah cepat dikirim"
    ],
    "difficulty": "EASY",
    "explanation": "Pesan hadiah dari nomor tidak dikenal adalah ciri khas penipuan (phishing/scamming). Mengabaikan dan melaporkan ke orang dewasa adalah langkah pertahanan terbaik bagi anak-anak.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-014",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Andi sedang marah karena pensilnya hilang. Ia menulis pesan di grup kelas: \"SIAPA YANG MENGAMBIL PENSILKU?!\" Menggunakan huruf kapital besar semua dalam dunia digital dianggap sebagai perilaku...",
    "jawabanBenar": "Kurang sopan, huruf kapital sering diartikan berteriak",
    "pengecoh": [
      "Sangat baik, memudahkan teman membaca teks",
      "Keren, membuat teks terlihat lebih penting",
      "Biasa saja, internet tidak memiliki aturan kesopanan"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Netiquette (etika internet) mengatur bahwa penulisan huruf besar semua secara terus-menerus melambangkan teriakan (shouting) dan dianggap agresif.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-015",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Gurumu menugaskan pembuatan poster digital ajakan 'Gemar Membaca Buku'. Komponen konten digital yang paling tepat dan bermakna untuk dimasukkan ke dalam karyamu adalah...",
    "jawabanBenar": "Ilustrasi anak membaca buku dan kalimat ajakan",
    "pengecoh": [
      "Foto artis bermain film tanpa tulisan",
      "Video 30 menit tentang cara mencetak kertas",
      "Daftar nilai rapor seluruh siswa kelas 6"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Produksi konten digital (poster) membutuhkan pemilihan gambar dan teks (copywriting) yang langsung relevan dengan tema dan tujuan pesannya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-016",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi Digital",
    "pertanyaan": "Temanmu mengirimkan sebuah artikel mencurigakan yang berjudul \"Awas, Minum Air Putih Terlalu Banyak Bisa Membuat Tubuh Menjadi Balon!\". Sebagai anak yang melek digital (literat), apa tindakan pertamamu untuk memeriksa informasi (fakta/opini) tersebut?",
    "jawabanBenar": "Bertanya kepada orang dewasa atau mencari informasi",
    "pengecoh": [
      "Langsung percaya dan berhenti minum air putih",
      "Segera menyebarkan artikel ke media sosial",
      "Mengejek teman karena artikel tersebut dianggap sihir"
    ],
    "difficulty": "HARD",
    "explanation": "Mengenali dan memverifikasi informasi mencurigakan (hoaks) adalah inti literasi digital. Langkah terbaik di usia SD adalah cross-check ke sumber otoritas (orang tua/guru/situs resmi).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-017",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Secara sederhana, apa yang dimaksud dengan Kecerdasan Artifisial (AI) atau kecerdasan buatan?",
    "jawabanBenar": "Program komputer untuk meniru kecerdasan manusia",
    "pengecoh": [
      "Robot besi mainan yang bisa berjalan lambat",
      "Mesin ajaib yang menjawab tanpa diajari manusia",
      "Lampu lalu lintas yang berubah warna"
    ],
    "difficulty": "EASY",
    "explanation": "Kecerdasan Artifisial (AI) pada intinya adalah perangkat lunak (program komputer) buatan manusia yang dibuat agar mesin dapat mempelajari pola dan mengambil keputusan mirip manusia.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-018",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Tanpa kita sadari, teknologi AI sudah ada di sekitar kita. Contoh paling sederhana dari penggunaan Kecerdasan Artifisial di rumah adalah...",
    "jawabanBenar": "Fitur pembuka kunci layar mengenali pola wajah",
    "pengecoh": [
      "Kipas angin yang selalu menengok kanan-kiri",
      "Kompor gas yang mengeluarkan api biru",
      "Pintu lemari es yang bisa menutup sendiri"
    ],
    "difficulty": "EASY",
    "explanation": "Pengenalan wajah (Face Unlock/Recognition) adalah contoh nyata AI (Computer Vision) sehari-hari yang mengenali pola titik-titik pada wajah pemilik HP.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-019",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Meskipun komputer bisa berhitung sangat cepat, manusia memiliki kelebihan utama yang tidak akan pernah dimiliki oleh mesin cerdas (AI), yaitu...",
    "jawabanBenar": "Manusia memiliki perasaan, hati nurani, dan empati",
    "pengecoh": [
      "Manusia tidak pernah salah, mesin selalu salah",
      "Manusia menyimpan triliunan data tanpa pernah lupa",
      "Manusia tidak memerlukan energi untuk bekerja"
    ],
    "difficulty": "EASY",
    "explanation": "Perbedaan mendasar (human vs machine) adalah perasaan, moralitas, empati, dan kesadaran, yang tidak dimiliki oleh barisan kode program komputer mana pun.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-020",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Tujuan utama manusia menciptakan dan mengembangkan teknologi Kecerdasan Artifisial (AI) di dunia ini adalah untuk...",
    "jawabanBenar": "Membantu dan mempermudah pekerjaan manusia",
    "pengecoh": [
      "Menggantikan manusia agar tidak perlu belajar lagi",
      "Membuat mesin yang bisa memerintah manusia",
      "Menghabiskan listrik agar bumi menjadi gelap"
    ],
    "difficulty": "MEDIUM",
    "explanation": "AI dikembangkan sebagai alat bantu (co-pilot) yang efisien untuk membantu menyelesaikan masalah kompleks umat manusia, bukan untuk menguasai manusia.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-021",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Jika sebuah robot pembersih ruangan secara tidak sengaja menabrak pot bunga ibu hingga pecah, siapakah yang pada akhirnya harus bertanggung jawab secara etika atas kejadian itu?",
    "jawabanBenar": "Manusia pemiliknya, karena robot diprogram",
    "pengecoh": [
      "Robot itu sendiri harus dihukum",
      "Pabrik pot bunga karena potnya mudah pecah",
      "Tetangga rumah karena tidak menjaga rumah kita"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Dalam etika AI tingkat dasar, mesin/robot tidak memiliki 'moral agency' (tanggung jawab moral). Tanggung jawab atas dampak penggunaan alat selalu kembali kepada manusia penggunanya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-022",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Manusia mengenali benda di sekitarnya menggunakan panca indera seperti mata. Bagaimana cara robot atau aplikasi komputer \"melihat\" benda-benda di sekelilingnya?",
    "jawabanBenar": "Menggunakan sensor penglihatan seperti kamera digital",
    "pengecoh": [
      "Memiliki mata biologis kecil di balik layar",
      "Melihat dengan mendengarkan suara dari pengeras suara",
      "Langsung menebak tanpa menggunakan alat apa pun"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Mesin memahami dunia fisik menggunakan perangkat keras input, seperti kamera optik (sensor) untuk menerima gambar yang kemudian diolah datanya oleh komputer.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-023",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Literasi & Etika Kecerdasan Artifisial",
    "pertanyaan": "Andi menggunakan aplikasi pembuat cerita otomatis (AI) untuk mengerjakan tugas mengarang bahasa Indonesia, lalu menyerahkannya tanpa membacanya sama sekali. Secara etika pelajar, mengapa hal ini dianggap tidak benar?",
    "jawabanBenar": "Andi tidak jujur dan kehilangan proses belajar",
    "pengecoh": [
      "Tulisan komputer selalu lebih jelek dari manusia",
      "Aplikasi AI selalu meminta uang",
      "Guru lebih suka cerita fiksi tentang hewan"
    ],
    "difficulty": "HARD",
    "explanation": "Penggunaan AI secara etis di sekolah berarti menggunakan AI sebagai alat bantu belajar (inspirasi/asisten), bukan alat untuk berbuat curang (plagiasi) yang menghilangkan proses berpikir mandiri.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-024",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Kamu memprogram sebuah komputer cerdas untuk memisahkan kumpulan balok mainan menjadi dua keranjang. Komputer itu memasukkan balok merah ke Keranjang A dan balok biru ke Keranjang B. Proses yang dilakukan komputer ini disebut...",
    "jawabanBenar": "Klasifikasi (Pengelompokan) benda berdasarkan warna",
    "pengecoh": [
      "Menghitung jumlah balok terbanyak",
      "Mengubah semua warna balok menjadi merah",
      "Membuang semua balok agar keranjang rapi"
    ],
    "difficulty": "EASY",
    "explanation": "Klasifikasi adalah kemampuan sistem cerdas (dan manusia) untuk mengelompokkan data atau objek berdasarkan karakteristik tertentu, seperti warna, bentuk, atau ukuran.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-025",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Agar sebuah aplikasi kecerdasan buatan bisa membedakan mana foto buah Apel dan mana foto buah Jeruk, apa hal utama yang harus dilakukan manusia kepada aplikasi tersebut sebelumnya?",
    "jawabanBenar": "Melatih aplikasi dengan ratusan contoh foto buah",
    "pengecoh": [
      "Membiarkan aplikasi mencari tahu sendiri di kebun",
      "Menyemprotkan aroma buah ke layar komputer",
      "Mengetikkan kata \"Enak\" berulang-ulang ke aplikasi"
    ],
    "difficulty": "EASY",
    "explanation": "Machine Learning (pembelajaran mesin) membutuhkan data (foto contoh) agar sistem bisa mempelajari pola visual ciri-ciri khas apel (kulit halus, merah) dan jeruk (kulit berpori, oranye).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-026",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Sebuah aplikasi musik sering memutarkan lagu anak-anak bertema petualangan yang sangat kamu sukai, padahal kamu tidak pernah memintanya secara langsung. Aplikasi tersebut bisa melakukan hal itu berkat sistem...",
    "jawabanBenar": "Rekomendasi berdasarkan pola lagu yang sering didengarkan",
    "pengecoh": [
      "Mesin ajaib yang bisa membaca pikiranmu",
      "Tebakan acak yang kebetulan selalu benar",
      "Aplikasi diam-diam menyadap pembicaraanmu dengan orang tua"
    ],
    "difficulty": "EASY",
    "explanation": "Sistem Rekomendasi (Recommendation System) adalah bentuk AI yang mengenali pola kebiasaan pengguna dari data riwayat masa lalu (Input), untuk memprediksi dan memberikan saran yang cocok (Output).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-027",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Saat Budi berbicara ke ponselnya, \"Tolong nyalakan senter,\" lalu lampu kilat HP-nya menyala. Kalimat ucapan Budi dalam sistem komputer disebut sebagai...",
    "jawabanBenar": "Masukan (Input)",
    "pengecoh": [
      "Keluaran (Output)",
      "Proses (Processing)",
      "Penyimpanan (Storage)"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Dalam alur komputasi (Input -> Proses -> Output), perintah suara (suara Budi) adalah Input (masukan data), lalu AI memproses makna kalimat, dan lampu yang menyala adalah Output.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-028",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Siti meminta aplikasi AI pembuat gambar: \"Buatkan gambar kucing.\" Aplikasi itu menghasilkan gambar kucing biasa. Kemudian Siti mengubah permintaannya (Input): \"Buatkan gambar kucing lucu yang sedang memakai topi bajak laut di atas perahu.\" Apa yang akan terjadi pada Keluaran (Output) aplikasinya?",
    "jawabanBenar": "Keluaran berubah lebih detail sesuai permintaan baru",
    "pengecoh": [
      "Keluaran tetap kucing biasa",
      "Aplikasi meledak karena permintaan Siti terlalu panjang",
      "Komputer akan menghapus gambar kucing dari internet"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Menggambarkan prinsip utama AI generatif: perubahan pada masukan deskripsi (prompt/input) akan secara langsung mempengaruhi ketepatan dan detail hasil akhir (output).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-029",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Dito melatih sebuah aplikasi kamera AI hanya menggunakan foto-foto mobil sedan. Suatu hari, ia menghadapkan kamera itu ke sebuah Truk Gandeng berukuran besar. Aplikasi itu kemungkinan besar akan...",
    "jawabanBenar": "Salah menebak karena belum mempelajari data truk",
    "pengecoh": [
      "Sangat pintar mengenali semua jenis kendaraan",
      "Mengubah truk gandeng menjadi mobil sedan",
      "Menertawakan Dito karena memberikan ujian terlalu mudah"
    ],
    "difficulty": "MEDIUM",
    "explanation": "Kecerdasan buatan terbatas pada data yang diberikan kepadanya (data training). Jika ia tidak pernah dilatih mengenali truk, ia tidak akan memiliki memori pola untuk mengenalinya.",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-KKA-030",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Koding dan Kecerdasan Artifisial",
    "topik": "Pemanfaatan & Pengembangan KA",
    "pertanyaan": "Kamu memprogram AI sederhana dengan aturan: \"Jika benda itu berbentuk KOTAK, sebut itu BUKU. Jika benda itu BULAT, sebut itu BOLA.\" Jika kamu menunjukkan sebuah \"Kotak Pensil\" yang berbentuk kotak panjang ke kamera, apa hasil keluaran (output) mesin tersebut?",
    "jawabanBenar": "Menyebut BUKU karena terpaku pada pola KOTAK",
    "pengecoh": [
      "Menyebut KOTAK PENSIL karena tahu fungsinya",
      "Menyebut BOLA karena benda bisa menggelinding",
      "Marah dan menolak mengeluarkan suara"
    ],
    "difficulty": "MEDIUM",
    "explanation": "AI yang sederhana hanya mengikuti aturan pengenalan pola kaku (berdasarkan bentuk kotak = buku) tanpa bisa memahami konteks fungsi benda nyata secara utuh (tidak tahu itu tempat pensil).",
    "challengeType": "IDENTIFY"
  },
  {
    "id": "FC-MAT-001",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "FPB dan KPK",
    "pertanyaan": "Andi memiliki 24 buku dan 36 pensil. Ia ingin membagikannya kepada teman-temannya dalam jumlah yang sama banyak untuk setiap jenisnya. Paling banyak teman yang bisa menerima bagian tersebut adalah ... orang.",
    "jawabanBenar": "12",
    "pengecoh": [
      "6",
      "8",
      "24"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Mencari jumlah orang terbanyak berarti mencari FPB dari 24 dan 36. Faktor 24: 1, 2, 3, 4, 6, 8, 12, 24. Faktor 36: 1, 2, 3, 4, 6, 9, 12, 18, 36. FPB terbesar mereka adalah 12."
  },
  {
    "id": "FC-MAT-002",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "FPB dan KPK",
    "pertanyaan": "Budi berenang setiap 4 hari sekali dan Ali setiap 6 hari sekali. Jika hari ini mereka berenang bersama, mereka akan berenang bersama lagi setelah ... hari.",
    "jawabanBenar": "12",
    "pengecoh": [
      "10",
      "24",
      "2"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Mencari waktu pertemuan kembali berarti mencari KPK dari 4 dan 6. Kelipatan 4: 4, 8, 12, 16... Kelipatan 6: 6, 12, 18... KPK dari 4 dan 6 adalah 12."
  },
  {
    "id": "FC-MAT-003",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Operasi Hitung",
    "pertanyaan": "Siti membawa uang Rp50.000,00. Ia membeli 2 buah buku tulis yang masing-masing harganya Rp15.000,00. Sisa uang Siti adalah?",
    "jawabanBenar": "Rp20.000,00",
    "pengecoh": [
      "Rp15.000,00",
      "Rp30.000,00",
      "Rp35.000,00"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Total harga belanja = 2 x Rp15.000,00 = Rp30.000,00. Sisa uang = Rp50.000,00 - Rp30.000,00 = Rp20.000,00."
  },
  {
    "id": "FC-MAT-004",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Geometri Volume",
    "pertanyaan": "Sebuah bak penampungan air berbentuk balok memiliki volume 240 liter (dm³). Jika panjang bak adalah 8 dm dan lebarnya 6 dm, berapakah kedalaman (tinggi) bak tersebut?",
    "jawabanBenar": "5 dm",
    "pengecoh": [
      "4 dm",
      "10 dm",
      "20 dm"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Volume balok = panjang x lebar x tinggi. 240 = 8 x 6 x tinggi. 240 = 48 x tinggi. Tinggi = 240 dibagi 48 = 5 dm."
  },
  {
    "id": "FC-MAT-005",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Bilangan Bulat",
    "pertanyaan": "Suhu di dalam lemari es awalnya adalah -5°C. Setelah listrik padam beberapa saat, suhunya naik 8°C. Berapa suhu lemari es sekarang?",
    "jawabanBenar": "3°C",
    "pengecoh": [
      "13°C",
      "-13°C",
      "-3°C"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Suhu awal -5°C. Kata 'naik' berarti ditambah. -5 + 8 = 3. Jadi suhu sekarang adalah 3°C."
  },
  {
    "id": "FC-MAT-006",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Pecahan",
    "pertanyaan": "Ibu memiliki persediaan 1/2 kg tepung terigu. Kemudian Ibu membeli lagi 3/4 kg. Berapa total tepung terigu yang dimiliki Ibu?",
    "jawabanBenar": "1 1/4 kg",
    "pengecoh": [
      "4/6 kg",
      "1 1/2 kg",
      "3/8 kg"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "1/2 disamakan penyebutnya menjadi 2/4. 2/4 + 3/4 = 5/4. Pecahan 5/4 dapat diubah menjadi pecahan campuran 1 1/4."
  },
  {
    "id": "FC-MAT-007",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Pecahan",
    "pertanyaan": "Sebuah taman berbentuk persegi panjang memiliki panjang 2 1/2 meter dan lebar 1 1/5 meter. Berapa luas taman tersebut?",
    "jawabanBenar": "3 m²",
    "pengecoh": [
      "3 1/2 m²",
      "3 7/10 m²",
      "2 m²"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Ubah ke pecahan biasa: Luas = (5/2) x (6/5). (5x6)/(2x5) = 30/10 = 3 m²."
  },
  {
    "id": "FC-MAT-008",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Desimal",
    "pertanyaan": "Nina memiliki pita sepanjang 5,5 meter. Ia menggunakan pita tersebut sepanjang 2,25 meter untuk menghias kado. Sisa pita Nina adalah?",
    "jawabanBenar": "3,25 meter",
    "pengecoh": [
      "3,35 meter",
      "2,25 meter",
      "3,75 meter"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Lakukan pengurangan desimal secara bersusun dengan menyamakan koma. 5,50 - 2,25 = 3,25 meter."
  },
  {
    "id": "FC-MAT-009",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Persentase",
    "pertanyaan": "Sebuah tas harganya Rp100.000,00. Toko memberikan diskon sebesar 20%. Berapa uang yang harus dibayarkan untuk membeli tas tersebut?",
    "jawabanBenar": "Rp80.000,00",
    "pengecoh": [
      "Rp20.000,00",
      "Rp120.000,00",
      "Rp100.000,00"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Potongan harga = 20% dari 100.000 = Rp20.000. Harga akhir = 100.000 - 20.000 = Rp80.000."
  },
  {
    "id": "FC-MAT-010",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Persentase",
    "pertanyaan": "Budi berhasil menjawab benar 36 soal dari total 40 soal ujian. Berapa persentase jawaban benar Budi?",
    "jawabanBenar": "90%",
    "pengecoh": [
      "80%",
      "75%",
      "36%"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Persentase = (36 / 40) x 100%. Pecahan 36/40 bisa disederhanakan menjadi 9/10, yang sama dengan 90/100 atau 90%."
  },
  {
    "id": "FC-MAT-011",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Pecahan ke Desimal",
    "pertanyaan": "Bentuk desimal dari pecahan 3/4 adalah?",
    "jawabanBenar": "0,75",
    "pengecoh": [
      "0,34",
      "0,43",
      "0,50"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Pecahan 3/4 jika dikalikan 25/25 menjadi 75/100, yang dalam bentuk desimal ditulis 0,75."
  },
  {
    "id": "FC-MAT-012",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Perbandingan",
    "pertanyaan": "Perbandingan umur Ani dan umur Budi adalah 2 : 3. Jika jumlah umur mereka adalah 20 tahun, berapakah umur Budi?",
    "jawabanBenar": "12 tahun",
    "pengecoh": [
      "8 tahun",
      "10 tahun",
      "15 tahun"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Total perbandingan = 2 + 3 = 5. Umur Budi = (3 / 5) x 20 tahun = 12 tahun."
  },
  {
    "id": "FC-MAT-013",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Skala",
    "pertanyaan": "Jarak sebenarnya dua kota adalah 60 km. Jika sebuah peta menggunakan skala 1 : 1.200.000, maka jarak kedua kota tersebut pada peta adalah?",
    "jawabanBenar": "5 cm",
    "pengecoh": [
      "2 cm",
      "12 cm",
      "50 cm"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Ubah jarak ke cm: 60 km = 6.000.000 cm. Jarak peta = Jarak Sebenarnya / Skala = 6.000.000 / 1.200.000 = 5 cm."
  },
  {
    "id": "FC-MAT-014",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Perbandingan Kuantitas",
    "pertanyaan": "Untuk membuat 2 loyang kue, Ibu membutuhkan 4 butir telur. Jika Ibu ingin membuat 5 loyang kue, berapa butir telur yang dibutuhkan?",
    "jawabanBenar": "10 telur",
    "pengecoh": [
      "8 telur",
      "12 telur",
      "20 telur"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Satu loyang membutuhkan 4/2 = 2 butir telur. Untuk 5 loyang = 5 x 2 = 10 butir telur."
  },
  {
    "id": "FC-MAT-015",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Perbandingan Bertingkat",
    "pertanyaan": "Kelereng A berbanding B adalah 1 : 2. Kelereng B berbanding C adalah 3 : 4. Jika jumlah seluruh kelereng mereka 85 butir, berapakah banyak kelereng A?",
    "jawabanBenar": "15 butir",
    "pengecoh": [
      "30 butir",
      "40 butir",
      "20 butir"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Samakan rasio B: A:B = 3:6, B:C = 6:8. Rasio A:B:C = 3:6:8. Jumlah rasio = 3+6+8 = 17. Kelereng A = (3/17) x 85 = 15 butir."
  },
  {
    "id": "FC-MAT-016",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Pola Bilangan",
    "pertanyaan": "Perhatikan barisan bilangan berikut: 2, 5, 8, 11, ... Angka berikutnya dari pola tersebut adalah?",
    "jawabanBenar": "14",
    "pengecoh": [
      "13",
      "15",
      "12"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Pola bilangan selalu bertambah 3 (5-2=3, 8-5=3). Maka bilangan selanjutnya adalah 11 + 3 = 14."
  },
  {
    "id": "FC-MAT-017",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Pola Bilangan",
    "pertanyaan": "Riko menyusun batang korek api menjadi barisan segitiga. Pola susunannya membutuhkan batang: 3, 5, 7, 9, ... Berapa batang korek api yang dibutuhkan pada susunan ke-5?",
    "jawabanBenar": "11 batang",
    "pengecoh": [
      "10 batang",
      "12 batang",
      "13 batang"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Pola di atas selalu bertambah 2 batang setiap susunan berikutnya. Susunan ke-5 adalah 9 + 2 = 11."
  },
  {
    "id": "FC-MAT-018",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Aljabar",
    "pertanyaan": "Sebuah bilangan rahasia jika dikalikan 3 kemudian dikurangi 5, hasilnya adalah 16. Bilangan rahasia tersebut adalah?",
    "jawabanBenar": "7",
    "pengecoh": [
      "6",
      "8",
      "11"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Gunakan operasi hitung mundur. Tambahkan 5 ke 16 (16+5 = 21). Lalu bagi 3 (21/3 = 7). Bilangan itu adalah 7."
  },
  {
    "id": "FC-MAT-019",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Pengukuran Waktu",
    "pertanyaan": "Kereta api berangkat dari stasiun A pukul 08.45 dan tiba di stasiun B pukul 11.20. Berapa lama perjalanan kereta api tersebut?",
    "jawabanBenar": "2 jam 35 menit",
    "pengecoh": [
      "3 jam 35 menit",
      "2 jam 25 menit",
      "3 jam 25 menit"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Ubah 11.20 meminjam 1 jam menjadi 10.80. 10.80 dikurangi 08.45 sama dengan 02.35. Jadi perjalanannya memakan waktu 2 jam 35 menit."
  },
  {
    "id": "FC-MAT-020",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Pengukuran Waktu",
    "pertanyaan": "Budi belajar matematika selama 1 jam 15 menit, lalu istirahat 20 menit. Setelah itu, ia melanjutkan belajar IPA selama 50 menit. Jika Budi mulai belajar pada pukul 18.30, pukul berapakah ia selesai belajar?",
    "jawabanBenar": "Pukul 20.55",
    "pengecoh": [
      "Pukul 20.45",
      "Pukul 21.05",
      "Pukul 20.15"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Total waktu = 1 jam 15 menit + 20 menit + 50 menit = 1 jam 85 menit, atau sama dengan 2 jam 25 menit. Waktu selesai = 18.30 + 2 jam 25 menit = 20.55."
  },
  {
    "id": "FC-MAT-021",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Debit",
    "pertanyaan": "Air mengalir dari keran dengan debit 5 liter/menit. Berapa total volume air yang tertampung dalam ember jika keran dibuka selama setengah jam?",
    "jawabanBenar": "150 liter",
    "pengecoh": [
      "100 liter",
      "50 liter",
      "15 liter"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Setengah jam = 30 menit. Volume = Debit x Waktu = 5 x 30 = 150 liter."
  },
  {
    "id": "FC-MAT-022",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Konversi Satuan",
    "pertanyaan": "Hasil dari 2,5 kg + 300 gram sama dengan ... gram.",
    "jawabanBenar": "2.800 gram",
    "pengecoh": [
      "2.530 gram",
      "550 gram",
      "325 gram"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Ubah ke gram: 2,5 kg = 2.500 gram. Kemudian tambahkan: 2.500 + 300 = 2.800 gram."
  },
  {
    "id": "FC-MAT-023",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Geometri Bangun Datar",
    "pertanyaan": "Sebuah kebun berbentuk segitiga memiliki panjang alas 12 meter dan tinggi 8 meter. Berapakah luas kebun tersebut?",
    "jawabanBenar": "48 m²",
    "pengecoh": [
      "96 m²",
      "20 m²",
      "40 m²"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Luas segitiga = 1/2 x alas x tinggi = 1/2 x 12 x 8 = 6 x 8 = 48 meter persegi."
  },
  {
    "id": "FC-MAT-024",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Geometri",
    "pertanyaan": "Sebuah akuarium berbentuk balok memiliki panjang 50 cm, lebar 20 cm, dan tinggi 30 cm. Kapasitas (volume) maksimal akuarium tersebut dalam satuan liter adalah?",
    "jawabanBenar": "30 liter",
    "pengecoh": [
      "3.000 liter",
      "300 liter",
      "3 liter"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Volume = 50 x 20 x 30 = 30.000 cm³. Karena 1 liter = 1.000 cm³, maka 30.000 cm³ dibagi 1.000 = 30 liter."
  },
  {
    "id": "FC-MAT-025",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Geometri Bangun Datar",
    "pertanyaan": "Lahan Pak Ali berbentuk persegi panjang berukuran 15 m x 10 m. Di tengah lahan tersebut akan dibuat kolam berbentuk persegi dengan panjang sisi 4 m, dan sisa lahannya ditanami rumput. Berapakah luas lahan yang ditanami rumput?",
    "jawabanBenar": "134 m²",
    "pengecoh": [
      "146 m²",
      "150 m²",
      "166 m²"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Luas total = 15 x 10 = 150 m². Luas kolam = 4 x 4 = 16 m². Luas rumput = 150 - 16 = 134 m²."
  },
  {
    "id": "FC-MAT-026",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Geometri",
    "pertanyaan": "Bangun ruang yang memiliki tepat 6 buah sisi yang semuanya berbentuk persegi dengan ukuran sama besar disebut?",
    "jawabanBenar": "Kubus",
    "pengecoh": [
      "Balok",
      "Tabung",
      "Prisma segitiga"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Kubus adalah satu-satunya bangun ruang yang dibatasi oleh 6 buah sisi persegi yang identik/kongruen."
  },
  {
    "id": "FC-MAT-027",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Data",
    "pertanyaan": "Hasil ulangan harian matematika Edo adalah: 7, 8, 8, 9, 8. Rata-rata (mean) nilai ulangan Edo adalah?",
    "jawabanBenar": "8",
    "pengecoh": [
      "7",
      "9",
      "8,5"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Rata-rata = Jumlah semua nilai / Banyak data. (7+8+8+9+8) / 5 = 40 / 5 = 8."
  },
  {
    "id": "FC-MAT-028",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Data",
    "pertanyaan": "Tentukan nilai tengah (median) dari data umur sekelompok anak berikut: 6, 9, 7, 8, 6.",
    "jawabanBenar": "7",
    "pengecoh": [
      "6",
      "8",
      "7,5"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Untuk mencari median, data harus diurutkan terlebih dahulu dari terkecil: 6, 6, 7, 8, 9. Nilai yang persis berada di tengah (data ke-3) adalah 7."
  },
  {
    "id": "FC-MAT-029",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Data",
    "pertanyaan": "Data ukuran sepatu siswa adalah sebagai berikut: 36, 37, 36, 38, 36, 37. Modus dari data tersebut adalah?",
    "jawabanBenar": "36",
    "pengecoh": [
      "37",
      "38",
      "Tidak ada"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Modus adalah nilai yang paling sering muncul. Ukuran 36 muncul sebanyak 3 kali, paling banyak dibanding ukuran lain."
  },
  {
    "id": "FC-MAT-030",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Matematika",
    "topik": "Analisis Data",
    "pertanyaan": "Banyak siswa yang meminjam buku di perpustakaan selama 5 hari berturut-turut adalah: Senin 25 siswa, Selasa 30 siswa, Rabu 20 siswa, Kamis 35 siswa, dan Jumat. Jika rata-rata siswa yang meminjam per hari adalah 28 siswa, berapa banyak siswa yang meminjam pada hari Jumat?",
    "jawabanBenar": "30 siswa",
    "pengecoh": [
      "25 siswa",
      "28 siswa",
      "35 siswa"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Total siswa selama 5 hari = 28 x 5 = 140 siswa. Total 4 hari pertama = 25 + 30 + 20 + 35 = 110 siswa. Maka hari Jumat = 140 - 110 = 30 siswa."
  },
  {
    "id": "FC-PAN-001",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Perumusan Pancasila",
    "pertanyaan": "Para perumus Pancasila memiliki latar belakang yang berbeda-beda, namun mereka tetap bersatu. Sikap yang patut kita teladani dari para perumus Pancasila tersebut adalah...",
    "jawabanBenar": "Menghargai perbedaan pendapat",
    "pengecoh": [
      "Memaksakan kehendak",
      "Mementingkan golongan sendiri",
      "Menolak usulan dari orang lain"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Para tokoh pendiri bangsa menunjukkan sikap toleransi, kebersamaan, dan saling menghargai pendapat orang lain demi merumuskan dasar negara yang menyatukan seluruh rakyat."
  },
  {
    "id": "FC-PAN-002",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Perumusan Pancasila",
    "pertanyaan": "Dalam merumuskan dasar negara, tokoh-tokoh bangsa selalu mengedepankan musyawarah untuk mencapai mufakat. Hal ini menunjukkan bahwa mereka mencerminkan nilai Pancasila, khususnya sila ke-...",
    "jawabanBenar": "Keempat",
    "pengecoh": [
      "Ketiga",
      "Kedua",
      "Kesatu"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Musyawarah untuk mencapai mufakat merupakan inti pengamalan sila keempat Pancasila (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan)."
  },
  {
    "id": "FC-PAN-003",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Nilai-Nilai Pancasila",
    "pertanyaan": "Di sekolah, Edo berteman baik dengan Ali yang berbeda agama. Saat waktu ibadah tiba, Edo mempersilakan Ali untuk beribadah terlebih dahulu. Sikap Edo merupakan pengamalan Pancasila sila ke-...",
    "jawabanBenar": "Pertama",
    "pengecoh": [
      "Kedua",
      "Ketiga",
      "Kelima"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Menghargai dan memberikan kebebasan kepada pemeluk agama lain untuk beribadah adalah pengamalan sila pertama, Ketuhanan Yang Maha Esa."
  },
  {
    "id": "FC-PAN-004",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Nilai-Nilai Pancasila",
    "pertanyaan": "Terjadi bencana banjir di daerah tetangga. Sekolah Siti mengadakan penggalangan dana untuk membantu para korban. Tindakan Siti dan teman-temannya mengamalkan nilai Pancasila yang berlambang...",
    "jawabanBenar": "Rantai emas",
    "pengecoh": [
      "Bintang",
      "Pohon beringin",
      "Padi dan kapas"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Membantu korban bencana alam adalah wujud rasa kemanusiaan (sila kedua), yang dilambangkan dengan rantai emas."
  },
  {
    "id": "FC-PAN-005",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Keterkaitan Sila Pancasila",
    "pertanyaan": "Kelas V sedang bermusyawarah untuk menentukan ketua kelas. Setelah lama berdiskusi, kesepakatan mufakat tidak juga tercapai karena ada dua calon yang sama-sama kuat. Akhirnya, guru menyarankan pemungutan suara (voting). Calon A menang tipis atas calon B. Sikap terbaik yang harus ditunjukkan oleh pendukung calon B demi menjaga keutuhan kelas adalah...",
    "jawabanBenar": "Menerima hasil dan tetap bekerja sama",
    "pengecoh": [
      "Menolak hasil dan menuntut pemilihan ulang",
      "Menerima hasil tetapi menolak ikut kegiatan",
      "Meminta guru membagi kelas menjadi dua"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Dalam demokrasi dan musyawarah, jika mufakat tidak tercapai dan dilakukan pemungutan suara, hasil yang sah harus dihormati dan dilaksanakan bersama demi menjaga persatuan kelas."
  },
  {
    "id": "FC-PAN-006",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Fungsi Pancasila",
    "pertanyaan": "Pancasila berfungsi sebagai pandangan hidup bangsa Indonesia. Hal ini berarti Pancasila digunakan sebagai...",
    "jawabanBenar": "Pedoman dalam bertingkah laku sehari-hari",
    "pengecoh": [
      "Alat untuk menghukum orang bersalah",
      "Syarat untuk menjadi presiden",
      "Buku sejarah kemerdekaan Indonesia"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Sebagai pandangan hidup, nilai-nilai Pancasila menjadi penunjuk arah atau pedoman bagi masyarakat Indonesia dalam bersikap dan bertingkah laku di kehidupan sehari-hari."
  },
  {
    "id": "FC-PAN-007",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Sikap Keteladanan",
    "pertanyaan": "Para pendiri bangsa rela mengorbankan waktu, tenaga, dan pikirannya demi kemerdekaan. Sebagai siswa, bentuk rela berkorban yang bisa kamu lakukan di sekolah adalah...",
    "jawabanBenar": "Menyisihkan waktu istirahat untuk membantu teman",
    "pengecoh": [
      "Memberikan semua uang saku kepada teman",
      "Mengerjakan tugas teman agar dia bermain",
      "Rela dihukum meski tidak bersalah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Membantu teman belajar mengorbankan waktu pribadi demi kebaikan bersama. Jawaban lain adalah bentuk tindakan yang keliru (membiarkan teman malas atau menanggung hukuman salah)."
  },
  {
    "id": "FC-PAN-008",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Keterkaitan Sila Pancasila",
    "pertanyaan": "Andi melihat seorang murid baru dari luar pulau yang sedang kebingungan mencari kelas. Andi segera menolongnya dengan ramah meskipun mereka berbeda suku. Tindakan Andi merupakan wujud keterkaitan antara sila...",
    "jawabanBenar": "Sila kedua dan sila ketiga",
    "pengecoh": [
      "Sila pertama dan sila keempat",
      "Sila ketiga dan sila kelima",
      "Sila pertama dan sila kelima"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Menolong orang yang kesulitan adalah bentuk kemanusiaan (sila ke-2), dan melakukannya tanpa membedakan asal suku adalah wujud persatuan bangsa (sila ke-3)."
  },
  {
    "id": "FC-PAN-009",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Norma Masyarakat",
    "pertanyaan": "Mengucapkan permisi atau menundukkan badan sedikit saat berjalan melewati orang yang lebih tua adalah contoh penerapan norma...",
    "jawabanBenar": "Kesopanan",
    "pengecoh": [
      "Hukum",
      "Agama",
      "Kesusilaan"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Norma kesopanan bersumber dari kebiasaan atau tata krama masyarakat dalam pergaulan sehari-hari untuk saling menghargai."
  },
  {
    "id": "FC-PAN-010",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak dan Kewajiban",
    "pertanyaan": "Setiap anak memiliki hak dan kewajiban di rumah. Salah satu contoh hak anak di lingkungan keluarga adalah...",
    "jawabanBenar": "Mendapat perhatian dan kasih sayang",
    "pengecoh": [
      "Membantu membersihkan halaman rumah",
      "Mematuhi nasihat orang tua",
      "Menjaga nama baik keluarga"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Hak adalah sesuatu yang harusnya didapatkan. Kasih sayang adalah hak. Sedangkan membantu, menghormati, dan menjaga nama baik adalah kewajiban anak."
  },
  {
    "id": "FC-PAN-011",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak dan Kewajiban",
    "pertanyaan": "Di sekolah, setiap siswa berhak menggunakan fasilitas perpustakaan. Namun, siswa juga memiliki kewajiban terkait hak tersebut, yaitu...",
    "jawabanBenar": "Menjaga ketenangan dan merawat buku",
    "pengecoh": [
      "Membeli buku baru untuk perpustakaan",
      "Menyimpan buku perpustakaan untuk selamanya",
      "Memaksa petugas meminjamkan banyak buku"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Kewajiban yang menyertai hak menggunakan fasilitas sekolah adalah menjaganya agar tidak rusak dan tidak mengganggu orang lain."
  },
  {
    "id": "FC-PAN-012",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "UUD NRI 1945",
    "pertanyaan": "Kalimat 'Bahwa sesungguhnya Kemerdekaan itu ialah hak segala bangsa...' merupakan bunyi Pembukaan UUD NRI Tahun 1945 alinea ke-...",
    "jawabanBenar": "Pertama",
    "pengecoh": [
      "Kedua",
      "Ketiga",
      "Keempat"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Alinea pertama Pembukaan UUD 1945 menyatakan hak asasi setiap bangsa untuk merdeka dan menghapus penjajahan di atas dunia."
  },
  {
    "id": "FC-PAN-013",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Musyawarah",
    "pertanyaan": "Kelas VI sedang bermusyawarah untuk menentukan tujuan wisata belajar. Budi mengusulkan ke museum, sedangkan mayoritas kelas sepakat ke taman nasional. Sikap Budi yang tepat adalah...",
    "jawabanBenar": "Menerima dan menjalankan keputusan bersama",
    "pengecoh": [
      "Memaksa teman mengubah keputusan",
      "Marah dan menolak ikut wisata",
      "Meminta guru membatalkan wisata kelas"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Dalam musyawarah, jika keputusan sudah disepakati bersama (mufakat/suara terbanyak), setiap peserta wajib mematuhinya secara bertanggung jawab."
  },
  {
    "id": "FC-PAN-014",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak dan Kewajiban",
    "pertanyaan": "Setiap hari Minggu, warga RT 02 mengadakan kerja bakti membersihkan lingkungan. Ayah Budi sedang sakit parah sehingga tidak bisa ikut. Namun, keluarga Budi tetap memiliki hak untuk menggunakan fasilitas jalan dan taman yang bersih. Tindakan yang paling tepat untuk menyeimbangkan hak dan kewajiban keluarga Budi dalam situasi tersebut adalah...",
    "jawabanBenar": "Budi mewakili ayah ikut kerja bakti semampunya",
    "pengecoh": [
      "Keluarga Budi berdiam diri di rumah saja",
      "Ayah Budi memaksakan diri ikut kerja bakti",
      "Menyumbang uang agar bebas dari kerja bakti"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Menyeimbangkan hak (menikmati lingkungan bersih) dan kewajiban (menjaga kebersihan) bisa dilakukan dengan saling menggantikan peran dalam keluarga (Budi mewakili ayah) sesuai kemampuan."
  },
  {
    "id": "FC-PAN-015",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Aturan Bersama",
    "pertanyaan": "Siswa kelas V membuat kesepakatan kelas bersama, salah satunya adalah dilarang membuang sampah di laci meja. Fungsi utama dari kesepakatan tersebut adalah...",
    "jawabanBenar": "Menciptakan lingkungan yang tertib dan nyaman",
    "pengecoh": [
      "Agar guru bisa menghukum siswa",
      "Menunjukkan bahwa kelas V berkuasa",
      "Membuat siswa takut berada di kelas"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Tujuan dibuatnya aturan atau kesepakatan bersama adalah demi kepentingan dan kenyamanan seluruh anggota, bukan untuk menakut-nakuti."
  },
  {
    "id": "FC-PAN-016",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Aturan Bersama",
    "pertanyaan": "Saat bermain sepak bola saat istirahat, tim Riko kalah karena aturan yang sudah disepakati bersama sebelum bermain. Namun, Riko tidak terima dan marah-marah. Tindakan Riko menunjukkan sikap...",
    "jawabanBenar": "Tidak mematuhi kesepakatan yang telah dibuat",
    "pengecoh": [
      "Kritis terhadap aturan yang merugikan",
      "Menyuarakan kebenaran demi keadilan",
      "Taat pada nilai persahabatan"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Kesepakatan yang dibuat di awal harus ditaati hingga akhir, baik saat untung maupun rugi (kalah)."
  },
  {
    "id": "FC-PAN-017",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Tari Saman dari Aceh, Rendang dari Sumatera Barat, dan Rumah Gadang adalah kekayaan bangsa Indonesia yang menunjukkan keberagaman...",
    "jawabanBenar": "Budaya daerah",
    "pengecoh": [
      "Agama dan kepercayaan",
      "Ras dan ciri fisik",
      "Mata pencaharian"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Tarian, makanan khas, dan rumah adat adalah wujud keberagaman budaya yang ada di tiap daerah di Indonesia."
  },
  {
    "id": "FC-PAN-018",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Pak Guru menugaskan siswa untuk mempelajari lagu daerah dari provinsi lain yang bukan tempat asal mereka. Manfaat utama dari tugas tersebut adalah...",
    "jawabanBenar": "Menumbuhkan rasa menghargai keragaman budaya",
    "pengecoh": [
      "Membuktikan lagu daerah sendiri kurang bagus",
      "Menjadikan siswa penyanyi tingkat internasional",
      "Mengganti budaya asli dengan budaya luar"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Mempelajari budaya daerah lain bertujuan menanamkan rasa toleransi, pengenalan, dan kebanggaan atas kekayaan seluruh wilayah Indonesia."
  },
  {
    "id": "FC-PAN-019",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Salah satu cara tepat menjaga dan melestarikan budaya lokal di tengah arus modernisasi (pengaruh budaya luar) adalah...",
    "jawabanBenar": "Mempelajari tari tradisional atau memakai batik",
    "pengecoh": [
      "Melarang semua budaya asing masuk ke Indonesia",
      "Hanya mau menggunakan bahasa daerah",
      "Menolak menggunakan teknologi seperti internet"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Melestarikan budaya dilakukan dengan tindakan aktif mempraktikkannya, tanpa harus bersikap anti-kemajuan (teknologi) atau anti-persatuan (menolak bahasa nasional)."
  },
  {
    "id": "FC-PAN-020",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Semboyan negara Indonesia yang tertulis pada lambang Garuda Pancasila yang bermakna 'Berbeda-beda tetapi tetap satu jua' adalah...",
    "jawabanBenar": "Bhinneka Tunggal Ika",
    "pengecoh": [
      "Tut Wuri Handayani",
      "Bhinneka Sabda Budaya",
      "Bersatu Kita Teguh"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Bhinneka Tunggal Ika adalah semboyan pemersatu keberagaman bangsa Indonesia."
  },
  {
    "id": "FC-PAN-021",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Saat istirahat, kamu melihat seorang siswa baru pindahan dari provinsi lain sedang duduk sendirian. Tindakan yang sesuai dengan semangat persatuan adalah...",
    "jawabanBenar": "Mengajaknya berkenalan dan bermain bersama",
    "pengecoh": [
      "Membiarkannya karena belum mengenalnya",
      "Mengejek logat bicaranya yang berbeda",
      "Menyuruhnya bermain dengan teman sedaerah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Tindakan merangkul tanpa melihat perbedaan latar belakang daerah asal memperkuat semangat persatuan di sekolah."
  },
  {
    "id": "FC-PAN-022",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Sekolah mengadakan pameran makanan daerah. Kelompok Siti membawa makanan khas daerahnya yang memiliki aroma sangat tajam. Kelompok Doni yang stannya bersebelahan merasa terganggu dan berniat membuang makanan tersebut. Sebagai ketua kelas, tindakan terbaik yang harus kamu lakukan adalah...",
    "jawabanBenar": "Mengingatkan Doni dan menyarankan Siti menggeser makanannya",
    "pengecoh": [
      "Membiarkan Doni membuang makanan tersebut",
      "Memarahi Doni di depan para pengunjung",
      "Menyuruh Siti membawa pulang makanannya"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Tindakan terbaik adalah mencari jalan tengah (win-win solution) melalui dialog, saling menghargai keberagaman budaya (Bhinneka Tunggal Ika), dan menjaga kerukunan tanpa ada yang merasa dirugikan."
  },
  {
    "id": "FC-PAN-023",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Masyarakat Indonesia terdiri dari banyak suku bangsa, seperti suku Jawa, Sunda, Batak, Dayak, dan Asmat. Keberagaman ini seharusnya kita pandang sebagai...",
    "jawabanBenar": "Kekayaan bangsa yang harus dijaga bersama",
    "pengecoh": [
      "Penghalang utama dalam pembangunan negara",
      "Penyebab perpecahan di masa depan",
      "Alasan memisahkan daerah di Indonesia"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Keberagaman suku bangsa bukanlah ancaman, melainkan aset dan identitas bangsa Indonesia yang menjadikannya unik dan kaya."
  },
  {
    "id": "FC-PAN-024",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Setiap provinsi di Indonesia terbagi menjadi beberapa wilayah administratif yang lebih kecil. Wilayah yang kedudukannya setingkat (sejajar) dengan kabupaten adalah...",
    "jawabanBenar": "Kota",
    "pengecoh": [
      "Kecamatan",
      "Kelurahan",
      "Desa"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Dalam struktur pemerintahan NKRI, provinsi dibagi menjadi wilayah Kabupaten dan wilayah Kota."
  },
  {
    "id": "FC-PAN-025",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Warga desa Sukamaju memiliki tradisi membangun pos kamling atau memperbaiki jalan yang rusak secara bersama-sama tanpa dibayar. Kegiatan ini mencerminkan tradisi...",
    "jawabanBenar": "Gotong royong",
    "pengecoh": [
      "Kerja paksa",
      "Rapat desa",
      "Pemilihan umum"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Bekerja bersama-sama demi kepentingan umum secara sukarela adalah ciri khas budaya gotong royong masyarakat Indonesia."
  },
  {
    "id": "FC-PAN-026",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Indonesia dikenal sebagai Negara Kesatuan. Makna dasar dari negara kesatuan adalah...",
    "jawabanBenar": "Negara utuh tanpa negara bagian",
    "pengecoh": [
      "Negara dengan satu partai politik",
      "Gabungan dari beberapa negara merdeka",
      "Negara yang hanya mengakui satu budaya"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Negara kesatuan (NKRI) memiliki pemerintahan pusat yang berdaulat, wilayahnya merupakan satu kesatuan utuh tanpa adanya negara di dalam negara."
  },
  {
    "id": "FC-PAN-027",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Di lingkungan tempat tinggal Rio sedang dibangun tempat ibadah. Meskipun mayoritas warga berbeda agama, mereka ikut menjaga keamanan dan kelancaran pembangunan. Hal ini menunjukkan...",
    "jawabanBenar": "Toleransi umat beragama menjaga persatuan",
    "pengecoh": [
      "Mencari pujian dari kepala daerah",
      "Tidak peduli asalkan lingkungannya bersih",
      "Takut mendapat hukuman dari pemerintah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Toleransi antar umat beragama dalam masyarakat sangat penting untuk memelihara kedamaian dan keutuhan Negara Kesatuan Republik Indonesia."
  },
  {
    "id": "FC-PAN-028",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Wilayah tempat kita tinggal saat ini (desa/kelurahan, kecamatan, kabupaten, hingga provinsi) semuanya adalah bagian yang tak terpisahkan dari...",
    "jawabanBenar": "Negara Kesatuan Republik Indonesia",
    "pengecoh": [
      "Perserikatan Bangsa-Bangsa",
      "Organisasi negara Asia Tenggara",
      "Negara Persemakmuran"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Seluruh wilayah pemerintahan daerah dari tingkat bawah hingga provinsi adalah komponen pembentuk keutuhan wilayah NKRI."
  },
  {
    "id": "FC-PAN-029",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Sebagai pelajar, kita harus bangga terhadap identitas kita sebagai bangsa Indonesia. Salah satu perilaku yang menunjukkan rasa bangga tersebut di kehidupan sehari-hari adalah...",
    "jawabanBenar": "Bangga menggunakan barang buatan dalam negeri",
    "pengecoh": [
      "Menghindari produk lokal karena kurang keren",
      "Memamerkan barang mahal dari luar negeri",
      "Menjelek-jelekkan negara di media sosial"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Mencintai produk dalam negeri membuktikan adanya rasa cinta tanah air dan kebanggaan atas karya bangsa sendiri, yang mendukung kemajuan ekonomi negara."
  },
  {
    "id": "FC-PAN-030",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Kerjasama Antardaerah NKRI",
    "pertanyaan": "Desa Makmur dan Desa Sejahtera dipisahkan oleh sebuah sungai. Jembatan bambu yang menghubungkan kedua desa tersebut putus akibat banjir. Akibatnya, anak-anak dari Desa Makmur tidak bisa pergi ke sekolah yang terletak di Desa Sejahtera. Solusi terbaik yang mencerminkan semangat persatuan dan gotong royong adalah...",
    "jawabanBenar": "Warga kedua desa bergotong royong memperbaiki jembatan",
    "pengecoh": [
      "Kepala desa melarang anak-anak ke sekolah",
      "Warga menolak membantu perbaikan jembatan",
      "Memindahkan sekolah agar tidak menyeberang sungai"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Dalam semangat persatuan NKRI, masalah bersama antarwilayah (meskipun di tingkat desa) diselesaikan dengan gotong royong dan kerja sama demi kepentingan bersama, terutama pendidikan anak."
  },
  {
    "id": "FC-PJOK-001",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Aktivitas Gerak & Strategi",
    "pertanyaan": "Saat bermain sepak bola, Budi melihat temannya berada di dekat gawang lawan tanpa penjagaan. Tindakan gerak yang paling tepat dilakukan Budi adalah...",
    "jawabanBenar": "Mengoper bola ke teman",
    "pengecoh": [
      "Menendang bola keluar lapangan",
      "Menahan bola terus-menerus",
      "Berlari menjauhi gawang lawan"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Mengoper bola kepada kawan yang bebas penjagaan adalah strategi paling efektif untuk menciptakan peluang mencetak gol."
  },
  {
    "id": "FC-PJOK-002",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Aktivitas Gerak & Strategi",
    "pertanyaan": "Dalam permainan invasi seperti bola basket, mengapa pemain tanpa bola harus selalu bergerak mencari ruang kosong?",
    "jawabanBenar": "Memudahkan teman mengoper bola",
    "pengecoh": [
      "Membuat wasit menjadi bingung",
      "Menghindari teguran dari pelatih",
      "Mengulur waktu permainan"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Pemain tanpa bola harus aktif mencari ruang terbuka agar terlepas dari penjagaan dan mudah menerima umpan."
  },
  {
    "id": "FC-PJOK-003",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Aktivitas Gerak & Strategi",
    "pertanyaan": "Dina berlari lurus, lalu tiba-tiba berbelok arah dengan cepat saat bermain kejar-kejaran. Tujuan utama gerakan Dina adalah...",
    "jawabanBenar": "Menghindari tangkapan lawan",
    "pengecoh": [
      "Memperlambat lari teman",
      "Mengurangi tenaga yang keluar",
      "Menjaga keseimbangan tubuh"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Mengubah arah lari (zigzag) secara cepat merupakan strategi kelincahan untuk mengecoh dan menghindari kejaran lawan."
  },
  {
    "id": "FC-PJOK-004",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Aktivitas Gerak & Strategi",
    "pertanyaan": "Saat melakukan lompat jauh, gerakan ayunan kedua lengan ke arah depan atas pada saat kaki menolak bertujuan untuk...",
    "jawabanBenar": "Menambah daya dorong tubuh",
    "pengecoh": [
      "Menjaga pandangan tetap lurus",
      "Mengurangi kecepatan lari",
      "Melindungi wajah dari pasir"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Ayunan lengan membantu tubuh bergerak lebih kuat ke depan dan meningkatkan jangkauan lompatan."
  },
  {
    "id": "FC-PJOK-005",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Aktivitas Gerak & Strategi",
    "pertanyaan": "Sebelum melakukan olahraga lari cepat, kita diwajibkan melakukan pemanasan dan peregangan. Tujuan utamanya adalah...",
    "jawabanBenar": "Mencegah terjadinya cedera otot",
    "pengecoh": [
      "Mengurangi rasa haus",
      "Mempercepat detak jantung",
      "Menghilangkan rasa lelah"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Pemanasan mempersiapkan otot dan sendi agar lebih lentur sehingga mengurangi risiko kram atau cedera saat berolahraga berat."
  },
  {
    "id": "FC-PJOK-006",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Aktivitas Gerak & Strategi",
    "pertanyaan": "Saat mengikuti lari jarak jauh, pelari tidak disarankan berlari dengan kecepatan penuh (sprint) sejak awal. Hal ini bertujuan untuk...",
    "jawabanBenar": "Menjaga daya tahan tubuh",
    "pengecoh": [
      "Memberi kesempatan lawan menang",
      "Menghindari keringat berlebih",
      "Menyesuaikan dengan sepatu baru"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Lari jarak jauh membutuhkan stamina yang besar, sehingga pelari harus mengatur tempo langkah agar tenaganya tidak habis di awal."
  },
  {
    "id": "FC-PJOK-007",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Permainan & Olahraga",
    "pertanyaan": "Menendang, melempar, memukul, dan menangkap bola merupakan contoh dari kelompok keterampilan gerak...",
    "jawabanBenar": "Manipulatif",
    "pengecoh": [
      "Lokomotor",
      "Non-lokomotor",
      "Keseimbangan statis"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Gerak manipulatif adalah gerak yang melibatkan penguasaan terhadap sebuah objek atau alat, seperti bola atau pemukul."
  },
  {
    "id": "FC-PJOK-008",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Permainan & Olahraga",
    "pertanyaan": "Saat bersiap memukul bola dalam permainan kasti, pandangan mata pemukul harus selalu difokuskan ke arah...",
    "jawabanBenar": "Bola yang dilempar",
    "pengecoh": [
      "Penjaga base pertama",
      "Tongkat pemukul sendiri",
      "Garis batas lapangan"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Fokus pandangan pada bola yang datang dari pelempar sangat krusial agar pukulan dapat tepat sasaran."
  },
  {
    "id": "FC-PJOK-009",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Permainan & Olahraga",
    "pertanyaan": "Permainan olahraga tradisional beregu yang membutuhkan kelincahan dan kerja sama tim untuk melewati penjagaan garis batas adalah...",
    "jawabanBenar": "Gobak sodor",
    "pengecoh": [
      "Lompat tali",
      "Engklek tunggal",
      "Balap karung"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Gobak sodor adalah permainan invasi tradisional di mana tim penyerang harus menembus garis pertahanan yang dijaga tim lawan."
  },
  {
    "id": "FC-PJOK-010",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Permainan & Olahraga",
    "pertanyaan": "Dalam permainan bola voli, saat tim lawan sedang melompat bersiap melakukan smes tajam, posisi dan taktik terbaik tim bertahan di dekat net adalah...",
    "jawabanBenar": "Melakukan bendungan atau blok",
    "pengecoh": [
      "Mundur jauh ke belakang",
      "Berdiri diam saling melihat",
      "Berlari keluar area permainan"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Blok (blocking) di depan net adalah strategi pertahanan paling efektif untuk mengadang laju bola smes keras dari lawan."
  },
  {
    "id": "FC-PJOK-011",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Permainan & Olahraga",
    "pertanyaan": "Olahraga beregu yang menggunakan net di tengah lapangan adalah...",
    "jawabanBenar": "Bola voli",
    "pengecoh": [
      "Sepak bola",
      "Bola basket",
      "Bola kasti"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Bola voli dan bulu tangkis adalah contoh permainan net, berbeda dengan sepak bola atau basket yang merupakan permainan invasi gawang."
  },
  {
    "id": "FC-PJOK-012",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Permainan & Olahraga",
    "pertanyaan": "Dalam aktivitas senam irama, keserasian antara langkah kaki dan ayunan lengan sangat penting agar...",
    "jawabanBenar": "Gerakan selaras dengan musik",
    "pengecoh": [
      "Musik terdengar lebih merdu",
      "Menghemat napas peserta",
      "Menghasilkan keringat lebih banyak"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Senam irama menitikberatkan pada keindahan dan ketepatan ritme, sehingga gerak tubuh harus harmonis dengan ketukan nada."
  },
  {
    "id": "FC-PJOK-013",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Fair Play & Kerja Sama",
    "pertanyaan": "Tim basket sekolahmu kalah poin di pertandingan final. Sikap yang mencerminkan nilai fair play setelah pertandingan selesai adalah...",
    "jawabanBenar": "Memberi selamat kepada lawan",
    "pengecoh": [
      "Menyalahkan wasit yang bertugas",
      "Langsung pulang tanpa bersalaman",
      "Menangis marah di lapangan"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Fair play berarti menghargai jalannya pertandingan, mengakui keunggulan lawan secara ksatria, dan menerima kekalahan dengan lapang dada."
  },
  {
    "id": "FC-PJOK-014",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Fair Play & Kerja Sama",
    "pertanyaan": "Saat bermain kasti, teman satu timmu membuat kesalahan melempar sehingga tim kehilangan poin. Sikap yang harus kamu tunjukkan adalah...",
    "jawabanBenar": "Memberi semangat agar kembali fokus",
    "pengecoh": [
      "Memarahinya di depan lawan",
      "Menyuruhnya keluar dari permainan",
      "Berhenti bermain dan ngambek"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Kerja sama tim menuntut dukungan mental antarpemain. Kesalahan adalah hal wajar dan teguran harus membangun, bukan menjatuhkan mental."
  },
  {
    "id": "FC-PJOK-015",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Fair Play & Kerja Sama",
    "pertanyaan": "Wasit menyatakan timmu melakukan pelanggaran, meskipun kamu merasa tindakanmu bersih. Tindakan yang paling tepat adalah...",
    "jawabanBenar": "Menerima keputusan wasit dengan tenang",
    "pengecoh": [
      "Memprotes wasit dengan nada kasar",
      "Mengajak tim mogok bermain",
      "Mengabaikan tiupan peluit wasit"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Menghormati keputusan wasit tanpa protes berlebihan adalah dasar dari nilai sportivitas (fair play) dalam setiap cabang olahraga."
  },
  {
    "id": "FC-PJOK-016",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Fair Play & Kerja Sama",
    "pertanyaan": "Tim futsalmu sedang tertinggal tiga gol dan waktu hampir habis. Sebagai pemain, peran utama yang tetap harus kamu jalankan adalah...",
    "jawabanBenar": "Terus berjuang dan bekerja sama",
    "pengecoh": [
      "Menyalahkan kiper yang kebobolan",
      "Meminta pelatih mengganti semua pemain",
      "Berpura-pura cedera agar istirahat"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Pantang menyerah dan menghargai nilai kerja sama sampai peluit panjang berbunyi adalah mentalitas atlet yang baik, terlepas dari hasil akhirnya."
  },
  {
    "id": "FC-PJOK-017",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Fair Play & Kerja Sama",
    "pertanyaan": "Bermain dengan jujur tanpa memanipulasi aturan demi meraih kemenangan sepihak disebut dengan perilaku...",
    "jawabanBenar": "Sportif",
    "pengecoh": [
      "Egois",
      "Agresif",
      "Dominan"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Sikap sportif mencakup kejujuran, kepatuhan pada aturan, saling menghormati, dan tidak berbuat curang saat berolahraga."
  },
  {
    "id": "FC-PJOK-018",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Fair Play & Kerja Sama",
    "pertanyaan": "Saat jam istirahat, kamu bermain bola basket. Ada satu siswa baru yang tidak terlalu mahir ingin ikut bermain. Sikap inklusif yang tepat adalah...",
    "jawabanBenar": "Mengajaknya bergabung dan bermain bersama",
    "pengecoh": [
      "Membiarkannya menjadi penonton saja",
      "Menolaknya karena akan merugikan tim",
      "Menunggu sampai kemampuannya setara"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Pendidikan jasmani yang inklusif berarti menerima dan melibatkan semua teman tanpa mendiskriminasi keterampilan fisiknya."
  },
  {
    "id": "FC-PJOK-019",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Gaya Hidup Aktif & Kesehatan",
    "pertanyaan": "Manfaat utama menjadikan aktivitas fisik dan olahraga rutin sebagai gaya hidup adalah...",
    "jawabanBenar": "Tubuh menjadi lebih bugar",
    "pengecoh": [
      "Menambah berat badan sangat cepat",
      "Membuat tubuh cepat merasa lelah",
      "Menghilangkan rasa lapar seharian"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Olahraga rutin meningkatkan kapasitas jantung dan otot sehingga tingkat kebugaran jasmani seseorang akan meningkat."
  },
  {
    "id": "FC-PJOK-020",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Gaya Hidup Aktif & Kesehatan",
    "pertanyaan": "Olahraga tidak hanya berdampak pada fisik, tetapi juga pada kesehatan mental. Salah satu efek positif olahraga bagi psikologis adalah...",
    "jawabanBenar": "Mengurangi rasa stres dan cemas",
    "pengecoh": [
      "Menurunkan daya ingat otak",
      "Membuat sering merasa mengantuk",
      "Menghilangkan empati pada teman"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Aktivitas fisik dapat melepaskan hormon endorfin yang memicu perasaan bahagia dan meredakan ketegangan mental (stres)."
  },
  {
    "id": "FC-PJOK-021",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Gaya Hidup Aktif & Kesehatan",
    "pertanyaan": "Setelah selesai berlari santai mengelilingi taman, Rio memegang pergelangan tangannya. Tujuan gerakan Rio adalah untuk menghitung...",
    "jawabanBenar": "Denyut nadi setelah aktivitas",
    "pengecoh": [
      "Suhu panas permukaan kulit",
      "Jumlah keringat yang keluar",
      "Kecepatan lari per menit"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Menghitung denyut nadi setelah berolahraga berfungsi untuk mengukur seberapa keras beban kerja jantung saat melakukan aktivitas fisik."
  },
  {
    "id": "FC-PJOK-022",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Gaya Hidup Aktif & Kesehatan",
    "pertanyaan": "Gaya hidup sedentari adalah kebiasaan banyak duduk sambil bermain gawai dan jarang bergerak. Risiko nyata dari kebiasaan ini adalah...",
    "jawabanBenar": "Otot lemah dan risiko obesitas",
    "pengecoh": [
      "Tubuh menjadi kebal terhadap virus",
      "Kapasitas pernapasan meningkat pesat",
      "Tulang punggung menjadi lebih kuat"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Kurangnya aktivitas gerak membuat penumpukan kalori yang memicu obesitas (kegemukan) dan penurunan fungsi serta kekuatan otot rangka."
  },
  {
    "id": "FC-PJOK-023",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Gaya Hidup Aktif & Kesehatan",
    "pertanyaan": "Setelah berolahraga keras pada siang hari, tubuh membutuhkan waktu untuk perbaikan sel agar tidak kelelahan. Cara pemulihan yang paling utama adalah...",
    "jawabanBenar": "Istirahat dan tidur yang cukup",
    "pengecoh": [
      "Bermain gim gawai semalaman",
      "Minum minuman energi bersoda",
      "Makan keripik camilan yang banyak"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Tidur adalah fase krusial bagi tubuh untuk memulihkan otot yang lelah, meregenerasi sel, dan mengembalikan stamina secara alami."
  },
  {
    "id": "FC-PJOK-024",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Gaya Hidup Aktif & Kesehatan",
    "pertanyaan": "Untuk membantu memperbaiki jaringan otot yang rusak atau lelah setelah berolahraga berat, tubuh sangat membutuhkan asupan nutrisi berupa...",
    "jawabanBenar": "Protein",
    "pengecoh": [
      "Lemak jenuh",
      "Gula buatan",
      "Pemanis buatan"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Protein merupakan zat pembangun utama yang bertugas memperbaiki dan memperkuat sel-sel jaringan otot setelah aktivitas fisik intens."
  },
  {
    "id": "FC-PJOK-025",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan Aktivitas Jasmani",
    "pertanyaan": "Aturan dasar demi menjaga keselamatan fisik sebelum mulai berenang masuk ke dalam air adalah...",
    "jawabanBenar": "Melakukan pemanasan otot",
    "pengecoh": [
      "Langsung melompat ke air dalam",
      "Makan kenyang sebelum berenang",
      "Memakai pakaian yang tebal"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Pemanasan membantu menyiapkan tubuh sebelum melakukan aktivitas berenang."
  },
  {
    "id": "FC-PJOK-026",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan Aktivitas Jasmani",
    "pertanyaan": "Saat bermain sepak bola, tulang kering Budi terbentur hingga mengalami memar bengkak tanpa luka robek. Penanganan pertama (P3K) yang paling tepat adalah...",
    "jawabanBenar": "Kompres dingin dengan aman",
    "pengecoh": [
      "Memijat kuat area yang bengkak",
      "Menyiramnya dengan air mendidih",
      "Menekuk kaki dengan sangat kencang"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Kompres dingin dapat membantu mengurangi rasa nyeri dan bengkak setelah benturan. Jika cedera berat, segera minta bantuan guru atau orang dewasa."
  },
  {
    "id": "FC-PJOK-027",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan Aktivitas Jasmani",
    "pertanyaan": "Bersepeda melintasi jalan raya memiliki risiko bahaya tinggi. Alat keselamatan wajib yang berfungsi melindungi organ kepala dari benturan adalah...",
    "jawabanBenar": "Helm pelindung",
    "pengecoh": [
      "Topi rajut wol",
      "Kacamata anti silau",
      "Sarung tangan kulit"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Helm sepeda berstandar dirancang khusus meredam benturan keras untuk melindungi tulang tengkorak dan otak jika terjatuh."
  },
  {
    "id": "FC-PJOK-028",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan Aktivitas Jasmani",
    "pertanyaan": "Saat olahraga cuaca terik, Toni tiba-tiba mual, pandangan berkunang-kunang, dan sangat kelelahan. Ini merupakan gejala bahaya, sehingga tindakan Toni seharusnya...",
    "jawabanBenar": "Segera berteduh dan beristirahat",
    "pengecoh": [
      "Tetap berlari menyelesaikan permainan",
      "Berjemur di tengah terik lapangan",
      "Melakukan peregangan lebih keras"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Gejala tersebut dapat menjadi tanda tubuh terlalu lelah karena panas. Berhenti beraktivitas, berteduh, dan meminta bantuan guru adalah tindakan yang tepat."
  },
  {
    "id": "FC-PJOK-029",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan Aktivitas Jasmani",
    "pertanyaan": "Setelah hujan lebat, lapangan semen di sekolah menjadi basah dan tergenang. Jika dipaksakan bermain bola basket, bahaya yang paling mengancam keselamatan siswa adalah...",
    "jawabanBenar": "Risiko tergelincir jatuh",
    "pengecoh": [
      "Bola basket mudah menjadi kempis",
      "Sepatu olahraga menjadi cepat kotor",
      "Keranjang basket mudah patah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Permukaan keras yang licin menghilangkan gaya gesek sepatu, sehingga meningkatkan risiko jatuh dan patah tulang secara signifikan."
  },
  {
    "id": "FC-PJOK-030",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "PJOK",
    "topik": "Keselamatan Aktivitas Jasmani",
    "pertanyaan": "Saat sedang mengayunkan tongkat kasti untuk memukul bola, pemain yang memegang pemukul harus menjaga jarak batas aman. Hal ini dilakukan demi...",
    "jawabanBenar": "Menghindari tongkat mengenai orang lain",
    "pengecoh": [
      "Memastikan bola melambung lebih keras",
      "Memudahkan tim teman menangkap bola",
      "Mengelabui pandangan penjaga base lawan"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Ruang ayunan tongkat sangat berbahaya. Jarak aman wajib dijaga agar tidak mengenai wajah atau tubuh pemain lain di sekitar area pukulan."
  },
  {
    "id": "FC-SENI-001",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Alat Musik",
    "pertanyaan": "Saat pentas, Budi menabuh gendang dan Edo memainkan marakas. Alat musik yang dimainkan mereka termasuk jenis...",
    "jawabanBenar": "Alat musik ritmis",
    "pengecoh": [
      "Alat musik melodis",
      "Alat musik harmonis",
      "Alat musik tiup"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Gendang dan marakas adalah alat musik pengatur irama yang tidak memiliki nada pasti, sehingga disebut alat musik ritmis."
  },
  {
    "id": "FC-SENI-002",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Bernyanyi",
    "pertanyaan": "Paduan suara kelas V menyanyikan sebuah lagu secara bersama-sama dengan satu suara. Cara bernyanyi seperti ini disebut...",
    "jawabanBenar": "Bernyanyi unisono",
    "pengecoh": [
      "Bernyanyi solo",
      "Bernyanyi kanon",
      "Bernyanyi akapela"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Unisono berarti menyanyikan suatu melodi bersama-sama dalam satu nada atau satu suara secara serempak."
  },
  {
    "id": "FC-SENI-003",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Tempo",
    "pertanyaan": "Lagu 'Hari Merdeka' dinyanyikan dengan cepat dan penuh semangat. Ukuran kecepatan dalam memainkan lagu disebut...",
    "jawabanBenar": "Tempo",
    "pengecoh": [
      "Dinamika",
      "Melodi",
      "Harmoni"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Tempo adalah ukuran kecepatan birama lagu. Lagu yang gembira dan semangat biasanya bertempo cepat."
  },
  {
    "id": "FC-SENI-004",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Ansambel Musik",
    "pertanyaan": "Sekelompok siswa bermain pianika, rekorder, dan gitar secara bersama-sama di depan kelas. Pertunjukan ini disebut bermain musik...",
    "jawabanBenar": "Ansambel campuran",
    "pengecoh": [
      "Ansambel sejenis",
      "Paduan suara",
      "Orkes simfoni"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Ansambel campuran adalah penyajian musik yang dimainkan secara bersama-sama menggunakan berbagai jenis alat musik yang berbeda."
  },
  {
    "id": "FC-SENI-005",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Dinamika",
    "pertanyaan": "Saat menyanyikan lagu pengantar tidur, penyanyi melembutkan volume suaranya. Perubahan keras lembutnya suara dalam musik disebut...",
    "jawabanBenar": "Dinamika",
    "pengecoh": [
      "Tempo",
      "Artikulasi",
      "Intonasi"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Dinamika memberikan ekspresi pada lagu melalui perubahan tingkat kekerasan atau kelembutan suara."
  },
  {
    "id": "FC-SENI-006",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Alat Musik Daerah",
    "pertanyaan": "Angklung adalah alat musik tradisional dari Jawa Barat yang terbuat dari bambu. Cara membunyikannya adalah dengan...",
    "jawabanBenar": "Digoyangkan",
    "pengecoh": [
      "Ditiup",
      "Dipetik",
      "Dipukul"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Angklung menghasilkan suara dari benturan tabung bambu yang terjadi ketika alat tersebut digoyangkan."
  },
  {
    "id": "FC-SENI-007",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Birama",
    "pertanyaan": "Sebuah lagu daerah ditulis dengan tanda birama 3/4. Angka tersebut memiliki arti bahwa setiap birama terdiri dari...",
    "jawabanBenar": "Tiga ketukan",
    "pengecoh": [
      "Empat ketukan",
      "Tiga per empat ketukan",
      "Tiga nada dasar"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Angka pembilang pada birama (angka 3) menunjukkan jumlah ketukan dalam setiap ruas birama."
  },
  {
    "id": "FC-SENI-008",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Harmoni",
    "pertanyaan": "Dalam paduan suara, pembagian suara menjadi suara 1 dan suara 2 bertujuan agar paduan nada terdengar...",
    "jawabanBenar": "Selaras dan harmonis",
    "pengecoh": [
      "Lebih keras",
      "Cepat selesai",
      "Sama persis"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Pembagian suara melodi yang berbeda menghasilkan harmoni atau keselarasan nada yang indah saat dinyanyikan bersama."
  },
  {
    "id": "FC-SENI-009",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Warna",
    "pertanyaan": "Saat melukis, Andi ingin membuat warna hijau. Ia harus mencampurkan dua warna dasar, yaitu...",
    "jawabanBenar": "Kuning dan biru",
    "pengecoh": [
      "Merah dan kuning",
      "Merah dan biru",
      "Hitam dan putih"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Hijau adalah warna sekunder yang dihasilkan dari percampuran warna primer kuning dan biru."
  },
  {
    "id": "FC-SENI-010",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Teknik Berkarya",
    "pertanyaan": "Dina membuat karya seni dengan cara menempelkan potongan-potongan kertas kecil pada sebuah gambar. Teknik ini disebut...",
    "jawabanBenar": "Kolase",
    "pengecoh": [
      "Menganyam",
      "Membatik",
      "Mengecor"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Kolase adalah seni menempel kepingan atau potongan bahan (seperti kertas, daun) pada permukaan bidang dua dimensi."
  },
  {
    "id": "FC-SENI-011",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Teknik Menggambar",
    "pertanyaan": "Menggambar bayangan objek menggunakan tarikan garis sejajar atau menyilang berulang-ulang disebut teknik...",
    "jawabanBenar": "Arsir",
    "pengecoh": [
      "Dusel",
      "Pointilis",
      "Aquarel"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Teknik arsir menggunakan garis-garis sejajar atau silang untuk menciptakan efek gelap terang dan dimensi pada gambar."
  },
  {
    "id": "FC-SENI-012",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Proporsi",
    "pertanyaan": "Saat menggambar manusia, Budi memperhatikan perbandingan ukuran antara kepala, badan, dan kaki agar terlihat wajar. Budi sedang menerapkan prinsip...",
    "jawabanBenar": "Proporsi",
    "pengecoh": [
      "Kesatuan",
      "Keseimbangan",
      "Irama"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Proporsi adalah prinsip seni rupa yang mengatur perbandingan ukuran antar bagian agar benda terlihat proporsional dan realistis."
  },
  {
    "id": "FC-SENI-013",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Kerajinan",
    "pertanyaan": "Memanfaatkan botol plastik bekas menjadi pot bunga yang indah adalah contoh kegiatan berkarya seni yang bertujuan untuk...",
    "jawabanBenar": "Mendaur ulang barang bekas",
    "pengecoh": [
      "Menghabiskan uang saku",
      "Meniru karya seniman",
      "Membuang sampah sembarangan"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Berkarya menggunakan barang bekas (daur ulang) membantu mengurangi sampah sekaligus menghasilkan benda fungsional yang bernilai estetika."
  },
  {
    "id": "FC-SENI-014",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Tekstur",
    "pertanyaan": "Saat kita meraba sebuah patung kayu, permukaannya terasa kasar. Sifat permukaan benda ini dalam seni rupa disebut...",
    "jawabanBenar": "Tekstur nyata",
    "pengecoh": [
      "Tekstur semu",
      "Warna gelap",
      "Ruang tiga dimensi"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Tekstur nyata adalah sifat permukaan benda yang ketika dilihat dan diraba rasanya sama (misal: terlihat kasar, diraba juga kasar)."
  },
  {
    "id": "FC-SENI-015",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Teknik Menggambar",
    "pertanyaan": "Seniman itu melukis pemandangan hanya dengan menggunakan kumpulan titik-titik kecil yang sangat padat. Teknik lukis ini dikenal dengan nama...",
    "jawabanBenar": "Pointilis",
    "pengecoh": [
      "Plakat",
      "Siluet",
      "Dusel"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Teknik pointilis menciptakan objek dan bayangan menggunakan ribuan titik kecil warna tanpa garis tebal."
  },
  {
    "id": "FC-SENI-016",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Komposisi",
    "pertanyaan": "Agar gambar pemandangan tidak terlihat miring atau berat sebelah, kita harus mengatur letak objek dengan baik. Prinsip ini disebut...",
    "jawabanBenar": "Keseimbangan atau komposisi",
    "pengecoh": [
      "Keselarasan warna",
      "Penekanan objek",
      "Gradasi bayangan"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Keseimbangan (balance) merupakan prinsip komposisi agar susunan objek gambar terasa utuh dan tidak berat sebelah."
  },
  {
    "id": "FC-SENI-017",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Pola Lantai",
    "pertanyaan": "Saat menari berkelompok, para penari bergerak membentuk formasi garis lurus dari depan ke belakang. Formasi ini disebut pola lantai...",
    "jawabanBenar": "Vertikal",
    "pengecoh": [
      "Melingkar",
      "Horizontal",
      "Diagonal"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Pola lantai lurus dari depan ke belakang atau sebaliknya disebut dengan pola lantai garis lurus vertikal."
  },
  {
    "id": "FC-SENI-018",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Properti Tari",
    "pertanyaan": "Tari Piring dari Sumatera Barat dimainkan dengan membawa piring di tangan penari. Piring dalam tarian tersebut berfungsi sebagai...",
    "jawabanBenar": "Properti tari",
    "pengecoh": [
      "Pakaian tari",
      "Tata rias",
      "Panggung tari"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Benda apa pun yang dibawa, dipegang, atau dimainkan oleh penari saat menari disebut properti tari."
  },
  {
    "id": "FC-SENI-019",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Level Gerak",
    "pertanyaan": "Dalam sebuah pertunjukan tari, beberapa penari melakukan gerakan sambil duduk bersimpuh di lantai. Gerakan ini termasuk dalam...",
    "jawabanBenar": "Level gerak rendah",
    "pengecoh": [
      "Level gerak sedang",
      "Level gerak tinggi",
      "Level gerak vertikal"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Gerak yang dilakukan menyentuh lantai (seperti duduk, bersimpuh, rebah) termasuk dalam eksplorasi tari pada level rendah."
  },
  {
    "id": "FC-SENI-020",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Wirama",
    "pertanyaan": "Agar tarian terlihat indah dan kompak, setiap langkah dan ayunan tangan penari harus selalu disesuaikan dengan...",
    "jawabanBenar": "Irama iringan musik",
    "pengecoh": [
      "Tata cahaya panggung",
      "Warna baju penonton",
      "Teriakan sutradara"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Kesesuaian antara irama musik dengan tempo dan ritme gerak penari dikenal sebagai unsur wirama."
  },
  {
    "id": "FC-SENI-021",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Wirasa",
    "pertanyaan": "Penari memperlihatkan senyuman ceria karena tarian tersebut menceritakan suasana pesta panen yang bahagia. Hal ini merupakan unsur tari yaitu...",
    "jawabanBenar": "Wirasa atau penjiwaan",
    "pengecoh": [
      "Wiraga atau raga",
      "Wirama atau irama",
      "Tata rias panggung"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Wirasa adalah penghayatan atau penjiwaan tarian yang dipancarkan melalui ekspresi wajah dan kualitas tenaga penari."
  },
  {
    "id": "FC-SENI-022",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Ruang Gerak",
    "pertanyaan": "Penari merentangkan kedua tangannya lebar-lebar sambil melompat ke udara. Gerakan ini menunjukkan penggunaan...",
    "jawabanBenar": "Ruang gerak yang luas",
    "pengecoh": [
      "Ruang gerak yang sempit",
      "Waktu yang lambat",
      "Tenaga yang lemah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Merentangkan anggota badan sejauh-jauhnya dari titik pusat tubuh merupakan pemanfaatan volume ruang gerak secara maksimal."
  },
  {
    "id": "FC-SENI-023",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Tari Kreasi",
    "pertanyaan": "Sebuah tarian diciptakan dengan menggabungkan gerak tari daerah dengan gaya modern yang lebih bebas. Tarian jenis ini disebut...",
    "jawabanBenar": "Tari kreasi baru",
    "pengecoh": [
      "Tari tradisional klasik",
      "Tari kerakyatan asli",
      "Tari adat primitif"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Tari kreasi baru adalah inovasi seni tari yang tidak lagi terikat kuat dengan pakem-pakem tradisi aslinya."
  },
  {
    "id": "FC-SENI-024",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Ekspresi Mimik",
    "pertanyaan": "Saat memerankan tokoh yang sedang marah, aktor mengerutkan dahi dan menatap tajam. Perubahan wajah ini disebut...",
    "jawabanBenar": "Mimik wajah",
    "pengecoh": [
      "Gerak tubuh",
      "Tata rias",
      "Bloking panggung"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Mimik wajah adalah ekspresi raut muka pemain untuk menunjukkan emosi tokoh yang diperankannya."
  },
  {
    "id": "FC-SENI-025",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Pantomim",
    "pertanyaan": "Sebuah pertunjukan teater dilakukan tanpa dialog sama sekali, hanya menggunakan riasan putih di wajah dan gerak tubuh. Pertunjukan ini disebut...",
    "jawabanBenar": "Pantomim",
    "pengecoh": [
      "Sendratari",
      "Opera",
      "Wayang orang"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Pantomim adalah bentuk seni pertunjukan teater yang mengekspresikan cerita sepenuhnya melalui isyarat tubuh tanpa ucapan."
  },
  {
    "id": "FC-SENI-026",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Artikulasi",
    "pertanyaan": "Saat berbicara di panggung, aktor harus membuka mulut dengan baik agar setiap kata terdengar jelas oleh penonton. Ini disebut...",
    "jawabanBenar": "Artikulasi yang jelas",
    "pengecoh": [
      "Volume suara pelan",
      "Improvisasi gerak",
      "Membaca naskah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Artikulasi adalah kejelasan dalam mengucapkan kata-kata sehingga pesan dialog sampai kepada penonton tanpa kebingungan."
  },
  {
    "id": "FC-SENI-027",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Improvisasi",
    "pertanyaan": "Saat pementasan, Budi lupa sebagian dialognya. Ia kemudian membuat kalimat sendiri yang spontan namun tetap sesuai cerita. Budi melakukan...",
    "jawabanBenar": "Improvisasi",
    "pengecoh": [
      "Intonasi",
      "Evaluasi",
      "Latihan rutin"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Improvisasi adalah gerak atau dialog spontan (tanpa naskah) yang dilakukan aktor untuk menyelamatkan pementasan."
  },
  {
    "id": "FC-SENI-028",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Tata Rias",
    "pertanyaan": "Wajah seorang siswa kelas V dirias dengan garis-garis keriput dan kumis putih agar terlihat seperti kakek-kakek. Ini adalah fungsi dari...",
    "jawabanBenar": "Tata rias karakter",
    "pengecoh": [
      "Tata panggung",
      "Tata cahaya",
      "Tata suara"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Tata rias karakter berfungsi mengubah wajah asli aktor agar sesuai dengan usia, sifat, dan ciri fisik tokoh cerita."
  },
  {
    "id": "FC-SENI-029",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Bloking",
    "pertanyaan": "Sutradara mengatur agar posisi pemain di panggung tidak saling menutupi satu sama lain dan tidak membelakangi penonton. Aturan ini disebut...",
    "jawabanBenar": "Bloking panggung",
    "pengecoh": [
      "Properti pentas",
      "Tata busana",
      "Gladi bersih"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Bloking adalah pengaturan letak dan pergerakan pemain di atas panggung agar pementasan terlihat rapi dan komunikatif."
  },
  {
    "id": "FC-SENI-030",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Karakter Penokohan",
    "pertanyaan": "Dalam drama Bawang Merah Bawang Putih, tokoh Bawang Merah memiliki watak jahat dan suka iri hati. Tokoh seperti ini disebut...",
    "jawabanBenar": "Tokoh antagonis",
    "pengecoh": [
      "Tokoh protagonis",
      "Tokoh figuran",
      "Tokoh pahlawan"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Tokoh antagonis adalah karakter yang memiliki watak buruk atau jahat dan biasanya selalu menentang tokoh utama."
  }
];
