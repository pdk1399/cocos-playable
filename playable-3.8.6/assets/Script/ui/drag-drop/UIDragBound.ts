import { _decorator, CCBoolean, Component, EventTouch, Node, UITransform, Vec3 } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('UIDragBound')
export class UIDragBound extends Component {

    //NOTE:
    //- This will check combine bound of child's UI-Transform component both, not only own UI-Transform
    //- This might work best for Anchor Point Centre (0.5; 0.5), mean Sprite than Spine (Skeleton)

    @property({ type: [Node] })
    DropGroup: Node[] = [];
    @property({ type: CCBoolean })
    DropPosReset: boolean = false;
    @property({ type: CCBoolean })
    DropPosFixed: boolean = false;
    @property({ type: CCBoolean })
    DropPosUpdate: boolean = false;

    m_pos: Vec3 = new Vec3();
    m_drag: boolean = false;
    m_contact: Node = null;

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected start(): void {
        if (this.DropGroup.length == 0)
            this.DropGroup.push(this.node.parent);
        this.m_pos = this.node.getPosition().clone();
        this.m_contact = this.getContactClose();
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
        this.m_contact?.emit(ConstantBase.NODE_UI_DROP_EXIT, this.node);
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

        this.m_contact?.emit(ConstantBase.NODE_UI_DROP_EXIT, this.node);
        this.m_contact = this.getContactClose();
        if (this.m_contact != null) {
            if (this.DropPosFixed)
                this.node.setWorldPosition(this.m_contact.getWorldPosition().clone());
            if (this.DropPosUpdate)
                this.m_pos = this.node.getPosition().clone();

            this.m_contact?.emit(ConstantBase.NODE_UI_DROP_ENTER, this.node);
        }
        else {
            if (this.DropPosReset)
                this.node.setPosition(this.m_pos);

            this.m_contact?.emit(ConstantBase.NODE_UI_DROP_BACK, this.node);
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
        for (const groupDrop of this.DropGroup) {
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