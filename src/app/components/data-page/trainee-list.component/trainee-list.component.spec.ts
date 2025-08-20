import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeListComponent } from './trainee-list.component';

describe('TraineeListComponent', () => {
  let component: TraineeListComponent;
  let fixture: ComponentFixture<TraineeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraineeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraineeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
