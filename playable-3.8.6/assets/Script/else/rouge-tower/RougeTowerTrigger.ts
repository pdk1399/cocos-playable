import { _decorator, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { SpineBase } from '../../renderer/SpineBase';
import { BodyPoint } from '../../body/option/BodyPoint';
import { BodyBase } from '../../body/BodyBase';
import { ConstantBase } from '../../ConstantBase';
import { BodyCheckX } from '../../body/physic/BodyCheckX';
const { ccclass, property } = _decorator;

@ccclass('RougeTowerTrigger')
export class RougeTowerTrigger extends Component {

    @property({ group: { name: 'Enermy' }, type: CCString })
    EAnimIdle: string = "idle";
    @property({ group: { name: 'Enermy' }, type: CCString })
    EAnimAttack: string = "attack";
    @property({ group: { name: 'Enermy' }, type: CCFloat })
    EAnimAttackTimeScale: number = 1;
    @property({ group: { name: 'Enermy' }, type: CCFloat })
    EDelayAttack: number = 0.5;

    @property({ group: { name: 'Player' }, type: CCString })
    PAnimIdle: string = "idle";
    @property({ group: { name: 'Player' }, type: CCString })
    PAnimAttack: string = "attack";
    @property({ group: { name: 'Player' }, type: CCFloat })
    PAnimAttackTimeScale: number = 1;
    @property({ group: { name: 'Player' }, type: CCFloat })
    PDelayAttack: number = 0.5;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagTrigger: number = 201;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagPlayer: number = 100;

    m_spine: SpineBase = null;
    m_point: BodyPoint = null;
    m_player: Node = null;
    m_playerPoint: BodyPoint = null;
    m_playerSpine: SpineBase = null;
    m_playerCheck: BodyCheckX = null;

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
        //PLAYER
        this.m_player = player;
        this.m_playerPoint = player.getComponent(BodyPoint);
        this.m_playerSpine = player.getComponent(SpineBase);
        this.m_playerCheck = player.getComponent(BodyCheckX);
        player.emit(ConstantBase.NODE_VALUE_LOCK_X, true);
        player.emit(ConstantBase.NODE_VALUE_LOCK_Y, true);
        player.emit(ConstantBase.NODE_CONTROL_SLEEP);
        this.scheduleOnce(() => player.emit(ConstantBase.NODE_CONTROL_AWAKE), 0.02);
        player.emit(ConstantBase.NODE_CONTROL_DIRECTOR, false);
        player.emit(ConstantBase.NODE_CONTROL_NODE, true);
        //DIR
        if (this.node.worldPositionX < player.worldPositionX) {
            this.m_spine.onFaceDir(-1);
            this.m_player.emit(ConstantBase.NODE_CONTROL_FACE_X_LEFT);
        }
        else {
            this.m_spine.onFaceDir(1);
            this.m_player.emit(ConstantBase.NODE_CONTROL_FACE_X_RIGHT);
        }
        //POINT
        if (this.m_point.Value >= this.m_playerPoint.Value)
            this.onEnermyWin();
        else
            this.onPlayerFall();
    }

    onEnermyWin() {
        //MONSTER
        this.scheduleOnce(() => {
            this.m_spine.onAnimation(this.EAnimIdle, true);
        }, this.m_spine.onAnimation(this.EAnimAttack, false, true, this.EAnimAttackTimeScale));
        //PLAYER
        this.scheduleOnce(() => {
            //DEAD
            this.m_player.emit(ConstantBase.NODE_BODY_DEAD);
            //POINT
            this.m_point.onValueAdd(this.m_playerPoint.Value);
            this.m_playerPoint.onValueAdd(-9999);
        }, this.EDelayAttack);
    }

    onPlayerFall() {
        if (this.m_playerCheck.m_isBotFinal)
            this.scheduleOnce(() => this.onPlayerWin(), 0.2);
        else
            this.scheduleOnce(() => this.onPlayerFall(), 0.02);
    }

    onPlayerWin() {
        //PLAYER
        this.scheduleOnce(() => {
            this.m_playerSpine.onAnimationForce(this.PAnimIdle, true);
        }, this.m_playerSpine.onAnimationForce(this.PAnimAttack, false, true, this.PAnimAttackTimeScale));
        //MONSTER
        this.scheduleOnce(() => {
            //DEAD
            this.node.emit(ConstantBase.NODE_BODY_DEAD);
            //POINT
            this.m_playerPoint.onValueAdd(this.m_point.Value);
            this.m_point.onValueAdd(-9999);
            //PLAYER
            this.scheduleOnce(() => {
                this.m_player.emit(ConstantBase.NODE_VALUE_LOCK_X, false);
                this.m_player.emit(ConstantBase.NODE_VALUE_LOCK_Y, false);
                this.m_player.emit(ConstantBase.NODE_CONTROL_DIRECTOR, true);
                this.m_player.emit(ConstantBase.NODE_CONTROL_NODE, false);
            }, 0.25);
        }, this.PDelayAttack);
    }
}