import { _decorator, CCBoolean, CCInteger, CCString, Collider2D, Component, Contact2DType, director, EventMouse, EventTouch, Input, IPhysics2DContact, sp, tween, Tween, v3 } from 'cc';
import { StickField } from './StickField';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('StickController')
export class StickController extends Component {
    @property(CCBoolean)
    UnitTeam: boolean = true;

    @property(CCString)
    protected AnimIdle: string = 'idle';

    @property(CCString)
    AnimChoice: string = 'fly';

    @property(CCString)
    AnimDead: string = 'dead';

    @property(CCString)
    AnimWin: string = 'attack_2';

    @property(CCInteger)
    Health: number = 5;

    spine = null;
    anim: string = "";
    animDuration: number = 0;
    animDurationScale: number = 0;
    spineScaleXR: number;
    faceR: number;
    health: number;

    protected animCurrent(): string { return this.anim; }

    public isTeam(): boolean { return this.UnitTeam; };

    public valueHealth(): number { return this.health; }

    public isDead(): boolean { return this.health <= 0; }

    public isStop(): boolean { return this.isDead() || !StickField.Instance.isBattleStart() || StickField.Instance.isBattleEnd(); }

    //

    protected onLoad(): void {
        this.spine = this.node.getChildByName('spine').getComponent(sp.Skeleton);
        this.faceR = this.UnitTeam ? 1 : -1;
        this.spineScaleXR = this.spine._skeleton.scaleX * (this.UnitTeam ? 1 : -1);
        this.health = this.Health;
        //
        director.on(ConstantBase.BATTLE_END, this.onBattleEnd, this);
    }

    //

    public SetChoice(Choice: boolean): void {
        this.SetAnim(Choice ? this.AnimChoice : this.AnimIdle, true);
    }

    //

    protected SetSkin(Skin: string) {
        let skin = new this.spine.Skin('base-char');
        let data = this.spine._skeleton.data;
        skin.addSkin(data.findSkin(Skin));
        this.spine._skeleton.setSkin(skin);
        this.spine._skeleton.setSlotsToSetupPose();
        this.spine.getState().apply(this.spine._skeleton);
    }

    protected SetAnim(Anim: string, Loop: boolean, DurationScale: boolean = false): number {
        if (this.anim == Anim) {
            //console.warn("[Stick] " + this.node.name + " anim: " + (Anim));
            return DurationScale ? this.animDurationScale : this.animDuration;
        }
        this.anim = Anim;
        this.animDuration = this.spine.setAnimation(0, Anim, Loop).animationEnd;
        this.animDurationScale = this.animDuration / this.spine.timeScale;
        return DurationScale ? this.animDurationScale : this.animDuration;
    }

    protected SetTimeScale(TimeScale: number = 1) {
        this.spine.timeScale = TimeScale;
    }

    //

    protected SetFaceL(): void {
        this.faceR = -1;
        this.spine._skeleton.scaleX = -this.spineScaleXR;
    }

    protected SetFaceR(): void {
        this.faceR = 1;
        this.spine._skeleton.scaleX = this.spineScaleXR;
    }

    //

    public SetHealth(Add: number): void {
        if (this.isDead())
            return;
        //
        this.health += Add;
        if (this.health <= 0)
            this.SetDead();
        else
            if (this.health > this.Health)
                this.health = this.Health;
        //
        //console.log("[Stick] " + this.name + " health " + this.health + " add " + Add);
    }

    public SetDead(): void {
        this.health = 0;
        this.SetAnim(this.AnimDead, false);
        //
        StickField.Instance.SetStickRemove(this, this.isTeam());
        //
        if (this.isTeam())
            director.emit(ConstantBase.STICK_BLUE_DEAD, this.node);
        else
            director.emit(ConstantBase.STICK_RED_DEAD, this.node);
        //
        //console.log("[Stick] " + this.name + " dead!");
    }

    //

    private onBattleEnd(): void {
        if (this.isDead())
            return;
        //
        this.SetAnim(this.AnimWin, true);
    }
}