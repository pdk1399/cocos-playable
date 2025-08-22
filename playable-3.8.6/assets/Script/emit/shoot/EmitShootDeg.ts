import { _decorator, CCBoolean, CCFloat, Tween, tween, VERSION } from 'cc';
import { ShootBase } from '../../shoot/ShootBase';
import { SpineBase } from '../../renderer/SpineBase';
import { EmitShoot } from './EmitShoot';
const { ccclass, property } = _decorator;

class DegTweener {
    Deg: number = 0;
    Base: EmitShootDeg = null;
}

@ccclass('EmitShootDeg')
export class EmitShootDeg extends EmitShoot {

    @property({ group: { name: 'Shoot', displayOrder: 0 }, type: CCBoolean })
    TweenRotate: boolean = false;
    @property({ group: { name: 'Shoot', displayOrder: 2 }, type: CCFloat, visible(this: EmitShootDeg) { return this.TweenRotate; } })
    TweenDuration: number = 1;
    @property({ group: { name: 'Shoot', displayOrder: 4 }, type: CCFloat, visible(this: EmitShootDeg) { return this.TweenRotate; } })
    TweenDegFrom: number = 0;
    @property({ group: { name: 'Shoot', displayOrder: 6 }, type: CCFloat, visible(this: EmitShootDeg) { return this.TweenRotate; } })
    TweenDegTo: number = 180;
    @property({ group: { name: 'Shoot', displayOrder: 8 }, type: CCFloat, visible(this: EmitShootDeg) { return this.TweenRotate; } })
    TweenDegOffset: number = 0;

    m_degShoot: number = 0;
    m_degSpine: number = 0;
    m_degTweener: DegTweener = null;

    m_spine: SpineBase = null;
    m_shoot: ShootBase = null;

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

    onShootBullet() {
        this.m_shoot.onShootVelocityDeg(
            this.m_degShoot,
            this.Bullet,
            this.BulletSpeed,
            this.BulletRotateActive ? this.BulletRotate : null);
        this.onShootComplete();
    } // Re-code onShootBullet() to fix shoot bullet events
}