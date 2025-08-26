import { Component, inject, signal, computed, ElementRef, AfterViewInit, OnDestroy, effect, viewChild, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TraineeService } from '../../services/trainee.service';
import { MATERIAL_IMPORTS } from '../../shared/material/material.imports';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Trainee, MonitorTrainee } from '../../shared/models/trainee.interface';
import { Chart, ChartConfiguration, ChartType, ChartData } from 'chart.js';
import { CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

@Component({
  selector: 'app-analysis-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './analysis-page.html',
  styleUrl: './analysis-page.scss'
})
export class AnalysisPage implements AfterViewInit, OnDestroy {
  private traineeService = inject(TraineeService);

  // Register the required Chart.js components
  constructor() {
    // Add a Chart.js clear method to force Chart.js to reset canvas registry
    // This is a workaround for the "Canvas is already in use" error
    (Chart as any).helpers = (Chart as any).helpers || {};
    (Chart as any).helpers.each = function(loopable: any, fn: any, context?: any, _array?: any) {
      // Custom implementation that does nothing - prevents canvas registry errors
    };
    
    Chart.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      Title,
      Tooltip,
      Legend
    );
    
    if (this.trainees().length > 0) {
      console.log('Selected Trainees:', this.trainees());
    }
    
    if (this.allSubjects().length > 0) {
      console.log('All Subjects:', this.allSubjects());
    }
    
    // Set up effects to redraw charts when relevant data changes
    effect(() => {
      const ids = this.selectedIds();
      console.log('Selected IDs:', ids);
      
      // Destroy existing charts first to prevent "Canvas already in use" errors
      if (this.chart1) {
        this.chart1.destroy();
        this.chart1 = null;
      }
      
      if (this.chart2) {
        this.chart2.destroy();
        this.chart2 = null;
      }
      
      if (ids.length > 0) {
        // Only render if the chart is in view
        if (this.isChartInView('chart1')) {
          setTimeout(() => this.renderGradesOverTimeChart(), 0);
        }
        
        if (this.isChartInView('chart2')) {
          setTimeout(() => this.renderStudentAveragesChart(), 0);
        }
      }
    });
    
    // effect(() => {
    //   const ids = this.selectedIds();
    //   console.log('Selected IDs:', ids);
    //   if (ids.length > 0 && this.chart2 && this.isChartInView('chart2')) {
    //     this.renderStudentAveragesChart();
    //   }
    // });
    
    effect(() => {
      const subjects = this.selectedSubjects();
      console.log('Selected Subjects:', subjects);
      
      // Destroy existing chart first to prevent "Canvas already in use" errors
      if (this.chart3) {
        this.chart3.destroy();
        this.chart3 = null;
      }
      
      if (subjects.length > 0 && this.isChartInView('chart3')) {
        setTimeout(() => this.renderSubjectAveragesChart(), 0);
      }
    });
    
    effect(() => {
      const layouts = this.chartLayouts();
      console.log('Chart Layouts:', layouts);
      setTimeout(() => this.updateChartsAfterLayoutChange(), 1000);
    });
  }
  
  // Using ViewChildren to handle multiple instances of the same canvas reference
  @ViewChildren('chart1Canvas0') chart1Canvas0!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('chart1Canvas1') chart1Canvas1!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('chart2Canvas0') chart2Canvas0!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('chart2Canvas1') chart2Canvas1!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('chart3Canvas0') chart3Canvas0!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('chart3Canvas1') chart3Canvas1!: QueryList<ElementRef<HTMLCanvasElement>>;
  
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
  
  selectedIds = signal<number[]>([]);
  selectedSubjects = signal<string[]>([]);
  
  chartLayouts = signal<string[]>(['chart1', 'chart3', 'chart2']);
  activeCharts = computed(() => this.chartLayouts().slice(0, 2));
  hiddenChart = computed(() => this.chartLayouts()[2]);
  
  selectedTrainees = computed(() => {
    if (this.selectedIds().length === 0) return [];
    return this.trainees().filter(trainee => 
      this.selectedIds().includes(trainee.id)
    );
  });
  
  ngAfterViewInit(): void {
    // Wait for the QueryLists to be populated
    setTimeout(() => {
      console.log('AfterViewInit - Chart1Canvas0:', this.chart1Canvas0?.length);
      console.log('AfterViewInit - Chart1Canvas1:', this.chart1Canvas1?.length);
      console.log('AfterViewInit - Chart2Canvas0:', this.chart2Canvas0?.length);
      console.log('AfterViewInit - Chart2Canvas1:', this.chart2Canvas1?.length);
      console.log('AfterViewInit - Chart3Canvas0:', this.chart3Canvas0?.length);
      console.log('AfterViewInit - Chart3Canvas1:', this.chart3Canvas1?.length);
      
      // Set up change detection for the canvases
      this.chart1Canvas0.changes.subscribe((changes: QueryList<ElementRef>) => {
        console.log('Chart1Canvas0 changed:', changes.length);
      });
      
      this.chart1Canvas1.changes.subscribe((changes: QueryList<ElementRef>) => {
        console.log('Chart1Canvas1 changed:', changes.length);
      });
      
      this.chart2Canvas0.changes.subscribe((changes: QueryList<ElementRef>) => {
        console.log('Chart2Canvas0 changed:', changes.length);
      });
      
      this.chart2Canvas1.changes.subscribe((changes: QueryList<ElementRef>) => {
        console.log('Chart2Canvas1 changed:', changes.length);
      });
      
      this.chart3Canvas0.changes.subscribe((changes: QueryList<ElementRef>) => {
        console.log('Chart3Canvas0 changed:', changes.length);
      });
      
      this.chart3Canvas1.changes.subscribe((changes: QueryList<ElementRef>) => {
        console.log('Chart3Canvas1 changed:', changes.length);
      });
      
      // Initialize charts
      this.initializeCharts();
    }, 500); // Longer delay to ensure view is fully initialized
  }

  ngOnDestroy(): void {
    // Cleanup chart instances to prevent memory leaks
    this.destroyCharts();
  }
  
  drop(event: CdkDragDrop<string[]>) {
    const currentLayouts = [...this.chartLayouts()];
    moveItemInArray(currentLayouts, event.previousIndex, event.currentIndex);
    this.chartLayouts.set(currentLayouts);
  }
  
  // Swap a chart with the hidden one
  swapWithHidden(chartIndex: number): void {
    const currentLayouts = [...this.chartLayouts()];
    const temp = currentLayouts[2];
    currentLayouts[2] = currentLayouts[chartIndex];
    currentLayouts[chartIndex] = temp;
    this.chartLayouts.set(currentLayouts);
  }
  
  // Initialize chart instances
  private initializeCharts(): void {
    // Destroy any existing charts first
    this.destroyCharts();
    
    if (this.isChartInView('chart1')) {
      this.renderGradesOverTimeChart();
    }
    
    if (this.isChartInView('chart2')) {
      this.renderStudentAveragesChart();
    }
    
    if (this.isChartInView('chart3')) {
      this.renderSubjectAveragesChart();
    }
  }
  
  private updateChartsAfterLayoutChange(): void {
    console.log('Layout changed, updating charts');
    
    // First destroy all existing charts
    this.destroyCharts();
    
    // Use a longer timeout to ensure the DOM has completely updated
    setTimeout(() => {
      console.log('After layout change - Chart1Canvas0:', this.chart1Canvas0?.length);
      console.log('After layout change - Chart1Canvas1:', this.chart1Canvas1?.length);
      console.log('After layout change - Chart2Canvas0:', this.chart2Canvas0?.length);
      console.log('After layout change - Chart2Canvas1:', this.chart2Canvas1?.length);
      console.log('After layout change - Chart3Canvas0:', this.chart3Canvas0?.length);
      console.log('After layout change - Chart3Canvas1:', this.chart3Canvas1?.length);
      console.log('Active charts:', this.activeCharts());
      
      // Reinitialize charts with some delay to ensure canvas elements are ready
      if (this.isChartInView('chart1')) {
        console.log('Rendering chart1 after layout change');
        this.renderGradesOverTimeChart();
      }
      
      if (this.isChartInView('chart2')) {
        console.log('Rendering chart2 after layout change');
        this.renderStudentAveragesChart();
      }
      
      if (this.isChartInView('chart3')) {
        console.log('Rendering chart3 after layout change');
        this.renderSubjectAveragesChart();
      }
    }, 500); // Increased timeout for better DOM synchronization
  }
  
  private destroyCharts(): void {
    console.log('Destroying all charts');
    
    if (this.chart1) {
      try {
        this.chart1.destroy();
      } catch (error) {
        console.error('Error destroying chart1:', error);
      }
      this.chart1 = null;
    }
    
    if (this.chart2) {
      try {
        this.chart2.destroy();
      } catch (error) {
        console.error('Error destroying chart2:', error);
      }
      this.chart2 = null;
    }
    
    if (this.chart3) {
      try {
        this.chart3.destroy();
      } catch (error) {
        console.error('Error destroying chart3:', error);
      }
      this.chart3 = null;
    }
    
    // Force clear any existing chart instances that might be attached to canvases
    const clearCanvas = (canvas: ElementRef<HTMLCanvasElement>) => {
      const canvasElement = canvas.nativeElement;
      // This helps clear any lingering chart associations
      canvasElement.getContext('2d')?.clearRect(0, 0, canvasElement.width, canvasElement.height);
    };
    
    if (this.chart1Canvas0 && this.chart1Canvas0.length) {
      this.chart1Canvas0.forEach(clearCanvas);
    }
    
    if (this.chart1Canvas1 && this.chart1Canvas1.length) {
      this.chart1Canvas1.forEach(clearCanvas);
    }
    
    if (this.chart2Canvas0 && this.chart2Canvas0.length) {
      this.chart2Canvas0.forEach(clearCanvas);
    }
    
    if (this.chart2Canvas1 && this.chart2Canvas1.length) {
      this.chart2Canvas1.forEach(clearCanvas);
    }
    
    if (this.chart3Canvas0 && this.chart3Canvas0.length) {
      this.chart3Canvas0.forEach(clearCanvas);
    }
    
    if (this.chart3Canvas1 && this.chart3Canvas1.length) {
      this.chart3Canvas1.forEach(clearCanvas);
    }
  }
  
  // Helper methods to get the active chart canvases based on layout
  private getActiveChart1Canvas(): ElementRef<HTMLCanvasElement> | null {
    // If chart1 is not in active charts, return null
    if (!this.isChartInView('chart1')) return null;
    
    // Get index where chart1 is in the activeCharts
    const activeIndex = this.activeCharts().indexOf('chart1');
    console.log('Chart1 active index:', activeIndex);
    
    // Based on the position, use the appropriate canvas
    if (activeIndex === 0 && this.chart1Canvas0.length > 0) {
      console.log('Using chart1Canvas0');
      return this.chart1Canvas0.first;
    } else if (activeIndex === 1 && this.chart1Canvas1.length > 0) {
      console.log('Using chart1Canvas1');
      return this.chart1Canvas1.first;
    }
    
    // Fallback in case canvases aren't matched properly
    if (this.chart1Canvas0.length > 0) return this.chart1Canvas0.first;
    if (this.chart1Canvas1.length > 0) return this.chart1Canvas1.first;
    
    console.log('No canvas available for chart1');
    return null;
  }
  
  private getActiveChart2Canvas(): ElementRef<HTMLCanvasElement> | null {
    // If chart2 is not in active charts, return null
    if (!this.isChartInView('chart2')) return null;
    
    // Get index where chart2 is in the activeCharts
    const activeIndex = this.activeCharts().indexOf('chart2');
    console.log('Chart2 active index:', activeIndex);
    
    // Based on the position, use the appropriate canvas
    if (activeIndex === 0 && this.chart2Canvas0.length > 0) {
      console.log('Using chart2Canvas0');
      return this.chart2Canvas0.first;
    } else if (activeIndex === 1 && this.chart2Canvas1.length > 0) {
      console.log('Using chart2Canvas1');
      return this.chart2Canvas1.first;
    }
    
    // Fallback in case canvases aren't matched properly
    if (this.chart2Canvas0.length > 0) return this.chart2Canvas0.first;
    if (this.chart2Canvas1.length > 0) return this.chart2Canvas1.first;
    
    console.log('No canvas available for chart2');
    return null;
  }
  
  private getActiveChart3Canvas(): ElementRef<HTMLCanvasElement> | null {
    // If chart3 is not in active charts, return null
    if (!this.isChartInView('chart3')) return null;
    
    // Get index where chart3 is in the activeCharts
    const activeIndex = this.activeCharts().indexOf('chart3');
    console.log('Chart3 active index:', activeIndex);
    
    // Based on the position, use the appropriate canvas
    if (activeIndex === 0 && this.chart3Canvas0.length > 0) {
      console.log('Using chart3Canvas0');
      return this.chart3Canvas0.first;
    } else if (activeIndex === 1 && this.chart3Canvas1.length > 0) {
      console.log('Using chart3Canvas1');
      return this.chart3Canvas1.first;
    }
    
    // Fallback in case canvases aren't matched properly
    if (this.chart3Canvas0.length > 0) return this.chart3Canvas0.first;
    if (this.chart3Canvas1.length > 0) return this.chart3Canvas1.first;
    
    console.log('No canvas available for chart3');
    return null;
  }
  
  private isChartInView(chartType: string): boolean {
    return this.activeCharts().includes(chartType);
  }
  
  // Chart 1: Grades over time
  renderGradesOverTimeChart(): void {
    if (this.selectedIds().length === 0) return;
    
    // Always destroy the previous chart instance to prevent "Canvas is already in use" errors
    if (this.chart1) {
      console.log('Destroying chart1 instance');
      this.chart1.destroy();
      this.chart1 = null;
    }
    
    // Get the active canvas for chart1
    const canvas = this.getActiveChart1Canvas();
    if (!canvas) {
      console.log('No canvas available for chart1');
      return;
    }
    
    console.log('Rendering chart1 on canvas:', canvas);
    
    try {
      const ctx = canvas.nativeElement.getContext('2d');
      if (!ctx) {
        console.log('No 2d context available for chart1 canvas');
        return;
      }
      
      const selectedTrainees = this.selectedTrainees();
      const datasets = selectedTrainees.map(trainee => {
        const gradeData = this.getGradesOverTime(trainee.id);
        // Generate a color based on the trainee ID for consistency
        const hue = (trainee.id * 137) % 360; // Prime number for better distribution
        const color = `hsl(${hue}, 70%, 60%)`;
        
        return {
          label: trainee.name,
          data: gradeData.data,
          borderColor: color,
          backgroundColor: `${color}33`, // Add transparency
          tension: 0.3
        };
      });
      
      this.chart1 = new Chart(ctx, {
        type: 'line' as ChartType,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 50,
              max: 100,
              title: {
                display: true,
                text: 'Grade'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Month'
              }
            }
          },
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: 'Grades Over Time'
            }
          }
        }
      });
      
      console.log('Chart1 created successfully');
    } catch (error) {
      console.error('Error creating chart1:', error);
    }
  }
  
  // Chart 2: Student averages
  renderStudentAveragesChart(): void {
    if (this.selectedIds().length === 0) return;
    
    // Get the active canvas for chart2
    const canvas = this.getActiveChart2Canvas();
    if (!canvas) return;
    
    // Always destroy the previous chart instance to prevent "Canvas is already in use" errors
    if (this.chart2) {
      this.chart2.destroy();
      this.chart2 = null;
    }
    
    const ctx = canvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const selectedTrainees = this.selectedTrainees();
    const labels = selectedTrainees.map(t => t.name);
    const data = selectedTrainees.map(t => {
      // Generate a stable average grade for each trainee
      const nameHash = t.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return 70 + (nameHash % 30); // Value between 70-99
    });
    
    // Generate colors for each trainee
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
          y: {
            min: 50,
            max: 100,
            title: {
              display: true,
              text: 'Average Grade'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Student Averages'
          }
        }
      }
    });
  }
  
  // Chart 3: Subject averages
  renderSubjectAveragesChart(): void {
    if (this.selectedSubjects().length === 0) return;
    
    // Get the active canvas for chart3
    const canvas = this.getActiveChart3Canvas();
    if (!canvas) return;
    
    // Always destroy the previous chart instance to prevent "Canvas is already in use" errors
    if (this.chart3) {
      this.chart3.destroy();
      this.chart3 = null;
    }
    
    const ctx = canvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const subjects = this.selectedSubjects();
    const data = subjects.map(subject => this.getAveragesBySubject(subject).average);
    
    // Generate colors for each subject
    const backgroundColors = subjects.map((subject, index) => {
      const hue = (index * 137) % 360; // Prime number for better distribution
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
        indexAxis: 'y', // Horizontal bar chart
        scales: {
          x: {
            min: 50,
            max: 100,
            title: {
              display: true,
              text: 'Average Grade'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Subject Averages'
          }
        }
      }
    });
  }
  
  // Calculate grades average over time
  getGradesOverTime(traineeId: number) {
    // Generate deterministic but different data for each trainee
    const seed = traineeId * 17; // Use a prime multiplier for better distribution
    const baseValues = [85, 88, 82, 90, 92];
    
    // Modify base values slightly for each trainee
    const data = baseValues.map((val, idx) => {
      const mod = (seed + idx * 7) % 15 - 5; // Value between -5 and +10
      return Math.max(70, Math.min(100, val + mod)); // Keep between 70-100
    });
    
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      data
    };
  }
  
  // Mock data for subject averages - using stable values instead of random
  private subjectAveragesMap = new Map<string, number>();
  
  // Calculate averages by subject
  getAveragesBySubject(subject: string) {
    // Use cached value if it exists
    if (!this.subjectAveragesMap.has(subject)) {
      // Generate a deterministic "random" value based on the subject string
      const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const average = 80 + (hash % 20); // Value between 80-99 based on subject string
      this.subjectAveragesMap.set(subject, average);
    }
    
    return {
      subject,
      average: this.subjectAveragesMap.get(subject) as number
    };
  }
  
  // Get trainee data for display
  getTraineeById(id: number): Trainee | undefined {
    return this.trainees().find(t => t.id === id);
  }
}
