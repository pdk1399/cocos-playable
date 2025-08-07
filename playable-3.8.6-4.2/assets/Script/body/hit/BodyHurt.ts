import { _decorator, CCBoolean, CCFloat, CCInteger, Collider2D, Component, Contact2DType, Enum, IPhysics2DContact, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('BodyHurt')
export class BodyHurt extends Component {

    @property({ group: { name: 'Hit' }, type: CCInteger })
    Hit: number = 1;
    @property({ group: { name: 'Hit' }, type: CCInteger })
    HitSelf: number = 0;
    @property({ group: { name: 'Hit' }, type: CCBoolean })
    HitSelfDestroy: boolean = false;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 300;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100, 200];

    protected onLoad(): void {
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
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1) {
            otherCollider.node.emit(ConstantBase.NODE_BODY_HIT, this.Hit, this.node);
            if (this.HitSelf > 0)
                this.node.emit(ConstantBase.NODE_BODY_HIT, this.HitSelf, this.node);
            if (this.HitSelfDestroy)
                this.scheduleOnce(() => this.node.destroy(), 0.02);
        }
    }
}