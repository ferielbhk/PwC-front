import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profile2Component } from './profile2.component';

describe('Profile2Component', () => {
  let component: Profile2Component;
  let fixture: ComponentFixture<Profile2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Profile2Component]
    });
    fixture = TestBed.createComponent(Profile2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
