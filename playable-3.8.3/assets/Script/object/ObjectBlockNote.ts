import { _decorator, CCFloat, CCInteger, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, Tween, tween, TweenEasing, UITransform, v2, v3 } from 'cc';
import { MoveOnce } from '../tween/move/MoveOnce';
import { SpineBase } from '../renderer/SpineBase';
import { EaseType } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('ObjectBlockNote')
export class ObjectBlockNote extends Component {

    @property({ group: { name: 'Main' }, type: UITransform })
    TweenTarget: UITransform = null;
    @property({ group: { name: 'Main' }, type: CCFloat })
    TweenDuration: number = 0.05;
    @property({ group: { name: 'Main' }, type: EaseType })
    TweenEase: EaseType = EaseType.linear;

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

        let colliders = this.getComponents(Collider2D);
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

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let target = otherCollider.body;
        let index = this.m_targetTop.findIndex((t) => t == target);
        if (index >= 0)
            return;
        this.m_targetTop.push(otherCollider.body);
        if (this.m_targetTop.length == 1)
            this.onBlockStateChange(true);
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let target = otherCollider.body;
        let index = this.m_targetTop.findIndex((t) => t == target);
        if (index < 0)
            return;
        this.m_targetTop.splice(index, 1);
        if (this.m_targetTop.length == 0)
            this.onBlockStateChange(false);
    }

    //

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