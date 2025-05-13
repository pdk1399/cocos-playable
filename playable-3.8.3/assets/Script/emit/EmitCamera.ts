import { _decorator, CCBoolean, CCFloat, Component, director, Node, TweenEasing, v2, Vec2 } from 'cc';
import { EmitBase } from './EmitBase';
import { ConstantBase, EaseType } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitCamera')
export class EmitCamera extends EmitBase {

    @property({ group: { name: 'View' }, type: CCBoolean })
    ValueChange: boolean = false;
    @property({ group: { name: 'View' }, type: CCFloat, visible(this: EmitCamera) { return this.ValueChange; } })
    SmoothTime: number = 0.1;
    @property({ group: { name: 'View' }, type: Vec2, visible(this: EmitCamera) { return this.ValueChange; } })
    Offset: Vec2 = v2(0, 0);

    @property({ group: { name: 'Scale' }, type: CCBoolean })
    ScaleChange: boolean = false;
    @property({ group: { name: 'Scale' }, type: CCFloat, visible(this: EmitCamera) { return this.ScaleChange; } })
    Scale: number = 1;
    @property({ group: { name: 'Scale' }, type: CCFloat, visible(this: EmitCamera) { return this.ScaleChange; } })
    ScaleDuration: number = 0.5;
    @property({ group: { name: 'Scale' }, type: EaseType, visible(this: EmitCamera) { return this.ScaleChange; } })
    ScaleEasing: EaseType = EaseType.linear;

    @property({ group: { name: 'Target' }, type: CCBoolean })
    TargetChange: boolean = false;
    @property({ group: { name: 'Target' }, type: Node, visible(this: EmitCamera) { return this.TargetChange; } })
    Target: Node = null;
    @property({ group: { name: 'Target' }, type: CCBoolean, visible(this: EmitCamera) { return this.TargetChange; } })
    TargetTween: boolean = false;
    @property({ group: { name: 'Target' }, type: CCFloat, visible(this: EmitCamera) { return this.TargetChange && this.TargetTween; } })
    TargetTweenDuration: number = 0.5;
    @property({ group: { name: 'Target' }, type: EaseType, visible(this: EmitCamera) { return this.TargetChange && this.TargetTween; } })
    TargetTweenEasing: EaseType = EaseType.linear;

    @property({ group: { name: 'Effect' }, type: CCBoolean })
    Effect: boolean = false;
    @property({ group: { name: 'Effect' }, type: CCBoolean, visible(this: EmitCamera) { return this.Effect; } })
    EffectShake: boolean = false;

    protected onLoad(): void {
        super.onLoad();
    }

    onEventActive(): void {
        if (this.ValueChange) {
            director.emit(ConstantBase.CAMERA_VALUE_SMOOTH_TIME, this.SmoothTime);
            director.emit(ConstantBase.CAMERA_VALUE_OFFSET, this.Offset);
        }

        if (this.ScaleChange)
            director.emit(ConstantBase.CAMERA_VALUE_SCALE, this.Scale, this.ScaleDuration, this.ScaleEasing);

        if (this.TargetChange) {
            if (this.TargetTween)
                director.emit(ConstantBase.CAMERA_TARGET_SWITCH, this.Target, this.TargetTweenDuration, EaseType[this.TargetTweenEasing] as TweenEasing);
            else
                director.emit(ConstantBase.CAMERA_TARGET_SWITCH, this.Target);
        }

        if (this.Effect) {
            director.emit(ConstantBase.CAMERA_EFFECT_SHAKE, this.EffectShake);
        }
    }
}