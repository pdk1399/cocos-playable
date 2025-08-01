import { _decorator, Component, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('StickBattleArea')
export class StickBattleArea extends Component {

    @property(Node)
    mask: Node = null;

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_UI_DRAG_ENTER, this.onDragEnter, this);
        this.node.on(ConstantBase.NODE_UI_DRAG_EXIT, this.onDragExit, this);
    }

    onDragEnter() {
        this.mask.active = true;
    }

    onDragExit() {
        this.mask.active = false;
    }
}