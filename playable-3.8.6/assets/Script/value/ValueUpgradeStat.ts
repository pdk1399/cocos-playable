import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ValueUpgradeStat')
export class ValueUpgradeStat extends Component {

    @property({ group: { name: 'Show' }, type: Label })
    LabelCost: Label = null;
}