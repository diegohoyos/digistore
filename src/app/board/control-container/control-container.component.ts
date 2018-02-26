import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operators";
import * as fromStore from "../../store";
import { ResetScore, StartPlaying, StopPlaying } from "../../store/actions";
import { AddScore } from "../../store/actions/score.actions";
import { AddAttempt } from "../../store/actions/attempts.actions";

@Component({
  selector: "app-control-container",
  templateUrl: "./control-container.component.html",
  styleUrls: ["./control-container.component.css"]
})
export class ControlContainerComponent implements OnInit {
  // Sounds
  @ViewChild("startGameSound") startGameSound;
  @ViewChild("gameOverSound") gameOverSound;
  @ViewChild("arrowSound") arrowSound;
  @ViewChild("goodSound") goodSound;

  // Controls
  @ViewChild("upArrow") upArrow;
  @ViewChild("leftArrow") leftArrow;
  @ViewChild("rightArrow") rightArrow;
  @ViewChild("downArrow") downArrow;
  currentArrow;

  // Variables in View
  isPlaying$: Observable<boolean>;
  interval;

  // Constants
  private readonly TIME_DELAY_PRESS = 200;
  private readonly TIME_DELAY_COLOR = 400;
  private readonly TIME_UPDATE_COLOR = 1000;
  private readonly TIME_TO_START_GAME = 1000;

  constructor(private store: Store<fromStore.ApplicationState>) {}

  ngOnInit() {
    this.isPlaying$ = this.store.pipe(map(state => state.ui.isPlaying));

    this.store.subscribe(state => {
      if (state.ui.timeOutGame) {
        this.onStopGame();
      }
    });
  }

  public onStartGame(): void {
    this.startGame();
  }

  @HostListener("window:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {
    switch (event.keyCode) {
      case KEY_CODE.RIGHT_ARROW:
        this.pressButtonEffect(
          this.rightArrow,
          "pressed",
          this.TIME_DELAY_PRESS,
          true
        );
        break;

      case KEY_CODE.LEFT_ARROW:
        this.pressButtonEffect(
          this.leftArrow,
          "pressed",
          this.TIME_DELAY_PRESS,
          true
        );
        break;

      case KEY_CODE.UP_ARROW:
        this.pressButtonEffect(
          this.upArrow,
          "pressed",
          this.TIME_DELAY_PRESS,
          true
        );
        break;

      case KEY_CODE.DOWN_ARROW:
        this.pressButtonEffect(
          this.downArrow,
          "pressed",
          this.TIME_DELAY_PRESS,
          true
        );
        break;
    }
  }

  public onStopGame() {
    this.store.dispatch(new StopPlaying());
    this.sayGameOver();
    clearInterval(this.interval);
  }

  private startGame() {
    this.store.dispatch(new StartPlaying());
    this.store.dispatch(new ResetScore());
    this.startGameSound.nativeElement.play();
    setTimeout(() => this.generateRandomControl(), this.TIME_TO_START_GAME);
  }

  private generateRandomControl() {
    const controls = [
      this.upArrow,
      this.leftArrow,
      this.rightArrow,
      this.downArrow
    ];

    this.interval = setInterval(() => {
      this.playArrow();
      const indexRandom = Math.round(Math.random() * (controls.length - 1));
      this.currentArrow = controls[indexRandom];
      this.pressButtonEffect(
        this.currentArrow,
        "active",
        this.TIME_DELAY_COLOR
      );
    }, this.TIME_UPDATE_COLOR);
  }

  private pressButtonEffect(
    button: ElementRef,
    colorClassName: string,
    timeDelay: number,
    isPressedByUser = false
  ) {
    const dom = button.nativeElement.querySelector("button");
    dom.click();
    dom.classList.add(colorClassName);

    if (isPressedByUser) {
      this.verifyMatch(button);
    }

    setTimeout(() => {
      dom.classList.remove(colorClassName);
    }, timeDelay);
  }

  private verifyMatch(arrowPressed: ElementRef) {
    console.log('here', this.currentArrow);
    

    this.sayGood();
      if (this.currentArrow === arrowPressed) {
      this.store.dispatch(new AddScore(20));
      this.store.dispatch(
        new AddAttempt({
          control: this.currentArrow,
          result: "OK"
        })
      );
    } else {
      this.store.dispatch(
        new AddAttempt({
          control: this.currentArrow,
          result: "WRONG"
        })
      );
    }
  }

  private sayGameOver() {
    this.gameOverSound.nativeElement.currentTime = 0;
    this.gameOverSound.nativeElement.play();
  }

  private playArrow() {
    this.arrowSound.nativeElement.currentTime = 0;
    this.arrowSound.nativeElement.play();
  }
ñ
  private sayGood() {
    this.goodSound.nativeElement.currentTime = 0;
    this.goodSound.nativeElement.play();
  }
}

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  DOWN_ARROW = 40
}
