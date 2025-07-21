import { _decorator, CCInteger, Collider2D, Component, Contact2DType, director, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('ObjectFlag')
export class ObjectFlag extends Component {

    @property({ group: { name: 'Self' }, type: CCInteger })
    TagActive: number = 0;
    @property({ group: { name: 'Self' }, type: CCInteger })
    TagStop: number = -1;
    @property({ group: { name: 'Other' }, type: CCInteger })
    TagPlayer: number = 100;

    protected onLoad(): void {
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.TagActive:
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    break;
                case this.TagStop:
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    break;
            }
        });
    }

    protected onBeginContact(self: Collider2D, other: Collider2D): void {
        if (other.tag != this.TagPlayer)
            return;
        switch (self.tag) {
            case this.TagActive:
                director.emit(ConstantBase.CONTROL_LOCK);
                other.node.emit(ConstantBase.NODE_CONTROL_DIRECTOR, false);
                other.node.emit(ConstantBase.NODE_CONTROL_NODE, true);
                other.node.emit(ConstantBase.NODE_CONTROL_SLEEP);
                break;
            case this.TagStop:
                break;
        }
    }
}