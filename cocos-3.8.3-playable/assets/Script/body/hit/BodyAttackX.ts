import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, IPhysics2DContact, math, Node, v2, Vec2 } from 'cc';
import { BodyBase } from '../BodyBase';
import { BodyCheckX } from '../physic/BodyCheckX';
import { ConstantBase } from '../../ConstantBase';
import { ShootBase } from '../../shoot/ShootBase';
import { SpineBase } from '../../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('BodyAttackX')
export class BodyAttackX extends Component {
    //
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Once: boolean = false;
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

    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    Range: boolean = false;
    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.Range && this.getComponent(ShootBase) != null; } })
    RangeDirUpdate: boolean = true;
    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.Range && this.getComponent(ShootBase) != null; } })
    RangeAuto: boolean = false;
    @property({ group: { name: 'Range' }, type: Node, visible(this: BodyAttackX) { return this.Range && this.getComponent(ShootBase) != null; } })
    RangeBullet: Node = null;
    @property({ group: { name: 'Range' }, type: CCFloat, visible(this: BodyAttackX) { return this.Range && this.getComponent(ShootBase) != null; } })
    RangeBulletSpeed: number = 5;
    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.Range && this.getComponent(ShootBase) != null; } })
    RangeTargetUpdate: boolean = true;
    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.Range && this.getComponent(ShootBase) != null; } })
    RangeTargetReset: boolean = true;

    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimMix: boolean = false;
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimReady: string = 'attack_ready';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimHold: string = 'attack_hold';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimAttack: string = 'attack';
    @property({ group: { name: 'Anim' }, type: CCFloat })
    AnimTimeScale: number = 1;

    @property({ group: { name: 'Aim' }, type: CCBoolean })
    Aim: boolean = false;
    @property({ group: { name: 'Aim' }, type: CCString, visible(this: BodyAttackX) { return this.Aim; } })
    AimAnim: string = 'attack_aim';
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

    m_stop: boolean = false;
    m_attack: boolean = false;
    m_attackMeleeUltimate: boolean = false;
    m_continue: boolean = false;
    m_attackSchedule: any = null;
    m_dead: boolean = false;

    m_targetMelee: Node[] = [];
    m_targetRange: Node[] = [];
    m_targetRangeAim: Node = null;

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
            this.node.on(ConstantBase.NODE_BODY_MELEE, this.onMeleeFoundTarget, this);
        if (this.RangeAuto)
            this.node.on(ConstantBase.NODE_BODY_RANGE, this.onRangeFoundTarget, this);

        this.node.on(ConstantBase.NODE_BODY_HIT, this.onHit, this);
        this.node.on(ConstantBase.NODE_BODY_DEAD, this.onDead, this);

        if (this.Aim)
            this.m_spine.onAimInit(this.AimAnim, this.AimBone, this.AimFrom);
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
                        this.node.emit(ConstantBase.NODE_BODY_MELEE, otherCollider.node, true);
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
                        this.node.emit(ConstantBase.NODE_BODY_RANGE, otherCollider.node, true);
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
                        this.node.emit(ConstantBase.NODE_BODY_MELEE, otherCollider.node, false);
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
                        this.node.emit(ConstantBase.NODE_BODY_RANGE, otherCollider.node, false);
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
                this.scheduleOnce(() => this.onMeleeStart(), this.DelayLoop);
            }, duration);
        }
        if (this.RangeAuto) {
            this.scheduleOnce(() => {
                this.scheduleOnce(() => this.onRangeStart(), this.DelayLoop);
            }, duration);
        }
    }

    onDead() {
        this.m_dead = true;
        this.m_continue = false;
        this.m_attack = false;
        this.unscheduleAllCallbacks();
    }

    //MELEE

    protected onMeleeFoundTarget() {
        if (this.m_stop)
            return;
        if (this.m_targetMelee.length > 0) {
            if (!this.m_attack)
                this.onMeleeStart();
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

    protected onMeleeStart(): boolean {
        if (this.m_targetMelee.length == 0)
            return false;
        this.scheduleOnce(() => this.onAttackProgess());
        return true;
    }

    protected onMeleeTarget() {
        this.m_targetMelee.forEach(target => {
            if (this.m_attackMeleeUltimate)
                target.emit(ConstantBase.NODE_BODY_DEAD, this.node);
            else
                target.emit(ConstantBase.NODE_BODY_HIT, this.MeleeHit, this.node);
        });
    }

    onMeleeHit(value: number) {
        this.MeleeHit = value;
        if (this.MeleeHit < 1)
            this.MeleeHit = 1;
    }

    onMeleeUltimate(state: boolean = true) {
        this.m_attackMeleeUltimate = state;
    }

    //RANGE

    protected onRangeFoundTarget() {
        if (this.m_stop)
            return;
        if (this.m_targetRange.length > 0) {
            if (!this.m_attack)
                this.onRangeStart();
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

    protected onRangeStart(): boolean {
        if (this.m_targetRange.length == 0)
            return false;
        this.scheduleOnce(() => this.onAttackProgess());
        return true;
    }

    protected onRangeShoot() {
        if (this.m_shoot == null)
            return;
        if (this.RangeTargetUpdate && this.m_targetRangeAim == null)
            this.m_targetRangeAim = this.onRangeTargetNearest();
        if (this.m_targetRangeAim != null ? this.m_targetRangeAim.isValid : false) {
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
        // if (target != null)
        //     target = target.getChildByName('centre') ?? target.getChildByName('renderer').getChildByName('centre') ?? target;
        // this.m_targetRangeAim = target;
        return target;
    }

    //ATTACK

    onAttackProgess(): number {
        if (this.m_dead || this.m_attack)
            return 0;
        this.m_attack = true;
        this.m_continue = true;
        this.scheduleOnce(() => this.onAttackProgessInvoke(), this.DelayAttack);
        if (this.m_attackSchedule != null) {
            this.unschedule(this.m_attackSchedule);
            if (!this.AnimMix)
                this.m_spine.onAnimationForceLast();
            else
                this.m_spine.onAnimationClear(ConstantBase.ANIM_INDEX_ATTACK);
        }
        let attackDuration = 0;
        if (!this.AnimMix)
            attackDuration = this.m_spine.onAnimationForceUnSave(this.AnimAttack, false, true, this.AnimTimeScale);
        else
            attackDuration = this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_ATTACK, this.AnimAttack, false, true, this.AnimTimeScale);
        this.m_attackSchedule = this.scheduleOnce(() => {
            this.m_attack = false;
            if (!this.AnimMix)
                this.m_spine.onAnimationForceLast();
            else
                this.m_spine.onAnimationClear(ConstantBase.ANIM_INDEX_ATTACK);
            if (!this.Once) {
                this.scheduleOnce(() => {
                    if (this.m_continue) {
                        if (!this.onMeleeStart())
                            if (!this.onRangeStart()) {
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
        return Math.max(attackDuration, this.DelayAttack);
    }

    protected onAttackProgessInvoke() {
        if (this.Melee)
            this.onMeleeTarget();
        if (this.Range && this.m_shoot != null)
            this.onRangeShoot();
    }

    //STOP

    onStop(state: boolean) {
        if (!this.m_stop && state) {
            this.m_continue = false;
            this.m_attack = false;
            this.unscheduleAllCallbacks();
            if (!this.AnimMix)
                this.m_spine.onAnimationForceLast();
            else
                this.m_spine.onAnimationClear(ConstantBase.ANIM_INDEX_ATTACK);
        }
        else if (this.m_stop && !state) {
            if (this.MeleeAuto)
                this.onMeleeFoundTarget();
            if (this.RangeAuto)
                this.onRangeFoundTarget();
        }
        this.m_stop = state;
    }

    //DIR

    onDirUpdate(dir: number) {
        if (dir > 0)
            dir = 1;
        else if (dir < 0)
            dir = -1;
        else
            return;

        let dirLast = this.m_dir;
        this.m_dir = dir;

        if (dirLast == dir)
            return;

        this.m_continue = false;
        if (this.StopOutRange) {
            this.m_attack = false;
            this.unscheduleAllCallbacks();
        }

        this.scheduleOnce(() => {
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
        })
    }

    //ANIM

    onAttackReady(): number {
        if (!this.AnimMix)
            return this.m_spine.onAnimationForceUnSave(this.AnimReady, false);
        else
            return this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_ATTACK, this.AnimReady, false);
    }

    onAttackHold(): number {
        if (!this.AnimMix)
            return this.m_spine.onAnimationForceUnSave(this.AnimHold, false);
        else
            return this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_ATTACK, this.AnimHold, false);
    }

    onAimDeg(deg: number) {
        this.m_spine.onAimDeg(deg);
    }

    onAimTarget(target: Node) {
        this.m_targetRangeAim = target;
        this.m_spine.onAimTarget(target);
    }

    onAimReset() {
        this.m_targetRangeAim = null;
        this.m_spine.onAimReset();
    }
}