import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Input, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('UiPressEvent')
export class UiPressEvent extends Component {

    @property({ type: CCBoolean })
    Once: boolean = true;

    @property({ type: CCString })
    EmitStart: string = '';
    @property({ type: Node })
    EmitNodeStart: Node = null;

    @property({ type: CCString })
    EmitEnd: string = '';
    @property({ type: Node })
    EmitNodeEnd: Node = null;

    protected onLoad(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onPressStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onPressEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onPressEnd, this);
    }

    onPressStart() {
        if (this.EmitStart != '')
            director.emit(this.EmitStart);
        if (this.EmitNodeStart != null)
            this.EmitNodeStart.emit(ConstantBase.NODE_EVENT);
    }

    onPressEnd() {
        if (this.EmitEnd != '')
            director.emit(this.EmitEnd);
        if (this.EmitNodeEnd != null)
            this.EmitNodeEnd.emit(ConstantBase.NODE_EVENT);
        if (this.Once) {
            this.node.off(Input.EventType.TOUCH_START, this.onPressStart, this);
            this.node.off(Input.EventType.TOUCH_END, this.onPressEnd, this);
            this.node.off(Input.EventType.TOUCH_CANCEL, this.onPressEnd, this);
        }
    }
}