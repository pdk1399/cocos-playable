import { _decorator, CCBoolean, CCFloat, CCInteger, Component, director, Enum, Node, Tween, tween } from 'cc';
import { EmitBaseEvent } from '../base/EmitBaseEvent';
import { ConstantBase, EaseType } from '../../ConstantBase';
const { ccclass, property } = _decorator;

export enum TweenType {
    Once,
    PingPong,
    Restart,
}
Enum(TweenType);

export enum ValueType {
    Directly,
    Offset,
}
Enum(ValueType);

@ccclass('EmitTween')
export class EmitTween extends EmitBaseEvent {

    @property({ group: { name: 'Event', displayOrder: 16 }, type: Node })
    EmitNode: Node = null;

    @property({ group: { name: 'Main', displayOrder: 2 }, type: TweenType })
    Progress: TweenType = TweenType.Once;
    @property({ group: { name: 'Main', displayOrder: 4 }, type: CCInteger, visible(this: EmitTween) { return this.Progress > TweenType.Once; } })
    Limit: number = 1;
    @property({ group: { name: 'Main', displayOrder: 6 }, type: ValueType })
    To: ValueType = ValueType.Directly;
    //VALUE CUSTOM
    @property({ group: { name: 'Main', displayOrder: 100 }, type: CCFloat })
    Duration: number = 1;
    @property({ group: { name: 'Main', displayOrder: 102 }, type: EaseType })
    Ease: EaseType = EaseType.linear;
    @property({ group: { name: 'Main', displayOrder: 104 }, type: CCBoolean })
    Fixed: boolean = true;
    //COMPLETE
    @property({ group: { name: 'Main', displayOrder: 99999 }, type: CCBoolean, visible(this: EmitTween) { return this.Progress == TweenType.Once || this.Limit > 0; } })
    CompleteDestroy: boolean = false;

    @property({ group: { name: 'Option' }, type: CCBoolean })
    OnScene: boolean = true;

    m_valueA: any = null;
    m_valueB: any = null;

    protected onLoad(): void {
        super.onLoad();

        this.node.on(ConstantBase.NODE_TWEEN_STOP, this.onTweenStop, this);
        this.node.on(ConstantBase.NODE_TWEEN_PLAY, this.onTweenPlay, this);

        if (this.OnScene) {
            director.on(ConstantBase.SCENE_STOP, this.onTweenStop, this);
            director.on(ConstantBase.SCENE_PLAY, this.onTweenPlay, this);
        }
    }

    protected start(): void {
        if (this.EmitNode == null)
            this.EmitNode = this.node;
        super.start();
    }

    onTweenStop(): void {
        Tween.pauseAllByTarget(this.EmitNode);
    }

    onTweenPlay(): void {
        Tween.resumeAllByTarget(this.EmitNode);
    }

    onEvent(): void {
        if (!this.enabledInHierarchy)
            //Not do event when not active in hierarchy
            return;

        //DELAY
        this.scheduleOnce(() => {
            //#0: Emit Active
            this.onEventActive();
        }, Math.max(this.Delay, 0));

        //ONCE
        this.onEventOnceCheck();
    } // Re-code onEvent() to fix scheduleOnce & delay events

    onEventActive(): void {
        switch (this.Progress) {
            case TweenType.Once:
                this.onTweenOnce(this.EmitNode);
                break;
            case TweenType.PingPong:
                this.onTweenPingPong(this.EmitNode);
                break;
            case TweenType.Restart:
                this.onTweenRestart(this.EmitNode);
                break;
        }
    }

    onTweenOnce(target: Node): void { }
    onTweenPingPong(target: Node): void { }
    onTweenRestart(target: Node): void { }

    onTweenComplete() {
        //#1: Emit Director
        this.EmitEvent.forEach(event => {
            if (event != '')
                director.emit(event);
        });

        //NEXT
        if (this.EmitNodeNext != null)
            this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);
    }
}