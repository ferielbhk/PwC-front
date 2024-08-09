import { Comment } from "./comment";
import { User } from "./user";

export class Post {
    id!: number;
  content!: string;
  image!: string;
  likes!:number;
  commentaires!:number;
  user!: User;
  comments!: Comment[];
  likedUsers!:User[];
  isLiked?: boolean; 
  comment!: Comment;
  date: any;
  currentComment!: '';  // Add this field to track comment input


}
