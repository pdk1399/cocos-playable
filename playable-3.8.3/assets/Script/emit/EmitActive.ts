import { _decorator, CCBoolean, Component, Enum, Node, sp } from 'cc';
import { EmitBase } from './EmitBase';
const { ccclass, property } = _decorator;

export enum TargetType {
    Node,
    Spine,
    SpineColor,
}
Enum(TargetType);

export enum ValueType {
    On,
    Off,
    Revert,
}
Enum(ValueType);

@ccclass('EmitActive')
export class EmitActive extends EmitBase {

    @property({ group: { name: 'Event' }, type: TargetType })
    EventType: TargetType = TargetType.Node;
    @property({ group: { name: 'Event' }, type: ValueType })
    EventState: ValueType = ValueType.On;

    onEventActive(): void {
        this.EmitNode.forEach(target => {
            this.onEventActiveNode(target);
        });
    }

    onEventActiveNode(target: Node): void {
        switch (this.EventState) {
            case ValueType.On:
                this.onEventSingle(target, true, this.EventType);
                break;
            case ValueType.Off:
                this.onEventSingle(target, false, this.EventType);
                break;
            case ValueType.Revert:
                this.onEventSingleRevert(target, this.EventType);
                break;
        }
    }

    onEventSingle(target: Node, state: boolean, targetType: TargetType) {
        if (target == null ? true : !target.isValid)
            return;
        switch (targetType) {
            case TargetType.Node:
                target.active = state;
                break;
            case TargetType.Spine:
                {
                    let targetSpine = target.getComponent(sp.Skeleton);
                    if (targetSpine == null) {
                        this.onEventSingle(target, state, TargetType.Node);
                        return;
                    }
                    targetSpine.enabled = state;
                }
                break;
            case TargetType.SpineColor:
                {
                    let targetSpine = target.getComponent(sp.Skeleton);
                    if (targetSpine == null) {
                        this.onEventSingle(target, state, TargetType.Node);
                        return;
                    }
                    let targetSpineColor = targetSpine.color;
                    targetSpineColor.set(targetSpineColor.r, targetSpineColor.g, targetSpineColor.b, state ? 255 : 0);
                    targetSpine.color = targetSpineColor;
                }
                break;
        }
    }

    onEventSingleRevert(target: Node, targetType: TargetType) {
        if (target == null ? true : !target.isValid)
            return;
        switch (targetType) {
            case TargetType.Node:
                target.active = !target.active;
                break;
            case TargetType.Spine:
                {
                    let targetSpine = target.getComponent(sp.Skeleton);
                    if (targetSpine == null) {
                        this.onEventSingleRevert(target, TargetType.Node);
                        return;
                    }
                    targetSpine.enabled = !targetSpine.enabled;
                }
                break;
            case TargetType.SpineColor:
                {
                    let targetSpine = target.getComponent(sp.Skeleton);
                    if (targetSpine == null) {
                        this.onEventSingleRevert(target, TargetType.Node);
                        return;
                    }
                    let targetSpineColor = targetSpine.color;
                    targetSpineColor.set(targetSpineColor.r, targetSpineColor.g, targetSpineColor.b, targetSpineColor.a != 255 ? 255 : 0);
                    targetSpine.color = targetSpineColor;
                }
                break;
        }
    }
}