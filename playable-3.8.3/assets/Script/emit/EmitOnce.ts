import { _decorator, CCFloat, CCInteger, Collider2D, Component, Contact2DType, Enum, ERigidBody2DType, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

export enum OnceType {
    None,
    Once,
    DeActive,
    Destroy,
}
Enum(OnceType);

@ccclass('EmitOnce')
export class EmitOnce extends Component {

    //ON-COLLISION-EVENT
    @property({ group: { name: 'Event' }, type: CCInteger, visible(this: EmitOnce) { return this.getComponent(RigidBody2D) != null; } })
    OnTagBody: number = 0;
    @property({ group: { name: 'Event' }, type: [CCInteger], visible(this: EmitOnce) { return this.getComponent(RigidBody2D) != null; } })
    OnTagTarget: number[] = [100];
    //OPTION-EVENT
    @property({ group: { name: 'Event' }, type: OnceType })
    Once: OnceType = OnceType.Once;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    //NEXT-EVENT
    @property({ group: { name: 'Event', displayOrder: 99999 }, type: Node })
    EmitNodeNext: Node = null;

    protected m_eventActived: boolean = false;
    protected m_eventPhysic: boolean = false;

    protected onLoad(): void {
        //ON-COLLISION-EVENT
        let rigidBody = this.getComponent(RigidBody2D);
        if (rigidBody != null) {
            this.m_eventPhysic = true;
            rigidBody.enabledContactListener = true;
            rigidBody.type = ERigidBody2DType.Kinematic;
            rigidBody.gravityScale = 0;
            rigidBody.fixedRotation = true;
            //
            let colliders = this.getComponents(Collider2D);
            colliders.forEach(collider => {
                switch (collider.tag) {
                    case this.OnTagBody:
                        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        break;
                }
            });
        }
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let tagTargetIndex = this.OnTagTarget.findIndex((t) => t == otherCollider.tag);
        if (tagTargetIndex < 0)
            return;

        //EVENT
        this.onEvent();
    }

    onEvent(): void {
        if (this.m_eventActived)
            return;
        this.m_eventActived = true;

        //DELAY
        this.scheduleOnce(() => {
            //NEXT
            if (this.EmitNodeNext != null)
                this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);

            //END
            this.m_eventActived = false;
        }, Math.max(this.Delay, 0));

        //ONCE
        this.onEventOnceCheck();
    }

    onEventOnceCheck(): void {
        if (this.Once >= OnceType.Once) {
            //ON-COLLISION-EVENT
            let colliders = this.getComponents(Collider2D);
            colliders.forEach(collider => {
                switch (collider.tag) {
                    case this.OnTagBody:
                        collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        break;
                }
            });
        }
        if (this.Once >= OnceType.DeActive)
            this.scheduleOnce(() => this.node.active = false, 0.02);
        else if (this.Once >= OnceType.Destroy)
            this.scheduleOnce(() => this.node.destroy(), 0.02);
    }
}