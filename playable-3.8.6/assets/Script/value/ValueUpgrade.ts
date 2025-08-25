import { _decorator, CCInteger, Component, Enum, Input, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

enum UpgradeType {
    Add,
    Muti,
}
Enum(UpgradeType);

@ccclass('ValueUpgrade')
export class ValueUpgrade extends Component {

    @property({ group: { name: 'Main' }, type: CCInteger })
    Level: number = 1;
    @property({ group: { name: 'Main' }, type: Label })
    LabelLevel: Label = null;

    @property({ group: { name: 'Main' }, type: CCInteger })
    Stat: number = 1;
    @property({ group: { name: 'Main' }, type: UpgradeType })
    StatType: UpgradeType = UpgradeType.Add;
    @property({ group: { name: 'Main' }, type: CCInteger })
    StatUpgrade: number = 1;
    @property({ group: { name: 'Main' }, type: CCInteger })
    StatMuti: number = 100;
    @property({ group: { name: 'Main' }, type: Label })
    LabelStat: Label = null;

    @property({ group: { name: 'Cost' }, type: CCInteger })
    Cost: number = 5;
    @property({ group: { name: 'Cost' }, type: UpgradeType })
    CostType: UpgradeType = UpgradeType.Add;
    @property({ group: { name: 'Cost' }, type: CCInteger })
    CostUpgrade: number = 5;
    @property({ group: { name: 'Cost' }, type: CCInteger })
    CostMuti: number = 100;
    @property({ group: { name: 'Cost' }, type: Label })
    LabelCost: Label = null;

    @property({ group: { name: 'Button' }, type: Node })
    UiButton: Node = null;
    @property({ group: { name: 'Button' }, type: Node })
    UiButtonOn: Node = null;
    @property({ group: { name: 'Button' }, type: Node })
    UiButtonOff: Node = null;

    protected onLoad(): void {
        this.UiButton.on(Input.EventType.TOUCH_START, this.onPressUpgrade, this);
    }

    protected start(): void {
        if (this.LabelLevel != null)
            this.LabelLevel.string = this.Level.toString();
        if (this.LabelStat != null)
            this.LabelStat.string = (this.Stat * this.StatMuti).toString();
        if (this.LabelCost != null)
            this.LabelCost.string = (this.Cost * this.CostMuti).toString();
    }

    onPressUpgrade() {
        //Level
        this.Level++;
        if (this.LabelLevel != null)
            this.LabelLevel.string = this.Level.toString();
        //Stat
        switch (this.StatType) {
            case UpgradeType.Add:
                this.Stat += this.StatUpgrade;
                break;
            case UpgradeType.Muti:
                this.Stat *= this.StatUpgrade;
                break;
        }
        if (this.LabelStat != null)
            this.LabelStat.string = (this.Stat * this.StatMuti).toString();
        //Cost
        switch (this.CostType) {
            case UpgradeType.Add:
                this.Cost += this.CostUpgrade;
                break;
            case UpgradeType.Muti:
                this.Cost *= this.CostUpgrade;
                break;
        }
        if (this.LabelCost != null)
            this.LabelCost.string = (this.Cost * this.CostMuti).toString();
    }
}