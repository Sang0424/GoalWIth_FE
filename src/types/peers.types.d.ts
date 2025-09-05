export interface RequestedPeers {
  content: {
    id: number;
    nickname: string;
    character: string;
    level: number;
    userType: string;
  };
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  nextPage: number;
}
