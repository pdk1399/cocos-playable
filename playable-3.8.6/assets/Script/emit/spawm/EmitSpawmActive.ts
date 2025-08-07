import { _decorator, director, Node } from 'cc';
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

        if (this.OnRemove != '')
            director.on(this.OnRemove, this.onRemove, this);
    }

    onRemove(target: Node) {
        if (!this.m_progess)
            return;
        if (target != null) {
            let index = this.m_spawm.findIndex(t => t == target);
            if (index < 0)
                return;
            this.m_spawm.splice(index, 1);
        }
        else {
            for (let i = this.m_spawm.length - 1; i >= 0; i--) {
                if (this.m_spawm[i].isValid)
                    continue;
                this.m_spawm.splice(i, 1);
            }
        }
        if (this.m_spawm.length == 0)
            this.onEventEnd();
    }
}