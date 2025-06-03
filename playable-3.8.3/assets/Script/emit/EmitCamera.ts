import { _decorator, CCBoolean, CCFloat, director, Node, TweenEasing, v2, Vec2 } from 'cc';
import { EmitBaseEvent } from './EmitBaseEvent';
import { ConstantBase, EaseType } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitCamera')
export class EmitCamera extends EmitBaseEvent {

    @property({ group: { name: 'View' }, type: CCBoolean })
    View: boolean = false;
    @property({ group: { name: 'View' }, type: CCFloat, visible(this: EmitCamera) { return this.View; } })
    SmoothTime: number = 0.1;

    @property({ group: { name: 'Scale' }, type: CCBoolean })
    Scale: boolean = false;
    @property({ group: { name: 'Scale' }, type: CCFloat, visible(this: EmitCamera) { return this.Scale; } })
    ScaleValue: number = 1;
    @property({ group: { name: 'Switch' }, type: CCBoolean, visible(this: EmitCamera) { return this.Scale; } })
    ScaleTween: boolean = false;
    @property({ group: { name: 'Scale' }, type: CCFloat, visible(this: EmitCamera) { return this.Scale && this.ScaleTween; } })
    ScaleDuration: number = 0.5;
    @property({ group: { name: 'Scale' }, type: EaseType, visible(this: EmitCamera) { return this.Scale && this.ScaleTween; } })
    ScaleEasing: EaseType = EaseType.linear;

    @property({ group: { name: 'Offset' }, type: CCBoolean })
    Offset: boolean = false;
    @property({ group: { name: 'Offset' }, type: Vec2, visible(this: EmitCamera) { return this.Offset; } })
    OffsetValue: Vec2 = v2(0, 0);
    @property({ group: { name: 'Offset' }, type: CCBoolean, visible(this: EmitCamera) { return this.Offset; } })
    OffsetTween: boolean = false;
    @property({ group: { name: 'Offset' }, type: CCFloat, visible(this: EmitCamera) { return this.Offset && this.OffsetTween; } })
    OffsetDuration: number = 0.5;
    @property({ group: { name: 'Offset' }, type: EaseType, visible(this: EmitCamera) { return this.Offset && this.OffsetTween; } })
    OffsetEasing: EaseType = EaseType.linear;

    @property({ group: { name: 'Switch' }, type: CCBoolean })
    Switch: boolean = false;
    @property({ group: { name: 'Switch' }, type: Node, visible(this: EmitCamera) { return this.Switch; } })
    SwitchNode: Node = null;
    @property({ group: { name: 'Switch' }, type: CCBoolean, visible(this: EmitCamera) { return this.Switch; } })
    SwitchTween: boolean = false;
    @property({ group: { name: 'Switch' }, type: CCFloat, visible(this: EmitCamera) { return this.Switch && this.SwitchTween; } })
    SwitchTweenDuration: number = 0.5;
    @property({ group: { name: 'Switch' }, type: EaseType, visible(this: EmitCamera) { return this.Switch && this.SwitchTween; } })
    SwitchTweenEasing: EaseType = EaseType.linear;

    @property({ group: { name: 'Effect' }, type: CCBoolean })
    EffectShake: boolean = false;
    @property({ group: { name: 'Effect' }, type: CCFloat, visible(this: EmitCamera) { return this.EffectShake; } })
    EffectShakeOnce: boolean = false;

    onEventActive(): void {
        if (this.View) {
            director.emit(ConstantBase.CAMERA_SMOOTH_TIME, this.SmoothTime);
        }

        if (this.Scale) {
            if (this.ScaleTween)
                director.emit(ConstantBase.CAMERA_SCALE, this.ScaleValue, this.ScaleDuration, this.ScaleEasing);
            else
                director.emit(ConstantBase.CAMERA_SCALE, this.ScaleValue);
        }

        if (this.Offset) {
            if (this.OffsetTween)
                director.emit(ConstantBase.CAMERA_OFFSET, this.OffsetValue, this.OffsetDuration, this.OffsetEasing);
            else
                director.emit(ConstantBase.CAMERA_OFFSET, this.OffsetValue);
        }

        if (this.Switch) {
            if (this.SwitchTween)
                director.emit(ConstantBase.CAMERA_SWITCH, this.SwitchNode, this.SwitchTweenDuration, EaseType[this.SwitchTweenEasing] as TweenEasing);
            else
                director.emit(ConstantBase.CAMERA_SWITCH, this.SwitchNode);
        }

        if (this.EffectShake) {
            if (this.EffectShakeOnce)
                director.emit(ConstantBase.CAMERA_EFFECT_SHAKE_ONCE);
            else
                director.emit(ConstantBase.CAMERA_EFFECT_SHAKE);
        }
    }
}