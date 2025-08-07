import { _decorator, AudioSource, CCBoolean, CCInteger, CCString, Component } from 'cc';
import { BodyBase } from './BodyBase';
import { SpineBase } from '../renderer/SpineBase';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('BodySpine')
export class BodySpine extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimIdleActive: boolean = true;
    @property({ group: { name: 'Main' }, type: CCString, visible(this: BodySpine) { return this.AnimIdleActive; } })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: BodySpine) { return this.AnimIdleActive; } })
    AnimIdleLoop: boolean = true;
    @property({ group: { name: 'Main' }, type: CCString })
    AnimMove: string = 'move';
    @property({ group: { name: 'Main' }, type: CCString })
    AnimPush: string = 'push';
    @property({ group: { name: 'Main' }, type: CCString })
    AnimAirOn: string = 'air_on';
    @property({ group: { name: 'Main' }, type: CCString })
    AnimAirOff: string = 'air_off';
    @property({ group: { name: 'Main' }, type: CCString })
    AnimDash: string = 'dash';

    @property({ group: { name: 'Hit' }, type: CCBoolean })
    AnimHitActive: boolean = true;
    @property({ group: { name: 'Hit' }, type: CCString, visible(this: BodySpine) { return this.AnimHitActive; } })
    AnimHit: string = 'hit';
    @property({ group: { name: 'Hit' }, type: CCBoolean })
    AnimDeadActive: boolean = true;
    @property({ group: { name: 'Hit' }, type: CCString, visible(this: BodySpine) { return this.AnimDeadActive; } })
    AnimDead: string = 'dead';
    @property({ group: { name: 'Hit' }, type: CCBoolean, visible(this: BodySpine) { return this.AnimDeadActive; } })
    AnimDeadLoop: boolean = true;

    @property({ group: { name: 'Pick&Throw' }, type: CCString })
    AnimPick: string = 'pick';
    @property({ group: { name: 'Pick&Throw' }, type: CCString })
    AnimPickLoop: string = 'pick_loop';
    @property({ group: { name: 'Pick&Throw' }, type: CCString })
    AnimThrow: string = 'throw';

    @property({ group: { name: 'Finish' }, type: CCString })
    AnimFinish: string = 'win';
    @property({ group: { name: 'Finish' }, type: CCBoolean })
    AnimFinishLoop: boolean = true;

    @property({ group: { name: 'Audio' }, type: AudioSource })
    AudioJump: AudioSource = null;
    @property({ group: { name: 'Audio' }, type: AudioSource })
    AudioHit: AudioSource = null;
    @property({ group: { name: 'Audio' }, type: AudioSource })
    AudioFinish: AudioSource = null;
    @property({ group: { name: 'Audio' }, type: AudioSource })
    AudioDead: AudioSource = null;
    @property({ group: { name: 'Audio' }, type: AudioSource })
    AudioDash: AudioSource = null;

    m_hit: boolean = false;
    m_dead: boolean = false;

    m_lockAttack: boolean = false;

    m_body: BodyBase = null;
    m_spine: SpineBase = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_spine = this.getComponent(SpineBase);

        this.node.on(ConstantBase.NODE_BODY_HIT, this.onHit, this);
        this.node.on(ConstantBase.NODE_BODY_DEAD, this.onDead, this);
    }

    //

    onViewDirection(direction: number): boolean {
        let change = false;
        if (this.m_spine != null) {
            if (direction == -1 && this.m_spine.Spine._skeleton.scaleX > 0)
                change = true;
            else if (direction == 1 && this.m_spine.Spine._skeleton.scaleX < 0)
                change = true;
            this.m_spine.onFaceDir(direction);
        }
        return change;
    }

    //

    onIdle(force: boolean = false): number {
        if (this.m_hit || this.m_dead)
            return 0;
        if (!force) {
            if (!this.AnimIdleActive)
                return 0;
            if (this.m_hit)
                return 0;
        }
        return this.m_spine.onAnimation(this.AnimIdle, this.AnimIdleLoop);
    }

    onHit(): number {
        if (this.m_hit || this.m_dead)
            return 0;
        if (!this.AnimHitActive)
            return 0;
        if (this.m_lockAttack)
            return 0;
        if (this.m_body.Protect && this.m_body.Protect)
            return;
        if (this.AudioHit != null)
            this.AudioHit.play();
        this.m_hit = true;
        let animHitDuration = this.m_spine.onAnimationForceUnSave(this.AnimHit, false);
        this.scheduleOnce(() => {
            this.m_hit = false;
            if (!this.m_dead)
                this.onIdle();
        }, animHitDuration);
        return animHitDuration;
    }

    onDead(): number {
        if (this.m_body.Protect && this.m_body.Protect)
            return;
        if (this.AudioDead != null)
            this.AudioDead.play();
        this.m_dead = true;
        if (!this.AnimDeadActive)
            return 0;
        return this.m_spine.onAnimationForce(this.AnimDead, this.AnimDeadLoop);
    }

    onMove(): number {
        if (this.m_hit || this.m_dead)
            return 0;
        return this.m_spine.onAnimation(this.AnimMove, true);
    }

    onPush(): number {
        if (this.m_hit || this.m_dead)
            return 0;
        return this.m_spine.onAnimation(this.AnimPush, true);
    }

    onAirOn(audioForce: boolean = true): number {
        if (this.m_hit || this.m_dead)
            return 0;
        if (this.AudioJump != null && (!audioForce ? this.m_spine.getAnimation() != this.AnimAirOn : true))
            this.AudioJump.play();
        return this.m_spine.onAnimation(this.AnimAirOn, true);
    }

    onAirOff(): number {
        if (this.m_hit || this.m_dead)
            return 0;
        return this.m_spine.onAnimation(this.AnimAirOff, true);
    }

    onComplete(audioForce: boolean = true): number {
        if (this.m_hit || this.m_dead)
            return 0;
        if (this.AudioFinish != null && (!audioForce ? this.m_spine.getAnimation() != this.AnimFinish : true))
            this.AudioFinish.play();
        return this.m_spine.onAnimation(this.AnimFinish, this.AnimFinishLoop);
    }

    onDash(): number {
        if (this.m_hit || this.m_dead)
            return 0;
        return this.m_spine.onAnimation(this.AnimDash, true);
    }

    //ATTACK

    onAnimAttack(anim: string, animMix: boolean, loop: boolean, durationScale: boolean = false, timeScale: number = 1): number {
        if (!animMix)
            return this.m_spine.onAnimationForceUnSave(anim, loop, durationScale, timeScale);
        else
            return this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_ATTACK, anim, loop, durationScale, timeScale);
    }

    //PICK:

    onPick(): number {
        if (this.m_hit || this.m_dead)
            return 0;
        return this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_PICK, this.AnimPick, false);
    }

    onPickLoop(): number {
        if (this.m_hit || this.m_dead)
            return 0;
        return this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_PICK, this.AnimPickLoop, true);
    }

    onThrow(): number {
        if (this.m_hit || this.m_dead)
            return 0;
        return this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_PICK, this.AnimThrow, false);
    }

    onPickEmty() {
        this.m_spine.onAnimationClear(ConstantBase.ANIM_INDEX_PICK);
    }
}