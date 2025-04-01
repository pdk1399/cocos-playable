import { _decorator, CCBoolean, CCInteger, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { UIDrag } from './UIDrag';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('UIDrop')
export class UIDrop extends Component {

    //NOTE: 
    //- Drag node (of UIDrag) & Drop node (of UIDrop) should have Rigidbody2D and Collider2D for full progress.
    //- Drag node (of UIDrag) must be the child of UIDrag node to avoid glitch when dragging.
    //- Drop node (of UIDrop) should got multiple collider to avoid glitch when fast dragging.
    //- UIDrag node must be the child of UIDrop node for working progress.
    //- Top node should have highest index view in scene (and shouldn't be null to avoid un-right view).

    @property({ group: { name: 'Option' }, type: CCBoolean })
    Debug: boolean = false;

    m_uiDrag: UIDrag[] = [];

    protected start(): void {
        this.node.children.forEach(child => {
            let uiDrag = child.getComponent(UIDrag);
            if (uiDrag != null)
                this.onDragEnter(uiDrag);
        });
    }

    onDragEnter(target: UIDrag) {
        target.m_drop = this.node;
        target.m_uiDrop = this;
        this.m_uiDrag.push(target);
        this.node.emit(ConstantBase.NODE_UI_DRAG_ENTER, target.node);
        if (this.Debug)
            console.log('Drag ' + target.node.name + ' enter ' + this.node.name);
    }

    onDragBack(target: UIDrag) {
        this.node.emit(ConstantBase.NODE_UI_DRAG_BACK, target.node);
        if (this.Debug)
            console.log('Drag ' + target.node.name + ' back ' + this.node.name);
    }

    onDragExit(target: UIDrag) {
        target.m_drop = null;
        target.m_uiDrop = null;
        let index = this.m_uiDrag.indexOf(target);
        if (index < 0)
            return;
        this.m_uiDrag.splice(index, 1);
        this.node.emit(ConstantBase.NODE_UI_DRAG_EXIT, target.node);
        if (this.Debug)
            console.log('Drag ' + target.node.name + ' exit ' + this.node.name);
    }
}