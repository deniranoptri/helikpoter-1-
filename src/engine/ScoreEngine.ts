export interface MissionScore {
  totalScore: number;
  fireScore: number;
  firesExtinguished: number;
  totalFires: number;
  correctAnswers: number;
  incorrectAnswers: number;
  waterUsed: number;
  waterCapacity: number;
  accuracy: number;
  efficiency: number;
}

export interface SessionResultSnapshot {
  sessionId: string;
  timestamp: number;
  jenjang: string;
  mataPelajaran: string;
  gameMode: string;
  duration: number;
  isSaved?: boolean;
  p1Name?: string;
  p2Name?: string;
  p3Name?: string;
  p4Name?: string;
  globalStats: {
    questionsPresented: number;
    correctAnswers: number;
    incorrectAnswers: number;
  };
  players: {
    P1?: MissionScore;
    P2?: MissionScore;
    P3?: MissionScore;
    P4?: MissionScore;
  };
  teamScore?: {
    teamA: number;
    teamB: number;
  };
  winner: string;
}

export class ScoreEngine {
  private firesExtinguished: Set<string> = new Set();
  private totalFires: number = 3;
  private waterUsed: number = 0;
  // Based on a typical run, let's say 300 units is a solid baseline for 3 fires.
  private waterCapacity: number = 300; 
  private cloudPenalty: number = 0;

  public recordFireExtinguished(fireId: string) {
    this.firesExtinguished.add(fireId);
  }

  public recordWaterUsed(amount: number) {
    if (amount > 0) {
      this.waterUsed += amount;
    }
  }

  public applyCloudPenalty() {
    this.cloudPenalty += 50;
  }

  public getScore(correctAnswers: number, incorrectAnswers: number): MissionScore {
    const totalAnswered = correctAnswers + incorrectAnswers;
    const accuracy = totalAnswered > 0 ? correctAnswers / totalAnswered : 0;

    let efficiency = 1 - (this.waterUsed / this.waterCapacity);
    if (efficiency < 0) efficiency = 0;
    if (efficiency > 1) efficiency = 1;

    // Fire Score: Exactly 100 per fire, minus cloud penalty
    let fireScore = (this.firesExtinguished.size * 100) - this.cloudPenalty;
    if (fireScore < 0) fireScore = 0;
    
    // Education Score: Meaningful contribution (removed to avoid double-counting, ensuring exactly +100 per target)
    const baseEdScore = 0; // (correctAnswers * 500) - (incorrectAnswers * 200);
    const educationScore = 0; // Math.max(0, baseEdScore);

    // Efficiency Bonus: Up to 1000 based on water saved
    const efficiencyBonus = Math.floor(efficiency * 1000);

    let totalScore = fireScore + educationScore + efficiencyBonus;

    return {
      totalScore,
      fireScore,
      firesExtinguished: this.firesExtinguished.size,
      totalFires: this.totalFires,
      correctAnswers,
      incorrectAnswers,
      waterUsed: this.waterUsed,
      waterCapacity: this.waterCapacity,
      accuracy,
      efficiency
    };
  }

  public reset() {
    this.firesExtinguished.clear();
    this.waterUsed = 0;
    this.cloudPenalty = 0;
  }
}
