import { _decorator, CCBoolean, CCFloat, Component, Enum, RigidBody2D, Vec3, Node, v3, CCString } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { SpineBase } from '../../renderer/SpineBase';
import { BodyBase } from '../BodyBase';
import { BodyAttackX } from '../hit/BodyAttackX';
import { BodyCheckX } from './BodyCheckX';
import { BodyKnockX } from './BodyKnockX';
const { ccclass, property, requireComponent } = _decorator;

export enum BodyState {
    NONE, //This compomnent out of control when in this state
    IDLE,
    MOVE,
    HIT,
    DEAD,
}
Enum(BodyState)

@ccclass('BodyMovePathX')
@requireComponent(BodyBase)
@requireComponent(BodyCheckX)
@requireComponent(SpineBase)
@requireComponent(RigidBody2D)
export class BodyMovePathX extends Component {

    @property({ group: { name: 'Move' }, type: CCBoolean })
    MoveRight: boolean = true;
    @property({ group: { name: 'Move' }, type: CCFloat })
    MoveGroundX: number = 5;
    @property({ group: { name: 'Move' }, type: CCFloat })
    MoveAirX: number = 0;

    @property({ group: { name: 'Move' }, type: CCBoolean })
    CheckHead: boolean = true;
    @property({ group: { name: 'Move' }, type: CCBoolean })
    CheckBotHead: boolean = true;

    @property({ group: { name: 'Path' }, type: CCBoolean })
    PathActive: boolean = false;
    @property({ group: { name: 'Path' }, type: CCFloat })
    PathOffsetXL: number = 500;
    @property({ group: { name: 'Path' }, type: CCFloat })
    PathOffsetXR: number = 500;

    @property({ group: { name: 'Anim' }, type: CCString })
    AnimMove: string = 'move';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimPush: string = 'push';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimAirOn: string = 'air_on';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimAirOff: string = 'air_off';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimDash: string = 'dash';

    m_state: BodyState = BodyState.IDLE;
    m_move: boolean = false;
    m_dir: number;
    m_animHitDuration: number = 0;
    m_pathXStart: number;
    m_pathXL: number;
    m_pathXR: number;

    m_lockVelocity: boolean = false;
    m_pick: boolean = false;
    m_picked: boolean = false;

    m_followBody: Node = null;
    m_followLastPos: Vec3;

    m_body: BodyBase = null;
    m_bodyCheck: BodyCheckX = null;
    m_bodyKnock: BodyKnockX = null;
    m_bodyAttack: BodyAttackX = null;
    m_spine: SpineBase = null;
    m_rigidbody: RigidBody2D = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_bodyCheck = this.getComponent(BodyCheckX);
        this.m_bodyKnock = this.getComponent(BodyKnockX);
        this.m_bodyAttack = this.getComponent(BodyAttackX);
        this.m_spine = this.getComponent(SpineBase);
        this.m_rigidbody = this.getComponent(RigidBody2D);

        this.node.on(ConstantBase.NODE_PICK, this.onPick, this);
        this.node.on(ConstantBase.NODE_THROW, this.onThrow, this);
    }

    protected start(): void {
        this.m_dir = this.MoveRight ? 1 : -1;
        this.onDirUpdate();

        this.m_pathXStart = this.node.position.clone().x;
        this.m_pathXL = this.m_pathXStart - this.PathOffsetXL;
        this.m_pathXR = this.m_pathXStart + this.PathOffsetXR;
    }

    protected update(dt: number): void {
        //IMPORTANCE: Must be UPDATE instead of LATE UPDATE
        this.onPhysicUpdateX(dt);
        this.onFollowUpdate(dt);
        this.onHeadChange(dt);
        this.onStateUpdate(dt);
    }

    //MOVE

    protected onPhysicUpdateX(dt: number) {
        if (this.m_rigidbody == null || !this.m_rigidbody.isValid)
            this.m_rigidbody = this.getComponent(RigidBody2D);
        if (this.m_rigidbody == null || !this.m_rigidbody.isValid)
            return;

        //if (!this.m_rigidbody.isAwake())
        //Rigidbody wake up again if it's not awake
        //    this.m_rigidbody.wakeUp();

        if (this.getKnock())
            //Rigidbody unable move when in knock state
            return;

        if (this.m_picked && !this.m_pick && this.m_bodyCheck.m_isBotFinal) {
            this.m_picked = false;
            this.m_lockVelocity = false;
        }

        if (this.m_lockVelocity)
            return;

        let velocity = this.m_rigidbody.linearVelocity.clone();
        if (this.getDead() || this.getHit()) {
            this.m_move = false;
            velocity.x = 0;
        }
        else if (this.getAttack() || this.getAttackAvaible()) {
            this.m_move = false;
            velocity.x = 0;
        }
        else if (this.m_bodyCheck.m_isBotFinal) {
            this.m_move = this.MoveGroundX > 0;
            velocity.x = this.m_dir * this.MoveGroundX;
        }
        else {
            this.m_move = this.MoveAirX > 0;
            velocity.x = this.m_dir * this.MoveAirX;
        }
        this.m_rigidbody.linearVelocity = velocity;
    }

    protected onHeadChange(dt: number) {
        if (this.getDead() || this.getHit() || !this.getHeadChange())
            return;
        this.m_dir *= -1;
        this.onDirUpdate();
    }

    getHeadChange(): boolean {
        if (this.getKnock())
            return false;
        if (this.CheckHead && this.m_bodyCheck.m_isHead)
            return true;
        if (this.CheckBotHead && this.m_bodyCheck.m_isBotHead && this.m_bodyCheck.m_isBotFinal)
            return true;
        if (this.PathActive) {
            if (this.m_dir == 1 && this.node.position.clone().x > this.m_pathXR)
                return true;
            if (this.m_dir == -1 && this.node.position.clone().x < this.m_pathXL)
                return true;
        }
        return false;
    }

    onDirUpdate() {
        this.m_bodyCheck.onDirUpdate(this.m_dir);
        this.m_spine.onFaceDir(this.m_dir);
        if (this.m_bodyAttack != null)
            this.m_bodyAttack.onDirUpdate(this.m_dir);
    }

    //GET

    protected onStateUpdate(dt: number) {
        let state = BodyState.IDLE;
        //FIND STATE:
        if (this.getDead())
            state = BodyState.DEAD;
        else if (this.getHit())
            state = BodyState.HIT;
        else if (this.getAttack())
            state = BodyState.NONE;
        else if (this.m_move && this.MoveGroundX != 0)
            state = BodyState.MOVE;
        else
            state = BodyState.IDLE;
        //UPDATE STATE:
        if (state == this.m_state)
            return;
        this.m_state = state;
        switch (this.m_state) {
            case BodyState.NONE:
                break;
            case BodyState.IDLE:
                this.m_body.onAnimationIdle();
                break;
            case BodyState.MOVE:
                this.m_body.onAnimation(this.AnimMove, true);
                break;
            case BodyState.HIT:
                break;
            case BodyState.DEAD:
                break;
        }
    }

    getHit(): boolean {
        return this.m_body.m_hit;
    }

    getDead(): boolean {
        return this.m_body.m_dead;
    }

    getAttack(): boolean {
        return this.m_bodyAttack != null ? this.m_bodyAttack.m_attack : false;
    }

    getAttackAvaible(): boolean {
        return this.m_bodyAttack.getAttackAvaible();
    }

    getKnock(): boolean {
        if (this.m_bodyKnock != null)
            return this.m_bodyKnock.m_knock;
        return false;
    }

    onPick() {
        this.m_pick = true;
        this.m_picked = true;
        this.m_lockVelocity = true;
    }

    onThrow() {
        this.m_pick = false;
    }

    //FOLLOW

    protected onFollowUpdate(dt: number) {
        if (this.getKnock() || this.getDead())
            return;
        if (this.m_bodyCheck.m_isBotFinal) {
            if (this.m_followBody == null || !this.m_followBody.isValid) {
                let currentBot = this.m_bodyCheck.m_currentBot;
                this.m_followBody = currentBot != null ? currentBot.node : null;
                if (this.m_followBody != null && this.m_followBody.isValid)
                    this.m_followLastPos = this.m_followBody.position.clone();
            }
            if (this.m_followBody != null && this.m_followBody.isValid) {
                let offsetPos = this.m_followBody.position.clone().subtract(this.m_followLastPos);
                if (offsetPos.length() > 0) {
                    this.m_followLastPos = this.m_followBody.position.clone();
                    this.node.setPosition(this.node.position.clone().add(offsetPos));
                }
            }
        }
        else {
            this.m_followBody = null;
            this.m_followLastPos = v3();
        }
    }
}