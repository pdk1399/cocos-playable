import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Label, Node, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ValueHealthBar')
export class ValueHealthBar extends Component {

    @property({ group: { name: 'Show' }, type: CCBoolean })
    Full: boolean = true;
    @property({ group: { name: 'Show' }, type: CCFloat })
    Muti: number = 5;
    @property({ group: { name: 'Show' }, type: Label })
    Value: Label = null;
    @property({ group: { name: 'Show' }, type: Node })
    Mask: Node = null;
    @property({ group: { name: 'Show' }, type: Label })
    Name: Label = null;

    @property({ group: { name: 'Hide' }, type: CCBoolean })
    HideDead: boolean = false;
    @property({ group: { name: 'Hide' }, type: CCBoolean })
    Hide: boolean = false;
    @property({ group: { name: 'Hide' }, type: CCFloat, visible(this: ValueHealthBar) { return this.Hide; } })
    HideDelay: number = 3;
    @property({ group: { name: 'Hide' }, type: [Node], visible(this: ValueHealthBar) { return this.Hide || this.HideDead; } })
    HideNode: Node[] = [];

    m_maskSprite: Sprite = null;
    m_maskTransform: UITransform = null;
    m_maskTransformX: number;

    protected onLoad(): void {
        this.m_maskSprite = this.Mask.getComponent(Sprite);
        this.m_maskTransform = this.Mask.getComponent(UITransform);
        this.m_maskTransformX = this.m_maskTransform.contentSize.clone().x;
    }

    protected start(): void {
        if (this.Hide)
            this.onHideNode();
    }

    onName(name: string) {
        if (this.Name != null)
            this.Name.string = name;
    }

    onValue(current: number, max: number) {
        if (this.HideDead) {
            if (current > 0)
                this.onShowNode();
            else
                this.onHideNode();
        }
        else if (this.Hide) {
            this.unscheduleAllCallbacks();
            this.onShowNode();
            this.scheduleOnce(() => this.onHideNode(), this.HideDelay);
        }
        if (this.Value != null) {
            if (this.Full)
                this.Value.string = (current * this.Muti).toString() + '/' + (max * this.Muti).toString();
            else
                this.Value.string = (current * this.Muti).toString();
        }
        if (this.Mask != null) {
            if (this.m_maskSprite != null ? this.m_maskSprite.type == Sprite.Type.FILLED : false)
                this.m_maskSprite.fillRange = 1.0 * current / max;
            else {
                let size = this.m_maskTransform.contentSize.clone();
                size.x = this.m_maskTransformX * (1.0 * current / max);
                this.m_maskTransform.contentSize = size;
            }
        }
    }

    onHideNode() {
        this.HideNode.forEach(nodeCheck => {
            nodeCheck.active = false;
        });
    }

    onShowNode() {
        this.HideNode.forEach(nodeCheck => {
            nodeCheck.active = true;
        });
    }
}