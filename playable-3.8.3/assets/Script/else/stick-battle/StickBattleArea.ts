import { _decorator, Component, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { UIDrop } from '../../ui/drag-drop/UIDrop';
import { UIDrag } from '../../ui/drag-drop/UIDrag';
import { StickBattleUnit } from './StickBattleUnit';
const { ccclass, property } = _decorator;

@ccclass('StickBattleArea')
export class StickBattleArea extends Component {

    @property(Node)
    mask: Node = null;

    m_uiDrop: UIDrop = null;

    protected onLoad(): void {
        this.m_uiDrop = this.getComponent(UIDrop);

        this.node.on(ConstantBase.NODE_UI_DRAG_ENTER, this.onMaskShow, this);
        this.node.on(ConstantBase.NODE_UI_DRAG_EXIT, this.onMaskHide, this);

        this.node.on(ConstantBase.NODE_UI_DROP_ENTER, this.onUnitMerge, this);
    }

    //DRAG

    onMaskShow() {
        this.mask.active = true;
    }

    onMaskHide() {
        this.mask.active = false;
    }

    //UNIT

    onUnitMerge() {
        if (this.m_uiDrop.m_uiDrag.length != 2) {
            console.log('Cannot merge, need exactly 2 units (current: ' + this.m_uiDrop.m_uiDrag.length + ')');
            return;
        }
        let unitA = this.m_uiDrop.m_uiDrag[0].getComponent(StickBattleUnit);
        let unitB = this.m_uiDrop.m_uiDrag[1].getComponent(StickBattleUnit);
        if (unitA == null || unitB == null) {
            console.log('Cannot merge, unit not found component');
            return;
        }
        if (unitA.type != unitB.type || unitA.level != unitB.level) {
            console.log('Cannot merge, not same type and level');
            this.onUnitSwap();
        }
        else {
            if (!unitA.onLevelAdd()) {
                console.log('Cannot merge, unit level is max');
                this.onUnitSwap();
                return;
            }
            console.log('Merge unit complete');
            unitB.getComponent(UIDrag).onDropExit();
            this.scheduleOnce(() => unitB.node.destroy(), 0.02);
        }
    }

    onUnitSwap() {
        console.log('Swap units');
        let dragA = this.m_uiDrop.m_uiDrag[0].getComponent(UIDrag);
        let dragB = this.m_uiDrop.m_uiDrag[1].getComponent(UIDrag);
        dragA.onDropEnter(dragB.m_uiDropLast);
    }
}