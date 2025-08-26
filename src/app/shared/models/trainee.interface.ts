export interface Trainee {
  id: number;
  name: string;
  grade: number;
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

export interface MonitorTrainee {
  id: number;
  name: string;
  average: number;
  exams: number;
  passed: boolean;
}