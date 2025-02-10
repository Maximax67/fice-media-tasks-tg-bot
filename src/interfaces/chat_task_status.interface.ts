export interface ChatTaskStatus {
  id: number;
  chat_id?: number;
  thread?: number;
  title: string;
  icon: string;
  created_at?: Date;
}
