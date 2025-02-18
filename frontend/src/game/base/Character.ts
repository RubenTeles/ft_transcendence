import imgUrl from "@/assets/images/lobby/avatares.jpg";
import type { GameObject, GameObjectType } from "./GameObject";
import { AnimationController } from "../animation/AnimationController";
import { PathFinding, type PathNode } from "../path_finding/PathFinding";
import { Game } from "./Game";
import { Profile } from "../Menu/Profile";
import { userStore } from "@/stores/userStore";

export interface CharacterOnline {
  className: string;
  name: string;
  objectId: number;
  nickname: string;
  avatar: number;
  x: number;
  y: number;
  animation: { name: string; isStop: boolean; sx: number; sy: number };
}

export class Character implements GameObject {
  imagem: any = new Image();
  type: GameObjectType = "character";
  name: string = "player";
  objectId: number = 0;
  nickname: string = "player";
  avatar: number = 0;
  x: number = 64;
  y: number = 64;
  w: number = 32;
  h: number = 80;
  speed: number = 0.2;
  frameX: number = 0;
  frameY: number = 0;
  gameFrame: number = 0;
  staggerFrame: number = 660000;
  animation: AnimationController = new AnimationController(this.imagem, 48, 80, 8);
  agent: PathFinding = new PathFinding(this);
  isSelect: boolean = false;

  constructor(data?: CharacterOnline) {
    if (data) {
      this.nickname = data.nickname;
      this.avatar = data.avatar;
      this.name = data.name;
      this.objectId = data.objectId;
      this.animation.sx = (this.avatar - 4 >= 0 ? this.avatar - 4 : this.avatar) * 3;
      this.animation.sy = this.avatar - 4 >= 0 ? 4 : 0;
    }
    this.imagem.src = imgUrl;
    this.animation.init(this.imagem, 48, 80, 8);
    this.animation.isRepeat = false;
    this.animation.createAnimation("idle", {
      frames: [{ x: 0, y: 0 }],
    });
    this.animation.createAnimation("walk_top", {
      frames: [
        { x: 0, y: 3 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
      ],
    });
    this.animation.createAnimation("walk_left", {
      frames: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
    });
    this.animation.createAnimation("walk_right", {
      frames: [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
    });
    this.animation.createAnimation("walk_bottom", {
      frames: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    });
    this.animation.setAnimation("walk_bottom");
    this.animation.setStop(true);
    if (data) this.setData(data);
  }

  public setData(data: CharacterOnline) {
    if (data) {
      this.name = data.name;
      this.objectId = data.objectId;
      this.x = data.x;
      this.y = data.y;
      this.avatar = data.avatar;
      this.nickname = data.nickname;
      this.animation.sx = (this.avatar - 4 >= 0 ? this.avatar - 4 : this.avatar) * 144;
      this.animation.sy = (this.avatar - 4 >= 0 ? 1 : 0) * 320;
      /*
      this.animation.sx = data.animation.sx ? data.animation.sx : this.animation.sx;
      this.animation.sy = data.animation.sy ? data.animation.sy : this.animation.sy;*/
      this.animation?.setAnimation(data.animation.name);
      this.animation?.setStop(data.animation.isStop);
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    if (this.isSelect) {
      context.beginPath();
      context.arc(this.x + this.w / 2, this.y + this.h / 2 - 5, 10, 0, 2 * Math.PI);
      context.fillStyle = "red";
      context.fill();
      context.closePath();
    }
    this.animation?.draw(context, this.x, this.y - this.h / 2, this.w, this.h);
    context.fillStyle = userStore().user.id != this.objectId ? "rgba(255, 255, 255, 0.65)" : "rgba(255, 255, 255, 0.8)"; //White
    context.strokeStyle = userStore().user.id != this.objectId ? "rgba(0, 0, 0, 0.65)" : "rgba(0,0,0, 0.8)"; //Black
    context.lineWidth = 5;
    this.fillTextCenter(context, this.nickname, this.x - this.w / 2, this.y - this.h * 0.3, this.w * 2, 10, undefined, "'Press Start 2P', cursive", true);
  }

  public move(x: number, y: number, animation: string) {
    this.x = x;
    this.y = y;
    this.animation?.setAnimation(animation);
  }

  update(deltaTime: number): void {
    this.agent.update(deltaTime);
  }

  onSelected(): void {
    this.isSelect = true;
  }

  onDeselected(): void {
    this.isSelect = false;
  }

  interaction?(gameObject: GameObject): void {
    if (this.isSelect && this.objectId != userStore().user.id) userStore().userSelected = this.objectId;
  }

  public setLookAt(gameObject: GameObject) {
    const isStop = this.animation.isStop;
    if (this.x > gameObject.x) {
      this.animation.setAnimation("walk_left");
    } else if (this.x < gameObject.x) {
      this.animation.setAnimation("walk_right");
    }
    if (this.y > gameObject.y) {
      this.animation.setAnimation("walk_top");
    }
    if (this.y < gameObject.y) {
      this.animation.setAnimation("walk_bottom");
    }
    this.animation.setStop(isStop);
  }

  private fillTextCenter(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, w: number, h: number, max_with?: number, font?: string, stroke?: boolean) {
    ctx.font = font ? h + "px " + font : h + "px Arial";
    ctx.textAlign = "start";

    const begin = x + w * 0.1;
    const max = max_with ? max_with : w - w * 0.2;

    let offset = 0;
    let offsetmax = 0;
    const labelWidth = ctx.measureText(label).width;
    while (begin + offset + labelWidth < begin + max - offset) {
      offsetmax += w * 0.05;
      if (begin + offsetmax + labelWidth > begin + max - offset) break;
      offset = offsetmax;
    }

    if (stroke) ctx.strokeText(label, x + w * 0.1 + offset, y, w - w * 0.2 - offset);
    ctx.fillText(label, x + w * 0.1 + offset, y, w - w * 0.2 - offset);
  }
}
