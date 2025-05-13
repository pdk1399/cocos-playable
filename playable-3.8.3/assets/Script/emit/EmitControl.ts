import { _decorator, CCBoolean, director, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { EmitBaseFull } from './EmitBaseFull';
const { ccclass, property } = _decorator;

@ccclass('EmitControl')
export class EmitControl extends EmitBaseFull {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Control: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control; } })
    ControlByNode: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode; } })
    ControlSleep: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode && !this.ControlSleep; } })
    ControlRelease: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease; } })
    ControlReleaseX: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease; } })
    ControlReleaseY: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseX; } })
    ControlLeft: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseX; } })
    ControlRight: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseY; } })
    ControlUp: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseY; } })
    ControlDown: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode && !this.ControlSleep && !this.ControlRelease && !this.ControlReleaseY; } })
    ControlJump: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode; } })
    ControlAttack: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode; } })
    ControlInteraction: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EmitControl) { return this.Control && this.ControlByNode && !this.ControlSleep; } })
    ControlFixed: boolean = false;

    @property({ group: { name: 'Option' }, type: CCBoolean })
    BodyX2: boolean = false;
    @property({ group: { name: 'Option' }, type: CCBoolean })
    BodyX4: boolean = false;

    onEventActiveNode(target: Node): void {
        //OPTION
        if (this.BodyX2) {
            if (this.ControlByNode)
                target.emit(ConstantBase.BODY_X2);
            else
                director.emit(ConstantBase.BODY_X2);
        }

        if (this.BodyX4) {
            if (this.ControlByNode)
                target.emit(ConstantBase.BODY_X4);
            else
                director.emit(ConstantBase.BODY_X4);
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
            target.emit(ConstantBase.BODY_SLEEP);
            return;
        }
        else
            target.emit(ConstantBase.BODY_AWAKE);

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