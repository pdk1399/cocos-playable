import { _decorator, CCInteger, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, v2, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ObjectWater')
export class ObjectWater extends Component {

    @property({ group: { name: 'Physics' }, type: CCInteger })
    Force: number = 10000;
    @property({ group: { name: 'Physics' }, type: CCInteger })
    VelLimitT: number = 10;
    @property({ group: { name: 'Physics' }, type: CCInteger })
    VelLimitB: number = -10;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 0;

    m_target: RigidBody2D[] = [];

    protected onLoad(): void {
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.TagBody:
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                    break;
            }
        });
    }

    protected lateUpdate(dt: number): void {
        this.m_target.forEach(target => {
            if (target.linearVelocity.y < this.VelLimitB && target.linearVelocity.y < 0)
                target.applyForceToCenter(v2(0, -target.linearVelocity.y / 0.02), true);
            if (target.linearVelocity.y < this.VelLimitT)
                target.applyForceToCenter(v2(0, this.Force), true);
        });
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let index = this.m_target.findIndex((t) => t == otherCollider.body);
        if (index >= 0)
            return;
        this.m_target.push(otherCollider.body);
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let index = this.m_target.findIndex((t) => t == otherCollider.body);
        if (index < 0)
            return;
        this.m_target.splice(index, 1);
    }
}