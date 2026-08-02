export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  updated: string;
  tags: string[];
  categories: string[];
  cover: string;
  excerpt: string;
  sticky: number;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

export interface SearchEntry {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  categories: string[];
  excerpt: string;
}

export interface LinkItem {
  name: string;
  link: string;
  avatar: string;
  descr: string;
}

export interface LinkGroup {
  class_name: string;
  class_desc: string;
  link_list: LinkItem[];
}
