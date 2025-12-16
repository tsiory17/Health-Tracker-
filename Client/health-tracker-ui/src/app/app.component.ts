import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Health Tracker';
  showSidebar = false;
  showNavbar = false;

  constructor(private router: Router) { }

  ngOnInit() {
    // Check initial route on app load
    // this.checkRoute(this.router.url);

    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.url);
    });
  }

  private checkRoute(url: string) {
    // Hide sidebar margin and navbar for login, register, and setup pages
    const authPages = ['/login', '/register', '/setup'];
    const isAuthPage = authPages.some(path => url.includes(path));
    this.showSidebar = !isAuthPage;
    this.showNavbar = !isAuthPage;
  }
}
