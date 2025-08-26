import { Component, input, output, model, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../shared/material/material.imports';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class Pagination {
  totalItems = input<number>(0);
  itemsPerPage = input<number>(10);
  totalFilteredItems = input<number>(0);

  pageIndex = model<number>(0);

  pageChange = output<number>();

  showingText = computed(() => {
    const total = this.totalItems();
    const filtered = this.totalFilteredItems();
    
    if (total === filtered) {
      return `Showing: ${filtered} trainees`;
    } else {
      return `Showing: ${filtered} of ${total} trainees`;
    }
  });

  onPageChange(event: any): void {
    this.pageIndex.set(event.pageIndex);
    this.pageChange.emit(event.pageIndex);
  }
}
