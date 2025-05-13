import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node } from 'cc';
import { EmitBase } from './EmitBase';
import { SpineBase } from '../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('EmitSpine')
export class EmitSpine extends EmitBase {

    @property({ group: { name: 'Event' }, type: CCString })
    EmitEventFinal: string = '';

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
                    if (this.EmitEventFinal != '')
                        director.emit(this.EmitEventFinal);
                }, target.onAnimation(this.AnimEnd, this.AnimEndLoop));
            }, Math.max(target.onAnimation(this.AnimLoop, true), this.AnimLoopDuration, 0));
        }, target.onAnimation(this.AnimStart, false));
    }
}