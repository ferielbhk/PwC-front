import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module'; // Assurez-vous que ce chemin est correct
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { FeedComponent } from './feed/feed.component';
import { ChatComponent } from './chat/chat.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { UsersComponent } from './users/users.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NavbarComponent } from './navbar/navbar.component';
import { ButtonModule } from 'primeng/button';
import { NotifComponent } from './notif/notif.component';
import { ProfileComponent } from './profile/profile.component';
import { Profile2Component } from './profile2/profile2.component';
import { PostDetailsComponent } from './post-details/post-details.component';
import { UserProfilComponent } from './user-profil/user-profil.component';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { StoriesComponent } from './stories/stories.component';
import { ModalComponent } from './modal/modal.component';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SignupComponent,
    FeedComponent,
    ChatComponent,
    UsersComponent,
    NavbarComponent,
    NotifComponent,
    ProfileComponent,
    Profile2Component,
    PostDetailsComponent,
    UserProfilComponent,
    StoriesComponent,
    ModalComponent
],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    BrowserAnimationsModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    HttpClientModule,
    InfiniteScrollDirective,
    ButtonModule,
    NgbModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
