import { _decorator, CCBoolean, CCInteger, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { UIDrag } from './UIDrag';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('UIDrop')
export class UIDrop extends Component {

    m_uiDrag: UIDrag[] = [];

    protected start(): void {
        this.node.children.forEach(child => {
            const uiDrag = child.getComponent(UIDrag);
            if (uiDrag != null)
                this.onDropEnter(uiDrag);
        });
    }

    onDropEnter(target: UIDrag) {
        target.m_drop = this.node;
        target.m_uiDrop = this;
        this.m_uiDrag.push(target);
        this.node.emit(ConstantBase.NODE_UI_DROP_ENTER, target.node);
        this.node.emit(ConstantBase.NODE_UI_DRAG_EXIT, target.node);
    }

    onDropBack(target: UIDrag) {
        this.node.emit(ConstantBase.NODE_UI_DROP_BACK, target.node);
        this.node.emit(ConstantBase.NODE_UI_DRAG_EXIT, target.node);
    }

    onDropExit(target: UIDrag) {
        target.m_drop = null;
        target.m_uiDrop = null;
        target.m_uiDropLast = this;
        const index = this.m_uiDrag.indexOf(target);
        if (index < 0)
            return;
        this.m_uiDrag.splice(index, 1);
        this.node.emit(ConstantBase.NODE_UI_DROP_EXIT, target.node);
        this.node.emit(ConstantBase.NODE_UI_DRAG_EXIT, target.node);
    }

    onDragEnter(target: UIDrag) {
        this.node.emit(ConstantBase.NODE_UI_DRAG_ENTER, target.node);
    }

    onDragExit(target: UIDrag) {
        this.node.emit(ConstantBase.NODE_UI_DRAG_EXIT, target.node);
    }
}