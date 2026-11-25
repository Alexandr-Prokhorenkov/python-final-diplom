import { Component } from '@angular/core';

import { ProfileForm } from '@features/update-profile';
import { PageHeader } from '@shared/ui';

@Component({
  selector: 'page-profile',
  imports: [PageHeader, ProfileForm],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage {}
