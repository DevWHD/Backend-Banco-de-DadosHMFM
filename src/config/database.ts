import { neon } from "@neondatabase/serverless";

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

export type Folder = {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
};

export type FileRecord = {
  id: number;
  name: string;
  folder_id: number;
  blob_url: string;
  size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
};
