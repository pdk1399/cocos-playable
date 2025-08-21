import { _decorator, Component, Enum, Node } from 'cc';
import { EmitShoot } from './EmitShoot';
const { ccclass, property } = _decorator;

enum ShootType {
    DIRECTION,
    INSTANT,
}
Enum(ShootType);

@ccclass('EmitShootTarget')
export class EmitShootTarget extends EmitShoot {

    @property({ type: ShootType, displayOrder: 0 })
    Type: ShootType = ShootType.DIRECTION;
    @property({ type: Node, displayOrder: 0 })
    Target: Node = null;

    onShootBullet() {
        switch (this.Type) {
            case ShootType.DIRECTION:
                this.m_shoot.onShootVelocityTarget(
                    this.Target,
                    this.Bullet,
                    this.BulletSpeed,
                    this.BulletRotateActive ? this.BulletRotate : null);
                break;
            case ShootType.INSTANT:
                this.m_shoot.onShootInstantTarget(
                    this.Target,
                    this.Bullet,
                    this.BulletRotateActive ? this.BulletRotate : null);
                break;
        }
        this.onShootComplete();
    }
}