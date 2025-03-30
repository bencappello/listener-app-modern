export interface User {
  id: number | string;
  username: string;
  email: string;
  profileImage?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  isCurrentUser?: boolean;
}

export interface Blog {
  id: number;
  name: string;
  url: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  lastScraped?: string;
}

export interface Song {
  id: number | string;
  title: string;
  artist: string;
  blogId: number | string;
  blogName: string;
  audioUrl: string;
  imageUrl?: string;
  postUrl: string;
  postDate: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface Comment {
  id: number;
  userId: number;
  songId: number;
  text: string;
  createdAt: string;
  user?: User;
}

export interface Tag {
  id: number;
  name: string;
}

export interface UserSong {
  userId: number;
  songId: number;
  isFavorite: boolean;
  createdAt: string;
}

export interface UserBlog {
  userId: number;
  blogId: number;
  isFollowing: boolean;
  createdAt: string;
}

export interface UserFollow {
  followerId: number;
  followingId: number;
  createdAt: string;
  follower?: User;
  following?: User;
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