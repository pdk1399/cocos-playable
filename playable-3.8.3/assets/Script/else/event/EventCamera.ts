import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node, TweenEasing, v2, Vec2 } from 'cc';
import { EaseType, ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EventCamera')
export class EventCamera extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventCamera) { return !this.Start; } })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventCamera) { return !this.Start && !this.OnNode; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'View' }, type: CCBoolean })
    ValueChange: boolean = false;
    @property({ group: { name: 'View' }, type: CCFloat, visible(this: EventCamera) { return this.ValueChange; } })
    SmoothTime: number = 0.1;
    @property({ group: { name: 'View' }, type: Vec2, visible(this: EventCamera) { return this.ValueChange; } })
    Offset: Vec2 = v2(0, 0);

    @property({ group: { name: 'Scale' }, type: CCBoolean })
    ScaleChange: boolean = false;
    @property({ group: { name: 'Scale' }, type: CCFloat, visible(this: EventCamera) { return this.ScaleChange; } })
    Scale: number = 1;
    @property({ group: { name: 'Scale' }, type: CCFloat, visible(this: EventCamera) { return this.ScaleChange; } })
    ScaleDuration: number = 0.5;
    @property({ group: { name: 'Scale' }, type: EaseType, visible(this: EventCamera) { return this.ScaleChange; } })
    ScaleEasing: EaseType = EaseType.linear;

    @property({ group: { name: 'Target' }, type: CCBoolean })
    TargetChange: boolean = false;
    @property({ group: { name: 'Target' }, type: Node, visible(this: EventCamera) { return this.TargetChange; } })
    Target: Node = null;
    @property({ group: { name: 'Target' }, type: CCBoolean, visible(this: EventCamera) { return this.TargetChange; } })
    TargetTween: boolean = false;
    @property({ group: { name: 'Target' }, type: CCFloat, visible(this: EventCamera) { return this.TargetChange && this.TargetTween; } })
    TargetTweenDuration: number = 0.5;
    @property({ group: { name: 'Target' }, type: EaseType, visible(this: EventCamera) { return this.TargetChange && this.TargetTween; } })
    TargetTweenEasing: EaseType = EaseType.linear;

    @property({ group: { name: 'Effect' }, type: CCBoolean })
    Effect: boolean = false;
    @property({ group: { name: 'Effect' }, type: CCBoolean, visible(this: EventCamera) { return this.Effect; } })
    EffectShake: boolean = false;

    protected onLoad(): void {
        if (this.OnNode) {
            this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
            return;
        }
        director.on(this.OnEvent, this.onEvent, this);
    }

    protected start(): void {
        if (this.Start)
            this.onEvent();
    }

    onEvent() {
        if (this.ValueChange) {
            director.emit(ConstantBase.CAMERA_SMOOTH_TIME, this.SmoothTime);
            director.emit(ConstantBase.CAMERA_OFFSET, this.Offset);
        }

        if (this.ScaleChange)
            director.emit(ConstantBase.CAMERA_SCALE, this.Scale, this.ScaleDuration, this.ScaleEasing);

        if (this.TargetChange) {
            if (this.TargetTween)
                director.emit(ConstantBase.CAMERA_SWITCH, this.Target, this.TargetTweenDuration, EaseType[this.TargetTweenEasing] as TweenEasing);
            else
                director.emit(ConstantBase.CAMERA_SWITCH, this.Target);
        }

        if (this.Effect) {
            director.emit(ConstantBase.CAMERA_EFFECT_SHAKE, this.EffectShake);
        }

        if (this.EmitEvent != '')
            director.emit(this.EmitEvent);

        if (this.Once) {
            if (this.OnNode)
                this.node.off(ConstantBase.NODE_EVENT, this.onEvent, this);
            else
                director.off(this.OnEvent, this.onEvent, this);
        }
    }
}