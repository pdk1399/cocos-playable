import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitBase')
export class EmitBase extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    //ON-EVENT
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EmitBase) { return !this.Start; } })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EmitBase) { return !this.Start; } })
    OnEvent: string = '';
    //OPTION-EVENT
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EmitBase) { return !this.Start; } })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    //EMIT-EVENT
    @property({ group: { name: 'Event' }, type: Node })
    EmitNode: Node = null;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onEvent, this);
    }

    protected start(): void {
        if (this.Start)
            this.onEvent();
    }

    // Re-code onEvent() to fix scheduleOnce & delay events
    onEvent(): void {
        //DELAY
        this.scheduleOnce(() => {
            //#0: Emit Active
            this.onEventActive();
            //#1: Emit Node
            if (this.EmitNode != null)
                this.EmitNode.emit(ConstantBase.NODE_EVENT);
            //#2: Emit Director
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }, Math.max(this.Delay, 0));
        //ONCE
        if (this.Once) {
            this.node.off(ConstantBase.NODE_EVENT, this.onEvent, this);
            if (this.OnEvent != '')
                director.off(this.OnEvent, this.onEvent, this);
        }
    }

    // Re-code onEventActive() to active main events
    onEventActive(): void { }
}