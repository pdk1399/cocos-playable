import { _decorator, CCFloat, Component, Node } from 'cc';
import { EmitShoot } from './EmitShoot';
const { ccclass, property } = _decorator;

@ccclass('EmitShootCircle')
export class EmitShootCircle extends EmitShoot {

    @property({ group: { name: 'Shoot' }, type: CCFloat })
    Deg: number = 0;
    @property({ group: { name: 'Shoot' }, type: CCFloat })
    Count: number = 8;
    @property({ group: { name: 'Shoot' }, type: CCFloat })
    Offset: number = 45;

    //

    onShootBullet() {
        this.m_shoot.onShootVelocityCircle(
            this.Deg,
            this.Bullet,
            this.BulletSpeed,
            this.BulletRotateActive ? this.BulletRotate : null,
            this.Count,
            this.Offset
        );
        this.onShootComplete();
    } // Re-code onShootBullet() to fix shoot bullet events
}