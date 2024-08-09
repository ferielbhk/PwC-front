import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { Post } from '../classes/post';
import { CommentService } from '../services/comment.service';
import { AuthService } from '../services/auth.service';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css']
})
export class PostDetailsComponent {
  post!:Post;
  userId!:number;
  comment!: string;
  commentt = {} as Comment;
  faHeartSolid = faHeartSolid;
  faHeartOutline = faHeartOutline;
  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService:CommentService,
    private authService:AuthService,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const postId = +params.get('id')!;
      this.postService.getPostById(postId).subscribe(post => {
        this.post = post;
      });
    });
  }
  createComment(postId: number): void {
    this.authService.getUserDataByToken().subscribe(userData => {
      this.userId = userData.id;
    
      this.commentService.createComment(postId, this.userId, this.comment).subscribe(
        response => {
          console.log('Comment created:', response);
    
          this.comment = '';
        
        },
        error => {
          console.error('Error creating comment:', error);
        }
      );
    });
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
  
  signOff(){
    this.authService.signOff()
    this.router.navigate(['/signin'])
  }

}
