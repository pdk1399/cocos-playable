import { _decorator, Component, Node } from 'cc';
import { StickTowerUnit } from './StickTowerUnit';
import { ConstantBase } from '../../ConstantBase';
import { UIDrag } from '../../ui/drag-drop/UIDrag';
const { ccclass, property } = _decorator;

@ccclass('StickTowerRoom')
export class StickTowerRoom extends Component {

    m_player: StickTowerUnit = null;
    m_uiDragPlayer: UIDrag = null;

    m_unit: StickTowerUnit[] = [];

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_UI_DRAG_ENTER, this.onPlayerEnter, this);
        this.node.on(ConstantBase.NODE_UI_DRAG_EXIT, this.onPlayerExit, this);
    }

    protected start(): void {
        this.node.children.forEach(child => {
            let unit = child.getComponent(StickTowerUnit);
            if (unit != null) {
                if (unit.Player)
                    this.m_player = unit;
                else
                    this.m_unit.push(unit);
            }
        });
    }

    onPlayerEnter(target: Node) {
        let unit = target.getComponent(StickTowerUnit);
        if (unit == null)
            return;
        if (!unit.Player)
            return;
        this.m_player = unit;
        this.m_uiDragPlayer = unit.getComponent(UIDrag);
        //Main Progress
        if (this.m_unit.length > 0) {
            //Player Attack
            this.m_uiDragPlayer.Lock = true;
            this.scheduleOnce(() => {
                this.m_uiDragPlayer.Lock = false;
                this.m_player.onUnitIdle();
            }, this.m_player.onUnitAttack());
            //Enermy Dead
            this.scheduleOnce(() => {
                this.m_unit[this.m_unit.length - 1].node.destroy();
                this.m_unit.splice(this.m_unit.length - 1, 1);
            }, this.m_unit[this.m_unit.length - 1].onUnitDead());
        }
    }

    onPlayerExit(target: Node) {
        let unit = target.getComponent(StickTowerUnit);
        if (unit == null)
            return;
        if (!unit.Player)
            return;
        this.m_player = null;
        this.m_uiDragPlayer = null;
        //Main Progress
        //Destroy tower if no unit left
    }
}