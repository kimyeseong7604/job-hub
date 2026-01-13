export type KanbanStatus = "INTEREST" | "PREPARE" | "APPLIED" | "INTERVIEW" | "RESULT";

export type BookmarkCard = {
  id: string;          
  postingId: string;   
  company: string;
  title: string;
  deadline: string;    
  status: KanbanStatus;
  memo?: string;
  nextActionDate?: string;
};