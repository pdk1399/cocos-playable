import { _decorator, CCBoolean, CCFloat, CCInteger, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('BodyBullet')
export class BodyBullet extends Component {

    @property({ group: { name: 'Hit' }, type: CCInteger })
    Hit: number = 1;
    @property({ group: { name: 'Hit' }, type: CCBoolean })
    HitDestroy: boolean = true;

    @property({ group: { name: 'Option' }, type: CCBoolean })
    OnScene: boolean = true;
    @property({ group: { name: 'Option' }, type: CCFloat })
    ExistDuration: number = 10;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 300;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100, 200];

    m_rigidbody: RigidBody2D = null;

    protected onLoad(): void {
        this.m_rigidbody = this.getComponent(RigidBody2D);

        const collider = this.getComponents(Collider2D);
        collider.forEach(colliderCheck => {
            if (colliderCheck.tag == this.TagBody) {
                colliderCheck.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
        });

        this.node.on(ConstantBase.NODE_SPINE_STOP, this.onBulletStop, this);
        this.node.on(ConstantBase.NODE_SPINE_PLAY, this.onBulletPlay, this);

        if (this.OnScene) {
            director.on(ConstantBase.SCENE_STOP, this.onBulletStop, this);
            director.on(ConstantBase.SCENE_PLAY, this.onBulletPlay, this);
        }
    }

    protected start(): void {
        this.scheduleOnce(() => this.node.destroy(), this.ExistDuration);
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.tag != this.TagBody)
            return;
        const targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1) {
            otherCollider.node.emit(ConstantBase.NODE_BODY_HIT, this.Hit, this.node);
            if (this.HitDestroy)
                this.scheduleOnce(() => this.node.destroy(), 0.02);
        }
    }

    onBulletStop(): void {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => this.m_rigidbody.type = RigidBody2D.BodyType.Static, 0.02);
    }

    onBulletPlay(): void {
        this.scheduleOnce(() => this.node.destroy(), this.ExistDuration);
        this.scheduleOnce(() => this.m_rigidbody.type = RigidBody2D.BodyType.Dynamic, 0.02);
    }
}