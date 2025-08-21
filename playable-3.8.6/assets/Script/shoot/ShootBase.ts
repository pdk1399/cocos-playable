import { _decorator, CCBoolean, CCFloat, CCString, Component, instantiate, Node, RigidBody2D, sp, v2, v3, Vec2 } from 'cc';
import { SpineBase } from '../renderer/SpineBase';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('ShootBase')
export class ShootBase extends Component {

    @property({ type: Node })
    Centre: Node = null;
    @property({ type: Node })
    BulletSpawm: Node = null;

    @property({ type: CCBoolean, visible(this: ShootBase) { return this.getComponent(SpineBase) != null; } })
    AimSpine: boolean = false;
    @property({ type: CCString, visible(this: ShootBase) { return this.AimSpine && this.getComponent(SpineBase) != null; } })
    AimAnim: string = 'attack_aim';
    @property({ type: CCString, visible(this: ShootBase) { return this.AimSpine && this.getComponent(SpineBase) != null; } })
    AimBone: string = 'aim_bone';

    m_aimBone: sp.spine.Bone;
    m_aimAnim: string = 'attack_aim';
    m_aimFrom: Node = null;
    m_aimPosPrimary: Vec2;

    m_spine: SpineBase = null;

    protected onLoad(): void {
        this.m_spine = this.getComponent(SpineBase);

        if (this.AimSpine)
            this.onAimInit(this.AimAnim, this.AimBone, this.Centre);
    }

    protected start(): void {
        if (this.Centre == null)
            this.Centre = this.node;
        if (this.BulletSpawm == null)
            this.BulletSpawm = this.node.parent;
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
        bulletClone.setParent(this.BulletSpawm);
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
        bulletClone.setParent(this.BulletSpawm);
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

    //AIM

    onAimInit(anim: string, bone: string, from: Node) {
        this.m_aimBone = this.m_spine.Spine.findBone(bone);
        this.m_aimAnim = anim;
        this.m_aimPosPrimary = v2(this.m_aimBone.x, this.m_aimBone.y);
        this.m_aimFrom = from;
    }

    onAimTarget(target: Node) {
        if (this.m_aimBone == null)
            return;
        let aimPosition = target.worldPosition.clone().subtract(this.node.worldPosition.clone());
        this.onAim(v2(aimPosition.x, aimPosition.y));
    }

    onAimDeg(deg: number) {
        if (this.m_aimBone == null)
            return;
        let direction = v3(Math.cos(deg * (Math.PI / 180)), Math.sin(deg * (Math.PI / 180)), 0);
        direction = direction.clone().normalize().multiplyScalar(10);
        let aimPosition = this.m_aimFrom.position.clone().add(direction);
        this.onAim(v2(aimPosition.x, aimPosition.y));
    }

    onAim(posLocal: Vec2) {
        if (this.m_aimBone == null)
            return;
        //Not used this on update() or lateUpdate() to avoid some bug with caculate position
        let posLocalSpine = new sp.spine.Vector2(posLocal.clone().x, posLocal.clone().y);
        this.m_aimBone.parent.worldToLocal(posLocalSpine);
        this.m_aimBone.x = posLocalSpine.x;
        this.m_aimBone.y = posLocalSpine.y;
        this.m_spine.Spine._skeleton.updateWorldTransform();
        this.m_spine.Spine.setAnimation(ConstantBase.ANIM_INDEX_AIM, this.m_aimAnim, true);
    }

    onAimReset() {
        if (this.m_aimBone == null)
            return;
        this.m_spine.onAnimationClear(ConstantBase.ANIM_INDEX_AIM);
    }
}