import { _decorator, CCBoolean, CCFloat, Component, ERigidBody2DType, Node, RigidBody2D, tween, v2, v3, Vec2 } from 'cc';
import { BodyBase } from '../BodyBase';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BodyKnockX')
@requireComponent(BodyBase)
@requireComponent(RigidBody2D)
export class BodyKnockX extends Component {

    @property({ group: { name: 'Hit' }, type: CCBoolean })
    Hit: boolean = true;
    @property({ group: { name: 'Hit' }, type: CCFloat, visible(this: BodyKnockX) { return this.Hit; } })
    HitDeg: number = 50;
    @property({ group: { name: 'Hit' }, type: CCFloat, visible(this: BodyKnockX) { return this.Hit; } })
    HitForce: number = 25;
    @property({ group: { name: 'Hit' }, type: CCFloat, visible(this: BodyKnockX) { return this.Hit; } })
    HitDuration: number = 0.2; //Used by another progess instead of this component

    @property({ group: { name: 'Dead' }, type: CCBoolean })
    Dead: boolean = false;
    @property({ group: { name: 'Dead' }, type: CCFloat, visible(this: BodyKnockX) { return this.Dead; } })
    DeadDeg: number = 50;
    @property({ group: { name: 'Dead' }, type: CCFloat, visible(this: BodyKnockX) { return this.Dead; } })
    DeadForce: number = 25;
    @property({ group: { name: 'Dead' }, type: CCFloat, visible(this: BodyKnockX) { return this.Dead; } })
    DeadDuration: number = 0.2; //Used by another progess instead of this component
    @property({ group: { name: 'Dead' }, type: CCBoolean, visible(this: BodyKnockX) { return this.Dead; } })
    DeadFlow: boolean = false;
    @property({ group: { name: 'Dead' }, type: CCBoolean, visible(this: BodyKnockX) { return this.Dead; } })
    DeadRotate: boolean = false;
    @property({ group: { name: 'Dead' }, type: CCBoolean, visible(this: BodyKnockX) { return this.Dead && this.DeadRotate; } })
    DeadRotateRight: boolean = true;
    @property({ group: { name: 'Dead' }, type: CCFloat, visible(this: BodyKnockX) { return this.Dead && this.DeadRotate; } })
    DeadRotateDuration: number = 0.5;
    @property({ group: { name: 'Dead' }, type: Node, visible(this: BodyKnockX) { return this.Dead && this.DeadRotate; } })
    DeadRotateNode: Node = null;

    m_from: Node = null;
    m_force: Vec2 = v2();
    m_knock: boolean = false; //Used by another progess instead of this component

    m_body: BodyBase = null;
    m_rigidbody: RigidBody2D = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_rigidbody = this.getComponent(RigidBody2D);

        this.node.on(ConstantBase.NODE_BODY_HIT, this.onHit, this);
        this.node.on(ConstantBase.NODE_BODY_DEAD, this.onDead, this);
    }

    protected start(): void {
        if (this.DeadRotateNode == null)
            this.DeadRotateNode = this.node;
    }

    onHit(hit: number, from: Node) {
        if (!this.Hit)
            return;
        this.m_from = from;
        this.m_knock = true;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.m_knock = false;
            this.m_rigidbody.linearVelocity = v2();
            this.m_rigidbody.sleep();
            this.scheduleOnce(() => this.m_rigidbody.wakeUp(), 0.02);
        }, this.HitDuration);
        this.onKnock(from, this.HitDeg, this.HitForce);
    }

    onDead(from: Node) {
        if (!this.Dead)
            return;
        this.m_from = from;
        this.m_knock = true;
        this.unscheduleAllCallbacks();
        if (!this.DeadFlow) {
            this.scheduleOnce(() => {
                this.m_knock = false;
                this.m_rigidbody.linearVelocity = v2();
                this.m_rigidbody.sleep();
                this.scheduleOnce(() => this.m_rigidbody.wakeUp(), 0.02);
            }, this.DeadDuration);
        }
        else {
            this.m_rigidbody.linearDamping = 0;
            this.m_rigidbody.gravityScale = 0;
        }
        this.onKnock(from, this.DeadDeg, this.DeadForce);

        if (this.DeadRotate) {
            let rotateDir = this.node.worldPosition.clone().x < from.worldPosition.clone().x ? 1 : -1;
            let rotateFixed = this.DeadRotateRight ? 1 : -1;
            let rotateValue = v3();
            rotateValue.z = 359 * rotateDir * rotateFixed;
            tween(this.DeadRotateNode)
                .repeatForever(tween(this.DeadRotateNode)
                    .to(this.DeadRotateDuration, { eulerAngles: rotateValue }, { easing: 'linear' })
                    .call(() => this.DeadRotateNode.eulerAngles = v3(0, 0, 0)))
                .start();
        }
    }

    onKnock(from: Node, deg: number, force: number) {
        let reflect = this.node.worldPosition.clone().x < from.worldPosition.clone().x;
        this.m_force = this.getVelocity(deg, force, reflect);
        this.m_rigidbody.linearVelocity = this.m_force;
    }

    private getVelocity(deg: number, length: number, reflect: boolean): Vec2 {
        let direction = v2(Math.cos(deg * (Math.PI / 180)), Math.sin(deg * (Math.PI / 180)));
        if (reflect)
            direction.x *= -1;
        return direction.normalize().multiplyScalar(length);
    }
}