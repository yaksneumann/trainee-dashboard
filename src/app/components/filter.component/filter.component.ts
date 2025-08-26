import { Component, inject, signal, effect } from '@angular/core';
import { MATERIAL_IMPORTS } from '../../shared/material/material.imports';
import { TraineeService } from '../../services/trainee.service';

@Component({
  selector: 'app-filter',
  imports: [...MATERIAL_IMPORTS],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent {
  private traineeService = inject(TraineeService);
  
  filterText = signal<string>('');
  showHelp = signal<boolean>(false);
  
  constructor() {
    this.filterText.set(this.traineeService.filterText());
    this.traineeService.toggleAdvancedFilter(true);
    
    effect(() => {
      this.traineeService.setFilter(this.filterText());
    });
  }
  
  onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filterText.set(input.value);
  }
  
  toggleHelp(): void {
    this.showHelp.update(value => !value);
  }
  
  clearFilter(): void {
    this.filterText.set('');
  }
}