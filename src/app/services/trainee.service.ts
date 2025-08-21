import { Injectable, inject, signal, computed } from '@angular/core';
import { Trainee } from '../shared/models/trainee.interface';
import { MOCK_TRAINEES } from '../shared/mocks/mock-trainees';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class TraineeService {
  private static readonly STORAGE_KEY_TRAINEES = 'traineeManager.trainees';
  private static readonly STORAGE_KEY_NEXT_ID = 'trainee.nextId';

  private toastService = inject(ToastService);


  private traineesSignal = signal<Trainee[]>([...MOCK_TRAINEES]);
  readonly trainees = this.traineesSignal.asReadonly();

  private filterSignal = signal<string>('');
  readonly filter = this.filterSignal.asReadonly();

  private currentTraineeIdSignal = signal<number | null>(null);
  readonly currentTraineeId = this.currentTraineeIdSignal.asReadonly();

  readonly currentTrainee = computed<Trainee | null>(() => {
    const id = this.currentTraineeIdSignal();
    return id ? this.traineesSignal().find((trainee) => trainee.id === id) || null : null;
  });

  constructor() {
    this.loadTraineesFromStorage();
  }

  readonly filteredTrainees = computed(() => {
    const filter = this.filterSignal().toLowerCase();
    if (!filter) return this.traineesSignal();

    return this.traineesSignal().filter(
      (trainee) =>
        trainee.name.toLowerCase().includes(filter) ||
        trainee.grade.toLowerCase().includes(filter)
    );
  });

  setFilter(filter: string) {
    this.filterSignal.set(filter);
  }

  setCurrentTrainee(traineeId: number | null): void {
    this.currentTraineeIdSignal.set(traineeId);
  }

  getCurrentTraineeId(): number | null {
    return this.currentTraineeIdSignal();
  }

  addTrainee(traineeData: Omit<Trainee, 'id' | 'dateJoined'>) {
    const newTrainee: Trainee = {
      ...traineeData,
      id: this.getNextId(),
      dateJoined: new Date(),
    };
    const updatedTrainees = [...this.trainees(), newTrainee];

    this.toastService.showSuccess('Trainee added successfully!');
    this.saveTraineesToStorage();
    this.traineesSignal.set(updatedTrainees);
  }

  updateTrainee(updatedData: Trainee, id: number) {
    this.traineesSignal.update((trainees) =>
      trainees.map(trainee => 
        trainee.id === id ? { ...trainee, ...updatedData } : trainee
      )
    );

    this.saveTraineesToStorage();
    this.toastService.showSuccess('Trainee updated successfully!');
  }

  deleteTrainee(id: number) {
    this.traineesSignal.update((trainees) =>
      trainees.filter(trainee => trainee.id !== id)
    );
    this.toastService.showInfo('Trainee deleted successfully!');
    this.currentTraineeIdSignal.set(null);
  }

  private loadTraineesFromStorage(): void {
    try {
      const storedProducts = localStorage.getItem(
        TraineeService.STORAGE_KEY_TRAINEES
      );
      if (storedProducts) {
        const trainees: Trainee[] = JSON.parse(storedProducts);
        const traineesWithDates = trainees.map((trainee) => ({
          ...trainee,
          dateJoined: new Date(trainee.dateJoined),
        }));
        this.traineesSignal.set(traineesWithDates);
      } else {
        this.initializeSampleData();
      }
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
      this.initializeSampleData();
    }
  }

  private saveTraineesToStorage(): void {
    try {
      localStorage.setItem(
        TraineeService.STORAGE_KEY_TRAINEES,
        JSON.stringify(this.traineesSignal())
      );
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }

  private getNextId(): number {
    try {
      const storedNextId = localStorage.getItem(
        TraineeService.STORAGE_KEY_NEXT_ID
      );
      let nextId = storedNextId ? parseInt(storedNextId, 10) : 1;
      const currentProducts = this.traineesSignal();

      if (currentProducts.length > 0) {
        const maxExistingId = Math.max(...currentProducts.map((p) => p.id));
        nextId = Math.max(nextId, maxExistingId + 1);
      }
      localStorage.setItem(
        TraineeService.STORAGE_KEY_NEXT_ID,
        (nextId + 1).toString()
      );
      return nextId;
    } catch (error) {
      console.error('Error getting next ID:', error);
      return Date.now();
    }
  }

  private initializeSampleData(): void {
    const trainees = MOCK_TRAINEES.map((trainee, index) => ({
      ...trainee,
      id: index + 1,
    }));
    this.traineesSignal.set(trainees);
    this.saveTraineesToStorage();
    localStorage.setItem(TraineeService.STORAGE_KEY_NEXT_ID, '12');
  }
}
