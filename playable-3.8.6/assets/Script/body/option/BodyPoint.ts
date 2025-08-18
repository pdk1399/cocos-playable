import { _decorator, CCInteger, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BodyPoint')
export class BodyPoint extends Component {

    @property({ group: { name: 'Main' }, type: CCInteger })
    Value: number = 10;
    @property({ group: { name: 'Main' }, type: Label })
    Label: Label = null;

    protected onLoad(): void {

    }

    protected start(): void {
        if (this.Label != null)
            this.Label.string = this.Value.toString();
    }
}