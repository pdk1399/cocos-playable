import { _decorator, CCBoolean, CCFloat, CCString, Color, Component, director, Enum, Node, sp } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

export enum TargetType {
    Node,
    Spine,
    SpineColor,
}
Enum(TargetType);

@ccclass('EventActive')
export class EventActive extends Component {

    @property({ group: { name: 'Target' }, type: CCBoolean })
    TargetStart: boolean = false;
    @property({ group: { name: 'Target' }, type: CCBoolean, visible(this: EventActive) { return this.TargetStart; } })
    TargetStartState: boolean = false;
    @property({ group: { name: 'Target' }, type: [Node] })
    Target: Node[] = [];

    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventActive) { return !this.OnNode; } })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventActive) { return !this.OnNode; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventActive) { return !this.OnNode && this.OnEvent != ''; } })
    OnEventState: boolean = true;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventActive) { return !this.OnNode; } })
    OnEventOn: string = '';
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventActive) { return !this.OnNode; } })
    OnEventOff: string = '';
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventActive) { return !this.OnNode; } })
    OnEventRevert: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventActive) { return !this.OnNode; } })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Option' }, type: TargetType })
    TargetType: TargetType = TargetType.Node;

    protected onLoad(): void {
        if (this.OnNode)
            this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
        else {
            director.on(this.OnEvent, this.onEvent, this);
            director.on(this.OnEventOn, this.onEventOn, this);
            director.on(this.OnEventOff, this.onEventOff, this);
            director.on(this.OnEventRevert, this.onEventRevert, this);
        }
    }

    protected start(): void {
        if (this.TargetStart)
            this.onEventList(this.TargetStartState);
        if (this.Start)
            this.onEvent();
    }

    onEvent(state?: boolean) {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.onEventList(state);
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

    onEventOn() {
        this.onEvent(true);
    }

    onEventOff() {
        this.onEvent(false);
    }

    onEventRevert() {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.onEventListRevert();
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

    onEventList(state?: boolean) {
        this.Target = this.Target.filter(t => t != null);
        this.Target.forEach(target => this.onEventSingle(target, state));
        this.Target = this.Target.filter(t => t != null);
    }

    onEventListRevert() {
        this.Target = this.Target.filter(t => t != null);
        this.Target.forEach(target => {
            this.onEventSingleRevert(target);
        });
        this.Target = this.Target.filter(t => t != null);
    }

    onEventSingle(target: Node, state?: boolean) {
        if (target == null ? true : !target.isValid)
            return;
        switch (this.TargetType) {
            case TargetType.Node:
                target.active = state != null ? state : this.OnEventState;
                break;
            case TargetType.Spine:
                {
                    let targetSpine = target.getComponent(sp.Skeleton);
                    targetSpine.enabled = state;
                }
                break;
            case TargetType.SpineColor:
                {
                    let targetSpine = target.getComponent(sp.Skeleton);
                    let targetSpineColor = targetSpine.color;
                    targetSpineColor.set(targetSpineColor.r, targetSpineColor.g, targetSpineColor.b, state ? 255 : 0);
                    targetSpine.color = targetSpineColor;
                }
                break;
        }
    }

    onEventSingleRevert(target: Node) {
        if (target == null ? true : !target.isValid)
            return;
        switch (this.TargetType) {
            case TargetType.Node:
                target.active = !target.active;
                break;
            case TargetType.Spine:
                {
                    let targetSpine = target.getComponent(sp.Skeleton);
                    targetSpine.enabled = !targetSpine.enabled;
                }
                break;
            case TargetType.SpineColor:
                {
                    let targetSpine = target.getComponent(sp.Skeleton);
                    let targetSpineColor = targetSpine.color;
                    targetSpineColor.set(targetSpineColor.r, targetSpineColor.g, targetSpineColor.b, targetSpineColor.a != 255 ? 255 : 0);
                    targetSpine.color = targetSpineColor;
                }
                break;
        }
    }
}