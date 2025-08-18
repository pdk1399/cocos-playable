import { _decorator, CCBoolean, CCInteger, Component, Label, math, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BodyPoint')
export class BodyPoint extends Component {

    @property({ group: { name: 'Main' }, type: CCInteger })
    Value: number = 10;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    ValueZeroHide: boolean = true;
    @property({ group: { name: 'Main' }, type: Label })
    Label: Label = null;

    protected start(): void {
        if (this.Label != null)
            this.Label.string = this.Value.toString();
    }

    onFocusInEditor(): void {
        if (this.Label != null)
            this.Label.string = this.Value.toString();
    }

    onLostFocusInEditor(): void {
        if (this.Label != null)
            this.Label.string = this.Value.toString();
    }

    onValueUpdate(value: number): void {
        this.Value = value;
        if (this.Value < 0)
            this.Value = 0;
        if (this.Label != null)
            this.Label.string = this.Value.toString();
        if (this.ValueZeroHide && this.Value <= 0)
            this.Label.node.active = false;
    }

    onValueAdd(value: number): void {
        this.Value += value;
        if (this.Value < 0)
            this.Value = 0;
        if (this.Label != null)
            this.Label.string = this.Value.toString();
        if (this.ValueZeroHide && this.Value <= 0)
            this.Label.node.active = false;
    }
}