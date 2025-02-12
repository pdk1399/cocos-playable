import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EventDestroy')
export class EventDestroy extends Component {

    @property({ group: { name: 'Target' }, type: [Node] })
    Target: Node[] = [];

    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventDestroy) { return !this.OnNode; } })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventDestroy) { return !this.Start; } })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventDestroy) { return !this.Start && !this.OnNode; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventDestroy) { return !this.Start && !this.OnNode; } })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    protected onLoad(): void {
        if (this.Start)
            return;
        if (this.OnNode)
            this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
        else
            director.on(this.OnEvent, this.onEvent, this);
    }

    protected start(): void {
        if (this.Start)
            this.onEvent();
    }

    onEvent() {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.onEventList();
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }, Math.max(this.Delay, 0));
        if (this.Once) {
            if (this.OnNode)
                this.node.off(ConstantBase.NODE_EVENT, this.onEvent, this);
            else
                director.off(this.OnEvent, this.onEvent, this);
        }
    }

    onEventList() {
        this.Target = this.Target.filter(t => t != null);
        this.Target.forEach(target => this.onEventSingle(target));
        this.Target = this.Target.filter(t => t != null);
    }

    onEventSingle(target: Node) {
        if (target == null ? true : !target.isValid)
            return;
        target.destroy();
    }
}