import { _decorator, CCBoolean, CCFloat, CCInteger, Collider2D, Component, director, Enum, Node, RigidBody2D, Tween, tween, v2, v3, Vec2, Vec3 } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { DataRigidbody } from '../data/DataRigidbody';
import { BodyBase } from './BodyBase';
import { BodySpine } from './BodySpine';
import { BodyAttackX } from './hit/BodyAttackX';
import { BodyCheckX } from './physic/BodyCheckX';
import { BodyKnockX } from './physic/BodyKnockX';
const { ccclass, property } = _decorator;

export enum PlayerStateX {
    NONE,
    IDLE,
    MOVE,
    PUSH,
    JUMP,
    AIR,
    HIT,
    DEAD,
    DASH,
    PICK,
    THOW,
    ATTACK,
    ATTACK_HOLD,
};
Enum(PlayerStateX);

export enum BodyType {
    STICK,
    BALL,
}
Enum(BodyType)

@ccclass('BodyControlX')
export class BodyControlX extends Component {

    @property({ type: BodyType })
    Type: BodyType = BodyType.STICK;

    @property({ group: { name: 'MoveX' }, type: CCBoolean })
    LockX: boolean = false;
    @property({ group: { name: 'MoveX' }, type: CCBoolean })
    FaceRight: boolean = true;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX; } })
    MoveGroundX = 40;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX; } })
    MoveAirX: number = 40;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX; } })
    MoveDampX = 40;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX; } })
    MoveDashX = 5000;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX; } })
    DelayDashX = 0.5;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX && this.Type == BodyType.BALL; } })
    TorqueX = 2000;
    @property({ group: { name: 'MoveX' }, type: CCBoolean, visible(this: BodyControlX) { return !this.LockX; } })
    MoveForceStop = true;
    @property({ group: { name: 'MoveX' }, type: CCBoolean, visible(this: BodyControlX) { return !this.LockX; } })
    MoveForceFlip = true;


    @property({ group: { name: 'MoveY' }, type: CCBoolean })
    LockY: boolean = false;
    @property({ group: { name: 'MoveY' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockY; } })
    JumpUpY: number = 90;
    @property({ group: { name: 'MoveY' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockY; } })
    JumpDelay: number = 0.15;
    @property({ group: { name: 'MoveY' }, type: CCInteger, visible(this: BodyControlX) { return !this.LockY; } })
    JumpCount: number = 1;
    @property({ group: { name: 'MoveY' }, type: CCBoolean, visible(this: BodyControlX) { return !this.LockY; } })
    JumpFall: boolean = false;
    @property({ group: { name: 'MoveY' }, type: CCBoolean, visible(this: BodyControlX) { return !this.LockY; } })
    JumpAuto: boolean = false;

    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null; } })
    AttackHold: boolean = false;
    @property({ group: { name: 'Attack' }, type: CCFloat, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null; } })
    AttackDegOffset: number = 0;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null; } })
    AttackAimReset: boolean = true;

    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    DirStopByBodyAttack = true;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    DirStopByPressAttack = true;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    MoveStopByBodyAttack = true;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    MoveStopByPressAttack = true;
    @property({ group: { name: 'Attack' }, type: CCFloat, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    MoveAttackGroundX = 0;
    @property({ group: { name: 'Attack' }, type: CCFloat, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    MoveAttackAirX: number = 0;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    MoveAttackByFace = true;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    DashStopByBodyAttack = false;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    DashStopByPressAttack = false;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    MoveAttackReset = true;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    DashAttackReset = true;

    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockY; } })
    FallAttackStop = false;
    @property({ group: { name: 'Attack' }, type: CCFloat, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null && !this.LockY && !this.FallAttackStop; } })
    FallAttackForce: number = 0; //Default -0.2f for slow fall down while attack

    @property({ group: { name: 'Pick&Throw' }, type: CCBoolean })
    Pick: boolean = false;
    @property({ group: { name: 'Pick&Throw' }, type: CCBoolean, visible(this: BodyControlX) { return this.Pick; } })
    PickHold: boolean = false;
    @property({ group: { name: 'Pick&Throw' }, type: CCBoolean, visible(this: BodyControlX) { return this.Pick; } })
    PickJumpOnce: boolean = true;
    @property({ group: { name: 'Pick&Throw' }, type: Vec2, visible(this: BodyControlX) { return this.Pick; } })
    ThrowForce: Vec2 = v2(20, 20);
    @property({ group: { name: 'Pick&Throw' }, type: Node, visible(this: BodyControlX) { return this.Pick; } })
    PickUpPoint: Node = null;
    @property({ group: { name: 'Pick&Throw' }, type: CCBoolean, visible(this: BodyControlX) { return this.Pick; } })
    UiPickBtnActive: boolean = true;
    @property({ group: { name: 'Pick&Throw' }, type: CCInteger, visible(this: BodyControlX) { return this.Pick; } })
    UiPickIconIndex: number = 0;
    @property({ group: { name: 'Pick&Throw' }, type: CCInteger, visible(this: BodyControlX) { return this.Pick; } })
    UiThrowIconIndex: number = 1;

    @property({ group: { name: 'Switch' }, type: Node })
    SwitchArrow: Node = null;
    @property({ group: { name: 'Switch' }, type: CCInteger, visible(this: BodyControlX) { return this.SwitchArrow != null; } })
    SwitchIndex: number = 0;

    @property({ group: { name: 'End' }, type: CCBoolean, visible(this: BodyControlX) { return this.Pick; } })
    EndPickDestroy: boolean = true;
    @property({ group: { name: 'End' }, type: CCBoolean })
    EndOnGround: boolean = true;
    @property({ group: { name: 'End' }, type: CCBoolean })
    EndRevertX: boolean = false;

    m_baseMass: number = 0;
    m_baseGravity: number = 0;

    m_state = PlayerStateX.IDLE;
    m_moveDirX: number = 0;
    m_moveRatioX: number = 1;
    m_faceDirX: number = 1;
    m_faceDirY: number = 0;

    m_jumpSchedule: any = null;
    m_jumpCountCurrent: number = 0;
    m_jumpContinue: boolean = false;

    m_dash: boolean = false;
    m_dashDelay: boolean = false;
    m_attack: boolean = false;

    m_pickUp: Node = null;
    m_pickUpProgess: boolean = false;
    m_pickUpRigidbody: DataRigidbody = null;
    m_pickUpParent: Node = null;
    m_pickUpSiblingIndex: number = 0;

    m_control: boolean = true;
    m_controlByDirector: boolean = false; //Set TRUE later onLoad
    m_end: boolean = false;
    m_endReady: boolean = false;
    m_endCentre: Vec3;

    m_lockInput: boolean = false;
    m_lockJump: boolean = false;
    m_lockKnockBack: boolean = false;
    m_lockVelocity: boolean = false;

    m_body: BodyBase = null;
    m_bodyCheck: BodyCheckX = null;
    m_bodySpine: BodySpine = null;
    m_bodyKnock: BodyKnockX = null;
    m_bodyAttack: BodyAttackX = null;
    m_rigidbody: RigidBody2D = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_bodyCheck = this.getComponent(BodyCheckX);
        this.m_bodySpine = this.getComponent(BodySpine);
        this.m_bodyKnock = this.getComponent(BodyKnockX);
        this.m_bodyAttack = this.getComponent(BodyAttackX);
        this.m_rigidbody = this.getComponent(RigidBody2D);

        this.onControlByDirector(true);

        director.on(ConstantBase.PLAYER_COMPLETE, this.onComplete, this);
        director.on(ConstantBase.GAME_TIME_OUT, this.onStop, this);

        this.node.on(ConstantBase.NODE_BODY_DEAD, this.onDead, this);
        this.node.on(ConstantBase.NODE_BODY_BOT, this.onBot, this);
        this.node.on(ConstantBase.NODE_BODY_COLLIDE, this.onCollide, this);
        this.node.on(ConstantBase.NODE_BODY_INTERACTE, this.onInteractionFound, this);

        this.node.on(ConstantBase.NODE_CONTROL_DIRECTOR, this.onControlByDirector, this);
        this.node.on(ConstantBase.NODE_CONTROL_NODE, this.onControlByNode, this);
    }

    protected start(): void {
        this.m_baseGravity = this.m_rigidbody.gravityScale;
        this.m_baseMass = this.m_rigidbody.getMass();

        this.m_faceDirX = this.FaceRight ? 1 : -1;
        this.onDirUpdate();

        if (this.UiPickBtnActive)
            director.emit(ConstantBase.UI_INTERACTION_SHOW, false);
    }

    protected lateUpdate(dt: number): void {
        this.onPhysicUpdateY(dt);
        this.onPhysicUpdateX(dt);
        this.onStateUpdate(dt);
        this.onCompleteGroundUpdate(dt);
    }

    //EVENT:

    protected onControlByDirector(state: boolean, full: boolean = true) {
        if (this.m_controlByDirector)
            return;
        this.m_controlByDirector = true;
        if (state) {
            director.on(ConstantBase.CONTROL_UP, this.onMoveUp, this);
            director.on(ConstantBase.CONTROL_DOWN, this.onMoveDown, this);
            director.on(ConstantBase.CONTROL_LEFT, this.onMoveLeft, this);
            director.on(ConstantBase.CONTROL_RIGHT, this.onMoveRight, this);
            director.on(ConstantBase.CONTROL_RELEASE, this.onMoveRelease, this);
            director.on(ConstantBase.CONTROL_RELEASE_X, this.onMoveReleaseX, this);
            director.on(ConstantBase.CONTROL_RELEASE_Y, this.onMoveReleaseY, this);

            director.on(ConstantBase.CONTROL_JUMP, this.onJump, this);
            director.on(ConstantBase.CONTROL_JUMP_RELEASE, this.onJumRelease, this);

            director.on(ConstantBase.CONTROL_DASH, this.onDash, this);

            director.on(ConstantBase.CONTROL_INTERACTION, this.onInteraction, this);
            director.on(ConstantBase.CONTROL_FIXED, this.onFixed, this);

            director.on(ConstantBase.BODY_X2, this.m_body.onBodyX2, this.m_body);
            director.on(ConstantBase.BODY_X4, this.m_body.onBodyX4, this.m_body);

            if (full)
                director.on(ConstantBase.CONTROL_SWITCH, this.onSwitch, this);

            director.on(ConstantBase.BODY_SLEEP, this.onSleep, this);
            director.on(ConstantBase.BODY_AWAKE, this.onAwake, this);

            if (this.m_body != null) {
                director.on(ConstantBase.BODY_VALUE_HIT_POINT, this.m_body.onHitPoint, this.m_body);
                director.on(ConstantBase.BODY_VALUE_HIT_POINT_CURRENT, this.m_body.onHitPointCurrent, this.m_body);
            }

            if (this.m_bodyAttack != null) {
                director.on(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
                director.on(ConstantBase.BODY_ATTACK_ULTIMATE, this.m_bodyAttack.onMeleeUltimate, this.m_bodyAttack);
                director.on(ConstantBase.BODY_VALUE_MELEE_HIT, this.m_bodyAttack.onMeleeHit, this.m_bodyAttack);
            }
        }
        else {
            director.off(ConstantBase.CONTROL_UP, this.onMoveUp, this);
            director.off(ConstantBase.CONTROL_DOWN, this.onMoveDown, this);
            director.off(ConstantBase.CONTROL_LEFT, this.onMoveLeft, this);
            director.off(ConstantBase.CONTROL_RIGHT, this.onMoveRight, this);
            director.off(ConstantBase.CONTROL_RELEASE, this.onMoveRelease, this);
            director.off(ConstantBase.CONTROL_RELEASE_X, this.onMoveReleaseX, this);
            director.off(ConstantBase.CONTROL_RELEASE_Y, this.onMoveReleaseY, this);

            director.off(ConstantBase.CONTROL_JUMP, this.onJump, this);
            director.off(ConstantBase.CONTROL_JUMP_RELEASE, this.onJumRelease, this);

            director.off(ConstantBase.CONTROL_DASH, this.onDash, this);

            director.off(ConstantBase.CONTROL_INTERACTION, this.onInteraction, this);
            director.off(ConstantBase.CONTROL_FIXED, this.onFixed, this);

            director.off(ConstantBase.BODY_X2, this.m_body.onBodyX2, this.m_body);
            director.off(ConstantBase.BODY_X4, this.m_body.onBodyX4, this.m_body);

            if (full)
                director.off(ConstantBase.CONTROL_SWITCH, this.onSwitch, this);

            director.off(ConstantBase.BODY_SLEEP, this.onSleep, this);
            director.off(ConstantBase.BODY_AWAKE, this.onAwake, this);

            if (this.m_body != null) {
                director.off(ConstantBase.BODY_VALUE_HIT_POINT, this.m_body.onHitPoint, this.m_body);
                director.off(ConstantBase.BODY_VALUE_HIT_POINT_CURRENT, this.m_body.onHitPointCurrent, this.m_body);
            }

            if (this.m_bodyAttack != null) {
                director.off(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
                director.off(ConstantBase.BODY_ATTACK_ULTIMATE, this.m_bodyAttack.onMeleeUltimate, this.m_bodyAttack);
                director.off(ConstantBase.BODY_VALUE_MELEE_HIT, this.m_bodyAttack.onMeleeHit, this.m_bodyAttack);
            }
        }
    }

    protected onControlByNode(state: boolean) {
        if (!this.m_controlByDirector)
            return;
        this.m_controlByDirector = false;
        if (state) {
            this.node.on(ConstantBase.CONTROL_UP, this.onMoveUp, this);
            this.node.on(ConstantBase.CONTROL_DOWN, this.onMoveDown, this);
            this.node.on(ConstantBase.CONTROL_LEFT, this.onMoveLeft, this);
            this.node.on(ConstantBase.CONTROL_RIGHT, this.onMoveRight, this);
            this.node.on(ConstantBase.CONTROL_RELEASE, this.onMoveRelease, this);
            this.node.on(ConstantBase.CONTROL_RELEASE_X, this.onMoveReleaseX, this);
            this.node.on(ConstantBase.CONTROL_RELEASE_Y, this.onMoveReleaseY, this);

            this.node.on(ConstantBase.CONTROL_JUMP, this.onJump, this);
            this.node.on(ConstantBase.CONTROL_JUMP_RELEASE, this.onJumRelease, this);

            this.node.on(ConstantBase.CONTROL_DASH, this.onDash, this);

            this.node.on(ConstantBase.CONTROL_INTERACTION, this.onInteraction, this);
            this.node.on(ConstantBase.CONTROL_FIXED, this.onFixed, this);

            // if (full)
            //     this.node.on(ConstantBase.CONTROL_SWITCH, this.onSwitch, this);

            this.node.on(ConstantBase.BODY_SLEEP, this.onSleep, this);
            this.node.on(ConstantBase.BODY_AWAKE, this.onAwake, this);

            if (this.m_body != null) {
                this.node.on(ConstantBase.BODY_VALUE_HIT_POINT, this.m_body.onHitPoint, this.m_body);
                this.node.on(ConstantBase.BODY_VALUE_HIT_POINT_CURRENT, this.m_body.onHitPointCurrent, this.m_body);
            }

            if (this.m_bodyAttack != null) {
                this.node.on(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
                this.node.on(ConstantBase.BODY_ATTACK_ULTIMATE, this.m_bodyAttack.onMeleeUltimate, this.m_bodyAttack);
                this.node.on(ConstantBase.BODY_VALUE_MELEE_HIT, this.m_bodyAttack.onMeleeHit, this.m_bodyAttack);
            }
        }
        else {
            this.node.off(ConstantBase.CONTROL_UP, this.onMoveUp, this);
            this.node.off(ConstantBase.CONTROL_DOWN, this.onMoveDown, this);
            this.node.off(ConstantBase.CONTROL_LEFT, this.onMoveLeft, this);
            this.node.off(ConstantBase.CONTROL_RIGHT, this.onMoveRight, this);
            this.node.off(ConstantBase.CONTROL_RELEASE, this.onMoveRelease, this);
            this.node.off(ConstantBase.CONTROL_RELEASE_X, this.onMoveReleaseX, this);
            this.node.off(ConstantBase.CONTROL_RELEASE_Y, this.onMoveReleaseY, this);

            this.node.off(ConstantBase.CONTROL_JUMP, this.onJump, this);
            this.node.off(ConstantBase.CONTROL_JUMP_RELEASE, this.onJumRelease, this);

            this.node.off(ConstantBase.CONTROL_DASH, this.onDash, this);

            this.node.off(ConstantBase.CONTROL_INTERACTION, this.onInteraction, this);
            this.node.off(ConstantBase.CONTROL_FIXED, this.onFixed, this);

            // if (full)
            //     this.node.off(ConstantBase.CONTROL_SWITCH, this.onSwitch, this);

            this.node.off(ConstantBase.BODY_SLEEP, this.onSleep, this);
            this.node.off(ConstantBase.BODY_AWAKE, this.onAwake, this);

            if (this.m_body != null) {
                this.node.off(ConstantBase.BODY_VALUE_HIT_POINT, this.m_body.onHitPoint, this.m_body);
                this.node.off(ConstantBase.BODY_VALUE_HIT_POINT_CURRENT, this.m_body.onHitPointCurrent, this.m_body);
            }

            if (this.m_bodyAttack != null) {
                this.node.off(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
                this.node.off(ConstantBase.BODY_ATTACK_ULTIMATE, this.m_bodyAttack.onMeleeUltimate, this.m_bodyAttack);
                this.node.off(ConstantBase.BODY_VALUE_MELEE_HIT, this.m_bodyAttack.onMeleeHit, this.m_bodyAttack);
            }
        }
    }

    //STOP:

    protected onStop() {
        director.emit(ConstantBase.CONTROL_RELEASE);
        director.emit(ConstantBase.CONTROL_JUMP_RELEASE);
        director.emit(ConstantBase.CONTROL_LOCK);
        this.onJumRelease();
        this.onMoveRelease();
        if (this.m_bodyAttack != null)
            this.m_bodyAttack.onStop(true);
    }

    //RIGIDBODY:

    onSleep() {
        this.onJumRelease();
        this.onMoveRelease();
        this.m_rigidbody.gravityScale = 0;
        this.m_rigidbody.sleep();
    }

    onAwake() {
        this.m_rigidbody.gravityScale = this.m_baseGravity;
        this.m_rigidbody.wakeUp();
    }

    //MOVE:

    protected onPhysicUpdateX(dt: number) {
        if (this.m_rigidbody == null || !this.m_rigidbody.isValid)
            return;
        if (this.m_lockVelocity)
            return;

        if (this.m_end || this.m_endReady) {
            switch (this.Type) {
                case BodyType.STICK:
                    if (this.m_rigidbody.linearVelocity.clone().x != 0) {
                        this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                        return;
                    }
                    break;
                case BodyType.BALL:
                    if (this.m_rigidbody.angularVelocity != 0) {
                        this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                        this.m_rigidbody.angularVelocity = 0;
                        return;
                    }
                    break;
            }
        }

        if (this.m_dash) {
            this.m_rigidbody.linearVelocity = v2(5000 * this.m_faceDirX, this.m_rigidbody.linearVelocity.clone().y);
            return;
        }

        if (this.getKnock()) {
            //Rigidbody unable move when in knock state
            if (this.m_bodyKnock != null)
                //Fixed knock velocity on player body
                this.m_bodyKnock.onKnock(
                    this.m_bodyKnock.m_from,
                    this.m_bodyKnock.HitDeg,
                    this.m_bodyKnock.HitForce);
            return;
        }

        if (this.MoveForceStop && this.m_moveDirX == 0) {
            switch (this.Type) {
                case BodyType.STICK:
                    if (this.m_rigidbody.linearVelocity.clone().x != 0) {
                        this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                        return;
                    }
                    break;
                case BodyType.BALL:
                    if (this.m_rigidbody.angularVelocity != 0) {
                        this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                        this.m_rigidbody.angularVelocity = 0;
                        return;
                    }
                    break;
            }
        }

        if (this.MoveForceFlip && this.m_moveDirX != 0) {
            switch (this.Type) {
                case BodyType.STICK:
                    if (this.m_rigidbody.linearVelocity.clone().x > 0 && this.m_moveDirX < 0) {
                        this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                        return;
                    }
                    if (this.m_rigidbody.linearVelocity.clone().x < 0 && this.m_moveDirX > 0) {
                        this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                        return;
                    }
                    break;
                case BodyType.BALL:
                    if (this.m_rigidbody.angularVelocity < 0 && this.m_moveDirX < 0) {
                        this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                        this.m_rigidbody.angularVelocity = 1;
                        return;
                    }
                    if (this.m_rigidbody.angularVelocity > 0 && this.m_moveDirX > 0) {
                        this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                        this.m_rigidbody.angularVelocity = -1;
                        return;
                    }
                    break;
            }
        }

        let velocity = this.m_rigidbody.linearVelocity.clone();
        let current = velocity.clone();

        if (this.m_body.m_dead || !this.m_control || this.m_bodyCheck.m_isHead) {
            velocity.x = 0;
            if (this.Type == BodyType.BALL)
                this.m_rigidbody.angularVelocity = 0;
        }
        else {
            if (this.m_bodyCheck.m_isBot) {
                let moveGroundX = this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack) ? this.MoveAttackGroundX : this.MoveGroundX;
                let moveDirX = this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack) ? (this.MoveAttackByFace ? this.m_faceDirX : this.m_moveDirX) : this.m_moveDirX;
                velocity.x += moveDirX * moveGroundX;
                if (velocity.x > moveGroundX)
                    velocity.x = moveGroundX;
                else if (velocity.x < -moveGroundX)
                    velocity.x = -moveGroundX;
                if (this.Type == BodyType.BALL)
                    this.m_rigidbody.applyTorque(-moveDirX * this.TorqueX * (this.m_rigidbody.getMass() / this.m_baseMass) * this.m_body.m_baseSize, true);
            }
            else {
                let moveAirX = this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack) ? this.MoveAttackAirX : this.MoveAirX;
                let moveDirX = this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack) ? (this.MoveAttackByFace ? this.m_faceDirX : this.m_moveDirX) : this.m_moveDirX;
                velocity.x += moveDirX * moveAirX;
                if (velocity.x > moveAirX)
                    velocity.x = moveAirX;
                else if (velocity.x < -moveAirX)
                    velocity.x = -moveAirX;
            }
        }
        velocity.x *= this.m_moveRatioX;
        let damp = current.lerp(velocity, this.MoveDampX * dt);
        this.m_rigidbody.linearVelocity = damp;
    }

    onMoveUp() {
        this.m_faceDirY = 1;
    }

    onMoveDown() {
        this.m_faceDirY = -1;
    }

    onMoveLeft() {
        this.m_moveDirX = !this.LockX ? -1 : 0;
        if (this.m_faceDirX != -1) {
            if (!this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack)) {
                this.m_faceDirX = -1;
                this.onDirUpdate();
            }
        }
        if (this.m_moveDirX != 0 && this.MoveAttackReset && !this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack))
            this.m_bodyAttack?.onAttackReset();
    }

    onMoveRight() {
        this.m_moveDirX = !this.LockX ? 1 : 0;
        if (this.m_faceDirX != 1) {
            if (!this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack)) {
                this.m_faceDirX = 1;
                this.onDirUpdate();
            }
        }
        if (this.m_moveDirX != 0 && this.MoveAttackReset && !this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack))
            this.m_bodyAttack?.onAttackReset();
    }

    onMoveRelease() {
        this.onMoveReleaseX();
        this.onMoveReleaseY();
    }

    onMoveReleaseX() {
        this.m_moveDirX = 0;
        if (this.MoveForceStop) {
            let veloc = this.m_rigidbody.linearVelocity.clone();
            veloc.x = 0;
            this.m_rigidbody.linearVelocity = veloc;
            if (this.Type == BodyType.BALL)
                this.m_rigidbody.applyTorque(0, true);
        }
    }

    onMoveReleaseY() {
        this.m_faceDirY = 0;
    }

    onDirUpdate() {
        this.m_bodyCheck.onDirUpdate(this.m_faceDirX);
        if (this.Type != BodyType.BALL)
            this.m_bodySpine.onViewDirection(this.m_faceDirX);
        if (this.m_bodyAttack != null)
            this.m_bodyAttack.onDirUpdate(this.m_faceDirX);
    }

    //JUMP:

    protected onPhysicUpdateY(dt: number) {
        if (this.m_rigidbody == null || !this.m_rigidbody.isValid)
            return;
        if (this.m_lockVelocity)
            return;

        if (this.m_end || this.m_endReady)
            return;

        if (this.m_dash) {
            this.m_rigidbody.linearVelocity = v2(this.m_rigidbody.linearVelocity.clone().x, 0);
            return;
        }

        if (this.JumpAuto && this.m_bodyCheck.m_isBot)
            this.onJump(dt);

        if (!this.FallAttackStop && this.FallAttackForce != 0 && this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack)) {
            this.m_rigidbody.linearVelocity = v2(this.m_rigidbody.linearVelocity.clone().x, this.FallAttackForce); //Fix bug not fall after attack
            return;
        }
    }

    onJump(dt: number) {
        if (this.LockY || this.m_lockInput || this.m_jumpContinue || this.m_jumpCountCurrent >= this.JumpCount || this.getDead() || this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack) || this.m_dash)
            return;

        if (this.PickJumpOnce && this.m_pickUp != null)
            this.m_jumpCountCurrent = this.JumpCount;
        else if (this.m_jumpCountCurrent < this.JumpCount)
            this.m_jumpCountCurrent++;
        this.m_jumpContinue = true;
        this.m_bodyCheck.onBotCheckOut();

        this.m_rigidbody.gravityScale = this.m_baseGravity;

        let veloc = this.m_rigidbody.linearVelocity;
        veloc.y = this.JumpUpY;
        this.m_rigidbody.linearVelocity = veloc;

        this.m_jumpSchedule = this.scheduleOnce(() => {
            this.m_lockJump = false;
        }, this.JumpDelay);

        if (!this.getDead() && !this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack) && !this.m_dash) {
            this.m_state = PlayerStateX.JUMP;
            this.m_bodySpine.onAirOn();
        }
    }

    onJumRelease() {
        this.unschedule(this.m_jumpSchedule);
        this.m_lockJump = false;
        this.m_jumpContinue = false;
    }

    onJumpForce(jumpUp?: number) {
        this.m_bodyCheck.onBotCheckOut();

        this.m_rigidbody.gravityScale = this.m_baseGravity;

        let veloc = this.m_rigidbody.linearVelocity;
        veloc.y = jumpUp != null ? jumpUp : this.JumpUpY;
        this.m_rigidbody.linearVelocity = veloc;

        if (!this.getDead() && !this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack) && !this.m_dash) {
            this.m_state = PlayerStateX.JUMP;
            this.m_bodySpine.onAirOn();
        }
    }

    protected onBot(stage: boolean) {
        switch (stage) {
            case true:
                this.m_jumpCountCurrent = 0;
                this.m_jumpContinue = false;
                break;
            case false:
                if (!this.JumpFall && this.m_jumpCountCurrent == 0)
                    this.m_jumpCountCurrent = this.JumpCount;
                break;
        }
    }

    //DASH:

    onDash() {
        if (this.m_dash || this.m_dashDelay || this.getAttack(this.DashStopByBodyAttack, this.DashStopByPressAttack))
            return;
        this.m_dash = true;
        this.m_dashDelay = true;
        this.m_moveDirX = this.m_faceDirX;
        this.m_rigidbody.linearVelocity = v2(this.MoveDashX * this.m_faceDirX, 0);
        this.m_rigidbody.gravityScale = 0;
        this.scheduleOnce(() => {
            this.m_dash = false;
            this.m_rigidbody.linearVelocity = v2(0, 0);
            this.m_rigidbody.gravityScale = this.m_baseGravity;
            //
            //Fix bug Dash while Jump cancel current Jump progress, don't remove code below
            if (this.m_bodyCheck.m_isBot) {
                this.m_jumpCountCurrent = 0;
                this.m_jumpContinue = false;
            }
        }, 0.15);
        this.scheduleOnce(() => this.m_dashDelay = false, this.DelayDashX);
        if (this.DashAttackReset)
            this.m_bodyAttack?.onAttackReset();
    }

    //SWITCH

    onSwitch(index: number) {
        let state = index == this.SwitchIndex;
        this.m_control = state;
        this.SwitchArrow.active = state;
        this.onControlByDirector(state, false);
        this.onJumRelease();
        this.onMoveRelease();
    }

    //ATTACK:

    onAttack(state: boolean, update: boolean = true) {
        let attackLast = this.m_attack;
        this.m_attack = state;
        switch (state) {
            case true:
                if (this.FallAttackStop) {
                    if (attackLast != this.m_attack) {
                        this.unschedule(this.m_jumpSchedule);
                        this.m_lockJump = false;
                        this.m_rigidbody.gravityScale = 0;
                        this.m_rigidbody.sleep();
                        this.scheduleOnce(() => {
                            this.m_rigidbody.wakeUp();
                            this.m_rigidbody.linearVelocity = v2(this.m_rigidbody.linearVelocity.clone().x, this.FallAttackForce); //Fix bug not fall after attack
                        }, 0.02);
                    }
                }
                if (!this.AttackHold) {
                    this.onAim();
                    this.onAttackProgess();
                }
                break;
            case false:
                if (this.FallAttackStop) {
                    if (attackLast != this.m_attack) {
                        this.m_rigidbody.gravityScale = this.m_baseGravity;
                        this.m_rigidbody.linearVelocity = v2(this.m_rigidbody.linearVelocity.clone().x, -0.02); //Fix bug not fall after attack
                    }
                }
                if (this.AttackHold) {
                    this.onAttackProgess();
                    this.onAimReset();
                }
                break;
        }
    }

    protected onAim() {
        if (this.m_bodyAttack == null)
            return;
        if (!this.m_bodyAttack.Aim)
            return;
        this.m_bodyAttack.onDirUpdate(this.m_faceDirX);
        let target = this.m_bodyAttack.onRangeTargetNearest();
        if (target == null ? true : !target.isValid)
            this.onAimReset();
        else
            this.m_bodyAttack.onAimTarget(target);
    }

    protected onAimReset() {
        if (this.m_bodyAttack == null)
            return;
        this.m_bodyAttack.onDirUpdate(this.m_faceDirX);
        if (this.AttackAimReset)
            this.m_bodyAttack.onAimReset();
        else
            this.m_bodyAttack.onAimDeg(this.m_faceDirX == 1 ? 0 + this.AttackDegOffset : 180 - this.AttackDegOffset);
    }

    protected onAttackProgess() {
        if (this.m_bodyAttack == null)
            return;
        if (this.MoveStopByBodyAttack || this.MoveStopByPressAttack)
            this.m_bodySpine.onIdle(true);
        this.scheduleOnce(() => this.m_bodyAttack.onAttackProgess());
    }

    //INTERACTION:

    onInteraction() {
        if (this.Pick)
            this.onInteractionPickAndThrow();
    }

    onInteractionPickAndThrow() {
        if (this.m_pickUpProgess)
            return;
        let delayPick = 0;
        if (this.m_pickUp == null) {
            if (this.m_bodyCheck.m_targetInteracte.length == 0)
                return;
            this.m_pickUpProgess = true;
            //Add Pick-up Object to current saved
            this.m_pickUp = this.m_bodyCheck.m_targetInteracte[0];
            this.m_pickUpParent = this.m_pickUp.parent;
            this.m_pickUpSiblingIndex = this.m_pickUp.getSiblingIndex();
            //Save Pick-up Object's Rigidbody imformation before destroy it
            let pickUpRigidbody = this.m_pickUp.getComponent(RigidBody2D);
            this.m_pickUpRigidbody = new DataRigidbody(pickUpRigidbody);
            this.scheduleOnce(() => {
                if (this.m_pickUp == null ? true : !this.m_pickUp.isValid)
                    return;
                pickUpRigidbody.destroy();
                //Set parent of Pick-up Object to Pick-up Point and Tween Move it
                this.m_pickUp.setParent(this.PickUpPoint, true);
                tween(this.m_pickUp)
                    .to(0.2, { position: Vec3.ZERO }, { easing: 'linear' })
                    .start();
            }, 0.02);
            //Node Event
            this.m_pickUp.emit(ConstantBase.NODE_PICK);
            //Animation
            delayPick = this.m_bodySpine.onPick();
            this.scheduleOnce(() => this.m_bodySpine.onPickLoop(), this.m_bodySpine.onPick());
            //Ui
            director.emit(ConstantBase.UI_INTERACTION_ICON, this.UiThrowIconIndex);
        }
        else {
            this.m_pickUpProgess = true;
            //Node Event
            this.m_pickUp.emit(ConstantBase.NODE_THROW);
            //Add Rigidbody to Pick-up Object and set back imformation to it
            let pickUpRigidbody = this.m_pickUp.addComponent(RigidBody2D);
            this.m_pickUpRigidbody.onUpdate(pickUpRigidbody);
            //Fixed collider collision after add Rigidbody component to Pick-up Object
            let pickUpColliders = this.m_pickUp.getComponents(Collider2D);
            pickUpColliders.forEach(collider => {
                collider.apply();
            });
            //Add velocity throw to Pick-up Object by current face dir and direction control
            this.scheduleOnce(() => {
                if (this.m_faceDirY > 0)
                    pickUpRigidbody.linearVelocity = v2(0, this.ThrowForce.y);
                else
                    pickUpRigidbody.linearVelocity = v2(this.ThrowForce.x * this.m_faceDirX, this.ThrowForce.y);
            }, 0.02);
            //Remove Pick-up Object from current saved
            this.m_pickUp.setParent(this.m_pickUpParent, true);
            this.m_pickUp.setSiblingIndex(this.m_pickUpSiblingIndex);
            this.m_pickUp = null;
            //Animation
            delayPick = this.m_bodySpine.onThrow();
            this.scheduleOnce(() => this.m_bodySpine.onPickEmty(), this.m_bodySpine.onThrow());
            //Ui
            if (this.UiPickBtnActive)
                director.emit(ConstantBase.UI_INTERACTION_SHOW, false);
            director.emit(ConstantBase.UI_INTERACTION_ICON, this.UiPickIconIndex);
        }
        if (this.m_pickUpProgess)
            this.scheduleOnce(() => this.m_pickUpProgess = false, delayPick + 0.02);
    }

    protected onInteractionFound(target: Node, stage: boolean) {
        if (this.m_pickUp != null)
            return;
        if (this.m_bodyCheck.m_targetInteracte.length == 0) {
            if (this.UiPickBtnActive)
                director.emit(ConstantBase.UI_INTERACTION_SHOW, false);
            return;
        }
        if (this.UiPickBtnActive)
            director.emit(ConstantBase.UI_INTERACTION_SHOW, true);
        director.emit(ConstantBase.UI_INTERACTION_ICON, this.UiPickIconIndex);
    }

    //COLLIDE

    protected onCollide(target: Node) {
        if (this.m_body.m_bodyX4) {
            let bodyTarget = target.getComponent(BodyBase);
            if (bodyTarget != null)
                bodyTarget.onDead(this.node);
        }
    }

    //FIXED:

    protected onFixed() {
        switch (this.Type) {
            case BodyType.STICK:
                this.onAimReset();
                break;
            case BodyType.BALL:
                this.onJumpForce();
                tween(this.node)
                    .to(0.5, { eulerAngles: v3(0, 0, 0) })
                    .start();
                break;
        }
    }

    //STAGE:

    protected onStateUpdate(dt: number) {
        let state = PlayerStateX.IDLE;
        //FIND STAGE:
        if (this.getDead())
            state = PlayerStateX.DEAD;
        else if (this.getHit())
            state = PlayerStateX.HIT;
        else if (this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack)) {
            if (this.AttackHold)
                state = PlayerStateX.ATTACK_HOLD;
            else
                state = PlayerStateX.ATTACK;
        }
        else if (this.m_dash)
            state = PlayerStateX.DASH;
        else if (!this.m_bodyCheck.m_isBot) {
            if (this.m_rigidbody.linearVelocity.y > 0)
                state = PlayerStateX.JUMP;
            else if (this.m_rigidbody.linearVelocity.y < 0)
                state = PlayerStateX.AIR;
        }
        else {
            if (this.m_moveDirX == 0)
                state = PlayerStateX.IDLE;
            else if (!this.m_bodyCheck.m_isHead)
                state = PlayerStateX.MOVE;
            else
                state = PlayerStateX.PUSH;
        }
        //UPDATE STAGE:
        if (this.m_state == state)
            return;
        this.m_state = state;
        switch (this.m_state) {
            case PlayerStateX.IDLE:
                this.m_bodySpine.onIdle();
                break;
            case PlayerStateX.MOVE:
                this.m_bodySpine.onMove();
                break;
            case PlayerStateX.PUSH:
                this.m_bodySpine.onPush();
                break;
            case PlayerStateX.JUMP:
                this.m_bodySpine.onAirOn(false);
                break;
            case PlayerStateX.AIR:
                this.m_bodySpine.onAirOff();
                break;
            // case PlayerStateX.HIT:
            //     break;
            case PlayerStateX.DASH:
                this.m_bodySpine.onDash();
                break;
            case PlayerStateX.ATTACK:
                if (this.AttackHold)
                    this.m_bodyAttack.onAnimAttackUnReady();
                break;
            case PlayerStateX.ATTACK_HOLD:
                if (this.AttackHold) {
                    this.m_bodyAttack.onAnimAttackUnReady();
                    this.m_bodyAttack.onAnimAttackReady();
                }
                break;
        }
        this.m_state = state;
    }

    //GET:

    getHit(): boolean {
        if (this.m_bodySpine != null ? this.m_bodySpine.AnimHitActive : false)
            return this.m_bodySpine.m_hit;
        return this.m_body.m_hit;
    }

    getDead(): boolean {
        if (this.m_bodySpine != null)
            return this.m_bodySpine.m_dead;
        return this.m_body.m_dead;
    }

    getKnock(): boolean {
        if (this.m_bodyKnock != null)
            return this.m_bodyKnock.m_knock;
        return false;
    }

    getAttack(stopByBodyAttack: boolean, stopByPressAttack: boolean): boolean {
        if (stopByBodyAttack && this.m_bodyAttack != null ? this.m_bodyAttack.m_attack : false)
            return true;
        if (stopByPressAttack && this.m_attack)
            return true;
        return false;
    }

    //COMPLETE:

    /**Check Player on ground after excute complete and 'EndOnGround' value is TRUE*/
    protected onCompleteGroundUpdate(dt: number) {
        if (!this.EndOnGround)
            return;
        if (!this.m_end || !this.m_endReady || !this.m_bodyCheck.m_isBot)
            return;
        this.m_endReady = false;
        this.onCompleteProgess();
    }

    /**Excute Player complete, but not continue complete progress if 'EndOnGround' value is TRUE*/
    protected onComplete(state: boolean, target: Node) {
        director.emit(ConstantBase.CONTROL_RELEASE);
        director.emit(ConstantBase.CONTROL_JUMP_RELEASE);
        director.emit(ConstantBase.CONTROL_LOCK);

        this.m_end = true;
        this.m_endReady = this.EndOnGround;

        this.onJumRelease();
        this.onMoveRelease();
        if (this.m_bodyAttack != null)
            this.m_bodyAttack.onStop(true);

        if (!this.EndOnGround)
            this.onCompleteProgess();

        if (this.Type == BodyType.BALL) {
            let centre = target.getChildByName('centre') ?? target;
            this.m_endCentre = centre.worldPosition.clone();
        }
    }

    protected onCompleteProgess() {
        if (this.Pick && this.EndPickDestroy) {
            if (this.m_pickUp != null ? this.m_pickUp.isValid : false)
                this.m_pickUp.destroy();
            this.m_bodySpine.onPickEmty();
        }
        if (this.EndRevertX) {
            this.m_faceDirX *= -1;
            this.m_bodySpine.onViewDirection(this.m_faceDirX);
        }
        this.scheduleOnce(() => {
            switch (this.Type) {
                case BodyType.BALL:
                    this.m_rigidbody.destroy();
                    tween(this.node)
                        .to(0.2, { worldPosition: this.m_endCentre })
                        .to(0.3, { scale: this.node.scale.clone().add(v3(1, 1, 1)) })
                        .to(0.2, { scale: v3() })
                        .call(() => {
                            this.scheduleOnce(() => {
                                director.emit(ConstantBase.GAME_COMPLETE);
                            }, this.m_bodySpine.onComplete());
                        })
                        .start();
                    break;
                default:
                    this.scheduleOnce(() => {
                        director.emit(ConstantBase.GAME_COMPLETE);
                    }, this.m_bodySpine.onComplete());
                    break;
            }
        }, 0);
    }

    //DEAD:

    protected onDead() {
        director.emit(ConstantBase.CONTROL_RELEASE);
        director.emit(ConstantBase.CONTROL_JUMP_RELEASE);
        director.emit(ConstantBase.CONTROL_LOCK);

        this.m_end = true;

        this.onJumRelease();
        this.onMoveRelease();
        if (this.m_bodyAttack != null)
            this.m_bodyAttack.onStop(true);

        if (this.Pick && this.EndPickDestroy) {
            if (this.m_pickUp != null ? this.m_pickUp.isValid : false)
                this.m_pickUp.destroy();
            this.m_bodySpine.onPickEmty();
        }
        this.scheduleOnce(() => {
            this.m_rigidbody.sleep();
            this.scheduleOnce(() => this.m_rigidbody.wakeUp(), 0.02);
            this.scheduleOnce(() => {
                console.log('Game Lose');
                director.emit(ConstantBase.GAME_LOSE);
            }, this.m_bodySpine.onDead());
        }, 0);
    }
}