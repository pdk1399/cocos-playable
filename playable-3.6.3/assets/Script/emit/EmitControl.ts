import { _decorator, CCBoolean, director, Enum, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { EmitBaseFull } from './EmitBaseFull';
const { ccclass, property } = _decorator;

export enum ControlType {
    None = 0,
    Director = 1,
    Node = 2,
}
Enum(ControlType);

export enum BodyType {
    Sleep,
    Awake,
}
Enum(BodyType);

export enum ReleaseType {
    None = 0,
    X = 1,
    Y = 2,
    XY = 3,
}
Enum(ReleaseType);

export enum FaceXType {
    None,
    Right,
    Left,
}
Enum(FaceXType);

export enum FaceYType {
    None,
    Up,
    Down,
}
Enum(FaceYType);

@ccclass('EmitControl')
export class EmitControl extends EmitBaseFull {

    @property({ group: { name: 'Main' }, type: ControlType })
    Control: ControlType = ControlType.Node;
    @property({ group: { name: 'Main' }, type: BodyType, visible(this: EmitControl) { return this.Control >= ControlType.Node; } })
    ControlBody: BodyType = BodyType.Awake;
    @property({ group: { name: 'Main' }, type: ReleaseType, visible(this: EmitControl) { return this.Control >= ControlType.Node && this.ControlBody >= BodyType.Awake; } })
    ControlRelease: ReleaseType = ReleaseType.None;

    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control >= ControlType.Node && this.ControlBody >= BodyType.Awake && this.ControlRelease != ReleaseType.XY && this.ControlRelease != ReleaseType.X; } })
    ControlLeft: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control >= ControlType.Node && this.ControlBody >= BodyType.Awake && this.ControlRelease != ReleaseType.XY && this.ControlRelease != ReleaseType.X; } })
    ControlRight: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control >= ControlType.Node && this.ControlBody >= BodyType.Awake && this.ControlRelease != ReleaseType.XY && this.ControlRelease != ReleaseType.Y; } })
    ControlUp: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control >= ControlType.Node && this.ControlBody >= BodyType.Awake && this.ControlRelease != ReleaseType.XY && this.ControlRelease != ReleaseType.Y; } })
    ControlDown: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control >= ControlType.Node && this.ControlBody >= BodyType.Awake && this.ControlRelease != ReleaseType.XY && this.ControlRelease != ReleaseType.Y; } })
    ControlJump: boolean = false;

    @property({ group: { name: 'Option' }, type: FaceXType })
    ControlFaceX: FaceXType = FaceXType.None;
    @property({ group: { name: 'Option' }, type: FaceYType })
    ControlFaceY: FaceYType = FaceYType.None;

    @property({ group: { name: 'Option' }, type: CCBoolean })
    BodyX2: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean })
    BodyX4: boolean = false;

    @property({ group: { name: 'Option' }, type: CCBoolean })
    ControlAttack: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean })
    ControlInteraction: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean })
    ControlFixed: boolean = false;

    onEventActiveNode(target: Node): void {
        this.onEventActiveOption(target);
        this.onEventActiiveMain(target);
    }

    private onEventActiveOption(target: Node): void {
        switch (this.ControlFaceX) {
            case FaceXType.None:
                break;
            case FaceXType.Right:
                target.emit(ConstantBase.NODE_CONTROL_FACE_X_RIGHT);
                break;
            case FaceXType.Left:
                target.emit(ConstantBase.NODE_CONTROL_FACE_X_LEFT);
                break;
        }
        switch (this.ControlFaceY) {
            case FaceYType.None:
                break;
            case FaceYType.Up:
                target.emit(ConstantBase.NODE_CONTROL_FACE_Y_UP);
                break;
            case FaceYType.Down:
                target.emit(ConstantBase.NODE_CONTROL_FACE_Y_DOWN);
                break;
        }

        if (this.BodyX2)
            target.emit(ConstantBase.NODE_BODY_X2);
        if (this.BodyX4)
            target.emit(ConstantBase.NODE_BODY_X4);
        if (this.ControlAttack)
            target.emit(ConstantBase.CONTROL_ATTACK);
        if (this.ControlInteraction)
            target.emit(ConstantBase.CONTROL_INTERACTION);
        if (this.ControlFixed)
            target.emit(ConstantBase.CONTROL_FIXED);
    }

    private onEventActiiveMain(target: Node): void {
        switch (this.Control) {
            case ControlType.None:
                return;
            case ControlType.Director:
                director.emit(ConstantBase.CONTROL_RESUME);
                target.emit(ConstantBase.NODE_CONTROL_NODE, false);
                target.emit(ConstantBase.NODE_CONTROL_DIRECTOR, true);
                return;
            case ControlType.Node:
                director.emit(ConstantBase.CONTROL_LOCK);
                target.emit(ConstantBase.NODE_CONTROL_NODE, true);
                target.emit(ConstantBase.NODE_CONTROL_DIRECTOR, false);
                break;
        }
        switch (this.ControlBody) {
            case BodyType.Awake:
                target.emit(ConstantBase.NODE_CONTROL_AWAKE);
                break;
            case BodyType.Sleep:
                target.emit(ConstantBase.NODE_CONTROL_SLEEP);
                return;
        }
        switch (this.ControlRelease) {
            case ReleaseType.None:
                break;
            case ReleaseType.X:
                target.emit(ConstantBase.CONTROL_RELEASE_X);
                break;
            case ReleaseType.Y:
                target.emit(ConstantBase.CONTROL_RELEASE_Y);
                break;
            case ReleaseType.XY:
                target.emit(ConstantBase.CONTROL_RELEASE);
                return;
        }

        if (this.ControlRelease != ReleaseType.X) {
            if (this.ControlLeft)
                target.emit(ConstantBase.CONTROL_LEFT);
            if (this.ControlRight)
                target.emit(ConstantBase.CONTROL_RIGHT);
        }

        if (this.ControlRelease != ReleaseType.Y) {
            if (this.ControlUp)
                target.emit(ConstantBase.CONTROL_UP);
            if (this.ControlDown)
                target.emit(ConstantBase.CONTROL_DOWN);
            if (this.ControlJump)
                target.emit(ConstantBase.CONTROL_JUMP);
        }
    }
}