import { Component, input, output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../../shared/material/material.imports';
import { Trainee } from '../../../shared/models/trainee.interface';
import { TraineeService } from '../../../services/trainee.service';
import { FilterComponent } from '../../filter.component/filter.component';
import { Pagination } from '../../pagination/pagination';

const TRAINEE_COLUMNS: string[] = ['id', 'name', 'date', 'grade', 'subject', 'address', 'city', 'country', 'zip', 'email'];
@Component({
  selector: 'app-trainee-list',
  imports: [...MATERIAL_IMPORTS, CommonModule, FilterComponent, Pagination],
  templateUrl: './trainee-list.component.html',
  styleUrl: './trainee-list.component.scss'
})
export class TraineeListComponent {
  private traineeService = inject(TraineeService);
  
  trainees = input<Trainee[]>([]);
  currentTrainee = input<Trainee | null>(null);

  selectedTrainee = output<Trainee>();
  
  filteredData = this.traineeService.filteredTrainees;
  displayedColumns: string[] = TRAINEE_COLUMNS;
  currentPage = signal<number>(0);
  pageSize = 10;
  paginatedData: Trainee[] = [];

  constructor() {
    effect(() => {
      this.updatePaginatedData();
    });
  }

  onSelectedTrainee(trainee: Trainee): void {
    this.selectedTrainee.emit(trainee);
  }

  onPageChange(pageIndex: number) {
    this.currentPage.set(pageIndex);
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const filteredData = this.filteredData();
    const startIndex = this.currentPage() * this.pageSize;
    if (startIndex >= filteredData.length && filteredData.length > 0 && this.currentPage() > 0) {
      this.currentPage.set(0);
    }
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = filteredData.slice(startIndex, endIndex);
  }
}

