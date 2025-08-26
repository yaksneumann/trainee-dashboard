import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraineeService } from '../../services/trainee.service';
import { Trainee, MonitorTrainee } from '../../shared/models/trainee.interface';
import { MATERIAL_IMPORTS } from '../../shared/material/material.imports';
import { Pagination } from '../pagination/pagination';

const MONITOR_COLUMNS: string[] = ['id', 'name', 'average', 'exams'];

@Component({
  selector: 'app-monitor-page',
  standalone: true,
  imports: [...MATERIAL_IMPORTS, CommonModule, Pagination],
  templateUrl: './monitor-page.html',
  styleUrl: './monitor-page.scss'
})
export class MonitorPage {
  private traineeService = inject(TraineeService);

  showPassed = signal<boolean>(true);
  showFailed = signal<boolean>(true);
  selectedIds = signal<number[]>([]);
  nameFilter = signal<string>(this.traineeService.monitorFilter());
  currentPage = signal<number>(0);
  pageSize = 10;
  
  readonly displayedColumns = MONITOR_COLUMNS;
  
  private readonly trainees = this.traineeService.trainees();

  monitorTrainees = computed(() => this.transformTrainees(this.trainees));
  
  filteredTrainees = computed(() => {
    let result = this.monitorTrainees();
    if (this.selectedIds().length > 0) {
      result = result.filter(t => this.selectedIds().includes(t.id));
    }
    
    const nameFilterText = this.nameFilter().toLowerCase().trim();
    if (nameFilterText) {
      result = result.filter(t => t.name.toLowerCase().includes(nameFilterText));
    }
    
    if (this.showPassed() && !this.showFailed()) {
      result = result.filter(t => t.passed);
    } else if (!this.showPassed() && this.showFailed()) {
      result = result.filter(t => !t.passed);
    } else if (!this.showPassed() && !this.showFailed()) {
      result = [];
    }
    return result;
  });
  
  paginatedData = computed(() => {
    const startIndex = this.currentPage() * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTrainees().slice(startIndex, endIndex);
  });

  constructor() {
    effect(() => {
      const startIndex = this.currentPage() * this.pageSize;
      if (startIndex >= this.filteredTrainees().length && this.filteredTrainees().length > 0 && this.currentPage() > 0) {
        this.currentPage.set(0);
      }
    });
  }
  
  private transformTrainees(trainees: Trainee[]): MonitorTrainee[] {
    return trainees.map(trainee => ({
      id: trainee.id,
      name: trainee.name,
      average: trainee.grade,
      exams: Math.floor(Math.random() * 10) + 1,
      passed: trainee.grade > 65
    }));
  }
  
  onNameFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.nameFilter.set(value);
    this.traineeService.setMonitorFilter(value);
  }
  
  clearNameFilter(): void {
    this.nameFilter.set('');
    this.traineeService.setMonitorFilter('');
  }

  onPageChange(pageIndex: number): void {
    this.currentPage.set(pageIndex);
  }
  
  clearFilters(): void {
    this.traineeService.setMonitorFilter('');
    this.nameFilter.set('');
    this.selectedIds.set([]);
    this.showPassed.set(true);
    this.showFailed.set(true);
  }
}
