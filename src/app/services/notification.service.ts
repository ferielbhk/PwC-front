import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Notificationn } from '../classes/notificationn';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private eventSource: EventSource | null = null;
  private notificationSubject = new Subject<string>();
  notifications$ = this.notificationSubject.asObservable();
 
  constructor(private router:Router , private ngZone: NgZone) {
    this.initializeEventSource();
  }
  private notificationsSubject = new Subject<any>();
  private http = inject(HttpClient);
  //private eventSource: EventSourcePolyfill;




  private initializeEventSource() {
    if (!this.eventSource) {
      console.log('Initializing EventSource in service');
      this.eventSource = new EventSource('http://localhost:8089/notifications/stream');
      this.eventSource.onopen = (event) => {
        console.log('Connection to server opened.', event);
      };
      // Add other event listeners here
      this.eventSource.onmessage = (event) => {

        console.log('Message received:', event);
            
        const currentUrl = this.router.url;
        console.log("currentUrl",currentUrl)
        this.ngZone.run(() => {
          this.router.navigateByUrl('/members', { skipLocationChange: true }).then(() => {
            this.router.navigate([currentUrl]);
          });
        })
      
        console.log('event.data',event.data)
      };
      this.eventSource.onerror = (event) => {
        console.error('EventSource error:', event);
      };
    }
  }
  showNotification(message: string) {
    this.notificationSubject.next(message);
  }
 
  ngOnDestroy() {
    if (this.eventSource) {
      console.log('Closing EventSource');
      this.eventSource.close();
      this.eventSource = null;
    }
  }




  
  public getNotifications(): Observable<any> {
  console.log(this.notificationsSubject.asObservable());
    return this.notificationsSubject.asObservable();
  }

 /* startListening(): void {
   
    this.eventSource = new EventSource('http://localhost:8089/notifications/stream');

    this.eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    this.eventSource.onmessage = (event: MessageEvent) => {
      try {
        console.log('SSE message received:', event.data);
        const data = JSON.parse(event.data);
        this.notificationsSubject.next(data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
this.eventSource.onerror = (error: Event) => {
      console.error('SSE Error:', error);
      //this.handleError();
    };
  }*/
    
 /* private handleError(): void {
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(() => 
       5000);
  }*/

  
  fetchNotifications(userId: number): Observable<Notificationn[]> {
    if (userId === undefined || userId === null) {
      throw new Error('User ID is required to fetch notifications.');
    }
    
    const params = new HttpParams().set('id', userId.toString());
    return this.http.get<Notificationn[]>(`http://localhost:8089/notifications/all`, { params });
  }

  markNotificationAsRead(id: number): Observable<void> {
    return this.http.put<void>(`http://localhost:8089/notifications/mark-as-read/${id}`,{});
  }


}
