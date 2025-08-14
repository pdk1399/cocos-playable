import { _decorator, AudioSource, Enum, Node, sp } from 'cc';
import { EmitBaseNode } from './base/EmitBaseNode';
const { ccclass, property } = _decorator;

export enum TargetType {
    Node,
    Spine,
    SpineColor,
    Audio,
}
Enum(TargetType);

export enum ValueType {
    On,
    Off,
    Revert,
}
Enum(ValueType);

@ccclass('EmitActive')
export class EmitActive extends EmitBaseNode {

    @property({ group: { name: 'Event' }, type: TargetType })
    EventType: TargetType = TargetType.Node;
    @property({ group: { name: 'Event' }, type: ValueType })
    EventState: ValueType = ValueType.On;

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

    //

    onEventSingle(target: Node, state: boolean, targetType: TargetType) {
        if (target == null ? true : !target.isValid)
            return;
        switch (targetType) {
            case TargetType.Node:
                target.active = state;
                break;
            case TargetType.Spine:
            case TargetType.SpineColor:
                const targetSpine = target.getComponent(sp.Skeleton);
                if (targetSpine == null) {
                    this.onEventSingle(target, state, TargetType.Node);
                    break;
                }
                if (targetType == TargetType.Spine)
                    targetSpine.enabled = state;
                else {
                    let targetSpineColor = targetSpine.color;
                    targetSpineColor.set(targetSpineColor.r, targetSpineColor.g, targetSpineColor.b, state ? 255 : 0);
                    targetSpine.color = targetSpineColor;
                }
                break;
            case TargetType.Audio:
                const targetAudio = target.getComponent(AudioSource);
                if (targetAudio == null) {
                    this.onEventSingle(target, state, TargetType.Node);
                    break;
                }
                if (state)
                    targetAudio.play();
                else
                    targetAudio.stop();
        }
    }

    onEventSingleRevert(target: Node, targetType: TargetType) {
        if (target == null ? true : !target.isValid)
            return;
        switch (targetType) {
            case TargetType.Node:
                target.active = !target.activeInHierarchy; // Can't use 'active' instead
                break;
            case TargetType.Spine:
            case TargetType.SpineColor:
                const targetSpine = target.getComponent(sp.Skeleton);
                if (targetSpine == null) {
                    this.onEventSingleRevert(target, TargetType.Node);
                    break;
                }
                if (targetType)
                    targetSpine.enabled = !targetSpine.enabled;
                else {
                    let targetSpineColor = targetSpine.color;
                    targetSpineColor.set(targetSpineColor.r, targetSpineColor.g, targetSpineColor.b, targetSpineColor.a != 255 ? 255 : 0);
                    targetSpine.color = targetSpineColor;
                }
                break;
            case TargetType.Audio:
                const targetAudio = target.getComponent(AudioSource);
                if (targetAudio == null) {
                    this.onEventSingleRevert(target, TargetType.Node);
                    break;
                }
                if (targetAudio.playing)
                    targetAudio.stop();
                else
                    targetAudio.play();
        }
    }
}