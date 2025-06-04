import { _decorator, Component, director, Node } from 'cc';
import { EmitSpawm } from './EmitSpawm';
import { BodySpawm } from '../../body/option/BodySpawm';
const { ccclass, property } = _decorator;

@ccclass('EmitSpawmActive')
export class EmitSpawmActive extends EmitSpawm {

    onEventActive(): void {
        if (this.m_progess)
            return;
        this.m_progess = true;

        for (let i = 0; i < this.List.children.length; i++) {
            let target = this.List.children[i];

            //Target's Body Spawm component init
            let bodySpawm = target.getComponent(BodySpawm);
            if (bodySpawm != null)
                bodySpawm.onInit();

            //Target's Node active
            this.scheduleOnce(() => target.active = true, 0.02);

            this.m_spawm.push(target);
        }

        if (this.OnDestroy != '')
            director.on(this.OnDestroy, this.onTargetDestroy, this);
    }

    onTargetDestroy() {
        if (!this.m_progess)
            return;
        for (let i = this.m_spawm.length - 1; i >= 0; i--) {
            if (this.m_spawm[i] != null && this.m_spawm[i].isValid)
                continue;
            this.m_spawm.splice(i, 1);
        }
    }

    onEventEnd() {
        if (!this.m_progess)
            return;
        this.m_progess = false;
        if (this.OnDestroy != '')
            director.off(this.OnDestroy, this.onTargetDestroy, this);
        if (this.EmitEnd != '')
            director.emit(this.EmitEnd);
    }
}