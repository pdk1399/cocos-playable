import { _decorator, CCBoolean, CCFloat, CCInteger, Collider2D, Component, Contact2DType, Enum, IPhysics2DContact, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('BodyHit')
export class BodyHit extends Component {

    @property({ group: { name: 'Main' }, type: CCInteger })
    Hit: number = 1;
    @property({ group: { name: 'Main' }, type: CCInteger })
    HitSelf: number = 0;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Repeat: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat, visible(this: BodyHit) { return this.Repeat; } })
    RepeatDelay: number = 1;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 300;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100, 200];

    m_target: Node[] = [];

    protected onLoad(): void {
        const collider = this.getComponents(Collider2D);
        collider.forEach(colliderCheck => {
            switch (colliderCheck.tag) {
                case this.TagBody:
                    colliderCheck.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    if (this.Repeat)
                        colliderCheck.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                    break;
            }
        });
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.tag != this.TagBody)
            return;
        const targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1) {
            if (this.Repeat) {
                const targetIndex = this.m_target.findIndex((n) => n == otherCollider.node);
                if (targetIndex <= 0)
                    this.m_target.push(otherCollider.node);
                if (this.m_target.length == 1)
                    this.onHitRepeat();
            }
            else {
                this.onHit(otherCollider.node);
                this.onHitSelf();
            }
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.tag != this.TagBody)
            return;
        const targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1) {
            if (this.Repeat) {
                const targetIndex = this.m_target.findIndex((n) => n == otherCollider.node);
                this.m_target.splice(targetIndex, 1);
                if (this.m_target.length == 0)
                    this.unscheduleAllCallbacks();
            }
        }
    }

    protected onHit(target: Node) {
        if (this.Hit > 0)
            target.emit(ConstantBase.NODE_BODY_HIT, this.Hit, this.node);
    }

    protected onHitSelf() {
        if (this.HitSelf > 0)
            this.node.emit(ConstantBase.NODE_BODY_HIT, this.HitSelf, this.node);
    }

    protected onHitRepeat() {
        this.m_target.forEach(target => this.onHit(target));
        this.onHitSelf();
        this.scheduleOnce(() => this.onHitRepeat(), this.RepeatDelay);
    }
}