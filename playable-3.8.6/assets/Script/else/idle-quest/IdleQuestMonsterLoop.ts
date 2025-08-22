import { _decorator, CCFloat, Component, director, Node } from 'cc';
import { BodyBase } from '../../body/BodyBase';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('IdleQuestMonsterLoop')
export class IdleQuestMonsterLoop extends Component {

    @property({ type: Node })
    BodyMonster: BodyBase = null;

    @property({ type: Node })
    EventAttackLoop: Node = null;

    @property({ type: CCFloat })
    EventDelayLoop: number = 1;

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_EVENT, this.onMonsterLoop, this);
    }

    private onMonsterLoop(): void {
        if (this.BodyMonster.m_dead) {
            //Do something
            return;
        }
        this.EventAttackLoop.emit(ConstantBase.NODE_EVENT);
        this.scheduleOnce(() => this.onMonsterLoop(), this.EventDelayLoop);
    }
}