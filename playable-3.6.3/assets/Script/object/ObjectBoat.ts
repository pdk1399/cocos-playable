import { _decorator, CCInteger, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, RigidBody2D, v2 } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('ObjectBoat')
export class ObjectBoat extends Component {

    @property({ group: { name: 'Body' }, type: CCInteger })
    SpeedX: number = 40;

    @property({ group: { name: 'Self' }, type: CCInteger })
    TagBody: number = -1;
    @property({ group: { name: 'Self' }, type: CCInteger })
    TagWall: number = 1;
    @property({ group: { name: 'Self' }, type: CCInteger })
    TagActive: number = 0;
    @property({ group: { name: 'Other' }, type: CCInteger })
    TagPlayer: number = 100;

    m_player: Node = null;
    m_moveDirX: number = 0;
    m_lastPosY: number = 0;

    m_colliderBody: Collider2D[] = [];
    m_colliderWall: Collider2D[] = [];
    m_colliderActive: Collider2D[] = [];

    m_rigidBody: RigidBody2D = null;

    protected onLoad(): void {
        this.m_rigidBody = this.getComponent(RigidBody2D);

        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.TagBody:
                    this.m_colliderBody.push(collider);
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    break;
                case this.TagWall:
                    this.m_colliderWall.push(collider);
                    break;
                case this.TagActive:
                    this.m_colliderActive.push(collider);
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    break;
            }
        });

        this.m_colliderWall.forEach(collider => {
            //De-active wall to avoid collide with player
            collider.enabled = false;
        });
    }

    protected start(): void {
        this.m_lastPosY = this.node.worldPosition.clone().y;
    }

    protected lateUpdate(dt: number): void {
        this.m_rigidBody.linearVelocity = v2(this.SpeedX * this.m_moveDirX, this.m_rigidBody.linearVelocity.clone().y);

        // if (this.m_player == null ? false : this.m_player.isValid) {
        //     let offsetY = this.node.worldPosition.clone().y - this.m_lastPosY;
        //     this.m_player.setPosition(this.m_player.position.x, this.m_player.position.y + offsetY, this.m_player.position.z);
        // }

        // this.m_lastPosY = this.node.worldPosition.clone().y;
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagBody:
                switch (otherCollider.tag) {
                    case this.TagPlayer:
                        break;
                }
                break;
            case this.TagActive:
                switch (otherCollider.tag) {
                    case this.TagPlayer:
                        if (this.m_player != null)
                            break;
                        this.m_player = otherCollider.body.node;
                        this.m_player.emit(ConstantBase.NODE_VALUE_LOCK_ROTATE, true);
                        this.m_player.emit(ConstantBase.NODE_VALUE_LOCK_X, true);
                        this.m_player.emit(ConstantBase.NODE_CONTROL_SLEEP);
                        this.m_player.emit(ConstantBase.NODE_CONTROL_DIRECTOR, false);
                        this.m_player.emit(ConstantBase.NODE_CONTROL_NODE, true);
                        this.onEventActive(true);
                        break;
                }
                break;
        }
    }

    //

    onEventActive(state: boolean) {
        if (state) {
            this.onControlByDirector(true);
            this.m_colliderWall.forEach(collider => {
                //Active wall to stop player from moving out of the boat
                collider.enabled = true;
            });
        }
        else {
            this.onControlByDirector(false);
            this.m_colliderWall.forEach(collider => {
                //De-active wall to avoid collide with player
                collider.enabled = false;
            });
        }
    }

    onControlByDirector(state: boolean) {
        if (state) {
            director.on(ConstantBase.CONTROL_LEFT, this.onMoveLeft, this);
            director.on(ConstantBase.CONTROL_RIGHT, this.onMoveRight, this);
            director.on(ConstantBase.CONTROL_RELEASE, this.onMoveRelease, this);
            director.on(ConstantBase.CONTROL_JUMP, this.onJump, this);
        }
        else {
            director.off(ConstantBase.CONTROL_LEFT, this.onMoveLeft, this);
            director.off(ConstantBase.CONTROL_RIGHT, this.onMoveRight, this);
            director.off(ConstantBase.CONTROL_RELEASE, this.onMoveRelease, this);
            director.off(ConstantBase.CONTROL_JUMP, this.onJump, this);
        }
    }

    //

    onMoveLeft() {
        this.m_moveDirX = -1;
    }

    onMoveRight() {
        this.m_moveDirX = 1;
    }

    onMoveRelease() {
        this.m_moveDirX = 0;
    }

    onJump() {
        this.onMoveRelease();
        this.m_player.emit(ConstantBase.CONTROL_JUMP);
        this.m_player.emit(ConstantBase.NODE_VALUE_LOCK_ROTATE, false);
        this.m_player.emit(ConstantBase.NODE_VALUE_LOCK_X, false);
        this.m_player.emit(ConstantBase.NODE_CONTROL_AWAKE);
        this.m_player.emit(ConstantBase.NODE_CONTROL_DIRECTOR, true);
        this.m_player.emit(ConstantBase.NODE_CONTROL_NODE, false);
        this.m_player = null;
        this.onEventActive(false);
    }
}