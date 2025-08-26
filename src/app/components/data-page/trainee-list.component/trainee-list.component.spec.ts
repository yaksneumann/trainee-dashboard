import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TraineeListComponent } from './trainee-list.component';
import { TraineeService } from '../../../services/trainee.service';
import { MOCK_TRAINEES } from '../../../shared/mocks/mock-trainees';
import { Trainee } from '../../../shared/models/trainee.interface';
import { signal } from '@angular/core';

describe('TraineeListComponent', () => {
  let component: TraineeListComponent;
  let fixture: ComponentFixture<TraineeListComponent>;
  let mockTraineeService: jasmine.SpyObj<TraineeService>;

  beforeEach(async () => {
    // Create a mock TraineeService with jasmine spy objects
    const traineeServiceSpy = jasmine.createSpyObj('TraineeService', ['setFilter']);
    
    // Create a separate spy for the filteredTrainees function
    const filteredTraineesSpy = jasmine.createSpy('filteredTrainees');
    filteredTraineesSpy.and.returnValue(MOCK_TRAINEES.slice(0, 5));
    
    // Assign the spy to the service
    Object.defineProperty(traineeServiceSpy, 'filteredTrainees', {
      value: filteredTraineesSpy
    });

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        TraineeListComponent
      ],
      providers: [
        { provide: TraineeService, useValue: traineeServiceSpy }
      ]
    })
    .compileComponents();

    mockTraineeService = TestBed.inject(TraineeService) as jasmine.SpyObj<TraineeService>;
    fixture = TestBed.createComponent(TraineeListComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit selected trainee when a row is clicked', () => {
    // Arrange
    const testTrainee = MOCK_TRAINEES[0];
    spyOn(component.selectedTrainee, 'emit');
    
    // Act
    component.onSelectedTrainee(testTrainee);
    
    // Assert
    expect(component.selectedTrainee.emit).toHaveBeenCalledWith(testTrainee);
  });

  it('should update currentPage when onPageChange is called', () => {
    // Arrange
    const newPageIndex = 2;
    spyOn(component.currentPage, 'set');
    
    // Act
    component.onPageChange(newPageIndex);
    
    // Assert
    expect(component.currentPage.set).toHaveBeenCalledWith(newPageIndex);
  });

  it('should reset currentPage to 0 when filtered data is empty for current page', () => {
    // Arrange
    // Setup the mock to return an array with only a few items
    (mockTraineeService.filteredTrainees as jasmine.Spy).and.returnValue(MOCK_TRAINEES.slice(0, 5)); 
    
    // Set current page to 1, which would be empty with only 5 items and pageSize=10
    component.currentPage.set(1); 
    spyOn(component.currentPage, 'set');
    
    // Act
    component.updatePaginatedData();
    
    // Assert
    expect(component.currentPage.set).toHaveBeenCalledWith(0);
  });
});
