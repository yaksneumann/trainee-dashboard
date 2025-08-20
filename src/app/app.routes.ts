import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/data', pathMatch: 'full' },
    { 
      path: 'data', 
      loadComponent: () => import('./components/data-page/data-page').then(m => m.DataPage)
    },
    { 
      path: 'analysis', 
      loadComponent: () => import('./components/analysis-page/analysis-page').then(m => m.AnalysisPage)
    },
    { 
      path: 'monitor', 
      loadComponent: () => import('./components/monitor-page/monitor-page').then(m => m.MonitorPage)
    }
  ];