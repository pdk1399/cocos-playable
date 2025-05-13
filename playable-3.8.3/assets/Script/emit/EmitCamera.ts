import { _decorator, CCBoolean, CCFloat, director, Node, TweenEasing, v2, Vec2 } from 'cc';
import { EmitBase } from './EmitBase';
import { ConstantBase, EaseType } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitCamera')
export class EmitCamera extends EmitBase {

    @property({ group: { name: 'View' }, type: CCBoolean })
    View: boolean = false;
    @property({ group: { name: 'View' }, type: CCFloat, visible(this: EmitCamera) { return this.View; } })
    SmoothTime: number = 0.1;
    @property({ group: { name: 'View' }, type: Vec2, visible(this: EmitCamera) { return this.View; } })
    Offset: Vec2 = v2(0, 0);

    @property({ group: { name: 'Scale' }, type: CCBoolean })
    Scale: boolean = false;
    @property({ group: { name: 'Scale' }, type: CCFloat, visible(this: EmitCamera) { return this.Scale; } })
    ScaleValue: number = 1;
    @property({ group: { name: 'Scale' }, type: CCFloat, visible(this: EmitCamera) { return this.Scale; } })
    ScaleDuration: number = 0.5;
    @property({ group: { name: 'Scale' }, type: EaseType, visible(this: EmitCamera) { return this.Scale; } })
    ScaleEasing: EaseType = EaseType.linear;

    @property({ group: { name: 'Target' }, type: CCBoolean })
    Target: boolean = false;
    @property({ group: { name: 'Target' }, type: Node, visible(this: EmitCamera) { return this.Target; } })
    TargetNode: Node = null;
    @property({ group: { name: 'Target' }, type: CCBoolean, visible(this: EmitCamera) { return this.Target; } })
    TargetTween: boolean = false;
    @property({ group: { name: 'Target' }, type: CCFloat, visible(this: EmitCamera) { return this.Target && this.TargetTween; } })
    TargetTweenDuration: number = 0.5;
    @property({ group: { name: 'Target' }, type: EaseType, visible(this: EmitCamera) { return this.Target && this.TargetTween; } })
    TargetTweenEasing: EaseType = EaseType.linear;

    @property({ group: { name: 'Effect' }, type: CCBoolean })
    Effect: boolean = false;
    @property({ group: { name: 'Effect' }, type: CCBoolean, visible(this: EmitCamera) { return this.Effect; } })
    EffectShake: boolean = false;

    onEventActive(): void {
        if (this.View) {
            director.emit(ConstantBase.CAMERA_VALUE_SMOOTH_TIME, this.SmoothTime);
            director.emit(ConstantBase.CAMERA_VALUE_OFFSET, this.Offset);
        }

        if (this.Scale)
            director.emit(ConstantBase.CAMERA_VALUE_SCALE, this.ScaleValue, this.ScaleDuration, this.ScaleEasing);

        if (this.Target) {
            if (this.TargetTween)
                director.emit(ConstantBase.CAMERA_TARGET_SWITCH, this.TargetNode, this.TargetTweenDuration, EaseType[this.TargetTweenEasing] as TweenEasing);
            else
                director.emit(ConstantBase.CAMERA_TARGET_SWITCH, this.TargetNode);
        }

        if (this.Effect) {
            director.emit(ConstantBase.CAMERA_EFFECT_SHAKE, this.EffectShake);
        }
    }
}