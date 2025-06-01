export class StatsTeacherResponse {
  users: StatsTeacherUsers;
}

export class StatsAdminResponse {
  finances: StatsAdminFinances;
  users: StatsAdminUsers;
}

export class StatsStudentResponse {
  quizAttemptsSummary: StatsStudentQuizAttemptsSummary;
  usersOnEventsCompleted: StatsStudentUsersOnEventsCompleted;
  payments: StatsStudentPayment[];
}

export class StatsTeacherUsers {
  registered: StatsTeacherRegistered;
  active: number;
  awaitingApproval: number;
}

export class StatsAdminFinances {
  perCourse: StatsAdminPerCourse[];
  allTime: StatsAdminAllTime;
  lastWeek: StatsAdminLastWeek;
  lastMonth: StatsAdminLastMonth;
}

export class StatsAdminUsers {
  registered: StatsAdminRegistered;
  active: number;
  awaitingApproval: number;
}

export class StatsStudentQuizAttemptsSummary {
  lastMonth: StatsStudentLastMonth[];
}

export class StatsStudentUsersOnEventsCompleted {
  total: number;
}

export class StatsStudentPayment {
  date: Date;
  amount: number;
  isSubscription: boolean;
}

export class StatsTeacherRegistered {
  allTime: number;
  lastWeek: number;
  lastMonth: number;
}

export class StatsAdminPerCourse {
  id: string;
  name: string;
  totalRevenue: number;
  numberOfSales: number;
}

export class StatsAdminAllTime {
  totalRevenue: number;
  numberOfSales: number;
}

export class StatsAdminLastWeek {
  totalRevenue: number;
  numberOfSales: number;
}

export class StatsAdminLastMonth {
  totalRevenue: number;
  numberOfSales: number;
}

export class StatsAdminRegistered {
  allTime: number;
  lastWeek: number;
  lastMonth: number;
}

export class StatsStudentLastMonth {
  day: Date;
  numberTaken: number;
}
