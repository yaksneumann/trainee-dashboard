import { Component, OnChanges, SimpleChanges, inject, input, output, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ToastService } from '../../../services/toast.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { Trainee } from '../../../shared/models/trainee.interface';
import { TraineeService } from '../../../services/trainee.service';

@Component({
  selector: 'app-trainee-details',
  imports: [ CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule],
  templateUrl: './trainee-details.component.html',
  styleUrl: './trainee-details.component.scss'
})
export class TraineeDetailsComponent  {
  private traineeService = inject(TraineeService);
  private fb = inject(FormBuilder);

  selectedTraineeId = input<number | null>(null);
  currentTrainee = input<Trainee | null>(null);

  saveTrainee = output<Partial<Trainee>>();
  selectTrainee = output<number>();
  deleteTrainee = output<number>();
  newTrainee = output<void>();
  traineeForm!: FormGroup;
  get isEditMode(): boolean {
    return !!this.currentTrainee();
  }
  selectedProduct: Trainee | null = null; 
  formValues = computed(() => {
    const trainee = this.currentTrainee();
    return trainee ? {
      name: trainee.name,
      email: trainee.email,
      grade: trainee.grade,
      subject: trainee.subject,
      address: trainee.address,
      city: trainee.city,
      country: trainee.country,
      zip: trainee.zip
    } : {
      name: '',
      email: '',
      grade: '',
      subject: '',
      address: '',
      city: '',
      country: '',
      zip: ''
    };
  });

  constructor() {
    this.initializeForm();
    effect(() => {
      this.traineeForm.patchValue(this.formValues());
    });
  }

  private initializeForm() {
    this.traineeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      grade: ['', Validators.required],
      subject: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      zip: ['', Validators.required]
    });
  }

  onSubmitClick() {
    if (this.traineeForm.valid) {
      this.onSaveTrainee();
    } else {
      this.markFormGroupTouched();
    }
  }

  onSaveTrainee() {
    if (this.traineeForm.valid) {
      const formData = this.traineeForm.value;
      const currentTrainee = this.currentTrainee();

      if (this.isEditMode && currentTrainee) {
        this.traineeService.updateTrainee(formData as Trainee, currentTrainee.id);
      } else {
        this.traineeService.addTrainee(formData);
      }
        this.traineeForm.reset();
    } else {
      this.markFormGroupTouched();
    }
  }

  onNewTrainee() {
    this.traineeService.setCurrentTrainee(null);
    this.traineeForm.reset();
  }
  
  onDeleteTrainee(): void {
    const currentTrainee = this.currentTrainee();
    if (currentTrainee && currentTrainee.id) {
      if (confirm(`Are you sure you want to delete ${currentTrainee.name}?`)) {
        this.deleteTrainee.emit(currentTrainee.id);
      }
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.traineeForm.controls).forEach((key) => {
      const control = this.traineeForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.traineeForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.traineeForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${maxLength} characters`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

}
