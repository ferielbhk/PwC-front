import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { Notificationn } from '../classes/notificationn';
import { Router } from '@angular/router';
import { User } from '../classes/user';

@Component({
  selector: 'app-notif',
  templateUrl: './notif.component.html',
  styleUrls: ['./notif.component.css']
})
export class NotifComponent implements OnInit {
  notifs: Notificationn[] = [];
  filteredNotifs: Notificationn[] = [];
  userId!: number;
  searchTerm: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    console.log("ngOnInit started");

    this.authService.getUserDataByToken().subscribe(
      userData => {
        this.userId = userData.id;
        console.log("User ID fetched:", this.userId);

        this.notificationService.fetchNotifications(this.userId).subscribe(
          (data: Notificationn[]) => {
            console.log("Fetched notifications:", data);
            this.notifs = data;
            this.filteredNotifs = data;
            this.filterNotifications(); 
          },
          (error) => console.error('Error fetching notifications:', error)
        );
      },
      error => {
        console.error('Error fetching user data:', error);
      }
    );

    console.log("ngOnInit finished");
  }

  signOff(): void {
    this.authService.signOff();
    this.router.navigate(['/signin']);
  }
 
  markAsReadNotif(notif: Notificationn): void {
    const postnotifId = notif.postId;
    this.notifs = this.notifs.map(n =>
      n.id === notif.id ? { ...n, read: true } : n
    );
    if(notif.type=="COMMENT")
    {this.router.navigate(['/postDetails', postnotifId]);}
    if(notif.type=="MESSAGE"){
      
      this.authService.setSelectedUser(notif.userIdReceiver);
      this.router.navigate(['/chat']);
    
    }
    this.notificationService.markNotificationAsRead(notif.id).subscribe(
      () => {
        console.log('Notification marked as read.');
      },
      error => console.error('Error marking notification as read:', error)
    );
  }

  filterNotifications(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredNotifs = this.notifs;
    } else {
      this.filteredNotifs = this.notifs.filter(notif => {
        const staticPart = "a commenté votre post";
        const dynamicPart = notif.message.split(staticPart)[0].trim().toLowerCase();
        return dynamicPart.includes(this.searchTerm.toLowerCase());
      });
    }
  }
}
