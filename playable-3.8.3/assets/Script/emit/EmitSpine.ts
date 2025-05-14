import { _decorator, CCBoolean, CCFloat, CCString, Collider2D, Contact2DType, director, Node } from 'cc';
import { SpineBase } from '../renderer/SpineBase';
import { EmitBaseFull } from './EmitBaseFull';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitSpine')
export class EmitSpine extends EmitBaseFull {

    @property({ group: { name: 'Main' }, type: CCString })
    AnimStart: string = '';
    @property({ group: { name: 'Main' }, type: CCString })
    AnimLoop: string = '';
    @property({ group: { name: 'Main' }, type: CCFloat })
    AnimLoopDuration: number = 0;
    @property({ group: { name: 'Main' }, type: CCString })
    AnimEnd: string = '';
    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimEndLoop: boolean = false;

    onEvent(): void {
        if (this.m_eventActived)
            return;
        this.m_eventActived = true;

        //DELAY
        this.scheduleOnce(() => {
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

    onEventActiveNode(target: Node): void {
        if (target == null ? true : !target.isValid)
            return;
        let targetSpine = target.getComponent(SpineBase);
        if (targetSpine == null)
            return;
        this.onEventSingle(targetSpine);
    }

    //

    onEventSingle(target: SpineBase) {
        if (target == null ? true : !target.isValid)
            return;
        target.scheduleOnce(() => {
            target.scheduleOnce(() => {
                target.scheduleOnce(() => {
                    this.onEventSingleFinal();
                }, target.onAnimation(this.AnimEnd, this.AnimEndLoop));
            }, Math.max(target.onAnimation(this.AnimLoop, true), this.AnimLoopDuration, 0));
        }, target.onAnimation(this.AnimStart, false));
    }

    onEventSingleFinal() {
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
    }
}