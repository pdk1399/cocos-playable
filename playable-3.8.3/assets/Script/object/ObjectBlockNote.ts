import { _decorator, CCFloat, CCInteger, BoxCollider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, Tween, tween, TweenEasing, UITransform, v2, v3, Size } from 'cc';
import { SpineBase } from '../renderer/SpineBase';
import { EaseType } from '../ConstantBase';
const { ccclass, property, playOnFocus } = _decorator;

@ccclass('ObjectBlockNote')
@playOnFocus()
export class ObjectBlockNote extends Component {

    @property({ group: { name: 'Main' }, type: UITransform })
    TweenTarget: UITransform = null;
    @property({ group: { name: 'Main' }, type: CCFloat })
    TweenDuration: number = 0.05;
    @property({ group: { name: 'Main' }, type: EaseType })
    TweenEase: EaseType = EaseType.linear;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = -1;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagTop: number = 0;

    m_offsetY: number = 0;
    m_posYC: number = 0;
    m_posYD: number = 0;
    m_posYU: number = 0;

    m_targetTop: RigidBody2D[] = [];

    m_spine: SpineBase = null;

    protected onLoad(): void {
        this.m_spine = this.getComponent(SpineBase);

        let colliders = this.getComponents(BoxCollider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.TagTop:
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                    break;
            }
        });
    }

    protected start(): void {
        this.m_offsetY = this.TweenTarget.contentSize.y * 0.5;
        this.m_posYC = this.TweenTarget.node.position.clone().y;
        this.m_posYD = this.m_posYC - this.m_offsetY;
        this.m_posYU = this.m_posYC + this.m_offsetY;
    }

    onFocusInEditor(): void {
        this.onColliderFixed();
    }

    onLostFocusInEditor(): void {
        this.onColliderFixed();
    }

    protected onBeginContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        let target = otherCollider.body;
        let index = this.m_targetTop.findIndex((t) => t == target);
        if (index >= 0)
            return;
        this.m_targetTop.push(otherCollider.body);
        if (this.m_targetTop.length == 1)
            this.onBlockStateChange(true);
    }

    protected onEndContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        let target = otherCollider.body;
        let index = this.m_targetTop.findIndex((t) => t == target);
        if (index < 0)
            return;
        this.m_targetTop.splice(index, 1);
        if (this.m_targetTop.length == 0)
            this.onBlockStateChange(false);
    }

    //

    protected onColliderFixed() {
        if (this.TweenTarget == null || !this.TweenTarget.isValid)
            return;
        if (this.TweenTarget.node.parent != this.node)
            return;
        let targetSize = this.TweenTarget.contentSize.clone();
        this.TweenTarget.node.position = v3(0, targetSize.y * 0.5);
        let colliders = this.getComponents(BoxCollider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.TagBody:
                    collider.size.set(targetSize.x, targetSize.y * 0.5);
                    collider.offset.set(0, this.TweenTarget.contentSize.clone().y * 0.25);
                    collider.apply();
                    break;
                case this.TagTop:
                    collider.size.set(targetSize.x - 5, 10);
                    collider.offset.set(0, this.TweenTarget.contentSize.clone().y * 0.5);
                    collider.apply();
                    break;
            }
        });
    }

    protected onBlockStateChange(state: boolean) {
        if (state)
            this.onTweenMove(this.m_posYD);
        else
            this.onTweenMove(this.m_posYC);
    }

    protected onTweenMove(posY: number) {
        Tween.stopAllByTarget(this.TweenTarget.node);
        let posTo = v3(this.TweenTarget.node.position.x, posY, this.TweenTarget.node.position.z);
        tween(this.TweenTarget.node)
            .to(this.TweenDuration, { position: posTo }, { easing: EaseType[this.TweenEase] as TweenEasing })
            .start();
    }
}