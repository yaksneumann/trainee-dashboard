import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TraineeListComponent } from './trainee-list.component';
import { TraineeService } from '../../../services/trainee.service';
import { MOCK_TRAINEES } from '../../../shared/mocks/mock-trainees';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TraineeListComponent', () => {
  let component: TraineeListComponent;
  let fixture: ComponentFixture<TraineeListComponent>;
  let mockTraineeService: jasmine.SpyObj<TraineeService> & { 
    filterText: any; 
    filteredTrainees: any;
  };

  beforeEach(async () => {
    const filterTextSignal = signal('');
    
    const filteredTraineesSpy = jasmine.createSpy('filteredTrainees');
    filteredTraineesSpy.and.returnValue(MOCK_TRAINEES.slice(0, 5));
    
    const traineeServiceSpy = jasmine.createSpyObj('TraineeService', 
      ['setFilter', 'toggleAdvancedFilter'], 
      {
        filterText: filterTextSignal,
        filteredTrainees: filteredTraineesSpy
      }
    );

    await TestBed.configureTestingModule({
      imports: [
        TraineeListComponent
      ],
      providers: [
        { provide: TraineeService, useValue: traineeServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
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

  it('should update filtered results when filter changes', () => {
    const mockTrainee = MOCK_TRAINEES[0];
    
    (mockTraineeService.filteredTrainees as jasmine.Spy).and.returnValue([mockTrainee]);
    
    component.currentPage.set(0);

    component.updatePaginatedData();
    
    expect(component.paginatedData.length).toBe(1);
    expect(component.paginatedData[0]).toEqual(mockTrainee);
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
    (mockTraineeService.filteredTrainees as jasmine.Spy).and.returnValue(MOCK_TRAINEES.slice(0, 5)); 
    
    component.currentPage.set(1); 
    spyOn(component.currentPage, 'set');
    
    component.updatePaginatedData();
    
    expect(component.currentPage.set).toHaveBeenCalledWith(0);
  });
});
