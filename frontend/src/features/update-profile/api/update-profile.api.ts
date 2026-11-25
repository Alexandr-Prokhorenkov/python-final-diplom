import { inject, Injectable } from '@angular/core';

import { UserApi, UserUpdatePayload } from '@entities/user';

@Injectable({ providedIn: 'root' })
export class UpdateProfileApi {
  private readonly users = inject(UserApi);

  update(payload: UserUpdatePayload) {
    return this.users.update(payload);
  }
}
