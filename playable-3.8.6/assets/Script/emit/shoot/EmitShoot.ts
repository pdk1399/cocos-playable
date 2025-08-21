import { _decorator, CCBoolean, CCFloat, CCString, director, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { SpineBase } from '../../renderer/SpineBase';
import { ShootBase } from '../../shoot/ShootBase';
import { EmitBaseEvent } from '../base/EmitBaseEvent';
const { ccclass, property } = _decorator;

@ccclass('EmitShoot')
export class EmitShoot extends EmitBaseEvent {

    @property({ group: { name: 'Event', displayOrder: 16 }, type: Node })
    EmitNode: Node = null;

    @property({ group: { name: 'Bullet' }, type: Node })
    Bullet: Node = null;
    @property({ group: { name: 'Bullet' }, type: CCFloat })
    BulletSpeed: number = 5;
    @property({ group: { name: 'Bullet' }, type: CCBoolean })
    BulletRotateActive: boolean = false;
    @property({ group: { name: 'Bullet' }, type: CCFloat, visible(this: EmitShoot) { return this.BulletRotateActive; } })
    BulletRotate: number = 180;

    @property({ group: { name: 'Shoot' }, type: CCBoolean })
    ShootAnim: boolean = false;
    @property({ group: { name: 'Shoot' }, type: CCString, visible(this: EmitShoot) { return this.ShootAnim; } })
    AnimShoot: string = 'shoot';
    @property({ group: { name: 'Shoot' }, type: CCFloat, visible(this: EmitShoot) { return this.ShootAnim; } })
    ShootDelay: number = 0;
    @property({ group: { name: 'Shoot' }, type: CCString, visible(this: EmitShoot) { return this.ShootAnim; } })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Shoot' }, type: CCBoolean, visible(this: EmitShoot) { return this.ShootAnim; } })
    AnimIdleLoop: boolean = true;

    m_spine: SpineBase = null;
    m_shoot: ShootBase = null;

    protected onLoad() {
        this.m_spine = this.EmitNode.getComponent(SpineBase);
        this.m_shoot = this.EmitNode.getComponent(ShootBase);
        super.onLoad();
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
        this.onShoot();
    }

    //

    onShoot() {
        if (this.ShootAnim) {
            let animDuration = this.m_spine.onAnimation(this.AnimShoot, false);
            this.scheduleOnce(() => this.m_spine.onAnimation(this.AnimShoot, this.AnimIdleLoop), animDuration);
            this.scheduleOnce(() => this.onShootBullet(), Math.min(animDuration, this.ShootDelay));
        }
        else
            this.onShootBullet();
    }

    onShootBullet() {
        this.m_shoot.onShootVelocityDeg(
            this.EmitNode.eulerAngles.clone().z,
            this.Bullet,
            this.BulletSpeed,
            this.BulletRotateActive ? this.BulletRotate : null);
        this.onShootComplete();
    } // Re-code onShootBullet() to fix shoot bullet events

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