import { EducationalContent } from '../engine/EducationalEngine';

export interface TeacherBankRecord {
  id: string;
  jenjang: string;
  mataPelajaran: string;
  uploadDate: number;
  updatedAt: number;
  questions: EducationalContent[];
}

export class TeacherBankStore {
  private static readonly STORE_KEY = 'heli-rescue-teacher-bank-v1';

  static loadAll(): Record<string, TeacherBankRecord> {
    try {
      const data = localStorage.getItem(this.STORE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load teacher bank', e);
    }
    return {};
  }

  static loadByJenjangMapel(jenjang: string, mapel: string): TeacherBankRecord | undefined {
    const all = this.loadAll();
    const id = `${jenjang}_${mapel}`.toUpperCase().replace(/\s+/g, '_');
    return all[id];
  }

  static save(jenjang: string, mapel: string, questions: EducationalContent[]) {
    try {
      const all = this.loadAll();
      const id = `${jenjang}_${mapel}`.toUpperCase().replace(/\s+/g, '_');
      
      const record: TeacherBankRecord = {
        id,
        jenjang,
        mataPelajaran: mapel,
        uploadDate: all[id]?.uploadDate || Date.now(),
        updatedAt: Date.now(),
        questions
      };
      
      all[id] = record;
      localStorage.setItem(this.STORE_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save teacher bank', e);
      throw new Error('Gagal menyimpan bank soal. Penyimpanan browser mungkin penuh.');
    }
  }

  static remove(id: string) {
    try {
      const all = this.loadAll();
      delete all[id];
      localStorage.setItem(this.STORE_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to remove teacher bank', e);
    }
  }

  static clearAll() {
    try {
      localStorage.removeItem(this.STORE_KEY);
    } catch (e) {
      console.error('Failed to clear teacher bank', e);
    }
  }
}
