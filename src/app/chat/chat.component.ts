import { Component, ElementRef, OnDestroy, OnInit, SimpleChanges, ViewChild ,AfterViewChecked} from '@angular/core';
import { Subscription } from 'rxjs';
import { Chat } from '../classes/chat';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { User } from '../classes/user';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') private chatContainer!: ElementRef ;

  messages: Chat[] = [];
  message: string = '';
  userId!:number;
  private messageSubscription!: Subscription;
  private wsSubscription!: Subscription;
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';
  chattedUsers: User[] = [];
  selectedUserId: number | null = null; // Track selected user ID
  selectedUserName: { firstname: string | null, lastname: string | null } | null = null; 
  loggedInUserId: number | undefined;
  user: any;
  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
    
  ) {        
  }
 
  ngOnInit(): void {
    this.authService.getUserDataByToken().subscribe(
      (userData) => {
        this.loggedInUserId = userData.id;
        this.user=userData
        this.subscribeToWebSocketMessages();
        this.fetchChattedUsers(); 
       // this.scrollToBottom();
        const element = document.getElementById('chat');
        element!.scrollTo({left: 0 , top: element!.scrollHeight, behavior: 'smooth'});
      },
      (error) => {
        console.error('Error fetching logged-in user data:', error);
      }
    );
 
    this.authService.selectedUser$.subscribe((user: any) => {
      if (user) {
        this.selectedUserId = user.id;
        this.selectedUserName = { firstname: user.firstname, lastname: user.lastname }; // Set the selected user's name
      }
    });
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  
  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['messages']) {
      this.scrollToBottom();
    }
  }
 
  scrollToBottom(): void {
    if (this.chatContainer && this.chatContainer.nativeElement) {
      const container = this.chatContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }
  
  fetchChattedUsers(): void {
    this.chatService.getAllMessages().subscribe(
      (messages: Chat[]) => {
        const userMessageMap = new Map<number, number>();
          messages.forEach(message => {
          if (message.senderId === this.loggedInUserId) {
            userMessageMap.set(message.receiverId, message.id);
          } else if (message.receiverId === this.loggedInUserId) {
            userMessageMap.set(message.senderId, message.id);
          }
        });
  
        this.authService.getAllUsers().subscribe(
          (users: User[]) => {
            this.users = users
              .filter(user => userMessageMap.has(user.id))
              .sort((a, b) => userMessageMap.get(b.id)! - userMessageMap.get(a.id)!);
          },
          (error) => {
            console.error('Error fetching users:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }
  
 
  subscribeToMessages(): void {
    if (this.selectedUserId) {
      this.messageSubscription = this.chatService.getAllMessages().subscribe(
        (messages: Chat[]) => {
          console.log('HTTP messages received:', messages);
          this.filterAndSetMessages(messages);
              this.fetchChattedUsers;
              this.scrollToBottom();

        },
        (error) => {
          console.error('Error fetching messages:', error);
        }
      );
    }
  }
 
  subscribeToWebSocketMessages(): void {
    this.wsSubscription = this.chatService.messages$.subscribe(
      (messages: Chat[]) => {
        console.log('WebSocket messages received:', messages);
 
        this.filterAndSetMessages(messages);
        this.scrollToBottom(); // Ensure it scrolls to the bottom after updating messages
        this.fetchChattedUsers;

      },
      (error) => {
        console.error('Error receiving WebSocket messages:', error);
      }
    );
  }
 
  filterAndSetMessages(messages: Chat[]): void {
    if (this.selectedUserId && this.loggedInUserId) {
      console.log('Filtering messages for:', this.loggedInUserId, this.selectedUserId);
      
      this.messages = messages.filter(message => {
        const isMatch =
          (message.senderId === this.loggedInUserId && message.receiverId === this.selectedUserId) ||
          (message.senderId === this.selectedUserId && message.receiverId === this.loggedInUserId);
 
        console.log(`Message Sender: ${message.senderId}, Receiver: ${message.receiverId}, Match: ${isMatch}`);
        this.fetchChattedUsers;
        this.scrollToBottom(); // Ensure it scrolls to the bottom after updating messages


        return isMatch;
      });

      console.log('Filtered messages:', this.messages);
    } else {
      this.messages = [];
    }
  }
 
  sendMessage(): void {
    if (!this.selectedUserId || !this.loggedInUserId) {
      console.error('No user selected or logged-in user ID is missing');
      return;
    }
 
    const messagePayload = {
      senderId: this.loggedInUserId,
      receiverId: this.selectedUserId,
      content: this.message
    };
 
    this.chatService.sendMessage(messagePayload);
    this.fetchChattedUsers();
    this.message = '';
    this.scrollToBottom();
  }
 
  handleUserClick(user: User): void {
    console.log('Clicked user:', user);
    this.selectedUserId = user.id;
    this.selectedUserName = { firstname: user.firstname, lastname: user.lastname };
    this.subscribeToMessages();
  }
 
  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
  filterUsers(): void {
    if (this.searchQuery.trim() !== '') {
     
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
        
     
    } else {
      this.filteredUsers = [];
    }
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
  }

}