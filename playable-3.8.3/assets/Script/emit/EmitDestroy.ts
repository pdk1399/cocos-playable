import { _decorator, Node } from 'cc';
import { EmitBaseFull } from './EmitBaseFull';
const { ccclass, property } = _decorator;

@ccclass('EmitDestroy')
export class EmitDestroy extends EmitBaseFull {

    onEventActiveNode(target: Node): void {
        this.scheduleOnce(() => target.destroy(), 0.02);
    }
}