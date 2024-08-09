import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment.prod';
import { BehaviorSubject, Observable, Subject, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthReq } from '../classes/AuthResq';
import { User } from '../classes/user';
import { ChatService } from './chat.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  creationDate!:Date;

  private apiUrl = environment.baseUrl; 
  private accessToken: string = '';
  authreq!: AuthReq;
  private selectedUserSubject = new BehaviorSubject<any | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();

  constructor(private http: HttpClient, private chatService: ChatService) { }

  login(authReq: AuthReq): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}auth/login`, authReq).pipe(
      tap(response => {
        if (response.accessToken) {
          this.setAccessToken(response.accessToken);
          localStorage.setItem('token', response.accessToken);
          this.chatService.connectWebSocket(); // Connect WebSocket on successful login
        }
      }),
      catchError(this.handleError)
    );
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }
  signOff(){
    localStorage.removeItem('token')
    
  }
  getUserDataByToken(): Observable<any> {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.get<any>(`${this.apiUrl}users/getDataByToken`, { headers }).pipe(
        tap(userData => {
          localStorage.setItem('currentUser', JSON.stringify(userData));
          console.log('User data received:', userData);
        }),
        catchError(this.handleError)
      );
    } else {
      return throwError('Token not found');
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}auth/register`, userData)
    .pipe(
     
      catchError(this.handleError)
    );
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}users/getall`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getbyId(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}users/${id}`);
  }

  setSelectedUser(user: any): void {
    this.selectedUserSubject.next(user);
  }

  getSelectedUser(): any | null {
    return this.selectedUserSubject.getValue();
  }

  private handleError(error: HttpErrorResponse) {
    console.error('HTTP error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
