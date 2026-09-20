import * as Phaser from 'phaser';

export interface InputState {
  dx: number;
  dy: number;
  attackPressed: boolean;
  skillPressed: boolean;
  interactPressed: boolean;
  inventoryPressed: boolean;
  pausePressed: boolean;
  dialogueAdvancePressed: boolean;
}

export class InputSystem {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW: Phaser.Input.Keyboard.Key;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keyJ: Phaser.Input.Keyboard.Key;
  private keyK: Phaser.Input.Keyboard.Key;
  private keyE: Phaser.Input.Keyboard.Key;
  private keyI: Phaser.Input.Keyboard.Key;
  private keyEsc: Phaser.Input.Keyboard.Key;
  private keySpace: Phaser.Input.Keyboard.Key;

  // Debug keys
  public keyF1: Phaser.Input.Keyboard.Key;
  public keyF2: Phaser.Input.Keyboard.Key;
  public keyF3: Phaser.Input.Keyboard.Key;
  public keyF4: Phaser.Input.Keyboard.Key;
  public keyF5: Phaser.Input.Keyboard.Key;
  public keyF6: Phaser.Input.Keyboard.Key;

  // Virtual mobile input overrides
  private touchDx: number = 0;
  private touchDy: number = 0;
  private touchAttack: boolean = false;
  private touchSkill: boolean = false;
  private touchInteract: boolean = false;
  private touchInventory: boolean = false;
  private touchPause: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const kb = scene.input.keyboard!;

    this.cursors = kb.createCursorKeys();
    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyJ = kb.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyK = kb.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.keyE = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyI = kb.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyEsc = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.keyF1 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.F1);
    this.keyF2 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.F2);
    this.keyF3 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.F3);
    this.keyF4 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.F4);
    this.keyF5 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.F5);
    this.keyF6 = kb.addKey(Phaser.Input.Keyboard.KeyCodes.F6);
  }

  public setTouchJoystick(dx: number, dy: number): void {
    this.touchDx = dx;
    this.touchDy = dy;
  }

  public triggerTouchAttack(): void {
    this.touchAttack = true;
  }

  public triggerTouchSkill(): void {
    this.touchSkill = true;
  }

  public triggerTouchInteract(): void {
    this.touchInteract = true;
  }

  public triggerTouchInventory(): void {
    this.touchInventory = true;
  }

  public triggerTouchPause(): void {
    this.touchPause = true;
  }

  public getState(): InputState {
    let dx = 0;
    let dy = 0;

    // Desktop Keyboard
    if (this.cursors.left.isDown || this.keyA.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.keyD.isDown) dx += 1;
    if (this.cursors.up.isDown || this.keyW.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.keyS.isDown) dy += 1;

    // Blend touch joystick if active
    if (Math.abs(this.touchDx) > 0.1 || Math.abs(this.touchDy) > 0.1) {
      dx = this.touchDx;
      dy = this.touchDy;
    }

    const attackPressed = Phaser.Input.Keyboard.JustDown(this.keyJ) || this.touchAttack;
    const skillPressed = Phaser.Input.Keyboard.JustDown(this.keyK) || this.touchSkill;
    const interactPressed = Phaser.Input.Keyboard.JustDown(this.keyE) || this.touchInteract;
    const inventoryPressed = Phaser.Input.Keyboard.JustDown(this.keyI) || this.touchInventory;
    const pausePressed = Phaser.Input.Keyboard.JustDown(this.keyEsc) || this.touchPause;
    const dialogueAdvancePressed = Phaser.Input.Keyboard.JustDown(this.keySpace) || interactPressed;

    // Reset single-frame touch triggers
    this.touchAttack = false;
    this.touchSkill = false;
    this.touchInteract = false;
    this.touchInventory = false;
    this.touchPause = false;

    return {
      dx,
      dy,
      attackPressed,
      skillPressed,
      interactPressed,
      inventoryPressed,
      pausePressed,
      dialogueAdvancePressed,
    };
  }
}
