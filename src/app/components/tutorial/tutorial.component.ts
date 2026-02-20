import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TutorialService,
  TutorialStep,
  TutorialPosition,
} from '../../services/tutorial.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.scss',
})
export class TutorialComponent implements OnInit, OnDestroy {
  public isActive = false;
  public currentStep: TutorialStep | null = null;
  public currentStepIndex = 0;
  public totalSteps = 0;
  public highlightRect: DOMRect | null = null;

  private destroy$ = new Subject<void>();

  constructor(public tutorialService: TutorialService) {
    this.totalSteps = this.tutorialService.steps.length;
  }

  ngOnInit(): void {
    this.tutorialService.isActive$
      .pipe(takeUntil(this.destroy$))
      .subscribe(active => {
        this.isActive = active;
        if (active) {
          this.updateHighlight();
        }
      });

    this.tutorialService.currentStep$
      .pipe(takeUntil(this.destroy$))
      .subscribe(index => {
        this.currentStepIndex = index;
        this.currentStep = this.tutorialService.getCurrentStep();
        if (this.isActive) {
          setTimeout(() => this.updateHighlight(), 100);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onNext(): void {
    this.tutorialService.nextStep();
  }

  public onPrevious(): void {
    this.tutorialService.previousStep();
  }

  public onSkip(): void {
    this.tutorialService.skipTutorial();
  }

  public onComplete(): void {
    this.tutorialService.completeTutorial();
  }

  private updateHighlight(): void {
    if (!this.currentStep?.targetSelector) {
      this.highlightRect = null;
      return;
    }

    const element = document.querySelector(this.currentStep.targetSelector);
    if (element) {
      this.highlightRect = element.getBoundingClientRect();
    } else {
      this.highlightRect = null;
    }
  }

  public getTooltipStyle(): any {
    if (!this.currentStep) return {};

    if (
      this.currentStep.position === TutorialPosition.Center ||
      !this.highlightRect
    ) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = this.currentStep.highlightPadding || 8;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    let top = 0;
    let left = 0;

    switch (this.currentStep.position) {
      case TutorialPosition.Bottom:
        top = this.highlightRect.bottom + padding + 10;
        left =
          this.highlightRect.left +
          this.highlightRect.width / 2 -
          tooltipWidth / 2;
        break;
      case TutorialPosition.Top:
        top = this.highlightRect.top - padding - tooltipHeight - 10;
        left =
          this.highlightRect.left +
          this.highlightRect.width / 2 -
          tooltipWidth / 2;
        break;
      case TutorialPosition.Left:
        top =
          this.highlightRect.top +
          this.highlightRect.height / 2 -
          tooltipHeight / 2;
        left = this.highlightRect.left - tooltipWidth - padding - 10;
        break;
      case TutorialPosition.Right:
        top =
          this.highlightRect.top +
          this.highlightRect.height / 2 -
          tooltipHeight / 2;
        left = this.highlightRect.right + padding + 10;
        break;
      case TutorialPosition.RightBottom:
        top = this.highlightRect.bottom + padding + 10;
        left = this.highlightRect.right - tooltipWidth;
        break;
      case TutorialPosition.RightTop:
        top = this.highlightRect.top - padding - tooltipHeight - 10;
        left = this.highlightRect.right - tooltipWidth;
        break;
      case TutorialPosition.LeftBottom:
        top = this.highlightRect.bottom + padding + 10;
        left = this.highlightRect.left;
        break;
      case TutorialPosition.LeftTop:
        top = this.highlightRect.top - padding - tooltipHeight - 10;
        left = this.highlightRect.left;
        break;
    }

    // Keep tooltip within viewport
    const maxLeft = window.innerWidth - tooltipWidth - 20;
    const maxTop = window.innerHeight - tooltipHeight - 20;
    left = Math.max(20, Math.min(left, maxLeft));
    top = Math.max(20, Math.min(top, maxTop));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
    };
  }

  public getHighlightStyle(): any {
    if (!this.highlightRect) return { display: 'none' };

    const padding = this.currentStep?.highlightPadding || 8;

    return {
      position: 'fixed',
      top: `${this.highlightRect.top - padding}px`,
      left: `${this.highlightRect.left - padding}px`,
      width: `${this.highlightRect.width + padding * 2}px`,
      height: `${this.highlightRect.height + padding * 2}px`,
      pointerEvents: 'none',
    };
  }

  public isLastStep(): boolean {
    return this.currentStepIndex === this.totalSteps - 1;
  }

  public isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }
}
