import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node, Sprite, Tween, tween, TweenEasing } from 'cc';
import { EaseType } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('SpriteFillRestart')
export class SpriteFillRestart extends Component {

    @property(Sprite)
    Target: Sprite = null;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: SpriteFillRestart) { return !this.Start; } })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: SpriteFillRestart) { return !this.Start; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = ''

    @property({ group: { name: 'Main' }, type: CCFloat })
    FillTo: number = 0;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Duration: number = 1;
    @property({ group: { name: 'Main' }, type: EaseType })
    Ease: EaseType = EaseType.linear;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DelayEach: number = 0;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Fixed: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Limit: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat })
    LimitCount: number = 1;

    m_valueA: number;
    m_valueB: number;

    //

    protected onLoad(): void {
        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onEvent, this);
    }

    protected start(): void {
        if (this.Target == null)
            this.Target = this.getComponent(Sprite);
        if (this.Start)
            this.onEvent();
    }

    //

    onEvent() {
        this.m_valueA = this.Target.fillRange;
        this.m_valueB = this.FillTo;

        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => this.onTween(), this.Delay + (this.Fixed ? 0.02 : 0));

        if (this.Once)
            director.off(this.OnEvent, this.onEvent, this);
    }

    private onTween() {
        Tween.stopAllByTarget(this.Target);
        if (this.Limit) {
            tween(this.Target)
                .repeat(this.LimitCount, tween(this.Target)
                    .call(() => this.Target.fillRange = this.m_valueA)
                    .to(this.Duration, { fillRange: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                    .delay(this.DelayEach)
                )
                .start();
        }
        else {
            tween(this.Target)
                .repeatForever(tween(this.Target)
                    .call(() => this.Target.fillRange = this.m_valueA)
                    .to(this.Duration, { fillRange: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                    .delay(this.DelayEach)
                )
                .start();
        }
    }
}