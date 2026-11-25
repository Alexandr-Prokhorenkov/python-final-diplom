import { Component } from '@angular/core';

import { ProfileForm } from '@features/update-profile';
import { PageHeader } from '@shared/ui';

@Component({
  selector: 'page-profile',
  imports: [PageHeader, ProfileForm],
  template: `
    <section class="app-page">
      <ui-page-header title="Профиль" />
      <feature-profile-form />
    </section>
  `,
})
export class ProfilePage {}
