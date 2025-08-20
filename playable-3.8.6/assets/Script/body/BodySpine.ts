import { _decorator, AudioSource, CCBoolean, CCInteger, CCString, Component } from 'cc';
import { BodyBase } from './BodyBase';
import { SpineBase } from '../renderer/SpineBase';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('BodySpine')
export class BodySpine extends Component {

    //Đẩy HIT và DEAD vào BodyBase
    //Đẩy các phần còn lại vào PlayerControl, MoveFollow và MovePath
    //Xóa BodyBase

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

    // @property({ group: { name: 'Pick&Throw' }, type: CCString })
    // AnimPick: string = 'pick';
    // @property({ group: { name: 'Pick&Throw' }, type: CCString })
    // AnimPickLoop: string = 'pick_loop';
    // @property({ group: { name: 'Pick&Throw' }, type: CCString })
    // AnimThrow: string = 'throw';

    @property({ group: { name: 'Finish' }, type: CCString })
    AnimFinish: string = 'win';
    @property({ group: { name: 'Finish' }, type: CCBoolean })
    AnimFinishLoop: boolean = true;

    m_hit: boolean = false;
    m_hitLock: boolean = false;
    m_dead: boolean = false;

    m_body: BodyBase = null;
    m_spine: SpineBase = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_spine = this.getComponent(SpineBase);
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

    //PICK:

    // onPick(): number {
    //     if (this.m_hit || this.m_dead)
    //         return 0;
    //     return this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_PICK, this.AnimPick, false);
    // }

    // onPickLoop(): number {
    //     if (this.m_hit || this.m_dead)
    //         return 0;
    //     return this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_PICK, this.AnimPickLoop, true);
    // }

    // onThrow(): number {
    //     if (this.m_hit || this.m_dead)
    //         return 0;
    //     return this.m_spine.onAnimationIndex(ConstantBase.ANIM_INDEX_PICK, this.AnimThrow, false);
    // }

    // onPickEmty() {
    //     this.m_spine.onAnimationClear(ConstantBase.ANIM_INDEX_PICK);
    // }
}