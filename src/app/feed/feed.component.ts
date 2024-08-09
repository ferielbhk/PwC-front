import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { Post } from '../classes/post';
import { User } from '../classes/user';
import { AuthService } from '../services/auth.service';
import { PostService } from '../services/post.service';
import { CommentService } from '../services/comment.service';
import { Comment } from '../classes/comment';
import { Router } from '@angular/router';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
import { Observable, Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { Notificationn } from '../classes/notificationn';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { StoryService } from '../services/story.service';
import { Story } from '../classes/story';
@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class FeedComponent  {
  posts: Post[] = [];
  post = {} as Post;
  selectedUserId: number | null = null;
  commentairess: Comment[] = [];
  comments: { [key: number]: Comment[] } = {};
  content: string = '';
  image: File | null = null;
  newCommentText: string = '';
  user!: User;
  totalItems!: number;
  userId: any;
  postId: any;
  comment!: string;
  userPost!: User;
  commentt = {} as Comment;
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';
  isLiked: boolean = false; 
  faHeartSolid = faHeartSolid;
  faHeartOutline = faHeartOutline;
  rawEventData: string = '';
  parsedDataString: string = '';
  notifications: Notificationn[] = [];
  notificationsMessages:Notificationn[]=[];
  parsedData: any = {};
  notifs : Notificationn[] = [];
  userFirstName!:string;
  userLastName!:string;
  unreadCount: number = 0; 
  allNotifs: Notificationn[] = [];
  showAll: boolean = false;
  unreadMessages:number=0;
  notificationMessage: string | null = null;
  notificationMessages: { message: string, timestamp: Date, read: boolean }[] = [];
  showNotifications: boolean = false;
  private notificationsSubscription!: Subscription;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private commentService: CommentService,
    private notificationService: NotificationService,
   private router: Router , 
   private ngZone : NgZone
  ) { 
    console.log('Constructor called');
  
  }
  
  ngOnInit(): void {
    this.fetchUserData();
    this.fetchPosts();
    this.notificationsSubscription = this.notificationService.getNotifications().subscribe(
      (data) => {
        if (data && data.message) {
          if (data.userId === this.userId) {
            this.notifications.push(data.message);
            this.calculateUnreadCount();
          }
        }
      },
      (error) => console.error('Error receiving notifications:', error)
    );
   
   console.log('ngOnit called');
       

  }
  
  
  ngOnChange():void{
    this.fetchPosts();

    this.notificationsSubscription = this.notificationService.getNotifications().subscribe(
      (data) => {
        if (data && data.message) {
          if (data.userId === this.userId) {
            this.notifications.push(data.message);
            this.calculateUnreadCount();
          }
        }
      },
      (error) => console.error('Error receiving notifications:', error)
    );

  }
  ngOnDestroy() {
   
  }

  signOff(){
    this.authService.signOff()
    this.router.navigate(['/signin'])
  }
  handleButtonClick(user: User): void {
    console.log('Selected User:', user);
    this.authService.setSelectedUser(user);
    if (this.authService.getSelectedUser !== this.fetchUserData) {
      this.router.navigate(['/chat']);
    }
  }
 
  fetchUserData(): void {
    this.authService.getUserDataByToken().subscribe(
      userData => {
        this.userId = userData.id;
        this.user = userData;
        
      },
      error => {
        console.error('Error fetching user data:', error);
      }
    );
    this.loadNotifications(); 

  }
 
  fetchPosts(): void {
    this.postService.getAllPosts().subscribe(
      response => {
        console.log(response)
        this.posts = response.sort().reverse();
        this.posts.forEach(post => {
          this.comments[post.id] = post.comments.sort().reverse();
          console.log(post.comments)
         post.isLiked = post.likedUsers.some(likedUser => likedUser.id === this.user.id);
        });
      },
      error => {
        console.error('Error fetching posts:', error);
      }
    );
  }
  testme(i : any){
    console.log("index ",i)
  }
 
  filterUsers(): void {
    if (this.searchQuery.trim() !== '') {
      this.authService.getUserDataByToken().subscribe(
        userData => {
          this.userId = userData.id;
          this.authService.getAllUsers().subscribe(
            users => {
              console.log('Users fetched:', users);
              this.filteredUsers = users.filter(
                user =>
                  user.id !== this.userId &&
                  (user.firstname?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    user.lastname?.toLowerCase().includes(this.searchQuery.toLowerCase()))
              );
            },
            error => {
              console.error('Error loading users:', error);
            }
          );
        },
        error => {
          console.error('Error fetching user data by token:', error);
        }
      );
    } else {
      this.filteredUsers = [];
    }
  }

 

  onFileSelected(event: any): void {
    this.image = event.target.files[0];
  }

  onSubmit(): void {
    if (this.content !== '' || this.image !== null) {
      console.log('Content:', this.content);
      this.postService.createPost(this.content, this.image).subscribe(
        post => {
          this.posts.unshift(post);
          this.content = '';
          this.image = null;
        },
        error => {
          console.error('Erreur lors de la création du post :', error);
        }
      );
    } else if (this.content) {
      let imageToPass: File | null = this.image ? this.image : null;
      this.postService.createPost(this.content, imageToPass).subscribe(post => {
        this.posts.unshift(post);
        this.content = '';
        this.image = null;
      });
    } else if (this.image && this.content == '') {
      this.postService.createPost('', this.image).subscribe(post => {
        this.posts.unshift(post);
        this.content = '';
        this.image = null;
      });
    }
  }
  toggleLike(post: Post) {
    console.log("Post ID:", post.id);
  
    if (post.isLiked) {
      this.postService.unlikePost(post.id).subscribe(
        () => {
          post.isLiked = false;
          post.likes--;
          console.log('Post unliked successfully.');
        },
        (error) => {
          console.error('Error unliking post:', error);
        }
      );
    } else {
      this.postService.likePost(post.id).subscribe(
        () => {
          post.isLiked = true;
          post.likes++;
          console.log('Post liked successfully.');
        },
        (error) => {
          console.error('Error liking post:', error);
        }
      );
    }
  }
  routerr(): void {
    this.router.navigate([`/profile2`]); 
    
  }
  createComment(postId: number): void {
    this.authService.getUserDataByToken().subscribe(userData => {
      this.userId = userData.id;
      const selectedPost = this.posts.find(post => post.id === postId);
      if (!selectedPost) {
        console.error('Post not found with postId:', postId);
        return;
      }
      this.commentService.createComment(postId, this.userId, selectedPost.currentComment).subscribe(
        response => {
          console.log('Comment created:', response);
          
          selectedPost.currentComment = '';  
          this.fetchPosts();  
          this.loadNotifications();  
        },
        error => {
          console.error('Error creating comment:', error);
        }
      );
    });
  }
  
  loadNotifications(): void {
    this.authService.getUserDataByToken().subscribe(userData => {
      this.userId = userData.id;
      this.notificationService.fetchNotifications(this.userId).subscribe(
        (notifications: Notificationn[]) => {
          this.allNotifs = notifications
            .filter(notif => notif.userIdReceiver === this.userId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          console.log("RESULT OF LOAD NOTIFICATIONS:", this.allNotifs);
          this.updateDisplayedNotifications();
          this.calculateUnreadCount();
        },
        error => console.error('Error loading notifications:', error)
      );
    }, error => console.error('Error fetching user data:', error));
  }
  updateDisplayedNotifications(): void {
    this.notifications =this.allNotifs.filter(notif => notif.type=="COMMENT").slice(0, 5);
    this.notificationsMessages = this.allNotifs.filter(notif => notif.type=="MESSAGE").slice(0, 5);
  }
  
  calculateUnreadCount(): void {
    console.log("azerty",this.allNotifs)
    this.unreadCount = this.allNotifs.filter(notif => !notif.read && notif.type=="COMMENT").length;
    this.unreadMessages = this.allNotifs.filter(notif => !notif.read && notif.type=="MESSAGE").length;
    console.log("azerty",this.unreadCount)
  }
  

  markAsRead(notif: Notificationn): void {
    const postnotifId = notif.postId;
    this.router.navigate(['/postDetails', postnotifId]);

    this.notificationService.markNotificationAsRead(notif.id).subscribe(
      () => {
        this.updateDisplayedNotifications();  
      },
      error => console.error('Error marking notification as read:', error)
    );
  }
  makeitRead(notif:Notificationn):void {
    this.notificationService.markNotificationAsRead(notif.id).subscribe(
      () => {
        this.updateDisplayedNotifications();  
      },
      error => console.error('Error marking notification as read:', error)
    );
  }

  viewAllNotifications(){
    /*this.showAll = true;
    this.updateDisplayedNotifications();*/
    this.router.navigate(["/allNotif"]);
    console.log(this.allNotifs)
  }


}
