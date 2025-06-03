import { _decorator, Enum, Node, Vec2, Vec3 } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { EmitBaseNode } from './EmitBaseNode';
const { ccclass, property } = _decorator;

export enum ValueType {
    None,
    HitPoint,
    HitPointCurrent,
    LockX,
    LockY,
    MoveGround,
    MoveJump,
    MeleeHit,
}
Enum(ValueType);

export enum ParamType {
    None,
    Node,
    Number,
    Boolean,
    String,
    Vec2,
    Vec3,
}
Enum(ParamType);

@ccclass('EmitValue')
export class EmitValue extends EmitBaseNode {

    @property({ group: { name: 'Main' }, type: ValueType })
    Value: ValueType = ValueType.None;
    @property({ group: { name: 'Main' }, type: Node, visible(this: EmitValue) { return this.showFieldEditor(this.Value, ParamType.Node); } })
    ParamNode: Node = null;
    @property({ group: { name: 'Main' }, type: Number, visible(this: EmitValue) { return this.showFieldEditor(this.Value, ParamType.Number); } })
    ParamNumber: number = 0;
    @property({ group: { name: 'Main' }, type: Boolean, visible(this: EmitValue) { return this.showFieldEditor(this.Value, ParamType.Boolean); } })
    ParamBoolean: boolean = false;
    @property({ group: { name: 'Main' }, type: String, visible(this: EmitValue) { return this.showFieldEditor(this.Value, ParamType.String); } })
    ParamString: string = '';
    @property({ group: { name: 'Main' }, type: Vec2, visible(this: EmitValue) { return this.showFieldEditor(this.Value, ParamType.Vec2); } })
    ParamVec2: Vec2 = new Vec2(0, 0);
    @property({ group: { name: 'Main' }, type: Vec3, visible(this: EmitValue) { return this.showFieldEditor(this.Value, ParamType.Vec3); } })
    ParamVec3: Vec3 = new Vec3(0, 0, 0);

    onEventActiveNode(target: Node): void {
        target.emit(this.getValue(), this.getParam(this.Value));
    }

    private getValue(): string {
        switch (this.Value) {
            case ValueType.HitPoint:
                return ConstantBase.NODE_VALUE_HIT_POINT;
            case ValueType.HitPointCurrent:
                return ConstantBase.NODE_VALUE_HIT_POINT_CURRENT;
            case ValueType.LockX:
                return ConstantBase.NODE_VALUE_LOCK_X;
            case ValueType.LockY:
                return ConstantBase.NODE_VALUE_LOCK_Y;
            case ValueType.MoveGround:
                return ConstantBase.NODE_VALUE_MOVE_GROUND;
            case ValueType.MoveJump:
                return ConstantBase.NODE_VALUE_MOVE_JUMP;
            case ValueType.MeleeHit:
                return ConstantBase.NODE_VALUE_MELEE_HIT;
        }
        return '';
    }

    private getParam(value: ValueType): any {
        switch (value) {
            case ValueType.HitPoint:
            case ValueType.HitPointCurrent:
            case ValueType.MoveGround:
            case ValueType.MoveJump:
            case ValueType.MeleeHit:
                return this.ParamNumber;
            case ValueType.LockX:
            case ValueType.LockY:
                return this.ParamBoolean;
        }
        return null;
    }

    private showFieldEditor(value: ValueType, param: ParamType): boolean {
        if (value == ValueType.HitPoint && param == ParamType.Number)
            return true;
        if (value == ValueType.HitPointCurrent && param == ParamType.Number)
            return true;
        if (value == ValueType.LockX && param == ParamType.Boolean)
            return true;
        if (value == ValueType.LockY && param == ParamType.Boolean)
            return true;
        if (value == ValueType.MoveGround && param == ParamType.Number)
            return true;
        if (value == ValueType.MoveJump && param == ParamType.Number)
            return true;
        if (value == ValueType.MeleeHit && param == ParamType.Number)
            return true;
        return false;
    }
}