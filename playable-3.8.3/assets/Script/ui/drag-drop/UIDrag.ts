import { _decorator, Camera, CCBoolean, CCInteger, Collider2D, Component, Contact2DType, EventTouch, IPhysics2DContact, Node, RigidBody2D, UIOpacity, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { UIDrop } from './UIDrop';
const { ccclass, property } = _decorator;

@ccclass('UIDrag')
export class UIDrag extends Component {

    //NOTE: 
    //- Drag node (of UIDrag) & Drop node (of UIDrop) should have Rigidbody2D and Collider2D for full progress.
    //- Drag node (of UIDrag) must be the child of UIDrag node to avoid glitch when dragging.
    //- Drop node (of UIDrop) should got multiple collider to avoid glitch when fast dragging.
    //- UIDrag node must be the child of UIDrop node for working progress.
    //- Top node should have highest index view in scene (and shouldn't be null to avoid un-right view).

    @property({ group: { name: 'Node' }, type: CCBoolean })
    Lock: boolean = false;
    @property({ group: { name: 'Node' }, type: Node })
    Drag: Node = null;
    @property({ group: { name: 'Node' }, type: Node })
    Top: Node = null;
    @property({ group: { name: 'Node' }, type: Camera })
    UiCamera: Camera = null;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagDrag: number = -10;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagDrop: number = -20;

    m_drag: boolean = false;
    m_drop: Node = null;
    m_dropCurrent: Node = null;

    m_uiDrop: UIDrop = null;
    m_uiDropCurrent: UIDrop = null;

    m_dotRadius: number;
    m_posPrimary: Vec3 = v3();
    m_posTouched: Vec3 = v3();
    m_posTouchedFixed: Vec3 = v3();
    m_posLocked: Vec3 = v3();
    m_posDot: Vec3 = v3();
    m_direction: Vec2 = v2();
    m_posDrop: Vec3 = v3();

    m_uiTransform: UITransform = null;

    protected onLoad(): void {
        this.m_uiTransform = this.node.getComponent(UITransform);

        this.Drag.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.Drag.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.Drag.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.Drag.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        if (this.Drag.getComponent(RigidBody2D) != null) {
            let colliders = this.Drag.getComponents(Collider2D);
            colliders.forEach(collider => {
                switch (collider.tag) {
                    case this.TagDrag:
                        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                        break;
                }
            });
        }
    }

    protected start(): void {
        let dotSize = this.Drag.getComponent(UITransform).contentSize;
        this.m_dotRadius = Math.max(dotSize.x, dotSize.y) / 2;
        this.m_posPrimary = this.Drag.getPosition();
        this.m_posDrop = this.node.position.clone();

        //NOTE: If UIDrop is not found (with UIDrop's init progress), the parent of UIDrag will be parent.
        this.scheduleOnce(() => {
            if (this.m_uiDrop == null) {
                console.log('UIDrop parent of ' + this.node.name + ' is not found, so ' + this.node.parent + ' will be the parent');
                this.m_drop = this.node.parent;
                this.m_uiDrop = this.node.parent.getComponent(UIDrop);
            }
        });
    }

    //DRAG: Base on code from UIJoystick.ts

    onTouchStart(event: EventTouch) {
        if (this.Lock)
            return;

        this.m_drag = true;
        this.node.setParent(this.Top, true); //While dragging, the node will be on top of all other nodes

        let tempV2 = event.getLocation().clone();
        let tempV3 = new Vec3();
        tempV3.x = tempV2.x;
        tempV3.y = tempV2.y;

        let tempW3 = v3();
        this.UiCamera.screenToWorld(tempV3, tempW3);

        this.m_posTouched = this.m_uiTransform?.convertToNodeSpaceAR(tempW3);
        this.m_posTouched.z = 0;

        this.m_posLocked = this.m_posPrimary;

        let direction = this.m_posTouched.clone().subtract(this.m_posLocked).normalize();
        this.m_direction = v2(direction.clone().x, direction.clone().y);

        let distance = this.m_posTouched.clone().subtract(this.m_posLocked).length();
        this.m_posTouchedFixed = direction.multiplyScalar(distance);
        this.m_posDot = this.m_posTouchedFixed.clone().add(this.m_posLocked);

        this.Drag.position = this.m_posDot;
    }

    onTouchMove(event: EventTouch) {
        if (this.Lock)
            return;
        if (!this.m_drag)
            //Avoid glitch when dragging before starting dragging progress after un-locking
            return;

        let tempV2 = event.getLocation().clone();
        let tempV3 = new Vec3();
        tempV3.x = tempV2.x;
        tempV3.y = tempV2.y;

        let tempW3 = v3();
        this.UiCamera.screenToWorld(tempV3, tempW3);

        this.m_posTouched = this.m_uiTransform?.convertToNodeSpaceAR(tempW3);
        this.m_posTouched.z = 0;

        let direction = this.m_posTouched.clone().subtract(this.m_posLocked).normalize();
        this.m_direction = v2(direction.clone().x, direction.clone().y);

        let distance = this.m_posTouched.clone().subtract(this.m_posLocked).length();
        this.m_posTouchedFixed = direction.multiplyScalar(distance);
        this.m_posDot = this.m_posTouchedFixed.clone().add(this.m_posLocked);

        this.Drag.position = this.m_posDot;
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
                this.m_uiDrop.onDragExit(this);
            this.m_uiDropCurrent.onDragEnter(this);
        }
        else
            this.m_uiDrop.onDragBack(this);
        this.node.setParent(this.m_drop, true);
        this.node.position = this.m_posDrop;

        this.m_direction = Vec2.ZERO.clone();

        this.m_posTouched = this.m_posPrimary;
        this.m_posLocked = this.m_posPrimary;
        this.m_posDot = this.m_posPrimary;

        this.Drag.position = this.m_posDot;
    }

    //DROP

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.Lock)
            return;

        if (selfCollider.tag != this.TagDrag || otherCollider.tag != this.TagDrop)
            return;
        //NOTE: When begin dragging, the current drop node will be the first drop node contact.
        this.m_dropCurrent = otherCollider.node;
        this.m_uiDropCurrent = otherCollider.node.getComponent(UIDrop);
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.Lock)
            return;

        if (selfCollider.tag != this.TagDrag || otherCollider.tag != this.TagDrop)
            return;
        if (otherCollider.node != this.m_dropCurrent)
            return;
        this.m_dropCurrent = null;
        this.m_uiDropCurrent = null;
    }
}