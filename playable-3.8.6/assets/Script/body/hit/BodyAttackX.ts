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
    DelayLoop: number = 1;

    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimMix: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimComboKeep: boolean = false;
    @property({ group: { name: 'Main' }, type: [CCString] })
    AnimReady: string[] = [];
    @property({ group: { name: 'Main' }, type: [CCString] })
    AnimAttack: string[] = ['attack'];
    @property({ group: { name: 'Main' }, type: CCFloat })
    AnimTimeScale: number = 1;
    @property({ group: { name: 'Main' }, type: [CCFloat] })
    AnimDelayNext: number[] = [0.2];
    @property({ group: { name: 'Main' }, type: CCBoolean })
    NextUnAttack: boolean = false;
    @property({ group: { name: 'Main' }, type: [CCFloat] })
    AnimDelayAttack: number[] = [0.2];
    @property({ group: { name: 'Main' }, type: [CCInteger] })
    AnimMeleeHit: number[] = [1];

    @property({ group: { name: 'Main' }, type: CCBoolean })
    StopOutRange: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    StopOnHit: boolean = true;

    @property({ group: { name: 'Melee' }, type: CCBoolean })
    Melee: boolean = false;
    @property({ group: { name: 'Melee' }, type: CCBoolean, visible(this: BodyAttackX) { return this.Melee; } })
    MeleeDirUpdate: boolean = true;
    @property({ group: { name: 'Melee' }, type: CCBoolean, visible(this: BodyAttackX) { return this.Melee; } })
    MeleeAuto: boolean = false;
    @property({ group: { name: 'Melee' }, type: CCInteger, visible(this: BodyAttackX) { return this.Melee; } })
    MeleeHitMultiX2: number = 2;
    @property({ group: { name: 'Melee' }, type: CCInteger, visible(this: BodyAttackX) { return this.Melee; } })
    MeleeHitMultiX4: number = 4;

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

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagMelee: number = 101;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagRange: number = 102;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagTarget: number = 200;

    m_dir: number = 0;

    m_stop: boolean = false;
    m_dead: boolean = false;
    m_attack: boolean = false;
    m_continue: boolean = false;

    m_meleeUltimate: boolean = false;

    m_readyIndex: number = 0;
    m_attackIndex: number = 0;
    m_meleeHit: number;
    m_attackNext: boolean = false;

    m_readySchedule: any = null;
    m_attackSchedule: any = null;
    m_continueSchedule: any = null;
    m_nextSchedule: any = null;

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

        const colliders = this.getComponents(Collider2D);
        for (let i = 0; i < colliders.length; i++) {
            const collider = colliders[i];
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

        this.node.on(ConstantBase.NODE_BODY_HIT, this.onHit, this);
        this.node.on(ConstantBase.NODE_BODY_DEAD, this.onDead, this);

        if (this.MeleeAuto)
            this.node.on(ConstantBase.NODE_ATTACK_MELEE_FOUND, this.onMeleeFoundTarget, this);
        if (this.RangeAuto)
            this.node.on(ConstantBase.NODE_ATTACK_RANGE_FOUND, this.onRangeFoundTarget, this);

        this.node.on(ConstantBase.NODE_ATTACK_ULTIMATE, this.onMeleeUltimate, this);
        this.node.on(ConstantBase.NODE_VALUE_MELEE_HIT, this.onMeleeHit, this);
    }

    protected start(): void {
        //Collider
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
                        const index = this.m_targetMelee.findIndex(t => t == otherCollider.node);
                        if (index >= 0)
                            break;
                        this.m_targetMelee.push(otherCollider.node);
                        this.node.emit(ConstantBase.NODE_ATTACK_MELEE_FOUND, otherCollider.node, true);
                        break;
                }
                break;
            case this.TagRange:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        const index = this.m_targetRange.findIndex(t => t == otherCollider.node);
                        if (index >= 0)
                            break;
                        this.m_targetRange.push(otherCollider.node);
                        this.node.emit(ConstantBase.NODE_ATTACK_RANGE_FOUND, otherCollider.node, true);
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
                        const index = this.m_targetMelee.findIndex(t => t == otherCollider.node);
                        if (index < 0)
                            break;
                        this.m_targetMelee.splice(index, 1);
                        this.node.emit(ConstantBase.NODE_ATTACK_MELEE_FOUND, otherCollider.node, false);
                        break;
                }
                break;
            case this.TagRange:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        const index = this.m_targetRange.findIndex(t => t == otherCollider.node);
                        if (index < 0)
                            break;
                        this.m_targetRange.splice(index, 1);
                        this.node.emit(ConstantBase.NODE_ATTACK_RANGE_FOUND, otherCollider.node, false);
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
            if (this.m_meleeUltimate)
                target.emit(ConstantBase.NODE_BODY_DEAD, this.node);
            else
                target.emit(ConstantBase.NODE_BODY_HIT, this.m_meleeHit, this.node);
        });
    }

    onMeleeHit(value: number) {
        this.m_meleeHit = math.clamp(value, 1, value);
    }

    onMeleeUltimate(state: boolean = true) {
        this.m_meleeUltimate = state;
    }

    getMeleeHitMulti(): number {
        if (this.m_body.m_bodyX2)
            return this.MeleeHitMultiX2;
        if (this.m_body.m_bodyX4)
            return this.MeleeHitMultiX4;
        return 1;
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
            const targetCheck = this.m_targetRange[i];
            if (this.m_dir == 1 && this.node.worldPosition.clone().x > targetCheck.worldPosition.clone().x)
                continue;
            if (this.m_dir == -1 && this.node.worldPosition.clone().x < targetCheck.worldPosition.clone().x)
                continue;
            if (target == null ? true : !target.isValid) {
                target = targetCheck;
                const posA = this.node.worldPosition.clone();
                const posB = targetCheck.worldPosition.clone();
                distance = Vec2.distance(v2(posA.x, posA.y), v2(posB.x, posB.y));
            }
            else {
                const posA = this.node.worldPosition.clone();
                const posB = targetCheck.worldPosition.clone();
                const distanceCheck = Vec2.distance(v2(posA.x, posA.y), v2(posB.x, posB.y));
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

    getAttackAvaible(): boolean {
        return this.m_targetMelee.length > 0 || this.m_targetRange.length > 0;
    }

    onAttackProgess() {
        if (this.m_dead)
            return 0;
        if (!this.m_attackNext && this.m_attack)
            return 0;
        this.m_attack = true;
        this.m_continue = true;

        this.onAttackProgressAnim();

        this.m_meleeHit = this.AnimMeleeHit[this.m_attackIndex] * this.getMeleeHitMulti();
        const attackDelayDuration = this.AnimDelayAttack[this.m_attackIndex];
        this.scheduleOnce(() => this.onAttackProgessInvoke(), attackDelayDuration);

        this.m_attackIndex++;
        if (this.m_attackIndex > this.AnimAttack.length - 1)
            this.m_attackIndex = 0;
    }

    protected onAttackProgressAnim() {
        this.unscheduleAllCallbacks();
        this.unschedule(this.m_attackSchedule);
        this.unschedule(this.m_continueSchedule);
        this.unschedule(this.m_nextSchedule);

        this.m_body.m_hitLockAnimation = true;
        if (!this.AnimMix)
            this.m_spine.onAnimationForceLast();
        else
            this.m_spine.onAnimationClear(ConstantBase.ANIM_INDEX_ATTACK);

        const animAttackDuration = this.onAnimAttack(
            this.AnimAttack[this.m_attackIndex],
            this.AnimMix,
            /*loop*/ false,
            /*durationScale*/ true,
            /*animTimeScale*/ this.AnimTimeScale);
        this.m_attackSchedule = this.scheduleOnce(() => {
            this.unschedule(this.m_nextSchedule);
            this.m_attack = false;
            this.m_attackNext = false;
            this.m_body.m_hitLockAnimation = false;
            if (!this.AnimMix)
                this.m_spine.onAnimationForceLast();
            else
                this.m_spine.onAnimationClear(ConstantBase.ANIM_INDEX_ATTACK);

            if (!this.Once) {
                this.m_continueSchedule = this.scheduleOnce(() => {
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
            if (!this.AnimComboKeep)
                this.m_attackIndex = 0;
        }, animAttackDuration);

        const animNextDuration = this.AnimDelayNext[this.m_attackIndex] / this.AnimTimeScale;
        this.m_attackNext = false;
        this.m_nextSchedule = this.scheduleOnce(() => {
            this.m_attackNext = true;
            if (this.NextUnAttack)
                this.m_attack = false;
        }, animNextDuration);
    }

    protected onAttackProgessInvoke() {
        if (this.Melee)
            this.onMeleeTarget();
        if (this.Range && this.m_shoot != null)
            this.onRangeShoot();
    }

    onAttackReset() {
        this.m_attackIndex = 0;
    }

    //STOP

    onStop(state: boolean) {
        if (!this.m_stop && state) {
            this.m_continue = false;
            this.m_attack = false;
            this.unscheduleAllCallbacks();
            this.unschedule(this.m_attackSchedule);
            this.unschedule(this.m_continueSchedule);
            if (!this.AnimMix)
                this.m_spine.onAnimationForceLast();
            else
                this.m_spine.onAnimationClear(ConstantBase.ANIM_INDEX_ATTACK);
            if (!this.AnimComboKeep)
                this.m_attackIndex = 0;
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

        const dirLast = this.m_dir;
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
                const meleeColliderOffset = this.m_colliderMelee.offset;
                meleeColliderOffset.x = this.m_offsetMeleeX * dir;
                this.m_colliderMelee.offset = meleeColliderOffset;
                this.m_colliderMelee.apply(); //Called this onStart() make bug (?)
            }
            if (this.RangeDirUpdate && this.m_colliderRange != null ? this.m_colliderRange.isValid : false) {
                const rangeColliderOffset = this.m_colliderRange.offset;
                rangeColliderOffset.x = this.m_offsetRangeX * dir;
                this.m_colliderRange.offset = rangeColliderOffset;
                this.m_colliderRange.apply(); //Called this onStart() make bug (?)
            }
        })
    }

    //ANIM

    onAnimAttack(anim: string, animMix: boolean, loop: boolean, durationScale: boolean = false, timeScale: number = 1): number {
        if (!animMix)
            return this.m_spine.onAnimationForceUnSave(anim, loop, durationScale, timeScale);
        else
            return this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_ATTACK, anim, loop, durationScale, timeScale);
    }

    onAnimAttackReady() {
        if (this.m_readyIndex > this.AnimReady.length - 1)
            return;
        let animAttackReadyContinue = this.m_readyIndex < this.AnimReady.length - 1;
        let animAttackReadyDuration = this.onAnimAttack(this.AnimReady[this.m_readyIndex], this.AnimMix, !animAttackReadyContinue);
        if (animAttackReadyContinue)
            this.m_readySchedule = this.scheduleOnce(() => this.onAnimAttackReady(), animAttackReadyDuration);
        this.m_readyIndex++;
    }

    onAnimAttackUnReady() {
        this.unschedule(this.m_readySchedule);
        if (this.m_continue)
            return;
        this.m_readyIndex = 0;
    }

    onAimDeg(deg: number) {
        this.m_shoot.onAimDeg(deg);
    }

    onAimTarget(target: Node) {
        this.m_targetRangeAim = target;
        this.m_shoot.onAimTarget(target);
    }

    onAimReset(delay: number = 0.02) {
        this.m_targetRangeAim = null;
        this.scheduleOnce(() => {
            this.m_spine.onAnimationClear(ConstantBase.ANIM_INDEX_ATTACK);
        }, delay);
    }
}