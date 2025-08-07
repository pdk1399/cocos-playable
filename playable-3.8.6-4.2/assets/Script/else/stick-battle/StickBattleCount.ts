import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StickBattleCount')
export class StickBattleCount extends Component {

    @property(Label)
    label: Label = null;

    m_count: number = 0;

    UnitCountAdd(value: number): void {
        this.m_count += value;
        this.label.string = this.m_count.toString();
    }
}