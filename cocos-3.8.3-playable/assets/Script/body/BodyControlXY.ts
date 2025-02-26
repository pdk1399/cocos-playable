import { _decorator, CCBoolean, CCFloat, CCInteger, Collider2D, Component, director, Enum, Node, RigidBody2D, tween, v2, v3, Vec2, Vec3 } from 'cc';
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
    MoveGroundX = 40;
    @property({ group: { name: 'MoveXY' }, type: CCFloat, visible(this: BodyControlXY) { return !this.LockX; } })
    MoveDampX = 40;
    @property({ group: { name: 'MoveXY' }, type: CCBoolean, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null; } })
    MoveStopAttack = false;
    @property({ group: { name: 'MoveXY' }, type: CCBoolean, visible(this: BodyControlXY) { return !this.MoveStopAttack && this.getComponent(BodyAttackX) != null; } })
    MoveStopByBodyAttack = true;
    @property({ group: { name: 'MoveXY' }, type: CCBoolean, visible(this: BodyControlXY) { return !this.MoveStopAttack && this.getComponent(BodyAttackX) != null; } })
    MoveStopByPressAttack = true;

    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null; } })
    AttackHold: boolean = false;
    @property({ group: { name: 'Attack' }, type: CCFloat, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null; } })
    AttackDegOffset: number = 0;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlXY) { return this.getComponent(BodyAttackX) != null; } })
    AttackAimReset: boolean = true;

    @property({ group: { name: 'Switch' }, type: Node })
    SwitchArrow: Node = null;
    @property({ group: { name: 'Switch' }, type: CCInteger, visible(this: BodyControlXY) { return this.SwitchArrow != null; } })
    SwitchIndex: number = 0;

    m_baseSize: number = 1;
    m_baseScale: Vec3 = Vec3.ONE;

    m_state = PlayerStateXY.IDLE;
    m_move: boolean = false;
    m_moveDir: Vec2 = v2();
    m_moveRatio: number = 1;
    m_faceDirX: number = 1;
    m_faceDir: Vec2 = v2();

    m_dash: boolean = false;

    m_attack: boolean = false;
    m_attackReadySchedule: any = null;

    m_control: boolean = true;
    m_end: boolean = false;

    m_lockInput: boolean = false;
    m_lockKnockBack: boolean = false;
    m_lockVelocity: boolean = false;

    m_bodyX2: boolean = false;
    m_bodyX4: boolean = false;

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

        this.node.on(ConstantBase.NODE_BODY_DEAD, this.onDead, this);
        this.node.on(ConstantBase.NODE_BODY_COLLIDE, this.onCollide, this);

        this.node.on(ConstantBase.NODE_CONTROL_DIRECTOR, this.onControlByDirector, this);
        this.node.on(ConstantBase.NODE_CONTROL_NODE, this.onControlByNode, this);
    }

    protected start(): void {
        this.m_baseScale = this.node.scale.clone();
        this.m_baseSize = 1;

        this.m_faceDirX = this.FaceRight ? 1 : -1;
        this.m_faceDir = this.FaceRight ? v2(1, 0) : v2(-1, 0);
        this.onDirUpdate();
    }

    protected lateUpdate(dt: number): void {
        this.onPhysicUpdate(dt);
        this.onStateUpdate(dt);
    }

    //EVENT:

    protected onControlByDirector(state: boolean, full: boolean = true) {
        if (state) {
            director.on(ConstantBase.CONTROL_JOY_STICK, this.onJoyStick);

            director.on(ConstantBase.CONTROL_FIXED, this.onFixed, this);

            director.on(ConstantBase.BODY_X2, this.onBodyX2, this);
            director.on(ConstantBase.BODY_X4, this.onBodyX4, this);

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
            director.off(ConstantBase.CONTROL_JOY_STICK, this.onJoyStick);

            director.off(ConstantBase.CONTROL_FIXED, this.onFixed, this);

            director.off(ConstantBase.BODY_X2, this.onBodyX2, this);
            director.off(ConstantBase.BODY_X4, this.onBodyX4, this);

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
        if (state) {
            this.node.on(ConstantBase.CONTROL_JOY_STICK, this.onJoyStick, this);

            this.node.on(ConstantBase.CONTROL_FIXED, this.onFixed, this);

            this.node.on(ConstantBase.BODY_X2, this.onBodyX2, this);
            this.node.on(ConstantBase.BODY_X4, this.onBodyX4, this);

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
            this.node.off(ConstantBase.CONTROL_JOY_STICK, this.onJoyStick);

            this.node.off(ConstantBase.CONTROL_FIXED, this.onFixed, this);

            this.node.off(ConstantBase.BODY_X2, this.onBodyX2, this);
            this.node.off(ConstantBase.BODY_X4, this.onBodyX4, this);

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
        director.emit(ConstantBase.CONTROL_LOCK);
        this.onMoveRelease();
        if (this.m_bodyAttack != null)
            this.m_bodyAttack.onStop(true);
    }

    //RIGIDBODY:

    onSleep() {
        this.onMoveRelease();
        this.m_rigidbody.sleep();
    }

    onAwake() {
        this.m_rigidbody.wakeUp();
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

        if (this.getAttack()) {
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
        velocity = this.m_moveDir.clone().multiplyScalar(this.MoveGroundX);
        let damp = current.lerp(velocity, this.MoveDampX * dt);
        this.m_rigidbody.linearVelocity = damp;
    }

    onJoyStick(Direction: Vec2) {
        if (Direction.clone().x == 0 && Direction.clone().y == 0) {
            this.m_move = false;
            this.m_moveDir = Vec2.ZERO.clone();
            if (this.m_bodyAttack != null && this.MoveStopAttack)
                this.m_bodyAttack.onStop(false);
        }
        else {
            this.m_move = true;
            this.m_moveDir = Direction.normalize();
            this.m_faceDir = Direction.normalize();
            this.m_faceDirX = Direction.x > 0 ? 1 : -1;
            this.onDirUpdate();
            if (this.m_bodyAttack != null && this.MoveStopAttack)
                this.m_bodyAttack.onStop(true);
        }
    }

    onMoveRelease() {
        this.m_move = false;
        this.m_moveDir = Vec2.ZERO.clone();
    }

    onDirUpdate() {
        this.m_bodySpine.onViewDirection(this.m_faceDirX);
        if (this.m_bodyAttack != null)
            this.m_bodyAttack.onDirUpdate(this.m_faceDirX);
    }

    //DASH:

    onDash() {
        if (this.m_dash)
            return;
        this.m_dash = true;
        this.m_rigidbody.linearVelocity = this.m_faceDir.clone().multiplyScalar(5000);
        this.scheduleOnce(() => {
            this.m_dash = false;
            this.m_rigidbody.linearVelocity = v2();
        }, 0.15);
    }

    //SWITCH

    onSwitch(index: number) {
        let state = index == this.SwitchIndex;
        this.m_control = state;
        this.SwitchArrow.active = state;
        this.onControlByDirector(state, false);
        this.onMoveRelease();
    }

    //ATTACK:

    onAttack(state: boolean, update: boolean = true) {
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
                if (this.getAttack())
                    this.onAim();
                else
                    this.onAimReset();
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

    protected onAttackProgess(): number {
        if (this.m_bodyAttack == null)
            return;
        return this.m_bodyAttack.onAttackProgess();
    }

    //COLLIDE

    protected onCollide(target: Node) {
        if (this.m_bodyX4) {
            let bodyTarget = target.getComponent(BodyBase);
            if (bodyTarget != null)
                bodyTarget.onDead(this.node);
        }
    }

    //FIXED:

    protected onFixed() {
        this.onAimReset();
    }

    //X2 - X4

    onBodyX2(state: boolean = true) {
        this.m_bodyX2 = state;
        //
        if (this.m_bodyX4)
            return;
        //
        let baseScale: Vec3 = this.m_baseScale.clone();
        let ratio = state ? 2 : 1;
        let colliders = this.getComponents(Collider2D);
        setTimeout(() => {
            tween(this.node).to(0.25, { scale: baseScale.clone().multiplyScalar(ratio) }).call(() => {
                colliders.forEach(c => {
                    c.apply();
                });
            }).start();
        }, 1);
        this.m_baseSize = state ? 2 : 1;
    }

    onBodyX4(state: boolean = true) {
        this.m_bodyX4 = state;
        //
        if (!state && this.m_bodyX2) {
            this.onBodyX2(true);
            return;
        }
        //
        let baseScale: Vec3 = this.m_baseScale.clone();
        let ratio = state ? 4 : 1;
        let colliders = this.getComponents(Collider2D);
        setTimeout(() => {
            tween(this.node).to(0.25, { scale: baseScale.clone().multiplyScalar(ratio) }).call(() => {
                colliders.forEach(c => {
                    c.apply();
                });
            }).start();
        }, 1);
        this.m_baseSize = state ? 4 : 1;
    }

    //STAGE:

    protected onStateUpdate(dt: number) {
        let state = PlayerStateXY.IDLE;
        //FIND STAGE:
        if (this.getDead())
            state = PlayerStateXY.DEAD;
        else if (this.getHit())
            state = PlayerStateXY.HIT;
        else if (this.getAttack()) {
            if (this.AttackHold)
                state = PlayerStateXY.ATTACK_HOLD;
            else
                state = PlayerStateXY.ATTACK;
        }
        else if (this.m_dash)
            state = PlayerStateXY.DASH;
        else if (this.m_move)
            state = PlayerStateXY.MOVE;
        //UPDATE STAGE:
        if (this.m_state == state)
            return;
        this.m_state = state;
        switch (this.m_state) {
            case PlayerStateXY.IDLE:
                this.m_bodySpine.onIdle();
                break;
            case PlayerStateXY.MOVE:
                if (this.MoveStopAttack)
                    this.m_bodyAttack.onStop(false);
                this.m_bodySpine.onMove();
                break;
            case PlayerStateXY.HIT:
                break;
            case PlayerStateXY.DASH:
                this.m_bodySpine.onDash();
                break;
            case PlayerStateXY.ATTACK:
                if (this.AttackHold)
                    this.unschedule(this.m_attackReadySchedule);
                if (!this.MoveStopAttack && (this.MoveStopByBodyAttack || this.MoveStopByPressAttack))
                    this.m_bodySpine.onIdle(true);
                break;
            case PlayerStateXY.ATTACK_HOLD:
                if (!this.MoveStopAttack && (this.MoveStopByBodyAttack || this.MoveStopByPressAttack))
                    this.m_bodySpine.onIdle(true);
                if (this.AttackHold)
                    this.m_attackReadySchedule = this.scheduleOnce(() => this.m_bodyAttack.onAttackHold(), this.m_bodyAttack.onAttackReady());
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

    getAttack(): boolean {
        if (this.MoveStopAttack && this.m_move)
            return false;
        if (this.MoveStopByBodyAttack && this.m_bodyAttack != null ? this.m_bodyAttack.m_attack : false)
            return true;
        if (this.MoveStopByPressAttack && this.m_attack)
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
            this.m_bodyAttack.onStop(true);
    }

    protected onCompleteProgess() {
        this.scheduleOnce(() => {
            this.scheduleOnce(() => {
                director.emit(ConstantBase.GAME_COMPLETE);
            }, this.m_bodySpine.onComplete());
        }, 0);
    }

    //DEAD:

    protected onDead() {
        director.emit(ConstantBase.CONTROL_RELEASE);
        director.emit(ConstantBase.CONTROL_JUMP_RELEASE);
        director.emit(ConstantBase.CONTROL_LOCK);

        this.m_end = true;

        this.onMoveRelease();
        if (this.m_bodyAttack != null)
            this.m_bodyAttack.onStop(true);

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