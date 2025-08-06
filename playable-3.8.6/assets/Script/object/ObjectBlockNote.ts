import { _decorator, CCFloat, CCInteger, BoxCollider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, Tween, tween, TweenEasing, UITransform, v2, v3, Size, CCString, sp, SpriteFrame, Sprite, CCBoolean } from 'cc';
import { EaseType } from '../ConstantBase';
const { ccclass, property, playOnFocus } = _decorator;

@ccclass('ObjectBlockNote')
@playOnFocus()
export class ObjectBlockNote extends Component {

    @property({ group: { name: 'Tween' }, type: UITransform })
    TweenTarget: UITransform = null;
    @property({ group: { name: 'Tween' }, type: CCFloat })
    TweenDuration: number = 0.05;
    @property({ group: { name: 'Tween' }, type: EaseType })
    TweenEase: EaseType = EaseType.linear;

    @property({ group: { name: 'Anim' }, type: CCBoolean })
    FirstState: boolean = false;
    @property({ group: { name: 'Anim' }, type: CCString, visible(this: ObjectBlockNote) { return this.getEditorSpineAvaible(); } })
    AnimOff: string = 'off';
    @property({ group: { name: 'Anim' }, type: CCString, visible(this: ObjectBlockNote) { return this.getEditorSpineAvaible(); } })
    AnimOn: string = 'on';
    @property({ group: { name: 'Anim' }, type: SpriteFrame, visible(this: ObjectBlockNote) { return this.getEditorSpriteAvaible(); } })
    SpriteOff: SpriteFrame = null;
    @property({ group: { name: 'Anim' }, type: SpriteFrame, visible(this: ObjectBlockNote) { return this.getEditorSpriteAvaible(); } })
    SpriteOn: SpriteFrame = null;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = -1;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagTop: number = 0;

    m_trigged: boolean = false;

    m_offsetY: number = 0;
    m_posYC: number = 0;
    m_posYD: number = 0;
    m_posYU: number = 0;

    m_targetTop: RigidBody2D[] = [];

    m_spine: sp.Skeleton = null;
    m_sprite: Sprite = null;

    protected onLoad(): void {
        this.m_spine = this.TweenTarget.getComponent(sp.Skeleton);
        this.m_sprite = this.TweenTarget.getComponent(Sprite);

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
        if (this.FirstState)
            this.onAnimTrigged();
    }

    onFocusInEditor(): void {
        this.onEditorFixed();
    }

    onLostFocusInEditor(): void {
        this.onEditorFixed();
    }

    protected onBeginContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        let target = otherCollider.body;
        let index = this.m_targetTop.findIndex((t) => t == target);
        if (index >= 0)
            return;
        this.m_targetTop.push(otherCollider.body);
        if (this.m_targetTop.length == 1) {
            this.onTopTrigger(true);
            this.onAnimTrigged();
        }
    }

    protected onEndContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        let target = otherCollider.body;
        let index = this.m_targetTop.findIndex((t) => t == target);
        if (index < 0)
            return;
        this.m_targetTop.splice(index, 1);
        if (this.m_targetTop.length == 0)
            this.onTopTrigger(false);
    }

    //

    protected onTopTrigger(state: boolean) {
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

    protected onAnimTrigged() {
        if (this.m_trigged)
            return;
        this.m_trigged = true;
        if (this.m_spine != null && this.m_spine.isValid)
            this.m_spine.setAnimation(0, this.AnimOn, true);
        else if (this.m_sprite != null && this.m_sprite.isValid)
            this.m_sprite.spriteFrame = this.SpriteOn;
    }

    //

    protected onEditorFixed() {
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

    protected getEditorSpineAvaible(): boolean {
        if (this.TweenTarget == null || !this.TweenTarget.isValid)
            return false;
        if (this.TweenTarget.getComponent(sp.Skeleton) == null)
            return false;
        return true;
    }

    protected getEditorSpriteAvaible(): boolean {
        if (this.TweenTarget == null || !this.TweenTarget.isValid)
            return false;
        if (this.TweenTarget.getComponent(Sprite) == null)
            return false;
        return true;
    }
}