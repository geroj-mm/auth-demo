import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from 'src/environments/environment';
import { User } from '../_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    private activeUser: User;
    public currentToken: string;

    constructor(private http: HttpClient) {
        const jwtHelper = new JwtHelperService();
        this.activeUser = jwtHelper.decodeToken(localStorage.getItem('token'));
        if (this.activeUser != null) {
            this.activeUser.token = localStorage.getItem('token');
        }
        this.currentUserSubject = new BehaviorSubject<User>(this.activeUser);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/users/authenticate`, { username, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('token', user.token);
                this.currentUserSubject.next(user);
                return true;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
    }
}
