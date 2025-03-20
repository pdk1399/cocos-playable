import { _decorator, Component, director, Label, Node, Size, UITransform, v2, Vec2, Vec3 } from 'cc';
import { StickController } from './StickBattleController';
import { StickField } from './StickBattleField';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('StickProgess')
export class StickProgess extends Component {
    @property(Label)
    LabelBlue: Label = null;

    @property(Label)
    LabelRed: Label = null;

    @property(UITransform)
    BarBlue: UITransform = null;

    @property(UITransform)
    BarRed: UITransform = null;

    @property(Node)
    Centre: Node = null;

    barLength: number = 0;

    protected onLoad(): void {
        this.barLength = this.BarRed.contentSize.x;
        //
        director.on(ConstantBase.STICK_BLUE_DEAD, this.onStickDead, this);
        director.on(ConstantBase.STICK_RED_DEAD, this.onStickDead, this);
    }

    public SetInit(): void {
        this.LabelBlue.string = StickField.Instance.valueBlue().toString();
        this.LabelRed.string = StickField.Instance.valueRed().toString();
    }

    //

    private onStickDead(Target: StickController): void {
        this.SetProgessUpdate();
        //console.warn("B:" + (StickField.Instance.progessBlue()) + " R: " + (StickField.Instance.progessRed()));
    }

    //

    private SetProgessUpdate() {
        this.BarBlue.setContentSize(new Size(
            this.barLength * (StickField.Instance.progessBlue() + (1 - StickField.Instance.progessRed())),
            this.BarBlue.contentSize.y));
        this.LabelBlue.string = StickField.Instance.valueBlue().toString();
        //
        this.BarRed.setContentSize(new Size(
            this.barLength * (StickField.Instance.progessRed() + (1 - StickField.Instance.progessBlue())),
            this.BarRed.contentSize.y));
        this.LabelRed.string = StickField.Instance.valueRed().toString();
        //
        this.Centre.setPosition(new Vec3(this.barLength - this.BarRed.contentSize.x, this.Centre.position.y, 0));
    }
}