import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../classes/user';
import { Post } from '../classes/post';
import { Comment } from '../classes/comment';
@Injectable({
  providedIn: 'root'
})
export class CommentService {
post!:Post;
user!:User;
  private baseUrl = 'http://localhost:8089/api';

  constructor(private http: HttpClient , private auth:AuthService ) { }
   
  createComment(postId: number, userId: number, content: string): Observable<Comment> {
    const commentPayload: Comment = {
      content: content,
      post: { id: postId },
      user: { id: userId } as User, 
    
      
    };
    return this.http.post<Comment>(`${this.baseUrl}/comments/post/${postId}/user/${userId}`, commentPayload);
  }
  

  updateComment(commentId: number, newContent: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/${commentId}`, newContent);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${commentId}`);
  }
}