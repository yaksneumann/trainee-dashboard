export interface Trainee {
  id: number;
  name: string;
  grade: string;
  email: string;
  dateJoined: Date;
  address: string;
  city: string;
  country: string;
  zip: string;
  subject: string;
}

export interface Subject {
  id: string;
  name: string;
  grade: number;
  testDate: Date;
  traineeId: string;
}

export interface TraineeWithGrade extends Trainee {
  averageGrade: number;
  status: 'Passed' | 'Failed';
}

export interface FilterCriteria {
  searchText: string;
  gradeRange?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
  subjects: string[];
  ids: string[];
  status: ('Passed' | 'Failed')[];
}

export interface PageState {
  page: number;
  pageSize: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  filters: FilterCriteria;
}
