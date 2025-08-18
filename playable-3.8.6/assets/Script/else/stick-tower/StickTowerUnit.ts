import { _decorator, CCBoolean, CCInteger, CCString, Component, Label, Node } from 'cc';
import { SpineBase } from '../../renderer/SpineBase';
import { BodyPoint } from '../../body/option/BodyPoint';
const { ccclass, property } = _decorator;

@ccclass('StickTowerUnit')
export class StickTowerUnit extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Player: boolean = false;

    @property({ group: { name: 'Anim' }, type: CCString })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Anim' }, type: [CCString] })
    AnimAttack: string[] = [];
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimDead: string = 'dead';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimWin: string = 'win';

    m_attackIndex: number = 0;

    m_spine: SpineBase = null;
    m_point: BodyPoint = null;

    protected onLoad(): void {
        this.m_spine = this.getComponent(SpineBase);
        this.m_point = this.getComponent(BodyPoint);
    }

    //ANIM

    onUnitIdle(): number {
        return this.m_spine.onAnimationForce(this.AnimIdle, true);
    }

    onUnitAttack(): number {
        let duration = this.m_spine.onAnimationForce(this.AnimAttack[this.m_attackIndex], false);
        this.m_attackIndex++;
        if (this.m_attackIndex > this.AnimAttack.length - 1)
            this.m_attackIndex = 0;
        return duration;
    }

    onUnitDead(): number {
        return this.m_spine.onAnimationForce(this.AnimDead, false);
    }

    onUnitWin(): number {
        return this.m_spine.onAnimationForce(this.AnimWin, false);
    }
}