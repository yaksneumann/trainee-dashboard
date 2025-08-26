import { Component, inject, signal, computed, ElementRef, effect, viewChildren, afterNextRender, untracked, DestroyRef } from '@angular/core';
import { Chart, ChartType, CategoryScale, LinearScale, PointElement, LineElement, BarElement, LineController, BarController, Title, Tooltip, Legend } from 'chart.js';
import { TraineeService } from '../../services/trainee.service';
import { MATERIAL_IMPORTS } from '../../shared/material/material.imports';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Trainee } from '../../shared/models/trainee.interface';

@Component({
  selector: 'app-analysis-page',
  standalone: true,
  imports: [DragDropModule, ...MATERIAL_IMPORTS],
  templateUrl: './analysis-page.html',
  styleUrl: './analysis-page.scss'
})
export class AnalysisPage {
  private traineeService = inject(TraineeService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.initializeChartJs();
    this.setupEffects();
    
    afterNextRender(() => {
      this.redrawVisible(['chart1', 'chart2', 'chart3']);
    });

    this.destroyRef.onDestroy(() => this.destroyCharts());
  }
  
  private initializeChartJs(): void {
    Chart.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      LineController,
      BarController,
      Title,
      Tooltip,
      Legend
    );
  }
  
  private setupEffects(): void {
    effect(() => {
      const ids = this.selectedIds();
      untracked(() => this.redrawVisible(['chart1', 'chart2']));
    });
    
    effect(() => {
      const subjects = this.selectedSubjects();
      untracked(() => this.redrawVisible(['chart3']));
    });
    
    effect(() => {
      this.chartLayouts();
      untracked(() => {
        setTimeout(() => this.redrawVisible(['chart1', 'chart2', 'chart3']), 50);
      });
    });
  }
  
  chart1Canvas0 = viewChildren<ElementRef<HTMLCanvasElement>>('chart1Canvas0');
  chart1Canvas1 = viewChildren<ElementRef<HTMLCanvasElement>>('chart1Canvas1');
  chart2Canvas0 = viewChildren<ElementRef<HTMLCanvasElement>>('chart2Canvas0');
  chart2Canvas1 = viewChildren<ElementRef<HTMLCanvasElement>>('chart2Canvas1');
  chart3Canvas0 = viewChildren<ElementRef<HTMLCanvasElement>>('chart3Canvas0');
  chart3Canvas1 = viewChildren<ElementRef<HTMLCanvasElement>>('chart3Canvas1');
  
  private chart1: Chart | null = null;
  private chart2: Chart | null = null;
  private chart3: Chart | null = null;
  
  trainees = computed(() => this.traineeService.trainees());
  allSubjects = computed(() => {
    const subjects = new Set<string>();
    this.trainees().forEach(trainee => {
      subjects.add(trainee.subject);
    });
    return Array.from(subjects);
  });
  
  readonly selectedIds = signal<number[]>([]);
  readonly selectedSubjects = signal<string[]>([]);
  readonly chartLayouts = signal<string[]>(['chart1', 'chart3', 'chart2']);
  activeCharts = computed(() => this.chartLayouts().slice(0, 2));
  hiddenChart = computed(() => this.chartLayouts()[2]);
  
  selectedTrainees = computed(() => {
    if (this.selectedIds().length === 0) return [];
    return this.trainees().filter(trainee => 
      this.selectedIds().includes(trainee.id)
    );
  });

  swapWithHidden(chartIndex: number): void {
    const currentLayouts = [...this.chartLayouts()];
    const temp = currentLayouts[2];
    currentLayouts[2] = currentLayouts[chartIndex];
    currentLayouts[chartIndex] = temp;
    this.chartLayouts.set(currentLayouts);
  }
  
  private destroyCharts(): void {
    if (this.chart1) { this.chart1.destroy(); this.chart1 = null; }
    if (this.chart2) { this.chart2.destroy(); this.chart2 = null; }
    if (this.chart3) { this.chart3.destroy(); this.chart3 = null; }
  }
  
  private redrawVisible(charts: string[]): void {
    charts.forEach(chartType => {
      if (!this.isChartInView(chartType)) return;
      
      if ((chartType === 'chart1' || chartType === 'chart2') && this.selectedIds().length === 0) return;
      if (chartType === 'chart3' && this.selectedSubjects().length === 0) return;
      
      switch (chartType) {
        case 'chart1': this.renderGradesOverTimeChart(); break;
        case 'chart2': this.renderStudentAveragesChart(); break;
        case 'chart3': this.renderSubjectAveragesChart(); break;
      }
    });
  }
  
  drop(event: CdkDragDrop<string[]>) {
    const layouts = [...this.chartLayouts()];
    const hiddenIndex = 2;

    if (event.previousContainer === event.container && event.container.id === 'chartsList') {
      if (event.previousIndex === event.currentIndex) return;
      const from = event.previousIndex;
      const to = event.currentIndex;
      if (from > 1 || to > 1) return;
      const moved = layouts.splice(from, 1)[0];
      layouts.splice(to, 0, moved);
    } else if (event.previousContainer.id === 'chartsList' && event.container.id === 'hiddenChartList') {
      const from = event.previousIndex; 
      if (from > 1) return;
      const temp = layouts[hiddenIndex];
      layouts[hiddenIndex] = layouts[from];
      layouts[from] = temp;
    } else if (event.previousContainer.id === 'hiddenChartList' && event.container.id === 'chartsList') {
      const to = Math.min(Math.max(event.currentIndex, 0), 1);
      const temp = layouts[hiddenIndex];
      layouts[hiddenIndex] = layouts[to];
      layouts[to] = temp;
    }

    this.chartLayouts.set(layouts);
  }
  
  private getCanvas(chart: string): HTMLCanvasElement | null {
    const pos = this.activeCharts().indexOf(chart);
    if (pos === -1) return null;
    
    const getCanvasSignal = (chartType: string, position: number) => {
      if (chartType === 'chart1') return position === 0 ? this.chart1Canvas0() : this.chart1Canvas1();
      if (chartType === 'chart2') return position === 0 ? this.chart2Canvas0() : this.chart2Canvas1();
      if (chartType === 'chart3') return position === 0 ? this.chart3Canvas0() : this.chart3Canvas1();
      return [];
    };
    
    const canvasRefs = getCanvasSignal(chart, pos);
    return canvasRefs.length > 0 ? canvasRefs[0].nativeElement : null;
  }
  
  private isChartInView(chartType: string): boolean {
    return this.activeCharts().includes(chartType);
  }
  
  renderGradesOverTimeChart(): void {
    if (this.selectedIds().length === 0) return;
    
    try {
      const canvasEl = this.getCanvas('chart1');
      if (!canvasEl) return;
      if (this.chart1) { this.chart1.destroy(); this.chart1 = null; }
      
      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;
        
      const selectedTrainees = this.selectedTrainees();
      const datasets = selectedTrainees.map(trainee => {
        const gradeData = this.getGradesOverTime(trainee.id);
        const hue = (trainee.id * 137) % 360;
        const color = `hsl(${hue}, 70%, 60%)`;
        
        return {
          label: trainee.name,
          data: gradeData.data,
          borderColor: color,
          backgroundColor: `${color}33`,
          tension: 0.3
        };
      });
      
      const labels = selectedTrainees.length > 0 ? this.getGradesOverTime(selectedTrainees[0].id).labels : [];
      
      this.chart1 = new Chart(ctx, {
        type: 'line' as ChartType,
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 50, max: 100, title: { display: true, text: 'Grade' } },
            x: { title: { display: true, text: 'Month' } }
          },
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Grades Over Time' }
          }
        }
      });
    } catch (error) {
      console.error('Error creating line chart:', error);
    }
  }
  
  renderStudentAveragesChart(): void {
    if (this.selectedIds().length === 0) return;
    
    const canvasEl = this.getCanvas('chart2');
    if (!canvasEl) return;
    if (this.chart2) { this.chart2.destroy(); this.chart2 = null; }
    
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    
    const selectedTrainees = this.selectedTrainees();
    const labels = selectedTrainees.map(t => t.name);
    const data = selectedTrainees.map(t => t.grade);
    
    const backgroundColors = selectedTrainees.map(trainee => {
      const hue = (trainee.id * 137) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    });
    
    this.chart2 = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels,
        datasets: [{
          label: 'Average Grade',
          data,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 50, max: 100, title: { display: true, text: 'Average Grade' } }
        },
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Student Averages' }
        }
      }
    });
  }
  
  renderSubjectAveragesChart(): void {
    if (this.selectedSubjects().length === 0) return;
    
    const canvasEl = this.getCanvas('chart3');
    if (!canvasEl) return;
    if (this.chart3) { this.chart3.destroy(); this.chart3 = null; }
    
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    
    const subjects = this.selectedSubjects();
    const data = subjects.map(subject => this.computeSubjectAverage(subject));
    
    const backgroundColors = subjects.map((subject, index) => {
      const hue = (index * 137) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    });
    
    this.chart3 = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: subjects,
        datasets: [{
          label: 'Average Grade',
          data,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: { min: 50, max: 100, title: { display: true, text: 'Average Grade' } }
        },
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Subject Averages' }
        }
      }
    });
  }
  
  private getGradesOverTime(traineeId: number) {
    const trainee = this.getTraineeById(traineeId);
    const base = trainee?.grade ?? 50;
    const deltas = [-8, -6, -4, -3, -2, -1, 0, +1, +2, +3, +4, +5];
    const data = deltas.map(d => Math.max(0, Math.min(100, base + d)));
    return { 
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
      data 
    };
  }

  computeSubjectAverage(subject: string): number {
    const trainees = this.trainees().filter(t => t.subject === subject);
    if (trainees.length === 0) return 0;
    return +(trainees.reduce((sum, t) => sum + t.grade, 0) / trainees.length).toFixed(2);
  }
  
  getTraineeById(id: number): Trainee | undefined {
    return this.trainees().find(t => t.id === id);
  }
}
