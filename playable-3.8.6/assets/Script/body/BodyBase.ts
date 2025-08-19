import { _decorator, Node, AudioSource, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, director, instantiate, RigidBody2D, Sprite, Vec2, v2, v3, UITransform, tween, Vec3 } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { UIValueBar } from '../ui/UIValueBar';
const { ccclass, property } = _decorator;

@ccclass('BodyBase')
export class BodyBase extends Component {

    @property({ group: { name: 'Body' }, type: CCBoolean })
    Protect: boolean = false;
    @property({ group: { name: 'Body' }, type: CCBoolean, visible(this: BodyBase) { return !this.Protect; } })
    ProtectBigSize: boolean = false;
    @property({ group: { name: 'Body' }, type: CCInteger, visible(this: BodyBase) { return !this.Protect; } })
    HitPoint: number = 1;
    @property({ group: { name: 'Body' }, type: CCFloat })
    HitDelay: number = 0.2;
    @property({ group: { name: 'Body' }, type: CCBoolean })
    HitFixed: boolean = false;
    @property({ group: { name: 'Body' }, type: CCBoolean })
    SwimWater: boolean = false;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    EmitHitDead: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitHit: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitDead: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitDestroy: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean })
    EmitFull: boolean = true;

    @property({ group: { name: 'Destroy' }, type: CCBoolean })
    DestroyNode: boolean = false;
    @property({ group: { name: 'Destroy' }, type: CCFloat, visible(this: BodyBase) { return this.DestroyNode; } })
    DestroyNodeDelay: number = 0;
    @property({ group: { name: 'Destroy' }, type: CCBoolean })
    DestroyBody: boolean = false;
    @property({ group: { name: 'Destroy' }, type: CCFloat, visible(this: BodyBase) { return this.DestroyBody; } })
    DestroyBodyDelay: number = 0;
    @property({ group: { name: 'Destroy' }, type: CCBoolean, visible(this: BodyBase) { return this.DestroyBody; } })
    DestroyRigidbody: boolean = true;
    @property({ group: { name: 'Destroy' }, type: [CCInteger], visible(this: BodyBase) { return this.DestroyBody; } })
    TagDestroyCollider: number[] = [200];

    @property({ group: { name: 'Camera' }, type: CCBoolean })
    ShakeHit: boolean = false;
    @property({ group: { name: 'Camera' }, type: CCBoolean })
    ShakeDead: boolean = false;

    @property({ group: { name: 'Option' }, type: CCString })
    Name: string = '';
    @property({ group: { name: 'Option' }, type: UIValueBar })
    ValueBar: UIValueBar = null;

    m_baseSize: number = 1;
    m_baseScale: Vec3 = Vec3.ONE;

    m_dead: boolean = false;
    m_hit: boolean = false;
    m_hitPointCurrent: number;

    m_bodyX2: boolean = false;
    m_bodyX4: boolean = false;
    m_bodySinking: boolean = false;

    m_rigidbody: RigidBody2D = null;
    m_destroyCollider: Collider2D[] = [];
    m_maskSprite: Sprite = null;
    m_maskTransform: UITransform = null;
    m_maskTransformX: number;

    protected onLoad(): void {
        this.m_rigidbody = this.getComponent(RigidBody2D);

        this.node.on(ConstantBase.NODE_BODY_HIT, this.onHit, this);
        this.node.on(ConstantBase.NODE_BODY_DEAD, this.onDead, this);
        this.node.on(ConstantBase.NODE_BODY_X2, this.onBodyX2, this);
        this.node.on(ConstantBase.NODE_BODY_X4, this.onBodyX4, this);
        this.node.on(ConstantBase.NODE_BODY_SINKING, this.onSinking, this);

        this.node.on(ConstantBase.NODE_VALUE_PROTECT, this.onProtect, this);
        this.node.on(ConstantBase.NODE_VALUE_HIT_POINT, this.onHitPoint, this);
        this.node.on(ConstantBase.NODE_VALUE_HIT_POINT_CURRENT, this.onHitPointCurrent, this);

        const collider = this.getComponents(Collider2D);
        collider.forEach(colliderCheck => {
            const tagIndex = this.TagDestroyCollider.findIndex(t => t == colliderCheck.tag);
            if (tagIndex >= 0)
                this.m_destroyCollider.push(colliderCheck as Collider2D)
        })
    }

    protected start(): void {
        this.m_hitPointCurrent = this.HitPoint;

        this.m_baseScale = this.node.scale.clone();
        this.m_baseSize = 1;

        if (this.ValueBar != null ? !this.ValueBar.Hide : false) {
            this.ValueBar.onName(this.Name);
            this.ValueBar.onValue(this.m_hitPointCurrent, this.HitPoint);
        }
    }

    protected onDestroy(): void {
        if (this.EmitDestroy != '')
            director.emit(this.EmitDestroy, this.node);
    }

    //BODY

    onHit(hit: number, from: Node) {
        if (this.m_dead)
            return;

        if (this.m_hit)
            return;
        this.m_hit = true;
        this.scheduleOnce(() => {
            this.m_hit = false;
        }, this.HitDelay);

        if (this.Protect || (this.ProtectBigSize && (this.m_bodyX2 || this.m_bodyX4))) {
            //Protect
        }
        else {
            //Hurt
            if (this.HitFixed)
                this.m_hitPointCurrent -= 1;
            else
                this.m_hitPointCurrent -= Math.max(hit, 1);
            if (this.m_hitPointCurrent < 0)
                this.m_hitPointCurrent = 0;
            this.onBarUpdate();
        }

        if (this.m_hitPointCurrent <= 0)
            this.onDead(from);
        else {
            if (this.ShakeHit)
                director.emit(ConstantBase.CAMERA_EFFECT_SHAKE_ONCE);

            this.node.emit(ConstantBase.NODE_BODY_HIT, hit, from);
            if (this.EmitHit != '') {
                if (this.EmitFull)
                    director.emit(this.EmitHit, this.m_hitPointCurrent, this.HitPoint);
                else
                    director.emit(this.EmitHit);
            }
        }
    }

    onDead(from: Node) {
        if (this.m_dead)
            return;
        this.unscheduleAllCallbacks();
        this.m_dead = true;

        if (this.ShakeDead)
            director.emit(ConstantBase.CAMERA_EFFECT_SHAKE_ONCE);

        this.onDeadDestroy();

        if (this.EmitHitDead) {
            if (this.EmitHit != '') {
                if (this.EmitFull)
                    director.emit(this.EmitHit, this.m_hitPointCurrent, this.HitPoint);
                else
                    director.emit(this.EmitHit);
            }
        }

        this.node.emit(ConstantBase.NODE_BODY_DEAD, from);
        if (this.EmitDead != '') {
            if (this.EmitFull)
                director.emit(this.EmitDead, this.node);
            else
                director.emit(this.EmitDead);
        }

        this.node.off(ConstantBase.NODE_BODY_HIT, this.onHit, this);
        this.node.off(ConstantBase.NODE_BODY_DEAD, this.onDead, this);
    }

    onProtect(state: boolean = true) {
        if (state)
            this.Protect = state;
        else
            this.scheduleOnce(() => this.Protect = false, 0.02);
    }

    onHitPoint(value: number) {
        this.HitPoint = value;
        if (this.HitPoint < 1)
            this.HitPoint = 1;
        this.onHitPointCurrent(this.HitPoint);
        this.onBarUpdate();
    }

    onHitPointCurrent(value: number) {
        this.m_hitPointCurrent = value;
        if (this.m_hitPointCurrent > this.HitPoint)
            this.m_hitPointCurrent = this.HitPoint;
        else if (this.m_hitPointCurrent < 0)
            this.m_hitPointCurrent = 0;
        this.onBarUpdate();
    }

    onBarUpdate() {
        if (this.ValueBar != null) {
            this.ValueBar.onName(this.Name);
            this.ValueBar.onValue(this.m_hitPointCurrent, this.HitPoint);
        }
    }

    //EVENT:

    protected onControlByDirector(state: boolean, full: boolean = true) {

    }

    //X2 - X4

    onBodyX2(state: boolean = true) {
        console.log('onBodyX2', state);
        this.m_bodyX2 = state;
        //
        if (this.m_bodyX4)
            return;
        //
        const baseScale: Vec3 = this.m_baseScale.clone();
        const ratio = state ? 2 : 1;
        const colliders = this.getComponents(Collider2D);
        setTimeout(() => {
            tween(this.node).to(0.25, { scale: baseScale.clone().multiplyScalar(ratio) }).call(() => {
                colliders.forEach(c => {
                    c.apply();
                });
            }).start();
        }, 1);
        this.m_baseSize = state ? 2 : 1;
    }

    onBodyX4(state: boolean = true) {
        this.m_bodyX4 = state;
        //
        if (!state && this.m_bodyX2) {
            this.onBodyX2(true);
            return;
        }
        //
        const baseScale: Vec3 = this.m_baseScale.clone();
        const ratio = state ? 4 : 1;
        const colliders = this.getComponents(Collider2D);
        setTimeout(() => {
            tween(this.node).to(0.25, { scale: baseScale.clone().multiplyScalar(ratio) }).call(() => {
                colliders.forEach(c => {
                    c.apply();
                });
            }).start();
        }, 1);
        this.m_baseSize = state ? 4 : 1;
    }

    //SINKING

    onSinking(state: boolean = true) {
        if (this.m_bodySinking == state)
            return;
        this.m_bodySinking = state;
        if (!this.SwimWater && state)
            this.onDead(null);
    }

    //DESTROY

    private onDeadDestroy() {
        if (this.DestroyNode) {
            this.scheduleOnce(() => {
                this.node.emit(ConstantBase.NODE_BODY_DESTROY);
                this.node.destroy();
            }, Math.max(this.DestroyNodeDelay, 0.02));
            if (this.DestroyBody && this.DestroyNodeDelay < this.DestroyBodyDelay)
                return;
        }

        if (this.DestroyBody) {
            this.m_destroyCollider.forEach(colliderCheck => {
                colliderCheck.sensor = true;
                colliderCheck.enabled = false;
            });
            this.scheduleOnce(() => {
                if (this.DestroyRigidbody)
                    this.m_rigidbody.destroy();
                this.m_destroyCollider.forEach(colliderCheck => { colliderCheck.destroy(); });
            }, Math.max(this.DestroyBodyDelay, 0.02));
        }
    }
}