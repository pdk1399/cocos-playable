import { _decorator, CCBoolean, Component, EventTouch, Node, UITransform, Vec3 } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('UIDragTest')
export class UIDragTest extends Component {

    @property({ type: [Node], group: { name: 'Main' } })
    GroupDrop: Node[] = [];

    @property({ type: CCBoolean, group: { name: 'Drop' } })
    DropPosReset: boolean = false;
    @property({ type: CCBoolean, group: { name: 'Drop' } })
    DropPosFixed: boolean = false;
    @property({ type: CCBoolean, group: { name: 'Drop' } })
    DropPosUpdate: boolean = false;

    m_pos: Vec3 = new Vec3();
    m_drag: boolean = false;

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected start(): void {
        if (this.GroupDrop.length == 0)
            this.GroupDrop.push(this.node.parent);
        this.m_pos = this.node.getPosition().clone();
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        this.m_drag = true;
        this.node.setSiblingIndex(999);
        this.node.emit(ConstantBase.NODE_UI_DRAG_START, this.node);
    }

    onTouchMove(event: EventTouch) {
        if (!this.m_drag)
            return;
        const delta = event.getUIDelta();
        const pos = this.node.getPosition();
        this.node.setPosition(pos.x + delta.x, pos.y + delta.y, pos.z);
    }

    onTouchEnd(event: EventTouch) {
        if (!this.m_drag)
            return;
        this.m_drag = false;

        const nodeContact = this.getContact();
        if (nodeContact != null) {
            if (this.DropPosFixed)
                this.node.setWorldPosition(nodeContact.getWorldPosition().clone());
            if (this.DropPosUpdate)
                this.m_pos = this.node.getPosition().clone();
            console.log('Contact ' + this.node.name + ' with ' + nodeContact.name);
        }
        else {
            if (this.DropPosReset)
                this.node.setPosition(this.m_pos);
        }

        this.node.emit(ConstantBase.NODE_UI_DRAG_END, this.node);
    }

    getContact(): Node | null {
        const fromDragUI = this.node.getComponent(UITransform);
        if (!fromDragUI)
            return null;
        const fromDragBound = fromDragUI.getBoundingBoxToWorld();
        for (const groupDrop of this.GroupDrop) {
            for (const fromDrop of groupDrop.children) {
                if (fromDrop === this.node || !fromDrop.active)
                    continue;
                const fromDropUI = fromDrop.getComponent(UITransform);
                if (!fromDropUI)
                    continue;
                const fromDropBound = fromDropUI.getBoundingBoxToWorld();
                if (fromDropBound.intersects(fromDragBound))
                    return fromDrop;
            }
        }
        return null;
    }

    getContactAll(): Node[] {
        const fromDragUI = this.node.getComponent(UITransform);
        if (!fromDragUI)
            return [];
        const fromDragBound = fromDragUI.getBoundingBoxToWorld();
        const result: Node[] = [];
        for (const groupDrop of this.GroupDrop) {
            for (const fromDrop of groupDrop.children) {
                if (fromDrop === this.node || !fromDrop.active)
                    continue;
                const fromDropUI = fromDrop.getComponent(UITransform);
                if (!fromDropUI)
                    continue;
                const fromDropBound = fromDropUI.getBoundingBoxToWorld();
                if (fromDropBound.intersects(fromDragBound))
                    result.push(fromDrop);
            }
        }
        return result;
    }
}