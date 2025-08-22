import { _decorator, CCBoolean, CCInteger, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('BodyBullet')
export class BodyBullet extends Component {

    @property({ group: { name: 'Hit' }, type: CCInteger })
    Hit: number = 1;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 300;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100, 200];

    protected onLoad(): void {
        const collider = this.getComponents(Collider2D);
        collider.forEach(colliderCheck => {
            if (colliderCheck.tag == this.TagBody) {
                colliderCheck.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
        });
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.tag != this.TagBody)
            return;
        const targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1) {
            otherCollider.node.emit(ConstantBase.NODE_BODY_HIT, this.Hit, this.node);
        }
    }
}