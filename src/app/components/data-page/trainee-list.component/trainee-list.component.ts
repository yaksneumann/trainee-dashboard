import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../../shared/material/material.imports';
import { Trainee } from '../../../shared/models/trainee.interface';

@Component({
  selector: 'app-trainee-list',
  imports: [...MATERIAL_IMPORTS, CommonModule],
  templateUrl: './trainee-list.component.html',
  styleUrl: './trainee-list.component.scss'
})
export class TraineeListComponent {
  trainees = input<Trainee[]>([]);
  currentTrainee = input<Trainee | null>(null);

  selectedTrainee = output<Trainee>();
  
  displayedColumns: string[] = ['id', 'name', 'date', 'grade', 'subject', 'address', 'city', 'country', 'zip', 'email'];
  currentPage = 0;
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

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.trainees().slice(startIndex, endIndex);
  }
}

