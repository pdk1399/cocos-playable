import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('TriggerControl')
export class TriggerControl extends Component {

    @property({ group: { name: 'Target' }, type: [Node] })
    Target: Node[] = [];
    @property({ group: { name: 'Target' }, type: CCBoolean })
    TargetContact: boolean = false;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Control: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control; } })
    ControlByNode: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode; } })
    ControlSleep: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode && !this.ControlSleep; } })
    ControlRelease: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease; } })
    ControlReleaseX: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease; } })
    ControlReleaseY: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseX; } })
    ControlLeft: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseX; } })
    ControlRight: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseY; } })
    ControlUp: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseY; } })
    ControlDown: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseY; } })
    ControlJump: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode; } })
    ControlAttack: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode; } })
    ControlInteraction: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: TriggerControl) { return this.Control && this.ControlByNode && !this.ControlSleep; } })
    ControlFixed: boolean = false;

    @property({ group: { name: 'Option' }, type: CCBoolean })
    BodyX2: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean })
    BodyX4: boolean = false;

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
            this.onEventList();
            if (this.TargetContact)
                this.onEventSingle(otherCollider.node);
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

    onEventList() {
        this.Target = this.Target.filter(t => t != null);
        this.Target.forEach(target => this.onEventSingle(target));
        this.Target = this.Target.filter(t => t != null);
    }

    onEventSingle(target: Node) {
        if (target == null ? true : !target.isValid)
            return;

        //OPTION
        if (this.BodyX2) {
            director.emit(ConstantBase.BODY_X2);
            target.emit(ConstantBase.BODY_X2);
        }
        if (this.BodyX4) {
            director.emit(ConstantBase.BODY_X4);
            target.emit(ConstantBase.BODY_X4);
        }

        if (!this.Control)
            return;
        //MAIN
        if (this.ControlByNode) {
            director.emit(ConstantBase.CONTROL_LOCK);
            target.emit(ConstantBase.NODE_CONTROL_NODE, true);
            target.emit(ConstantBase.NODE_CONTROL_DIRECTOR, false);
        }
        else {
            director.emit(ConstantBase.CONTROL_RESUME);
            target.emit(ConstantBase.NODE_CONTROL_NODE, false);
            target.emit(ConstantBase.NODE_CONTROL_DIRECTOR, true);
            return;
        }

        if (this.ControlSleep) {
            target.emit(ConstantBase.NODE_BODY_SLEEP);
            return;
        }
        else
            target.emit(ConstantBase.NODE_BODY_AWAKE);

        if (this.ControlRelease)
            target.emit(ConstantBase.CONTROL_RELEASE);
        else {
            if (this.ControlReleaseX)
                target.emit(ConstantBase.CONTROL_RELEASE_X);
            else {
                if (this.ControlLeft)
                    target.emit(ConstantBase.CONTROL_LEFT);
                if (this.ControlRight)
                    target.emit(ConstantBase.CONTROL_RIGHT);
            }

            if (this.ControlReleaseY)
                target.emit(ConstantBase.CONTROL_RELEASE_Y);
            else {
                if (this.ControlUp)
                    target.emit(ConstantBase.CONTROL_UP);
                if (this.ControlDown)
                    target.emit(ConstantBase.CONTROL_DOWN);
                if (this.ControlJump)
                    target.emit(ConstantBase.CONTROL_JUMP);
            }
        }

        if (this.ControlAttack)
            target.emit(ConstantBase.CONTROL_ATTACK);

        if (this.ControlInteraction)
            target.emit(ConstantBase.CONTROL_INTERACTION);

        if (this.ControlFixed)
            target.emit(ConstantBase.CONTROL_FIXED);
    }
}