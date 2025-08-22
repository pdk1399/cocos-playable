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

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_EVENT, this.onPlayerLoop, this);
    }

    private onPlayerLoop(): void {
        if (this.BodyPlayer.m_dead) {
            director.emit(ConstantBase.GAME_LOSE);
            return;
        }
        this.EventAttackLoop.emit(ConstantBase.NODE_EVENT);
        this.scheduleOnce(() => this.onPlayerLoop(), this.EventDelayLoop);
    }
}