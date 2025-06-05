import { _decorator, CCBoolean, CCFloat, CCInteger, Collider2D, Component, Contact2DType, Enum, IPhysics2DContact, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { BodyCheckX } from '../physic/BodyCheckX';
const { ccclass, property } = _decorator;

export enum HitCheckType {
    Always = 0,
    IfBot = 1,
    IfNotBot = 2,
}
Enum(HitCheckType);

@ccclass('BodyHurt')
export class BodyHurt extends Component {

    @property({ group: { name: 'Hit' }, type: CCInteger })
    Hit: number = 1;
    @property({ group: { name: 'Hit' }, type: CCInteger })
    HitSelf: number = 0;
    @property({ group: { name: 'Hit' }, type: HitCheckType, visible(this: BodyHurt) { return this.getComponent(BodyCheckX) != null; } })
    HitCheck: HitCheckType = HitCheckType.Always;

    @property({ group: { name: 'Option' }, type: CCFloat })
    ThrowFixed: number = 0.2;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 300;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100, 200];

    m_isBot: boolean = null;

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_COLLIDE_BOT, this.onBot, this);

        this.node.on(ConstantBase.NODE_PICK, this.onPick, this);
        this.node.on(ConstantBase.NODE_THROW, this.onThrow, this);

        let collider = this.getComponents(Collider2D);
        collider.forEach(colliderCheck => {
            if (colliderCheck.tag == this.TagBody) {
                colliderCheck.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
        });
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.tag != this.TagBody)
            return;
        if (this.m_isBot != null) {
            switch (this.HitCheck) {
                case HitCheckType.Always:
                    break;
                case HitCheckType.IfBot:
                    if (!this.m_isBot) return;
                    break;
                case HitCheckType.IfNotBot:
                    if (this.m_isBot) return;
                    break;
            }
        }
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1) {
            otherCollider.node.emit(ConstantBase.NODE_BODY_HIT, this.Hit, this.node);
            if (this.HitSelf > 0)
                this.node.emit(ConstantBase.NODE_BODY_HIT, this.HitSelf, this.node);
        }
    }

    private onBot(state: boolean, target: Collider2D,) {
        this.m_isBot = state;
    }

    private onPick() {
        let collider = this.getComponents(Collider2D);
        collider.forEach(colliderCheck => {
            if (colliderCheck.tag == this.TagBody) {
                colliderCheck.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
        });
    }

    private onThrow() {
        this.scheduleOnce(() => {
            //Delay hit event to avoid immediate contact issues
            let collider = this.getComponents(Collider2D);
            collider.forEach(colliderCheck => {
                if (colliderCheck.tag == this.TagBody) {
                    colliderCheck.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                }
            });
        }, this.ThrowFixed);
    }
}