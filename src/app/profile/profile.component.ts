import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PostService } from '../services/post.service';
import { CommentService } from '../services/comment.service';
import { User } from '../classes/user';
import { Post } from '../classes/post';
import { Comment } from '../classes/comment';
import jwtDecode from 'jwt-decode';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user!: User;
  users: User[] = [];
  allUsers: User[] = [];
  userId!: number;
  posts: Post[] = [];
  comments: { [key: number]: Comment[] } = {};
  content: string = '';
  image: File | null = null;
  creationDate!: Date;
  timeDifference: string = '';
  postsFiltred: Post[] = [];
  faHeartSolid = faHeartSolid;
  faHeartOutline = faHeartOutline;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private commentService: CommentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = Number(params.get('id'));
      if (this.userId) {
        this.getUser();
        this.fetchPosts();
        this.fetchPostsFiltred();
        this.authService.getAllUsers().subscribe(data => {
          this.allUsers = data;
          this.users = this.getRecentUsers(this.allUsers);
        });
      }
    });
    this.calculateTimeDifference();
  }

  goToUserProfile(userId: number): void {
    this.router.navigate([`/profile2/${userId}`]);
  }

  getUser(): void {
    this.authService.getbyId(this.userId).subscribe(user => {
      this.user = user;
    }, error => {
      console.error('Error fetching user:', error);
    });
  }

  createComment(postId: number): void {
    this.authService.getUserDataByToken().subscribe(userData => {
      this.userId = userData.id;
      const selectedPost = this.posts.find(post => post.id === postId);
      if (selectedPost) {
        this.commentService.createComment(postId, this.userId, selectedPost.currentComment).subscribe(
          response => {
            selectedPost.currentComment = '';
            this.fetchPosts();
          },
          error => {
            console.error('Error creating comment:', error);
          }
        );
      }
    });
  }

  toggleLike(post: Post) {
    if (post.isLiked) {
      this.postService.unlikePost(post.id).subscribe(() => {
        post.isLiked = false;
        post.likes--;
      }, error => {
        console.error('Error unliking post:', error);
      });
    } else {
      this.postService.likePost(post.id).subscribe(() => {
        post.isLiked = true;
        post.likes++;
      }, error => {
        console.error('Error liking post:', error);
      });
    }
  }

  getRecentUsers(users: User[]): User[] {
    return users.filter(user => user.id !== this.userId).sort((a, b) => b.id - a.id).slice(0, 7);
  }

  calculateTimeDifference(): void {
    const now = new Date();
    const differenceInMs = now.getTime() - this.creationDate.getTime();
    const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
    const hours = Math.floor(differenceInMinutes / 60);
    const minutes = differenceInMinutes % 60;
    this.timeDifference = `${hours} hour(s) and ${minutes} minute(s) ago`;
  }

  fetchPosts(): void {
    if (this.userId) {
      console.log(`Fetching posts for user ID: ${this.userId}`);
      this.postService.getPostsBySimpleUser(this.userId).subscribe(response => {
        console.log("userId"+this.userId)
        this.posts = response ;
        console.log("responsee off fetchpostsbyid 2"+this.posts)
        console.log("length offff fetchpostsbyid 2"+this.posts.length)


        this.posts.forEach(post => {
          this.comments[post.id] = post.comments;
          post.isLiked = post.likedUsers.some(likedUser => likedUser.id === this.userId);
        });
        console.log('Posts:', this.posts);
      }, error => {
        console.error('Error fetching posts:', error);
      });
    }
  }

  fetchPostsFiltred(): void {
    if (this.userId) {
      this.postService.getPostsBySimpleUser(this.userId).subscribe(response => {
        this.postsFiltred = (response || []).filter(post => post?.image).sort((a, b) => b.id - a.id);
      }, error => {
        console.error('Error fetching filtered posts:', error);
      });
    }
  }

  onFileSelected(event: any): void {
    this.image = event.target.files[0];
  }

  onSubmit(): void {
    if (this.content || this.image) {
      this.postService.createPost(this.content, this.image).subscribe(post => {
        this.posts.unshift(post);
        this.content = '';
        this.image = null;
      }, error => {
        console.error('Error creating post:', error);
      });
    }
  }
}
