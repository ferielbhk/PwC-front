import { Post } from "./post";
import { User } from "./user";

export class Comment {
  content: string='';  
  post:{ id: number; } | undefined;
  user!:User;
}
