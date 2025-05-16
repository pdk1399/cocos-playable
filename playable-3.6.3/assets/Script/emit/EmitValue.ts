import { _decorator, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { EmitBase } from './EmitBase';
const { ccclass, property } = _decorator;

@ccclass('EmitValue')
export class EmitValue extends EmitBase {

    onEventActive(): void {
        this.node.emit(ConstantBase.NODE_VALUE);
    }
}