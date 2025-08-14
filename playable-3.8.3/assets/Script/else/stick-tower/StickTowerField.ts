import { _decorator, Component, Node } from 'cc';
import { StickTowerRoom } from './StickTowerRoom';
const { ccclass, property } = _decorator;

@ccclass('StickTowerManager')
export class StickTowerField extends Component {

    @property(Node)
    ContentRoomEnermy: Node = null;

    m_contentRoomEnermy: StickTowerRoom[] = [];

    protected onLoad(): void {
        this.ContentRoomEnermy.children.forEach(child => {
            let room = child.getComponent(StickTowerRoom);
            if (room != null) {
                room.m_field = this;
                this.m_contentRoomEnermy.push(room);
            }
        });
    }

    onRoomCheckWin(): boolean {
        for (let i = 0; i < this.m_contentRoomEnermy.length; i++) {
            if (this.m_contentRoomEnermy[i].m_unit.length > 0)
                return false;
        }
        return true;
    }
}