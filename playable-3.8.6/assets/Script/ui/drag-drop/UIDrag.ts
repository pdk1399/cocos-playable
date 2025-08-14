import { _decorator, Camera, CCBoolean, CCInteger, Collider2D, Component, Contact2DType, EventTouch, IPhysics2DContact, Node, RigidBody2D, UIOpacity, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { UIDrop } from './UIDrop';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('UIDrag')
export class UIDrag extends Component {

    @property({ group: { name: 'Node' }, type: CCBoolean })
    Lock: boolean = false;
    @property({ group: { name: 'Node' }, type: Node })
    Top: Node = null;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = -10;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagDrop: number = -20;

    m_drag: boolean = false;

    m_drop: Node = null;
    m_dropCurrent: Node = null;
    m_uiDrop: UIDrop = null;
    m_uiDropCurrent: UIDrop = null;
    m_uiDropLast: UIDrop = null;

    m_posDrop: Vec3 = v3();

    m_uiTransform: UITransform = null;

    protected onLoad(): void {
        this.m_uiTransform = this.node.getComponent(UITransform);

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        if (this.node.getComponent(RigidBody2D) != null) {
            const colliders = this.node.getComponents(Collider2D);
            colliders.forEach(collider => {
                switch (collider.tag) {
                    case this.TagBody:
                        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                        break;
                }
            });
        }
    }

    protected start(): void {
        if (this.Top == null)
            this.Top = this.node.parent;

        this.m_posDrop = this.node.position.clone();

        //NOTE: If UIDrop is not found (with UIDrop's init progress), the parent of UIDrag will be parent.
        this.scheduleOnce(() => {
            if (this.m_uiDrop == null) {
                console.log('UIDrop parent of ' + this.node.name + ' is not found, so ' + this.node.parent + ' will be the parent');
                this.m_drop = this.node.parent;
                this.m_uiDrop = this.node.parent.getComponent(UIDrop);
                this.m_uiDropLast = this.m_uiDrop;
            }
        });
    }

    //DRAG: Base on code from UIJoystick.ts

    onTouchStart(event: EventTouch) {
        if (this.Lock)
            return;
        this.m_drag = true;
        this.node.setParent(this.Top, true); //While dragging, the node will be on top of all other nodes
        this.node.setSiblingIndex(999); //Set the highest index to avoid glitch when dragging
        this.node.emit(ConstantBase.NODE_UI_DRAG_START);
    }

    onTouchMove(event: EventTouch) {
        if (this.Lock)
            return;
        if (!this.m_drag)
            //Avoid glitch when dragging before starting dragging progress after un-locking
            return;
        const delta = event.getUIDelta();
        const pos = this.node.getPosition();
        this.node.setPosition(pos.x + delta.x, pos.y + delta.y, pos.z);
    }

    onTouchCancel(event: EventTouch) {
        this.onTouchEnd(event);
    }

    onTouchEnd(event: EventTouch) {
        if (this.Lock)
            return;

        if (!this.m_drag)
            //Avoid glitch when dragging before starting dragging progress after un-locking
            return;
        this.m_drag = false;

        if (this.m_dropCurrent != null) {
            if (this.m_dropCurrent != this.m_drop)
                //NOTE: To avoid glitch when dragging on the same drop node, only excute exit when difference drop node.
                this.m_uiDrop.onDropExit(this);
            this.m_uiDropCurrent.onDropEnter(this);
        }
        else
            this.m_uiDrop.onDropBack(this);
        this.node.setParent(this.m_drop, true);
        this.node.position = this.m_posDrop;

        this.node.emit(ConstantBase.NODE_UI_DRAG_END);
    }

    //DROP

    onDropEnter(drop: UIDrop) {
        if (drop == null)
            return;

        this.m_uiDrop.onDropExit(this);
        drop.onDropEnter(this);
        this.node.setParent(this.m_drop, true);
        this.node.position = this.m_posDrop;

        this.node.emit(ConstantBase.NODE_UI_DRAG_END);
    }

    onDropExit() {
        this.m_uiDrop.onDropExit(this);
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.Lock)
            return;
        if (!this.m_drag)
            return;
        if (selfCollider.tag != this.TagBody || otherCollider.tag != this.TagDrop)
            return;
        //NOTE: When begin dragging, the current drop node will be the first drop node contact.
        this.m_dropCurrent = otherCollider.node;
        this.m_uiDropCurrent?.onDragExit(this);
        this.m_uiDropCurrent = otherCollider.node.getComponent(UIDrop);
        this.m_uiDropCurrent.onDragEnter(this);
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.Lock)
            return;
        if (!this.m_drag)
            return;
        if (selfCollider.tag != this.TagBody || otherCollider.tag != this.TagDrop)
            return;
        if (otherCollider.node != this.m_dropCurrent)
            return;
        this.m_dropCurrent = null;
        this.m_uiDropCurrent.onDragExit(this);
        this.m_uiDropCurrent = null;
    }

    //

    onPosDrop(pos: Vec3, update: boolean = false) {
        this.m_posDrop = pos;
        if (update)
            this.node.position = this.m_posDrop;
    }
}