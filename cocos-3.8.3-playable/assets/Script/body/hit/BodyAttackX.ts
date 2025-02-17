import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, v2, Vec2 } from 'cc';
import { BodyBase } from '../BodyBase';
import { BodyCheckX } from '../physic/BodyCheckX';
import { ConstantBase } from '../../ConstantBase';
import { ShootBase } from '../../shoot/ShootBase';
import { SpineBase } from '../../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('BodyAttackX')
export class BodyAttackX extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Delay: number = 0.02;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DelayAttack: number = 0.02;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DelayLoop: number = 1;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    StopOutRange: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    StopOnHit: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    ContinueOnHit: boolean = true;

    @property({ group: { name: 'Melee' }, type: CCBoolean })
    Melee: boolean = false;
    @property({ group: { name: 'Melee' }, type: CCBoolean, visible(this: BodyAttackX) { return this.Melee; } })
    MeleeDirUpdate: boolean = true;
    @property({ group: { name: 'Melee' }, type: CCBoolean, visible(this: BodyAttackX) { return this.Melee; } })
    MeleeAuto: boolean = false;
    @property({ group: { name: 'Melee' }, type: CCInteger, visible(this: BodyAttackX) { return this.Melee; } })
    MeleeHit: number = 1

    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyCheckX) { return this.getComponent(ShootBase) != null; } })
    RangeDirUpdate: boolean = true;
    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    RangeAuto: boolean = false;
    @property({ group: { name: 'Range' }, type: Node, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    RangeBullet: Node = null;
    @property({ group: { name: 'Range' }, type: CCFloat, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    RangeBulletSpeed: number = 5;
    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    RangeTargetUpdate: boolean = true;
    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    RangeTargetReset: boolean = true;

    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimAttackMix: boolean = false;
    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimAttackHoldActive: boolean = true;
    @property({ group: { name: 'Anim' }, type: CCString, visible(this: BodyAttackX) { return this.AnimAttackHoldActive; } })
    AnimAttackReady: string = 'attack_ready';
    @property({ group: { name: 'Anim' }, type: CCString, visible(this: BodyAttackX) { return this.AnimAttackHoldActive; } })
    AnimAttackHold: string = 'attack_hold';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimAttack: string = 'attack';
    @property({ group: { name: 'Anim' }, type: CCInteger, visible(this: BodyAttackX) { return this.AnimAttackMix; } })
    AnimAttackIndex: number = 3;
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimIdle: string = 'idle';

    @property({ group: { name: 'Aim' }, type: CCBoolean })
    Aim: boolean = false;
    @property({ group: { name: 'Aim' }, type: CCString, visible(this: BodyAttackX) { return this.Aim; } })
    AimAnim: string = 'attack_aim';
    @property({ group: { name: 'Aim' }, type: CCInteger, visible(this: BodyAttackX) { return this.Aim; } })
    AimAnimIndex: number = 1;
    @property({ group: { name: 'Aim' }, type: CCString, visible(this: BodyAttackX) { return this.Aim; } })
    AimBone: string = 'aim_bone';
    @property({ group: { name: 'Aim' }, type: Node, visible(this: BodyAttackX) { return this.Aim; } })
    AimFrom: Node = null;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagMelee: number = 101;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagRange: number = 102;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagTarget: number = 200;

    m_dir: number = 0;

    m_attack: boolean = false;
    m_attackMeleeUp: boolean = false;
    m_continue: boolean = false;
    m_dead: boolean = false;

    m_targetMelee: Node[] = [];
    m_targetRange: Node[] = [];
    m_targetRangeAim: Node = null;

    readonly m_emitMelee: string = 'emit-body-melee';
    readonly m_emitRange: string = 'emit-body-range';

    m_offsetMeleeX: number;
    m_offsetRangeX: number;

    m_colliderMelee: Collider2D = null;
    m_colliderRange: Collider2D = null;

    m_body: BodyBase = null;
    m_bodyCheck: BodyCheckX = null;
    m_shoot: ShootBase = null;
    m_spine: SpineBase = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_bodyCheck = this.getComponent(BodyCheckX);
        this.m_shoot = this.getComponent(ShootBase);
        this.m_spine = this.getComponent(SpineBase);

        let colliders = this.getComponents(Collider2D);
        for (let i = 0; i < colliders.length; i++) {
            let collider = colliders[i];
            switch (collider.tag) {
                case this.TagMelee:
                    this.m_colliderMelee = collider;
                    break;
                case this.TagRange:
                    this.m_colliderRange = collider;
                    break;
            }
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        if (this.MeleeAuto)
            this.node.on(this.m_emitMelee, this.onMeleeFoundTarget, this);
        if (this.RangeAuto)
            this.node.on(this.m_emitRange, this.onRangeFoundTarget, this);

        if (this.Aim)
            this.m_spine.onAimInit(this.AimAnim, this.AimAnimIndex, this.AimBone, this.AimFrom);

        this.node.on(this.m_body.m_emitBodyBaseHit, this.onHit, this);
        this.node.on(this.m_body.m_emitBodyBaseDead, this.onDead, this);
    }

    protected start(): void {
        if (this.m_colliderMelee != null)
            this.m_offsetMeleeX = this.m_colliderMelee.offset.x;
        if (this.m_colliderRange != null)
            this.m_offsetRangeX = this.m_colliderRange.offset.x;
    }

    //

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagMelee:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        let index = this.m_targetMelee.findIndex(t => t == otherCollider.node);
                        if (index >= 0)
                            break;
                        this.m_targetMelee.push(otherCollider.node);
                        this.node.emit(this.m_emitMelee, otherCollider.node, true);
                        break;
                }
                break;
            case this.TagRange:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        let index = this.m_targetRange.findIndex(t => t == otherCollider.node);
                        if (index >= 0)
                            break;
                        this.m_targetRange.push(otherCollider.node);
                        this.node.emit(this.m_emitRange, otherCollider.node, true);
                        break;
                }
                break;
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagMelee:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        let index = this.m_targetMelee.findIndex(t => t == otherCollider.node);
                        if (index < 0)
                            break;
                        this.m_targetMelee.splice(index, 1);
                        this.node.emit(this.m_emitMelee, otherCollider.node, false);
                        break;
                }
                break;
            case this.TagRange:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        let index = this.m_targetRange.findIndex(t => t == otherCollider.node);
                        if (index < 0)
                            break;
                        this.m_targetRange.splice(index, 1);
                        this.node.emit(this.m_emitRange, otherCollider.node, false);
                        break;
                }
                break;
        }
    }

    //

    onHit(value: number, duration: number) {
        if (!this.StopOnHit)
            return;
        this.m_continue = false;
        this.m_attack = false;
        this.unscheduleAllCallbacks();
        if (this.MeleeAuto) {
            this.scheduleOnce(() => {
                this.scheduleOnce(() => this.onMeleeAttackTargetStart(), this.DelayLoop);
            }, duration);
        }
        if (this.RangeAuto) {
            this.scheduleOnce(() => {
                this.scheduleOnce(() => this.onRangeAttackTargetStart(), this.DelayLoop);
            }, duration);
        }
    }

    onDead() {
        this.m_dead = true;
        this.m_continue = false;
        this.m_attack = false;
        this.unscheduleAllCallbacks();
    }

    //Melee

    private onMeleeFoundTarget(target: Node, stage: boolean) {
        if (this.m_targetMelee.length > 0) {
            if (!this.m_attack)
                this.onMeleeAttackTargetStart();
            else
                this.m_continue = true;
        }
        else {
            this.m_continue = false;
            if (this.StopOutRange) {
                this.m_attack = false;
                this.unscheduleAllCallbacks();
            }
        }
    }

    onMeleeAttackTargetStart(): boolean {
        if (this.m_targetMelee.length == 0)
            return false;
        this.onAttackProgess();
        return true;
    }

    onMeleeAttackTargetEmit() {
        this.m_targetMelee.forEach(target => {
            if (this.m_attackMeleeUp)
                target.emit(ConstantBase.NODE_BODY_DEAD, this.node);
            else
                target.emit(ConstantBase.NODE_BODY_HIT, this.MeleeHit, this.node);
        });
    }

    onMeleeAttackUp(state: boolean = true) {
        this.m_attackMeleeUp = state;
    }

    //Range

    private onRangeFoundTarget(target: Node, stage: boolean) {
        if (this.m_targetRange.length > 0) {
            if (!this.m_attack)
                this.onRangeAttackTargetStart();
            else
                this.m_continue = true;
        }
        else {
            this.m_continue = false;
            if (this.StopOutRange) {
                this.m_attack = false;
                this.unscheduleAllCallbacks();
            }
        }
    }

    onRangeAttackTargetStart(): boolean {
        if (this.m_targetRange.length == 0)
            return false;
        this.onAttackProgess();
        return true;
    }

    onRangeAttackTargetShoot() {
        if (this.m_shoot == null)
            return;
        if (this.RangeTargetUpdate && this.m_targetRangeAim == null)
            this.m_targetRangeAim = this.onRangeTargetNearest();
        if (this.m_targetRangeAim != null) {
            this.m_shoot.onShootVelocityTarget(
                this.m_targetRangeAim,
                this.RangeBullet,
                this.RangeBulletSpeed,
                0);
            if (this.RangeTargetReset)
                this.m_targetRangeAim = null;
        }
        else {
            this.m_shoot.onShootVelocityDeg(
                this.m_dir == 1 ? 0 : 180,
                this.RangeBullet,
                this.RangeBulletSpeed,
                0);
        }
    }

    onRangeTargetNearest(): Node {
        let target: Node = null;
        let distance = 0;
        for (let i = 0; i < this.m_targetRange.length; i++) {
            let targetCheck = this.m_targetRange[i];
            if (this.m_dir == 1 && this.node.worldPosition.clone().x > targetCheck.worldPosition.clone().x)
                continue;
            if (this.m_dir == -1 && this.node.worldPosition.clone().x < targetCheck.worldPosition.clone().x)
                continue;
            if (target == null ? true : !target.isValid) {
                target = targetCheck;
                let posA = this.node.worldPosition.clone();
                let posB = targetCheck.worldPosition.clone();
                distance = Vec2.distance(v2(posA.x, posA.y), v2(posB.x, posB.y));
            }
            else {
                let posA = this.node.worldPosition.clone();
                let posB = targetCheck.worldPosition.clone();
                let distanceCheck = Vec2.distance(v2(posA.x, posA.y), v2(posB.x, posB.y));
                if (distanceCheck < distance) {
                    target = targetCheck;
                    distance = distanceCheck;
                }
            }
        }
        if (target != null)
            target = target.getChildByName('centre') ?? target.getChildByName('renderer').getChildByName('centre') ?? target;
        return target;
    }

    //Attack

    onAttackProgess(): number {
        if (this.m_dead || this.m_attack)
            return 0;
        this.m_attack = true;
        this.m_continue = true;
        this.scheduleOnce(() => {
            this.scheduleOnce(() => this.onAttackProgessInvoke(), this.DelayAttack);
            //
            let attackDuration = 0;
            if (this.AnimAttackMix) {
                attackDuration = this.m_spine.onAnimationIndex(this.AnimAttackIndex, this.AnimAttack, false);
                this.m_spine.onAnimationForce(this.AnimIdle, true);
            }
            else
                attackDuration = this.m_spine.onAnimationForce(this.AnimAttack, false);
            this.scheduleOnce(() => {
                this.m_attack = false;
                if (this.AnimAttackMix)
                    this.m_spine.onAnimationClear(this.AnimAttackIndex);
                else
                    this.m_spine.onAnimationForce(this.AnimIdle, true);

                if (!this.Once) {
                    this.scheduleOnce(() => {
                        if (this.m_continue) {
                            if (!this.onMeleeAttackTargetStart())
                                if (!this.onRangeAttackTargetStart()) {
                                    this.m_continue = false;
                                    this.m_attack = false;
                                }
                        }
                    }, this.DelayLoop);
                }
                else {
                    this.m_continue = false;
                    this.m_attack = false;
                }
            }, attackDuration);
            //
        }, this.Delay);
        return this.Delay + this.DelayAttack;
    }

    private onAttackProgessInvoke() {
        if (this.Melee)
            this.onMeleeAttackTargetEmit();
        if (this.m_shoot != null)
            this.onRangeAttackTargetShoot();
    }

    //Dir

    onDirUpdate(dir: number) {
        if (dir > 0)
            dir = 1;
        else if (dir < 0)
            dir = -1;
        else return;

        this.m_dir = dir;

        this.m_continue = false;
        if (this.StopOutRange) {
            this.m_attack = false;
            this.unscheduleAllCallbacks();
        }

        if (this.MeleeDirUpdate && this.m_colliderMelee != null ? this.m_colliderMelee.isValid : false) {
            let meleeColliderOffset = this.m_colliderMelee.offset;
            meleeColliderOffset.x = this.m_offsetMeleeX * dir;
            this.m_colliderMelee.offset = meleeColliderOffset;
            this.m_colliderMelee.apply(); //Called this onStart() make bug (?)
        }

        if (this.RangeDirUpdate && this.m_colliderRange != null ? this.m_colliderRange.isValid : false) {
            let rangeColliderOffset = this.m_colliderRange.offset;
            rangeColliderOffset.x = this.m_offsetRangeX * dir;
            this.m_colliderRange.offset = rangeColliderOffset;
            this.m_colliderRange.apply(); //Called this onStart() make bug (?)
        }
    }

    //Anim

    onAttackReady(): number {
        return this.m_spine.onAnimation(this.AnimAttackReady, false);
    }

    onAttackHold(): number {
        return this.m_spine.onAnimation(this.AnimAttackHold, true);
    }

    onAimDeg(deg: number) {
        this.m_spine.onAimDeg(deg);
    }

    onAimTarget(target: Node) {
        this.m_spine.onAimTarget(target);
    }

    onUnAim() {
        this.m_spine.onUnAim();
    }
}