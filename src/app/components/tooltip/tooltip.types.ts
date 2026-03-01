/**
 * All supported tooltip placement positions.
 * The service will automatically flip to a mirrored position when the
 * preferred placement overflows the viewport.
 */
export type TooltipPosition =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'cursor'; // follows the mouse cursor

/** Payload used to show a tooltip. */
export interface TooltipConfig {
  /** The text content shown inside the tooltip. */
  content: string;
  /** Preferred placement relative to the anchor element (default: 'top'). */
  position?: TooltipPosition;
  /** Gap in pixels between the tooltip and the anchor edge (default: 8). */
  offset?: number;
  /** Maximum width of the tooltip in pixels (default: 280). */
  maxWidth?: number;
  /**
   * Optional CSS class(es) to append to the tooltip root element.
   * Useful for variant colours (e.g. 'tooltip--error', 'tooltip--info').
   */
  extraClass?: string;
  /** When true the tooltip shows an arrow pointing to the anchor (default: true). */
  showArrow?: boolean;
  /** Delay in ms before showing (default: 0). */
  showDelay?: number;
  /** Delay in ms before hiding (default: 0). */
  hideDelay?: number;
}

/** Internal state shared with the overlay component. */
export interface TooltipState extends Required<TooltipConfig> {
  visible: boolean;
  /** Resolved absolute left position (px). */
  x: number;
  /** Resolved absolute top position (px). */
  y: number;
  /** Final resolved placement after overflow correction. */
  resolvedPosition: TooltipPosition;
}
