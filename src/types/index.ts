
export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

export type IssueStatus = "pending" | "in-progress" | "resolved";

export type IssueCategory = "road" | "water" | "sanitation" | "electricity" | "other";

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  status: IssueStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  imageUrl?: string;
  votes: number;
  latitude?: number;
  longitude?: number;
};

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  bio: string | null;
}
