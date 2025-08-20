import { _decorator, CCBoolean, CCFloat, Component, instantiate, Node, RigidBody2D, v2, v3, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShootBase')
export class ShootBase extends Component {

    @property({ type: Node })
    Centre: Node = null;
    @property({ type: Node })
    Spawm: Node = null;

    protected start(): void {
        if (this.Centre == null)
            this.Centre = this.node;
        if (this.Spawm == null)
            this.Spawm = this.node.parent;
    }

    onLostFocusInEditor(): void {
        if (this.Centre == null)
            this.Centre = this.node.getChildByName('renderer').getChildByName('centre');
    }

    //SHOOT: PRIMARY

    onShootVelocityTarget(target: Node, bullet: Node, speed: number, rotate: number): void {
        this.onShootVelocity(
            this.getVelocityTarget(target, speed),
            bullet,
            rotate);
    }

    onShootVelocityWorldPos(worldPos: Vec2, bullet: Node, speed: number, rotate: number): void {
        this.onShootVelocity(
            this.getVelocityWorldPos(worldPos, speed),
            bullet,
            rotate);
    }

    onShootVelocityDirection(direction: Vec2, bullet: Node, speed: number, rotate: number): void {
        this.onShootVelocity(
            this.getVelocityDirection(direction, speed),
            bullet,
            rotate);
    }

    onShootVelocityDeg(deg: number, bullet: Node, speed: number, rotate: number) {
        this.onShootVelocity(
            this.getVelocityDeg(deg, speed),
            bullet,
            rotate);
    }

    //SHOOT: OPTION

    onShootVelocityCircle(deg: number, bullet: Node, speed: number, rotate: number, count: number = 8, offset: number = 45) {
        for (let i = 0; i < count; i++)
            this.onShootVelocity(
                this.getVelocityDeg(deg + offset * i, speed),
                bullet,
                rotate);
    }

    //GET

    getVelocityTarget(target: Node, length: number): Vec2 {
        var direction = v2(
            target.worldPosition.clone().x - this.Centre.worldPosition.clone().x,
            target.worldPosition.clone().y - this.Centre.worldPosition.clone().y + 100).normalize();
        return direction.clone().multiplyScalar(length);
    }

    getVelocityWorldPos(worldPos: Vec2, length: number): Vec2 {
        var direction = v2(
            worldPos.x - this.Centre.worldPosition.clone().x,
            worldPos.y - this.Centre.worldPosition.clone().y + 100).normalize();
        return direction.clone().multiplyScalar(length);
    }

    getVelocityDirection(direction: Vec2, length: number): Vec2 {
        return direction.clone().normalize().multiplyScalar(length);
    }

    getVelocityDeg(deg: number, length: number): Vec2 {
        let direction = v2(Math.cos(deg * (Math.PI / 180)), Math.sin(deg * (Math.PI / 180))).normalize();
        return direction.clone().multiplyScalar(length);
    }

    //SHOOT: VELOCITY

    onShootVelocity(velocity: Vec2, bullet: Node, rotate?: number) {
        var bulletClone = instantiate(bullet);
        bulletClone.setParent(this.Spawm);
        bulletClone.worldPosition = this.Centre.worldPosition.clone();
        if (rotate != null) {
            //Rotate default value is 180 recommend
            var bulletRotate = Math.atan2(velocity.y, velocity.x) * 57.29578 + rotate;
            bulletClone.setRotationFromEuler(v3(0, 0, bulletRotate));
        }
        this.scheduleOnce(() => {
            bulletClone.active = true;
            bulletClone.getComponent(RigidBody2D).linearVelocity = velocity;
        }, 0.02);
    }

    //SHOOT: INSTANT

    onShootInstant(posWorld: Vec2, bullet: Node, rotate?: number) {
        var bulletClone = instantiate(bullet);
        bulletClone.setParent(this.Spawm);
        bulletClone.worldPosition = v3(posWorld.x, posWorld.y, bulletClone.worldPosition.clone().z);
        if (rotate != null) {
            //Rotate default value is 180 recommend
            let velocity = this.getVelocityWorldPos(posWorld, 1);
            var bulletRotate = Math.atan2(velocity.y, velocity.x) * 57.29578 + rotate;
            bulletClone.setRotationFromEuler(v3(0, 0, bulletRotate));
        }
        this.scheduleOnce(() => {
            bulletClone.active = true;
        }, 0.02);
    }
}