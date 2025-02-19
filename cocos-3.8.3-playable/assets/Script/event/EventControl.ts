import { _decorator, CCBoolean, CCFloat, CCString, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EventControl')
export class EventControl extends Component {

    @property({ group: { name: 'Target' }, type: [Node] })
    Target: Node[] = [];

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventControl) { return !this.OnNode; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Option' }, type: CCBoolean })
    ControlByNode: boolean = true;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode; } })
    ControlSleep: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode && !this.ControlSleep; } })
    ControlRelease: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode && !this.ControlSleep && !this.ControlRelease; } })
    ControlReleaseX: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode && !this.ControlSleep && !this.ControlRelease; } })
    ControlReleaseY: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseX; } })
    ControlLeft: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseX; } })
    ControlRight: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseY; } })
    ControlUp: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseY; } })
    ControlDown: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseY; } })
    ControlJump: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode; } })
    ControlAttack: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode; } })
    ControlInteraction: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean, visible(this: EventControl) { return this.ControlByNode && !this.ControlSleep; } })
    ControlFixed: boolean = false;

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

    onEvent() {
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

        if (this.ControlByNode) {
            director.emit(ConstantBase.CONTROL_LOCK);
            target.emit(ConstantBase.NODE_CONTROL_NODE, true);
            target.emit(ConstantBase.NODE_CONTROL_DIRECTOR, false);
        }
        else {
            director.emit(ConstantBase.CONTROL_RESUME);
            target.emit(ConstantBase.NODE_CONTROL_NODE, false);
            target.emit(ConstantBase.NODE_CONTROL_DIRECTOR, true);
            return;
        }

        if (this.ControlSleep) {
            target.emit(ConstantBase.BODY_SLEEP);
            return;
        }
        else
            target.emit(ConstantBase.BODY_AWAKE);

        if (this.ControlJump)
            target.emit(ConstantBase.CONTROL_JUMP);

        if (this.ControlRelease)
            target.emit(ConstantBase.CONTROL_RELEASE);
        else {
            if (this.ControlReleaseX)
                target.emit(ConstantBase.CONTROL_RELEASE_X);
            else {
                if (this.ControlLeft)
                    target.emit(ConstantBase.CONTROL_LEFT);
                if (this.ControlRight)
                    target.emit(ConstantBase.CONTROL_RIGHT);
            }

            if (this.ControlReleaseY)
                target.emit(ConstantBase.CONTROL_RELEASE_Y);
            else {
                if (this.ControlUp)
                    target.emit(ConstantBase.CONTROL_UP);
                if (this.ControlDown)
                    target.emit(ConstantBase.CONTROL_DOWN);
            }
        }

        if (this.ControlAttack)
            target.emit(ConstantBase.CONTROL_ATTACK);

        if (this.ControlInteraction)
            target.emit(ConstantBase.CONTROL_INTERACTION);

        if (this.ControlFixed)
            target.emit(ConstantBase.CONTROL_FIXED);
    }
}