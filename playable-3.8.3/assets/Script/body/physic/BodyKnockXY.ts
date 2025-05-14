import { _decorator, CCBoolean, CCFloat, Component, Node, RigidBody2D, tween, v2, v3, Vec2 } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { BodyBase } from '../BodyBase';
const { ccclass, property } = _decorator;

@ccclass('BodyKnockXY')
export class BodyKnockXY extends Component {

    @property({ group: { name: 'Hit' }, type: CCBoolean })
    Hit: boolean = true;
    @property({ group: { name: 'Hit' }, type: CCFloat })
    HitForce: number = 25;
    @property({ group: { name: 'Hit' }, type: CCFloat })
    HitDuration: number = 0.2; //Used by another progess instead of this component

    @property({ group: { name: 'Dead' }, type: CCBoolean })
    Dead: boolean = false;
    @property({ group: { name: 'Dead' }, type: CCFloat })
    DeadForce: number = 25;
    @property({ group: { name: 'Dead' }, type: CCFloat })
    DeadDuration: number = 0.2; //Used by another progess instead of this component

    @property({ group: { name: 'Option' }, type: CCBoolean })
    DeadFlow: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean })
    DeadRotate: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean })
    DeadRotateRight: boolean = true;
    @property({ group: { name: 'Option' }, type: CCFloat })
    DeadRotateDuration: number = 0.5;
    @property({ group: { name: 'Option' }, type: Node })
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
        this.node.on(ConstantBase.NODE_CONTROL_DEAD, this.onDead, this);
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
        this.onKnock(from, this.HitForce);
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
        this.onKnock(from, this.DeadForce);

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

    onKnock(from: Node, force: number) {
        let velocity = from.worldPosition.clone().subtract(from.worldPosition.clone()).multiplyScalar(force);
        this.m_force = v2(velocity.x, velocity.y);
        this.m_rigidbody.linearVelocity = this.m_force;
    }
}