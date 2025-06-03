import { _decorator, Node } from 'cc';
import { EmitBaseNode } from './EmitBaseNode';
const { ccclass, property } = _decorator;

@ccclass('EmitDestroy')
export class EmitDestroy extends EmitBaseNode {

    onEventActiveNode(target: Node): void {
        this.scheduleOnce(() => target.destroy(), 0.02);
    }
}