import { _decorator, CCBoolean, CCInteger, Collider2D, Component, Contact2DType, Enum, ERigidBody2DType, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

export enum OnceType {
    DeActive,
    Destroy,
}
Enum(OnceType);

@ccclass('EmitOnce')
export class EmitOnce extends Component {

    @property({ group: { name: 'Event' }, type: CCInteger, visible(this: EmitOnce) { return this.getComponent(RigidBody2D) != null; } })
    OnTagBody: number = 0;
    @property({ group: { name: 'Event' }, type: [CCInteger], visible(this: EmitOnce) { return this.getComponent(RigidBody2D) != null; } })
    OnTagTarget: number[] = [100];
    @property({ group: { name: 'Event' }, type: OnceType })
    Once: OnceType = OnceType.DeActive;
    //NEXT-EVENT
    @property({ group: { name: 'Event', displayOrder: 99999 }, type: Node })
    EmitNodeNext: Node = null;

    protected onLoad(): void {
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

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let tagTargetIndex = this.OnTagTarget.findIndex((t) => t == otherCollider.tag);
        if (tagTargetIndex < 0)
            return;

        //NEXT
        if (this.EmitNodeNext != null)
            this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);

        if (this.Once >= OnceType.DeActive)
            this.scheduleOnce(() => this.node.active = false, 0.02);
        else if (this.Once >= OnceType.Destroy)
            this.scheduleOnce(() => this.node.destroy(), 0.02);

        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.OnTagBody:
                    collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    break;
            }
        });
    }
}