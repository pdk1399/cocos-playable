import { _decorator, CCFloat, Component, director, Node } from 'cc';
import { BodyBase } from '../../body/BodyBase';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('IdleQuestMonsterLoop')
export class IdleQuestMonsterLoop extends Component {

    @property({ type: BodyBase })
    BodyMonster: BodyBase = null;

    @property({ type: Node })
    EventAttackLoop: Node = null;

    @property({ type: Node })
    EventBodyDead: Node = null;

    @property({ type: CCFloat })
    DelayAttack: number = 2;

    protected onLoad(): void {
        director.on(ConstantBase.GAME_LOSE, this.onGameLose, this);
        director.on(ConstantBase.GAME_TIME_OUT, this.onGameLose, this);

        this.node.on(ConstantBase.NODE_EVENT, this.onMonsterLoop, this);
    }

    private onGameLose(): void {
        this.unscheduleAllCallbacks();
    }

    private onMonsterLoop(): void {
        if (this.BodyMonster.m_dead) {
            this.EventBodyDead.emit(ConstantBase.NODE_EVENT);
            return;
        }
        this.EventAttackLoop.emit(ConstantBase.NODE_EVENT);
        this.scheduleOnce(() => this.onMonsterLoop(), this.DelayAttack);
    }
}