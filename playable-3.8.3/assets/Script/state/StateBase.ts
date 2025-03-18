import { _decorator, CCBoolean, CCFloat, CCString, Component, director } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('StateBase')
export class StateBase extends Component {

    //NOTE: This script focus on TRUE & FALSE event(s)

    @property({ group: { name: 'Main' }, type: CCBoolean })
    State: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Lock: boolean = false;

    @property({ group: { name: 'Event' }, type: CCString })
    OnState: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    OnStateOn: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    OnStateOff: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    OnStateChange: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: StateBase) { return this.Delay <= 0; } })
    DelayOnceFarme: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitState: string = '';

    @property({ group: { name: 'Lock' }, type: CCString })
    OnLock: string = '';
    @property({ group: { name: 'Lock' }, type: CCString })
    OnLockOn: string = '';
    @property({ group: { name: 'Lock' }, type: CCString })
    OnLockOff: string = '';
    @property({ group: { name: 'Lock' }, type: CCString })
    EmitLock: string = '';

    m_stateDelay: boolean = false;

    //

    protected onLoad(): void {
        if (this.OnState != '')
            director.on(this.OnStateOn, this.onState, this);
        if (this.OnStateOn != '')
            director.on(this.OnStateOn, this.onStateOn, this);
        if (this.OnStateOff != '')
            director.on(this.OnStateOff, this.onStateOff, this);
        if (this.OnStateChange != '')
            director.on(this.OnStateChange, this.onStateChange, this);

        if (this.OnLock != '')
            director.on(this.OnLock, this.onLock, this);
        if (this.OnLockOn != '')
            director.on(this.OnLockOn, this.onLockOn, this);
        if (this.OnLockOff != '')
            director.on(this.OnLockOff, this.onLockOff, this);
    }

    //

    onState(state: boolean) {
        if (this.m_stateDelay || this.Lock || this.State == state)
            return;
        this.m_stateDelay = true;
        if (this.Delay <= 0 && !this.DelayOnceFarme) {
            this.scheduleOnce(() => this.m_stateDelay = false, 0);
            this.State = state;
            this.node.emit(ConstantBase.NODE_STATE, this.State);
            if (this.EmitState != '')
                director.emit(this.EmitState, this.State);
        }
        else {
            this.scheduleOnce(() => {
                this.scheduleOnce(() => this.m_stateDelay = false, 0);
                this.State = state;
                this.node.emit(ConstantBase.NODE_STATE, this.State);
                if (this.EmitState != '')
                    director.emit(this.EmitState, this.State);
            }, Math.max(this.Delay, 0));
        }
        if (this.Once) {
            if (this.OnState != '')
                director.off(this.OnStateOn, this.onState, this);
            if (this.OnStateOn != '')
                director.off(this.OnStateOn, this.onStateOn, this);
            if (this.OnStateOff != '')
                director.off(this.OnStateOff, this.onStateOff, this);
            if (this.OnStateChange != '')
                director.off(this.OnStateChange, this.onStateChange, this);

            if (this.OnLock != '')
                director.off(this.OnLock, this.onLock, this);
            if (this.OnLockOn != '')
                director.off(this.OnLockOn, this.onLockOn, this);
            if (this.OnLockOff != '')
                director.off(this.OnLockOff, this.onLockOff, this);
        }
    }

    protected onStateOn() {
        this.onState(true);
    }

    protected onStateOff() {
        this.onState(false);
    }

    protected onStateChange() {
        this.onState(!this.State);
    }

    //

    onLock(lock: boolean) {
        if (this.Lock == lock)
            return;

        this.Lock = lock;
        this.node.emit(ConstantBase.NODE_STATE_LOCK, this.Lock);
        if (this.EmitLock != '')
            director.emit(this.EmitLock, this.Lock);
    }

    protected onLockOn() {
        this.onLock(true);
    }

    protected onLockOff() {
        this.onLock(false);
    }
}