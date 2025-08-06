import { _decorator, CCBoolean, CCString, Component, director, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SpineState')
export class SpineState extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    OnEvent: string = 'on-event';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = 'emit-event'

    @property({ group: { name: 'State' }, type: sp.Skeleton })
    Spine: sp.Skeleton = null;
    @property({ group: { name: 'State' }, type: CCBoolean })
    State: boolean = true;
    @property({ group: { name: 'State' }, type: CCBoolean })
    StateRevert: boolean = true; //Used for revert trigger from Switch and Press event state!

    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimOnLoop: boolean = true;
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimOn: string = '';
    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimOffLoop: boolean = true;
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimOff: string = '';

    //

    protected onLoad(): void {
        director.on(this.OnEvent, this.onAnim, this);
    }

    protected start(): void {
        if (this.State)
            this.Spine.setAnimation(0, this.AnimOn, this.AnimOnLoop);
        else
            this.Spine.setAnimation(0, this.AnimOff, this.AnimOffLoop);
    }

    onAnim(state: boolean) {
        if (state)
            this.Spine.setAnimation(0, this.AnimOn, this.AnimOnLoop);
        else
            this.Spine.setAnimation(0, this.AnimOff, this.AnimOffLoop);

        if (this.Once)
            director.off(this.OnEvent, this.onAnim, this);
    }
}