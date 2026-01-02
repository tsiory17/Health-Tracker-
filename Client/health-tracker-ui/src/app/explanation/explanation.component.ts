import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-explanation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explanation.component.html',
  styleUrl: './explanation.component.css'
})
export class ExplanationComponent {
  constructor(private router: Router) {}

  navigateToSetup(): void {
    this.router.navigate(['/setup']);
  }
}
