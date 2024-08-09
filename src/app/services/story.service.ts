import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, switchMap } from 'rxjs';
import { Story } from '../classes/story';
import { User } from '../classes/user';

@Injectable({
  providedIn: 'root'
})
export class StoryService {

  private baseUrl = 'http://localhost:8089/api/stories';

  constructor(private http: HttpClient , private auth:AuthService ) { }
  createStory(image: File | null): Observable<Story> {
    return this.auth.getUserDataByToken().pipe(
      switchMap((user: User) => {
        const formData: FormData = new FormData();
        if (image) {
          formData.append('image', image, image.name);
        }
        formData.append('email', user.email ); 
        
        console.log('FormData prepared:', formData);
  
        return this.http.post<Story>(this.baseUrl, formData);
      })
    );
  }
  
  getStories():Observable<Story[]>{
    return this.http.get<Story[]>(this.baseUrl);
  }

}
