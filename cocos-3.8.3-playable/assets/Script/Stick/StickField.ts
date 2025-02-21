import { _decorator, CCBoolean, Color, Component, director, EventTouch, Input, input, KeyCode, Label, Node, Sprite, v2, v3, Vec2 } from 'cc';
import { StickController } from './StickController';
import { StickProgess } from './StickProgess';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('StickField')
export class StickField extends Component {

    static Instance: StickField;

    @property(CCBoolean)
    touchStart: boolean = true;

    @property(Node)
    Field: Node = null;

    @property(Node)
    Area: Node = null;

    @property(StickProgess)
    Progess: StickProgess = null;

    @property(Node)
    Hand: Node = null;

    @property(Node)
    BtnStart: Node = null;

    @property(Label)
    LabelTime: Label = null;

    //

    touchArea: Sprite[] = [];
    touchStick: StickController = null;
    touchTime: number = 0;

    //

    sticks: StickController[] = [];

    //

    stickBlueStart: number = 0;
    sticksBlue: StickController[] = [];

    public progessBlue(): number { return 1.0 * this.sticksBlue.length / (this.sticksBlue.length + this.sticksRed.length); }

    public valueBlue(): number { return this.sticksBlue.length; }

    //

    stickRedStart: number = 0;
    sticksRed: StickController[] = [];

    public progessRed(): number { return 1.0 * this.sticksRed.length / (this.sticksBlue.length + this.sticksRed.length); }

    public valueRed(): number { return this.sticksRed.length; }

    //

    battleStart: boolean = false;
    battleEnd: boolean = false;

    public isBattleStart(): boolean { return this.battleStart; }
    public isBattleEnd(): boolean { return this.battleEnd; }

    //

    readonly DELAY_BATTLE_END: number = 1;
    readonly DELAY_BATTLE_RESULT: number = 1.5;

    protected onLoad(): void {
        StickField.Instance = this;
    }

    protected start(): void {
        this.SetSticksUpdate();
        this.SetStickRenderer();
        //
        director.on(ConstantBase.BATTLE_START, this.onBattleStart, this);
        //
        for (var i = 0; i < this.Area.children.length; i++) {
            this.touchArea.push(this.Area.children[i].getComponent(Sprite));
            this.touchArea[i].node.on(Input.EventType.TOUCH_START, this.onAreaTouch, this);
            //
            //console.log("[Field] Area update " + this.touchArea[i].node.name);
        }
        this.SetAreaOut();
        //
        if (this.touchStart) {
            this.Hand.active = false;
            this.BtnStart.active = true;
        }
        else {
            this.Hand.active = true;
            this.Hand.getChildByName('label-pick').active = true;
            this.Hand.getChildByName('label-place').active = false;
            this.BtnStart.active = false;
        }
    }

    //

    private onAreaTouch(event: EventTouch): void {
        //console.log("[Field] Area " + event.target.name + " Touch!");
        //
        if (this.touchStick == null) {
            //If current not hold any Stick, find and sellect once!
            let indexArea = this.touchArea.findIndex((t) => t.node.name == event.target.name);
            if (indexArea >= 0) {
                //console.log("[Field] Area " + this.touchArea[indexArea].name);
                //
                let indexStick = this.sticksBlue.findIndex((t) => t.node.position.equals(this.touchArea[indexArea].node.position));
                if (indexStick >= 0) {
                    //If found a Stick in this Area, select it!
                    this.touchStick = this.sticksBlue[indexStick];
                    this.sticksBlue[indexStick].SetChoice(true);
                    //
                    this.SetAreaHold(this.touchArea[indexArea]);
                    //
                    //console.log("[Field] Choice " + this.touchStick.node.name);
                }
                else {
                    //If not found any Stick in this Area, not do anything!
                }
            }
        }
        else {
            //If current hold a Stick, find and sellect once Area to place it!
            this.touchStick.SetChoice(false);
            //
            let indexArea = this.touchArea.findIndex((t) => t.node.name == event.target.name);
            if (indexArea >= 0) {
                //console.log("[Field] Area " + this.Area[indexArea].name);
                //
                let indexStick = this.sticksBlue.findIndex((t) => t.node.position.equals(this.touchArea[indexArea].node.position));
                if (indexStick >= 0) {
                    //If found a Stick in this Area, swap them!
                    var OldPosition = this.touchStick.node.position.clone();
                    this.touchStick.node.setPosition(this.sticksBlue[indexStick].node.position);
                    this.sticksBlue[indexStick].node.setPosition(OldPosition);
                    //
                    //console.log("[Field] Swap " + this.stickChoice.node.name);
                }
                else {
                    //If not found any Stick in this Area, place Stick on that!
                    this.touchStick.node.setPosition(this.touchArea[indexArea].node.position);
                    //
                    //console.log("[Field] Place " + this.stickChoice.node.name);
                }
                //
                this.SetStickRenderer();
            }
            //
            this.SetAreaOut();
            //
            this.touchStick = null;
        }
        //
        if (this.touchStart) {
            //...
        }
        else {
            this.touchTime += 1;
            this.Hand.active = this.touchTime < 2;
            this.Hand.getChildByName('label-pick').active = this.touchTime == 0;
            this.Hand.getChildByName('label-place').active = this.touchTime == 1;
            this.BtnStart.active = this.touchTime >= 2;
            if (this.touchTime == 2)
                director.emit(ConstantBase.BATTLE_START_COUNTDOWN);
        }
    }

    private SetAreaHold(AreaHold: Sprite): void {
        this.Area.position = v3(0, -50, 0); //Fixed touch when hold a Stick!
        for (var i = 0; i < this.touchArea.length; i++)
            this.touchArea[i].enabled = this.touchArea[i] != AreaHold;
    }

    private SetAreaOut(): void {
        this.Area.position = v3(0, 0, 0); //Fixed touch when not hold a Stick!
        for (var i = 0; i < this.touchArea.length; i++)
            this.touchArea[i].enabled = false;
    }

    //

    private onBattleStart() {
        this.battleStart = true;
        //
        for (var i = 0; i < this.touchArea.length; i++) {
            this.touchArea[i].node.off(Input.EventType.TOUCH_START, this.onAreaTouch, this);
            this.touchArea[i].node.active = false;
        }
        //
        this.Hand.active = false;
        //
        console.log("[Field] Battle Start!");
    }

    private SetBattleEnd() {
        this.battleEnd = true;
        this.scheduleOnce(() => {
            director.emit(ConstantBase.BATTLE_END);
            this.scheduleOnce(() => {
                if (this.valueBlue() == 0)
                    director.emit(ConstantBase.GAME_LOSE);
                else
                    director.emit(ConstantBase.GAME_COMPLETE);
            }, this.DELAY_BATTLE_RESULT);
        }, this.DELAY_BATTLE_END);
        console.log("[Field] Battle End!");
    }

    //

    private SetSticksUpdate(): void {
        this.sticks = [];
        this.sticksBlue = [];
        this.sticksRed = [];
        for (var i = 0; i < this.Field.children.length; i++) {
            if (!this.Field.children[i].activeInHierarchy)
                //Don't check object if it not active!
                continue;
            //
            var Stick = this.Field.children[i].getComponent(StickController);
            if (Stick == null)
                continue;
            //
            this.sticks.push(Stick);
            //
            if (Stick.isTeam()) {
                this.sticksBlue.push(Stick);
                this.stickBlueStart++;
                //
                //console.log("[Field] Update " + Stick.node.getPosition().y)
            }
            else {
                this.sticksRed.push(Stick);
                this.stickRedStart++;
            }
        }
        //
        this.Progess.SetInit();
        //
        //console.log("[Field] Update " + this.sticksBlue.length + " Blue stick(s)!");
        //console.log("[Field] Update " + this.sticksRed.length + " Red stick(s)!");
    }

    //

    public SetStickRenderer(): void {
        for (var i = 0; i < this.sticks.length - 1; i++) {
            for (var j = i + 1; j < this.sticks.length; j++) {
                if (this.sticks[i].node.position.y < this.sticks[j].node.position.y) {
                    var Temp = this.sticks[i];
                    this.sticks[i] = this.sticks[j];
                    this.sticks[j] = Temp;
                }
            }
        }
        //
        for (var i = 0; i < this.sticks.length; i++)
            this.sticks[i].node.setSiblingIndex(i);
        //
        this.sticks.sort()
    }

    public SetStickRemove(Target: StickController, Team: boolean): void {
        let i = this.sticks.findIndex((t) => t == Target);
        if (i < 0) {
            console.warn("[Field] Remove " + Target.name + " fail because not exist in list!");
            return;
        }
        //this.sticks.splice(i, 1);
        //
        if (Team) {
            let i = this.sticksBlue.findIndex((t) => t == Target);
            this.sticksBlue.splice(i, 1);
        }
        else {
            let i = this.sticksRed.findIndex((t) => t == Target);
            this.sticksRed.splice(i, 1);
        }
        //
        //console.log("[Field] Remove " + Target.name + " stick!");
        //console.log("[Field] Remain " + this.sticksBlue.length + " Blue stick(s)!");
        //console.log("[Field] Remain " + this.sticksRed.length + " Red stick(s)!");
        //
        if (this.sticksBlue.length == 0 || this.sticksRed.length == 0)
            this.SetBattleEnd();
    }

    public SetStickAdd(Target: StickController, Team: boolean): void {
        let i = this.sticks.findIndex((t) => t == Target);
        if (i >= 0) {
            console.warn("[Field] Add " + Target.name + " fail because exist in list!");
            return;
        }
        this.sticks.push(Target);
        //
        if (Team)
            this.sticksBlue.push(Target);
        else
            this.sticksRed.push(Target);
        //
        //console.log("[Field] Add " + Target.name + " stick!");
        //console.log("[Field] Remain " + this.sticksBlue.length + " Blue stick(s)!");
        //console.log("[Field] Remain " + this.sticksRed.length + " Red stick(s)!");
    }

    public GetStickClosed(From: StickController, Team: boolean): StickController {
        if (From == null) {
            console.warn("[Field] Node null!");
            return null;
        }
        //
        if (this.sticks.length <= 1) {
            console.warn("[Field] There are only 1 stick in list!");
            return null;
        }
        //
        let i = this.sticks.findIndex((t) => t == From);
        if (i < 0) {
            console.warn("[Field] Node " + From.name + " not in list!");
            return null;
        }
        //
        if (Team)
            return this.GetStickClosedSingle(From, this.sticksRed);
        else
            return this.GetStickClosedSingle(From, this.sticksBlue);
    }

    private GetStickClosedSingle(From: StickController, List: StickController[]): StickController {
        var IndexMin = -1;
        var DistanceMin = 99999;
        for (var i = 0; i < List.length; i++) {
            if (From == List[i])
                continue;
            //
            var Distance = Vec2.distance(From.node.position, List[i].node.position);
            if (Distance >= DistanceMin)
                continue;
            IndexMin = i;
            DistanceMin = Distance;
        }
        //
        if (IndexMin == -1) {
            console.warn("[Field] Not found target!");
            return null;
        }
        return List[IndexMin];
    }
}