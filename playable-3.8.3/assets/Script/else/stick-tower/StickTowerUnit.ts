import { _decorator, CCBoolean, CCString, Component, Node } from 'cc';
import { SpineBase } from '../../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('StickTowerUnit')
export class StickTowerUnit extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Player: boolean = false;

    @property({ group: { name: 'Anim' }, type: CCString })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimAttack: string = 'attack';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimDead: string = 'dead';

    m_spine: SpineBase = null;

    protected onLoad(): void {
        this.m_spine = this.getComponent(SpineBase);
    }

    onUnitIdle(): number {
        return this.m_spine.onAnimation(this.AnimIdle, true);
    }

    onUnitAttack(): number {
        return this.m_spine.onAnimation(this.AnimAttack, false);
    }

    onUnitDead(): number {
        return this.m_spine.onAnimation(this.AnimDead, false);
    }
}