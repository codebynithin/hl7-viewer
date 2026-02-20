import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  public currentYear = new Date().getFullYear();
  public githubIssueUrl = 'https://github.com/codebynithin/hl7-viewer/issues';
}
