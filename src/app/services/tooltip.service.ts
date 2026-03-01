import {
  Injectable,
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { TooltipOverlayComponent } from '../components/tooltip/tooltip-overlay.component';
import type {
  TooltipConfig,
  TooltipPosition,
  TooltipState,
} from '../components/tooltip/tooltip.types';

// Re-export so existing consumers importing from this file continue to work.
export type { TooltipConfig, TooltipPosition, TooltipState };

@Injectable({ providedIn: 'root' })
export class TooltipService {
  private readonly appRef = inject(ApplicationRef);
  private readonly envInjector = inject(EnvironmentInjector);

  private overlayRef: ComponentRef<TooltipOverlayComponent> | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private rafId: number | null = null;

  /** Last known mouse coordinates — used for the 'cursor' position mode. */
  private mouseX = 0;
  private mouseY = 0;

  constructor() {
    // Track global mouse position so that 'cursor' placement always works,
    // even when show() is called from a non-mouse event (e.g. focus).
    document.addEventListener('mousemove', (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Show a tooltip for an anchor element.
   *
   * @param anchor  The element the tooltip should be placed relative to.
   * @param config  Tooltip configuration.
   * @param event   Optional mouse event; used to seed cursor X/Y when
   *                `position` is 'cursor'.
   */
  show(anchor: HTMLElement, config: TooltipConfig, event?: MouseEvent): void {
    this.clearHideTimer();

    const mergedConfig = this.mergeDefaults(config);

    if (event) {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    }

    const doShow = () => {
      const overlay = this.getOrCreateOverlay();
      const coords = this.calculatePosition(anchor, mergedConfig);

      overlay.instance.setState({
        ...mergedConfig,
        visible: true,
        x: coords.x,
        y: coords.y,
        resolvedPosition: coords.resolvedPosition,
      });

      // Two-pass positioning: schedule a rAF so we read real rendered size
      // *after* Angular's OnPush CD and the browser paint have both completed.
      // Promise.resolve() (microtask) fires before Angular flushes the view,
      // so the tooltip element may not exist in the DOM yet at that point.
      this.cancelRaf();
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        if (!this.overlayRef?.instance.state?.visible) return;
        const refined = this.calculatePositionFromDOM(anchor, mergedConfig);
        if (refined) {
          overlay.instance.updatePosition(
            refined.x,
            refined.y,
            refined.resolvedPosition
          );
        }
      });
    };

    if (mergedConfig.showDelay > 0) {
      this.showTimer = setTimeout(doShow, mergedConfig.showDelay);
    } else {
      doShow();
    }
  }

  /** Hide the currently visible tooltip. */
  hide(delay?: number): void {
    this.clearShowTimer();
    this.cancelRaf();

    const effectiveDelay =
      delay !== undefined
        ? delay
        : (this.overlayRef?.instance.state?.hideDelay ?? 0);

    const doHide = () => {
      if (this.overlayRef) {
        this.overlayRef.instance.hide();
      }
    };

    if (effectiveDelay > 0) {
      this.hideTimer = setTimeout(doHide, effectiveDelay);
    } else {
      doHide();
    }
  }

  /**
   * Update only the position of the currently shown tooltip.
   * Useful for the 'cursor' placement mode where the tooltip tracks mouse
   * movement on every `mousemove` event.
   */
  updatePosition(
    anchor: HTMLElement,
    config: TooltipConfig,
    event: MouseEvent
  ): void {
    if (!this.overlayRef || !this.overlayRef.instance.state?.visible) return;

    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    const mergedConfig = this.mergeDefaults(config);
    const coords = this.calculatePosition(anchor, mergedConfig);

    this.overlayRef.instance.updatePosition(
      coords.x,
      coords.y,
      coords.resolvedPosition
    );
  }

  /** Destroy the overlay component entirely (called on service destroy or for cleanup). */
  destroyOverlay(): void {
    if (this.overlayRef) {
      this.appRef.detachView(this.overlayRef.hostView);
      this.overlayRef.destroy();
      this.overlayRef = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  private mergeDefaults(config: TooltipConfig): Required<TooltipConfig> {
    return {
      content: config.content,
      position: config.position ?? 'top',
      offset: config.offset ?? 8,
      maxWidth: config.maxWidth ?? 280,
      extraClass: config.extraClass ?? '',
      showArrow: config.showArrow !== false,
      showDelay: config.showDelay ?? 0,
      hideDelay: config.hideDelay ?? 0,
    };
  }

  private getOrCreateOverlay(): ComponentRef<TooltipOverlayComponent> {
    if (this.overlayRef) return this.overlayRef;

    this.overlayRef = createComponent(TooltipOverlayComponent, {
      environmentInjector: this.envInjector,
    });

    this.appRef.attachView(this.overlayRef.hostView);

    const domElem = (this.overlayRef.hostView as any)
      .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    return this.overlayRef;
  }

  /**
   * First-pass: resolve pixel coordinates using a conservative estimated
   * tooltip height (we don't know real size before the first render).
   */
  private calculatePosition(
    anchor: HTMLElement,
    config: Required<TooltipConfig>
  ): { x: number; y: number; resolvedPosition: TooltipPosition } {
    if (config.position === 'cursor') {
      const offset = config.offset;
      let x = this.mouseX + offset;
      let y = this.mouseY + offset;

      const estW = Math.min(config.maxWidth, 300);
      const estH = 36;

      if (x + estW > window.innerWidth - 16) x = this.mouseX - estW - offset;
      if (y + estH > window.innerHeight - 16) y = this.mouseY - estH - offset;

      return { x, y, resolvedPosition: 'cursor' };
    }

    return this.calculatePositionWithSize(
      anchor,
      config,
      Math.min(config.maxWidth, 300),
      36 // conservative first-pass height
    );
  }

  /**
   * Second-pass: measure the real rendered tooltip from the DOM and
   * recompute exact pixel-perfect coordinates.
   * Returns null if the overlay element isn't in the DOM yet.
   */
  private calculatePositionFromDOM(
    anchor: HTMLElement,
    config: Required<TooltipConfig>
  ): { x: number; y: number; resolvedPosition: TooltipPosition } | null {
    if (!this.overlayRef) return null;

    const domEl = (this.overlayRef.hostView as any).rootNodes[0] as
      | HTMLElement
      | undefined;
    const tooltipEl = domEl?.querySelector<HTMLElement>('[data-pos]');

    if (!tooltipEl) return null;

    const tipRect = tooltipEl.getBoundingClientRect();
    if (!tipRect.width && !tipRect.height) return null;

    return this.calculatePositionWithSize(
      anchor,
      config,
      tipRect.width,
      tipRect.height
    );
  }

  /** Core positioning logic parameterised by known tooltip dimensions. */
  private calculatePositionWithSize(
    anchor: HTMLElement,
    config: Required<TooltipConfig>,
    tipW: number,
    tipH: number
  ): { x: number; y: number; resolvedPosition: TooltipPosition } {
    const rect = anchor.getBoundingClientRect();
    const offset = config.offset;

    const positions: TooltipPosition[] = this.getPositionFallbacks(
      config.position
    );

    for (const pos of positions) {
      const coords = this.coordsForPosition(pos, rect, offset, tipW, tipH);
      if (this.fitsInViewport(coords.x, coords.y, tipW, tipH)) {
        return { ...coords, resolvedPosition: pos };
      }
    }

    // Fallback: clamp the first-choice position to the viewport
    const fallback = this.coordsForPosition(
      positions[0],
      rect,
      offset,
      tipW,
      tipH
    );
    fallback.x = Math.max(
      8,
      Math.min(fallback.x, window.innerWidth - tipW - 8)
    );
    fallback.y = Math.max(
      8,
      Math.min(fallback.y, window.innerHeight - tipH - 8)
    );
    return { ...fallback, resolvedPosition: positions[0] };
  }

  private coordsForPosition(
    pos: TooltipPosition,
    rect: DOMRect,
    offset: number,
    tipW: number,
    tipH: number
  ): { x: number; y: number } {
    const midX = rect.left + rect.width / 2;
    const midY = rect.top + rect.height / 2;

    switch (pos) {
      case 'top':
        return { x: midX - tipW / 2, y: rect.top - tipH - offset };
      case 'top-start':
        return { x: rect.left, y: rect.top - tipH - offset };
      case 'top-end':
        return { x: rect.right - tipW, y: rect.top - tipH - offset };

      case 'bottom':
        return { x: midX - tipW / 2, y: rect.bottom + offset };
      case 'bottom-start':
        return { x: rect.left, y: rect.bottom + offset };
      case 'bottom-end':
        return { x: rect.right - tipW, y: rect.bottom + offset };

      case 'left':
        return { x: rect.left - tipW - offset, y: midY - tipH / 2 };
      case 'left-start':
        return { x: rect.left - tipW - offset, y: rect.top };
      case 'left-end':
        return { x: rect.left - tipW - offset, y: rect.bottom - tipH };

      case 'right':
        return { x: rect.right + offset, y: midY - tipH / 2 };
      case 'right-start':
        return { x: rect.right + offset, y: rect.top };
      case 'right-end':
        return { x: rect.right + offset, y: rect.bottom - tipH };

      default:
        return { x: midX - tipW / 2, y: rect.top - tipH - offset };
    }
  }

  private fitsInViewport(x: number, y: number, w: number, h: number): boolean {
    return (
      x >= 8 &&
      y >= 8 &&
      x + w <= window.innerWidth - 8 &&
      y + h <= window.innerHeight - 8
    );
  }

  /**
   * Returns a list of positions to try in order.
   * The primary position is first, followed by the auto-flipped alternative.
   */
  private getPositionFallbacks(position: TooltipPosition): TooltipPosition[] {
    const flips: Record<string, TooltipPosition> = {
      top: 'bottom',
      'top-start': 'bottom-start',
      'top-end': 'bottom-end',
      bottom: 'top',
      'bottom-start': 'top-start',
      'bottom-end': 'top-end',
      left: 'right',
      'left-start': 'right-start',
      'left-end': 'right-end',
      right: 'left',
      'right-start': 'left-start',
      'right-end': 'left-end',
    };

    const fallback = flips[position];
    return fallback ? [position, fallback] : [position];
  }

  private cancelRaf(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private clearShowTimer(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private clearHideTimer(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
