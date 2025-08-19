import { _decorator, CCBoolean, Component, instantiate, Node, v2, v3, Vec2 } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { BodyBase } from '../BodyBase';
const { ccclass, property } = _decorator;

@ccclass('BodyEffect')
export class BodyEffect extends Component {

    @property({ group: { name: 'Main' }, type: Node })
    Hit: Node = null;
    @property({ group: { name: 'Main' }, type: Node })
    Dead: Node = null;
    @property({ group: { name: 'Main' }, type: Node })
    Destroy: Node = null;

    @property({ group: { name: 'Custom' }, type: Node })
    Centre: Node = null;
    @property({ group: { name: 'Custom' }, type: Vec2, visible(this: BodyEffect) { return this.Centre != null; } })
    CentreOffset: Vec2 = v2();
    @property({ group: { name: 'Custom' }, type: Node })
    Spawm: Node = null;

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_BODY_HIT, this.onHitEffect, this);
        this.node.on(ConstantBase.NODE_BODY_DEAD, this.onDeadEffect, this);
        this.node.on(ConstantBase.NODE_BODY_DESTROY, this.onDestroyEffect, this);
    }

    protected start(): void {
        if (this.Spawm == null)
            this.Spawm = this.node.parent;
    }

    private onHitEffect() {
        if (this.Hit != null) {
            const effectClone = instantiate(this.Hit);
            effectClone.setParent(this.Spawm);
            effectClone.active = true;
            if (this.Centre != null) {
                const offset = v3(this.CentreOffset.x, this.CentreOffset.y, 0);
                effectClone.worldPosition = this.Centre.worldPosition.clone().add(offset);
            }
            else
                effectClone.worldPosition = this.Hit.worldPosition;
        }
    }

    private onDeadEffect() {
        if (this.Dead != null) {
            const effectClone = instantiate(this.Dead);
            effectClone.setParent(this.Spawm);
            effectClone.active = true;
            if (this.Centre != null) {
                const offset = v3(this.CentreOffset.x, this.CentreOffset.y, 0);
                effectClone.worldPosition = this.Centre.worldPosition.clone().add(offset);
            }
            else
                effectClone.worldPosition = this.Dead.worldPosition;
        }
    }

    private onDestroyEffect() {
        if (this.Destroy != null) {
            const effectClone = instantiate(this.Destroy);
            effectClone.setParent(this.Spawm);
            effectClone.active = true;
            if (this.Centre != null) {
                const offset = v3(this.CentreOffset.x, this.CentreOffset.y, 0);
                effectClone.worldPosition = this.Centre.worldPosition.clone().add(offset);
            }
            else
                effectClone.worldPosition = this.Destroy.worldPosition;
        }
    }
}