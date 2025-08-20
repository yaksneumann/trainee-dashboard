// import { Component, output } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { TraineeService } from '../../services/trainee.service';
// import { MatButtonModule } from '@angular/material/button';
// import { Trainee } from '../../shared/models/trainee.interface';

// @Component({
//   selector: 'app-filter.component',
//   imports: [CommonModule, FormsModule],
//   templateUrl: './filter.component.html',
//   styleUrl: './filter.component.css'
// })
// export class FilterComponent {

//   traineeAdded = output<void>();
  
//   showAddForm = false;
//   enrollmentDateString = '';
  
//   newTrainee: Omit<Trainee, 'id' | 'dateJoined' | 'address'> = {
//     name: '',
//     grade: '',
//     email: '',
//     // address: '';
//     subject: '',
//   };

//   constructor(public traineeService: TraineeService) {}

//   onFilterChange(event: any) {
//     this.traineeService.setFilter(event.target.value);
//   }

//   toggleAddForm() {
//     this.showAddForm = !this.showAddForm;
//     if (!this.showAddForm) {
//       this.resetForm();
//     }
//   }

//   addTrainee() {
//     if (this.enrollmentDateString) {
//       this.newTrainee.enrollmentDate = new Date(this.enrollmentDateString);
//     }
    
//     this.traineeService.addTrainee(this.newTrainee);
//     this.traineeAdded.emit();
//     this.resetForm();
//     this.showAddForm = false;
//   }

//   resetForm() {
//     // this.newTrainee = {
//     //   name: '',
//     //   grade: '',
//     //   email: '',
//     //   department: '',
//     //   enrollmentDate: new Date(),
//     //   status: 'Active'
//     // };
//     // this.enrollmentDateString = '';
//   }
// }