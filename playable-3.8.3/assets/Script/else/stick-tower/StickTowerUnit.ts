import { _decorator, CCBoolean, CCInteger, CCString, Component, Label, Node } from 'cc';
import { SpineBase } from '../../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('StickTowerUnit')
export class StickTowerUnit extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Player: boolean = false;
    @property({ group: { name: 'Main' }, type: CCInteger })
    Point: number = 10;

    @property({ group: { name: 'Anim' }, type: CCString })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Anim' }, type: [CCString] })
    AnimAttack: string[] = [];
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimDead: string = 'dead';

    @property({ group: { name: 'Option' }, type: Label })
    PointLabel: Label = null;

    m_attackIndex: number = 0;

    m_spine: SpineBase = null;

    protected onLoad(): void {
        this.m_spine = this.getComponent(SpineBase);
    }

    protected start(): void {
        this.onPointUpdate();
    }

    onUnitIdle(): number {
        return this.m_spine.onAnimation(this.AnimIdle, true);
    }

    onUnitAttack(): number {
        let duration = this.m_spine.onAnimation(this.AnimAttack[this.m_attackIndex], false);
        this.m_attackIndex++;
        if (this.m_attackIndex > this.AnimAttack.length - 1)
            this.m_attackIndex = 0;
        return duration;
    }

    onUnitDead(): number {
        return this.m_spine.onAnimation(this.AnimDead, false);
    }

    onPointAdd(value: number) {
        this.Point += value;
        if (this.Point < 0)
            this.Point = 0;
        this.onPointUpdate();
    }

    onPointUpdate() {
        this.PointLabel.node.active = this.Point > 0;
        this.PointLabel.string = this.Point.toString();
    }
}