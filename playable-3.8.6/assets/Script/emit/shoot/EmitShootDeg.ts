import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node, Tween, tween, v2, Vec2, VERSION } from 'cc';
import { EmitBaseEvent } from '../base/EmitBaseEvent';
import { ShootBase } from '../../shoot/ShootBase';
import { SpineBase } from '../../renderer/SpineBase';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

class DegTweener {
    Deg: number = 0;
    Base: EmitShootDeg = null;
}

@ccclass('EmitShootDeg')
@requireComponent(ShootBase)
export class EmitShootDeg extends EmitBaseEvent {

    @property({ group: { name: 'Main' }, type: Node })
    Bullet: Node = null;
    @property({ group: { name: 'Main' }, type: CCFloat })
    BulletSpeed: number = 5;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    BulletRotateActive: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat, visible(this: EmitShootDeg) { return this.BulletRotateActive; } })
    BulletRotate: number = 180;

    @property({ group: { name: 'Rotate' }, type: CCBoolean })
    TweenRotate: boolean = false;
    @property({ group: { name: 'Rotate' }, type: CCFloat, visible(this: EmitShootDeg) { return this.TweenRotate; } })
    TweenDuration: number = 1;
    @property({ group: { name: 'Rotate' }, type: CCFloat, visible(this: EmitShootDeg) { return this.TweenRotate; } })
    TweenDegFrom: number = 0;
    @property({ group: { name: 'Rotate' }, type: CCFloat, visible(this: EmitShootDeg) { return this.TweenRotate; } })
    TweenDegTo: number = 180;
    @property({ group: { name: 'Rotate' }, type: CCFloat, visible(this: EmitShootDeg) { return this.TweenRotate; } })
    TweenDegOffset: number = 0;

    @property({ group: { name: 'Shoot' }, type: CCBoolean })
    ShootAnim: boolean = false;
    @property({ group: { name: 'Shoot' }, type: CCString, visible(this: EmitShootDeg) { return this.ShootAnim; } })
    AnimShoot: string = 'shoot';
    @property({ group: { name: 'Shoot' }, type: CCFloat, visible(this: EmitShootDeg) { return this.ShootAnim; } })
    ShootDelay: number = 0;
    @property({ group: { name: 'Shoot' }, type: CCString, visible(this: EmitShootDeg) { return this.ShootAnim; } })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Shoot' }, type: CCBoolean, visible(this: EmitShootDeg) { return this.ShootAnim; } })
    AnimIdleLoop: boolean = true;

    m_degShoot: number = 0;
    m_degSpine: number = 0;
    m_degTweener: DegTweener = null;

    m_spine: SpineBase = null;
    m_shoot: ShootBase = null;

    protected onLoad(): void {
        super.onLoad();
        this.m_spine = this.getComponent(SpineBase);
        this.m_shoot = this.getComponent(ShootBase);
    }

    protected start(): void {
        this.m_degShoot = this.TweenDegFrom;
        this.m_degSpine = this.TweenDegFrom + this.TweenDegOffset;

        if (VERSION >= '3.8.3') {
            this.m_shoot.onAimDeg(this.m_degSpine);
            super.start();
        }
        else {
            this.scheduleOnce(() => {
                this.m_shoot.onAimDeg(this.m_degSpine);
                super.start();
            });
        }
    }

    //

    onEvent(): void {
        //DELAY
        this.scheduleOnce(() => {
            //#0: Emit Active
            this.onEventActive();
        }, Math.max(this.Delay, 0));

        //ONCE
        this.onEventOnceCheck();
    } // Re-code onEvent() to fix scheduleOnce & delay events

    onEventActive(): void {
        if (this.TweenRotate)
            this.onRotate();
        else
            this.onShoot();
    }

    onRotate() {
        //INIT
        this.m_degShoot = this.TweenDegFrom;
        this.m_degSpine = this.TweenDegFrom + this.TweenDegOffset;
        this.m_shoot.onAimDeg(this.m_degSpine);
        //TWEEN
        if (this.m_degTweener != null)
            Tween.stopAllByTarget(this.m_degTweener);
        this.m_degTweener = new DegTweener();
        this.m_degTweener.Deg = this.TweenDegFrom.valueOf();
        this.m_degTweener.Base = this;
        tween(this.m_degTweener)
            .to(this.TweenDuration, { Deg: this.TweenDegTo }, {
                onUpdate(target: DegTweener) {
                    target.Base.m_degShoot = target.Deg;
                    target.Base.m_degSpine = target.Deg + target.Base.TweenDegOffset;
                    target.Base.m_shoot.onAimDeg(target.Base.m_degSpine);
                },
            })
            .call(() => this.onShoot())
            .start();
    }

    onShoot() {
        if (this.ShootAnim) {
            let animDuration = this.m_spine.onAnimation(this.AnimShoot, false);
            this.scheduleOnce(() => this.m_spine.onAnimation(this.AnimShoot, this.AnimIdleLoop), animDuration);
            this.scheduleOnce(() => {
                this.m_shoot.onShootVelocityDeg(
                    this.m_degShoot,
                    this.Bullet,
                    this.BulletSpeed,
                    this.BulletRotateActive ? this.BulletRotate : null);
                this.onShootComplete();
            }, Math.min(animDuration, this.ShootDelay));
        }
        else {
            this.m_shoot.onShootVelocityDeg(
                this.m_degShoot,
                this.Bullet,
                this.BulletSpeed,
                this.BulletRotateActive ? this.BulletRotate : null);
            this.onShootComplete();
        }
    }

    onShootComplete() {
        //#1: Emit Director
        this.EmitEvent.forEach(event => {
            if (event != '')
                director.emit(event);
        });

        //NEXT
        if (this.EmitNodeNext != null)
            this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);
    }
}