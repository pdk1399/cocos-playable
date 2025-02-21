import { _decorator, Component, Node, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StickFixed')
export class StickFixed extends Component {
    protected onLoad(): void {
        //To avoid bug when touch Stick on field, not change this code!
        this.node.setPosition(v3(0, -1000, 0));
    }
}