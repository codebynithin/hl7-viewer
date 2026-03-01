import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import type { TooltipPosition, TooltipState } from './tooltip.types';

@Component({
  selector: 'app-tooltip-overlay',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tooltip-overlay.component.html',
  styleUrl: './tooltip-overlay.component.scss',
})
export class TooltipOverlayComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  state: TooltipState | null = null;

  setState(newState: TooltipState): void {
    this.state = newState;

    this.cdr.markForCheck();
  }

  hide(): void {
    if (this.state) {
      this.state = { ...this.state, visible: false };

      this.cdr.markForCheck();
    }
  }

  updatePosition(
    x: number,
    y: number,
    resolvedPosition: TooltipPosition
  ): void {
    if (this.state) {
      this.state = { ...this.state, x, y, resolvedPosition };

      this.cdr.markForCheck();
    }
  }
}
