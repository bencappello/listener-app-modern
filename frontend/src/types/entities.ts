export interface Song {
  id: number;
  title: string;
  file_path: string;
  duration: number;
  band_id?: number;
  blog_id?: number;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  play_count?: number;
  band?: Band;
  blog?: Blog;
  tags?: Tag[];
}

export interface Band {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  songs?: Song[];
  tags?: Tag[];
}

export interface Blog {
  id: number;
  name: string;
  url: string;
  rss_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  is_active: boolean;
  songs?: Song[];
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  song_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    profile_picture?: string;
  };
}

export interface Pagination {
  page: number;
  total: number;
  total_pages: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
} 