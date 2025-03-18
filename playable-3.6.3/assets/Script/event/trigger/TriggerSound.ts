import { _decorator, Component, AudioSource, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Contact2DType, director, IPhysics2DContact } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('TriggerSound')
export class TriggerSound extends Component {

    @property({ group: { name: 'Target' }, type: [AudioSource] })
    Target: AudioSource[] = [];
    @property({ group: { name: 'Target' }, type: CCBoolean })
    TargetContact: boolean = false;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnEventState: boolean = true;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 0;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    protected onLoad(): void {
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.TagBody:
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    break;
            }
        });
        if (this.OnNode)
            this.node.on(ConstantBase.NODE_EVENT, this.onEventList, this);
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex < 0)
            return;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.onEventList(this.OnEventState);
            if (this.TargetContact)
                this.onEventSingle(otherCollider.getComponent(AudioSource), this.OnEventState);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }, Math.max(this.Delay, 0));
        if (this.Once) {
            let colliders = this.getComponents(Collider2D);
            colliders.forEach(collider => {
                switch (collider.tag) {
                    case this.TagBody:
                        collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        break;
                }
            });
        }
    }

    onEventList(state?: boolean) {
        this.Target = this.Target.filter(t => t != null);
        this.Target.forEach(target => this.onEventSingle(target, state));
        this.Target = this.Target.filter(t => t != null);
    }

    onEventSingle(target: AudioSource, state?: boolean) {
        if (target == null ? true : !target.isValid)
            return;
        if (state != null ? state : this.OnEventState)
            target.play();
        else
            target.stop();
    }
}