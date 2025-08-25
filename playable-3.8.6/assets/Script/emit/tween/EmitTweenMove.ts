import { _decorator, CCBoolean, director, Node, tween, Tween, TweenEasing, v2, v3, Vec2, Vec3 } from 'cc';
import { EmitTween, TweenType, ValueType } from './EmitTween';
import { EaseType } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitTweenMove')
export class EmitTweenMove extends EmitTween {

    @property({ group: { name: 'Main', displayOrder: 8 }, type: Vec2 })
    Value: Vec2 = v2();
    @property({ group: { name: 'Main', displayOrder: 10 }, type: CCBoolean })
    ValueWorld: boolean = false;
    @property({ group: { name: 'Main', displayOrder: 10 }, type: CCBoolean, visible: function (this: EmitTween) { return this.Progress == TweenType.Once; } })
    ValueReset: boolean = true; //When TRUE, if target restart tween, it will start from it's original

    m_valueA: Vec3 = v3();
    m_valueB: Vec3 = v3();

    protected onLoad(): void {
        super.onLoad();
        this.m_valueA = this.ValueWorld ? this.EmitNode.worldPosition.clone() : this.EmitNode.position.clone();
        const valueB = v3(this.Value.x, this.Value.y, this.m_valueA.z);
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
        // Tween.stopAllByTarget(target);
        if (this.ValueWorld) {
            //World
            tween(target)
                .call(() => {
                    if (this.ValueReset)
                        target.worldPosition = this.m_valueA.clone();
                    else
                        this.m_valueA = this.ValueWorld ? target.worldPosition.clone() : target.position.clone();
                })
                .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                .call(() => this.onTweenComplete())
                .call(() => {
                    if (this.CompleteDestroy)
                        this.scheduleOnce(() => target.destroy(), this.Fixed ? 0.02 : 0);
                })
                .start();
        }
        else {
            //Local
            tween(target)
                .call(() => {
                    if (this.ValueReset)
                        target.position = this.m_valueA.clone();
                    else
                        this.m_valueA = this.ValueWorld ? target.worldPosition.clone() : target.position.clone();
                })
                .to(this.Duration, { position: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                .call(() => this.onTweenComplete())
                .call(() => {
                    if (this.CompleteDestroy)
                        this.scheduleOnce(() => target.destroy(), this.Fixed ? 0.02 : 0);
                })
                .start();
        }
    }

    onTweenPingPong(target: Node): void {
        // Tween.stopAllByTarget(target);
        if (this.ValueWorld) {
            //World
            if (this.Limit > 0) {
                tween(target)
                    .repeat(this.Limit, tween(target)
                        .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                        .to(this.Duration, { worldPosition: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
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
                        .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                        .to(this.Duration, { worldPosition: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
                    )
                    .start();
            }
        }
        else {
            //Local
            if (this.Limit > 0) {
                tween(target)
                    .repeat(this.Limit, tween(target)
                        .to(this.Duration, { position: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                        .to(this.Duration, { position: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
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
                        .to(this.Duration, { position: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                        .to(this.Duration, { position: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
                    )
                    .start();
            }
        }
    }

    onTweenRestart(target: Node): void {
        // Tween.stopAllByTarget(target);
        if (this.ValueWorld) {
            //World
            if (this.Limit > 0) {
                tween(target)
                    .repeat(this.Limit, tween(target)
                        .call(() => target.worldPosition = this.m_valueA.clone())
                        .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
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
                        .call(() => target.worldPosition = this.m_valueA.clone())
                        .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    )
                    .start();
            }
        }
        else {
            //Local
            if (this.Limit > 0) {
                tween(target)
                    .repeat(this.Limit, tween(target)
                        .call(() => target.position = this.m_valueA.clone())
                        .to(this.Duration, { position: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
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
                        .call(() => target.position = this.m_valueA.clone())
                        .to(this.Duration, { position: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    )
                    .start();
            }
        }
    }

    onEventReset(): void {
        Tween.stopAllByTarget(this.EmitNode);
        if (this.ValueWorld)
            this.EmitNode.worldPosition = this.m_valueA.clone();
        else
            this.EmitNode.position = this.m_valueA.clone();
    }
}