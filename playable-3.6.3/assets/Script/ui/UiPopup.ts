import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Input, Node, Vec3 } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('UiPopup')
export class UiPopup extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat, visible(this: UiPopup) { return this.Start; } })
    DelayStart: number = 15;
    @property({ group: { name: 'Event' }, type: CCString })
    OnPopup: string = '';
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 2;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitPopup: string = ConstantBase.DIRECT_STORE;

    @property({ group: { name: 'Popup' }, type: Node })
    Mask: Node = null;
    @property({ group: { name: 'Popup' }, type: Node })
    Panel: Node = null;
    @property({ group: { name: 'Popup' }, type: Node })
    Button: Node = null;

    m_active: boolean = false;

    protected onLoad(): void {
        if (this.OnPopup != '')
            director.on(this.OnPopup, this.onPopup, this);
        if (this.Button != null)
            this.Button.on(Input.EventType.TOUCH_START, this.onButton, this);
    }

    protected start(): void {
        this.Mask.active = false;
        this.Panel.active = false;
        this.Panel.scale = Vec3.ZERO;
        if (this.Start)
            this.scheduleOnce(() => this.onPopup(), this.DelayStart);
    }

    onPopup() {
        if (this.m_active)
            return;
        this.m_active = true;
        this.scheduleOnce(() => {
            this.Mask.active = true;
            this.Panel.active = true;
        }, this.Delay);
        director.off(this.OnPopup, this.onPopup, this);
    }

    onButton() {
        if (this.EmitPopup != '')
            director.emit(this.EmitPopup);
    }
}