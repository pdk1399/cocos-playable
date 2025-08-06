import { _decorator, CCString, director, Node } from 'cc';
import { EmitBaseEvent } from '../base/EmitBaseEvent';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitSpawm')
export class EmitSpawm extends EmitBaseEvent {

    @property({ group: { name: 'Main' }, type: Node })
    List: Node = null;
    @property({ group: { name: 'Main', displayOrder: 99999 }, type: CCString })
    OnRemove: string = '';

    m_progess: boolean = false;
    m_spawm: Node[] = [];

    protected onLoad(): void {
        super.onLoad();
        if (this.List == null)
            this.List = this.node;
        if (!this.Start)
            for (let i = 0; i < this.List.children.length; i++)
                this.List.children[i].active = false;
    }

    onEvent(): void {
        //DELAY
        this.scheduleOnce(() => {
            //#0: Emit Active
            this.onEventActive();
        }, Math.max(this.Delay, 0));

        //ONCE
        this.onEventOnceCheck();
    } // Re-code onEvent() to fix scheduleOnce & delay events

    onEventActive(): void {
        if (this.m_progess)
            return;
        this.m_progess = true;
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
    }

    onEventEnd() {
        if (!this.m_progess)
            return;
        this.m_progess = false;
        if (this.OnRemove != '')
            director.off(this.OnRemove, this.onRemove, this);

        this.onEventComplete();
    }

    protected onEventComplete() {
        //#1: Emit Director
        this.EmitEvent.forEach(event => {
            if (event != '')
                director.emit(event);
        });

        //NEXT
        if (this.EmitNodeNext != null)
            this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);
    }
}