import { _decorator, CCBoolean, CCFloat, CCString, Collider2D, Contact2DType, director, Node } from 'cc';
import { SpineBase } from '../renderer/SpineBase';
import { EmitBaseNode } from './base/EmitBaseNode';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitSpine')
export class EmitSpine extends EmitBaseNode {

    @property({ group: { name: 'Main' }, type: CCString })
    AnimStart: string = '';
    @property({ group: { name: 'Main' }, type: CCString, visible(this: EmitSpine) { return this.AnimStart != ''; } })
    AnimLoop: string = '';
    @property({ group: { name: 'Main' }, type: CCFloat, visible(this: EmitSpine) { return this.AnimStart != '' && this.AnimLoop != ''; } })
    AnimDelay: number = 0;
    @property({ group: { name: 'Main' }, type: CCString, visible(this: EmitSpine) { return this.AnimStart != '' && this.AnimLoop != ''; } })
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
        this.onEventOnceCheck();
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
        if (this.AnimStart == '')
            return;
        if (this.AnimLoop != '' && this.AnimEnd != '') {
            target.scheduleOnce(() => {
                target.scheduleOnce(() => {
                    target.scheduleOnce(() => {
                        this.onEventSingleFinal();
                    }, target.onAnimation(this.AnimEnd, this.AnimEndLoop));
                }, Math.max(target.onAnimation(this.AnimLoop, true), this.AnimDelay, 0));
            }, target.onAnimation(this.AnimStart, false));
        }
        if (this.AnimLoop != '') {
            target.scheduleOnce(() => {
                target.scheduleOnce(() => {
                    this.onEventSingleFinal();
                }, Math.max(target.onAnimation(this.AnimLoop, this.AnimEndLoop), this.AnimDelay, 0));
            }, target.onAnimation(this.AnimStart, false));
        }
        else
            target.scheduleOnce(() => this.onEventSingleFinal(), target.onAnimation(this.AnimStart, this.AnimEndLoop));
    }

    onEventSingleFinal() {
        //#0: Emit Active
        this.onEventActive();

        //#1: Emit Director
        this.EmitEvent.forEach(event => {
            if (event != '') {
                director.emit(event);
            }
        });

        //NEXT
        if (this.EmitNodeNext != null)
            this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);

        //END
        this.m_eventActived = false;
    }
}