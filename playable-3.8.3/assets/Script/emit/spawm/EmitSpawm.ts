import { _decorator, CCString, director, Node } from 'cc';
import { EmitBaseEvent } from '../base/EmitBaseEvent';
const { ccclass, property } = _decorator;

@ccclass('EmitSpawm')
export class EmitSpawm extends EmitBaseEvent {

    @property({ group: { name: 'Main' }, type: Node })
    List: Node = null;
    @property({ group: { name: 'Main' }, type: Node })
    Spawm: Node = null;

    @property({ group: { name: 'Main', displayOrder: 99998 }, type: CCString })
    OnDestroy: string = '';
    @property({ group: { name: 'Main', displayOrder: 99999 }, type: CCString })
    EmitEnd: string = '';

    m_progess: boolean = false;
    m_spawm: Node[] = [];

    protected onLoad(): void {
        super.onLoad();
        if (this.List == null)
            this.List = this.node;
        for (let i = 0; i < this.List.children.length; i++)
            this.List.children[i].active = false;
        if (this.Spawm == null)
            this.Spawm = this.node;
    }

    onEventActive(): void {
        if (this.m_progess)
            return;
        this.m_progess = true;
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