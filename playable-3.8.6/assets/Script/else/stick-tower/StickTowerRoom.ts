import { _decorator, Component, director, Node } from 'cc';
import { StickTowerUnit } from './StickTowerUnit';
import { ConstantBase } from '../../ConstantBase';
import { UIDrag } from '../../ui/drag-drop/UIDrag';
import { StickTowerField } from './StickTowerField';
const { ccclass, property } = _decorator;

@ccclass('StickTowerRoom')
export class StickTowerRoom extends Component {

    m_field: StickTowerField = null;

    m_player: StickTowerUnit = null;
    m_uiDragPlayer: UIDrag = null;

    m_unit: StickTowerUnit[] = [];

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_UI_DROP_ENTER, this.onPlayerEnter, this);
        this.node.on(ConstantBase.NODE_UI_DROP_EXIT, this.onPlayerExit, this);
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
            this.m_uiDragPlayer.onPosLocal(this.m_unit[this.m_unit.length - 1].node.position.clone().add3f(-100, 0, 0));
            this.m_uiDragPlayer.Lock = true;
            let playerPoint = this.m_player.Point;
            let enermyPoint = this.m_unit[this.m_unit.length - 1].Point;
            if (this.m_player.Point > this.m_unit[this.m_unit.length - 1].Point) {
                //Player Attack
                this.scheduleOnce(() => {
                    this.m_uiDragPlayer.Lock = false;
                    this.m_player.onUnitIdle();
                }, this.m_player.onUnitAttack());
                //Enermy Dead
                this.m_unit[this.m_unit.length - 1].onPointAdd(-9999);
                this.scheduleOnce(() => {
                    this.m_player.onPointAdd(enermyPoint);
                    this.m_unit[this.m_unit.length - 1].node.destroy();
                    this.m_unit.splice(this.m_unit.length - 1, 1);
                    if (this.m_field.onRoomCheckWin()) {
                        this.scheduleOnce(() => {
                            this.m_player.onUnitWin();
                            director.emit(ConstantBase.GAME_COMPLETE);
                        }, 1);
                    }
                }, this.m_unit[this.m_unit.length - 1].onUnitDead());
            }
            else {
                //Player Dead
                this.m_player.onPointAdd(-9999);
                this.scheduleOnce(() => {
                    this.m_unit[this.m_unit.length - 1].onPointAdd(playerPoint);
                    director.emit(ConstantBase.GAME_LOSE);
                }, this.m_player.onUnitDead());
                //Enermy Attack
                this.scheduleOnce(() => {
                    this.m_unit[this.m_unit.length - 1].onUnitIdle()
                }, this.m_unit[this.m_unit.length - 1].onUnitAttack());
            }
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