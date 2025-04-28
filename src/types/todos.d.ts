export type Todo = {
  id: number;
  isDone: boolean;
  title: string;
  tags_link?: [];
  tags: Tag[];
  images?: string[];
};

type Tag = {
  id: number;
  title: string;
};

type ImageType = {
  id: number;
  feed_id: number;
  name: string;
  url: string;
};

type SectionData = {
  title: string;
  data: string[];
};
