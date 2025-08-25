import { _decorator, CCInteger, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ValueCurrency')
export class ValueCurrency extends Component {

    @property({ group: { name: 'Main' }, type: CCInteger })
    Current: number = 1;
    @property({ group: { name: 'Main' }, type: CCInteger })
    CurrentMuti: number = 100;
    @property({ group: { name: 'Main' }, type: Label })
    LabelCurrent: Label = null;

    protected start(): void {
        if (this.LabelCurrent != null)
            this.LabelCurrent.string = (this.Current * this.CurrentMuti).toString();
    }

    onCurrentAdd(value: number) {
        this.Current += value;
        if (this.LabelCurrent != null)
            this.LabelCurrent.string = (this.Current * this.CurrentMuti).toString();
    }
}