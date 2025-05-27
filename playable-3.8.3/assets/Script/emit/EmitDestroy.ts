import { _decorator, CCBoolean, Component, Node } from 'cc';
import { EmitBaseFull } from './EmitBaseFull';
const { ccclass, property } = _decorator;

@ccclass('EmitDestroy')
export class EmitDestroy extends EmitBaseFull {

    //NOTE: 'displayOrder' count every items (field name, field value, etc) to draw order

    @property({ group: { name: 'Event', displayOrder: 14 }, type: CCBoolean })
    DelayFixed: boolean = true;

    onEventActiveNode(target: Node): void {
        this.scheduleOnce(() => target.destroy(), this.DelayFixed ? 0.02 : 0);
    }
}