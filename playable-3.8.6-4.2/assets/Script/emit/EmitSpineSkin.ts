import { _decorator, CCString, Component, Node, sp } from 'cc';
import { EmitBaseNode } from './base/EmitBaseNode';
import { SpineBase } from '../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('EmitSpineSkin')
export class EmitSpineSkin extends EmitBaseNode {

    @property({ group: { name: 'Main' }, type: sp.SkeletonData })
    Skeleton: sp.SkeletonData = null;
    @property({ group: { name: 'Main' }, type: [CCString] })
    Skin: string[] = [];

    onEventActiveNode(target: Node): void {
        if (target == null ? true : !target.isValid)
            return;
        let targetSpine = target.getComponent(SpineBase);
        if (targetSpine == null)
            return;
        targetSpine.onSekeleton(this.Skeleton);
        targetSpine.onSkin(...this.Skin);
    }
}