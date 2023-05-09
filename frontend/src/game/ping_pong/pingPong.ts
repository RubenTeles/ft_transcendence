import { Player } from "./player";
import { InputHandler } from "./input";
import { Ball } from "./ball";
import tableImage from "@/assets/images/pingpong/table_1.png";
import avatarDefault from "@/assets/images/pingpong/avatar_default.jpg";
import marvin from "@/assets/images/pingpong/marvin.png";

export class Game {
  width: number;
  height: number;
  offSet: number = 0;
  maxPoint = 3;
  inputKey: InputHandler;
  Player1: Player;
  Player2: Player;
  Ball: Ball;

  constructor(width: number, height: number, offSet: number, maxPoint: number = 3) {
    this.width = width;
    this.height = height;
    this.offSet = offSet;
    this.maxPoint = maxPoint;
    this.inputKey = new InputHandler();
    this.Player1 = new Player(this, 1, "Player 1", avatarDefault);
    this.Player2 = new Player(this, 2, "Player 2", marvin);
    this.Ball = new Ball(this);
  }

  isEndGame() {
    if (this.Player1.score === this.maxPoint || this.Player2.score === this.maxPoint) return true;
    return false;
  }

  update() {
    if (!this.isEndGame()) this.Ball.update(this.Player1, this.Player2);

    this.Player1.update(this.inputKey.keys);
    this.Player2.update(this.inputKey.keys);
  }

  draw(context: CanvasRenderingContext2D) {
    this.Player1.draw(context);
    this.Player2.draw(context);
    this.drawScore(context);
    this.Ball.draw(context);
  }

  drawScore(ctx: CanvasRenderingContext2D) {
    ctx.font = "50px 'Press Start 2P', cursive";
    ctx.fillStyle = "black";

    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.strokeText(this.Player1.score + " : " + this.Player2.score, this.width / 2 - 120, 90);

    ctx.fillStyle = "white";
    ctx.fillText(this.Player1.score + " : " + this.Player2.score, this.width / 2 - 120, 90);
  }
}
