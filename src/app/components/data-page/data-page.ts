import { Component, inject } from '@angular/core';
import { TraineeListComponent } from './trainee-list.component/trainee-list.component';
import { TraineeDetailsComponent } from './trainee-details.component/trainee-details.component';
import { TraineeService } from '../../services/trainee.service';
import { Trainee } from '../../shared/models/trainee.interface';

@Component({
  selector: 'app-data-page',
  imports: [TraineeListComponent, TraineeDetailsComponent],
  templateUrl: './data-page.html',
  styleUrl: './data-page.scss'
})
export class DataPage {
  private traineeService = inject(TraineeService);

  trainees = this.traineeService.trainees;
  currentTrainee = this.traineeService.currentTrainee;

  onSelectTrainee(trainee: Trainee): void {
    this.traineeService.setCurrentTrainee(trainee.id);
  }

  onRemoveTrainee(traineeId: number): void {
    this.traineeService.deleteTrainee(traineeId);
  }
  
}
