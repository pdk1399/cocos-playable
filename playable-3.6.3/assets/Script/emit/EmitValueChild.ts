import { _decorator, Component, Enum, Node, Vec2, Vec3 } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { EmitValue } from './EmitValue';
const { ccclass, property, requireComponent } = _decorator;

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

@ccclass('EmitValueChild')
@requireComponent(EmitValue)
export class EmitValueChild extends Component {

    @property({ group: { name: 'Main' }, type: [Node] })
    Targets: Node[] = [];
    @property({ group: { name: 'Main' }, type: ValueType })
    Value: ValueType = ValueType.None;
    @property({ group: { name: 'Main' }, type: ParamType, visible(this: EmitValueChild) { return this.Value != ValueType.None; } })
    Param: ParamType = ParamType.None;
    @property({ group: { name: 'Main' }, type: Node, visible(this: EmitValueChild) { return this.Value != ValueType.None && this.Param == ParamType.Node; } })
    ParamNode: Node = null;
    @property({ group: { name: 'Main' }, type: Number, visible(this: EmitValueChild) { return this.Value != ValueType.None && this.Param == ParamType.Number; } })
    ParamNumber: number = 0;
    @property({ group: { name: 'Main' }, type: Boolean, visible(this: EmitValueChild) { return this.Value != ValueType.None && this.Param == ParamType.Boolean; } })
    ParamBoolean: boolean = false;
    @property({ group: { name: 'Main' }, type: String, visible(this: EmitValueChild) { return this.Value != ValueType.None && this.Param == ParamType.String; } })
    ParamString: string = '';
    @property({ group: { name: 'Main' }, type: Vec2, visible(this: EmitValueChild) { return this.Value != ValueType.None && this.Param == ParamType.Vec2; } })
    ParamVec2: Vec2 = new Vec2(0, 0);
    @property({ group: { name: 'Main' }, type: Vec3, visible(this: EmitValueChild) { return this.Value != ValueType.None && this.Param == ParamType.Vec3; } })
    ParamVec3: Vec3 = new Vec3(0, 0, 0);

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_VALUE, this.onValue, this);
    }

    onValue(): void {
        this.Targets.forEach(t => {
            t.emit(this.getValue(), this.getParam());
        });
    }

    getValue(): string {
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

    getParam(): any {
        switch (this.Param) {
            case ParamType.Node:
                return this.ParamNode;
            case ParamType.Number:
                return this.ParamNumber;
            case ParamType.Boolean:
                return this.ParamBoolean;
            case ParamType.String:
                return this.ParamString;
            case ParamType.Vec2:
                return this.ParamVec2;
            case ParamType.Vec3:
                return this.ParamVec3;
            default:
                break;
        }
        return null;
    }
}