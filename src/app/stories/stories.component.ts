import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StoryService } from '../services/story.service';
import { Story } from '../classes/story';
import { AuthService } from '../services/auth.service';
import { User } from '../classes/user';

@Component({
  selector: 'app-stories',
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.css']
})
export class StoriesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  stories: Story[] = [];
  userId!: number;
  user!: User;
  image: File | null = null;

  constructor(private storiesService: StoryService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserDataByToken().subscribe(
      userData => {
        this.userId = userData.id;
        this.user = userData;

        this.storiesService.getStories().subscribe(response => {
          const recentStories = this.filterRecentStories(response);
          this.stories = recentStories.sort((a, b) => (a.user.id === this.userId ? -1 : 1));
        });
      },
      error => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  filterRecentStories(stories: Story[]): Story[] {
    const now = new Date();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    return stories.filter(story => {
      if (story.dateAjout) {
        const storyDate = new Date(story.dateAjout);
        const differenceInMs = now.getTime() - storyDate.getTime();
        return differenceInMs <= twentyFourHoursInMs;
      }
      return false;
    });
  }
  onFileSelected(event: any): void {
    this.image = event.target.files[0];
  }
  submit(): void {
    console.log('Submit method called');
    if (this.image) {
      const formData = new FormData();
      formData.append('file', this.image);

      this.storiesService.createStory(this.image).subscribe(
        story => {
          console.log('Story created:', story);
          this.stories.unshift(story);
          this.image = null;
          console.log('Story added to list:', story);
        },
        error => {
          console.error('Error creating story:', error);
        }
      );
    } else {
      console.error('No image selected');
    }
  }
}