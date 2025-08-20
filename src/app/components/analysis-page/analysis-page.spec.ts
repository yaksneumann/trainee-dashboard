import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisPage } from './analysis-page';

describe('AnalysisPage', () => {
  let component: AnalysisPage;
  let fixture: ComponentFixture<AnalysisPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
