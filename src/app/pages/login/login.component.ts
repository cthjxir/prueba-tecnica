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

type LoginState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string };

@Component({
  selector: 'app-login',
  imports: [FormsModule, JsonPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  meState: MeState = { kind: 'no-token' };
  loginState: LoginState = { kind: 'idle' };

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
    // Validar que los campos no estén vacíos
    if (!this.username.trim() || !this.password.trim()) {
      this.loginState = {
        kind: 'error',
        message: 'Por favor, completa todos los campos',
      };
      return;
    }

    // Limpiar errores previos y mostrar estado de carga
    this.loginState = { kind: 'loading' };

    const body = { username: this.username.trim(), password: this.password };

    this.http.post<LoginResponse>(this.apiUrl + '/login', body).subscribe({
      next: (res) => {
        // Login exitoso
        const response = res as LoginResponse;
        localStorage.setItem('token', response.token);
        this.loginState = { kind: 'idle' };
        // Limpiar los campos del formulario
        this.username = '';
        this.password = '';
        this.loadMe();
      },
      error: (err) => {
        // Manejar diferentes tipos de errores
        const status = err.status ?? 0;
        let errorMessage = 'Error al iniciar sesión';

        if (status === 401) {
          errorMessage = 'Usuario o contraseña incorrectos';
        } else if (status === 400) {
          errorMessage = err.error?.error ?? 'Datos inválidos';
        } else if (status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else {
          errorMessage = err.error?.error ?? err.message ?? 'Error desconocido';
        }

        this.loginState = {
          kind: 'error',
          message: errorMessage,
        };
      },
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.meState = { kind: 'no-token' };
    this.loginState = { kind: 'idle' };
  }

  statusLabel(status: number): string {
    if (status === 401) return 'Unauthorized';
    if (status === 400) return 'Bad Request';
    return 'Error';
  }

  get isLoginLoading(): boolean {
    return this.loginState.kind === 'loading';
  }

  get hasLoginError(): boolean {
    return this.loginState.kind === 'error';
  }

  get loginErrorMessage(): string {
    return this.loginState.kind === 'error' ? this.loginState.message : '';
  }

  clearLoginError(): void {
    if (this.loginState.kind === 'error') {
      this.loginState = { kind: 'idle' };
    }
  }
}
