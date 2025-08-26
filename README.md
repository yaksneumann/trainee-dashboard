# trainee-dashboard
# TraineeHub 📚

A modern Angular-based Single Page Application for managing trainee test results and performance analytics with Material Design.

## 🚀 Features

- **Data Management**: CRUD operations for trainee records with advanced filtering and pagination
- **Performance Analytics**: Interactive charts with drag-and-drop functionality for data visualization  
- **Monitor Dashboard**: Real-time pass/fail status tracking with color-coded indicators
- **Smart Filtering**: Support for keyword searches (ID:, >, <) and multi-criteria filtering
- **State Persistence**: Maintains page states across navigation without refresh
- **Responsive Design**: Mobile-first approach with Angular Material components

## 🛠️ Tech Stack

- **Frontend**: Angular 17+ with TypeScript
- **UI Library**: Angular Material Design
- **Charts**: Chart.js with ng2-charts
- **Drag & Drop**: Angular CDK
- **State Management**: Custom service with localStorage
- **Styling**: SCSS with custom Material theme

## 📋 Pages

1. **Data Page**: Trainee CRUD with filtering, sorting, and pagination (10 results per page)
2. **Analysis Page**: Multi-select filters for IDs/subjects with draggable chart panels  
3. **Monitor Page**: Pass/fail status display (65+ average = passed) with status filtering

## 🎯 Key Requirements

- ✅ Persistent page states across navigation
- ✅ Advanced filtering with special keywords support
- ✅ Drag-and-drop chart functionality
- ✅ Responsive Material Design interface
- ✅ Unit testing ready architecture

## 🚦 Getting Started 

```bash
npm install
ng serve -o
```

That will navigate you to `http://localhost:4200/`

## 🧪 Running Tests

For running specific component tests, please use the following command:

```bash
ng test --include="**/trainee-list.component.spec.ts"
```

This will run only the tests for the TraineeListComponent.