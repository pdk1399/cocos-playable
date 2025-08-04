import { _decorator, CCBoolean, CCFloat, CCInteger, Collider2D, Component, Contact2DType, Enum, ERigidBody2DType, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

export enum OnceType {
    None,
    Once,
    DeActive,
    Destroy,
}
Enum(OnceType);

//Extends this class to create unique event with focus on next event

@ccclass('EmitBase')
export class EmitBase extends Component {

    @property({ group: { name: 'Event', displayOrder: 0 }, type: CCBoolean })
    Start: boolean = false;
    //ON-COLLISION-EVENT
    @property({ group: { name: 'Event', displayOrder: 4 }, type: CCInteger, visible(this: EmitBase) { return !this.Start && this.getComponent(RigidBody2D) != null; } })
    OnTagBody: number = 0;
    @property({ group: { name: 'Event', displayOrder: 6 }, type: [CCInteger], visible(this: EmitBase) { return !this.Start && this.getComponent(RigidBody2D) != null; } })
    OnTagTarget: number[] = [100];
    @property({ group: { name: 'Event', displayOrder: 8 }, type: [Node], visible(this: EmitBase) { return !this.Start && this.getComponent(RigidBody2D) != null; } })
    OnNodeTarget: Node[] = [];
    //OPTION-EVENT
    @property({ group: { name: 'Event', displayOrder: 10 }, type: OnceType })
    Once: OnceType = OnceType.Once;
    @property({ group: { name: 'Event', displayOrder: 12 }, type: CCFloat })
    Delay: number = 0;
    //NEXT-EVENT
    @property({ group: { name: 'Event', displayOrder: 99999 }, type: Node })
    EmitNodeNext: Node = null;

    protected onLoad(): void {
        if (this.Start)
            return;
        //ON-COLLISION-EVENT
        let rigidBody = this.getComponent(RigidBody2D);
        if (rigidBody != null) {
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

    protected start(): void {
        if (this.Start)
            this.onEvent();
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let tagTargetIndex = this.OnTagTarget.findIndex((t) => t == otherCollider.tag);
        if (tagTargetIndex < 0) {
            let nodeTargetIndex = this.OnNodeTarget.findIndex((t) => t == otherCollider.node);
            if (nodeTargetIndex < 0)
                return;
        }

        //EVENT
        this.onEvent();
    }

    onEvent(): void {
        //DELAY
        this.scheduleOnce(() => {
            //NEXT
            if (this.EmitNodeNext != null)
                this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);
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