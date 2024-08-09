import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { Post } from '../classes/post';
import { User } from '../classes/user';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root'
})

export class PostService {
  private baseUrl = 'http://localhost:8089/api/posts';

  constructor(private http: HttpClient , private auth:AuthService ) { }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl);
  }
  getCurrentUserId(): Observable<number> {
    return this.auth.getUserDataByToken().pipe(
      map((userData: any) => userData.id)
    );
  }
 
  getPostsByUser(userId: number): Observable<Post[]> {
    //const params = new HttpParams().set('userId', userId.toString());
    return this.auth.getUserDataByToken().pipe(
      switchMap(user => {
        const userId = user.id;
        const params = new HttpParams().set('userId', userId.toString());
        return this.http.get<Post[]>(`${this.baseUrl}/getpostsbyuser`,  { params });
      })
    );
  }
  getPostsBySimpleUser(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/getpostsbyuser/${userId}`);
  }
  getPostById(postId: number): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/parId/${postId}`);
  }

  likePost(postId: number): Observable<void> {
    return this.auth.getUserDataByToken().pipe(
      switchMap(user => {
        const userId = user.id;
        
        const params = new HttpParams().set('userId', userId.toString());
        return this.http.post<void>(`${this.baseUrl}/${postId}/like`, null, { params });
      })
    );
  }
  unlikePost(postId: number): Observable<void> {
    return this.auth.getUserDataByToken().pipe(
      switchMap(user => {
        const userId = user.id;
        const params = new HttpParams().set('userId', userId.toString());
        return this.http.post<void>(`${this.baseUrl}/${postId}/unlike`, null, { params });
      })
    );
  }
  
  createPost(content: string | null, image: File | null): Observable<Post> {
    return this.auth.getUserDataByToken().pipe(
      switchMap((user: User) => {
        console.log("USERPOST",user)
        const formData: FormData = new FormData();
       
  
        if (content !== null && content !== undefined && content !== '') {
          formData.append('content', content);
        }

        if (image !== null && image !== undefined) {
          formData.append('image', image, image.name);
        }
        formData.append('email', user?.email);

        console.log("Form Data:", formData);
       

        return this.http.post<Post>(this.baseUrl, formData);
      })
    );
  }

}