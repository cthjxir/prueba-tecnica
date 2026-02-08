import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Lo que devuelve el backend cuando el login es correcto
interface LoginResponse {
  token: string;
}

// Esto es lo que devolverá GET /me cuando el usuario esté autenticado
interface MeResponse {
  id: string;
  username: string;
  fullname: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private http: HttpClient) {}

  onSubmit(): void {
    const body = { username: this.username, password: this.password };
    this.http.post<LoginResponse>('http://localhost:3000/login', body).subscribe((res) => {
      const response = res as LoginResponse;
      localStorage.setItem('token', response.token);

      // Llamar a GET /me con el token para obtener los datos del usuario
      const token = response.token;
      this.http
        .get<MeResponse>('http://localhost:3000/me', {
          headers: { Authorization: 'Bearer ' + token },
        })
        .subscribe((user) => {
          console.log('Resultado:', user);
        });
    });
  }
}
