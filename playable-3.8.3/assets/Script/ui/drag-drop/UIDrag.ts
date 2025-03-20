import { _decorator, Camera, Component, EventTouch, Node, UIOpacity, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIDrag')
export class UIDrag extends Component {

    @property({ group: { name: 'Init' }, type: Node })
    Target: Node = null;
    @property({ group: { name: 'Init' }, type: Node })
    Top: Node = null;
    @property({ group: { name: 'Init' }, type: Camera })
    UiCamera: Camera = null;

    m_dotRadius: number;
    m_posPrimary: Vec3 = v3();
    m_posTouched: Vec3 = v3();
    m_posTouchedFixed: Vec3 = v3();
    m_posLocked: Vec3 = v3();
    m_posDot: Vec3 = v3();
    m_direction: Vec2 = v2();
    m_opacity: number;

    m_parent: Node = null;
    m_uiTransform: UITransform = null;

    protected onLoad(): void {
        this.m_parent = this.node.parent;
        this.m_uiTransform = this.node.getComponent(UITransform);

        this.Target.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.Target.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.Target.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.Target.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected start(): void {
        let dotSize = this.Target.getComponent(UITransform).contentSize;
        this.m_dotRadius = Math.max(dotSize.x, dotSize.y) / 2;
        this.m_posPrimary = this.Target.getPosition();
    }

    onTouchStart(event: EventTouch) {
        this.node.setParent(this.Top, true);

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

        this.Target.position = this.m_posDot;
    }

    onTouchMove(event: EventTouch) {
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

        this.Target.position = this.m_posDot;
    }

    onTouchEnd(event: EventTouch) {
        this.m_direction = Vec2.ZERO.clone();

        this.m_posTouched = this.m_posPrimary;
        this.m_posLocked = this.m_posPrimary;
        this.m_posDot = this.m_posPrimary;

        this.Target.position = this.m_posDot;

        this.node.setParent(this.m_parent, true);
    }
}