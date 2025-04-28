export type PostType = {
  id: number;
  content: string;
  todo: Todo;
  tag: Tag;
  // user: {
  //   nick: string;
  //   role: string;
  //   goal: string;
  // };
  // clapCount: number;
  // commentCount: number;
  createdAt: string;
  updatedAt: string;
  images: Image[] = [];
  comments?: Comment[] = [];
  comment_count?: number = 0;
  fires: Fire[] = [];
  user: User;
  isPeer: boolean;
};

export type FeedType = {
  id: number;
  content: string;
  todo: Todo;
  tag: Tag;
  // user: {
  //   nick: string;
  //   role: string;
  //   goal: string;
  // };
  // clapCount: number;
  // commentCount: number;
  createdAt: string;
  updatedAt: string;
  images: Image[] = [];
  comment_count: number = 0;
  fires: Fire[] = [];
  user: User;
  isPeer: boolean;
};

type Fire = {
  id: number;
  isFire: boolean;
  user_id: number;
  feed_id: number;
};

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
};

type MyFeed = {
  id: number;
  content: string;
  todo: string;
  tag: string;
  images: Image[];
  createdAt: string;
  updatedAt: string;
  user: User;
};
