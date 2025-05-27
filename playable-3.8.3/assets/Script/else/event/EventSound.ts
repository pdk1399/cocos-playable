import { _decorator, AudioSource, CCBoolean, CCFloat, CCString, Component, director } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EventSound')
export class EventSound extends Component {

    @property({ group: { name: 'Target' }, type: [AudioSource] })
    Target: AudioSource[] = [];

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventSound) { return !this.OnNode; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventSound) { return !this.OnNode && this.OnEvent != ''; } })
    OnEventState: boolean = true;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    protected onLoad(): void {
        if (this.OnNode)
            this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
        else
            director.on(this.OnEvent, this.onEvent, this);
    }

    protected start(): void {
        if (this.Start)
            this.onEvent();
    }

    onEvent(state?: boolean) {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.onEventList(state);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent, state);
        }, Math.max(this.Delay, 0));
        if (this.Once) {
            if (this.OnNode)
                this.node.off(ConstantBase.NODE_EVENT, this.onEvent, this);
            else
                director.off(this.OnEvent, this.onEvent, this);
        }
    }

    onEventList(state?: boolean) {
        this.Target = this.Target.filter(t => t != null);
        this.Target.forEach(target => this.onEventSingle(target, state));
        this.Target = this.Target.filter(t => t != null);
    }

    onEventSingle(target: AudioSource, state?: boolean) {
        if (target == null ? true : !target.isValid)
            return;
        if (state != null ? state : this.OnEventState)
            target.play();
        else
            target.stop();
    }
}