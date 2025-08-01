import { _decorator, Component, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { UIDrop } from '../../ui/drag-drop/UIDrop';
import { UIDrag } from '../../ui/drag-drop/UIDrag';
import { StickBattleUnit } from './StickBattleUnit';
const { ccclass, property } = _decorator;

@ccclass('StickBattleMerge')
export class StickBattleMerge extends Component {

    m_uiDrop: UIDrop = null;

    protected onLoad(): void {
        this.m_uiDrop = this.getComponent(UIDrop);

        this.node.on(ConstantBase.NODE_UI_DROP_ENTER, this.onMerge, this);
    }

    onMerge() {
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
            let dragA = this.m_uiDrop.m_uiDrag[0].getComponent(UIDrag);
            let dragB = this.m_uiDrop.m_uiDrag[1].getComponent(UIDrag);
            dragA.onDropEnter(dragB.m_uiDropLast);
        }
        else {
            if (!unitA.onLevelAdd()) {
                console.log('Cannot merge, unit level is max');
                this.onSwap();
                return;
            }
            console.log('Merge unit complete');
            this.m_uiDrop.m_uiDrag[1].getComponent(UIDrag).onDropExit();
            this.scheduleOnce(() => unitB.node.destroy(), 0.02);
        }
    }

    onSwap() {
        console.log('Swap units');
        let dragA = this.m_uiDrop.m_uiDrag[0].getComponent(UIDrag);
        let dragB = this.m_uiDrop.m_uiDrag[1].getComponent(UIDrag);
        dragA.onDropEnter(dragB.m_uiDropLast);
    }
}