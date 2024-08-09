import { Component, NgZone, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../classes/user';
import { PostService } from '../services/post.service';
import { Post } from '../classes/post';
import { Comment } from '../classes/comment';
import {jwtDecode} from 'jwt-decode';
import {  Router } from '@angular/router';
import { CommentService } from '../services/comment.service';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
@Component({
  selector: 'app-profile2',
  templateUrl: './profile2.component.html',
  styleUrls: ['./profile2.component.css']
})
export class Profile2Component implements OnInit {
  user!:User;
  users:User[]=[];
  allUsers:User[]=[];
  userId!:number;
  posts:Post[]=[];
  comments: { [key: number]: Comment[] } = {};
  content: string = '';
  image: File | null = null;
  creationDate!:Date;
  timeDifference: string = '';
  postsFiltred:Post[]=[];
  faHeartSolid = faHeartSolid;
  faHeartOutline = faHeartOutline;
  elRef: any;
   constructor( private authService:AuthService , private postService:PostService , private router:Router , private commentService:CommentService ){

    this.fetchUserData();
   
   }
   
    
   ngOnInit(): void {
   
    this.fetchUserData();
    this.authService.getAllUsers().subscribe(
      data => {
        this.allUsers = data;
        this.users = this.getRecentUsers(this.allUsers);
      }
    );
   
  
    this.fetchPostsFiltred();
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const issuedAt = decodedToken.iat;
      this.creationDate = new Date(issuedAt * 1000);
      console.log('Token issued at:', this.creationDate);
    } else {
      console.warn('No token found in localStorage.');
    }
    this.calculateTimeDifference();

  this.fetchPosts();
  console.log(this.fetchPosts())
  
   
   }
   getRecentUsers(users: User[]): User[] {
   
    return users
      .sort((a, b) => b.id - a.id)
      .slice(0, 7); 

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
          
          selectedPost.currentComment = '';  
          this.fetchPosts();  
        },
        error => {
          console.error('Error creating comment:', error);
        }
      );
    });
  }
  
   calculateTimeDifference(): void {
    const now = new Date();
    const differenceInMs = now.getTime() - this.creationDate.getTime();
    const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
    const hours = Math.floor(differenceInMinutes / 60);
    const minutes = differenceInMinutes % 60;
    this.timeDifference = `${hours} hour(s) and ${minutes} minute(s) ago`;
  }

   fetchUserData(): void {
    this.authService.getUserDataByToken().subscribe(
      userData => {
        this.userId = userData.id;
        this.user = userData;
        console.log(this.userId)
      },
      error => {
        console.error('Error fetching user data:', error);
      }
    );
    
  }

  goToUserProfile(userId: number): void {
    this.router.navigate([`/profile2/${userId}`]);
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
  fetchPosts(): void {

    console.log("fetch"+this.userId);
    this.postService.getPostsByUser(this.userId).subscribe(
      response => {
        this.posts = response.sort();
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

  fetchPostsFiltred(): void {

    this.postService.getPostsByUser(this.userId).subscribe(
      response => {
        console.log("ZZZZZZZZZZZZ",response)
        this.postsFiltred = response.filter(post => post?.image).sort();
        console.log("PPPPPPPPPPPPPPPPPPPPPP",this.postsFiltred)
       
      },
      error => {
        console.error('Error fetching posts:', error);
      }
    );
  }
  handleButtonClick(user: User): void {
    console.log('Selected User:', user);
    this.authService.setSelectedUser(user);
    if (this.authService.getSelectedUser !== this.fetchUserData) {
      this.router.navigate(['/chat']);
    }
  }
  toggleLike(post: Post) {
    console.log("Post ID:", post.id);
  
    if (post.isLiked) {
      this.postService.unlikePost(post.id).subscribe(
        () => {
          post.isLiked = false;
          post.likes--;
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
        },
        (error) => {
          console.error('Error liking post:', error);
        }
      );
    }
  }
}
function openModalFunction(c: any) {
  throw new Error('Function not implemented.');
}

