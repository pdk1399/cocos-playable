import { _decorator, Component } from 'cc';
import { ObjectDoor } from './ObjectDoor';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('ObjectDoorKey')
export class ObjectDoorKey extends Component {

    //@property({ group: { name: 'Main' }, type: ObjectDoor })
    @property({ type: ObjectDoor })
    DoorOpen: ObjectDoor = null;

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_PICK, this.onPick, this);
        this.node.on(ConstantBase.NODE_THROW, this.onThrow, this);
    }

    protected start(): void {
        if (this.DoorOpen != null) {
            this.DoorOpen.m_ready = false;
        }
    }

    protected onDestroy(): void {
        if (this.DoorOpen != null)
            this.DoorOpen.m_ready = true;
    }

    onPick() {
        if (this.DoorOpen != null)
            this.DoorOpen.m_ready = true;
    }

    onThrow() {
        if (this.DoorOpen != null)
            this.DoorOpen.m_ready = false;
    }
}