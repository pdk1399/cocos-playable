import { _decorator, CCFloat, CCInteger, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, RigidBody2D, v2, Vec2 } from 'cc';
import { StickController } from '../StickController';
import { StickField } from '../StickField';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('StickViking')
export class StickViking extends StickController {
    @property(CCInteger)
    attackDamage: number = 1;

    @property(CCFloat)
    attackDelay: number = 0.5;

    @property(CCFloat)
    moveSpeed: number = 5;

    readonly ANIM_IDLE: string = 'idle';
    readonly ANIM_MOVE: string = 'run';
    readonly ANIM_ATTACK: string = 'attack_1';

    readonly DELAY_ATTACK_CONSTANT: number = 0.2;

    animMove(): string { return this.moveSpeed > 0 ? this.ANIM_MOVE : this.ANIM_IDLE; }

    attackTarget: StickController = null;
    attackRange: StickController[] = [];

    moveTarget: Node = null;
    moveDir: Vec2 = Vec2.ZERO;
    moveLock: boolean = false;

    rigidbody: RigidBody2D = null;

    protected start(): void {
        this.rigidbody = this.getComponent(RigidBody2D);
        //
        director.on(ConstantBase.BATTLE_START, this.OnBattleStart, this);
        //
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(c => {
            c.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            c.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        })
        //
        if (this.isTeam())
            director.on(ConstantBase.STICK_RED_DEAD, this.onEnermyDead, this);
        else
            director.on(ConstantBase.STICK_BLUE_DEAD, this.onEnermyDead, this);
    }

    protected update(dt: number): void {
        if (this.isStop()) {
            this.rigidbody.linearVelocity = Vec2.ZERO;
            return;
        }
        //
        //FACE:
        if (this.moveTarget != null && this.attackTarget == null) {
            if (this.moveTarget.position.x < this.node.position.x)
                this.SetFaceL();
            else
                this.SetFaceR();
        }
        //
        //MOVE:
        if (this.moveTarget == null || this.moveLock || this.attackTarget != null) {
            this.rigidbody.linearVelocity = Vec2.ZERO;
            return;
        }
        //
        this.moveDir = v2(
            this.moveTarget.position.x - this.node.position.x,
            this.moveTarget.position.y - this.node.position.y).normalize();
        this.moveDir.x *= this.moveSpeed;
        this.moveDir.y *= this.moveSpeed;
        //
        this.rigidbody.linearVelocity = this.moveDir;
    }

    //PRIMARY:

    private SetTargetUpdate(): void {
        if (this.isStop())
            return;
        //
        var TargetInRange = this.GetTargetInRange();
        if (TargetInRange != null) {
            this.attackTarget = TargetInRange;
            this.moveTarget = null;
            //console.log("[Stick] " + this.node.name + " target " + this.attackTarget.node.name);
            return;
        }
        //
        var TargetClosed = StickField.Instance.GetStickClosed(this, this.isTeam()).node;
        if (TargetClosed != null) {
            this.attackTarget = null;
            this.moveTarget = TargetClosed;
            //console.log("[Stick] " + this.node.name + " move " + this.moveTarget.name);
            return;
        }
        //
        if (this.animCurrent() != this.ANIM_IDLE && this.animCurrent() != this.ANIM_ATTACK)
            this.SetAnim(this.ANIM_IDLE, true);
    }

    private GetTargetUpdate(): boolean {
        if (this.attackTarget == null)
            return true;
        if (this.attackTarget.isDead())
            return true;
        return false;
    }

    private SetTargetUpdateAnim() {
        if (this.animCurrent() == this.ANIM_ATTACK)
            return;
        //
        if (StickField.Instance.isBattleEnd() && !this.isDead()) {
            this.SetAnim(this.ANIM_IDLE, true);
            return;
        }
        //
        if (this.moveTarget != null && this.attackTarget == null) {
            if (this.moveLock)
                this.SetAnim(this.ANIM_IDLE, true);
            else
                this.SetAnim(this.animMove(), true);
        }
    }

    //

    private SetTargetInRangeAdd(Target: StickController) {
        //CHECK STICK!
        var Stick = Target.getComponent(StickController);
        if (Stick == null)
            return;
        if (Stick.isTeam() == this.isTeam())
            return;
        if (Stick.isDead())
            return;
        //
        //ADD TARGET TO ATTACK RANGE!
        let index = this.attackRange.findIndex((t) => t == Stick);
        if (index < 0)
            this.attackRange.push(Stick);
        //
        //ATTACK
        this.SetAttack(false);
    }

    private SetTargetInRangeRemove(Target: StickController) {
        //CHECK STICK!
        var Stick = Target.getComponent(StickController);
        if (Stick == null)
            return;
        if (Stick.isTeam() == this.isTeam())
            return;
        //
        //REMOVE TARGET FROM ATTACK RANGE!
        let index = this.attackRange.findIndex((t) => t == Stick);
        if (index >= 0)
            this.attackRange.splice(index, 1);
    }

    private GetTargetInRange(): StickController {
        //FIND:
        for (var i = 0; i < this.attackRange.length; i++) {
            if (this.attackRange[i].isDead())
                continue;
            return this.attackRange[i];
        }
        return null;
    }

    //

    private OnBattleStart(): void {
        this.SetTargetUpdate();
        this.SetTargetUpdateAnim();
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.isStop())
            return;
        //
        switch (selfCollider.tag) {
            case ConstantBase.TAG_FIELD_RENDERER:
                //-------------------------------------------------
                switch (otherCollider.tag) {
                    //-------------------------------------------------
                    case ConstantBase.TAG_FIELD_RENDERER:
                        StickField.Instance.SetStickRenderer();
                        break;
                    //-------------------------------------------------
                }
                break;
            //=========================================================
            case ConstantBase.TAG_FIELD_RANGE:
                switch (otherCollider.tag) {
                    //-------------------------------------------------
                    case ConstantBase.TAG_FIELD_BODY:
                        this.SetTargetInRangeAdd(otherCollider.getComponent(StickController));
                        break;
                    //-------------------------------------------------
                }
                break;
            //=========================================================
        }
    }

    private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.isStop())
            return;
        //
        switch (selfCollider.tag) {
            //=========================================================
            case ConstantBase.TAG_FIELD_RANGE:
                switch (otherCollider.tag) {
                    //-------------------------------------------------
                    case ConstantBase.TAG_FIELD_BODY:
                        this.SetTargetInRangeRemove(otherCollider.getComponent(StickController));
                        break;
                    //-------------------------------------------------
                }
                break;
            //=========================================================
        }
    }

    private onEnermyDead(Target: StickController) {
        if (this.isStop()) {
            this.SetTargetUpdateAnim();
            return;
        }
        //
        //REMOVE TARGET FROM ATTACK RANGE!
        let index = this.attackRange.findIndex((t) => t == Target);
        if (index >= 0)
            this.attackRange.splice(index, 1);
        this.SetTargetUpdate();
        this.SetTargetUpdateAnim();
    }

    //ACTION:

    private SetAttack(attackForce: boolean): void {
        if (this.isDead())
            return;
        //
        if (!attackForce) {
            if (this.attackTarget != null)
                return;
        }
        //
        if (this.GetTargetUpdate()) {
            this.SetTargetUpdate();
            if (this.GetTargetUpdate()) {
                this.scheduleOnce(() => {
                    this.moveLock = false;
                    this.SetTargetUpdateAnim();
                }, this.attackDelay < this.DELAY_ATTACK_CONSTANT ? 0 : this.attackDelay);
                return;
            }
            this.SetTargetUpdateAnim();
        }
        //
        var DurationAttack = this.SetAnim(this.ANIM_ATTACK, false);
        this.scheduleOnce(() => {
            if (this.isDead())
                return;
            //
            this.SetAnim(this.ANIM_IDLE, true);
            //
            if (this.isStop())
                return;
            //
            //DELAY ATTACK!
            this.scheduleOnce(() => {
                if (this.isDead())
                    return;
                //
                if (this.GetTargetUpdate())
                    this.SetTargetUpdate();
                //
                if (!this.GetTargetUpdate()) {
                    //NOTE: After stick's delay attack, if opponent aldready dead, then find new opponent!
                    this.scheduleOnce(() => this.SetAttack(true), this.attackDelay);
                    this.SetTargetUpdateAnim();
                    return;
                }
                //
                this.moveLock = false;
                this.SetTargetUpdateAnim();
            }, this.DELAY_ATTACK_CONSTANT);
        }, DurationAttack);
        this.moveLock = true;
        //
        this.scheduleOnce(() => {
            if (this.isDead())
                return;
            //
            //ATTACK HIT!
            if (this.attackTarget != null)
                //NOTE: When stick attack, if target missing by dead or else, this attack will be fail!
                this.attackTarget.getComponent(StickController).SetHealth(-this.attackDamage);
        }, DurationAttack / 2);
    }
}