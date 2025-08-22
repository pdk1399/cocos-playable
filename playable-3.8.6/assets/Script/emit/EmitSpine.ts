import { _decorator, CCBoolean, CCFloat, CCString, Collider2D, Contact2DType, director, Node } from 'cc';
import { SpineBase } from '../renderer/SpineBase';
import { EmitBaseNode } from './base/EmitBaseNode';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EmitSpine')
export class EmitSpine extends EmitBaseNode {

    @property({ group: { name: 'Main' }, type: CCString })
    AnimStart: string = '';
    @property({ group: { name: 'Main' }, type: CCString, visible(this: EmitSpine) { return this.AnimStart != ''; } })
    AnimLoop: string = '';
    @property({ group: { name: 'Main' }, type: CCFloat, visible(this: EmitSpine) { return this.AnimStart != '' && this.AnimLoop != ''; } })
    AnimDelay: number = 0;
    @property({ group: { name: 'Main' }, type: CCString, visible(this: EmitSpine) { return this.AnimStart != '' && this.AnimLoop != ''; } })
    AnimEnd: string = '';
    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimEndLoop: boolean = false;

    @property({ group: { name: 'Option' }, type: CCBoolean })
    OnScene: boolean = true;

    private m_lockEventFinal = false;

    protected onLoad(): void {
        super.onLoad();

        this.node.on(ConstantBase.NODE_SPINE_STOP, this.onSpineStop, this);
        this.node.on(ConstantBase.NODE_SPINE_PLAY, this.onSpinePlay, this);

        if (this.OnScene) {
            director.on(ConstantBase.SCENE_STOP, this.onSpineStop, this);
            director.on(ConstantBase.SCENE_PLAY, this.onSpinePlay, this);
        }
    }

    onSpineStop(): void {
        //#2: Emit Node
        this.EmitNode.forEach(t => {
            if (t != null) {
                const spineBase = t.getComponent(SpineBase);
                if (spineBase != null) {
                    spineBase.onSpineStop();
                }
            }
        });

        //#3: Emit Node Target
        if (this.EmitTagTarget) {
            this.m_targetCollide.forEach(t => {
                if (t != null) {
                    const spineBase = t.getComponent(SpineBase);
                    if (spineBase != null) {
                        spineBase.onSpineStop();
                    }
                }
            });
        }
    }

    onSpinePlay(): void {
        //#2: Emit Node
        this.EmitNode.forEach(t => {
            if (t != null) {
                const spineBase = t.getComponent(SpineBase);
                if (spineBase != null) {
                    spineBase.onSpinePlay();
                }
            }
        });

        //#3: Emit Node Target
        if (this.EmitTagTarget) {
            this.m_targetCollide.forEach(t => {
                if (t != null) {
                    const spineBase = t.getComponent(SpineBase);
                    if (spineBase != null) {
                        spineBase.onSpinePlay();
                    }
                }
            });
        }
    }

    onEvent(): void {
        //DELAY
        this.scheduleOnce(() => {
            this.m_lockEventFinal = false; //Reset lock event

            //#2: Emit Node
            this.EmitNode.forEach(t => {
                if (t != null) {
                    this.onEventActiveNode(t);
                }
            });

            //#3: Emit Node Target
            if (this.EmitTagTarget) {
                this.m_targetCollide.forEach(t => {
                    if (t != null)
                        this.onEventActiveNode(t);
                });
                this.m_targetCollide.splice(0, this.m_targetCollide.length); //Reset all targets collide
            }
        }, Math.max(this.Delay, 0));

        //ONCE
        this.onEventOnceCheck();
    } // Re-code onEvent() to fix scheduleOnce & delay events

    onEventActiveNode(target: Node): void {
        if (target == null ? true : !target.isValid)
            return;
        const targetSpine = target.getComponent(SpineBase);
        if (targetSpine == null)
            return;
        this.onEventSingle(targetSpine);
    }

    //

    onEventSingle(target: SpineBase) {
        if (target == null ? true : !target.isValid)
            return;
        if (this.AnimStart == '')
            return;
        if (this.AnimLoop != '' && this.AnimEnd != '') {
            target.scheduleOnce(() => {
                target.scheduleOnce(() => {
                    target.scheduleOnce(() => {
                        this.onEventSingleFinal();
                    }, target.onAnimation(this.AnimEnd, this.AnimEndLoop));
                }, Math.max(target.onAnimation(this.AnimLoop, true), this.AnimDelay, 0));
            }, target.onAnimation(this.AnimStart, false));
        }
        else
            if (this.AnimLoop != '') {
                target.scheduleOnce(() => {
                    target.scheduleOnce(() => {
                        this.onEventSingleFinal();
                    }, Math.max(target.onAnimation(this.AnimLoop, this.AnimEndLoop), this.AnimDelay, 0));
                }, target.onAnimation(this.AnimStart, false));
            }
            else
                target.scheduleOnce(() => this.onEventSingleFinal(), target.onAnimation(this.AnimStart, this.AnimEndLoop));
    }

    onEventSingleFinal() {
        if (this.m_lockEventFinal)
            return;
        this.m_lockEventFinal = true; //Avoid multiple event final execute

        //#0: Emit Active
        this.onEventActive();

        //#1: Emit Director
        this.EmitEvent.forEach(event => {
            if (event != '') {
                director.emit(event);
            }
        });

        //NEXT
        if (this.EmitNodeNext != null)
            this.EmitNodeNext.emit(ConstantBase.NODE_EVENT);
    }
}