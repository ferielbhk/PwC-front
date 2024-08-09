import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthReq } from '../classes/AuthResq';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { ChatService } from '../services/chat.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  //imports: [ ReactiveFormsModule,RouterModule,CommonModule],
  //standalone:true

})
export class SigninComponent {
  res!:string
  authService = inject(AuthService);
  chatService = inject (ChatService);
  router = inject(Router);
  notificationService=inject(NotificationService);
  protected loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  onSubmit() {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      const authReq: AuthReq = {
        email: formValue.email as string,
        password: formValue.password as string
      };
      this.authService.login(authReq).subscribe(
        response => {
          console.log('Login response:', response)
          if (response.accessToken) {
            localStorage.setItem("token", response.accessToken);
            console.log('Token stored in localStorage:', localStorage.getItem('token'));
          } else {
            console.error('Access token is missing in the response');
          }      
        
          if (this.authService.isLoggedIn()) {
           
              this.authService.getUserDataByToken().subscribe(result=>{
                console.log("result",result.id)
              })
              
            
           
           // console.log('User data:', this.authService.getUserDataByToken());

           this.chatService.connectWebSocket();
            this.router.navigate(['/feed']);
          } else {
            console.log('User not logged in');
          }
        },
        error => {
          console.error('Login error:', error); 

          if (error.status === 409 && error.error.error === 'Email not found') {
            alert('Email not found. Please check your email and try again.');
          } else {
            alert('Login failed. Please try again later.'); 
          }
        }
      );
    }
  }
}
