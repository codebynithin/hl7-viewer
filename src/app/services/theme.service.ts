import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(true);
  public isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    this.isDarkMode.next(isDark);
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    const newThemeIsDark = !this.isDarkMode.value;
    this.isDarkMode.next(newThemeIsDark);
    this.applyTheme(newThemeIsDark);
    localStorage.setItem('theme', newThemeIsDark ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }
}
