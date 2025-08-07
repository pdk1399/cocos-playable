import { _decorator, CCBoolean, director, Node, tween, Tween, TweenEasing, v2, v3, Vec2, Vec3 } from 'cc';
import { EmitTween, TweenType, ValueType } from './EmitTween';
import { EaseType } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitTweenScale')
export class EmitTweenScale extends EmitTween {

    @property({ group: { name: 'Main' }, type: Vec2 })
    Value: Vec2 = v2();
    @property({ group: { name: 'Main', displayOrder: 10 }, type: CCBoolean, visible: function (this: EmitTween) { return this.Progress == TweenType.Once; } })
    ValueReset: boolean = false;

    m_valueA: Vec3;
    m_valueB: Vec3;

    protected onLoad(): void {
        super.onLoad();
        this.m_valueA = this.EmitNode.scale.clone();
        let valueB = v3(this.Value.x, this.Value.y, this.m_valueA.z);
        switch (this.To) {
            case ValueType.Directly:
                this.m_valueB = v3(valueB.x, valueB.y, this.m_valueA.z);
                break;
            case ValueType.Offset:
                this.m_valueB = v3(this.m_valueA.x + valueB.x, this.m_valueA.y + valueB.y, this.m_valueA.z);
                break;
        }
    }

    onTweenOnce(target: Node): void {
        Tween.stopAllByTarget(target);
        tween(target)
            .call(() => {
                if (this.ValueReset)
                    target.scale = this.m_valueA.clone();
                else
                    this.m_valueA = target.scale.clone();
            })
            .to(this.Duration, { scale: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
            .call(() => this.onTweenComplete())
            .call(() => {
                if (this.CompleteDestroy)
                    this.scheduleOnce(() => target.destroy(), this.Fixed ? 0.02 : 0);
            })
            .start();
    }

    onTweenPingPong(target: Node): void {
        Tween.stopAllByTarget(target);
        if (this.Limit > 0) {
            tween(target)
                .repeat(this.Limit, tween(target)
                    .to(this.Duration, { scale: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .to(this.Duration, { scale: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
                )
                .call(() => this.onTweenComplete())
                .call(() => {
                    if (this.CompleteDestroy)
                        this.scheduleOnce(() => target.destroy(), this.Fixed ? 0.02 : 0);
                })
                .start();
        }
        else {
            tween(target)
                .repeatForever(tween(target)
                    .to(this.Duration, { scale: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .to(this.Duration, { scale: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
                )
                .start();
        }
    }

    onTweenRestart(target: Node): void {
        Tween.stopAllByTarget(target);
        if (this.Limit > 0) {
            tween(target)
                .repeat(this.Limit, tween(target)
                    .call(() => target.scale = this.m_valueA.clone())
                    .to(this.Duration, { scale: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                )
                .call(() => this.onTweenComplete())
                .call(() => {
                    if (this.CompleteDestroy)
                        this.scheduleOnce(() => target.destroy(), this.Fixed ? 0.02 : 0);
                })
                .start();
        }
        else {
            tween(target)
                .repeatForever(tween(target)
                    .call(() => target.scale = this.m_valueA.clone())
                    .to(this.Duration, { scale: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                )
                .start();
        }
    }
}