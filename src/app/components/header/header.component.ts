import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import packageJson from '../../../../package.json';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public isDarkMode$ = this.themeService.isDarkMode$;
  public readonly appVersion = `v${packageJson.version}`;

  @Output() copyClicked = new EventEmitter<void>();
  @Output() clearClicked = new EventEmitter<void>();

  constructor(private themeService: ThemeService) {}

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  public onCopy(): void {
    this.copyClicked.emit();
  }

  public onClear(): void {
    this.clearClicked.emit();
  }
}
