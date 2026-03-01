import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import {
  TooltipConfig,
  TooltipPosition,
  TooltipService,
} from '../../services/tooltip.service';

/**
 * ### TooltipDirective
 *
 * Attach a fully-managed tooltip to any element declaratively in templates.
 *
 * **Basic usage**
 * ```html
 * <button tooltip="Save the file">Save</button>
 * ```
 *
 * **Configuring position**
 * ```html
 * <button tooltip="Delete record" tooltipPosition="bottom-end">Delete</button>
 * ```
 *
 * **All options**
 * ```html
 * <span
 *   tooltip="Some info"
 *   tooltipPosition="right"
 *   [tooltipOffset]="12"
 *   [tooltipMaxWidth]="200"
 *   tooltipExtraClass="tooltip--warning"
 *   [tooltipShowArrow]="true"
 *   [tooltipShowDelay]="300"
 *   [tooltipHideDelay]="100"
 *   [tooltipDisabled]="!hasPermission">
 * </span>
 * ```
 */
@Directive({
  selector: '[tooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy, OnChanges {
  // ── Inputs ──────────────────────────────────────────────────────────────

  /** The tooltip text (aliased as the directive selector for convenience). */
  @Input('tooltip') content = '';

  /** Placement of the tooltip relative to the host element (default: 'top'). */
  @Input() tooltipPosition: TooltipPosition = 'top';

  /** Gap in pixels between the tooltip and the host edge (default: 8). */
  @Input() tooltipOffset = 8;

  /** Maximum width of the tooltip in pixels (default: 280). */
  @Input() tooltipMaxWidth = 280;

  /**
   * Extra CSS class(es) applied to the tooltip root.
   * Built-in variants: `tooltip--error` | `tooltip--success` | `tooltip--warning` | `tooltip--info`
   */
  @Input() tooltipExtraClass = '';

  /** Whether to render the directional arrow (default: true). */
  @Input() tooltipShowArrow = true;

  /** Delay in ms before the tooltip appears (default: 0). */
  @Input() tooltipShowDelay = 0;

  /** Delay in ms before the tooltip disappears (default: 0). */
  @Input() tooltipHideDelay = 0;

  /** When true the tooltip is suppressed entirely (default: false). */
  @Input() tooltipDisabled = false;

  // ── DI ──────────────────────────────────────────────────────────────────

  private readonly tooltipService = inject(TooltipService);
  private readonly el = inject(ElementRef<HTMLElement>);

  // ─────────────────────────────────────────────────────────────────────────

  ngOnChanges(): void {
    // If disabled while visible, immediately hide
    if (this.tooltipDisabled) {
      this.tooltipService.hide(0);
    }
  }

  ngOnDestroy(): void {
    this.tooltipService.hide(0);
  }

  // ── Event listeners ──────────────────────────────────────────────────────

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    if (this.tooltipDisabled || !this.content) return;
    this.tooltipService.show(this.el.nativeElement, this.buildConfig(), event);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.tooltipDisabled || !this.content) return;
    if (this.tooltipPosition === 'cursor') {
      this.tooltipService.updatePosition(
        this.el.nativeElement,
        this.buildConfig(),
        event
      );
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.tooltipService.hide(this.tooltipHideDelay);
  }

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent): void {
    if (this.tooltipDisabled || !this.content) return;
    this.tooltipService.show(this.el.nativeElement, this.buildConfig());
  }

  @HostListener('blur')
  onBlur(): void {
    this.tooltipService.hide(this.tooltipHideDelay);
  }

  @HostListener('click')
  onClick(): void {
    // Clicking an element normally means the user acted — hide the tooltip
    this.tooltipService.hide(0);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private buildConfig(): TooltipConfig {
    return {
      content: this.content,
      position: this.tooltipPosition,
      offset: this.tooltipOffset,
      maxWidth: this.tooltipMaxWidth,
      extraClass: this.tooltipExtraClass,
      showArrow: this.tooltipShowArrow,
      showDelay: this.tooltipShowDelay,
      hideDelay: this.tooltipHideDelay,
    };
  }
}
