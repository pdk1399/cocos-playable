import { _decorator, CCBoolean, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StickTowerUnit')
export class StickTowerUnit extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Player: boolean = false;
}