import { _decorator, CCBoolean, CCFloat, CCInteger, Component, Enum, Node } from 'cc';
import { EmitBaseEvent } from './EmitBaseEvent';
import { EaseType } from '../ConstantBase';
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

    m_valueA: any = null;
    m_valueB: any = null;

    protected onLoad(): void {
        super.onLoad();
        if (this.EmitNode == null)
            this.EmitNode = this.node;
    }

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
}