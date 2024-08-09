import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../classes/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent {
  loggedInUserId: number | undefined;
  users: User[] = [];
  selectedUserId: number | null = null;
  searchTerm: string = '';
  filteredUsers: User[] = [];
  searchText: string = '';
  isSearching:boolean=false;
  user!:User;


  constructor(private authService:AuthService ,  private router: Router , private cd: ChangeDetectorRef) {
   }

  ngOnInit(): void {
    window.location.reload;
    forkJoin({
      
      userData: this.authService.getUserDataByToken(),
      allUsers: this.authService.getAllUsers()
    }).subscribe(
      ({ userData, allUsers }) => {
        window.location.reload;

        this.loggedInUserId = userData.id;
        this.users = allUsers.filter(user => user.id !== this.loggedInUserId);
        this.filteredUsers = [...this.users]; 
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
    this.fetchUserData();
    window.location.reload;


  }
  signOff(){
    this.authService.signOff();
    this.router.navigate(["/signin"])
  }
  fetchUserData(): void {
    this.authService.getUserDataByToken().subscribe(
      userData => {
        this.user = userData;
      },
      error => {
        console.error('Error fetching user data:', error);
      }
    );
  }
  filterUsers() {
    this.isSearching = this.searchText.trim() !== '';
    if (this.isSearching) {
      this.filteredUsers = this.users.filter(user =>
        user.firstname.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.lastname.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredUsers = this.users;
    }
  }
  viewProfil(id : number){
    this.router.navigate(['/profile2', id]);
    console.log("mlkjhgfdsdfghjklmkjhgfds" , id)
  }
  handleButtonClick(user: User): void {
    console.log('Selected User:', user);
    this.authService.setSelectedUser(user);
    this.router.navigate(['/chat']); 
  }
 
}
