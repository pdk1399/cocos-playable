import { _decorator, Component, Node, CCFloat, view, screen, Vec3, CCBoolean, Camera, Tween, Vec2, director, tween, v2, v3, Rect, TweenEasing, math } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

export enum OrientationType {
    PORTRAIT,
    LANDSCAPE,
}

class NodeTweener {
    Base: CameraBase = null;
    Value = null;
    Easing: string = 'linear';
}

@ccclass('CameraBase')
export default class CameraBase extends Component {

    static instance: CameraBase;

    //SOLUTION TARGET DEFAULT IS 1920x1080 in ConstantBase.ts script

    @property(Node)
    Target: Node | null = null;

    @property({ group: { name: 'Main' }, type: CCFloat })
    SmoothTime: number = 0.1;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Scale: number = 1;
    @property({ group: { name: 'Main' }, type: Vec2 })
    Offset: Vec2 = v2(0, 0);
    @property({ group: { name: 'Main' }, type: CCBoolean })
    LockX: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    LockY: boolean = false;
    // @property({ group: { name: 'Main' }, type: Node })
    // Background: Node | null = null;

    @property({ group: { name: 'Limit' }, type: CCBoolean })
    Limit: boolean = false;
    @property({ group: { name: 'Limit' }, type: Vec2, visible(this: CameraBase) { return this.Limit; } })
    LimitMax: Vec2 = v2(1000, 1000);
    @property({ group: { name: 'Limit' }, type: Vec2, visible(this: CameraBase) { return this.Limit; } })
    LimitMin: Vec2 = v2(-1000, -1000);

    @property({ group: { name: 'Ortho' }, type: CCBoolean })
    OrthoScreen: boolean = false;
    @property({ group: { name: 'Ortho' }, type: CCFloat, visible(this: CameraBase) { return this.OrthoScreen; } })
    OrthoLandscape: number = 1;
    @property({ group: { name: 'Ortho' }, type: CCFloat, visible(this: CameraBase) { return this.OrthoScreen; } })
    OrthoPortrait: number = 1;

    @property({ group: { name: 'Rect' }, type: CCBoolean })
    RectScreen: boolean = false;
    @property({ group: { name: 'Rect' }, type: CCBoolean, visible(this: CameraBase) { return this.RectScreen; } })
    RectLandScapeFixed: boolean = false;
    @property({ group: { name: 'Rect' }, type: Rect, visible(this: CameraBase) { return this.RectScreen && this.RectLandScapeFixed; } })
    RectLandscape: Rect = new Rect(0, 0, 1, 1);
    @property({ group: { name: 'Rect' }, type: CCBoolean, visible(this: CameraBase) { return this.RectScreen; } })
    RectPortraitFixed: boolean = false;
    @property({ group: { name: 'Rect' }, type: Rect, visible(this: CameraBase) { return this.RectScreen && this.RectPortraitFixed; } })
    RectPortrait: Rect = new Rect(0, 0.25, 1, 0.5);

    m_camera: Camera = null;
    m_orthoHeight: number = 0;
    m_syncY: boolean = false;
    m_target: Vec3;

    m_orientationRectSolution = OrientationType.LANDSCAPE;
    m_orientation = OrientationType.LANDSCAPE;
    m_solution: math.Size;
    m_view: Vec2;
    m_solutionViewed: math.Size;

    m_update: boolean = true;
    m_lock: Vec3;
    m_shake: boolean = false;

    m_tweenShake: Tween<Node> = null;
    m_tweenShakeOnce: Tween<Node> = null;
    m_tweenTarget: NodeTweener = null;
    m_tweenScale: NodeTweener = null;

    //

    protected onLoad() {
        CameraBase.instance = this;

        director.on(ConstantBase.CAMERA_TARGET_SWITCH, this.onTargetSwitch, this);
        director.on(ConstantBase.CAMERA_TARGET_SWITCH, this.onTargetSwitchTween, this);
        director.on(ConstantBase.CAMERA_VALUE_SMOOTH_TIME, this.onValueSmoothTime, this);
        director.on(ConstantBase.CAMERA_VALUE_OFFSET, this.onValueOffset, this);
        director.on(ConstantBase.CAMERA_VALUE_SCALE, this.onValueScale, this);
        director.on(ConstantBase.CAMERA_EFFECT_SHAKE, this.onShake, this);
        director.on(ConstantBase.CAMERA_EFFECT_SHAKE_ONCE, this.onShakeOnce, this);

        director.on(ConstantBase.BODY_X4, this.onShake, this);

        if (this.m_camera == null)
            this.m_camera = this.getComponent(Camera);
        this.m_orthoHeight = this.m_camera.orthoHeight.valueOf();

        if (this.LockX || this.LockY)
            this.m_lock = this.node.worldPosition.clone();

        this.m_orientationRectSolution = ConstantBase.SOLUTION_TARGET.x < ConstantBase.SOLUTION_TARGET.y ? OrientationType.PORTRAIT : OrientationType.LANDSCAPE;
    }

    protected start() {
        //NOTE: This event must add from Start to get event!
        view.on('canvas-resize', () => {
            this.onCanvasResize();
            this.onUpdateBackground();
        });
        this.onCanvasResize();
        this.onUpdateBackground();
        //
        this.m_target = this.node.worldPosition.clone();
    }

    protected lateUpdate(dt: number) {
        if (!this.m_update || this.Target == null)
            return;

        let target = v3();
        target = this.Target.worldPosition.clone();

        //LOCK:
        if (this.LockX)
            target.x = this.m_lock.x;
        if (this.LockY)
            target.y = this.m_lock.y;

        //OFFSET:
        target.x += this.Offset.x;
        target.y += this.Offset.y;

        //LIMIT:
        if (this.Limit) {
            if (!this.LockX) {
                if (target.x > this.LimitMax.x)
                    target.x = this.LimitMax.x;
                else if (target.x < this.LimitMin.x)
                    target.x = this.LimitMin.x;
            }
            if (!this.LockY) {
                if (target.y > this.LimitMax.y)
                    target.y = this.LimitMax.y;
                else if (target.y < this.LimitMin.y)
                    target.y = this.LimitMin.y;
            }
        }

        //FINAL:
        this.m_target = this.m_target.lerp(target, this.SmoothTime);
        this.node.worldPosition = this.m_target;
    }

    //

    protected onCanvasInit() {

        this.onCanvasCurrent();
    }

    protected onCanvasCurrent() {
        this.m_solution = screen.windowSize.clone();
        this.m_view = v2(view.getScaleX(), view.getScaleY());
        this.m_solutionViewed = new math.Size(this.m_solution.width / this.m_view.x, this.m_solution.height / this.m_view.y);
        this.m_orientation = this.m_solutionViewed.width < this.m_solutionViewed.height ? OrientationType.PORTRAIT : OrientationType.LANDSCAPE;
    }

    protected onCanvasResize() {
        this.onCanvasCurrent();
        this.onCameraOrthoHeight();
        this.onCameraRectScreen();
    }

    //

    protected onCameraOrthoHeight() {
        if (!this.OrthoScreen)
            return;
        switch (this.m_orientation) {
            case OrientationType.PORTRAIT:
                this.m_camera.orthoHeight = (this.m_orthoHeight * this.OrthoPortrait) * this.Scale;
                break;
            case OrientationType.LANDSCAPE:
                this.m_camera.orthoHeight = (this.m_orthoHeight * this.OrthoLandscape) * this.Scale;
                break;
        }
    }

    //

    protected onCameraRectScreen() {
        if (!this.RectScreen)
            return;
        let rect = new Rect(0, 0, 1, 1);
        let ratioWidth = 1.0 * ConstantBase.SOLUTION_TARGET.x / this.m_solutionViewed.x;
        if (ratioWidth < 1) {
            rect.x = (1.0 - ratioWidth) / 2;
            rect.width = ratioWidth;
        }
        let ratioHeight = 1.0 * ConstantBase.SOLUTION_TARGET.y / this.m_solutionViewed.y;
        if (ratioHeight < 1) {
            rect.y = (1.0 - ratioHeight) / 2;
            rect.height = ratioHeight;
        }
        switch (this.m_orientation) {
            case OrientationType.PORTRAIT:
                if (!this.RectPortraitFixed)
                    break;
                rect.x = this.RectPortrait.x;
                rect.width = this.RectPortrait.width;
                rect.y = this.RectPortrait.y;
                rect.height = this.RectPortrait.height;
                break;
            case OrientationType.LANDSCAPE:
                if (!this.RectLandScapeFixed)
                    break;
                rect.x = this.RectLandscape.x;
                rect.width = this.RectLandscape.width;
                rect.y = this.RectLandscape.y;
                rect.height = this.RectLandscape.height;
                break;
        }
        this.m_camera.rect = rect;
    }

    //

    protected onUpdateBackground() {
        // if (this.Background == null)
        //     return;
        // let ratio = (540) / this.m_camera.orthoHeight;
        // this.Background.scale = new Vec3(2 / ratio, 2 / ratio, 1);
    }

    //

    onShake(stage: boolean) {
        if (this.m_shake == stage)
            return;
        this.m_shake = stage;
        if (stage) {
            if (this.m_tweenShake != null)
                this.m_tweenShake.start();
            else {
                let rotate1 = tween(this.node).to(0.025, { eulerAngles: v3(0, 0, 0.5) });
                let rotate2 = tween(this.node).to(0.025, { eulerAngles: v3(0, 0, -0.5) });
                this.m_tweenShake = tween(this.node).sequence(rotate1, rotate2).repeatForever().start();
            }
        }
        else if (this.m_tweenShake != null) {
            this.m_tweenShake.stop();
            this.node.setRotationFromEuler(v3(0, 0, 0));
        }
    }

    onShakeOnce() {
        if (this.m_tweenShakeOnce != null)
            this.m_tweenShakeOnce.start();
        else {
            let rotate1 = tween(this.node).to(0.025, { eulerAngles: v3(0, 0, 0.5) });
            let rotate2 = tween(this.node).to(0.025, { eulerAngles: v3(0, 0, -0.5) });
            this.m_tweenShakeOnce = tween(this.node).sequence(rotate1, rotate2).start();
        }
    }

    //

    protected onPlayerBubble() {
        this.m_syncY = true;
    }

    protected onPlayerNormal() {
        this.m_syncY = false;
    }

    //

    onTargetSwitch(Target: Node) {
        if (this.m_tweenTarget != null)
            Tween.stopAllByTarget(this.m_tweenTarget);
        this.Target = Target;
    }

    onTargetSwitchTween(target: Node, duration: number, easing: TweenEasing) {
        if (duration == null || easing == null)
            return;
        if (this.m_tweenTarget != null)
            Tween.stopAllByTarget(this.m_tweenTarget);
        this.Target = target;
        this.m_target = target.worldPosition.clone();
        this.m_update = false;

        if (this.LockX)
            this.m_target.x = this.m_lock.x;
        if (this.LockY)
            this.m_target.y = this.m_lock.y;

        this.m_tweenTarget = new NodeTweener();
        this.m_tweenTarget.Base = this;
        this.m_tweenTarget.Value = this.node.worldPosition;
        tween(this.m_tweenTarget)
            .to(duration, { Value: this.m_target }, {
                easing: easing,
                onUpdate(Info: NodeTweener) {
                    Info.Base.node.worldPosition = Info.Value;
                },
                onComplete(Info: NodeTweener) {
                    Info.Base.m_update = true;
                }
            })
            .start();
    }

    //

    onValueSmoothTime(smoothTime: number) {
        this.SmoothTime = smoothTime;
    }

    onValueOffset(offset: Vec2) {
        this.Offset = offset;
    }

    onValueScale(scale: number, duration: number, easing: TweenEasing) {
        if (this.m_tweenScale != null)
            Tween.stopAllByTarget(this.m_tweenScale);
        this.m_tweenScale = new NodeTweener();
        this.m_tweenScale.Base = this;
        this.m_tweenScale.Value = this.Scale;
        tween(this.m_tweenScale)
            .to(duration, { Value: scale }, {
                easing: easing,
                onUpdate(Info: NodeTweener) {
                    Info.Base.Scale = Info.Value;
                    Info.Base.onCameraOrthoHeight();
                    Info.Base.onUpdateBackground();
                },
            })
            .start();
    }
}
