import { _decorator, CCBoolean, Collider2D, director, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { EmitBaseEvent } from './EmitBaseEvent';
const { ccclass, property } = _decorator;

//Extends this class to create unique event with focus on node events executed

@ccclass('EmitBaseNode')
export class EmitBaseNode extends EmitBaseEvent {

    @property({ group: { name: 'Event', displayOrder: 16 }, type: [Node] })
    EmitNode: Node[] = [];
    //EMIT-COLLISION-EVENT
    @property({ group: { name: 'Event', displayOrder: 18 }, type: CCBoolean, visible(this: EmitBaseNode) { return !this.Start && this.getComponent(RigidBody2D) != null; } })
    EmitTagTarget: boolean = false;

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let tagTargetIndex = this.OnTagTarget.findIndex((t) => t == otherCollider.tag);
        if (tagTargetIndex < 0) {
            let nodeTargetIndex = this.OnNodeTarget.findIndex((t) => t == otherCollider.node);
            if (nodeTargetIndex < 0)
                return;
        }

        //TARGET
        if (this.EmitTagTarget) {
            let targetExistIndex = this.m_targetCollide.findIndex((t) => t == otherCollider.node);
            if (targetExistIndex < 0)
                this.m_targetCollide.push(otherCollider.node);
        }

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
            this.EmitEvent.forEach(event => {
                if (event != '') {
                    director.emit(event);
                }
            });

            //#2: Emit Node
            this.EmitNode.forEach(t => {
                if (t != null) {
                    this.onEventActiveNode(t);
                }
            });

            //#3: Emit Node Target
            if (this.m_eventPhysic && this.EmitTagTarget) {
                this.m_targetCollide.forEach(t => {
                    if (t != null) {
                        this.onEventActiveNode(t);
                    }
                });
                this.m_targetCollide.splice(0, this.m_targetCollide.length); //Reset all targets collide
            }

            //NEXT
            if (this.EmitNodeNext != null)
                this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);

            //END
            this.m_eventActived = false;
        }, Math.max(this.Delay, 0));

        //ONCE
        this.onEventOnceCheck();
    } // Re-code onEvent() to fix scheduleOnce & delay events

    onEventActiveNode(target: Node): void { target.emit(ConstantBase.NODE_EVENT); } // Re-code onEventActiveNode() to active node events
}