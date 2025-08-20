import { Injectable, signal, computed } from '@angular/core';
// import { Analyst } from '../models/trainee.model';

@Injectable({
  providedIn: 'root'
})
export class AnalystService {
  // private analystsSignal = signal<Analyst[]>([
  //   {
  //     id: 1,
  //     name: 'Alice Cooper',
  //     specialization: 'Data Science',
  //     experience: 5,
  //     projects: ['ML Pipeline', 'Customer Analytics']
  //   },
  //   {
  //     id: 2,
  //     name: 'Bob Wilson',
  //     specialization: 'Business Intelligence',
  //     experience: 3,
  //     projects: ['Dashboard Creation', 'Report Automation']
  //   },
  //   {
  //     id: 3,
  //     name: 'Carol Davis',
  //     specialization: 'Statistical Analysis',
  //     experience: 7,
  //     projects: ['Market Research', 'A/B Testing Framework']
  //   }
  // ]);

  // private filterSignal = signal<string>('');
  
  // readonly analysts = this.analystsSignal.asReadonly();
  // readonly filter = this.filterSignal.asReadonly();
  
  // readonly filteredAnalysts = computed(() => {
  //   const filter = this.filterSignal().toLowerCase();
  //   if (!filter) return this.analystsSignal();
    
  //   return this.analystsSignal().filter(analyst =>
  //     analyst.name.toLowerCase().includes(filter) ||
  //     analyst.specialization.toLowerCase().includes(filter)
  //   );
  // });

  // setFilter(filter: string) {
  //   this.filterSignal.set(filter);
  // }
}