import { _decorator, Component, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { UIDrop } from '../../ui/drag-drop/UIDrop';
import { UIDrag } from '../../ui/drag-drop/UIDrag';
import { StickBattleUnit } from './StickBattleUnit';
import { StickBattleCount } from './StickBattleCount';
const { ccclass, property } = _decorator;

@ccclass('StickBattleArea')
export class StickBattleArea extends Component {

    @property(Node)
    mask: Node = null;
    @property(StickBattleCount)
    count: StickBattleCount = null;
    @property(Node)
    tutorialDrag: Node = null;
    @property(Node)
    tutorialMerge: Node = null;

    m_uiDrop: UIDrop = null;

    protected onLoad(): void {
        this.m_uiDrop = this.getComponent(UIDrop);

        this.node.on(ConstantBase.NODE_UI_DRAG_ENTER, this.onMaskShow, this);
        this.node.on(ConstantBase.NODE_UI_DRAG_EXIT, this.onMaskHide, this);

        this.node.on(ConstantBase.NODE_UI_DROP_ENTER, this.onUnitMerge, this);
    }

    protected start(): void {
        this.count.UnitCountAdd(this.getComponentInChildren(StickBattleUnit) != null ? 1 : 0);
    }

    //DRAG

    onMaskShow() {
        this.mask.active = true;
        this.tutorialDrag.active = false;
        this.tutorialMerge.active = false;
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
        const unitA = this.m_uiDrop.m_uiDrag[0].getComponent(StickBattleUnit);
        const unitB = this.m_uiDrop.m_uiDrag[1].getComponent(StickBattleUnit);
        if (unitA == null || unitB == null)
            return;
        if (unitA.type != unitB.type || unitA.level != unitB.level)
            this.onUnitSwap();
        else {
            if (!unitA.onLevelAdd()) {
                this.onUnitSwap();
                return;
            }
            unitB.getComponent(UIDrag).onDropExit();
            this.scheduleOnce(() => unitB.node.destroy(), 0.02);
            this.count.UnitCountAdd(-1);
        }
    }

    onUnitSwap() {
        console.log('Swap units');
        const dragA = this.m_uiDrop.m_uiDrag[0].getComponent(UIDrag);
        const dragB = this.m_uiDrop.m_uiDrag[1].getComponent(UIDrag);
        dragA.onDropEnter(dragB.m_uiDropLast);
    }
}