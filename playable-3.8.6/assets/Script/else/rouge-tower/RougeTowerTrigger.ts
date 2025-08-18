import { _decorator, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { SpineBase } from '../../renderer/SpineBase';
import { BodyPoint } from '../../body/option/BodyPoint';
import { BodyBase } from '../../body/BodyBase';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('RougeTowerTrigger')
export class RougeTowerTrigger extends Component {

    @property({ group: { name: 'Anim' }, type: CCString })
    AnimIdle: string = "idle";
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimAttack: string = "attack";
    @property({ group: { name: 'Anim' }, type: CCFloat })
    AnimAttackTimeScale: number = 1;
    @property({ group: { name: 'Anim' }, type: CCFloat })
    DelayAttack: number = 0.5;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagTrigger: number = 201;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagPlayer: number = 100;

    m_spine: SpineBase = null;
    m_point: BodyPoint = null;

    protected onLoad(): void {
        this.m_spine = this.getComponent(SpineBase);
        this.m_point = this.getComponent(BodyPoint);

        let colliders = this.getComponents(Collider2D);
        for (let i = 0; i < colliders.length; i++) {
            let collider = colliders[i];
            switch (collider.tag) {
                case this.TagTrigger:
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    break;
            }
        }
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagTrigger:
                switch (otherCollider.tag) {
                    case this.TagPlayer:
                        this.onBattleProgress(otherCollider.node);
                        break;
                }
                break;
        }
    }

    onBattleProgress(player: Node) {
        const playerPoint = player.getComponent(BodyPoint);
        if (this.m_point.Value > playerPoint.Value) {
            //MONSTER
            this.scheduleOnce(() => {
                this.m_spine.onAnimation(this.AnimIdle, true);
            }, this.m_spine.onAnimation(this.AnimAttack, false, true, this.AnimAttackTimeScale));
            //PLAYER
            player.emit(ConstantBase.NODE_VALUE_LOCK_X, true);
            this.scheduleOnce(() => {
                //DEAD
                player.emit(ConstantBase.NODE_BODY_DEAD);
                //POINT
                this.m_point.onValueAdd(playerPoint.Value);
                playerPoint.onValueAdd(-9999);
            }, this.DelayAttack);
        }
        else {
            //...
        }
    }
}