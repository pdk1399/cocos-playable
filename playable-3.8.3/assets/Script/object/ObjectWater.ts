import { _decorator, CCFloat, CCInteger, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, v2, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ObjectWater')
export class ObjectWater extends Component {

    @property({ group: { name: 'Body' }, type: CCFloat })
    LinearDensity: number = 1000;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 0;

    m_topY: number = null;
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
        this.m_topY = this.node.worldPosition.clone().y; //Check from centre of the water object
    }

    protected lateUpdate(dt: number): void {
        //NOTE: 
        //- Property 'Density' of collider(s) on target affects the mass of their rigidbody, which will affect the water's force applied to them.
        //- Set the property 'Density' of un-necessary collider(s) on them to 0 to avoid water affecting these.
        this.m_target.forEach(target => {
            //Check from centre of the target
            if (this.m_topY > target.node.worldPosition.clone().y) {
                //If the target is above the water surface, apply buoyancy force to it
                let depth = Math.abs(this.m_topY - target.node.worldPosition.clone().y);
                //Archimedes: F = ρ * V * g
                let force = v2(0, this.LinearDensity * depth * target.gravityScale * dt * 9.81);
                target.applyForceToCenter(force, true);
            }
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