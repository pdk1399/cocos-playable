import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node, Tween, tween, TweenEasing, v2, v3, Vec2, Vec3 } from 'cc';
import { EaseType } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('MoveOnce')
export class MoveOnce extends Component {

    @property(Node)
    Target: Node = null;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: MoveOnce) { return !this.Start; } })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: MoveOnce) { return !this.Start; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = ''

    @property({ group: { name: 'Main' }, type: CCBoolean })
    MoveToWorld: boolean = false;
    @property({ group: { name: 'Main' }, type: Vec2 })
    MoveTo: Vec2 = v2();
    @property({ group: { name: 'Main' }, type: Vec2 })
    MoveOffset: Vec2 = v2();
    @property({ group: { name: 'Main' }, type: CCFloat })
    Duration: number = 1;
    @property({ group: { name: 'Main' }, type: EaseType })
    Ease: EaseType = EaseType.linear;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Fixed: boolean = true;

    @property({ group: { name: 'Option' }, type: CCBoolean })
    CompleteDestroy: boolean = false;

    m_valueA: Vec3;
    m_valueB: Vec3;

    //

    protected onLoad(): void {
        if (this.Start)
            return;
        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onEvent, this);
    }

    protected start(): void {
        if (this.Target == null)
            this.Target = this.node;
        if (this.Start)
            this.onEvent();
    }

    //

    onEvent() {
        let moveA = this.MoveToWorld ? this.Target.worldPosition.clone() : this.Target.position.clone();
        this.m_valueA = v3(moveA.x, moveA.y, moveA.z);
        this.m_valueB = v3(this.MoveTo.clone().x + this.MoveOffset.clone().x, this.MoveTo.clone().y + this.MoveOffset.clone().y, moveA.clone().z);

        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => this.onTween(), this.Delay + (this.Fixed ? 0.02 : 0));

        if (this.Once)
            director.off(this.OnEvent, this.onEvent, this);
    }

    private onTween() {
        Tween.stopAllByTarget(this.Target);
        if (this.MoveToWorld) {
            //World
            tween(this.Target)
                .call(() => this.node.worldPosition = this.m_valueA.clone())
                .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                .call(() => {
                    if (this.EmitEvent != '')
                        director.emit(this.EmitEvent);
                })
                .call(() => {
                    if (this.CompleteDestroy)
                        this.scheduleOnce(() => this.node.destroy(), this.Fixed ? 0.02 : 0);
                })
                .start();
        }
        else {
            //Local
            tween(this.Target)
                .call(() => this.node.position = this.m_valueA.clone())
                .to(this.Duration, { position: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                .call(() => {
                    if (this.EmitEvent != '')
                        director.emit(this.EmitEvent);
                })
                .call(() => {
                    if (this.CompleteDestroy)
                        this.scheduleOnce(() => this.node.destroy(), this.Fixed ? 0.02 : 0);
                })
                .start();
        }
    }
}