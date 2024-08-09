import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { FeedComponent } from './feed/feed.component';
import { UsersComponent } from './users/users.component';
import { authGuard } from './services/auth.guard';
import { NotifComponent } from './notif/notif.component';
import { ProfileComponent } from './profile/profile.component';
import { Profile2Component } from './profile2/profile2.component';
import { PostDetailsComponent } from './post-details/post-details.component';
import { UserProfilComponent } from './user-profil/user-profil.component';
import { ModalComponent } from './modal/modal.component';
import { StoriesComponent } from './stories/stories.component';

const routes: Routes = [
  { path: 'chat', component: ChatComponent, canActivate: [authGuard]  },
  { path: 'signup', component: SignupComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'feed', component: FeedComponent , canActivate: [authGuard] },
  {path:'allNotif' , component: NotifComponent },
  {path:'profile2' , component: Profile2Component },
  {path:'profil' , component: UserProfilComponent },
  {path:'modal' , component: ModalComponent },
  {path:'story' , component: StoriesComponent },

  { path: 'profile2/:id', component: ProfileComponent},
  {path:'postDetails/:id' , component:PostDetailsComponent},
  { path: 'members', component: UsersComponent , canActivate: [authGuard]},
  { path: '', redirectTo: '/feed', pathMatch: 'full' },
  { path: '**', redirectTo: '/feed' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
