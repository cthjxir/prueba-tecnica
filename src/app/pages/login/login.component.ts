import { Component, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  token: string;
}

interface MeResponse {
  id: string;
  username: string;
  fullname: string;
}

type MeState =
  | { kind: 'no-token' }
  | { kind: 'loading' }
  | { kind: 'user'; data: MeResponse }
  | { kind: 'error'; status: number; message: string };

@Component({
  selector: 'app-login',
  imports: [FormsModule, JsonPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  meState: MeState = { kind: 'no-token' };

  private readonly apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.loadMe();
    } else {
      this.meState = { kind: 'no-token' };
    }
  }

  loadMe(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.meState = { kind: 'no-token' };
      return;
    }
    this.meState = { kind: 'loading' };
    this.http
      .get<MeResponse>(this.apiUrl + '/me', {
        headers: { Authorization: 'Bearer ' + token },
      })
      .subscribe({
        next: (user) => {
          this.meState = { kind: 'user', data: user };
        },
        error: (err) => {
          const status = err.status ?? 0;
          const message = err.error?.error ?? err.message ?? 'Error';
          this.meState = { kind: 'error', status, message };
        },
      });
  }

  onSubmit(): void {
    const body = { username: this.username, password: this.password };
    this.http.post<LoginResponse>(this.apiUrl + '/login', body).subscribe((res) => {
      const response = res as LoginResponse;
      localStorage.setItem('token', response.token);
      this.loadMe();
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.meState = { kind: 'no-token' };
  }

  statusLabel(status: number): string {
    if (status === 401) return 'Unauthorized';
    if (status === 400) return 'Bad Request';
    return 'Error';
  }
}
