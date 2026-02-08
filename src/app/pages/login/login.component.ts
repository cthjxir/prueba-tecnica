import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Lo que devuelve el backend cuando el login es correcto
interface LoginResponse {
  token: string;
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
      console.log(response);
    });
  }
}
