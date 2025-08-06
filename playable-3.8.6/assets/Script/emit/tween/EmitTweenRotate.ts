import { _decorator, CCFloat, director, Node, Tween, tween, TweenEasing, v3, Vec3 } from 'cc';
import { EmitTween, ValueType } from './EmitTween';
import { EaseType } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitTweenRotate')
export class EmitTweenRotate extends EmitTween {

    @property({ group: { name: 'Main', displayOrder: 8 }, type: CCFloat })
    Value: number = 0;

    m_valueA: Vec3;
    m_valueB: Vec3;

    protected onLoad(): void {
        super.onLoad();
        this.m_valueA = v3(0, 0, this.EmitNode.eulerAngles.clone().z);
        let valueB = v3(0, 0, this.Value);
        switch (this.To) {
            case ValueType.Directly:
                this.m_valueB = v3(0, 0, valueB.z);
                break;
            case ValueType.Offset:
                this.m_valueB = v3(0, 0, this.m_valueA.z + valueB.z);
                break;
        }
    }

    onTweenOnce(target: Node): void {
        Tween.stopAllByTarget(target);
        tween(target)
            .call(() => target.eulerAngles = this.m_valueA.clone())
            .to(this.Duration, { eulerAngles: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
            .call(() => {
                this.EmitEvent.forEach(event => director.emit(event));
            })
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
                    .to(this.Duration, { eulerAngles: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .to(this.Duration, { eulerAngles: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
                )
                .call(() => {
                    if (this.CompleteDestroy)
                        this.scheduleOnce(() => target.destroy(), this.Fixed ? 0.02 : 0);
                })
                .start();
        }
        else {
            tween(target)
                .repeatForever(tween(target)
                    .to(this.Duration, { eulerAngles: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .to(this.Duration, { eulerAngles: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
                )
                .start();
        }
    }

    onTweenRestart(target: Node): void {
        Tween.stopAllByTarget(target);
        if (this.Limit > 0) {
            tween(target)
                .repeat(this.Limit, tween(target)
                    .call(() => target.eulerAngles = this.m_valueA.clone())
                    .to(this.Duration, { eulerAngles: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                )
                .call(() => {
                    if (this.CompleteDestroy)
                        this.scheduleOnce(() => target.destroy(), this.Fixed ? 0.02 : 0);
                })
                .start();
        }
        else {
            tween(target)
                .repeatForever(tween(target)
                    .call(() => target.eulerAngles = this.m_valueA.clone())
                    .to(this.Duration, { eulerAngles: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                )
                .start();
        }
    }
}