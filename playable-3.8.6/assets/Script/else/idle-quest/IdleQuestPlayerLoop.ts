import { _decorator, CCFloat, Component, director, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { BodyBase } from '../../body/BodyBase';
const { ccclass, property } = _decorator;

@ccclass('IdleQuestPlayerLoop')
export class IdleQuestPlayerLoop extends Component {

    @property({ type: BodyBase })
    BodyPlayer: BodyBase = null;

    @property({ type: Node })
    EventAttackLoop: Node = null;

    @property({ type: CCFloat })
    EventDelayLoop: number = 1;

    @property({ type: Node })
    MonsterGroup: Node = null;

    m_monsterDead: number = 0;

    protected onLoad(): void {
        director.on(ConstantBase.GAME_LOSE, this.onGameLose, this);
        director.on(ConstantBase.GAME_TIME_OUT, this.onGameLose, this);

        this.node.on(ConstantBase.NODE_EVENT, this.onPlayerLoop, this);

        this.BodyPlayer.node.on(ConstantBase.NODE_BODY_DEAD, this.onPlayerDead, this);

        this.MonsterGroup.children.forEach(monster => {
            monster.on(ConstantBase.NODE_BODY_DEAD, this.onMonsterDead, this);
        });
    }

    private onGameLose(): void {
        this.unscheduleAllCallbacks();
        this.EventAttackLoop.emit(ConstantBase.NODE_EVENT_STOP);
    }

    private onPlayerLoop(): void {
        this.EventAttackLoop.emit(ConstantBase.NODE_EVENT);
        this.scheduleOnce(() => this.onPlayerLoop(), this.EventDelayLoop);
    }

    private onPlayerDead() {
        this.unscheduleAllCallbacks();
        this.EventAttackLoop.emit(ConstantBase.NODE_EVENT_STOP);
        director.emit(ConstantBase.GAME_LOSE);
    }

    private onMonsterDead() {
        this.m_monsterDead++;
        if (this.m_monsterDead >= this.MonsterGroup.children.length) {
            this.unscheduleAllCallbacks();
            this.EventAttackLoop.emit(ConstantBase.NODE_EVENT_STOP);
        }
    }
}