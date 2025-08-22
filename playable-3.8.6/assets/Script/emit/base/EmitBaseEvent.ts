import { _decorator, CCString, Collider2D, Contact2DType, director, ERigidBody2DType, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { EmitBase, OnceType } from './EmitBase';
const { ccclass, property } = _decorator;

//Extends this class to create unique event with focus on event excuted

@ccclass('EmitBaseEvent')
export class EmitBaseEvent extends EmitBase {

    //ON-EVENT
    @property({ group: { name: 'Event', displayOrder: 2 }, type: [CCString], visible(this: EmitBaseEvent) { return !this.Start; } })
    OnEvent: string[] = [];
    @property({ group: { name: 'Event', displayOrder: 2 }, type: [CCString], visible(this: EmitBaseEvent) { return !this.Start; } })
    OnNode: string[] = [];
    //EMIT-EVENT
    @property({ group: { name: 'Event', displayOrder: 14 }, type: [CCString] })
    EmitEvent: string[] = [];

    //NOTE: 'displayOrder' count every items (field name, field value, etc) to draw order

    protected m_targetCollide: Node[] = [];

    protected onLoad(): void {
        if (this.Start)
            return;
        //ON-EVENT
        this.node.on(ConstantBase.NODE_EVENT_STOP, this.onEventStop, this);
        this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
        this.OnEvent.forEach(event => {
            director.on(event, this.onEvent, this);
        });
        this.OnNode.forEach(event => {
            this.node.on(event, this.onEvent, this);
        });
        //ON-COLLISION-EVENT
        let rigidBody = this.getComponent(RigidBody2D);
        if (rigidBody != null) {
            rigidBody.enabledContactListener = true;
            rigidBody.type = ERigidBody2DType.Kinematic;
            rigidBody.gravityScale = 0;
            rigidBody.fixedRotation = true;
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
        if (tagTargetIndex < 0) {
            let nodeTargetIndex = this.OnNodeTarget.findIndex((t) => t == otherCollider.node);
            if (nodeTargetIndex < 0)
                return;
        }

        //EVENT
        this.onEvent();
    }

    onEvent(): void {
        if (!this.enabledInHierarchy)
            //Not do event when not active in hierarchy
            return;

        //DELAY
        this.scheduleOnce(() => {
            //#0: Emit Active
            this.onEventActive();

            //#1: Emit Director
            this.EmitEvent.forEach(event => {
                if (event != '')
                    director.emit(event);
            });

            //NEXT
            if (this.EmitNodeNext != null)
                this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);
        }, Math.max(this.Delay, 0));

        //ONCE
        this.onEventOnceCheck();
    } // Re-code onEvent() to fix scheduleOnce & delay events

    onEventActive(): void { } // Re-code onEventActive() to active main events

    onEventOnceCheck() {
        if (this.Once >= OnceType.Once) {
            //ON-EVENT
            this.node.off(ConstantBase.NODE_EVENT, this.onEvent, this);
            this.OnEvent.forEach(event => {
                director.off(event, this.onEvent, this);
            });
            this.OnNode.forEach(event => {
                this.node.off(event, this.onEvent, this);
            });
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
        if (this.Once >= OnceType.Destroy)
            this.scheduleOnce(() => this.node.destroy(), Math.max(this.Delay, 0) + 0.02);
    } // Re-code onEventOnceCheck() to check once events
}