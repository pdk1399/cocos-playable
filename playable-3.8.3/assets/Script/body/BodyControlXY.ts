import { _decorator, CCBoolean, CCFloat, CCInteger, Component, director, Enum, Node, RigidBody2D, v2, Vec2 } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { BodyBase } from './BodyBase';
import { BodySpine } from './BodySpine';
import { BodyAttackX } from './hit/BodyAttackX';
import { BodyKnockXY } from './physic/BodyKnockXY';
const { ccclass, property } = _decorator;

export enum PlayerStateXY {
    NONE,
    IDLE,
    MOVE,
    HIT,
    DEAD,
    DASH,
    ATTACK,
    ATTACK_HOLD,
};
Enum(PlayerStateXY);

@ccclass('BodyControlXY')
export class BodyControlXY extends Component {

    @property({ group: { name: 'MoveXY' }, type: CCBoolean })
    LockX: boolean = false;
    @property({ group: { name: 'MoveXY' }, type: CCBoolean })
    LockY: boolean = false;
    @property({ group: { name: 'MoveXY' }, type: CCBoolean })
    FaceRight: boolean = true;
    @property({ group: { name: 'MoveXY' }, type: CCFloat, visible(this: BodyControlXY) { return !this.LockX; } })
    MoveGround: number = 40;
    @property({ group: { name: 'MoveXY' }, type: CCFloat, visible(this: BodyControlXY) { return !this.LockX; } })
    MoveDamp: number = 40;
    @property({ group: { name: 'MoveXY' }, type: CCFloat, visible(this: BodyControlXY) { return !this.LockX; } })
    MoveDash: number = 5000;
    @property({ group: { name: 'MoveXY' }, type: CCFloat, visible(this: BodyControlXY) { return !this.LockX; } })
    DelayDash: number = 0.5;
    @property({ group: { name: 'MoveXY' }, type: CCBoolean, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null; } })
    MoveStopAttack: boolean = false;
    @property({ group: { name: 'MoveXY' }, type: CCBoolean, visible(this: BodyControlXY) { return !this.MoveStopAttack && this.getComponent(BodyAttackX) != null; } })
    MoveStopByBodyAttack: boolean = true;
    @property({ group: { name: 'MoveXY' }, type: CCBoolean, visible(this: BodyControlXY) { return !this.MoveStopAttack && this.getComponent(BodyAttackX) != null; } })
    MoveStopByPressAttack: boolean = true;

    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null; } })
    AttackHold: boolean = false;
    @property({ group: { name: 'Attack' }, type: CCFloat, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null; } })
    AttackDegOffset: number = 0;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null; } })
    AttackAimReset: boolean = true;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    DashStopByBodyAttack: boolean = false;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    DashStopByPressAttack: boolean = false;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    MoveAttackReset: boolean = true;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null && !this.LockX; } })
    DashAttackReset: boolean = true;

    @property({ group: { name: 'Switch' }, type: CCInteger })
    SwitchIndex: number = 0;

    m_state = PlayerStateXY.IDLE;
    m_move: boolean = false;
    m_moveDir: Vec2 = v2();
    m_moveRatio: number = 1;
    m_faceDirX: number = 1;
    m_faceDir: Vec2 = v2();

    m_dash: boolean = false;
    m_dashDelay: boolean = false;
    m_attack: boolean = false;

    m_control: boolean = true;
    m_controlByDirector: boolean = null;
    m_controlByNode: boolean = null;
    m_end: boolean = false;

    m_lockInput: boolean = false;
    m_lockKnockBack: boolean = false;
    m_lockVelocity: boolean = false;

    m_body: BodyBase = null;
    m_bodySpine: BodySpine = null;
    m_bodyKnock: BodyKnockXY = null;
    m_bodyAttack: BodyAttackX = null;
    m_rigidbody: RigidBody2D = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_bodySpine = this.getComponent(BodySpine);
        this.m_bodyKnock = this.getComponent(BodyKnockXY);
        this.m_bodyAttack = this.getComponent(BodyAttackX);
        this.m_rigidbody = this.getComponent(RigidBody2D);

        this.onControlByDirector(true);

        director.on(ConstantBase.PLAYER_COMPLETE, this.onComplete, this);
        director.on(ConstantBase.GAME_TIME_OUT, this.onStop, this);

        this.node.on(ConstantBase.NODE_COLLIDE_BODY, this.onCollideBody, this);

        this.node.on(ConstantBase.NODE_CONTROL_FACE_X_RIGHT, this.onFaceRight, this);
        this.node.on(ConstantBase.NODE_CONTROL_FACE_X_LEFT, this.onFaceLeft, this);
        this.node.on(ConstantBase.NODE_CONTROL_FACE_X_REVERSE, this.onFaceReverseX, this);

        this.node.on(ConstantBase.NODE_CONTROL_DIRECTOR, this.onControlByDirector, this);
        this.node.on(ConstantBase.NODE_CONTROL_NODE, this.onControlByNode, this);
        this.node.on(ConstantBase.NODE_CONTROL_SLEEP, this.onControlSleep, this);
        this.node.on(ConstantBase.NODE_CONTROL_AWAKE, this.onControlAwake, this);

        this.node.on(ConstantBase.NODE_BODY_DEAD, this.onControlDead, this);

        this.node.on(ConstantBase.NODE_VALUE_LOCK_X, this.onValueLockX, this);
        this.node.on(ConstantBase.NODE_VALUE_LOCK_Y, this.onValueLockY, this);
        this.node.on(ConstantBase.NODE_VALUE_MOVE_GROUND, this.onValueMoveGround, this);
    }

    protected start(): void {
        this.m_faceDirX = this.FaceRight ? 1 : -1;
        this.m_faceDir = this.FaceRight ? v2(1, 0) : v2(-1, 0);
        this.onDirUpdate();
    }

    protected lateUpdate(dt: number): void {
        this.onPhysicUpdate(dt);
        this.onStateUpdate(dt);
    }

    //EVENT:

    protected onControlByDirector(state: boolean) {
        if (this.m_controlByDirector == state)
            return;
        this.m_controlByDirector = state;
        if (state) {
            director.on(ConstantBase.CONTROL_JOY_STICK, this.onJoyStick, this);
            director.on(ConstantBase.CONTROL_FIXED, this.onFixed, this);
            director.on(ConstantBase.CONTROL_SWITCH, this.onSwitch, this);
            if (this.m_bodyAttack != null)
                director.on(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
        }
        else {
            director.off(ConstantBase.CONTROL_JOY_STICK, this.onJoyStick, this);
            director.off(ConstantBase.CONTROL_FIXED, this.onFixed, this);
            director.off(ConstantBase.CONTROL_SWITCH, this.onSwitch, this);
            if (this.m_bodyAttack != null)
                director.off(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
        }
    }

    protected onControlByNode(state: boolean) {
        if (this.m_controlByNode == state)
            return;
        this.m_controlByNode = state;
        if (state) {
            this.node.on(ConstantBase.CONTROL_JOY_STICK, this.onJoyStick, this);
            this.node.on(ConstantBase.CONTROL_FIXED, this.onFixed, this);
            this.node.on(ConstantBase.CONTROL_SWITCH, this.onSwitch, this);
            if (this.m_bodyAttack != null)
                this.node.on(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
        }
        else {
            this.node.off(ConstantBase.CONTROL_JOY_STICK, this.onJoyStick, this);
            this.node.off(ConstantBase.CONTROL_FIXED, this.onFixed, this);
            this.node.off(ConstantBase.CONTROL_SWITCH, this.onSwitch, this);
            if (this.m_bodyAttack != null)
                this.node.off(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
        }
    }

    //STOP:

    protected onStop() {
        director.emit(ConstantBase.CONTROL_RELEASE);
        director.emit(ConstantBase.CONTROL_LOCK);
        this.onMoveRelease();
        if (this.m_bodyAttack != null)
            this.m_bodyAttack?.onStop(true);
    }

    //RIGIDBODY:

    onControlSleep() {
        this.onMoveRelease();
        this.m_rigidbody.sleep();
    }

    onControlAwake() {
        this.m_rigidbody.wakeUp();
    }

    //FACE:

    onFaceRight() {
        this.m_faceDirX = 1;
        this.onDirUpdate();
    }

    onFaceLeft() {
        this.m_faceDirX = -1;
        this.onDirUpdate();
    }

    onFaceReverseX() {
        this.m_faceDirX = -this.m_faceDirX;
        this.onDirUpdate();
    }

    //MOVE:

    protected onPhysicUpdate(dt: number) {
        if (this.m_rigidbody == null || !this.m_rigidbody.isValid)
            return;

        if (this.m_lockVelocity)
            return;

        //if (!this.m_rigidbody.isAwake())
        //Rigidbody wake up again if it's not awake
        //    this.m_rigidbody.wakeUp();

        if (this.m_end) {
            if (this.m_rigidbody.linearVelocity.clone().x != 0) {
                this.m_rigidbody.linearVelocity = v2();
                return;
            }
        }

        if (this.m_dash)
            return;

        if (this.getKnock()) {
            //Rigidbody unable move when in knock state
            if (this.m_bodyKnock != null)
                //Fixed knock velocity on player body
                this.m_bodyKnock.onKnock(
                    this.m_bodyKnock.m_from,
                    this.m_bodyKnock.HitForce);
            return;
        }

        if (this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack)) {
            this.m_rigidbody.linearVelocity = v2();
            return;
        }

        if (this.m_moveDir == v2()) {
            if (this.m_rigidbody.linearVelocity.clone().x != 0) {
                this.m_rigidbody.linearVelocity = v2();
                return;
            }
        }

        let velocity = this.m_rigidbody.linearVelocity.clone();
        let current = velocity.clone();
        velocity = this.m_moveDir.clone().multiplyScalar(this.MoveGround);
        let damp = current.lerp(velocity, this.MoveDamp * dt);
        this.m_rigidbody.linearVelocity = damp;
    }

    onJoyStick(direction: Vec2) {
        if (!this.m_control || this.getDead()) {
            this.m_move = false;
            this.m_moveDir = Vec2.ZERO.clone();
            return;
        }
        if (direction.clone().x == 0 && direction.clone().y == 0) {
            this.m_move = false;
            this.m_moveDir = Vec2.ZERO.clone();
            if (this.m_bodyAttack != null && this.MoveStopAttack)
                this.m_bodyAttack?.onStop(false);
        }
        else {
            this.m_move = true;
            this.m_moveDir = direction.normalize();
            this.m_faceDir = direction.normalize();
            this.m_faceDirX = direction.x > 0 ? 1 : -1;
            this.onDirUpdate();
            if (this.m_bodyAttack != null && this.MoveStopAttack)
                this.m_bodyAttack?.onStop(true);
        }
        if (!this.m_move && this.MoveAttackReset && !this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack))
            this.m_bodyAttack?.onAttackReset();
    }

    onMoveRelease() {
        this.m_move = false;
        this.m_moveDir = Vec2.ZERO.clone();
    }

    onDirUpdate() {
        this.m_bodySpine.onViewDirection(this.m_faceDirX);
        if (this.m_bodyAttack != null)
            this.m_bodyAttack?.onDirUpdate(this.m_faceDirX);
    }

    //DASH:

    onDash() {
        if (!this.m_control || this.m_dash || this.m_dashDelay || this.getAttack(this.DashStopByBodyAttack, this.DashStopByPressAttack) || this.getDead())
            return;
        this.m_dash = true;
        this.m_dashDelay = true;
        this.m_moveDir = this.m_faceDir;
        this.m_rigidbody.linearVelocity = v2(this.MoveDash * this.m_faceDirX, 0);
        this.m_rigidbody.gravityScale = 0;
        this.scheduleOnce(() => {
            this.m_dash = false;
            this.m_rigidbody.linearVelocity = v2(0, 0);
        }, 0.15);
        this.scheduleOnce(() => this.m_dashDelay = false, this.DelayDash);
        if (this.DashAttackReset)
            this.m_bodyAttack?.onAttackReset();
    }

    //SWITCH

    onSwitch(index: number, controlByDirector: boolean = true) {
        if (this.m_lockInput || this.getDead())
            return;
        let state = index == this.SwitchIndex;
        this.m_control = state;
        if (controlByDirector) {
            this.onControlByDirector(state);
            this.onControlByNode(!state);
        }
        else {
            this.onControlByDirector(!state);
            this.onControlByNode(state);
        }
        this.onMoveRelease();
        if (state)
            director.emit(ConstantBase.CAMERA_SWITCH, this.node);
    }

    //ATTACK:

    onAttack(state: boolean, update: boolean = true) {
        if (!this.m_control || this.m_lockInput || this.getDead())
            return;
        this.m_attack = state;
        switch (state) {
            case true:
                if (!this.AttackHold) {
                    this.onAim();
                    this.onAttackProgess();
                }
                break;
            case false:
                if (this.AttackHold)
                    this.onAttackProgess();
                break;
        }
    }

    protected onAim() {
        if (this.m_bodyAttack == null)
            return;
        if (!this.m_bodyAttack?.Aim)
            return;
        this.m_bodyAttack?.onDirUpdate(this.m_faceDirX);
        let target = this.m_bodyAttack?.onRangeTargetNearest();
        if (target == null ? true : !target.isValid)
            this.onAimReset();
        else
            this.m_bodyAttack?.onAimTarget(target);
    }

    protected onAimReset() {
        if (this.m_bodyAttack == null)
            return;
        this.m_bodyAttack?.onDirUpdate(this.m_faceDirX);
        if (this.AttackAimReset)
            this.m_bodyAttack?.onAimReset();
        else
            this.m_bodyAttack?.onAimDeg(this.m_faceDirX == 1 ? 0 + this.AttackDegOffset : 180 - this.AttackDegOffset);
    }

    protected onAttackProgess() {
        if (this.m_bodyAttack == null)
            return;
        if (!this.MoveStopAttack && (this.MoveStopByBodyAttack || this.MoveStopByPressAttack))
            this.m_bodySpine.onIdle(true);
        this.scheduleOnce(() => {
            this.scheduleOnce(() => {
                this.onAimReset();
            }, this.m_bodyAttack?.onAttackProgess());
        });
    }

    //COLLIDE

    protected onCollideBody(target: Node) {
        if (this.m_body.m_bodyX4) {
            let bodyTarget = target.getComponent(BodyBase);
            if (bodyTarget != null)
                bodyTarget.onDead(this.node);
        }
    }

    //FIXED:

    protected onFixed() {
        this.onAimReset();
    }

    //STATE:

    protected onStateUpdate(dt: number) {
        if (this.m_rigidbody == null || !this.m_rigidbody.isValid)
            return;
        let state = PlayerStateXY.IDLE;
        //FIND STATE:
        if (this.getDead())
            state = PlayerStateXY.DEAD;
        else if (this.getHit())
            state = PlayerStateXY.HIT;
        else if (this.getAttack(this.MoveStopByBodyAttack, this.MoveStopByPressAttack)) {
            if (this.AttackHold)
                state = PlayerStateXY.ATTACK_HOLD;
            else
                state = PlayerStateXY.ATTACK;
        }
        else if (this.m_dash)
            state = PlayerStateXY.DASH;
        else if (this.m_move)
            state = PlayerStateXY.MOVE;
        //UPDATE STATE:
        if (this.m_state == state)
            return;
        this.m_state = state;
        switch (this.m_state) {
            case PlayerStateXY.IDLE:
                this.m_bodySpine.onIdle();
                break;
            case PlayerStateXY.MOVE:
                if (this.MoveStopAttack)
                    this.m_bodyAttack?.onStop(false);
                this.m_bodySpine.onMove();
                break;
            case PlayerStateXY.DASH:
                this.m_bodySpine.onDash();
                break;
            case PlayerStateXY.ATTACK:
                if (this.AttackHold)
                    this.m_bodyAttack?.onAnimAttackUnReady();
                break;
            case PlayerStateXY.ATTACK_HOLD:
                if (this.AttackHold) {
                    this.m_bodyAttack?.onAnimAttackUnReady();
                    this.m_bodyAttack?.onAnimAttackReady();
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
        if (stopByBodyAttack && this.m_bodyAttack != null ? this.m_bodyAttack?.m_attack : false)
            return true;
        if (stopByPressAttack && this.m_attack)
            return true;
        return false;
    }

    //COMPLETE:

    /**Excute Player complete, but not continue complete progress if 'EndOnGround' value is TRUE*/
    protected onComplete(state: boolean, target: Node) {
        director.emit(ConstantBase.CONTROL_RELEASE);
        director.emit(ConstantBase.CONTROL_JUMP_RELEASE);
        director.emit(ConstantBase.CONTROL_LOCK);

        this.m_end = true;

        this.onMoveRelease();
        if (this.m_bodyAttack != null)
            this.m_bodyAttack?.onStop(true);
    }

    protected onCompleteProgess() {
        this.scheduleOnce(() => {
            this.scheduleOnce(() => {
                director.emit(ConstantBase.GAME_COMPLETE);
            }, this.m_bodySpine.onComplete());
        }, 0);
    }

    //DEAD:

    protected onControlDead() {
        director.emit(ConstantBase.CONTROL_RELEASE);
        director.emit(ConstantBase.CONTROL_JUMP_RELEASE);
        director.emit(ConstantBase.CONTROL_LOCK);

        this.m_end = true;

        this.onMoveRelease();
        if (this.m_bodyAttack != null)
            this.m_bodyAttack?.onStop(true);

        this.scheduleOnce(() => {
            this.m_rigidbody.sleep();
            this.scheduleOnce(() => this.m_rigidbody.wakeUp(), 0.02);
            this.scheduleOnce(() => {
                console.log('Game Lose');
                director.emit(ConstantBase.GAME_LOSE);
            }, this.m_bodySpine.onDead());
        }, 0);
    }

    //VALUE

    onValueLockX(value: boolean) { this.LockX = value; }
    onValueLockY(value: boolean) { this.LockY = value; }
    onValueMoveGround(value: number) { this.MoveGround = value; }
}