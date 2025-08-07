import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Input, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('UiPressEvent')
export class UiPressEvent extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = true;

    @property({ group: { name: 'Event' }, type: CCFloat })
    DelayStart: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitStart: string = '';
    @property({ group: { name: 'Event' }, type: Node })
    EmitNodeStart: Node = null;

    @property({ group: { name: 'Event' }, type: CCFloat })
    DelayEnd: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEnd: string = '';
    @property({ group: { name: 'Event' }, type: Node })
    EmitNodeEnd: Node = null;

    protected onLoad(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onPressStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onPressEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onPressEnd, this);
    }

    onPressStart() {
        this.scheduleOnce(() => {
            if (this.EmitStart != '')
                director.emit(this.EmitStart);
            if (this.EmitNodeStart != null)
                this.EmitNodeStart.emit(ConstantBase.NODE_EVENT);
        }, this.DelayStart);
    }

    onPressEnd() {
        this.scheduleOnce(() => {
            if (this.EmitEnd != '')
                director.emit(this.EmitEnd);
            if (this.EmitNodeEnd != null)
                this.EmitNodeEnd.emit(ConstantBase.NODE_EVENT);
        }, this.DelayEnd);
        if (this.Once) {
            this.node.off(Input.EventType.TOUCH_START, this.onPressStart, this);
            this.node.off(Input.EventType.TOUCH_END, this.onPressEnd, this);
            this.node.off(Input.EventType.TOUCH_CANCEL, this.onPressEnd, this);
        }
    }
}