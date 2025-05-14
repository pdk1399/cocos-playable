import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, director, ERigidBody2DType, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

//Extends this class to create unique event with no other node events excuted

@ccclass('EmitBase')
export class EmitBase extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    //ON-EVENT
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EmitBase) { return !this.Start; } })
    OnEvent: string = '';
    //ON-COLLISION-EVENT
    @property({ group: { name: 'Event' }, type: CCInteger, visible(this: EmitBase) { return !this.Start && this.getComponent(RigidBody2D) != null; } })
    OnTagBody: number = 0;
    @property({ group: { name: 'Event' }, type: [CCInteger], visible(this: EmitBase) { return !this.Start && this.getComponent(RigidBody2D) != null; } })
    OnTagTarget: number[] = [100];
    //OPTION-EVENT
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EmitBase) { return !this.Start; } })
    Once: boolean = true;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    //EMIT-EVENT
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';
    //NEXT-EVENT
    @property({ group: { name: 'Event', displayOrder: 99999 }, type: Node })
    EmitNodeNext: Node = null;

    protected m_eventActived: boolean = false;
    protected m_eventPhysic: boolean = false;
    protected m_targetCollide: Node[] = [];

    protected onLoad(): void {
        //ON-EVENT
        this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onEvent, this);

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

    protected start(): void {
        if (this.Start)
            this.onEvent();
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let targetIndex = this.OnTagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex < 0)
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
            //#0: Emit Active
            this.onEventActive();

            //#1: Emit Director
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);

            //NEXT
            if (this.EmitNodeNext != null)
                this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);

            //END
            this.m_eventActived = false;
        }, Math.max(this.Delay, 0));

        //ONCE
        if (this.Once) {
            //ON-EVENT
            this.node.off(ConstantBase.NODE_EVENT, this.onEvent, this);
            if (this.OnEvent != '')
                director.off(this.OnEvent, this.onEvent, this);

            //ON-COLLISION-EVENT
            if (this.m_eventPhysic) {
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
    } // Re-code onEvent() to fix scheduleOnce & delay events

    //NOTE: Re-Code just once function below

    onEventActive(): void { } // Re-code onEventActive() to active main events

    onEventActiveNode(target: Node): void { target.emit(ConstantBase.NODE_EVENT); } // Re-code onEventActiveNode() to active node events
}