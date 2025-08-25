import { _decorator, CCInteger, Component, Enum, Input, Label, Node } from 'cc';
import { ValueCurrency } from './ValueCurrency';
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

    @property({ group: { name: 'Cost' }, type: ValueCurrency })
    CostCurrency: ValueCurrency = null;
    @property({ group: { name: 'Cost' }, type: CCInteger })
    Cost: number = 5;
    @property({ group: { name: 'Cost' }, type: UpgradeType })
    CostType: UpgradeType = UpgradeType.Add;
    @property({ group: { name: 'Cost' }, type: CCInteger })
    CostUpgrade: number = 5;
    @property({ group: { name: 'Cost' }, type: CCInteger, visible(this: ValueUpgrade) { return this.CostCurrency == null; } })
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
        this.UiButton.on(Input.EventType.TOUCH_START, this.onUpgrade, this);
    }

    protected start(): void {
        //Level
        if (this.LabelLevel != null)
            this.LabelLevel.string = this.Level.toString();
        //Stat
        if (this.LabelStat != null)
            this.LabelStat.string = (this.Stat * this.StatMuti).toString();
        //Cost
        if (this.CostCurrency != null)
            this.CostMuti = this.CostCurrency.CurrentMuti;
        if (this.LabelCost != null)
            this.LabelCost.string = (this.Cost * this.CostMuti).toString();
        //Button
        if (this.UiButtonOff != null)
            this.UiButtonOff.active = this.CostCurrency.Current < this.Cost;
        if (this.UiButtonOn != null)
            this.UiButtonOn.active = this.CostCurrency.Current >= this.Cost;
    }

    onUpgrade() {
        //Cost
        if (this.CostCurrency != null) {
            if (this.CostCurrency.Current < this.Cost)
                return;
            this.CostCurrency.onCurrentAdd(-this.Cost);
        }
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
        //Button
        if (this.UiButtonOff != null)
            this.UiButtonOff.active = this.CostCurrency.Current < this.Cost;
        if (this.UiButtonOn != null)
            this.UiButtonOn.active = this.CostCurrency.Current >= this.Cost;
    }
}