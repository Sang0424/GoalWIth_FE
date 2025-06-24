export interface Quest {
  id: string;
  title: string;
  description?: string;
  isMain: boolean;
  startDate: string | Date;
  endDate: string | Date;
  completed: boolean;
  verificationRequired: boolean;
  verificationCount?: number;
  requiredVerifications?: number;
  records: QuestRecord[];
  category?: string;
}

export interface QuestRecord {
  id: string;
  date?: string;
  text: string;
  images?: string[];
  verifications: QuestVerification[];
  isVerified: boolean;
  questId:string;
  tags:string[];
  createdAt:date;
  userId:string;
}

export interface QuestVerification {
  userId: string;
  verifiedAt: string;
}

export interface RouteParams {
  questId: string;
  isMain?: boolean;
}
