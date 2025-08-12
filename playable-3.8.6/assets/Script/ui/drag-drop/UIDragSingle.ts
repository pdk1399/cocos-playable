import { _decorator, CCBoolean, Component, EventTouch, Node, UITransform, Vec3 } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('UIDragSingle')
export class UIDragSingle extends Component {

    //NOTE:
    //- This will check bound of both their child's UI-Transform component, not only this own
    //- This might work best for Anchor Point Centre (0.5; 0.5), mean Sprite than Spine (Skeleton)

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
    m_drop: Node = null;

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

        const nodeContact = this.getContactClose();
        if (nodeContact != null) {
            if (this.DropPosFixed)
                this.node.setWorldPosition(nodeContact.getWorldPosition().clone());
            if (this.DropPosUpdate)
                this.m_pos = this.node.getPosition().clone();
        }
        else {
            if (this.DropPosReset)
                this.node.setPosition(this.m_pos);
        }

        this.node.emit(ConstantBase.NODE_UI_DRAG_END, this.node);
    }

    getContactClose(): Node | null {
        const contactAll = this.getContactAll();
        if (contactAll.length === 0)
            return null;
        let closestNode: Node | null = null;
        let closestDistance = Infinity;
        for (const node of contactAll) {
            const distance = Vec3.distance(this.node.getPosition(), node.getPosition());
            if (distance < closestDistance) {
                closestDistance = distance;
                closestNode = node;
            }
        }
        return closestNode;
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
                    //NOTE: This will check bound of both their child's UI-Transform component, not only this own
                    result.push(fromDrop);
            }
        }
        return result;
    }
}