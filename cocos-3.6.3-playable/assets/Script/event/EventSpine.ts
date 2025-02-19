import { _decorator, CCBoolean, CCFloat, CCString, Component, director } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { SpineBase } from '../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('EventSpine')
export class EventSpine extends Component {

    @property({ group: { name: 'Target' }, type: [SpineBase] })
    Target: SpineBase[] = [];

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventSpine) { return !this.OnNode; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean })
    DelayEndAnim: boolean = true;
    @property({ group: { name: 'Event' }, type: CCFloat })
    DelayEnd = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEventEnd: string = '';

    @property({ group: { name: 'Main' }, type: CCString })
    AnimStart: string = '';
    @property({ group: { name: 'Main' }, type: CCString })
    AnimLoop: string = '';
    @property({ group: { name: 'Main' }, type: CCFloat })
    AnimLoopDuration: number = 0;
    @property({ group: { name: 'Main' }, type: CCString })
    AnimEnd: string = '';
    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimEndLoop: boolean = false;

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

    onEventSingle(target: SpineBase) {
        if (target == null ? true : !target.isValid)
            return;
        this.onEventSingleStart(target);
    }

    protected onEventSingleStart(target: SpineBase) {
        if (target == null ? true : !target.isValid)
            return;
        if (this.AnimLoop == '' && !this.DelayEndAnim) {
            this.scheduleOnce(() => {
                //Final
                if (this.EmitEventEnd != '')
                    director.emit(this.EmitEventEnd);
            }, this.DelayEnd)
        }
        target.scheduleOnce(() => {
            if (this.AnimLoop == '' && this.DelayEndAnim) {
                this.scheduleOnce(() => {
                    //Final
                    if (this.EmitEventEnd != '')
                        director.emit(this.EmitEventEnd);
                }, this.DelayEnd)
            }
            else {
                //Continue
                this.onEventSingleLoop(target);
            }
        }, target.onAnimationForceUnSave(this.AnimStart, this.AnimLoop == '' ? this.AnimEndLoop : false));
    }

    protected onEventSingleLoop(target: SpineBase) {
        if (target == null ? true : !target.isValid)
            return;
        if (this.AnimEnd == '' && !this.DelayEndAnim) {
            this.scheduleOnce(() => {
                //Final
                if (this.EmitEventEnd != '')
                    director.emit(this.EmitEventEnd);
            }, this.DelayEnd)
        }
        target.scheduleOnce(() => {
            if (this.AnimEnd == '' && this.DelayEndAnim) {
                this.scheduleOnce(() => {
                    //Final
                    if (this.EmitEventEnd != '')
                        director.emit(this.EmitEventEnd);
                }, this.DelayEnd)
            }
            else {
                //Continue
                this.onEventSingleEnd(target);
            }
        }, Math.max(target.onAnimationForceUnSave(this.AnimLoop, this.AnimEnd == '' ? this.AnimEndLoop : false), this.AnimLoopDuration, 0));
    }

    protected onEventSingleEnd(target: SpineBase) {
        if (target == null ? true : !target.isValid)
            return;
        if (!this.DelayEndAnim) {
            this.scheduleOnce(() => {
                //Final
                if (this.EmitEventEnd != '')
                    director.emit(this.EmitEventEnd);
            }, this.DelayEnd)
        }
        target.scheduleOnce(() => {
            if (this.DelayEndAnim) {
                this.scheduleOnce(() => {
                    //Final
                    if (this.EmitEventEnd != '')
                        director.emit(this.EmitEventEnd);
                }, this.DelayEnd)
            }
        }, target.onAnimationForceUnSave(this.AnimEnd, this.AnimEndLoop));
    }
}