import { _decorator, BoxCollider2D, CCBoolean, CCFloat, CCInteger, CCString, Component, Contact2DType, IPhysics2DContact, Node, sp, v2, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ObjectBounce')
export class ObjectBounce extends Component {

    @property({ group: { name: 'Tween' }, type: CCBoolean })
    DegNode: boolean = false;
    @property({ group: { name: 'Tween' }, type: CCFloat, visible(this: ObjectBounce) { return !this.DegNode; } })
    DegForce: number = 90;
    @property({ group: { name: 'Tween' }, type: CCFloat })
    Force: number = 500;
    @property({ group: { name: 'Tween' }, type: CCBoolean })
    ForceStop: boolean = true;
    @property({ group: { name: 'Tween' }, type: CCBoolean })
    ForceReflect: boolean = false; //NOTE: Will add this code logic later...

    @property({ group: { name: 'Anim' }, type: sp.Skeleton })
    Spine: sp.Skeleton = null;
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimBounce: string = 'bounce';

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = -1;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagTop: number = 0;

    protected onLoad(): void {
        const colliders = this.getComponents(BoxCollider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.TagTop:
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    break;
            }
        });
    }

    protected onBeginContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        let velocity = this.ForceStop ? v2(0, 0) : otherCollider.body.linearVelocity.clone();
        if (this.DegNode)
            velocity.add(this.getDir(this.node.angle + this.DegForce, this.Force));
        else
            velocity.add(this.getDir(this.DegForce, this.Force));
        otherCollider.body.linearVelocity = velocity;
        this.onAnimTrigger();
    }

    //

    protected getDir(deg: number, length: number): Vec2 {
        let dir = v2(Math.cos(deg * (Math.PI / 180)), Math.sin(deg * (Math.PI / 180)));
        dir.x *= length;
        dir.y *= length;
        return dir;
    }

    protected onAnimTrigger() {
        if (this.Spine == null)
            return;
        this.scheduleOnce(() => {
            this.Spine.setAnimation(0, this.AnimIdle, true);
        }, this.Spine.setAnimation(0, this.AnimBounce, false).animationEnd * 1.0 / this.Spine.timeScale);
    }
}